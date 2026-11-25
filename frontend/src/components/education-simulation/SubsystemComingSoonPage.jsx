import React from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

/**
 * Halaman Coming Soon khusus untuk Sub-Sistem Edukasi & Simulasi Investasi.
 * Didesain datar (flat monochrome) mengikuti bahasa visual Investpedia:
 * - Light: putih bersih / slate-50 dengan border slate-200
 * - Dark: obsidian #080808 / #101010 dengan hairline border #272727
 * - Tanpa box-shadow berlebihan, tanpa neon glow, tipografi crisp sans + mono.
 */
export default function SubsystemComingSoonPage({
  subsystemLabel = "Sub-Sistem Edukasi & Simulasi",
  title,
  subtitle,
  description,
  routePath,
  roadmapHighlights = [],
  relatedPages = [],
  activeTabId,
  onNavigateTab,
  onBackToDashboard,
}) {
  return (
    <section
      aria-labelledby="coming-soon-page-title"
      className="w-full max-w-4xl mx-auto py-8 sm:py-14 space-y-6"
    >
      {/* Kartu Utama Coming Soon */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] overflow-hidden">
        {/* Header Bar Tipis (Breadcrumb & Status) */}
        <div className="px-5 sm:px-8 py-4 border-b border-slate-200 dark:border-[#272727] bg-slate-50/70 dark:bg-[#12151e]/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="font-semibold text-slate-900 dark:text-white">
              {subsystemLabel}
            </span>
            {routePath && (
              <>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {routePath}
                </span>
              </>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#1a1f2c] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-slate-400" />
            Coming Soon
          </span>
        </div>

        {/* Body Utama */}
        <div className="px-5 sm:px-8 py-8 sm:py-12 space-y-7">
          <div className="max-w-2xl space-y-3">
            {subtitle && (
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}

            <h1
              id="coming-soon-page-title"
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-[#F5F5F5] leading-tight"
            >
              {title}
            </h1>

            <p className="text-sm text-slate-600 dark:text-[#929292] leading-relaxed">
              {description}
            </p>
          </div>

          {/* Cakupan Fitur yang Sedang Disiapkan (Ringkas & Datar) */}
          {Array.isArray(roadmapHighlights) && roadmapHighlights.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-[#272727] space-y-3">
              <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Ruang Lingkup Modul Mendatang
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roadmapHighlights.map((item, idx) => (
                  <div
                    key={item.code || item.title || idx}
                    className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#0c0d12] border border-slate-200/80 dark:border-[#22252f] space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </span>
                      {item.code && (
                        <span className="font-mono text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                          {item.code}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tombol Aksi */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="min-h-[40px] px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Kembali ke Dashboard Pasar</span>
              </button>
            )}

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab("screener")}
                className="min-h-[40px] px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#12151e] border border-slate-200 dark:border-[#272727] text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Buka Stock Screener</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigasi Ringkas Antar Halaman Sub-Sistem Edukasi & Simulasi */}
      {Array.isArray(relatedPages) && relatedPages.length > 0 && onNavigateTab && (
        <div className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Halaman Sub-Sistem Edukasi & Simulasi
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Seluruh halaman pada subsistem ini sedang disiapkan untuk rilis tahap berikutnya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {relatedPages.map((page) => {
              const isCurrent = page.id === activeTabId;
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => onNavigateTab(page.id)}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white"
                      : "bg-slate-50 dark:bg-[#12151e] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#272727] hover:text-slate-950 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500"
                  }`}
                >
                  {page.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
