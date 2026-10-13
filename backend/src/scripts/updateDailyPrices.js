import prisma from "../lib/prisma.js";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function updateAllDailyPrices() {
  console.log("🚀 Memulai penarikan data harga riil seluruh 80 saham IDX80 dari Yahoo Finance...");

  const stocks = await prisma.stock.findMany({ select: { symbol: true, companyName: true } });
  console.log(`Ditemukan ${stocks.length} saham di database.`);

  let successCount = 0;
  let failCount = 0;
  const tapeData = [];

  // Proses secara batch 8 simbol paralel
  for (let i = 0; i < stocks.length; i += 8) {
    const chunk = stocks.slice(i, i + 8);
    await Promise.all(
      chunk.map(async (stk) => {
        const sym = stk.symbol;
        try {
          const res = await fetch(
            `https://query2.finance.yahoo.com/v8/finance/chart/${sym}.JK?interval=1d&range=5d`,
            { headers: { "User-Agent": USER_AGENT } }
          );

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const json = await res.json();
          const result = json?.chart?.result?.[0];
          const meta = result?.meta;
          const closes = (result?.indicators?.quote?.[0]?.close || []).filter(
            (c) => c != null && !isNaN(c)
          );

          const price = meta?.regularMarketPrice || closes[closes.length - 1];
          if (!price) throw new Error("Harga tidak valid");

          // Perhitungan MINGGUAN (Weekly Performance) dari 5 hari bursa (sparkline)
          const startOfWeek = closes.length > 0 ? closes[0] : (meta?.chartPreviousClose || price);
          const weeklyChange = Number((price - startOfWeek).toFixed(2));
          const weeklyPct = startOfWeek > 0 ? Number(((weeklyChange / startOfWeek) * 100).toFixed(2)) : 0;

          // Perhitungan Harian (Daily) untuk tabel stock_daily_prices
          const dailyChange = meta?.fulldayChange != null
            ? Number(meta.fulldayChange)
            : (closes.length >= 2 ? Number((price - closes[closes.length - 2]).toFixed(2)) : weeklyChange);
          const dailyPct = meta?.regularMarketChangePercent != null
            ? Number(meta.regularMarketChangePercent)
            : (closes.length >= 2 && closes[closes.length - 2] ? Number(((dailyChange / closes[closes.length - 2]) * 100).toFixed(2)) : weeklyPct);

          const open = meta?.regularMarketOpen || closes[0] || price;
          const high = meta?.regularMarketDayHigh || Math.max(...closes);
          const low = meta?.regularMarketDayLow || Math.min(...closes);
          const volume = meta?.regularMarketVolume || 0;

          // Upsert ke database StockDailyPrice
          await prisma.stockDailyPrice.upsert({
            where: { symbol: sym },
            update: {
              closePrice: price,
              changeAmount: dailyChange,
              changePercent: dailyPct,
              openPrice: open,
              highPrice: high,
              lowPrice: low,
              volume: String(volume),
              lastUpdated: new Date(),
            },
            create: {
              symbol: sym,
              closePrice: price,
              changeAmount: dailyChange,
              changePercent: dailyPct,
              openPrice: open,
              highPrice: high,
              lowPrice: low,
              volume: String(volume),
              lastUpdated: new Date(),
            },
          });

          tapeData.push({
            symbol: sym,
            companyName: stk.companyName,
            logoUrl: `https://assets.stockbit.com/logos/companies/${sym}.png`,
            price: Number(price),
            changeAmount: weeklyChange,
            changePercent: weeklyPct,
            sparkline: closes.length >= 2 ? closes : [startOfWeek, price],
          });

          successCount++;
        } catch (err) {
          console.warn(`Gagal memuat ${sym}:`, err.message);
          failCount++;
        }
      })
    );
    console.log(`Progress: ${Math.min(i + 8, stocks.length)} / ${stocks.length}`);
  }

  // Simpan hasil ke cache PostgreSQL untuk endpoint ticker-tape (TTL 2 Jam)
  try {
    const endpointKey = "market_ticker_tape_all_idx80";
    await prisma.apiCache.upsert({
      where: { endpointKey },
      update: {
        provider: "YAHOO_FINANCE",
        responseData: tapeData,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 Jam
      },
      create: {
        endpointKey,
        provider: "YAHOO_FINANCE",
        responseData: tapeData,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      },
    });
  } catch (e) {
    console.warn("Gagal simpan cache ticker tape:", e.message);
  }

  console.log(`✅ Selesai! Berhasil: ${successCount}, Gagal: ${failCount}`);
  return { successCount, failCount, total: stocks.length };
}

// Eksekusi langsung jika dipanggil via node
if (process.argv[1]?.includes("updateDailyPrices.js")) {
  updateAllDailyPrices()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
