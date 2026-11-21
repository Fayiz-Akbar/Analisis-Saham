import { Router } from "express";
import {
  searchStocks,
  getAllStocks,
  screenStocks,
  getStockQuote,
  getStockHistory,
  getStockFundamentals,
  getStockDetail,
  getTickerTape,
  getMarketOverview,
  getStockFinancialHistory,
  getStockProfile,
  syncIdx80Endpoint,
} from "../controllers/stockController.js";
import { getLatestNews } from "../controllers/newsController.js";

const router = Router();

// Endpoint sinkronisasi otomatis daftar konstituen IDX80 & deteksi delisting
router.get("/sync-idx80", syncIdx80Endpoint);
router.post("/sync-idx80", syncIdx80Endpoint);

// Endpoint Ringkasan Indeks Pasar (Market Overview: IHSG, IDX80)
router.get("/market-overview", getMarketOverview);

// Endpoint ticker tape ringkasan pasar terpopuler
router.get("/ticker-tape", getTickerTape);

// Endpoint pencarian saham (Search bar autocomplete)
router.get("/search", searchStocks);

// Endpoint penyaringan saham IDX80 dengan filter fundamental & null-safe query
router.get("/screener", screenStocks);

// Endpoint katalog seluruh saham (IDX80)
router.get("/", getAllStocks);

// Endpoint quote harga terkini saham
router.get("/:symbol/quote", getStockQuote);

// Endpoint data historis candlestick OHLCV (TradingView Lightweight Charts)
router.get("/:symbol/history", getStockHistory);

// Endpoint rasio 4 pilar & laporan keuangan fundamental
router.get("/:symbol/fundamentals", getStockFundamentals);

// Endpoint laporan keuangan historis multi-tahun & kuartalan riil
router.get("/:symbol/financial-history", getStockFinancialHistory);

// Endpoint profil & penjelasan bisnis perusahaan dari Yahoo Finance API
router.get("/:symbol/profile", getStockProfile);

// Endpoint berita spesifik emiten dengan label sentimen
router.get("/:symbol/news", (req, res, next) => {
  req.query.symbol = req.params.symbol;
  return getLatestNews(req, res, next);
});

// Endpoint detail komprehensif saham
router.get("/:symbol", getStockDetail);

export default router;
