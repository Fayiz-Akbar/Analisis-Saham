import { Router } from "express";
import {
  searchStocks,
  getAllStocks,
  getStockQuote,
  getStockHistory,
  getStockFundamentals,
  getStockDetail,
  getTickerTape,
  getMarketOverview,
} from "../controllers/stockController.js";
import { getLatestNews } from "../controllers/newsController.js";

const router = Router();

// Endpoint Ringkasan Indeks Pasar (Market Overview: IHSG, LQ45)
router.get("/market-overview", getMarketOverview);

// Endpoint ticker tape ringkasan pasar terpopuler
router.get("/ticker-tape", getTickerTape);

// Endpoint pencarian saham (Search bar autocomplete)
router.get("/search", searchStocks);

// Endpoint katalog seluruh saham (IDX80)
router.get("/", getAllStocks);

// Endpoint quote harga terkini saham
router.get("/:symbol/quote", getStockQuote);

// Endpoint data historis candlestick OHLCV (TradingView Lightweight Charts)
router.get("/:symbol/history", getStockHistory);

// Endpoint rasio 4 pilar & laporan keuangan fundamental
router.get("/:symbol/fundamentals", getStockFundamentals);

// Endpoint berita spesifik emiten dengan label sentimen
router.get("/:symbol/news", (req, res, next) => {
  req.query.symbol = req.params.symbol;
  return getLatestNews(req, res, next);
});

// Endpoint detail komprehensif saham
router.get("/:symbol", getStockDetail);

export default router;
