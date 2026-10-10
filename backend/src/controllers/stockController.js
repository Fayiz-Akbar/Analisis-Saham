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
 * Mengambil Quote Harga Saham Terkini
 * GET /api/stocks/:symbol/quote
 */
export const getStockQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    const cleanSymbol = symbol.toUpperCase().replace(".JK", "");

    // Cek master emiten di database
    const stock = await prisma.stock.findUnique({
      where: { symbol: cleanSymbol },
    });

    // Ambil quote harga terkini via MarketDataService
    const marketData = await MarketDataService.fetchYahooChart(cleanSymbol, "5d", "1d");

    const responsePayload = {
      stock: stock || { symbol: cleanSymbol, companyName: cleanSymbol, sector: "Unknown", exchange: "IDX" },
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
      stock,
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
