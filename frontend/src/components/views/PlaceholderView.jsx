import React from "react";

export default function PlaceholderView({
  title,
  description,
  onBackToDashboard,
  secondaryLabel,
  onSecondaryAction,
}) {
  return (
    <div className="min-h-[360px] sm:min-h-[460px] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#12151e]/80 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm dark:shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center mx-auto text-slate-600 dark:text-slate-300">
          <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" />
            <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 inline-block uppercase tracking-wider">
            Modul Belum Dimulai
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {description || "Halaman ini dikosongkan sementara sesuai alur sprint. Fokus saat ini adalah penyempurnaan Dashboard, Stock Screener, dan halaman Stock Detail."}
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="min-h-[40px] px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 transition-all cursor-pointer shadow-xs"
          >
            ← Kembali ke Dashboard
          </button>
          {secondaryLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="min-h-[40px] px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
