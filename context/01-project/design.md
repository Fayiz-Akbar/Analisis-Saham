# Design System & UI/UX Guidelines: AI-Powered Fundamental Investment Analyzer

Dokumen ini merupakan panduan resmi sistem desain antarmuka (*Design System & UI Guidelines*) untuk platform **AI-Powered Fundamental Investment Analyzer**. Sistem desain ini mengadopsi estetika modern fintech (*SwiftBook style*) dengan dukungan penuh **Dual-Theme (Light Mode & Dark Mode)** yang menerapkan pembalikan kontras (*inverted palette*) secara presisi: latar gelap `#0D0D0D` dipadukan dengan teks putih bersih `#FFFFFF` serta aksen hijau limau segar `#74AE2D`.

---

## 1. Brand Identity & Visual Language

Platform ini mengombinasikan ketelitian analitik pasar modal dengan kejelasan visual yang intuitif bagi investor pemula maupun berpengalaman:
- **Karakter Visual**: Bersih, presisi, modern (*neo-fintech*), terpercaya, dan ramah pengguna (*approachable*).
- **Filosofi Warna**:
  - **Fresh Lime Green (`#74AE2D`)**: Warna aksen utama yang melambangkan pertumbuhan aset (*wealth growth*), profitabilitas, dan sentimen pergerakan bursa yang positif (bullish/gain). Warna ini bersinar kontras di mode terang maupun gelap.
  - **Obsidian / Jet Black (`#0D0D0D`)**: Menghadirkan ketegasan, profesionalisme, dan keterbacaan data numerik tinggi (digunakan sebagai warna teks utama di Light Mode, dan latar kanvas utama di Dark Mode).
  - **Dual-Theme Inversion**: Pengguna dapat berganti antara mode terang (untuk riset siang hari) dan mode gelap (untuk pemantauan malam hari ala terminal saham profesional tanpa membuat mata silau).

---

## 2. Core Color Palette & Dual-Theme Inversion

Palet warna utama diekstrak secara akurat dari panduan desain dengan skema inversi:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LIGHT MODE (DEFAULT)                              │
│  Canvas: #F8F8F8  │  Surface: #FFFFFF  │  Text: #0D0D0D  │  Accent: #74AE2D │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▼  INVERSI
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DARK MODE (INVERTED)                              │
│  Canvas: #0D0D0D  │  Surface: #161616  │  Text: #FFFFFF  │  Accent: #74AE2D │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Tabel Perbandingan Token Warna (Light vs Dark Mode)

| Token Desain | Peran Komponen | Light Mode (Hex) | Dark Mode (Hex) | Catatan / Efek Inversi |
|---|---|---|---|---|
| `--color-canvas` | Latar Belakang Aplikasi (`body`) | **`#F8F8F8`** | **`#0D0D0D`** | Dibalik: dari off-white terang menjadi obsidian jet black. |
| `--color-surface` | Kartu Kontainer (*Cards, Modals*) | **`#FFFFFF`** | **`#161616`** | Kartu di dark mode menggunakan charcoal `#161616` pekat dengan kontras halus. |
| `--color-surface-hover` | Baris Tabel & Card Hover | **`#F5F5F5`** | **`#212121`** | State hover untuk baris tabel screener / daftar saham. |
| `--color-border` | Garis Tepi Pemisah (*Dividers*) | **`#E5E5E5`** | **`#262626`** | Border tipis untuk memisahkan kartu tanpa mendominasi visual. |
| `--color-text-primary` | Teks Utama, Judul & Ticker | **`#0D0D0D`** | **`#FFFFFF`** | Dibalik: dari hitam pekat menjadi putih bersih dengan keterbacaan 100%. |
| `--color-text-secondary` | Teks Deskripsi & Subtitle | **`#404040`** | **`#A3A3A3`** | Teks sekunder yang nyaman dibaca tanpa kontras menyilaukan. |
| `--color-text-muted` | Label Rasio, Tanggal, & Footer | **`#737373`** | **`#737373`** | Keterangan kecil yang netral. |
| `--color-primary` | Brand CTA & Aksen Utama | **`#74AE2D`** | **`#74AE2D`** | Tetap konsisten hijau limau (tampak sangat menonjol di dark mode). |
| `--color-primary-hover` | Hover Tombol Utama | **`#629624`** | **`#86C636`** | Sedikit lebih cerah saat di-hover pada mode gelap. |
| `--color-sage` | Container Aksen Lembut & Highlight | **`#D6E3C0`** | **`#1F2E14`** | Hijau sage pastel untuk wadah kartu AI, sorotan metrik unggulan, atau pill aktif. |
| `--color-peach` | Warm Accent / Moderate / Fair Value | **`#F2D6A4`** | **`#36240D`** | Warna peach/gold lembut untuk peringatan terukur, valuasi wajar, dan komoditas. |
| `--color-tint` | Badge Latar Lembut & Chips | **`#F2F6CD`** | **`#1C2A0F`** | Di dark mode menjadi hijau gelap elegan dengan border halus. |
| `--color-tint-text` | Teks di Dalam Badge Tint | **`#365314`** | **`#BEF264`** | Teks hijau limau terang agar mudah dibaca di latar gelap. |

---

### 2.2 Semantic & Financial Status Colors

Warna semantik finansial diatur agar tetap terbaca konsisten di kedua mode:

| Status Finansial | Light Mode Text / Icon | Light Mode Bg | Dark Mode Text / Icon | Dark Mode Bg | Makna pada Saham |
|---|---|---|---|---|---|
| **Bullish / Gain (`+`)** | `#74AE2D` | `#F2F6CD` / `#D6E3C0` | `#84CC16` | `#1A2E05` | Kenaikan harga harian, Net Income positif, ROE tinggi, Candle Hijau |
| **Bearish / Loss (`-`)** | `#DC2626` | `#FEF2F2` | `#F87171` | `#2D0B0B` | Penurunan harga harian, kerugian emiten, Candle Merah |
| **Neutral (`0%`)** | `#737373` | `#F5F5F5` | `#A3A3A3` | `#1F1F1F` | Harga stagnan, evaluasi rata-rata industri |
| **Fair Value / Moderate Risk** | `#78350F` | **`#F2D6A4`** | `#FDE68A` | **`#36240D`** | Valuasi wajar, skor diversifikasi moderat (31-60), indikator komoditas |
| **Warning / Alert** | `#D97706` | `#FFFBEB` | `#FBBF24` | `#2D1D04` | Rasio utang (DER) tinggi, volatilitas tinggi, disclaimer risiko |
| **AI Intelligence Accent** | `#1F2E14` | **`#D6E3C0`** | `#D6E3C0` | `#17230E` | Wadah sintesis AI grounded, badge fitur co-pilot cerdas |

---

## 3. Typography System

Menggunakan font modern sans-serif bergaya geometris/neo-grotesque dengan keterbacaan tinggi:
* **Primary Font**: **`Plus Jakarta Sans`** atau **`Inter`** (Google Fonts)
* **Monospace / Tabular Font**: **`JetBrains Mono`** atau `tabular-nums font-mono` (wajib untuk angka harga saham, persentase perubahan, dan data tabel fundamental agar digit angka lurus sempurna).

### Skala Tipografi:
- **Display / Hero H1**: `text-4xl` s.d. `text-5xl` (36px - 48px), `font-extrabold`, `tracking-tight`.
  - Light: `#0D0D0D` | Dark: `#FFFFFF`
- **Page Heading H2**: `text-2xl` s.d. `text-3xl` (24px - 30px), `font-bold`, `tracking-tight`.
- **Card Title H3**: `text-lg` s.d. `text-xl` (18px - 20px), `font-semibold`.
- **Body Text**: `text-base` (16px), `font-normal`, `leading-relaxed`.
  - Light: `#404040` | Dark: `#D4D4D4`
- **Caption & Labels**: `text-xs` s.d. `text-sm` (12px - 14px), `font-medium`, warna `#737373` / `#A3A3A3`.
- **Financial Quotes (Ticker Price)**: `text-3xl font-extrabold tabular-nums tracking-tight`.

---

## 4. Shape Language & Layout Geometry

Mengadopsi bentuk kapsul dinamis (*rounded pill & soft modern curves*):

1. **Pill Buttons (`rounded-full`)**:
   - Seluruh tombol aksi utama (*Primary Actions*, *Tabs*, *Filter Badges*, *Search Bar*, *Theme Toggle*) menggunakan radius penuh berbentuk kapsul:
     ```css
     border-radius: 9999px; /* Tailwind: rounded-full */
     ```
2. **Card Containers (`rounded-2xl` / `rounded-3xl`)**:
   - Kartu analisis dan kontainer utama menggunakan sudut membulat 16px – 24px:
     ```css
     border-radius: 1.25rem; /* Tailwind: rounded-2xl */
     ```
3. **Borders & Dividers**:
   - Light Mode: `1px solid #E5E5E5`
   - Dark Mode: `1px solid #262626`
4. **Elevation & Shadows**:
   - Light Mode: `box-shadow: 0 4px 20px -2px rgba(13, 13, 13, 0.04);`
   - Dark Mode: `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);`

---

## 5. Component Design Specifications (Dual-Mode)

### 5.1 Buttons (Tombol Aksi)
- **Primary Pill Button**:
  - Background: `#74AE2D`
  - Text: `#FFFFFF`, `font-semibold`, `rounded-full px-6 py-3`
  - Hover: `#629624` (Light) / `#86C636` (Dark)
- **Secondary Pill Button (Outlined)**:
  - Light Mode: Background `#FFFFFF`, Border `1.5px solid #0D0D0D`, Teks `#0D0D0D`, Hover `#F8F8F8`
  - Dark Mode: Background `#161616`, Border `1.5px solid #FFFFFF`, Teks `#FFFFFF`, Hover `#262626`
- **Theme Toggle Switch (Light/Dark)**:
  - Tombol kapsul kecil dengan ikon Sun/Moon (Lucide Icons).
  - Mengubah class `.dark` pada elemen `<html>` dan menyimpan preferensi ke `localStorage`.

### 5.2 Badges & Status Tags
- **Positive Badge**:
  - Light: Latar `#F2F6CD`, Teks `#365314`, Border `#E2EBA7`
  - Dark: Latar `#1A2E05`, Teks `#A3E635`, Border `#2E4A0C`
- **Negative Badge**:
  - Light: Latar `#FEF2F2`, Teks `#DC2626`, Border `#FECACA`
  - Dark: Latar `#2D0B0B`, Teks `#F87171`, Border `#4C1212`
- **Warm Peach / Sand Badge** (Fair Value, Moderate Risk, Macro Commodities):
  - Light: Latar `#F2D6A4`, Teks `#78350F`, Border `#E5C287`
  - Dark: Latar `#36240D`, Teks `#FDE68A`, Border `#543815`
- **Sage Soft Container / Badge** (AI Grounded Highlight, Active Filter):
  - Light: Latar `#D6E3C0`, Teks `#1F2E14`, Border `#BED2A3`
  - Dark: Latar `#1F2E14`, Teks `#D6E3C0`, Border `#2E421E`
- **Sector / Index Preset Tag** (IDX80, LQ45, IDX30):
  - Light: Latar `#F8F8F8`, Teks `#0D0D0D`, Border `#E5E5E5`, `hover:border-[#74AE2D]`
  - Dark: Latar `#1F1F1F`, Teks `#FFFFFF`, Border `#2E2E2E`, `hover:border-[#74AE2D]`

### 5.3 Metric Cards & Surface Containers
- **Standard Card**:
  - Latar: `#FFFFFF` (Light) / `#161616` (Dark)
  - Border: `1px solid #E5E5E5` (Light) / `1px solid #262626` (Dark)
  - Sudut: `rounded-2xl`
- **Featured / AI Container Card**:
  - Latar: `#D6E3C0` (Light) / `#1F2E14` (Dark) dengan teks `#1F2E14` / `#D6E3C0`
- **Textured Accent Banner / Card**:
  - Latar: `#161616` dengan pola diagonal stripes (`bg-diagonal-stripes`) untuk visual aksen modern pada hero banner / card header.
- Label Rasio: Text `#737373` / `#A3A3A3`
- Angka Nilai: Text `#0D0D0D` (Light) / `#FFFFFF` (Dark) `font-bold text-2xl`
- Status Badge: Pill badge di pojok kartu dengan skema status semantik.

### 5.4 AI Assistant Interface (Context-Grounded Copilot)
- **Header Chat**: Badge avatar AI dengan latar `#74AE2D` teks putih.
- **Prompt Suggestion Chips**:
  - Light: Latar `#F2F6CD`, Teks `#0D0D0D`, Hover border `#74AE2D`
  - Dark: Latar `#1A2E05`, Teks `#A3E635`, Border `#2E4A0C`, Hover border `#74AE2D`
- **Chat Bubble User**:
  - Light: Latar `#0D0D0D`, Teks `#FFFFFF`, `rounded-2xl rounded-tr-sm`
  - Dark: Latar `#262626`, Teks `#FFFFFF`, Border `#383838`, `rounded-2xl rounded-tr-sm`
- **Chat Bubble AI**:
  - Light: Latar `#D6E3C0` (atau `#FFFFFF`), Border `#BED2A3` (atau `#E5E5E5`), Teks `#1F2E14` (atau `#0D0D0D`)
  - Dark: Latar `#161616`, Border `#262626`, Teks `#E5E5E5`
- **Disclaimer Card**: Box tipis dengan latar `#F8F8F8` (Light) / `#141414` (Dark), border kiri tebal `#74AE2D`.

---

## 6. Financial Charting Theme (TradingView Lightweight Charts)

Konfigurasi visual chart otomatis menyesuaikan mode:

```javascript
// Konfigurasi Tema TradingView Lightweight Charts (Light & Dark)
export const getChartTheme = (isDark = false) => ({
  layout: {
    background: { color: isDark ? '#161616' : '#FFFFFF' },
    textColor: isDark ? '#A3A3A3' : '#737373',
    fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
  },
  grid: {
    vertLines: { color: isDark ? '#262626' : '#F4F4F4' },
    horzLines: { color: isDark ? '#262626' : '#F4F4F4' },
  },
  candlestick: {
    upColor: '#74AE2D',         // Fresh Lime Green (Bullish) - Konsisten di kedua mode
    downColor: isDark ? '#F87171' : '#EF4444', // Merah (Bearish)
    borderUpColor: '#74AE2D',
    borderDownColor: isDark ? '#F87171' : '#EF4444',
    wickUpColor: '#74AE2D',
    wickDownColor: isDark ? '#F87171' : '#EF4444',
  },
  volumeBar: {
    upColor: isDark ? 'rgba(116, 174, 45, 0.5)' : 'rgba(116, 174, 45, 0.35)',
    downColor: isDark ? 'rgba(248, 113, 113, 0.5)' : 'rgba(239, 68, 68, 0.35)',
  },
});
```

---

## 7. Tailwind CSS Configuration (`tailwind.config.js`)

Konfigurasi Tailwind CSS dengan dukungan class-based Dark Mode (`darkMode: 'class'`):

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Mengaktifkan toggle dark mode berbasis class 'dark' di <html>
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#74AE2D',            // Lime Green Utama
          'primary-hover': '#629624',
          'primary-dark-hover': '#86C636',
          dark: '#0D0D0D',               // Hitam Kontras Utama / Latar Dark Mode Canvas
          surface: '#FFFFFF',            // Kartu Light Mode
          'surface-dark': '#161616',     // Kartu Dark Mode (Charcoal Surface)
          canvas: '#F8F8F8',             // Latar Kanvas Light Mode
          sage: '#D6E3C0',               // Soft Sage Green (Wadah/Container Aksen Lembut)
          'sage-dark': '#1F2E14',        // Soft Sage Green Dark Container
          peach: '#F2D6A4',              // Warm Peach / Golden Sand (Moderate Risk, Fair Value, Komoditas)
          'peach-dark': '#36240D',       // Warm Peach Dark Container
          tint: '#F2F6CD',               // Aksen Latar Lembut Light
          'tint-dark': '#1A2E05',        // Aksen Latar Lembut Dark
        },
        financial: {
          gain: '#74AE2D',
          'gain-dark': '#84CC16',
          'gain-bg': '#F2F6CD',
          'gain-bg-dark': '#1A2E05',
          loss: '#EF4444',
          'loss-dark': '#F87171',
          'loss-bg': '#FEF2F2',
          'loss-bg-dark': '#2D0B0B',
          neutral: '#737373',
          'neutral-dark': '#A3A3A3',
          'neutral-bg': '#F5F5F5',
          'neutral-bg-dark': '#1F1F1F',
          moderate: '#78350F',
          'moderate-dark': '#FDE68A',
          'moderate-bg': '#F2D6A4',
          'moderate-bg-dark': '#36240D',
        }
      },
      backgroundImage: {
        'diagonal-stripes': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.08) 10px, rgba(255, 255, 255, 0.08) 20px)',
        'diagonal-stripes-light': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 0, 0, 0.05) 10px, rgba(0, 0, 0, 0.05) 20px)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'clean': '0 2px 10px rgba(13, 13, 13, 0.03)',
        'clean-dark': '0 2px 10px rgba(0, 0, 0, 0.4)',
        'clean-hover': '0 8px 24px rgba(13, 13, 13, 0.06)',
      }
    },
  },
  plugins: [],
}
```

---

## 8. CSS Variables & Theme Setup (`src/index.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ==========================================
   CSS DESIGN TOKENS (LIGHT & DARK MODE)
   ========================================== */
:root {
  /* LIGHT MODE (DEFAULT) */
  --color-canvas: #F8F8F8;
  --color-surface: #FFFFFF;
  --color-surface-hover: #F5F5F5;
  --color-border: #E5E5E5;
  --color-text-primary: #0D0D0D;
  --color-text-secondary: #404040;
  --color-text-muted: #737373;
  --color-primary: #74AE2D;
  --color-primary-hover: #629624;
  --color-sage: #D6E3C0;
  --color-sage-text: #1F2E14;
  --color-peach: #F2D6A4;
  --color-peach-text: #78350F;
  --color-tint: #F2F6CD;
  --color-tint-text: #365314;
}

.dark {
  /* DARK MODE (INVERTED) */
  --color-canvas: #0D0D0D;
  --color-surface: #161616;
  --color-surface-hover: #212121;
  --color-border: #262626;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #D4D4D4;
  --color-text-muted: #A3A3A3;
  --color-primary: #74AE2D;
  --color-primary-hover: #86C636;
  --color-sage: #1F2E14;
  --color-sage-text: #D6E3C0;
  --color-peach: #36240D;
  --color-peach-text: #FDE68A;
  --color-tint: #1A2E05;
  --color-tint-text: #BEF264;
}

body {
  background-color: var(--color-canvas);
  color: var(--color-text-primary);
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background-color 0.25s ease, color 0.25s ease;
  -webkit-font-smoothing: antialiased;
}
```

---

## 9. Panduan Implementasi Komponen di React

Contoh penerapan kelas utilitas Tailwind untuk elemen yang mendukung otomatis pergantian mode (*dark-ready*):

```jsx
// Contoh Card Saham yang Otomatis Beradaptasi di Light & Dark Mode
export function StockCard({ symbol, name, price, changePercent }) {
  const isPositive = changePercent >= 0;

  return (
    <div className="bg-white dark:bg-brand-surface-dark border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-clean dark:shadow-clean-dark transition-colors duration-200">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="text-xl font-extrabold text-brand-dark dark:text-white tracking-tight">{symbol}</h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          isPositive 
            ? 'bg-brand-tint dark:bg-brand-tint-dark text-lime-800 dark:text-lime-300' 
            : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
        }`}>
          {isPositive ? `+${changePercent}%` : `${changePercent}%`}
        </span>
      </div>
      <div className="text-2xl font-bold font-mono tabular-nums text-brand-dark dark:text-white">
        Rp {price.toLocaleString('id-ID')}
      </div>
    </div>
  );
}
```
