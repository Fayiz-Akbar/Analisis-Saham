Siap. Saya gabungkan PRD awalmu + Stock Comparison + Investment Learning + AI Investment Tutor menjadi satu PRD terbaru yang lebih konsisten. Saya juga merapikan struktur halaman, functional requirements, database, API, evaluasi, MVP, dan research contribution supaya bisa langsung kamu jadikan PRD utama untuk pengembangan dan dasar proposal skripsi.

Pendekatan AI yang tetap dipakai adalah context-grounded, karena LLM diberi data finansial yang relevan terlebih dahulu sebelum menghasilkan penjelasan; pendekatan grounding pada data finansial memang menjadi area yang relevan untuk mengurangi ketergantungan pada pengetahuan statis model. 

PRODUCT REQUIREMENTS DOCUMENT (PRD)

AI-Powered Fundamental Investment Analyzer

Status: Final Draft — Updated
Platform: Web Application
Target Pengguna: Investor Ritel (Investor Pemula dan Investor Berpengalaman dalam Analisis Saham)
Fokus: Analisis Fundamental Komprehensif, Edukasi Investasi, dan Efisiensi Riset Berbasis Data & AI
Instrumen Utama: Saham Bursa Efek Indonesia (IDX)

⸻

1. Executive Summary

Pasar modal Indonesia (BEI/IDX) mengalami pertumbuhan pesat partisipasi investor ritel. Namun, investor ritel—baik investor pemula yang baru memulai maupun investor yang telah memiliki pengalaman dalam melakukan analisis saham—menghadapi tantangan signifikan dalam mengolah dan menginterpretasikan data investasi yang kompleks, granular, dan terfragmentasi.

Data pasar modal tersedia dalam berbagai format dan tersebar di berbagai platform terpisah, mulai dari laporan keuangan berkala emiten, puluhan indikator dan rasio fundamental, tren pergerakan harga historis, keterbukaan informasi, hingga dinamika berita ekonomi dan sentimen pasar.

Permasalahan ini memengaruhi kedua profil investor ritel dengan dimensi tantangan yang berbeda:

1. Bagi Investor Ritel Pemula:
* Kesulitan memahami istilah finansial, konsep valuasi, dan arti rasio fundamental (seperti PER, PBV, ROE, DER);
* Sulit menilai kondisi kesehatan keuangan perusahaan secara objektif;
* Kurangnya pemahaman mengenai manajemen risiko dan bahaya konsentrasi portofolio;
* Membutuhkan media pembelajaran yang terstruktur dan interaktif untuk membangun pemahaman bertahap.

2. Bagi Investor Ritel Berpengalaman (Experienced Retail Investors):
* Menghadapi inefisiensi waktu riset yang besar akibat fragmentasi data; mereka harus mengumpulkan dan mengekstrak data dari berbagai sumber berbeda secara manual (laporan keuangan IDX, RTI, portal berita, dan spreadsheet komparasi);
* Sulit melakukan perbandingan fundamental multi-emiten sejenis (peer comparison) secara cepat, menyeluruh, dan tersinkronisasi dalam satu tampilan terpadu;
* Membutuhkan evaluasi portofolio yang terukur (seperti diversifikasi sektoral dan skor konsentrasi risiko);
* Membutuhkan asisten analisis berbasis AI (context-grounded) yang dapat mensintesis data fundamental dan sentimen berita terkini secara cepat dan faktual tanpa halusinasi, sehingga mempercepat pengambilan keputusan analisis mandiri.

Oleh karena itu, proyek ini bertujuan membangun AI-Powered Fundamental Investment Analyzer, yaitu aplikasi web yang mengintegrasikan:

* market data;
* historical price;
* fundamental data;
* company news;
* stock comparison;
* portfolio tracking;
* watchlist;
* DCA simulation;
* portfolio risk analysis;
* investment education;
* AI financial assistant;
* AI investment tutor.

Sistem tidak dirancang untuk melakukan transaksi saham secara langsung dan tidak memberikan rekomendasi beli/jual sebagai keputusan investasi otomatis.

Sistem berfungsi sebagai:

Educational & Analytical Investment Platform

Sistem dirancang untuk melayani spektrum penuh investor ritel: berfungsi sebagai sarana edukasi interaktif bagi investor pemula sekaligus platform riset fundamental yang efisien dan mendalam bagi investor berpengalaman. LLM digunakan sebagai asisten analisis dan tutor edukasi yang memperoleh konteks dari data yang dikumpulkan sistem. Dengan pendekatan context-grounded generation, AI diarahkan menghasilkan penjelasan dan sintesis berdasarkan data yang tersedia secara faktual, bukan membuat keputusan investasi secara spekulatif atau mandiri.

⸻

2. Problem Statement

Sistem dikembangkan untuk menyelesaikan beberapa permasalahan yang dihadapi investor ritel di pasar modal:

1. Fragmentasi Sumber Data Finansial: Data harga saham, laporan keuangan fundamental, dan berita pasar berada pada sumber yang berbeda dan terpisah, menyulitkan proses riset terpadu bagi investor berpengalaman maupun pemula.
2. Kompleksitas Pemahaman Rasio Fundamental bagi Pemula: Investor pemula kesulitan menginterpretasikan indikator keuangan dan dampaknya terhadap valuasi perusahaan tanpa bimbingan edukasi yang kontekstual.
3. Inefisiensi Komparasi Saham bagi Investor Berpengalaman: Investor berpengalaman membutuhkan waktu lama untuk membandingkan metrik fundamental antara beberapa saham kompetitor dalam satu industri secara manual.
4. Kebutuhan Cara Efisien Memahami Data Finansial Kompleks: Pengguna membutuhkan representasi visual dan sintesis ringkas data keuangan yang kompleks untuk mempercepat evaluasi emiten.
5. Keterbatasan Simulasi Investasi yang Realistis: Pengguna kesulitan memodelkan strategi investasi rutin (Dollar Cost Averaging / DCA) berdasarkan data historis aktual yang memperhitungkan mekanisme perdagangan berbasis lot saham di Indonesia.
6. Kurangnya Analisis Risiko Konsentrasi Portofolio: Investor pemula sering tidak menyadari risiko konsentrasi aset, sementara investor berpengalaman membutuhkan metrik objektif (seperti konsentrasi bobot dan diversifikasi sektor) untuk menjaga profil risiko portofolio.
7. Kebutuhan Modul Edukasi Terstruktur & Referensi Praktis: Investor pemula memerlukan kurikulum belajar bertahap, sementara investor berpengalaman memerlukan referensi cepat terkait konsep valuasi dan metrik keuangan.
8. Tantangan Penggunaan API Eksternal: Pengambilan data pasar dan berita secara langsung dari pihak ketiga rentan terhadap kuota rate-limit dan pemborosan request jika tidak dioptimalkan dengan mekanisme caching.
9. Risiko Halusinasi LLM pada Domain Keuangan: Model bahasa besar (LLM) berpotensi mengarang angka atau menghasilkan informasi yang tidak faktual jika tidak dibatasi pada konteks data keuangan yang valid.
10. Kebutuhan Grounding dan Evaluasi Terukur: Diperlukan mekanisme grounding ketat dan kerangka evaluasi (factual consistency, relevansi, completeness) agar respons AI akurat dan dapat diandalkan oleh seluruh pengguna.

⸻

3. Project Objectives

3.1 Tujuan Umum

Membangun aplikasi web berbasis AI yang mengintegrasikan data pasar, fundamental perusahaan, berita keuangan, simulasi investasi, dan materi edukasi untuk membantu investor ritel—baik pemula maupun investor yang telah berpengalaman dalam analisis saham—dalam melakukan riset, komparasi fundamental, pemantauan portofolio, dan analisis investasi saham secara lebih komprehensif, efisien, dan terstruktur.

3.2 Tujuan Khusus

Sistem diharapkan mampu:

1. Mengambil data harga saham terkini.
2. Mengambil historical market data.
3. Mengambil data fundamental perusahaan.
4. Mengambil berita terkait perusahaan dan pasar modal.
5. Menampilkan data melalui dashboard interaktif yang informatif.
6. Menyediakan pencarian saham yang responsif.
7. Menyediakan stock screener berbasis kriteria fundamental untuk menyaring saham potensial.
8. Menyediakan detail analisis saham yang komprehensif.
9. Membandingkan beberapa saham secara side-by-side (Stock Comparison).
10. Menyediakan watchlist untuk memantau saham pilihan.
11. Menyediakan pencatatan portfolio transaksi saham.
12. Menghitung keuntungan dan kerugian (realized & unrealized P/L) portfolio.
13. Menyediakan simulasi DCA berbasis lot dan data historis.
14. Mengukur tingkat diversifikasi dan risiko konsentrasi portfolio (Investment Health).
15. Menyediakan materi edukasi investasi terstruktur dan kuis pemahaman.
16. Menyediakan AI financial assistant untuk sintesis data fundamental dan sentimen berita.
17. Menyediakan AI investment tutor untuk penjelasan konsep dan literasi investasi.
18. Menggunakan context-grounded AI untuk memastikan akurasi respons.
19. Mengevaluasi factual consistency dan hallucination AI secara terukur.
20. Menggunakan caching untuk mengurangi request API eksternal dan meningkatkan performa sistem.

⸻

4. Target Users

Target pengguna sistem adalah **Investor Ritel Pasar Modal Indonesia (IDX)**, yang mencakup dua segmen pengguna utama:

4.1 Investor Ritel Pemula (Beginner Retail Investors)

Profil dan kebutuhan:
* Individu atau mahasiswa yang baru mulai berinvestasi atau ingin memperdalam literasi keuangan pasar modal;
* Membutuhkan kurikulum edukasi terstruktur (konsep dasar, terminologi pasar, rasio keuangan, kuis interaktif);
* Mengandalkan AI Investment Tutor untuk menjelaskan istilah-istilah sulit dan konsep valuasi dalam bahasa yang mudah dipahami;
* Membutuhkan visualisasi data yang ramah pengguna (chart pergerakan harga, kartu rasio fundamental dengan indikator warna/kategori);
* Ingin menguji strategi investasi rutin (DCA Simulator) sebelum menerapkannya di pasar nyata;
* Membutuhkan panduan dasar dalam memahami diversifikasi aset dan risiko konsentrasi portofolio.

4.2 Investor Ritel Berpengalaman (Experienced Retail Investors)

Profil dan kebutuhan:
* Investor ritel yang telah aktif di pasar modal dan memiliki pengalaman dalam menganalisis laporan keuangan serta valuasi saham;
* Membutuhkan efisiensi riset untuk mengatasi masalah fragmentasi data dari berbagai sumber terpisah;
* Membutuhkan fitur Stock Screener berbasis filter kriteria fundamental (seperti PE, PBV, ROE, DER, Market Cap) untuk menemukan peluang investasi;
* Membutuhkan fitur Stock Comparison multi-emiten secara side-by-side untuk menganalisis kompetitor industri;
* Menggunakan AI Financial Assistant sebagai co-pilot analisis untuk merangkum sentimen berita terkini, mengevaluasi highlight laporan keuangan, dan mendeteksi anomali kinerja emiten secara cepat dan grounded;
* Memerlukan analisis kesehatan portofolio (Investment Health) untuk mengaudit eksposur sektor, bobot konsentrasi aset, dan profil diversifikasi portofolio mereka;
* Membutuhkan watchlist dan portfolio tracker terorganisir untuk memonitor kinerja portofolio riil mereka secara terpadu.

⸻

5. Product Positioning

Produk diposisikan sebagai:

AI-powered investment education and analysis platform for Indonesian stocks.

Platform ini memadukan dua proposisi nilai utama:
1. Sebagai Media Edukasi Terstruktur bagi investor pemula untuk membangun pemahaman dan literasi pasar modal secara bertahap.
2. Sebagai Comprehensive Research & Analysis Workspace bagi investor ritel berpengalaman untuk mempercepat proses riset, screening, komparasi fundamental, evaluasi risiko portofolio, dan sintesis data emiten berbasis AI.

Sistem bukan:

* broker;
* trading platform;
* robo advisor;
* financial advisor profesional;
* automated trading system.

Sistem membantu pengguna:

Learn
  ↓
Search
  ↓
Analyze
  ↓
Compare
  ↓
Simulate
  ↓
Track
  ↓
Understand

⸻

6. Scope Sistem

6.1 In Scope

Sistem mencakup:

* authentication;
* dashboard;
* market & sentiment;
* stock screener;
* stock detail;
* stock comparison;
* watchlist;
* portfolio;
* portfolio transactions;
* DCA simulator;
* investment health;
* investment learning;
* AI financial assistant;
* AI investment tutor;
* market data;
* historical data;
* fundamental data;
* company news;
* caching;
* AI evaluation.

6.2 Out of Scope

Sistem tidak mencakup:

* transaksi jual/beli langsung;
* koneksi broker;
* koneksi RDN;
* penyimpanan dana;
* eksekusi order;
* automated trading;
* high-frequency trading;
* prediksi harga saham;
* sinyal trading otomatis;
* rekomendasi Buy/Sell otomatis;
* financial advice profesional;
* data tick-by-tick sebagai kebutuhan utama.

⸻

7. Technology Stack

Frontend

React

Digunakan untuk:

* component-based UI;
* routing;
* state management;
* interactive dashboard.

Tailwind CSS

Digunakan untuk:

* responsive layout;
* cards;
* tables;
* forms;
* navigation;
* modal;
* dashboard.

TradingView Lightweight Charts

Digunakan untuk:

* candlestick;
* historical price;
* volume;
* price movement.

⸻

8. Backend

Node.js + Express.js

Backend berfungsi sebagai:

* API Gateway;
* Business Logic Layer;
* Authentication Layer;
* AI orchestration;
* External API integration.

Service Layer

services/
│
├── AuthService
├── MarketDataService
├── FundamentalService
├── NewsService
├── StockComparisonService
├── PortfolioService
├── WatchlistService
├── DCAService
├── RiskService
├── LearningService
├── AIService
└── CacheService

Frontend tidak berkomunikasi langsung dengan API eksternal yang memiliki API key.

⸻

9. Database

PostgreSQL

Digunakan untuk:

* users;
* stocks;
* watchlists;
* transactions;
* portfolio-related data;
* learning content;
* learning progress;
* quiz;
* news cache;
* API cache.

Prisma ORM

Digunakan untuk:

* schema;
* migration;
* relationship;
* query;
* type-safe database access.

⸻

10. External API Architecture

Sistem tidak dikunci pada satu market-data provider.

MarketDataService
        ↓
Market Data Provider
        ↓
IDX Data

Kandidat provider dapat mencakup:

* Sectors.app;
* Twelve Data;
* Finnhub;
* provider lain yang memiliki dukungan data IDX dan lisensi yang sesuai.

Pemilihan final dilakukan berdasarkan:

* coverage ticker IDX;
* historical data;
* fundamental;
* rate limit;
* harga;
* stabilitas;
* dokumentasi;
* izin penggunaan;
* kebutuhan akademik.

⸻

11. Data Requirements

11.1 Market Data

Minimal:

* symbol;
* open;
* high;
* low;
* close;
* adjusted close jika tersedia;
* volume;
* change;
* percentage change;
* timestamp.

11.2 Historical Data

Minimal:

* date;
* open;
* high;
* low;
* close;
* volume.

Digunakan untuk:

* chart;
* historical analysis;
* DCA simulation;
* performance comparison.

11.3 Fundamental Data

Minimal:

Valuation

* PE;
* PB.

Profitability

* ROE;
* ROA;
* Net Margin.

Growth

* Revenue Growth;
* Net Income Growth.

Leverage

* Debt-to-Equity.

Financial Performance

* Revenue;
* Net Income;
* EPS.

Additional

* Market Cap;
* Book Value;
* Dividend information jika tersedia.

Jika rasio tidak tersedia langsung dari provider, backend dapat menghitung rasio dari komponen data keuangan yang tersedia.

⸻

12. AI Engine

Google Gemini API

AI digunakan sebagai:

Financial Analysis Assistant

Untuk:

* menjelaskan fundamental;
* menjelaskan rasio;
* merangkum berita;
* menjelaskan sentimen;
* menjelaskan risiko;
* menjelaskan hasil simulasi;
* menjelaskan portfolio.

Investment Tutor

Untuk:

* menjelaskan konsep investasi;
* membantu memahami istilah;
* memberikan contoh sederhana;
* menjelaskan materi pembelajaran;
* membantu menjawab pertanyaan edukasi.

⸻

13. AI Context-Grounded Architecture

AI tidak mengambil data saham secara bebas.

Workflow:

User Question
      ↓
Express Backend
      ↓
Determine Context
      ↓
Retrieve Relevant Data
      ↓
┌─────────────────────┐
│ Market Data         │
│ Fundamental Data    │
│ News                │
│ Historical Data     │
│ Portfolio Data      │
│ Learning Content    │
└─────────┬───────────┘
          ↓
    Context Builder
          ↓
      Gemini API
          ↓
    Structured Output
          ↓
       Frontend

Contoh context:

{
  "symbol": "BBCA",
  "company": "PT Bank Central Asia Tbk",
  "price": {
    "current": 8850,
    "change_percent": 1.25
  },
  "fundamental": {
    "pe": 18.5,
    "roe": 23.4,
    "roa": 3.2,
    "debt_to_equity": 0.12
  },
  "news": [
    {
      "title": "Example News",
      "source": "Example Source",
      "date": "2026-08-20"
    }
  ]
}

AI hanya diperbolehkan menggunakan informasi yang tersedia pada context.

Jika informasi tidak tersedia:

“Informasi tersebut tidak tersedia pada data yang digunakan sistem.”

⸻

14. AI Hallucination Control

Sistem tidak mengklaim hallucination dapat dihilangkan 100%.

Strategi:

1. Context grounding.
2. Structured context.
3. System instruction.
4. Source limitation.
5. Output validation.
6. Structured output.
7. Factual consistency evaluation.

AI tidak diperbolehkan:

* mengarang angka;
* mengarang berita;
* membuat data fundamental;
* mengklaim data yang tidak tersedia;
* memberikan keputusan Buy/Sell otomatis.

⸻

15. Information Architecture / Main Pages

Aplikasi terdiri dari:

Authentication
│
├── Login
└── Register
Main Application
│
├── Dashboard
│
├── Market
│   └── Market & Sentiment
│
├── Analyze
│   ├── Stock Screener
│   ├── Stock Detail
│   └── Stock Comparison
│
├── Investment
│   ├── Watchlist
│   ├── Portfolio
│   ├── DCA Simulator
│   └── Investment Health
│
├── Education
│   ├── Learn Investment
│   ├── Learning Detail
│   └── Quiz
│
├── AI Assistant
│
└── Settings

⸻

16. Functional Requirements

A. Authentication

Route

/login
/register

Register

Input:

* name;
* email;
* password;
* confirm password.

Validasi:

* email valid;
* password minimal 8 karakter;
* email tidak duplikat.

Password disimpan menggunakan bcrypt.

Login

Email
 ↓
Database
 ↓
Password Verification
 ↓
JWT
 ↓
Authenticated Session

⸻

B. Dashboard

Route

/dashboard

Dashboard menampilkan:

Portfolio Summary

* Total Portfolio Value;
* Total Invested;
* Profit/Loss;
* Return %.

Portfolio Allocation

Berdasarkan:

* saham;
* sektor.

Watchlist

Menampilkan beberapa saham yang dipantau.

Market Summary

* IHSG;
* gainers;
* losers.

Latest News

Berita finansial terbaru.

Quick Actions

* Search Stock;
* Compare Stocks;
* Add Portfolio;
* DCA Simulator;
* Learn Investment.

Dashboard menjadi central overview aplikasi.

⸻

C. Global Market & Sentiment

Route

/market-sentiment

Menampilkan:

* IHSG;
* market summary;
* top gainers;
* top losers;
* volume;
* market movement;
* economic news;
* market sentiment.

AI Macro Assistant

Contoh:

“Bagaimana kondisi pasar hari ini?”

Context:

Market Data
+
Latest News
+
Macro Data jika tersedia

Output:

Market Sentiment
Positive / Neutral / Negative
Summary
...
Main Factors
1. ...
2. ...
3. ...

⸻

D. Stock Screener

Route

/screener

Fitur:

* Search ticker;
* company;
* sector;
* industry;
* market cap;
* PE;
* PB;
* ROE;
* ROA;
* Debt-to-Equity;
* Dividend Yield.

Contoh:

Sector = Banking
ROE > 15%
Market Cap > ...

Sistem menampilkan saham yang sesuai berdasarkan data yang tersedia.

Index List

Jika tersedia:

* LQ45;
* IDX30;
* IDX80.

⸻

E. Stock Detail

Route

/saham/:symbol

Contoh:

/saham/BBCA

Ini merupakan core analysis page.

Company Overview

* symbol;
* company name;
* sector;
* industry;
* market cap.

Price

* current price;
* daily change;
* percentage change;
* volume.

Historical Chart

* candlestick;
* volume;
* historical price;
* timeframe.

Fundamental

Valuation

* PE;
* PB.

Profitability

* ROE;
* ROA;
* Net Margin.

Growth

* Revenue Growth;
* Net Income Growth.

Leverage

* Debt-to-Equity.

Financial Performance

* Revenue;
* Net Income;
* EPS.

News

* title;
* source;
* date;
* thumbnail;
* URL;
* summary.

AI Analysis

User dapat bertanya:

“Bagaimana kondisi fundamental perusahaan ini?”

AI menjawab berdasarkan context.

Actions

* Add Watchlist;
* Add Portfolio;
* Compare.

⸻

F. Stock Comparison

Route

/compare

User dapat memilih:

2–4 saham.

Contoh:

BBCA
BBRI
BMRI

Comparison Categories

Price

* current price;
* daily change;
* market cap.

Valuation

* PE;
* PB.

Profitability

* ROE;
* ROA;
* Net Margin.

Growth

* Revenue Growth;
* Net Income Growth.

Financial

* EPS;
* Revenue;
* Net Income.

Leverage

* Debt-to-Equity.

Dividend

* Dividend Yield jika tersedia.

Historical Performance

Membandingkan historical performance dalam timeframe yang sama.

Volatility

Jika data tersedia.

⸻

Visual Comparison

Data dapat ditampilkan melalui:

* comparison table;
* bar chart;
* line chart;
* metric cards.

Contoh:

ROE
BBCA ███████████████████ 23%
BBRI █████████████████   21%
BMRI ██████████████████  22%

⸻

AI Comparison Assistant

User dapat bertanya:

“Apa perbedaan fundamental ketiga saham ini?”

Context:

BBCA
+
BBRI
+
BMRI

AI memberikan:

* perbedaan valuation;
* profitability;
* growth;
* leverage;
* historical performance;
* faktor yang perlu diperhatikan.

AI tidak memberikan keputusan otomatis:

❌ “Beli BBCA.”

Tetapi:

✅ “BBCA memiliki ROE lebih tinggi berdasarkan data yang tersedia, sementara …”

⸻

G. Watchlist

Route

/watchlist

User dapat:

* add stock;
* remove stock;
* view latest price;
* daily change;
* open Stock Detail;
* compare.

Watchlist bersifat personal berdasarkan user_id.

⸻

H. Portfolio

Route

/portfolio

Portfolio Summary

* Total Value;
* Total Invested;
* Profit/Loss;
* Return %.

Holdings

Menampilkan:

* symbol;
* company;
* quantity;
* average buy price;
* current price;
* invested value;
* current value;
* profit/loss;
* return percentage.

Portfolio Allocation

Berdasarkan:

* stock;
* sector.

Transaction History

* BUY;
* SELL;
* price;
* lot;
* date.

⸻

I. Portfolio Transaction

User dapat memasukkan:

Symbol
Buy/Sell
Price
Lot Quantity
Transaction Date

Contoh:

BBCA
BUY
Rp8.000
2 lot
20 Agustus 2026

Jumlah saham:

2 × 100
= 200 lembar

Sistem menyimpan transaksi.

Dari transaksi tersebut sistem menghitung:

* total quantity;
* average buy price;
* realized P/L;
* unrealized P/L.

⸻

J. DCA Simulator

Route

/dca

Input:

* stock;
* monthly investment;
* period;
* investment date;
* simulation mode.

Contoh:

Stock
BBCA
Monthly Investment
Rp200.000
Period
12 months

Workflow:

Monthly Investment
        ↓
Historical Price
        ↓
Simulated Purchase
        ↓
Shares / Lot
        ↓
Total Investment
        ↓
Current Value
        ↓
Profit/Loss

⸻

Realistic Lot Mode

Karena saham Indonesia diperdagangkan dalam satuan lot:

1 lot = 100 shares

Sistem menyediakan simulasi berdasarkan lot.

Jika dana tidak cukup:

Remaining Cash
       ↓
Accumulated
       ↓
Next Month

Output:

* total modal;
* total lot;
* total shares;
* remaining cash;
* current value;
* profit/loss;
* return percentage.

⸻

K. Investment Health

Route

/investment-health

Sistem memberikan skor edukatif:

0–30    High Risk
31–60   Moderate
61–80   Good
81–100  Well Diversified

Factors

* number of stocks;
* stock concentration;
* sector concentration;
* historical volatility;
* asset concentration;
* diversification.

Contoh:

BBCA = 80%
BBRI = 15%
TLKM = 5%

Sistem mendeteksi:

Konsentrasi portfolio tinggi pada sektor tertentu.

AI menjelaskan kondisi tersebut tanpa memberikan perintah transaksi.

⸻

L. Learn Investment

Route

/learn

Halaman ini berfungsi sebagai investment education center.

Learning Structure

Level 1 — Introduction

Materi:

* Apa itu investasi?
* Apa itu saham?
* Apa itu IDX?
* Apa itu IHSG?
* Apa itu lot?
* Capital Gain;
* Capital Loss;
* Dividen.

Level 2 — Understanding Stocks

* Market Cap;
* Stock Price;
* Volume;
* Volatility;
* Dividend.

Level 3 — Fundamental

* Revenue;
* Net Income;
* EPS;
* ROE;
* ROA;
* PE;
* PB;
* Debt-to-Equity;
* Net Margin.

Level 4 — Stock Analysis

* Fundamental analysis;
* Technical analysis dasar;
* Membaca laporan keuangan;
* Valuation;
* Stock comparison.

Level 5 — Portfolio

* Diversification;
* Concentration;
* Risk;
* Asset allocation;
* Portfolio management.

Level 6 — Investment Strategy

* DCA;
* Lump Sum;
* Long-term investing;
* Dividend investing;
* Value investing.

⸻

M. Learning Detail

Route

/learn/:slug

Contoh:

/learn/apa-itu-roe

Setiap materi memiliki:

* title;
* category;
* difficulty;
* explanation;
* example;
* illustration;
* formula jika diperlukan;
* related topics.

Contoh:

ROE

ROE = Net Income / Equity × 100%

Kemudian diberikan contoh sederhana serta konteks interpretasi praktis sehingga mudah dipahami oleh investor pemula, sekaligus menyediakan rincian formula serta batasan analisis yang presisi sebagai referensi cepat bagi investor berpengalaman.

⸻

N. Investment Quiz

Route

/learn/:slug/quiz

Setelah menyelesaikan materi, user dapat mengerjakan quiz.

Contoh:

Apa fungsi ROE?

A. Mengukur utang
B. Mengukur kemampuan perusahaan menghasilkan laba dari equity
C. Mengukur volume
D. Mengukur harga saham

Sistem dapat menyimpan:

* score;
* completed topics;
* quiz attempts.

Fitur quiz bersifat opsional untuk MVP awal, tetapi sangat bagus untuk memperkuat sisi edukasi.

⸻

O. AI Investment Tutor

AI memiliki mode khusus untuk edukasi.

Route

/ai/tutor

User dapat bertanya:

“Saya belum mengerti PE Ratio.”

AI menjelaskan dengan bahasa sederhana.

Contoh:

PE Ratio
   ↓
Definisi
   ↓
Formula
   ↓
Contoh
   ↓
Cara membaca
   ↓
Hal yang perlu diperhatikan

AI Tutor menggunakan:

Learning Content
+
Educational Context

sehingga penjelasan tetap mengikuti materi yang tersedia di sistem.

⸻

P. AI Financial Assistant

AI juga tersedia di halaman analisis.

Stock Context

Price
+
Fundamental
+
News
+
Historical Data

Portfolio Context

Holdings
+
Allocation
+
Transactions
+
Risk Score

Comparison Context

Stock A
+
Stock B
+
Stock C

DCA Context

Investment
+
Historical Data
+
Simulation Result

⸻

Q. Settings

Route

/settings

Isi:

* profile;
* email;
* password;
* notification preferences;
* logout.

⸻

17. AI Interaction Rules

AI harus:

Allowed

* menjelaskan data;
* membandingkan data;
* menjelaskan risiko;
* menjelaskan fundamental;
* merangkum berita;
* menjelaskan historical simulation;
* mengajarkan konsep investasi.

Not Allowed

* memberikan Buy/Sell otomatis;
* mengarang angka;
* mengarang berita;
* menjamin keuntungan;
* memprediksi harga sebagai fakta;
* mengklaim sebagai financial advisor;
* menggunakan informasi di luar context untuk mengisi angka finansial.

⸻

18. Database Schema

Users

id
name
email
password_hash
created_at
updated_at

⸻

Stocks

symbol PK
company_name
sector
industry
exchange
created_at
updated_at

⸻

Watchlists

id PK
user_id FK
symbol FK
created_at

Constraint:

UNIQUE(user_id, symbol)

⸻

19. Portfolio Transactions

id PK
user_id FK
symbol FK
transaction_type
price
lot_quantity
transaction_date
created_at

Transaction type:

BUY
SELL

⸻

20. API Cache

id PK
provider
data_type
symbol
response_data JSONB
fetched_at
expires_at

Contoh:

provider = market_provider
data_type = quote
symbol = BBCA

⸻

21. News Cache

id PK
symbol FK
title
description
source
url
published_at
cached_at

⸻

22. Learning Content

Tambahan karena adanya halaman belajar.

id PK
title
slug
category
difficulty
content
estimated_minutes
created_at
updated_at

Category:

BEGINNER
FUNDAMENTAL
ANALYSIS
PORTFOLIO
STRATEGY

Difficulty:

BEGINNER
INTERMEDIATE
ADVANCED

⸻

23. Learning Progress

id PK
user_id FK
content_id FK
completed
completed_at

Constraint:

UNIQUE(user_id, content_id)

⸻

24. Quiz

id PK
content_id FK
question
option_a
option_b
option_c
option_d
correct_answer
explanation

⸻

25. Quiz Attempt

id PK
user_id FK
quiz_id FK
answer
is_correct
created_at

⸻

26. API Caching Strategy

Caching digunakan untuk:

* mengurangi API request;
* mengurangi rate limit;
* meningkatkan response time;
* mengurangi ketergantungan terhadap provider.

Quote

TTL:

beberapa menit

Historical Data

TTL:

sekitar 24 jam

Fundamental

TTL:

beberapa hari

Company Profile

TTL:

beberapa hari hingga minggu

News

TTL:

15–60 menit

TTL final mengikuti karakteristik provider.

⸻

27. API Flow

Contoh:

GET /api/stocks/BBCA

Workflow:

React
 ↓
Express
 ↓
Check Cache
 ↓
Cache Valid?
 ├── YES
 │    ↓
 │ Return Cache
 │
 └── NO
      ↓
 Market Data API
      ↓
 Validate Response
      ↓
 PostgreSQL Cache
      ↓
 Return Data

⸻

28. API Endpoint Design

Authentication

POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

Stocks

GET /api/stocks
GET /api/stocks/search?q=BBCA
GET /api/stocks/:symbol
GET /api/stocks/:symbol/quote
GET /api/stocks/:symbol/history
GET /api/stocks/:symbol/fundamentals
GET /api/stocks/:symbol/news

Comparison

POST /api/stocks/compare

Request:

{
  "symbols": [
    "BBCA",
    "BBRI",
    "BMRI"
  ]
}

⸻

Portfolio

GET    /api/portfolio
POST   /api/portfolio/transactions
DELETE /api/portfolio/transactions/:id

Watchlist

GET    /api/watchlist
POST   /api/watchlist
DELETE /api/watchlist/:symbol

DCA

POST /api/dca/simulate

Investment Health

GET /api/portfolio/health

Learning

GET /api/learning
GET /api/learning/:slug
GET /api/learning/:id/quiz
POST /api/learning/:id/progress
POST /api/learning/:id/quiz/submit

AI

POST /api/ai/stock-analysis
POST /api/ai/stock-comparison
POST /api/ai/market-analysis
POST /api/ai/portfolio-analysis
POST /api/ai/dca-analysis
POST /api/ai/tutor

⸻

29. Security Requirements

Authentication

JWT.

Password

bcrypt hashing.

API Keys

API key tidak boleh berada di frontend.

❌ Salah:

React
 ↓
GEMINI_API_KEY

✅ Benar:

React
 ↓
Express
 ↓
Gemini API

Environment variables:

GEMINI_API_KEY
MARKET_DATA_API_KEY
NEWS_API_KEY
DATABASE_URL
JWT_SECRET

⸻

30. Error Handling

API Timeout

503 Service Unavailable

Rate Limit

429 Too Many Requests

Cache digunakan sebagai fallback jika data masih tersedia.

Stock Not Found

404 Stock Not Found

AI Error

Jika Gemini gagal:

AI service temporarily unavailable.

Data utama tetap dapat ditampilkan.

Learning Content Error

Jika materi gagal dimuat:

Learning content temporarily unavailable.

⸻

31. Non-Functional Requirements

Performance

Target:

Cached request < 1–2 seconds

Target ini harus divalidasi melalui pengujian.

Availability

Sistem tetap dapat menampilkan cached data ketika provider eksternal mengalami gangguan sementara.

Scalability

Service Layer memungkinkan market data provider diganti tanpa mengubah frontend.

Maintainability

Struktur:

controllers/
services/
repositories/
middlewares/
routes/
utils/
models/

⸻

32. AI Evaluation

Salah satu bagian penelitian adalah menguji kualitas AI.

Dataset pertanyaan dapat mencakup:

Fundamental

Apa kondisi fundamental perusahaan?

Ratio

Bagaimana kondisi ROE perusahaan?

Risk

Apa risiko berdasarkan data yang tersedia?

News

Apa sentimen berita terbaru?

Comparison

Apa perbedaan fundamental BBCA dan BBRI?

Education

Apa itu PE Ratio?

⸻

Evaluation Metrics

Relevance

Apakah jawaban sesuai pertanyaan?

Factual Consistency

Apakah angka dan fakta sesuai context?

Completeness

Apakah informasi penting dari context digunakan?

Hallucination

Apakah AI menghasilkan informasi yang tidak terdapat pada context?

Educational Clarity & Analytical Quality

Untuk AI Tutor:
* Apakah penjelasan konsep mudah dipahami oleh investor pemula tanpa mereduksi esensi keilmuan finansial?

Untuk AI Financial Assistant:
* Apakah sintesis data emiten, komparasi fundamental, dan analisis portofolio faktual, tajam, dan bernilai guna bagi investor berpengalaman?

⸻

33. Cache Performance Evaluation

Sistem diuji dalam dua kondisi.

Tanpa Cache

100 User Requests
       ↓
100 API Requests

Dengan Cache

100 User Requests
       ↓
Cache
       ↓
1 atau beberapa API Requests

Parameter:

* API requests;
* response time;
* cache hit;
* cache miss;
* error rate.

Metric:

Cache Hit Ratio
=
Cache Hit
────────────── × 100%
Total Request

⸻

34. DCA Evaluation

Skenario:

Investment

* Rp100.000/bulan;
* Rp200.000/bulan;
* Rp500.000/bulan.

Period

* 6 bulan;
* 12 bulan;
* 24 bulan.

Output:

* total modal;
* jumlah saham;
* total lot;
* dana tersisa;
* nilai sekarang;
* profit/loss;
* return percentage.

⸻

35. Stock Comparison Evaluation

Sistem diuji menggunakan beberapa kelompok saham.

Contoh:

Scenario A

BBCA vs BBRI

Scenario B

BBCA vs BBRI vs BMRI

Scenario C

BBCA vs TLKM vs ASII vs UNVR

Parameter:

* correctness;
* completeness;
* comparison accuracy;
* response time.

Untuk AI comparison:

Apakah kesimpulan AI sesuai dengan data comparison yang diberikan?

⸻

36. Portfolio Risk Evaluation

Scenario A

100% satu saham

Expected:

High Concentration

Scenario B

50% Banking
30% Consumer
20% Infrastructure

Expected:

Moderate Concentration

Scenario C

20% Banking
20% Consumer
20% Infrastructure
20% Energy
20% Healthcare

Expected:

Higher Diversification

Skor merupakan indikator edukatif, bukan prediksi risiko absolut.

⸻

37. Learning Evaluation

Untuk fitur edukasi dapat dilakukan pengujian sederhana:

Learning Completion

Mengukur:

* jumlah materi selesai;
* jumlah quiz dikerjakan;
* completion rate.

Quiz Performance

Score =
Correct Answer
─────────────── × 100%
Total Question

Jika diperlukan dalam penelitian, dapat dilakukan pre-test vs post-test untuk melihat apakah materi membantu meningkatkan pemahaman pengguna.

⸻

38. User Journey

Sistem mendukung dua alur interaksi (user journey) utama yang disesuaikan dengan kebutuhan dan kesiapan pengetahuan pengguna:

A. User Journey: Investor Ritel Pemula (Fokus: Literasi, Eksplorasi Terbimbing & Simulasi)

Register / Login
   ↓
Dashboard (Melihat gambaran pasar modal & indikator tren sederhana)
   ↓
Learn Investment (Mempelajari konsep dasar investasi & rasio fundamental per level)
   ↓
Quiz (Menguji pemahaman terhadap materi pembelajaran)
   ↓
Search Stock (Mencari emiten berdasarkan nama perusahaan atau ticker)
   ↓
Stock Detail (Melihat chart harga, ringkasan profil, dan metrik fundamental)
   ↓
Ask AI Tutor / Assistant (Menanyakan penjelasan arti rasio keuangan secara kontekstual)
   ↓
Stock Comparison (Mencoba membandingkan 2 saham sejenis untuk melihat perbedaan valuasi)
   ↓
Run DCA Simulation (Mensimulasikan investasi berkala realistis berbasis lot)
   ↓
Add Watchlist / Portfolio (Menyimpan saham favorit & mencatat transaksi simulasi/nyata)
   ↓
Check Investment Health (Mempelajari skor diversifikasi & risiko konsentrasi portofolio)

B. User Journey: Investor Ritel Berpengalaman (Fokus: Riset Efisien, Screening & Deep-Dive Analisis)

Login
   ↓
Dashboard (Memonitor IHSG, top movers, alokasi portofolio aktif, dan berita terkini)
   ↓
Market & Sentiment (Memantau dinamika makro dan sentimen pasar)
   ↓
Stock Screener (Menyaring emiten berdasarkan kriteria spesifik: sektor, PE, PBV, ROE, DER, dsb.)
   ↓
Stock Comparison (Melakukan perbandingan komparatif multi-emiten sejenis secara side-by-side)
   ↓
Stock Detail (Deep-dive ke laporan keuangan historis, tren profitabilitas, dan pergerakan teknikal)
   ↓
Ask AI Financial Assistant (Meminta sintesis cepat sorotan kinerja emiten dan korelasi sentimen berita)
   ↓
Portfolio Management (Mencatat transaksi beli/jual riil & memantau realized/unrealized P/L)
   ↓
Investment Health (Mengaudit risiko konsentrasi sektoral dan skor diversifikasi portofolio)
   ↓
DCA Simulator (Backtesting strategi akumulasi berkala menggunakan data historis aktual)

⸻

39. Navigation / Sidebar Final

Saya rekomendasikan sidebar final seperti ini:

┌──────────────────────────┐
│  AI INVESTMENT ANALYZER  │
├──────────────────────────┤
│                          │
│  OVERVIEW                │
│  ├─ Dashboard            │
│  └─ Market               │
│                          │
│  ANALYZE                 │
│  ├─ Stock Screener       │
│  ├─ Stock Detail         │
│  └─ Compare Stocks       │
│                          │
│  INVESTMENT              │
│  ├─ Watchlist            │
│  ├─ Portfolio            │
│  ├─ DCA Simulator        │
│  └─ Investment Health    │
│                          │
│  EDUCATION               │
│  └─ Learn Investment     │
│                          │
│  AI                      │
│  └─ AI Assistant         │
│                          │
│  ──────────────────────  │
│  Settings                │
│  Profile                 │
│                          │
└──────────────────────────┘

Stock Detail tidak perlu menjadi menu sidebar utama. User masuk ke Stock Detail melalui Screener, Search, Watchlist, atau Compare.

⸻

40. MVP Scope

Agar skripsi tetap realistis, saya sarankan jangan membangun semua fitur sekaligus.

Phase 1 — Foundation

* Login/Register;
* PostgreSQL;
* Prisma;
* Authentication;
* Stock database;
* Stock Search;
* Stock Detail;
* Historical Chart.

⸻

Phase 2 — Fundamental Analysis

* Fundamental Metrics;
* Company Profile;
* Company News;
* Stock Screener.

⸻

Phase 3 — Investment Management

* Watchlist;
* Portfolio;
* Portfolio Transaction;
* Profit/Loss;
* Portfolio Allocation.

⸻

Phase 4 — Comparison & Simulation

* Stock Comparison;
* Comparison Chart;
* DCA Simulator;
* Realistic Lot Mode.

⸻

Phase 5 — AI

* Gemini integration;
* Context Builder;
* Stock AI Assistant;
* Comparison AI;
* Portfolio AI;
* AI Tutor;
* Context validation.

⸻

Phase 6 — Education & Risk

* Investment Learning;
* Learning Detail;
* Quiz;
* Learning Progress;
* Investment Health;
* Portfolio Risk Score.

⸻

Phase 7 — Research Evaluation

* AI Evaluation;
* Hallucination Evaluation;
* Cache Evaluation;
* DCA Evaluation;
* Comparison Evaluation;
* Risk Score Evaluation.

⸻

41. Prioritas Fitur

Kalau waktunya terbatas, prioritasnya:

Prioritas	Fitur
🔴 P0	Authentication
🔴 P0	Stock Search
🔴 P0	Stock Detail
🔴 P0	Fundamental
🔴 P0	Historical Chart
🔴 P0	AI Context Grounding
🟠 P1	News
🟠 P1	Stock Comparison
🟠 P1	Portfolio
🟠 P1	Watchlist
🟠 P1	DCA
🟡 P2	Investment Health
🟡 P2	Learn Investment
🟡 P2	AI Tutor
🟢 P3	Quiz
🟢 P3	Learning Progress

Untuk skripsi, P0 + P1 sudah membentuk sistem yang sangat kuat. P2/P3 bisa menjadi enhancement jika waktu memungkinkan.

⸻

42. Success Metrics

Functional Success

Sistem berhasil:

* mengambil data saham;
* menampilkan historical chart;
* menampilkan fundamental;
* menampilkan berita;
* membandingkan saham;
* menyimpan watchlist;
* mencatat portfolio;
* menghitung P/L;
* menjalankan DCA;
* menghitung investment health;
* menampilkan materi edukasi;
* menghasilkan AI analysis.

⸻

43. AI Success Metrics

AI diharapkan menghasilkan jawaban yang:

* relevan;
* factual;
* konsisten dengan context;
* tidak mengarang angka;
* dapat menjelaskan data;
* mudah dipahami oleh investor pemula tanpa mengurangi kedalaman serta ketepatan data bagi investor berpengalaman.

Untuk penelitian, kualitas tersebut diukur menggunakan dataset pertanyaan dan metrik evaluasi yang telah ditentukan.

⸻

44. System Success Metrics

Caching diharapkan:

* mengurangi jumlah API request;
* meningkatkan response time;
* meningkatkan cache hit ratio;
* mengurangi error akibat rate limit.

⸻

45. Limitations

1. Data bergantung pada provider eksternal.
2. Kelengkapan fundamental bergantung pada provider.
3. Market data dapat memiliki delay.
4. Sistem bukan platform trading.
5. Portfolio menggunakan pencatatan manual.
6. DCA merupakan simulasi historis.
7. Historical performance tidak menjamin return masa depan.
8. Investment Health Score merupakan indikator edukatif.
9. AI bukan financial advisor profesional.
10. AI masih dapat menghasilkan kesalahan.
11. Stock comparison hanya berdasarkan data yang tersedia.
12. Materi edukasi bukan pengganti pendidikan atau nasihat profesional.
13. Tidak semua perusahaan memiliki data fundamental yang lengkap.

⸻

46. Proposed System Architecture

                         USER
                           │
                           ▼
                 ┌───────────────────┐
                 │   React Frontend  │
                 │   Tailwind CSS    │
                 │   Lightweight     │
                 │      Charts       │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │  Express Backend  │
                 │    API Gateway    │
                 └─────────┬─────────┘
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
       ▼                   ▼                    ▼
 Market Service       News Service          AI Service
       │                   │                    │
       │                   │              ┌─────┴──────┐
       │                   │              │   Gemini   │
       │                   │              └────────────┘
       │                   │
       └───────────┬───────┘
                   ▼
           ┌─────────────────┐
           │  Cache Service  │
           └────────┬────────┘
                    ▼
           ┌─────────────────┐
           │   PostgreSQL    │
           │     Prisma      │
           └─────────────────┘

Dengan tambahan:

Learning Service
       ↓
Learning Content
       ↓
AI Tutor

dan:

Comparison Service
       ↓
Stock A
Stock B
Stock C
       ↓
Comparison Engine
       ↓
AI Comparison

⸻

47. Core Research Contribution

Kontribusi penelitian sekarang menjadi lima bagian utama.

1. Data Integration

Mengintegrasikan:

Market Data
+
Historical Data
+
Fundamental
+
News
+
Portfolio

ke dalam satu platform.

⸻

2. Context-Grounded LLM

Mengubah data finansial terstruktur menjadi context untuk LLM sehingga AI dapat memberikan penjelasan berdasarkan data sistem.

⸻

3. Stock Comparison

Membangun mekanisme perbandingan beberapa perusahaan berdasarkan indikator fundamental dan market data.

Ini memperluas sistem dari:

single-stock analysis

menjadi:

multi-stock comparative analysis.

⸻

4. API Caching

Menganalisis pengaruh caching terhadap:

* API request;
* response time;
* cache hit ratio;
* rate-limit exposure.

⸻

5. Investment Simulation & Education

Menyediakan:

* DCA simulation;
* portfolio risk education;
* investment learning;
* AI investment tutor.

Dengan demikian sistem tidak hanya membantu user melihat data, tetapi juga:

memahami data tersebut.

⸻

48. Proposed Thesis Research Questions

Dengan PRD terbaru, saya menyarankan research question menjadi:

RQ1

Bagaimana mengimplementasikan integrasi market data, historical data, fundamental data, dan company news ke dalam aplikasi analisis investasi saham berbasis web?

RQ2

Bagaimana penerapan context-grounded Large Language Model dapat digunakan untuk menghasilkan penjelasan fundamental saham berdasarkan data yang tersedia pada sistem?

RQ3

Seberapa konsisten respons AI terhadap data fundamental, historical data, dan berita yang diberikan sebagai context?

RQ4

Bagaimana penerapan mekanisme caching dapat mengurangi jumlah request terhadap API eksternal dan meningkatkan performa aplikasi?

RQ5

Bagaimana sistem dapat melakukan simulasi investasi berkala menggunakan historical market data dengan mempertimbangkan mekanisme perdagangan berbasis lot?

RQ6

Bagaimana sistem dapat membantu pengguna (baik pemula maupun yang telah berpengalaman) menganalisis perbedaan fundamental beberapa saham melalui fitur stock comparison yang terintegrasi?

RQ7

Bagaimana fitur edukasi dan AI Investment Tutor dapat digunakan untuk membantu investor pemula memahami konsep dasar investasi dan analisis fundamental saham secara terstruktur?

⸻

49. Proposed Thesis Title

Dengan penambahan fitur comparison + education, saya masih menyarankan judul utama tidak dibuat terlalu panjang.

Rekomendasi Utama

“Implementasi Context-Grounded Large Language Model pada Sistem Analisis Fundamental Saham Berbasis Web”

Ini paling aman karena fokus penelitian tetap jelas: Context-Grounded LLM.

Alternatif

“Pengembangan Sistem Analisis Fundamental Saham Berbasis Web Menggunakan Large Language Model dan Integrasi Market Data API”

Jika ingin menonjolkan edukasi

“Pengembangan Platform Edukasi dan Analisis Fundamental Saham Berbasis Web Menggunakan Context-Grounded Large Language Model”

Jika ingin menonjolkan caching

“Pengembangan Sistem Analisis Fundamental Saham Berbasis AI dengan Integrasi Market Data API dan Mekanisme Caching”

⸻

50. Final Product Definition

AI-Powered Fundamental Investment Analyzer adalah platform web analisis fundamental dan edukasi investasi saham Indonesia (IDX) yang dirancang untuk seluruh spektrum investor ritel—baik investor pemula yang membutuhkan edukasi bertahap dan penjelasan intuitif, maupun investor berpengalaman yang memerlukan efisiensi riset, komparasi mendalam, dan sintesis data berbasis AI. Platform ini memungkinkan pengguna:

             ┌───────────────┐
             │ Learn         │
             │ Investment    │
             └───────┬───────┘
                     ↓
             ┌───────────────┐
             │ Search Stock  │
             └───────┬───────┘
                     ↓
             ┌───────────────┐
             │ Stock Detail  │
             └───────┬───────┘
                     ↓
          ┌──────────┴──────────┐
          ↓                     ↓
    Fundamental              News
          │                     │
          └──────────┬──────────┘
                     ↓
                Ask AI
                     ↓
             Compare Stocks
                     ↓
               Watchlist
                     ↓
               Portfolio
                     ↓
              DCA Simulation
                     ↓
             Investment Health

Teknologi:

React
+
Tailwind CSS
+
TradingView Lightweight Charts
+
Node.js
+
Express.js
+
PostgreSQL
+
Prisma
+
Market Data API
+
News API
+
Gemini API

Tujuan akhirnya bukan menentukan:

“Saham mana yang harus dibeli?”

melainkan:

“Bagaimana memberdayakan investor ritel—baik pemula maupun yang telah memiliki pengalaman dalam analisis saham—untuk melakukan riset mandiri secara lebih efisien, memahami data keuangan kompleks, membandingkan emiten secara objektif, memitigasi risiko portofolio, dan memperoleh insight berbasis AI yang grounded pada data faktual?”

Dengan versi ini, menurut saya scope aplikasinya sudah jauh lebih solid untuk skripsi: ada data integration, LLM/context grounding, comparison, caching, simulation, portfolio analysis, dan education. Yang paling penting, fitur-fitur tersebut masih berada dalam satu benang merah, bukan sekadar menambah banyak halaman.