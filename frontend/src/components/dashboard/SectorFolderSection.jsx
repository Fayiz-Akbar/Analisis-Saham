import React, { useRef } from "react";
import GlassFolder from "@/components/ui/glass-folder-cards";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Klaster Berkas Kategori Saham IDX80 menggunakan Glass Folder Cards
 * Ditempatkan sebelum bagian Pasar Saham IDX80 pada Dashboard.
 */
export default function SectorFolderSection({ onSelectStock, onOpenCategoryTable }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = 380;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  const sectorFolders = [
    {
      id: "ALL",
      sectorKey: "ALL",
      label: "Semua Sektor",
      meta: "80 Emiten IDX80",
      tone: "dark",
      art: "none",
      files: [
        {
          name: "BBCA",
          ticker: "BBCA",
          companyName: "Bank Central Asia",
          price: 10450,
          changePercent: 1.46,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/BBCA.png",
          sector: "Perbankan",
          meta: "Kap: Rp 1.285 T",
          trend: [10200, 10250, 10180, 10300, 10320, 10400, 10450],
        },
        {
          name: "ASII",
          ticker: "ASII",
          companyName: "Astra International",
          price: 5125,
          changePercent: -0.97,
          isPositive: false,
          logo: "https://assets.stockbit.com/logos/companies/ASII.png",
          sector: "Konglomerasi",
          meta: "Kap: Rp 207 T",
          trend: [5250, 5200, 5220, 5175, 5150, 5100, 5125],
        },
        {
          name: "TLKM",
          ticker: "TLKM",
          companyName: "Telkom Indonesia",
          price: 2980,
          changePercent: 0.68,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/TLKM.png",
          sector: "Telekomunikasi",
          meta: "Kap: Rp 295 T",
          trend: [2920, 2940, 2930, 2960, 2950, 2970, 2980],
        },
        {
          name: "ADRO",
          ticker: "ADRO",
          companyName: "Alamtri Resources (Adaro)",
          price: 3750,
          changePercent: 2.18,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/ADRO.png",
          sector: "Energi",
          meta: "Kap: Rp 119 T",
          trend: [3600, 3620, 3650, 3680, 3700, 3730, 3750],
        },
      ],
      description: "Seluruh emiten konstituen likuid Bursa Efek Indonesia.",
    },
    {
      id: "FINANCIALS",
      sectorKey: "Financials",
      label: "Keuangan & Bank",
      meta: "Big 4 & Finansial",
      tone: "dark",
      art: "none",
      files: [
        {
          name: "BBCA",
          ticker: "BBCA",
          companyName: "Bank Central Asia",
          price: 10450,
          changePercent: 1.46,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/BBCA.png",
          sector: "Keuangan",
          meta: "PER: 22.4x · ROE: 21.8%",
          trend: [10200, 10280, 10320, 10380, 10400, 10450],
        },
        {
          name: "BBRI",
          ticker: "BBRI",
          companyName: "Bank Rakyat Indonesia",
          price: 4980,
          changePercent: -0.80,
          isPositive: false,
          logo: "https://assets.stockbit.com/logos/companies/BBRI.png",
          sector: "Keuangan",
          meta: "PER: 12.8x · ROE: 18.5%",
          trend: [5100, 5060, 5020, 5040, 4990, 4980],
        },
        {
          name: "BMRI",
          ticker: "BMRI",
          companyName: "Bank Mandiri",
          price: 6850,
          changePercent: 1.86,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/BMRI.png",
          sector: "Keuangan",
          meta: "PER: 11.5x · ROE: 19.2%",
          trend: [6650, 6700, 6720, 6780, 6800, 6850],
        },
        {
          name: "BBNI",
          ticker: "BBNI",
          companyName: "Bank Negara Indonesia",
          price: 5400,
          changePercent: 0.93,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/BBNI.png",
          sector: "Keuangan",
          meta: "PER: 9.8x · ROE: 15.6%",
          trend: [5300, 5320, 5350, 5360, 5380, 5400],
        },
      ],
      description: "Perbankan komersial, asuransi, dan sekuritas nasional.",
    },
    {
      id: "ENERGY",
      sectorKey: "Energy",
      label: "Energi & Tambang",
      meta: "Batubara & Migas",
      tone: "dark",
      art: "none",
      files: [
        {
          name: "ADRO",
          ticker: "ADRO",
          companyName: "Alamtri Resources",
          price: 3750,
          changePercent: 2.18,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/ADRO.png",
          sector: "Energi",
          meta: "PER: 4.8x · Div: 12.4%",
          trend: [3600, 3640, 3670, 3700, 3720, 3750],
        },
        {
          name: "PTBA",
          ticker: "PTBA",
          companyName: "Bukit Asam",
          price: 2890,
          changePercent: -0.34,
          isPositive: false,
          logo: "https://assets.stockbit.com/logos/companies/PTBA.png",
          sector: "Tambang",
          meta: "PER: 7.2x · Div: 14.8%",
          trend: [2920, 2900, 2910, 2890, 2900, 2890],
        },
        {
          name: "PGAS",
          ticker: "PGAS",
          companyName: "Perusahaan Gas Negara",
          price: 1540,
          changePercent: 1.32,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/PGAS.png",
          sector: "Gas Bumi",
          meta: "PER: 6.9x · PBV: 0.8x",
          trend: [1500, 1510, 1520, 1525, 1535, 1540],
        },
        {
          name: "MEDC",
          ticker: "MEDC",
          companyName: "Medco Energi",
          price: 1320,
          changePercent: 0.76,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/MEDC.png",
          sector: "Minyak & Gas",
          meta: "PER: 5.6x · ROE: 16.4%",
          trend: [1290, 1300, 1310, 1305, 1315, 1320],
        },
      ],
      description: "Eksplorasi energi fosil, energi baru terbarukan, dan migas.",
    },
    {
      id: "CONSUMER",
      sectorKey: "Consumer Non-Cyclicals",
      label: "Konsumer & Ritel",
      meta: "Barang Konsumsi Primer",
      tone: "dark",
      art: "none",
      files: [
        {
          name: "ICBP",
          ticker: "ICBP",
          companyName: "Indofood CBP",
          price: 11850,
          changePercent: 0.85,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/ICBP.png",
          sector: "Makanan Minuman",
          meta: "PER: 15.2x · ROE: 19.5%",
          trend: [11600, 11650, 11700, 11750, 11800, 11850],
        },
        {
          name: "INDF",
          ticker: "INDF",
          companyName: "Indofood Sukses Makmur",
          price: 7100,
          changePercent: 1.07,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/INDF.png",
          sector: "F&B Terintegrasi",
          meta: "PER: 7.8x · Div: 5.2%",
          trend: [6980, 7020, 7050, 7060, 7080, 7100],
        },
        {
          name: "UNVR",
          ticker: "UNVR",
          companyName: "Unilever Indonesia",
          price: 2340,
          changePercent: -1.27,
          isPositive: false,
          logo: "https://assets.stockbit.com/logos/companies/UNVR.png",
          sector: "Kebutuhan Rumah",
          meta: "PER: 24.1x · ROE: 42.1%",
          trend: [2400, 2380, 2370, 2360, 2350, 2340],
        },
        {
          name: "AMRT",
          ticker: "AMRT",
          companyName: "Sumber Alfaria Trijaya",
          price: 3120,
          changePercent: 1.63,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/AMRT.png",
          sector: "Ritel Modern",
          meta: "PER: 32.5x · ROE: 28.4%",
          trend: [3040, 3060, 3080, 3100, 3110, 3120],
        },
      ],
      description: "Industri makanan minuman, kebutuhan pokok, dan jaringan ritel.",
    },
    {
      id: "INFRA_TECH",
      sectorKey: "Infrastructures",
      label: "Infrastruktur & Tekno",
      meta: "Telko & Digital",
      tone: "dark",
      art: "none",
      files: [
        {
          name: "TLKM",
          ticker: "TLKM",
          companyName: "Telkom Indonesia",
          price: 2980,
          changePercent: 0.68,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/TLKM.png",
          sector: "Telekomunikasi",
          meta: "PER: 12.1x · Div: 5.8%",
          trend: [2920, 2940, 2930, 2960, 2970, 2980],
        },
        {
          name: "ISAT",
          ticker: "ISAT",
          companyName: "Indosat Ooredoo",
          price: 2450,
          changePercent: 2.51,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/ISAT.png",
          sector: "Operator Seluler",
          meta: "PER: 14.8x · ROE: 14.2%",
          trend: [2380, 2400, 2410, 2430, 2440, 2450],
        },
        {
          name: "TOWR",
          ticker: "TOWR",
          companyName: "Sarana Menara Nusantara",
          price: 840,
          changePercent: -0.59,
          isPositive: false,
          logo: "https://assets.stockbit.com/logos/companies/TOWR.png",
          sector: "Menara Telko",
          meta: "PER: 11.2x · PBV: 2.1x",
          trend: [855, 850, 845, 840, 845, 840],
        },
        {
          name: "GOTO",
          ticker: "GOTO",
          companyName: "GoTo Gojek Tokopedia",
          price: 72,
          changePercent: 1.41,
          isPositive: true,
          logo: "https://assets.stockbit.com/logos/companies/GOTO.png",
          sector: "Platform Digital",
          meta: "Kap: Rp 86 T · On-Demand",
          trend: [69, 70, 70, 71, 71, 72],
        },
      ],
      description: "Jaringan serat optik, menara seluler, dan platform digital.",
    },
  ];

  return (
    <section className="space-y-4 pt-2">
      {/* Header Bagian: Judul Bersih Kategori Saham + Tombol Geser */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kategori Saham
          </h2>
        </div>

        {/* Panah Geser Kiri / Kanan */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/25 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Geser ke kiri"
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/25 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Geser ke kanan"
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row Horizontal Berkas Kategori (Glass Folder Cards) */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
      >
        {sectorFolders.map((item, index) => (
          <div
            key={item.id}
            className="shrink-0 snap-start flex flex-col items-center p-4 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#0c0e14]/90 backdrop-blur-md hover:border-slate-400 dark:hover:border-white/25 transition-colors group"
            style={{ width: 370 }}
          >
            {/* Objek Glass Folder Interaktif */}
            <div className="flex justify-center w-full py-2">
              <GlassFolder
                label={item.label}
                meta={item.meta}
                tone={item.tone}
                art={item.art}
                files={item.files}
                width={330}
                action="more"
                labelPlacement="bottom-left"
                appearDelay={index * 90}
                menu={[
                  {
                    label: `Buka ${item.label}`,
                    onSelect: () => onOpenCategoryTable?.(item.sectorKey),
                  },
                ]}
                onFileSelect={(file) => {
                  const targetSymbol = file?.ticker || file?.name;
                  if (targetSymbol) {
                    onSelectStock?.(targetSymbol);
                  }
                }}
              />
            </div>

            {/* Keterangan & Tombol Akses Buka Sektor */}
            <div className="w-full pt-3 mt-1 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[220px]">
                {item.description}
              </span>

              <button
                onClick={() => onOpenCategoryTable?.(item.sectorKey)}
                className="px-3.5 py-1.5 rounded-xl font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Buka</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
