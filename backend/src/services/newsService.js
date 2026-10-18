import prisma from "../lib/prisma.js";
import crypto from "crypto";

const CACHE_TTL_MS = 20 * 60 * 1000; // 20 Menit TTL Caching
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Daftar konstituen populer IDX80 untuk deteksi otomatis simbol saham pada judul
const IDX80_TAGS = [
  "BBCA", "BBRI", "BMRI", "BBNI", "TLKM", "ASII", "GOTO", "AMMN", "BREN", "CUAN",
  "ADRO", "ICBP", "INDF", "KLBF", "UNVR", "MDKA", "PGAS", "PTBA", "ANTM", "INCO",
  "BRPT", "CPIN", "SMGR", "INTP", "ACES", "EXCL", "ISAT", "MEDC", "TPIA", "INKP",
  "TKIM", "UNTR", "AKRA", "ESSA", "MAPA", "MAPI", "MYOR", "MIKA", "HEAL", "SILO",
  "CTRA", "SMRA", "BSDE", "PWON", "EMTK", "SCMA", "MNCN", "BUKA", "ARTO", "BBTN",
  "ELSA", "WIKA", "PTPP", "ADMR", "JPFA", "ERAA", "BUMI", "BRIS", "BFIN", "HRUM"
];

/**
 * Klasifikasi sentimen berita keuangan menggunakan Google Gemini API (Metode Muhammad & Rospocher, 2025)
 * Jika GEMINI_API_KEY tidak tersedia, fallback ke Lexicon Classifier Keuangan Indonesia.
 */
async function classifySentiment(title, description = "") {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const prompt = `Klasifikasikan sentimen judul berita pasar modal/keuangan berikut terhadap prospek pasar/emiten: [Positif / Netral / Negatif].\nJawab HANYA satu kata: POSITIVE, NEUTRAL, atau NEGATIVE.\n\nJudul Berita: "${title}"`;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 10 },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const output = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();
        if (output?.includes("POSITIVE") || output?.includes("POSITIF")) {
          return { label: "POSITIVE", score: 0.85 };
        }
        if (output?.includes("NEGATIVE") || output?.includes("NEGATIF")) {
          return { label: "NEGATIVE", score: -0.85 };
        }
        return { label: "NEUTRAL", score: 0.0 };
      }
    } catch (err) {
      console.warn("Gemini Sentiment API error, using lexicon fallback:", err.message);
    }
  }

  // Fallback: Lexicon Classifier Berita Keuangan Indonesia
  const text = `${title} ${description}`.toLowerCase();
  const positiveWords = [
    "rebound", "menguat", "naik", "melesat", "terbang", "laba", "pertumbuhan",
    "surplus", "dividen", "perkasa", "akuisisi", "borong", "optimis", "hijau",
    "bullish", "ekspansi", "untung", "cuan", "rekor", "investasi", "dongkrak",
    "kinerja positif", "terdorong", "meroket", "tertinggi", "positif", "melonjak",
    "berkilau", "reli", "terangkat", "melambung"
  ];
  const negativeWords = [
    "anjlok", "melemah", "turun", "merosot", "rugi", "koreksi", "amblas", "ambles",
    "jatuh", "tekanan", "merah", "bearish", "defisit", "gagal", "kebakaran", "waspada",
    "beban", "dilepas", "penurunan", "tergerus", "negatif", "anjlok", "longsor", "ambruk"
  ];

  let posScore = 0;
  let negScore = 0;

  for (const w of positiveWords) {
    if (text.includes(w)) posScore++;
  }
  for (const w of negativeWords) {
    if (text.includes(w)) negScore++;
  }

  if (posScore > negScore) {
    return { label: "POSITIVE", score: Number(Math.min(0.5 + posScore * 0.15, 0.95).toFixed(2)) };
  } else if (negScore > posScore) {
    return { label: "NEGATIVE", score: Number(Math.max(-0.5 - negScore * 0.15, -0.95).toFixed(2)) };
  }
  return { label: "NEUTRAL", score: 0.0 };
}

/**
 * Deteksi simbol emiten IDX80 pada judul berita
 */
function detectStockSymbol(title) {
  const upper = title.toUpperCase();
  for (const sym of IDX80_TAGS) {
    // Cocokkan sebagai kata utuh atau diapit tanda baca
    const regex = new RegExp(`\\b${sym}\\b`);
    if (regex.test(upper)) {
      return sym;
    }
  }
  if (upper.includes("IHSG")) return "IHSG";
  return null;
}

// Curated high-resolution financial topic fallbacks
const TOPIC_FALLBACK_IMAGES = {
  banking: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=800&q=80",
  energy: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
  mining: "https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80",
  tech: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  market: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
};

function getFallbackImage(title = "", symbol = null) {
  const t = (title || "").toLowerCase();
  const s = (symbol || "").toUpperCase();
  if (
    ["BBCA", "BBRI", "BMRI", "BBNI", "BRIS", "ARTO", "BBTN"].includes(s) ||
    t.includes("bank") ||
    t.includes("kredit") ||
    t.includes("bunga") ||
    t.includes("keuangan")
  ) {
    return TOPIC_FALLBACK_IMAGES.banking;
  }
  if (
    ["ADRO", "PTBA", "MEDC", "PGAS", "BUMI", "ELSA", "AKRA"].includes(s) ||
    t.includes("energi") ||
    t.includes("batubara") ||
    t.includes("minyak") ||
    t.includes("migas")
  ) {
    return TOPIC_FALLBACK_IMAGES.energy;
  }
  if (
    ["ANTM", "INCO", "MDKA", "BRPT", "TPIA"].includes(s) ||
    t.includes("nikel") ||
    t.includes("emas") ||
    t.includes("tambang") ||
    t.includes("komoditas")
  ) {
    return TOPIC_FALLBACK_IMAGES.mining;
  }
  if (
    ["TLKM", "ISAT", "EXCL", "GOTO", "BUKA", "EMTK"].includes(s) ||
    t.includes("teknologi") ||
    t.includes("digital") ||
    t.includes("telko") ||
    t.includes("ai")
  ) {
    return TOPIC_FALLBACK_IMAGES.tech;
  }
  if (t.includes("ihsg") || t.includes("bursa") || t.includes("saham") || t.includes("indeks") || t.includes("bei")) {
    return TOPIC_FALLBACK_IMAGES.market;
  }
  return TOPIC_FALLBACK_IMAGES.default;
}

function generateContextualDescription(title = "", symbol = null, sentiment = "neutral") {
  const t = (title || "").toLowerCase();
  const sent = (sentiment || "neutral").toLowerCase();

  if (t.includes("ihsg") || t.includes("bursa") || t.includes("pasar modal")) {
    if (sent === "negative" || t.includes("lemah") || t.includes("turun") || t.includes("jeblok") || t.includes("ambruk") || t.includes("merosot")) {
      return "Indeks Harga Saham Gabungan (IHSG) berada di bawah tekanan aksi jual investor dan sentimen global yang memicu kehati-hatian pelaku pasar.";
    }
    if (sent === "positive" || t.includes("menguat") || t.includes("naik") || t.includes("rebound") || t.includes("reli")) {
      return "Laju IHSG membukukan kinerja positif ditopang penguatan sektor unggulan dan optimisme terhadap stabilitas makroekonomi domestik.";
    }
    return "Indeks Harga Saham Gabungan (IHSG) bergerak konsolidasi teratur seiring investor mencermati sentimen suku bunga dan arah arus modal asing.";
  }

  if (symbol) {
    if (sent === "positive") {
      return `Kinerja dan aksi korporasi emiten ${symbol} diapresiasi positif oleh pelaku pasar di tengah momentum ekspansi bisnis berkelanjutan.`;
    }
    if (sent === "negative") {
      return `Pergerakan harga saham ${symbol} terkoreksi seiring penyesuaian ekspektasi pasar dan dinamika sektor industri terkait.`;
    }
    return `Pelaku pasar memantau perkembangan fundamental dan rencana strategis emiten ${symbol} pada sesi perdagangan bursa terkini.`;
  }

  return "Rangkuman dinamika sentimen pasar finansial, kebijakan ekonomi makro, serta pergerakan konstituen bursa saham terkini.";
}

/**
 * Parser feed RSS Berita Finansial (CNBC Indonesia Market & Google News)
 */
async function fetchRawFinancialNews() {
  const items = [];
  const seenTitles = new Set();

  // 1. Sumber Utama: CNBC Indonesia Market RSS (memiliki gambar artikel dan deskripsi lengkap)
  try {
    const cnbcRes = await fetch("https://www.cnbcindonesia.com/market/rss", {
      headers: { "User-Agent": USER_AGENT },
    });
    if (cnbcRes.ok) {
      const xml = await cnbcRes.text();
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match;
      while ((match = itemRegex.exec(xml)) !== null && items.length < 20) {
        const block = match[1];
        const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i);
        const descMatch = block.match(/<description>([\s\S]*?)<\/description>/i);
        const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const enclosureMatch = block.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
        const imgMatch = block.match(/<img[^>]*src=["']([^"']+)["']/i);

        let rawTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "";
        let link = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "";
        let desc = descMatch
          ? descMatch[1]
              .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
              .replace(/<[^>]+>/g, "")
              .replace(/&amp;/g, "&")
              .trim()
          : "";
        let imageUrl = enclosureMatch?.[1] || imgMatch?.[1] || null;
        if (imageUrl) imageUrl = imageUrl.replace(/&amp;/g, "&");

        if (rawTitle && link && !seenTitles.has(rawTitle.toLowerCase())) {
          seenTitles.add(rawTitle.toLowerCase());
          items.push({
            title: rawTitle,
            description: desc || rawTitle,
            source: "CNBC Indonesia",
            url: link,
            imageUrl: imageUrl || getFallbackImage(rawTitle, detectStockSymbol(rawTitle)),
            publishedAt: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
          });
        }
      }
    }
  } catch (err) {
    console.warn("Gagal fetch CNBC Market RSS:", err.message);
  }

  // 2. Sumber Pelengkap: Google News Pasar Modal Indonesia
  try {
    const query = 'IHSG OR "saham BEI" OR "emiten IDX" OR "Bursa Efek Indonesia" when:2d';
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`;
    const response = await fetch(rssUrl, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (response.ok) {
      const xml = await response.text();
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match;

      while ((match = itemRegex.exec(xml)) !== null && items.length < 35) {
        const block = match[1];
        const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i);
        const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

        let rawTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "";
        let source = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "";

        if (!source && rawTitle.includes(" - ")) {
          const parts = rawTitle.split(" - ");
          source = parts.pop().trim();
          rawTitle = parts.join(" - ").trim();
        } else if (rawTitle.includes(" - ")) {
          const parts = rawTitle.split(" - ");
          parts.pop();
          rawTitle = parts.join(" - ").trim();
        }

        if (rawTitle && linkMatch && !seenTitles.has(rawTitle.toLowerCase())) {
          seenTitles.add(rawTitle.toLowerCase());
          const sym = detectStockSymbol(rawTitle);
          items.push({
            title: rawTitle,
            description: rawTitle,
            source: source || "Kontan / Investor Daily",
            url: linkMatch[1].trim(),
            imageUrl: getFallbackImage(rawTitle, sym),
            publishedAt: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
          });
        }
      }
    }
  } catch (err) {
    console.warn("Gagal fetch Google News RSS:", err.message);
  }

  return items;
}

export class NewsService {
  /**
   * Mengambil berita finansial terkini dengan caching PostgreSQL
   */
  static async getLatestFinancialNews(limit = 6, filterSymbol = null, filterSentiment = null) {
    try {
      const now = new Date();

      // 1. Cek Caching di Database (news_sentiment)
      const cachedNews = await prisma.newsSentiment.findMany({
        where: {
          ...(filterSymbol ? { symbol: filterSymbol } : {}),
          ...(filterSentiment ? { sentiment: filterSentiment.toUpperCase() } : {}),
        },
        orderBy: { publishedAt: "desc" },
        take: limit,
      });

      // Jika ada berita di database, memiliki imageUrl, dan yang terbaru masih segar (< 20 menit)
      const hasImages = cachedNews.some((item) => !!item.imageUrl);
      if (cachedNews.length >= limit && hasImages) {
        const latestCachedAt = cachedNews[0]?.cachedAt;
        if (latestCachedAt && now.getTime() - new Date(latestCachedAt).getTime() < CACHE_TTL_MS) {
          return cachedNews.map(this.formatNewsItem);
        }
      }

      // 2. Jika cache kosong, usang, atau belum memiliki gambar, tarik berita segar
      const rawNewsList = await fetchRawFinancialNews();

      if (rawNewsList.length > 0) {
        for (const item of rawNewsList) {
          try {
            const existing = await prisma.newsSentiment.findFirst({
              where: { title: item.title },
            });

            const symbol = detectStockSymbol(item.title);

            let validSymbol = null;
            if (symbol && symbol !== "IHSG") {
              const stockExists = await prisma.stock.findUnique({
                where: { symbol },
              });
              if (stockExists) validSymbol = symbol;
            }

            if (!existing) {
              const { label, score } = await classifySentiment(item.title, item.description);

              await prisma.newsSentiment.create({
                data: {
                  id: crypto.randomUUID(),
                  symbol: validSymbol,
                  title: item.title,
                  description: item.description || item.title,
                  imageUrl: item.imageUrl,
                  source: item.source,
                  url: item.url,
                  sentiment: label,
                  sentimentScore: score,
                  publishedAt: item.publishedAt,
                  cachedAt: now,
                },
              });
            } else if (!existing.imageUrl && item.imageUrl) {
              // Perbarui imageUrl jika sebelumnya kosong
              await prisma.newsSentiment.update({
                where: { id: existing.id },
                data: {
                  imageUrl: item.imageUrl,
                  description: item.description || existing.description,
                },
              });
            }
          } catch (itemErr) {
            console.warn("Gagal menyimpan item berita:", itemErr.message);
          }
        }
      }

      // 3. Query ulang dari database setelah pembaruan
      const freshNews = await prisma.newsSentiment.findMany({
        where: {
          ...(filterSymbol ? { symbol: filterSymbol } : {}),
          ...(filterSentiment ? { sentiment: filterSentiment.toUpperCase() } : {}),
        },
        orderBy: { publishedAt: "desc" },
        take: limit,
      });

      return freshNews.map(this.formatNewsItem);
    } catch (error) {
      console.error("NewsService Error:", error);
      // Fallback data aman jika ada kendala jaringan
      return [
        {
          id: "fb-1",
          title: "Kinerja Emiten Perbankan IDX80 Menguat Didorong Pertumbuhan Kredit",
          description: "Perbankan mencatatkan kenaikan laba bersih solid sepanjang kuartal ini seiring ekspansi portofolio kredit konsumer dan korporasi.",
          imageUrl: TOPIC_FALLBACK_IMAGES.banking,
          source: "CNBC Indonesia",
          published_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          url: "https://www.cnbcindonesia.com/market",
          sentiment: "positive",
          sentiment_score: 0.85,
          symbol: "BBCA",
        },
        {
          id: "fb-2",
          title: "Bank Sentral Tahan Suku Bunga Acuan, IHSG Bergerak Konsolidasi",
          description: "Keputusan menahan suku bunga BI-Rate di level stabil memberikan kepastian bagi laju inflasi dan arus modal masuk di bursa saham.",
          imageUrl: TOPIC_FALLBACK_IMAGES.market,
          source: "Kontan",
          published_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          url: "https://investasi.kontan.co.id",
          sentiment: "neutral",
          sentiment_score: 0.0,
          symbol: "IHSG",
        },
        {
          id: "fb-3",
          title: "Sentimen Geopolitik Bayangi Bursa Asia, Sejumlah Saham Energi Terkoreksi",
          description: "Fluktuasi harga minyak mentah dan komoditas global menekan indeks sektor energi setelah reli kenaikan beberapa pekan sebelumnya.",
          imageUrl: TOPIC_FALLBACK_IMAGES.energy,
          source: "Bisnis.com",
          published_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          url: "https://market.bisnis.com",
          sentiment: "negative",
          sentiment_score: -0.75,
          symbol: "ADRO",
        },
      ];
    }
  }

  /**
   * Format item berita ke skema respons JSON frontend
   */
  static formatNewsItem(item) {
    const rawDesc = item.description?.trim();
    const needsFallback = !rawDesc || rawDesc.length < 25 || rawDesc.toLowerCase() === item.title.toLowerCase();
    const description = needsFallback
      ? generateContextualDescription(item.title, item.symbol, item.sentiment)
      : rawDesc;

    return {
      id: item.id,
      title: item.title,
      description,
      imageUrl: item.imageUrl || getFallbackImage(item.title, item.symbol),
      source: item.source,
      published_at: item.publishedAt ? new Date(item.publishedAt).toISOString() : new Date().toISOString(),
      url: item.url,
      sentiment: (item.sentiment || "NEUTRAL").toLowerCase(), // "positive" | "neutral" | "negative"
      sentiment_score: item.sentimentScore ? Number(item.sentimentScore) : 0,
      symbol: item.symbol || null,
    };
  }
}


