import prisma from "../lib/prisma.js";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const CACHE_TTL_MINUTES = 15; // 15 Menit TTL Cache

/**
 * Normalisasi simbol saham ke ticker Yahoo Finance BEI (${symbol}.JK)
 */
export const toYahooTicker = (symbol) => {
  const clean = symbol.trim().toUpperCase();
  if (clean.includes(".")) return clean;
  return `${clean}.JK`;
};

/**
 * Service untuk penarikan data pasar modal Yahoo Finance dengan caching PostgreSQL JSONB
 */
export class MarketDataService {
  /**
   * Mengambil data chart OHLCV & quote terkini dari Yahoo Finance
   */
  static async fetchYahooChart(symbol, range = "1y", interval = "1d") {
    const ticker = toYahooTicker(symbol);
    const endpointKey = `chart_${ticker}_${range}_${interval}`;

    // 1. Cek Caching di Database (api_cache)
    const cached = await prisma.apiCache.findUnique({
      where: { endpointKey },
    });

    if (cached && new Date(cached.expiresAt) > new Date()) {
      return {
        ...cached.responseData,
        fromCache: true,
        cachedAt: cached.fetchedAt,
      };
    }

    // 2. Fetch ke Yahoo Finance API query2
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${interval}&range=${range}`;
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data pasar Yahoo Finance (${response.status}: ${response.statusText})`);
    }

    const json = await response.json();
    const result = json?.chart?.result?.[0];

    if (!result) {
      throw new Error(`Data pasar tidak ditemukan untuk ticker ${symbol}`);
    }

    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};

    // Format Candlestick deret waktu untuk TradingView Lightweight Charts
    const candles = timestamps
      .map((ts, index) => {
        const dateStr = new Date(ts * 1000).toISOString().split("T")[0];
        const open = quote.open?.[index];
        const high = quote.high?.[index];
        const low = quote.low?.[index];
        const close = quote.close?.[index];
        const volume = quote.volume?.[index] || 0;

        if (open == null || close == null) return null;

        return {
          time: dateStr,
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume: Number(volume),
        };
      })
      .filter(Boolean);

    // Hitung perubahan harga
    const currentPrice = meta.regularMarketPrice || candles[candles.length - 1]?.close || 0;
    const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
    const changeAmount = Number((currentPrice - previousClose).toFixed(2));
    const changePercent = previousClose ? Number(((changeAmount / previousClose) * 100).toFixed(2)) : 0;

    const formattedData = {
      symbol: symbol.toUpperCase(),
      ticker,
      currency: meta.currency || "IDR",
      exchangeName: meta.exchangeName || "JKT",
      regularMarketPrice: currentPrice,
      chartPreviousClose: previousClose,
      changeAmount,
      changePercent,
      regularMarketDayHigh: meta.regularMarketDayHigh || null,
      regularMarketDayLow: meta.regularMarketDayLow || null,
      regularMarketVolume: meta.regularMarketVolume || null,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || null,
      candles,
      lastUpdated: new Date().toISOString(),
    };

    // 3. Simpan / Perbarui Cache di PostgreSQL
    const expiresAt = new Date(Date.now() + CACHE_TTL_MINUTES * 60 * 1000);

    await prisma.apiCache.upsert({
      where: { endpointKey },
      update: {
        responseData: formattedData,
        fetchedAt: new Date(),
        expiresAt,
      },
      create: {
        provider: "yahoo_finance",
        endpointKey,
        responseData: formattedData,
        expiresAt,
      },
    });

    // 4. Update tabel stock_daily_prices secara sinkron
    try {
      const cleanSymbol = symbol.toUpperCase().replace(".JK", "");
      const stockExists = await prisma.stock.findUnique({ where: { symbol: cleanSymbol } });
      if (stockExists) {
        await prisma.stockDailyPrice.upsert({
          where: { symbol: cleanSymbol },
          update: {
            closePrice: currentPrice,
            changeAmount,
            changePercent,
            openPrice: candles[candles.length - 1]?.open || currentPrice,
            highPrice: meta.regularMarketDayHigh || currentPrice,
            lowPrice: meta.regularMarketDayLow || currentPrice,
            volume: BigInt(meta.regularMarketVolume || 0),
            lastUpdated: new Date(),
          },
          create: {
            symbol: cleanSymbol,
            closePrice: currentPrice,
            changeAmount,
            changePercent,
            openPrice: candles[candles.length - 1]?.open || currentPrice,
            highPrice: meta.regularMarketDayHigh || currentPrice,
            lowPrice: meta.regularMarketDayLow || currentPrice,
            volume: BigInt(meta.regularMarketVolume || 0),
            lastUpdated: new Date(),
          },
        });
      }
    } catch (dbErr) {
      console.warn("Peringatan: Gagal memperbarui stock_daily_prices:", dbErr.message);
    }

    return {
      ...formattedData,
      fromCache: false,
    };
  }
}

export default MarketDataService;
