import prisma from "../lib/prisma.js";
import { MarketDataService } from "../services/marketDataService.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Pencarian Saham Berdasarkan Ticker atau Nama Perusahaan
 * GET /api/stocks/search?q=...
 */
export const searchStocks = async (req, res) => {
  try {
    const query = req.query.q?.trim() || "";

    if (!query) {
      // Jika query kosong, kembalikan 10 saham teratas IDX80
      const defaultStocks = await prisma.stock.findMany({
        where: { isIdx80: true },
        take: 10,
        orderBy: { symbol: "asc" },
      });
      return sendSuccess(res, 200, "Daftar saham default", defaultStocks);
    }

    const stocks = await prisma.stock.findMany({
      where: {
        OR: [
          { symbol: { contains: query, mode: "insensitive" } },
          { companyName: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
      orderBy: { symbol: "asc" },
    });

    return sendSuccess(res, 200, `Ditemukan ${stocks.length} saham`, stocks);
  } catch (error) {
    console.error("Search Stocks Error:", error);
    return sendError(res, 500, "Gagal melakukan pencarian saham.");
  }
};

/**
 * Mengambil Daftar Saham (Katalog IDX80)
 * GET /api/stocks
 */
export const getAllStocks = async (req, res) => {
  try {
    const { sector, limit = 80, isIdx80 } = req.query;

    const where = {};
    if (sector) where.sector = sector;
    if (isIdx80 !== undefined) where.isIdx80 = isIdx80 === "true";

    const stocks = await prisma.stock.findMany({
      where,
      take: Number(limit),
      orderBy: { symbol: "asc" },
      include: {
        dailyPrice: true,
        fundamentals: true,
      },
    });

    // Format BigInt volume to String/Number for JSON serialization
    const sanitizedStocks = stocks.map((s) => ({
      ...s,
      dailyPrice: s.dailyPrice
        ? {
            ...s.dailyPrice,
            volume: s.dailyPrice.volume ? s.dailyPrice.volume.toString() : null,
          }
        : null,
    }));

    return sendSuccess(res, 200, "Katalog saham berhasil diambil", sanitizedStocks);
  } catch (error) {
    console.error("Get All Stocks Error:", error);
    return sendError(res, 500, "Gagal memuat katalog saham.");
  }
};

/**
 * Helper untuk sanitasi nilai Decimal fundamental ke tipe Number
 */
export const sanitizeFundamental = (f) => {
  if (!f) return null;
  return {
    ...f,
    marketCap: f.marketCap !== null && f.marketCap !== undefined ? Number(f.marketCap) : null,
    peRatio: f.peRatio !== null && f.peRatio !== undefined ? Number(f.peRatio) : null,
    pbvRatio: f.pbvRatio !== null && f.pbvRatio !== undefined ? Number(f.pbvRatio) : null,
    roe: f.roe !== null && f.roe !== undefined ? Number(f.roe) : null,
    roa: f.roa !== null && f.roa !== undefined ? Number(f.roa) : null,
    der: f.der !== null && f.der !== undefined ? Number(f.der) : null,
    netProfitMargin: f.netProfitMargin !== null && f.netProfitMargin !== undefined ? Number(f.netProfitMargin) : null,
    eps: f.eps !== null && f.eps !== undefined ? Number(f.eps) : null,
    dividendYield: f.dividendYield !== null && f.dividendYield !== undefined ? Number(f.dividendYield) : null,
    revenue: f.revenue !== null && f.revenue !== undefined ? Number(f.revenue) : null,
    netIncome: f.netIncome !== null && f.netIncome !== undefined ? Number(f.netIncome) : null,
    totalAssets: f.totalAssets !== null && f.totalAssets !== undefined ? Number(f.totalAssets) : null,
    totalEquity: f.totalEquity !== null && f.totalEquity !== undefined ? Number(f.totalEquity) : null,
    totalLiabilities: f.totalLiabilities !== null && f.totalLiabilities !== undefined ? Number(f.totalLiabilities) : null,
    cashEquivalents: f.cashEquivalents !== null && f.cashEquivalents !== undefined ? Number(f.cashEquivalents) : null,
    revenueGrowth: f.revenueGrowth !== null && f.revenueGrowth !== undefined ? Number(f.revenueGrowth) : null,
    netIncomeGrowth: f.netIncomeGrowth !== null && f.netIncomeGrowth !== undefined ? Number(f.netIncomeGrowth) : null,
    financialPeriod: f.financialPeriod || "FY2024 Audit (Konsolidasian)",
  };
};

/**
 * Mengambil Quote Harga Saham Terkini
 * GET /api/stocks/:symbol/quote
 */
export const getStockQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    const cleanSymbol = symbol.toUpperCase().replace(".JK", "");

    // Cek master emiten di database beserta data fundamental
    const stock = await prisma.stock.findUnique({
      where: { symbol: cleanSymbol },
      include: {
        fundamentals: true,
      },
    });

    // Ambil quote harga terkini via MarketDataService
    const marketData = await MarketDataService.fetchYahooChart(cleanSymbol, "5d", "1d");

    const sanitizedStock = stock
      ? {
          ...stock,
          fundamentals: sanitizeFundamental(stock.fundamentals),
        }
      : {
          symbol: cleanSymbol,
          companyName: cleanSymbol,
          sector: "Financials",
          industry: "General",
          exchange: "IDX",
          fundamentals: null,
        };

    const responsePayload = {
      stock: sanitizedStock,
      quote: {
        symbol: cleanSymbol,
        regularMarketPrice: marketData.regularMarketPrice,
        chartPreviousClose: marketData.chartPreviousClose,
        changeAmount: marketData.changeAmount,
        changePercent: marketData.changePercent,
        regularMarketDayHigh: marketData.regularMarketDayHigh,
        regularMarketDayLow: marketData.regularMarketDayLow,
        regularMarketVolume: marketData.regularMarketVolume,
        fiftyTwoWeekHigh: marketData.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: marketData.fiftyTwoWeekLow,
        currency: marketData.currency,
        lastUpdated: marketData.lastUpdated,
      },
      fromCache: marketData.fromCache,
    };

    return sendSuccess(res, 200, `Quote harga ${cleanSymbol} berhasil diambil`, responsePayload);
  } catch (error) {
    console.error(`Get Quote Error (${req.params.symbol}):`, error);
    return sendError(res, 500, `Gagal memuat data harga saham ${req.params.symbol}.`);
  }
};

/**
 * Mengambil Data Riwayat Candlestick OHLCV untuk TradingView Charts
 * GET /api/stocks/:symbol/history?range=1y&interval=1d
 */
export const getStockHistory = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { range = "1y", interval } = req.query;
    const cleanSymbol = symbol.toUpperCase().replace(".JK", "");

    const marketData = await MarketDataService.fetchYahooChart(cleanSymbol, range, interval);

    return sendSuccess(res, 200, `Data candlestick ${cleanSymbol} berhasil dimuat`, {
      symbol: cleanSymbol,
      range,
      interval,
      totalCandles: marketData.candles.length,
      candles: marketData.candles,
      fromCache: marketData.fromCache,
    });
  } catch (error) {
    console.error(`Get History Error (${req.params.symbol}):`, error);
    return sendError(res, 500, `Gagal memuat data grafik candlestick ${req.params.symbol}.`);
  }
};

/**
 * Mengambil Rasio 4 Pilar & Laporan Keuangan Fundamental Saham
 * GET /api/stocks/:symbol/fundamentals
 */
export const getStockFundamentals = async (req, res) => {
  try {
    const { symbol } = req.params;
    const cleanSymbol = symbol.toUpperCase().replace(".JK", "");

    const stock = await prisma.stock.findUnique({
      where: { symbol: cleanSymbol },
      include: {
        fundamentals: true,
      },
    });

    if (!stock) {
      return sendError(res, 404, `Emiten dengan simbol ${cleanSymbol} tidak ditemukan.`);
    }

    return sendSuccess(res, 200, `Data fundamental ${cleanSymbol} berhasil dimuat`, {
      symbol: cleanSymbol,
      companyName: stock.companyName,
      sector: stock.sector,
      industry: stock.industry,
      fundamentals: sanitizeFundamental(stock.fundamentals),
    });
  } catch (error) {
    console.error(`Get Stock Fundamentals Error (${req.params.symbol}):`, error);
    return sendError(res, 500, `Gagal memuat fundamental emiten ${req.params.symbol}.`);
  }
};

/**
 * Mengambil Detail Komprehensif Saham
 * GET /api/stocks/:symbol
 */
export const getStockDetail = async (req, res) => {
  try {
    const { symbol } = req.params;
    const cleanSymbol = symbol.toUpperCase().replace(".JK", "");

    const stock = await prisma.stock.findUnique({
      where: { symbol: cleanSymbol },
      include: {
        fundamentals: true,
      },
    });

    if (!stock) {
      return sendError(res, 404, `Emiten dengan simbol ${cleanSymbol} tidak ditemukan.`);
    }

    // Ambil data harga dan ringkasan chart
    const marketData = await MarketDataService.fetchYahooChart(cleanSymbol, "1mo", "1d");

    return sendSuccess(res, 200, `Detail saham ${cleanSymbol} berhasil dimuat`, {
      stock: {
        ...stock,
        fundamentals: sanitizeFundamental(stock.fundamentals),
      },
      currentPrice: marketData.regularMarketPrice,
      changePercent: marketData.changePercent,
      changeAmount: marketData.changeAmount,
      marketDataMeta: {
        dayHigh: marketData.regularMarketDayHigh,
        dayLow: marketData.regularMarketDayLow,
        fiftyTwoWeekHigh: marketData.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: marketData.fiftyTwoWeekLow,
      },
      recentCandles: marketData.candles.slice(-10),
      fromCache: marketData.fromCache,
    });
  } catch (error) {
    console.error(`Get Stock Detail Error (${req.params.symbol}):`, error);
    return sendError(res, 500, `Gagal memuat detail emiten ${req.params.symbol}.`);
  }
};

/**
 * Mengambil Ticker Tape Ringkasan Saham Terpopuler dengan Sparkline
 * GET /api/stocks/ticker-tape
 */
export const getTickerTape = async (req, res) => {
  try {
    const data = await MarketDataService.getTickerTape();
    return sendSuccess(res, 200, "Market Ticker Tape berhasil dimuat", data);
  } catch (error) {
    console.error("Get Ticker Tape Error:", error);
    return sendError(res, 500, "Gagal memuat data ticker tape.");
  }
};

/**
 * Mengambil Ringkasan Pasar / Indeks Saham (IHSG, LQ45)
 * GET /api/stocks/market-overview?period=1d&symbol=^JKSE
 */
export const getMarketOverview = async (req, res) => {
  try {
    const period = req.query.period || "1d";
    const symbol = req.query.symbol || "IDX80";
    const data = await MarketDataService.getMarketOverview(period, symbol);
    return sendSuccess(res, 200, "Market Overview berhasil dimuat", data);
  } catch (error) {
    console.error("Get Market Overview Error:", error);
    return sendError(res, 500, "Gagal memuat ringkasan pasar.");
  }
};

