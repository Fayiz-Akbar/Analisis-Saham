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
  static async fetchYahooChart(symbol, range = "1y", interval) {
    const ticker = toYahooTicker(symbol);

    // Otomatis tentukan interval optimal jika tidak dispesifikasikan
    let queryRange = "max";
    let queryInterval = "1d";
    let aggregateFactor = 1;
    let multiMonthMode = null;

    // Menentukan resolusi batang lilin (1 lilin = interval yang dipilih)
    if (range === "1h" || interval === "1h") {
      queryInterval = "1h";
      queryRange = "2y";
    } else if (range === "2h" || interval === "2h") {
      queryInterval = "1h";
      queryRange = "2y";
      aggregateFactor = 2;
    } else if (range === "3h" || interval === "3h") {
      queryInterval = "1h";
      queryRange = "2y";
      aggregateFactor = 3;
    } else if (range === "4h" || interval === "4h") {
      queryInterval = "4h";
      queryRange = "2y";
    } else if (range === "1d" || interval === "1d") {
      queryInterval = "1d";
      queryRange = "max";
    } else if (range === "1w" || range === "1wk" || interval === "1w" || interval === "1wk") {
      queryInterval = "1wk";
      queryRange = "max";
    } else if (range === "1mo" || interval === "1mo") {
      queryInterval = "1mo";
      queryRange = "max";
    } else if (range === "3mo" || interval === "3mo") {
      queryInterval = "1mo";
      queryRange = "max";
      multiMonthMode = "3mo"; // 1 lilin = 3 bulan (Kuartalan)
    } else if (range === "6mo" || interval === "6mo") {
      queryInterval = "1mo";
      queryRange = "max";
      multiMonthMode = "6mo"; // 1 lilin = 6 bulan (Semesteran)
    } else if (range === "1y" || range === "12m" || interval === "1y" || interval === "12m") {
      queryInterval = "1mo";
      queryRange = "max";
      multiMonthMode = "1y"; // 1 lilin = 1 TAHUN PENUH (12M - Tahunan)
    }

    const endpointKey = `chart_${ticker}_${range}_${interval || queryInterval}`;

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
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${queryInterval}&range=${queryRange}`;
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
    const rawCandles = [];
    let lastTime = null;

    for (let index = 0; index < timestamps.length; index++) {
      const ts = timestamps[index];
      const open = quote.open?.[index];
      const high = quote.high?.[index];
      const low = quote.low?.[index];
      const close = quote.close?.[index];
      const volume = quote.volume?.[index] || 0;

      if (open == null || close == null || high == null || low == null) continue;

      if (lastTime !== null && ts <= lastTime) continue;
      lastTime = ts;

      rawCandles.push({
        time: ts,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Number(volume),
      });
    }

    // Akumulasi bar jika diperlukan
    let candles = rawCandles;
    if (aggregateFactor > 1) {
      // Agregasi jam (2 Jam / 3 Jam)
      candles = [];
      for (let i = 0; i < rawCandles.length; i += aggregateFactor) {
        const chunk = rawCandles.slice(i, i + aggregateFactor);
        if (chunk.length === 0) continue;
        candles.push({
          time: chunk[0].time,
          open: chunk[0].open,
          high: Math.max(...chunk.map((c) => c.high)),
          low: Math.min(...chunk.map((c) => c.low)),
          close: chunk[chunk.length - 1].close,
          volume: chunk.reduce((sum, c) => sum + (c.volume || 0), 0),
        });
      }
    } else if (multiMonthMode) {
      // Agregasi multi-bulan (3 Bulan, 6 Bulan, dan 1 Tahun per batang lilin)
      const groups = {};
      for (const c of rawCandles) {
        const d = new Date(c.time * 1000);
        let key;
        if (multiMonthMode === "3mo") {
          key = `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3)}`;
        } else if (multiMonthMode === "6mo") {
          key = `${d.getFullYear()}-S${d.getMonth() < 6 ? 1 : 2}`;
        } else if (multiMonthMode === "1y") {
          key = `${d.getFullYear()}`;
        }
        if (!groups[key]) groups[key] = [];
        groups[key].push(c);
      }
      candles = Object.values(groups).map((list) => ({
        time: list[0].time,
        open: list[0].open,
        high: Math.max(...list.map((c) => c.high)),
        low: Math.min(...list.map((c) => c.low)),
        close: list[list.length - 1].close,
        volume: list.reduce((sum, c) => sum + (c.volume || 0), 0),
      }));
    }

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
