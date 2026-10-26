import React, { useRef } from "react";
import GlassFolder from "@/components/ui/glass-folder-cards";
import { ArrowRight, ChevronLeft, ChevronRight, Layers, TableProperties } from "lucide-react";

/**
 * Klaster Berkas Sektor Saham IDX80 menggunakan Glass Folder Cards
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
      image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=640&auto=format&fit=crop",
      files: [
        { name: "BBCA", meta: "Rp 10.450 · Perbankan", image: "https://assets.stockbit.com/logos/companies/BBCA.png" },
        { name: "ASII", meta: "Rp 5.125 · Otomotif", image: "https://assets.stockbit.com/logos/companies/ASII.png" },
        { name: "TLKM", meta: "Rp 2.980 · Telekomunikasi", image: "https://assets.stockbit.com/logos/companies/TLKM.png" },
        { name: "ADRO", meta: "Rp 3.750 · Energi", image: "https://assets.stockbit.com/logos/companies/ADRO.png" },
      ],
      description: "Seluruh emiten konstituen likuid Bursa Efek Indonesia.",
    },
    {
      id: "FINANCIALS",
      sectorKey: "Financials",
      label: "Keuangan & Bank",
      meta: "Big 4 & Finansial",
      tone: "dark",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=640&auto=format&fit=crop",
      files: [
        { name: "BBCA", meta: "Rp 10.450 · PER 22.4", image: "https://assets.stockbit.com/logos/companies/BBCA.png" },
        { name: "BBRI", meta: "Rp 4.980 · PER 12.8", image: "https://assets.stockbit.com/logos/companies/BBRI.png" },
        { name: "BMRI", meta: "Rp 6.850 · PER 11.5", image: "https://assets.stockbit.com/logos/companies/BMRI.png" },
        { name: "BBNI", meta: "Rp 5.400 · PER 9.8", image: "https://assets.stockbit.com/logos/companies/BBNI.png" },
      ],
      description: "Perbankan komersial, asuransi, dan sekuritas nasional.",
    },
    {
      id: "ENERGY",
      sectorKey: "Energy",
      label: "Energi & Tambang",
      meta: "Batubara & Migas",
      tone: "dark",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=640&auto=format&fit=crop",
      files: [
        { name: "ADRO", meta: "Rp 3.750 · Batubara", image: "https://assets.stockbit.com/logos/companies/ADRO.png" },
        { name: "PTBA", meta: "Rp 2.890 · Tambang", image: "https://assets.stockbit.com/logos/companies/PTBA.png" },
        { name: "PGAS", meta: "Rp 1.540 · Gas Bumi", image: "https://assets.stockbit.com/logos/companies/PGAS.png" },
        { name: "MEDC", meta: "Rp 1.320 · Minyak & Gas", image: "https://assets.stockbit.com/logos/companies/MEDC.png" },
      ],
      description: "Eksplorasi energi fosil, energi baru terbarukan, dan migas.",
    },
    {
      id: "CONSUMER",
      sectorKey: "Consumer Non-Cyclicals",
      label: "Konsumer & Ritel",
      meta: "Barang Konsumsi Primer",
      tone: "light",
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=640&auto=format&fit=crop",
      files: [
        { name: "ICBP", meta: "Rp 11.850 · Makanan Olahan", image: "https://assets.stockbit.com/logos/companies/ICBP.png" },
        { name: "INDF", meta: "Rp 7.100 · F&B Terintegrasi", image: "https://assets.stockbit.com/logos/companies/INDF.png" },
        { name: "UNVR", meta: "Rp 2.340 · Kebutuhan Harian", image: "https://assets.stockbit.com/logos/companies/UNVR.png" },
        { name: "AMRT", meta: "Rp 3.120 · Minimarket", image: "https://assets.stockbit.com/logos/companies/AMRT.png" },
      ],
      description: "Industri makanan minuman, kebutuhan pokok, dan jaringan ritel.",
    },
    {
      id: "INFRA_TECH",
      sectorKey: "Infrastructures",
      label: "Infrastruktur & Tekno",
      meta: "Telko & Digital",
      tone: "dark",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=640&auto=format&fit=crop",
      files: [
        { name: "TLKM", meta: "Rp 2.980 · Telekomunikasi", image: "https://assets.stockbit.com/logos/companies/TLKM.png" },
        { name: "ISAT", meta: "Rp 2.450 · Operator Seluler", image: "https://assets.stockbit.com/logos/companies/ISAT.png" },
        { name: "TOWR", meta: "Rp 840 · Menara Telekomunikasi", image: "https://assets.stockbit.com/logos/companies/TOWR.png" },
        { name: "GOTO", meta: "Rp 72 · Ekosistem Teknologi", image: "https://assets.stockbit.com/logos/companies/GOTO.png" },
      ],
      description: "Jaringan serat optik, menara seluler, dan platform digital.",
    },
  ];

  return (
    <section className="space-y-4 pt-2">
      {/* Header Bagian Klaster Berkas Sektor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-300" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Klaster Berkas Sektor & Kategori Saham
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Jelajahi berkas emiten berdasarkan klaster industri. Klik berkas untuk melihat saham konstituen atau buka tabel perbandingan metrik lengkap.
          </p>
        </div>

        {/* Tombol Aksi Tabel Sektor & Panah Geser */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => onOpenCategoryTable?.("ALL")}
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-white/10 bg-white hover:bg-slate-50 dark:bg-[#0c0e14] dark:hover:bg-slate-900 text-slate-900 dark:text-white flex items-center gap-2 transition-colors cursor-pointer hover:border-slate-400 dark:hover:border-white/25"
          >
            <TableProperties className="w-4 h-4 text-slate-400" />
            <span>Buka Tabel Semua Sektor</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

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
                image={item.image}
                files={item.files}
                width={330}
                action="more"
                labelPlacement="bottom-left"
                appearDelay={index * 90}
                menu={[
                  {
                    label: `Buka Tabel ${item.label}`,
                    onSelect: () => onOpenCategoryTable?.(item.sectorKey),
                  },
                ]}
                onFileSelect={(file) => {
                  if (file?.name) {
                    onSelectStock?.(file.name);
                  }
                }}
              />
            </div>

            {/* Keterangan & Tombol Akses Tabel Sektor */}
            <div className="w-full pt-3 mt-1 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px]">
                {item.description}
              </span>

              <button
                onClick={() => onOpenCategoryTable?.(item.sectorKey)}
                className="px-3 py-1.5 rounded-xl font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Buka Tabel</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
