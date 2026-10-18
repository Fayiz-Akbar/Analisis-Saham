import { NewsService } from "../services/newsService.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Mengambil Arus Berita Finansial Terkini dengan Label Sentimen
 * GET /api/news/latest
 * GET /api/news?limit=6&symbol=BBCA&sentiment=positive
 */
export const getLatestNews = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 50);
    const symbol = req.query.symbol?.trim()?.toUpperCase() || null;
    const sentiment = req.query.sentiment?.trim()?.toLowerCase() || null;

    const newsList = await NewsService.getLatestFinancialNews(limit, symbol, sentiment);

    return sendSuccess(res, 200, "Arus berita finansial terkini berhasil dimuat", newsList);
  } catch (error) {
    console.error("Error getLatestNews controller:", error);
    return sendError(res, 500, "Gagal memuat arus berita finansial terkini.");
  }
};
