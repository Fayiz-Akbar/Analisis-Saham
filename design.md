# DESIGN SYSTEM SPECIFICATION (DESIGN.MD)
## AI-Powered Fundamental Investment Analyzer & Sub-Sistem Investasi IDX

> **Dokumen Status:** Living Design System & UI/UX Style Guide  
> **Platform Target:** Web Application Responsive (Desktop 1440px, Tablet 768px, Mobile 375px)  
> **Tema Utama:** Dual-Theme (Obsidian Dark Terminal Default & Institutional Slate Light Mode)  
> **Lokasi File:** `c:\laragon\www\Analisis-Saham\design.md`  
> **Referensi Kode Repositori:** `frontend/src/index.css`, `frontend/src/App.jsx`, `frontend/src/components/`  

---

## 1. Filosofi & Karakter Desain

Desain aplikasi ini mengadopsi bahasa visual **Modern Institutional FinTech** yang terinspirasi oleh platform perdagangan dan analitik kelas dunia (*TradingView, Bloomberg Terminal, Linear, dan Vercel*). 

Karakter visual sistem berakar pada empat prinsip utama:
1. **Dark-First High Contrast**: Latar belakang hitam pekat (*Obsidian Black*) untuk mengurangi kelelahan mata saat menganalisis chart dan metrik keuangan berjam-jam, namun tetap menyediakan *Clean Slate Light Mode* yang jernih.
2. **Kerapian Geometri Finansial**: Penggunaan kartu bersudut melengkung halus (*rounded corners* 16px hingga 24px) dengan batas mikro 1px (*1px hairline border*) yang memisahkan data tanpa visual berantakan (*clutter-free*).
3. **Presisi Tipografi Tabular**: Seluruh angka harga, kuantitas lot, dan rasio matematis disajikan dalam format *tabular monospaced* agar desimal dan ribuan sejajar sempurna.
4. **Sentimen Warna Terstandarisasi**: Penggunaan palet hijau emerald untuk tren naik (*gain/bullish*) dan merah koral untuk penurunan (*loss/bearish*), dipadukan dengan aksen ungu-indigo untuk fitur kecerdasan buatan (*Google Gemini AI*).

---

## 2. Palet Warna & Token Desain (Color Tokens)

Sistem menerapkan token warna Tailwind CSS yang diselaraskan secara dinamis antara **Dark Mode** dan **Light Mode**.

### 2.1 Latar Belakang & Permukaan (Surfaces)

| Token Desain | Kelas Tailwind / Hex | Dark Mode (Default) | Light Mode (Slate) | Deskripsi Penggunaan |
|---|---|---|---|---|
| **Canvas / Background** | `bg-[#080808]` / `bg-slate-50` | `#080808` (Obsidian) | `#F8FAFC` (Slate 50) | Latar belakang seluruh halaman aplikasi |
| **Header / Persistent Bar** | `bg-[#080808]/95` / `bg-white/95` | `#080808` + blur | `#FFFFFF` + blur | Top header menempel dengan efek *backdrop blur* |
| **Card Surface (Base)** | `bg-[#101010]` / `bg-white` | `#101010` (Dark Base) | `#FFFFFF` (Pure White)| Kartu widget utama, grafik, dan panel modul |
| **Card Surface (Elevated)** | `bg-[#12151e]` / `bg-slate-100` | `#12151E` (Navy Tint) | `#F1F5F9` (Slate 100)| Bar navigasi kapsul, search trigger, tombol icon |
| **Card Surface (Hover)** | `hover:bg-slate-800/40` | `rgba(30, 41, 59, 0.4)` | `rgba(241, 245, 249, 0.8)`| Interaksi hover pada baris tabel dan kartu |
| **Modal / Popover** | `bg-[#12151e]/98` / `bg-white` | `#12151E` (98% solid) | `#FFFFFF` | Modal popup pencarian saham, dropdown auth, filter |

---

### 2.2 Garis Batas & Pemisah (Borders & Hairlines)

| Token Desain | Kelas Tailwind / Hex | Nilai Hex Dark | Nilai Hex Light | Karakter Visual |
|---|---|---|---|---|
| **Border Utama (Hairline)** | `border-[#272727]` | `#272727` | `#E2E8F0` (Slate 200) | Garis batas tipis 1px pada kartu dan header |
| **Border Sub-elemen** | `border-slate-800/90` | `rgba(30, 41, 59, 0.9)` | `rgba(226, 232, 240, 0.8)` | Garis pemisah internal, input form, search bar |
| **Border Interaktif (Focus)** | `focus:border-slate-500` | `#64748B` | `#475569` | Highlight saat input atau tombol aktif |

---

### 2.3 Semantik FinTech & Indikator Status

| Kategori Semantik | Warna Primer | Hex Kode | Background Badge (Dark) | Background Badge (Light) | Penggunaan |
|---|---|---|---|---|---|
| **Bullish / Profit / Up** | Emerald Green | `#10B981` (`#059669`) | `bg-emerald-950/60` border `border-emerald-800/50` | `bg-emerald-50` border `border-emerald-200/80` | Kenaikan harga, Top Gainers, ROI positif, Lulus Kuis |
| **Bearish / Loss / Down** | Rose Coral | `#F43F5E` (`#DC2626`) | `bg-rose-950/60` border `border-rose-800/50` | `bg-rose-50` border `border-rose-200/80` | Penurunan harga, Top Losers, Drawdown, Nilai minus |
| **Neutral / Stagnan** | Slate Grey | `#64748B` (`#94A3B8`) | `bg-slate-800/80` border `border-slate-700/60` | `bg-slate-100` border `border-slate-200` | Saham tanpa perubahan, sentimen pasar netral |
| **Warning / Caution** | Amber Gold | `#F59E0B` (`#D97706`) | `bg-amber-950/60` border `border-amber-800/50` | `bg-amber-50` border `border-amber-200/80` | Peringatan konsentrasi portofolio, rollover kas DCA |
| **AI / Intelligence** | Indigo Violet | `#6366F1` (`#8B5CF6`) | Gradien `from-indigo-600/20 to-purple-600/20` | `bg-indigo-50` border `border-indigo-200` | Fitur Google Gemini, AI Tutor, Evaluasi Diagnostik |

---

### 2.4 Warna 4 Pilar Rasio Fundamental
Untuk mempermudah investor pemula mengidentifikasi dimensi analisis:
- **Pilar 1: Valuasi (PER, PBV)**: Blue (`#3B82F6`) — Melambangkan nilai dan harga wajar.
- **Pilar 2: Profitabilitas (ROE, ROA, NPM)**: Emerald (`#10B981`) — Melambangkan keuntungan dan efisiensi laba.
- **Pilar 3: Solvabilitas & Leverage (DER)**: Amber (`#F59E0B`) — Melambangkan kewaspadaan beban utang.
- **Pilar 4: Dividen & Imbal Hasil (Yield, DPR)**: Purple (`#A855F7`) — Melambangkan apresiasi dividen tunai.

---

## 3. Tipografi & Standar Notasi Finansial

### 3.1 Skala Tipografi (Type Scale)

Sistem menggunakan font sans-serif modern (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`) yang dipadukan dengan font monospaced (`JetBrains Mono`, `ui-monospace`) untuk angka.

```
Display Large (32px / 2rem)      : font-black tracking-tight (Harga Saham Besar di Carousel)
Page Title (24px / 1.5rem)       : font-extrabold tracking-tight (Judul Halaman / Section)
Card Title (16px / 1rem)         : font-bold tracking-tight text-white
Body Primary (14px / 0.875rem)   : font-medium text-slate-300 dark:text-[#F5F5F5]
Body Secondary (12px / 0.75rem)  : font-normal text-slate-400 dark:text-[#929292]
Micro / Badge Label (10px / 11px): font-bold uppercase tracking-wider
Financial Numeric (Mono)         : font-mono font-bold tabular-nums
```

### 3.2 Standar Notasi Finansial Indonesia (Localization Rules)
1. **Pemisah Ribuan & Desimal**:
   - Pemisah ribuan menggunakan tanda titik (`.`): `Rp 8.850` atau `Rp 105.850.000`.
   - Pemisah desimal menggunakan tanda koma (`,`): `+12,36%` atau `21,5%`.
2. **Notasi Perubahan Harga & Arah**:
   - Naik (*Positive*): Awali tanda plus `+`: `+Rp 150 (+1,72%)`.
   - Turun (*Negative*): Awali tanda minus resmi `−` (`\u2212`) atau `-`: `−Rp 50 (−0,56%)`.
   - Stagnan (*Zero*): Tampilkan `Rp 0 (0,00%)`.
3. **Singkatan Angka Skala Besar**:
   - Nilai Transaksi: `T` (Triliun Rupiah), `M` (Miliar Rupiah): contoh `Rp 12,4 T`.
   - Volume Saham: `M lembar` (Miliar lembar), `Juta lembar`: contoh `45,2 Juta lembar`.
   - Satuan Perdagangan: Wajib mencantumkan satuan `Lot` ($1\text{ lot} = 100\text{ lembar}$).

---

## 4. Geometri, Sudut & Karakter Bentuk (Shape Language)

```
┌────────────────────────────────────────────────────────┐
│  KOMPONEN & BENTUK          │ KELAS TAILWIND & UKURAN  │
├─────────────────────────────┼──────────────────────────┤
│  Super Card / Major Widget  │ rounded-3xl (24px)       │
│  Standard Card / Panel      │ rounded-2xl (16px)       │
│  Button / Input / Stepper   │ rounded-xl (12px)        │
│  Floating Nav Pill Bar      │ rounded-full (9999px)    │
│  Logo / Icon Container      │ rounded-xl atau full     │
│  Badge / Pill Tag           │ rounded-full px-2.5 py-1 │
└─────────────────────────────┘
```

### 4.1 Floating Pill Navigation (Ciri Khas Header InvestAI)
Header mengadopsi navigasi melayang (*floating capsule bar*) di tengah layar:
- Container: `bg-[#12151e] border border-slate-800/90 rounded-full p-1 shadow-md flex items-center gap-1`
- Tab Aktif: `bg-white text-slate-950 font-semibold px-3.5 py-1.5 rounded-full shadow-xs`
- Tab Inaktif: `text-slate-400 hover:text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-all`

### 4.2 Custom Sleek Scrollbar (TradingView Style)
Sistem meniadakan scrollbar tebal bawaan sistem operasi dan menggantinya dengan scrollbar minimalis elegan:
```css
/* Scrollbar Halus Ramping */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  transition: background-color 0.2s ease;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.4);
}
/* Tombol Panah Bawaan Dihapus Mutlak */
::-webkit-scrollbar-button {
  display: none !important;
}
```

---

## 5. Komponen Utama & Pola Antarmuka (Component Patterns)

### 5.1 Kartu Geser Saham IDX80 (Horizontal Carousel Card)
Komponen kartu horizontal interaktif pada dasbor utama yang mendukung *drag-to-scroll*:
- **Dimensi**: Lebar tetap `w-72 sm:w-80`, tinggi `h-64 sm:h-72`, `flex-shrink-0`.
- **Struktur Tiga Tingkat**:
  1. *Bagian Atas*: Logo lingkaran emiten (`w-13 h-13 rounded-2xl bg-white p-2.5`), simbol ticker tebal (`text-2xl font-black`), dan nama perusahaan truncate.
  2. *Bagian Tengah*: Gelombang SVG Bézier halus (*Smooth Cubic Spline*) dengan area gradien pendaran lembut (`drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]`).
  3. *Bagian Bawah*: Harga besar font monospaced (`text-3xl font-black font-mono`), diikuti nominal perubahan mingguan dan persentase berwarna emerald/rose.

```
┌──────────────────────────────────────┐
│ [Logo BBCA]  BBCA                    │
│              Bank Central Asia Tbk   │
│ ──────────────────────────────────── │
│          ╭───╮      ╭─────────●      │
│  ╰──────╯     ╰────╯ (Sparkline SVG) │
│ ──────────────────────────────────── │
│ Rp 8.850                             │
│ +Rp 150 (+1,72%)  [ 1 MINGGU ]       │
└──────────────────────────────────────┘
```

---

### 5.2 Top Movers Section (Gainers, Losers, Most Active)
Komponen multi-kolom yang menyajikan pergerakan saham harian dengan fitur *hover popover detail*:
- **Baris Saham**: `flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-slate-800/40 transition-all cursor-pointer`.
- **Kolom Kiri**: Logo lingkaran kecil (`w-10 h-10 rounded-full bg-slate-800 border border-slate-700/60`), nama emiten tebal, dan ticker badge abu-abu.
- **Kolom Kanan**: Harga terkini (atas) dan persentase perubahan harian (bawah) font monospaced sejajar kanan.
- **Hover Popover Card (`StockHoverCard`)**: Menampilkan grafik intraday mini 1 hari dan ringkasan metrik volume seketika saat kursor diarahkan ke baris saham.

---

### 5.3 Kartu Berita Finansial & Badge Sentimen (`LatestNewsSection`)
Komponen grid berita dengan penanda polaritas sentimen berbasis kecerdasan buatan:
- **Badge Sentimen**:
  - `Positif`: `bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md` dengan ikon `TrendingUp`.
  - `Negatif`: `bg-rose-950/80 text-rose-300 border border-rose-500/40 backdrop-blur-md` dengan ikon `TrendingDown`.
  - `Netral`: `bg-slate-900/80 text-slate-200 border border-slate-600/50 backdrop-blur-md` dengan ikon `Minus`.
- **Foto Berita**: Rasio aspek `16:9` dengan *thematic fallback image* (Perbankan, Tambang, Energi, Teknologi) jika gambar sumber tidak tersedia.
- **Metadata**: Waktu publikasi relatif (`15 mnt lalu`, `Kemarin`) dan nama sumber berita terpercaya (*CNBC Indonesia*, *Google News*).

---

### 5.4 TradingView-Style Global Search Modal (`SearchModal`)
Modal pencarian instan seluruh emiten BEI:
- **Trigger**: Shortcut keyboard `⌘K` / `Ctrl + K` atau klik icon kaca pembesar pada header.
- **Backdrop**: `fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20`.
- **Container**: `w-full max-w-2xl bg-[#12151e] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden`.
- **Input Bar**: Auto-focus input tanpa outline, icon pencarian di kiri, tombol `ESC` badge di kanan.
- **Kategori Filter**: Tab kapsul horizontal `[ Semua ] [ Perbankan ] [ Energi ] [ Konsumer ] [ Teknologi ]`.
- **Navigasi Keyboard**: Mendukung navigasi panah atas/bawah (`ArrowUp`/`ArrowDown`) dan seleksi dengan tombol `Enter`.

---

### 5.5 Kartu Analisis 4 Pilar Fundamental (`StockDetailCard`)
Struktur kartu berpetak empat yang menyajikan rasio utama emiten:
- **Grid Layout**: 4 kolom responsif (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`).
- **Pilar Card**: `p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2`.
- **Label Pilar**: Huruf kapital kecil dengan warna tema pilar (`text-[10px] font-bold uppercase tracking-wider`).
- **Data Pairs**: Nilai rasio tebal di sisi kanan sejajar dengan label rasio di sisi kiri.

---

## 6. Standar Visualisasi Data (Chart & Graph Guidelines)

### 6.1 Candlestick Chart (TradingView Lightweight Charts)
- **Warna Lilin Naik (*Bullish*)**: `#10B981` (Emerald Solid), Border: `#10B981`, Sumbu: `#10B981`.
- **Warna Lilin Turun (*Bearish*)**: `#F43F5E` (Rose Coral Solid), Border: `#F43F5E`, Sumbu: `#F43F5E`.
- **Garis Kisi (*Grid Lines*)**: Vertikal & Horisontal `rgba(255, 255, 255, 0.05)` (hampir transparan agar tidak mengalihkan fokus harga).
- **Crosshair Tooltip**: Label harga berlatar `#1E222D` dengan teks putih tajam.
- **Histogram Volume**: Baris volume di bawah chart dengan transparansi 40% mengikuti warna lilin candlestick hari terkait.

### 6.2 Kurva Simulasi DCA & Portofolio (Recharts Area Chart)
- **Modal Disetor**: Garis putus-putus (*dashed line*) abu-abu `#94A3B8` dengan ketebalan 2px.
- **Nilai Portofolio Riil**: Garis gradasi tebal `#3B82F6` ke `#10B981` dengan area arsiran gradasi lembut pendaran 15% opacity ke 0%.

### 6.3 Diagram Donut Alokasi Sektor (Donut Chart)
- **Tebal Cincin**: Inner radius 60%, outer radius 80%.
- **Palet Sektor**:
  - Perbankan / Finansial: `#3B82F6` (Blue)
  - Energi / Batubara / Minyak: `#F59E0B` (Amber)
  - Barang Konsumen: `#10B981` (Emerald)
  - Infrastruktur & Telko: `#8B5CF6` (Purple)
  - Properti & Real Estat: `#EC4899` (Pink)
  - Lainnya / Kas Bebas: `#64748B` (Slate)

---

## 7. Desain Khusus Sub-Sistem Edukasi & Simulasi

### 7.1 Kartu Modul Kurikulum Edukasi
- **Indikator Tingkat Kesulitan**:
  - `🟢 Pemula`: Badge hijau muda `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`.
  - `🟡 Menengah`: Badge kuning amber `bg-amber-500/10 text-amber-400 border border-amber-500/20`.
  - `🔴 Mahir`: Badge merah koral `bg-rose-500/10 text-rose-400 border border-rose-500/20`.
- **Progress Bar Modul**: Batang tinggi 6px `h-1.5 rounded-full bg-slate-800` dengan bar isi gradasi emerald/biru `bg-gradient-to-r from-blue-500 to-emerald-500`.

### 7.2 Kotak Formula Rumus Finansial
- **Container**: `p-4 my-4 rounded-2xl bg-[#12151e] border border-indigo-500/30 shadow-inner flex flex-col items-center justify-center`.
- **Teks Rumus**: Monospaced tebal warna putih `font-mono text-sm sm:text-base text-white tracking-wide`.
- **Garis Pembagi Pecahan**: Garis putih solid `border-b border-slate-400 w-full max-w-xs my-1`.

### 7.3 Kartu Diagnosis Miskonsepsi AI (Gemini Grounded Card)
- **Container**: `p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/40 space-y-3`.
- **Header**: Teks berpendar ungu `text-indigo-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2`.
- **Kutipan Miskonsepsi**: Kotak latar gelap dengan border samping merah/kuning untuk menandai kekeliruan pemahaman pengguna.

### 7.4 Meteran Audit Portfolio Health Score (PHS Gauge)
- **Komponen**: *Circular Gauge Meter* (skala 0–100) berdiameter 180px di tengah layar.
- **Zona Warna Predikat**:
  - `0 – 30`: High Risk (Merah `#F43F5E`)
  - `31 – 60`: Moderate Risk (Kuning Amber `#F59E0B`)
  - `61 – 80`: Good Health (Hijau Daun `#22C55E`)
  - `81 – 100`: Well Diversified / Excellent (Emerald `#10B981`)
- **Kartu 4 Pilar Seimbang**: 4 kartu berjejer rapi di bawah gauge, masing-masing memuat bobot `[25%]`, nilai pilar 0–100, dan metrik riil pembentuknya.

---

## 8. Tata Letak Responsif & Breakpoints

Sistem mengacu pada breakpoints standar Tailwind CSS:
- **Mobile (`< 640px`)**: Navigasi floating bar menyusut menjadi scrollable horizontal; kartu carousel beralih menjadi 1 kartu per tampilan; tabel holdings mendukung geser mendatar.
- **Tablet (`640px - 1024px`)**: Grid kartu beralih ke 2 kolom; top movers menampilkan 2 blok berdampingan.
- **Desktop (`≥ 1024px / 1440px`)**: Lebar kontainer dibatasi pada `max-w-[98%] mx-auto px-6`; 4 kartu metrik berjejer penuh; tabel komparasi dan grafik candlestick memanfaatkan ruang lebar (*wide view*) secara maksimal.

---

## 9. Prinsip Aksesibilitas & Etika Finansial (Compliance)

1. **Kontras Teks Minimum (WCAG 2.1 AA)**: Seluruh rasio kontras teks terhadap background permukaan wajib $\ge 4.5:1$.
2. **Ketergantungan Warna**: Jangan hanya mengandalkan warna hijau/merah untuk status harga. Selalu sertakan tanda matematis `+` atau `−` dan ikon panah (`TrendingUp` / `TrendingDown`).
3. **Pemberitahuan Modal Virtual**: Pada seluruh komponen transaksi dan portofolio, wajib tertera label visual mencolok: `"Simulasi Modal Virtual • Tanpa Risiko Riil"`.
4. **Disclaimer AI**: Seluruh kartu saran atau sintesis AI wajib menyertakan catatan kaki standar: *"Analisis ini dihasilkan oleh AI untuk sarana edukasi dan bukan merupakan rekomendasi ajakan beli/jual saham."*
