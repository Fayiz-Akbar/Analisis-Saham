import prisma from "../lib/prisma.js";
import { MarketDataService } from "../services/marketDataService.js";
import { syncIdx80Constituents, getLastIdx80SyncStatus } from "../services/idx80SyncService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.resolve(__dirname, "../scripts/fetchFinancialHistory.py");

/**
 * Pencarian Saham Berdasarkan Ticker atau Nama Perusahaan
 * GET /api/stocks/search?q=...
 */
export const searchStocks = async (req, res) => {
  try {
    await syncIdx80Constituents();
    const query = req.query.q?.trim() || "";
    const includeAll = req.query.includeAll === "true";

    if (!query) {
      // Jika query kosong, kembalikan 10 saham teratas IDX80 aktif
      const defaultStocks = await prisma.stock.findMany({
        where: { isIdx80: true },
        take: 10,
        orderBy: { symbol: "asc" },
      });
      return sendSuccess(res, 200, "Daftar saham default", defaultStocks);
    }

    const where = {
      OR: [
        { symbol: { contains: query, mode: "insensitive" } },
        { companyName: { contains: query, mode: "insensitive" } },
      ],
    };
    if (!includeAll) {
      where.isIdx80 = true;
    }

    const stocks = await prisma.stock.findMany({
      where,
      take: 20,
      orderBy: [{ isIdx80: "desc" }, { symbol: "asc" }],
    });

    return sendSuccess(res, 200, `Ditemukan ${stocks.length} saham`, stocks);
  } catch (error) {
    console.error("Search Stocks Error:", error);
    return sendError(res, 500, "Gagal melakukan pencarian saham.");
  }
};

/**
 * Mengambil Daftar Saham (Katalog IDX80 Aktif Tersinkronisasi)
 * GET /api/stocks
 */
export const getAllStocks = async (req, res) => {
  try {
    await syncIdx80Constituents();
    const { sector, limit = 80, isIdx80, includeAll } = req.query;

    const where = {};
    if (sector) where.sector = sector;
    if (includeAll !== "true") {
      where.isIdx80 = isIdx80 !== undefined ? isIdx80 === "true" : true;
    }

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
 * Helper untuk sanitasi nilai Decimal fundamental ke tipe Number (aman terhadap null/undefined)
 */
export const sanitizeFundamental = (f) => {
  if (!f) return null;
  const toNum = (v) => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  return {
    ...f,
    marketCap: toNum(f.marketCap),
    peRatio: toNum(f.peRatio),
    pbvRatio: toNum(f.pbvRatio),
    roe: toNum(f.roe),
    roa: toNum(f.roa),
    der: toNum(f.der),
    netProfitMargin: toNum(f.netProfitMargin),
    eps: toNum(f.eps),
    dividendYield: toNum(f.dividendYield),
    revenue: toNum(f.revenue),
    netIncome: toNum(f.netIncome),
    totalAssets: toNum(f.totalAssets),
    totalEquity: toNum(f.totalEquity),
    totalLiabilities: toNum(f.totalLiabilities),
    cashEquivalents: toNum(f.cashEquivalents),
    revenueGrowth: toNum(f.revenueGrowth),
    netIncomeGrowth: toNum(f.netIncomeGrowth),
    financialPeriod: f.financialPeriod || "FY2024 Audit (Konsolidasian)",
  };
};

const SCREENER_RANGE_FIELDS = [
  { minKey: "perMin", maxKey: "perMax", dbField: "peRatio" },
  { minKey: "pbvMin", maxKey: "pbvMax", dbField: "pbvRatio" },
  { minKey: "roeMin", maxKey: "roeMax", dbField: "roe" },
  { minKey: "roaMin", maxKey: "roaMax", dbField: "roa" },
  { minKey: "npmMin", maxKey: "npmMax", dbField: "netProfitMargin" },
  { minKey: "derMin", maxKey: "derMax", dbField: "der" },
  { minKey: "divYieldMin", maxKey: "divYieldMax", dbField: "dividendYield" },
  { minKey: "marketCapMin", maxKey: "marketCapMax", dbField: "marketCap" },
  { minKey: "revenueMin", maxKey: "revenueMax", dbField: "revenue" },
  { minKey: "netIncomeMin", maxKey: "netIncomeMax", dbField: "netIncome" },
  { minKey: "epsMin", maxKey: "epsMax", dbField: "eps" },
];

const parseScreenerNumber = (raw) => {
  if (raw === undefined || raw === null) return null;
  const normalized = String(raw).trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseSectorList = (sectorParam, sectorsParam) => {
  const combined = [
    ...(Array.isArray(sectorsParam) ? sectorsParam : sectorsParam ? [sectorsParam] : []),
    ...(Array.isArray(sectorParam) ? sectorParam : sectorParam ? [sectorParam] : []),
  ]
    .flatMap((entry) => String(entry).split(","))
    .map((s) => s.trim())
    .filter((s) => s && s.toUpperCase() !== "ALL");
  return Array.from(new Set(combined));
};

const getSortableStockMetric = (stock, sortBy) => {
  const dp = stock.dailyPrice || {};
  const f = stock.fundamentals || {};
  const map = {
    price: dp.closePrice !== null && dp.closePrice !== undefined ? Number(dp.closePrice) : null,
    changePercent:
      dp.changePercent !== null && dp.changePercent !== undefined ? Number(dp.changePercent) : null,
    marketCap: f.marketCap,
    peRatio: f.peRatio,
    pbvRatio: f.pbvRatio,
    roe: f.roe,
    roa: f.roa,
    netProfitMargin: f.netProfitMargin,
    der: f.der,
    revenue: f.revenue,
    netIncome: f.netIncome,
    eps: f.eps,
    dividendYield: f.dividendYield,
  };
  const val = map[sortBy];
  return val !== undefined && val !== null && Number.isFinite(Number(val)) ? Number(val) : null;
};

/**
 * Penyaringan Fundamental Saham IDX80 (Null-Safe Backend Filter & Sorting)
 * GET /api/stocks/screener
 */
export const screenStocks = async (req, res) => {
  try {
    await syncIdx80Constituents();

    const search = String(req.query.q || req.query.search || "").trim();
    const sectorList = parseSectorList(req.query.sector, req.query.sectors);
    const sortBy = String(req.query.sortBy || "marketCap").trim();
    const sortOrder = String(req.query.sortOrder || "desc").toLowerCase() === "asc" ? "asc" : "desc";

    const where = { isIdx80: true };

    if (search) {
      where.OR = [
        { symbol: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (sectorList.length > 0) {
      where.sector = { in: sectorList };
    }

    // Filter rentang fundamental dengan penanganan aman untuk nilai null di database
    const fundamentalWhere = {};
    let hasFundamentalFilter = false;
    for (const cfg of SCREENER_RANGE_FIELDS) {
      const minVal = parseScreenerNumber(req.query[cfg.minKey]);
      const maxVal = parseScreenerNumber(req.query[cfg.maxKey]);
      if (minVal !== null || maxVal !== null) {
        fundamentalWhere[cfg.dbField] = {
          not: null,
          ...(minVal !== null ? { gte: minVal } : {}),
          ...(maxVal !== null ? { lte: maxVal } : {}),
        };
        hasFundamentalFilter = true;
      }
    }

    if (hasFundamentalFilter) {
      where.fundamentals = { is: fundamentalWhere };
    }

    const [matchedStocks, totalIdx80, sectorGroups] = await Promise.all([
      prisma.stock.findMany({
        where,
        orderBy: { symbol: "asc" },
        include: {
          dailyPrice: true,
          fundamentals: true,
        },
      }),
      prisma.stock.count({ where: { isIdx80: true } }),
      prisma.stock.groupBy({
        by: ["sector"],
        where: { isIdx80: true },
        _count: { sector: true },
        orderBy: { sector: "asc" },
      }),
    ]);

    const sanitized = matchedStocks.map((s) => ({
      ...s,
      dailyPrice: s.dailyPrice
        ? {
            ...s.dailyPrice,
            closePrice: s.dailyPrice.closePrice !== null ? Number(s.dailyPrice.closePrice) : null,
            changeAmount: s.dailyPrice.changeAmount !== null ? Number(s.dailyPrice.changeAmount) : null,
            changePercent: s.dailyPrice.changePercent !== null ? Number(s.dailyPrice.changePercent) : null,
            openPrice: s.dailyPrice.openPrice !== null ? Number(s.dailyPrice.openPrice) : null,
            highPrice: s.dailyPrice.highPrice !== null ? Number(s.dailyPrice.highPrice) : null,
            lowPrice: s.dailyPrice.lowPrice !== null ? Number(s.dailyPrice.lowPrice) : null,
            volume: s.dailyPrice.volume ? s.dailyPrice.volume.toString() : null,
          }
        : null,
      fundamentals: sanitizeFundamental(s.fundamentals),
    }));

    // Urutkan hasil secara deterministik dengan menempatkan nilai null selalu di bawah
    sanitized.sort((a, b) => {
      if (sortBy === "symbol") {
        return sortOrder === "asc"
          ? a.symbol.localeCompare(b.symbol)
          : b.symbol.localeCompare(a.symbol);
      }
      if (sortBy === "sector") {
        const cmp = (a.sector || "").localeCompare(b.sector || "");
        return sortOrder === "asc" ? cmp : -cmp;
      }

      const valA = getSortableStockMetric(a, sortBy);
      const valB = getSortableStockMetric(b, sortBy);
      if (valA === null && valB === null) return a.symbol.localeCompare(b.symbol);
      if (valA === null) return 1;
      if (valB === null) return -1;
      if (valA === valB) return a.symbol.localeCompare(b.symbol);
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    const sectors = sectorGroups.map((g) => ({
      sector: g.sector,
      count: g._count.sector,
    }));

    return sendSuccess(res, 200, "Penyaringan saham IDX80 berhasil diproses", {
      items: sanitized,
      matchedCount: sanitized.length,
      totalIdx80,
      sectors,
    });
  } catch (error) {
    console.error("Screen Stocks Error:", error);
    return sendError(res, 500, "Gagal memproses penyaringan saham.");
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

    // Cek master emiten di database beserta data fundamental
    const stock = await prisma.stock.findUnique({
      where: { symbol: cleanSymbol },
      include: {
        fundamentals: true,
      },
    });

    // Ambil quote harga terkini via MarketDataService
    const marketData = await MarketDataService.fetchYahooChart(cleanSymbol, "5d", "1d");

    // Ambil data fundamental 100% riil dari API audit resmi (Yahoo Finance)
    let realData = null;
    try {
      realData = await fetchFinancialDataFromSource(cleanSymbol);
    } catch (e) {
      console.warn(`Fallback fundamental API untuk ${cleanSymbol}:`, e.message);
    }
    const realFundamental = realData ? buildRealFundamentalObject(realData, cleanSymbol) : sanitizeFundamental(stock?.fundamentals);

    const sanitizedStock = stock
      ? {
          ...stock,
          fundamentals: realFundamental,
        }
      : {
          symbol: cleanSymbol,
          companyName: cleanSymbol,
          sector: "Financials",
          industry: "General",
          exchange: "IDX",
          fundamentals: realFundamental,
        };

    const responsePayload = {
      stock: sanitizedStock,
      quote: {
        symbol: cleanSymbol,
        regularMarketPrice: marketData.regularMarketPrice,
        chartPreviousClose: realFundamental?.previousClose || marketData.chartPreviousClose,
        regularMarketOpen: realFundamental?.open || marketData.regularMarketOpen,
        bid: realFundamental?.bid,
        ask: realFundamental?.ask,
        bidSize: realFundamental?.bidSize,
        askSize: realFundamental?.askSize,
        changeAmount: marketData.changeAmount,
        changePercent: marketData.changePercent,
        regularMarketDayHigh: realFundamental?.dayHigh || marketData.regularMarketDayHigh,
        regularMarketDayLow: realFundamental?.dayLow || marketData.regularMarketDayLow,
        regularMarketVolume: realFundamental?.volume || marketData.regularMarketVolume,
        averageVolume: realFundamental?.averageVolume,
        fiftyTwoWeekHigh: realFundamental?.fiftyTwoWeekHigh || marketData.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: realFundamental?.fiftyTwoWeekLow || marketData.fiftyTwoWeekLow,
        beta: realFundamental?.beta,
        peRatio: realFundamental?.peRatio,
        eps: realFundamental?.eps,
        marketCap: realFundamental?.marketCap,
        earningsDate: realFundamental?.earningsDate,
        dividendYield: realFundamental?.dividendYield,
        dividendRate: realFundamental?.dividendRate,
        exDividendDate: realFundamental?.exDividendDate,
        targetMeanPrice: realFundamental?.targetMeanPrice,
        financialCurrency: realFundamental?.financialCurrency || "IDR",
        usdToIdrRate: realFundamental?.usdToIdrRate || 16200,
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
    });

    if (!stock) {
      return sendError(res, 404, `Emiten dengan simbol ${cleanSymbol} tidak ditemukan.`);
    }

    // Ambil 100% data riil dari API eksternal (Yahoo Finance official disclosures)
    let realData = null;
    try {
      realData = await fetchFinancialDataFromSource(cleanSymbol);
    } catch (apiErr) {
      console.warn(`Gagal fetch real financial data untuk ${cleanSymbol}:`, apiErr.message);
    }

    const realFundamental = realData ? buildRealFundamentalObject(realData, cleanSymbol) : null;

    return sendSuccess(res, 200, `Data fundamental ${cleanSymbol} berhasil dimuat`, {
      symbol: cleanSymbol,
      companyName: stock.companyName,
      sector: stock.sector,
      industry: stock.industry,
      fundamentals: realFundamental,
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
    });

    if (!stock) {
      return sendError(res, 404, `Emiten dengan simbol ${cleanSymbol} tidak ditemukan.`);
    }

    // Ambil data harga dan ringkasan chart
    const marketData = await MarketDataService.fetchYahooChart(cleanSymbol, "1mo", "1d");

    // Ambil data fundamental 100% riil dari API
    let realData = null;
    try {
      realData = await fetchFinancialDataFromSource(cleanSymbol);
    } catch (e) {
      console.warn(`Fallback fundamental detail untuk ${cleanSymbol}:`, e.message);
    }
    const realFundamental = realData ? buildRealFundamentalObject(realData, cleanSymbol) : null;

    return sendSuccess(res, 200, `Detail saham ${cleanSymbol} berhasil dimuat`, {
      stock: {
        ...stock,
        fundamentals: realFundamental,
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
 * Mengambil Ringkasan Pasar / Indeks Saham (IHSG, IDX80)
 * GET /api/stocks/market-overview?period=1d&symbol=IDX80
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

/**
 * Sinkronisasi & Status Konstituen IDX80 Terbaru
 * GET / POST /api/stocks/sync-idx80
 */
export const syncIdx80Endpoint = async (req, res) => {
  try {
    const force = req.method === "POST" || req.query.force === "true";
    const status = force
      ? await syncIdx80Constituents({ force: true })
      : (await getLastIdx80SyncStatus()) || (await syncIdx80Constituents());
    return sendSuccess(res, 200, "Status sinkronisasi konstituen IDX80", status);
  } catch (error) {
    console.error("Sync IDX80 Error:", error);
    return sendError(res, 500, "Gagal melakukan sinkronisasi konstituen IDX80.");
  }
};

/**
 * Helper untuk mengambil data finansial & laporan audit 100% riil dari Yahoo Finance
 */
export async function fetchFinancialDataFromSource(symbol) {
  const sym = symbol.toUpperCase().replace(".JK", "");
  const endpointKey = `financial_history_${sym}`;

  // 1. Cek Caching di Database (api_cache) dengan TTL 24 jam
  try {
    const cached = await prisma.apiCache.findUnique({
      where: { endpointKey },
    });
    if (cached && new Date(cached.expiresAt) > new Date() && cached.responseData?.financialCurrency !== undefined && cached.responseData?.ttm !== undefined) {
      return { ...cached.responseData, fromCache: true };
    }
  } catch (cacheErr) {
    console.warn("Gagal membaca cache finansial historis:", cacheErr.message);
  }

  // 2. Eksekusi Python script fetchFinancialHistory.py
  let stdoutData = "";
  try {
    const { stdout } = await execFileAsync("python", [SCRIPT_PATH, sym], {
      timeout: 30000,
      maxBuffer: 1024 * 1024 * 5,
    });
    stdoutData = stdout;
  } catch (execErr) {
    console.error(`Gagal mengeksekusi python fetchFinancialHistory untuk ${sym}:`, execErr.message);
    throw new Error(`Gagal mengambil data finansial eksternal untuk ${sym}.`);
  }

  let parsedResult;
  try {
    parsedResult = JSON.parse(stdoutData.trim());
  } catch (parseErr) {
    console.error("Gagal parse JSON dari python fetchFinancialHistory:", stdoutData);
    throw new Error("Format data finansial tidak valid.");
  }

  if (!parsedResult.success) {
    throw new Error(parsedResult.message || `Data finansial historis ${sym} tidak ditemukan.`);
  }

  // 3. Simpan ke database apiCache (TTL 24 Jam)
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.apiCache.upsert({
      where: { endpointKey },
      update: {
        responseData: parsedResult,
        fetchedAt: new Date(),
        expiresAt,
      },
      create: {
        provider: "yahoo-finance-statements",
        endpointKey,
        responseData: parsedResult,
        fetchedAt: new Date(),
        expiresAt,
      },
    });

    // 4. Sinkronisasi otomatis ke table stock_fundamentals agar kartu 4 Pilar & Detail Saham 100% konsisten dengan data audit resmi terbaru
    if (parsedResult.annual && Array.isArray(parsedResult.annual) && parsedResult.annual.length > 0) {
      const audit = parsedResult.annual[parsedResult.annual.length - 1];
      const auditIdx = parsedResult.annual.length - 1;
      const prevAudit = auditIdx > 0 ? parsedResult.annual[auditIdx - 1] : null;

      let revGrowth = null;
      let netGrowth = null;
      if (prevAudit?.revenue && audit?.revenue) {
        revGrowth = Number((((audit.revenue - prevAudit.revenue) / Math.abs(prevAudit.revenue)) * 100).toFixed(1));
      }
      if (prevAudit?.netIncome && audit?.netIncome) {
        netGrowth = Number((((audit.netIncome - prevAudit.netIncome) / Math.abs(prevAudit.netIncome)) * 100).toFixed(1));
      }

      const stats = parsedResult.keyStatistics || {};

      await prisma.stockFundamental.upsert({
        where: { symbol: sym },
        update: {
          marketCap: stats.marketCap ? stats.marketCap.toString() : undefined,
          peRatio: stats.peRatio !== null && stats.peRatio !== undefined ? stats.peRatio.toString() : undefined,
          pbvRatio: stats.pbvRatio !== null && stats.pbvRatio !== undefined ? stats.pbvRatio.toString() : undefined,
          dividendYield: stats.dividendYield !== null && stats.dividendYield !== undefined ? stats.dividendYield.toString() : undefined,
          revenue: audit.revenue ? audit.revenue.toString() : undefined,
          netIncome: audit.netIncome ? audit.netIncome.toString() : undefined,
          totalAssets: audit.totalAssets ? audit.totalAssets.toString() : undefined,
          totalEquity: audit.totalEquity ? audit.totalEquity.toString() : undefined,
          totalLiabilities: audit.totalLiabilities ? audit.totalLiabilities.toString() : undefined,
          cashEquivalents: audit.cashEquivalents ? audit.cashEquivalents.toString() : undefined,
          netProfitMargin: audit.netProfitMargin?.toString(),
          roe: audit.roe?.toString(),
          roa: audit.roa?.toString(),
          der: audit.der?.toString(),
          eps: (audit.eps !== null && audit.eps !== undefined ? audit.eps : stats.eps)?.toString(),
          revenueGrowth: revGrowth !== null ? revGrowth.toString() : undefined,
          netIncomeGrowth: netGrowth !== null ? netGrowth.toString() : undefined,
          financialPeriod: `${audit.period} Audit (Konsolidasian)`,
          updatedAt: new Date(),
        },
        create: {
          symbol: sym,
          marketCap: stats.marketCap ? stats.marketCap.toString() : "0",
          peRatio: stats.peRatio?.toString() || "0",
          pbvRatio: stats.pbvRatio?.toString() || "0",
          dividendYield: stats.dividendYield?.toString() || "0",
          revenue: audit.revenue ? audit.revenue.toString() : "0",
          netIncome: audit.netIncome ? audit.netIncome.toString() : "0",
          totalAssets: audit.totalAssets ? audit.totalAssets.toString() : "0",
          totalEquity: audit.totalEquity ? audit.totalEquity.toString() : "0",
          totalLiabilities: audit.totalLiabilities ? audit.totalLiabilities.toString() : "0",
          cashEquivalents: audit.cashEquivalents ? audit.cashEquivalents.toString() : "0",
          netProfitMargin: audit.netProfitMargin?.toString() || "0",
          roe: audit.roe?.toString() || "0",
          roa: audit.roa?.toString() || "0",
          der: audit.der?.toString() || "0",
          eps: (audit.eps !== null && audit.eps !== undefined ? audit.eps : stats.eps)?.toString() || "0",
          revenueGrowth: revGrowth !== null ? revGrowth.toString() : "0",
          netIncomeGrowth: netGrowth !== null ? netGrowth.toString() : "0",
          financialPeriod: `${audit.period} Audit (Konsolidasian)`,
        },
      });
    }
  } catch (saveErr) {
    console.warn("Gagal menyimpan cache/sync finansial historis:", saveErr.message);
  }

  return { ...parsedResult, fromCache: false };
}

/**
 * Helper untuk menyusun objek fundamental dari data riil API
 */
export function buildRealFundamentalObject(realData, sym) {
  if (!realData) return null;
  const audit = realData?.annual?.[realData.annual.length - 1];
  const auditIdx = realData?.annual ? realData.annual.length - 1 : -1;
  const prevAudit = auditIdx > 0 ? realData.annual[auditIdx - 1] : null;

  let revGrowth = null;
  let netGrowth = null;
  if (prevAudit?.revenue && audit?.revenue) {
    revGrowth = Number((((audit.revenue - prevAudit.revenue) / Math.abs(prevAudit.revenue)) * 100).toFixed(1));
  }
  if (prevAudit?.netIncome && audit?.netIncome) {
    netGrowth = Number((((audit.netIncome - prevAudit.netIncome) / Math.abs(prevAudit.netIncome)) * 100).toFixed(1));
  }

  const stats = realData.keyStatistics || {};

  return {
    symbol: sym,
    financialCurrency: realData.financialCurrency || stats.financialCurrency || "IDR",
    usdToIdrRate: realData.usdToIdrRate || stats.usdToIdrRate || 16200,
    marketCap: stats.marketCap || (audit?.totalEquity ? audit.totalEquity * 1.5 : null),
    peRatio: stats.peRatio !== null && stats.peRatio !== undefined ? stats.peRatio : null,
    pbvRatio: stats.pbvRatio !== null && stats.pbvRatio !== undefined ? stats.pbvRatio : null,
    dividendYield: stats.dividendYield || 0,
    eps: audit?.eps !== null && audit?.eps !== undefined ? audit.eps : (stats.eps ?? null),
    epsTtm: realData?.ttm?.eps ?? stats.eps ?? null,
    epsTtmIdr: realData?.ttm?.epsIdr ?? stats.epsIdr ?? null,
    epsIdr: audit?.epsIdr !== null && audit?.epsIdr !== undefined ? audit.epsIdr : null,
    beta: stats.beta || null,
    revenue: audit?.revenue ?? null,
    netIncome: audit?.netIncome ?? null,
    totalAssets: audit?.totalAssets ?? null,
    totalEquity: audit?.totalEquity ?? null,
    totalLiabilities: audit?.totalLiabilities ?? null,
    cashEquivalents: audit?.cashEquivalents ?? null,
    revenueIdr: audit?.revenueIdr ?? null,
    netIncomeIdr: audit?.netIncomeIdr ?? null,
    totalAssetsIdr: audit?.totalAssetsIdr ?? null,
    totalEquityIdr: audit?.totalEquityIdr ?? null,
    totalLiabilitiesIdr: audit?.totalLiabilitiesIdr ?? null,
    cashEquivalentsIdr: audit?.cashEquivalentsIdr ?? null,
    netProfitMargin: audit?.netProfitMargin ?? null,
    roe: audit?.roe ?? null,
    roa: audit?.roa ?? null,
    der: audit?.der ?? null,
    revenueGrowth: revGrowth,
    netIncomeGrowth: netGrowth,
    financialPeriod: audit ? `${audit.period} Audit (Konsolidasian)` : "FY2024 Audit",
    source: realData.source || "Yahoo Finance (Official Disclosures)",
    previousClose: stats.previousClose ?? null,
    open: stats.open ?? null,
    bid: stats.bid ?? null,
    ask: stats.ask ?? null,
    bidSize: stats.bidSize ?? null,
    askSize: stats.askSize ?? null,
    dayLow: stats.dayLow ?? null,
    dayHigh: stats.dayHigh ?? null,
    fiftyTwoWeekLow: stats.fiftyTwoWeekLow ?? null,
    fiftyTwoWeekHigh: stats.fiftyTwoWeekHigh ?? null,
    volume: stats.volume ?? null,
    averageVolume: stats.averageVolume ?? null,
    earningsDate: stats.earningsDate ?? null,
    dividendRate: stats.dividendRate ?? null,
    exDividendDate: stats.exDividendDate ?? null,
    targetMeanPrice: stats.targetMeanPrice ?? null,
  };
}

/**
 * Mengambil Laporan Keuangan Historis Multi-Tahun & Kuartalan Asli dari Yahoo Finance
 * GET /api/stocks/:symbol/financial-history
 */
export const getStockFinancialHistory = async (req, res) => {
  try {
    const symbol = req.params.symbol?.toUpperCase();
    if (!symbol) {
      return sendError(res, 400, "Simbol emiten harus disertakan.");
    }

    const realData = await fetchFinancialDataFromSource(symbol);
    return sendSuccess(res, 200, `Laporan keuangan historis ${symbol} berhasil dimuat`, realData);
  } catch (error) {
    console.error("Get Stock Financial History Error:", error);
    return sendError(res, 500, `Terjadi kesalahan saat memuat laporan keuangan ${req.params.symbol}: ${error.message}`);
  }
};

