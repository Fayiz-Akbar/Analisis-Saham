import React from "react";

export default function PlaceholderView({ title, description, onBackToDashboard }) {
  return (
    <div className="min-h-[460px] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#12151e]/80 border border-slate-800 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-300">
          <svg className="w-6 h-6 stroke-white stroke-2 fill-none" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" />
            <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 inline-block uppercase tracking-wider">
            Modul Belum Dimulai
          </span>
          <h2 className="text-xl font-black text-white">{title}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {description || "Halaman ini dikosongkan sementara sesuai alur sprint. Fokus saat ini adalah penyempurnaan kartu geser Dashboard dan halaman Stock Detail."}
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onBackToDashboard}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-950 hover:bg-slate-200 transition-all cursor-pointer shadow-xs"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
