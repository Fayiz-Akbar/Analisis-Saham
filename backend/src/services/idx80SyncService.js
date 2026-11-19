import prisma from "../lib/prisma.js";

const TV_SCANNER_URL = "https://scanner.tradingview.com/indonesia/scan";
const SYNC_CACHE_KEY = "idx80_constituents_sync";
const SYNC_TTL_MS = 24 * 60 * 60 * 1000; // Auto-sync setiap 24 jam
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

let activeSyncPromise = null;
let memoryCacheData = null;
let memoryCacheExpiresAt = 0;

/**
 * Normalisasi nama sektor TradingView ke standar sektor BEI yang digunakan UI
 */
export function mapTradingViewSector(tvSector = "", tvIndustry = "") {
  const s = (tvSector || "").toLowerCase();
  const ind = (tvIndustry || "").toLowerCase();

  if (ind.includes("real estate") || ind.includes("property")) {
    return "Properties & Real Estate";
  }
  if (
    s === "finance" ||
    ind.includes("bank") ||
    ind.includes("leasing") ||
    ind.includes("insurance") ||
    s === "commercial services"
  ) {
    return "Financials";
  }
  if (s === "energy minerals" || ind.includes("oil") || ind.includes("coal") || ind.includes("gas distributors")) {
    return "Energy";
  }
  if (
    s === "non-energy minerals" ||
    ind.includes("chemicals") ||
    ind.includes("pulp & paper") ||
    ind.includes("forest") ||
    ind.includes("construction materials")
  ) {
    return "Basic Materials";
  }
  if (
    s === "consumer non-durables" ||
    ind.includes("agricultural") ||
    ind.includes("food") ||
    ind.includes("tobacco") ||
    ind.includes("household")
  ) {
    return "Consumer Non-Cyclicals";
  }
  if (s === "retail trade" || s === "consumer durables" || s === "consumer services") {
    return "Consumer Cyclicals";
  }
  if (s === "communications" || ind.includes("telecom")) {
    return "Telecommunication";
  }
  if (s === "health technology" || ind.includes("pharmaceutical") || ind.includes("hospital")) {
    return "Healthcare";
  }
  if (s === "technology services" || ind.includes("software") || ind.includes("information technology")) {
    return "Technology";
  }
  if (s === "utilities" || s === "industrial services") {
    return "Infrastructures";
  }
  if (s === "transportation") {
    return "Transportation & Logistic";
  }
  if (s === "distribution services") {
    if (ind.includes("food")) return "Consumer Non-Cyclicals";
    if (ind.includes("electronics")) return "Consumer Cyclicals";
    return "Energy";
  }
  if (s === "process industries") {
    return "Basic Materials";
  }

  return "Industrials";
}

/**
 * Merapikan nama perusahaan dari TradingView (contoh menghapus suffix "Class A/B" dan prefiks "PT ")
 */
function formatCompanyName(rawName, symbol) {
  if (!rawName || typeof rawName !== "string") return `${symbol} Tbk.`;
  let cleaned = rawName
    .replace(/\s+Class\s+[A-Z]$/i, "")
    .replace(/^PT\s+/i, "")
    .trim();
  if (!/Tbk\.?$/i.test(cleaned)) {
    cleaned = `${cleaned} Tbk.`;
  } else if (/Tbk$/i.test(cleaned)) {
    cleaned = `${cleaned}.`;
  }
  return cleaned;
}

/**
 * Mengambil snapshot status sinkronisasi terakhir dari cache PostgreSQL
 */
export async function getLastIdx80SyncStatus() {
  if (memoryCacheData && Date.now() < memoryCacheExpiresAt) {
    return memoryCacheData;
  }
  try {
    const cached = await prisma.apiCache.findUnique({
      where: { endpointKey: SYNC_CACHE_KEY },
    });
    if (cached?.responseData) {
      memoryCacheData = cached.responseData;
      memoryCacheExpiresAt = cached.expiresAt ? new Date(cached.expiresAt).getTime() : 0;
    }
    return cached?.responseData || null;
  } catch {
    return null;
  }
}

/**
 * Sinkronisasi otomatis konstituen IDX80 & deteksi emiten delisting / keluar indeks
 * Sumber: TradingView Indonesia Market Scanner (tag indeks resmi IDX:IDX80)
 */
export async function syncIdx80Constituents({ force = false } = {}) {
  if (!force && memoryCacheData && Date.now() < memoryCacheExpiresAt) {
    return { ...memoryCacheData, fromCache: true };
  }
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncPromise = (async () => {
    try {
      if (!force) {
        const cached = await prisma.apiCache.findUnique({
          where: { endpointKey: SYNC_CACHE_KEY },
        });
        if (cached && new Date(cached.expiresAt) > new Date() && cached.responseData) {
          memoryCacheData = cached.responseData;
          memoryCacheExpiresAt = new Date(cached.expiresAt).getTime();
          return { ...cached.responseData, fromCache: true };
        }
      }

      const response = await fetch(TV_SCANNER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": USER_AGENT,
        },
        body: JSON.stringify({
          columns: ["name", "indexes", "description", "sector", "industry", "close"],
          range: [0, 1500],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} dari TradingView IDX Scanner`);
      }

      const payload = await response.json();
      const rows = Array.isArray(payload?.data) ? payload.data : [];

      const activeIdxSymbols = new Set();
      const idx80Items = [];

      for (const row of rows) {
        const d = row?.d;
        if (!Array.isArray(d) || !d[0]) continue;
        const symbol = String(d[0]).trim().toUpperCase();
        activeIdxSymbols.add(symbol);

        const indexes = Array.isArray(d[1]) ? d[1] : [];
        const isMember = indexes.some((idx) => idx?.proname === "IDX:IDX80");

        if (isMember) {
          idx80Items.push({
            symbol,
            companyName: formatCompanyName(d[2], symbol),
            sector: mapTradingViewSector(d[3], d[4]),
            industry: String(d[4] || d[3] || "Equities").trim(),
            closePrice: typeof d[5] === "number" && d[5] > 0 ? d[5] : null,
          });
        }
      }

      // Guard keamanan: hanya mutasi DB jika data konstituen valid (>= 60 saham)
      if (idx80Items.length < 60) {
        throw new Error(
          `Jumlah konstituen IDX80 tidak lengkap (${idx80Items.length}), sinkronisasi DB dilewati.`
        );
      }

      const existingStocks = await prisma.stock.findMany({
        select: { symbol: true, isIdx80: true, sector: true, industry: true, companyName: true },
      });
      const existingMap = new Map(existingStocks.map((s) => [s.symbol, s]));
      const prevIdx80Set = new Set(existingStocks.filter((s) => s.isIdx80).map((s) => s.symbol));
      const newIdx80Set = new Set(idx80Items.map((i) => i.symbol));

      const addedSymbols = idx80Items
        .map((i) => i.symbol)
        .filter((sym) => !prevIdx80Set.has(sym));
      const removedSymbols = [...prevIdx80Set].filter((sym) => !newIdx80Set.has(sym));
      const delistedOrInactive = [...existingMap.keys()].filter(
        (sym) => !activeIdxSymbols.has(sym)
      );

      // Upsert seluruh konstituen IDX80 aktif
      for (const item of idx80Items) {
        const existing = existingMap.get(item.symbol);
        const logoUrl = `https://assets.stockbit.com/logos/companies/${item.symbol}.png`;

        await prisma.stock.upsert({
          where: { symbol: item.symbol },
          update: {
            isIdx80: true,
            exchange: "IDX",
            logoUrl,
            // Pertahankan sektor/industri terkurasi bila sudah ada, isi jika belum ada
            sector: existing?.sector || item.sector,
            industry: existing?.industry || item.industry,
            companyName: existing?.companyName || item.companyName,
          },
          create: {
            symbol: item.symbol,
            companyName: item.companyName,
            sector: item.sector,
            industry: item.industry,
            logoUrl,
            exchange: "IDX",
            isIdx80: true,
          },
        });

        // Pastikan harga awal tersedia agar kartu/tabel baru tidak kosong
        if (item.closePrice) {
          await prisma.stockDailyPrice.upsert({
            where: { symbol: item.symbol },
            update: {},
            create: {
              symbol: item.symbol,
              closePrice: item.closePrice,
              changeAmount: 0,
              changePercent: 0,
              openPrice: item.closePrice,
              highPrice: item.closePrice,
              lowPrice: item.closePrice,
            },
          });
        }
      }

      // Tandai saham yang keluar dari IDX80 atau ter-delisting dengan isIdx80 = false
      // (Data historis watchlist/portfolio pengguna tetap aman tanpa broken foreign key)
      if (removedSymbols.length > 0) {
        await prisma.stock.updateMany({
          where: {
            symbol: { in: removedSymbols },
          },
          data: { isIdx80: false },
        });
      }

      // Jika ada perubahan konstituen, hapus cache ticker tape & market overview agar langsung segar
      if (addedSymbols.length > 0 || removedSymbols.length > 0) {
        await prisma.apiCache.deleteMany({
          where: {
            OR: [
              { endpointKey: "market_ticker_tape_all_idx80" },
              { endpointKey: { startsWith: "market_overview_" } },
            ],
          },
        });
        console.log(
          `🔄 IDX80 Rebalancing Sync: +${addedSymbols.length} masuk (${addedSymbols.join(", ")}), -${removedSymbols.length} keluar (${removedSymbols.join(", ")})`
        );
      }

      const syncSummary = {
        syncedAt: new Date().toISOString(),
        source: "TradingView Indonesia Market Scanner (IDX:IDX80)",
        totalIdx80: idx80Items.length,
        totalActiveIdx: activeIdxSymbols.size,
        addedSymbols,
        removedSymbols,
        delistedOrInactiveInDb: delistedOrInactive,
      };

      const expiresAt = new Date(Date.now() + SYNC_TTL_MS);
      await prisma.apiCache.upsert({
        where: { endpointKey: SYNC_CACHE_KEY },
        update: {
          provider: "tradingview_idx_scanner",
          responseData: syncSummary,
          fetchedAt: new Date(),
          expiresAt,
        },
        create: {
          provider: "tradingview_idx_scanner",
          endpointKey: SYNC_CACHE_KEY,
          responseData: syncSummary,
          fetchedAt: new Date(),
          expiresAt,
        },
      });

      memoryCacheData = syncSummary;
      memoryCacheExpiresAt = expiresAt.getTime();

      return { ...syncSummary, fromCache: false };
    } catch (err) {
      console.warn("⚠️ Gagal auto-sync konstituen IDX80 (menggunakan data DB terakhir):", err.message);
      return await getLastIdx80SyncStatus();
    } finally {
      activeSyncPromise = null;
    }
  })();

  return activeSyncPromise;
}
