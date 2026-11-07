import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Eye,
  FileEdit,
  Hash,
  Link2,
  Lock,
  Save,
  Unlock,
  X,
} from "lucide-react";
import { LEVEL_META, LevelBadge, MarkdownArticlePreview, toSlugClient } from "./adminConstants";

const DEFAULT_FORM = {
  title: "",
  slug: "",
  level: "BEGINNER",
  summary: "",
  contentBody: "",
  estimatedMinutes: 5,
  orderIndex: 1,
  isPublished: true,
};

export default function AdminModuleFormModal({
  isOpen,
  onClose,
  initialModule,
  SuggestedNextOrderByLevel = {},
  onSubmitModule,
}) {
  const isEditMode = Boolean(initialModule?.id);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [slugLocked, setSlugLocked] = useState(true);
  const [editorTab, setEditorTab] = useState("write"); // "write" | "preview"
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage("");
    setFieldErrors({});
    setEditorTab("write");

    if (initialModule) {
      setForm({
        title: initialModule.title || "",
        slug: initialModule.slug || "",
        level: initialModule.level || "BEGINNER",
        summary: initialModule.summary || "",
        contentBody: initialModule.contentBody || initialModule.content_body || "",
        estimatedMinutes: initialModule.estimatedMinutes ?? initialModule.estimated_minutes ?? 5,
        orderIndex: initialModule.orderIndex ?? initialModule.order_index ?? 1,
        isPublished: initialModule.isPublished ?? initialModule.is_published ?? true,
      });
      setSlugLocked(true);
    } else {
      const nextOrder = SuggestedNextOrderByLevel.BEGINNER || 1;
      setForm({
        ...DEFAULT_FORM,
        orderIndex: nextOrder,
      });
      setSlugLocked(true);
    }
  }, [isOpen, initialModule, SuggestedNextOrderByLevel]);

  if (!isOpen) return null;

  const handleTitleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugLocked && !isEditMode ? toSlugClient(value) : prev.slug,
    }));
  };

  const handleLevelChange = (newLevel) => {
    setForm((prev) => ({
      ...prev,
      level: newLevel,
      orderIndex: !isEditMode
        ? SuggestedNextOrderByLevel[newLevel] || prev.orderIndex
        : prev.orderIndex,
    }));
  };

  const insertSnippet = (snippet) => {
    setForm((prev) => ({
      ...prev,
      contentBody: prev.contentBody
        ? `${prev.contentBody.trimEnd()}\n\n${snippet}\n`
        : `${snippet}\n`,
    }));
    setEditorTab("write");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    try {
      setIsSaving(true);
      await onSubmitModule({
        title: form.title,
        slug: form.slug || toSlugClient(form.title),
        level: form.level,
        summary: form.summary,
        contentBody: form.contentBody,
        estimatedMinutes: Number(form.estimatedMinutes),
        orderIndex: Number(form.orderIndex),
        isPublished: Boolean(form.isPublished),
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Gagal menyimpan modul pembelajaran.");
      if (Array.isArray(err.details) && err.details.length > 0) {
        const mapped = {};
        for (const d of err.details) {
          if (d.field) mapped[d.field] = d.message;
        }
        setFieldErrors(mapped);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] shadow-2xl flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#12151e] border-b border-slate-200 dark:border-slate-800/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500 dark:text-indigo-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {isEditMode ? "Edit Modul Pembelajaran" : "Tambah Modul Pembelajaran Baru"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kurikulum 3 Jenjang Pasar Modal IDX • Mendukung Format Markdown & Kotak Formula
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Baris 1: Judul & Slug Unik */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Judul Modul Materi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Analisis Profitabilitas: Return on Equity (ROE)"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              {fieldErrors.title && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.title}</span>
              )}
            </div>

            <div className="lg:col-span-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-slate-400" />
                  Slug URL Unik <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSlugLocked(!slugLocked)}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {slugLocked ? (
                    <>
                      <Lock className="w-3 h-3" /> Ubah Manual
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3" /> Otomatis
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                required
                readOnly={slugLocked}
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: toSlugClient(e.target.value) }))}
                placeholder="contoh-slug-materi"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 ${
                  slugLocked ? "opacity-75 cursor-not-allowed" : ""
                }`}
              />
              {fieldErrors.slug && (
                <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.slug}</span>
              )}
            </div>
          </div>

          {/* Baris 2: Pilihan Level Kurikulum, Urutan Tampil, Estimasi Waktu Baca, Status Publikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="sm:col-span-2 lg:col-span-6">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tingkat Kesulitan Kurikulum (Level) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(LEVEL_META).map((lvl) => {
                  const active = form.level === lvl.id;
                  return (
                    <button
                      type="button"
                      key={lvl.id}
                      onClick={() => handleLevelChange(lvl.id)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        active
                          ? lvl.pillActiveClass
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#12151e] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span>{lvl.dot}</span>
                      <span>{lvl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400" /> Urutan
                </span>
              </label>
              <input
                type="number"
                min={1}
                max={999}
                required
                value={form.orderIndex}
                onChange={(e) => setForm((prev) => ({ ...prev, orderIndex: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-mono font-bold tabular-nums bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Menit Baca
                </span>
              </label>
              <input
                type="number"
                min={1}
                max={180}
                required
                value={form.estimatedMinutes}
                onChange={(e) => setForm((prev) => ({ ...prev, estimatedMinutes: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-mono font-bold tabular-nums bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Status Terbit
              </label>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, isPublished: !prev.isPublished }))}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  form.isPublished
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{form.isPublished ? "Published" : "Draft"}</span>
              </button>
            </div>
          </div>

          {/* Baris 3: Ringkasan Singkat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Ringkasan Singkat Modul (Tampil pada Kartu Katalog)
            </label>
            <input
              type="text"
              maxLength={500}
              value={form.summary}
              onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="Ringkasan 1-2 kalimat mengenai kompetensi utama yang dipelajari pada modul ini..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Baris 4: Editor Konten Materi & Pratinjau */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#12151e] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditorTab("write")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    editorTab === "write"
                      ? "bg-white text-slate-950 shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  Tulis Naskah Materi
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    editorTab === "preview"
                      ? "bg-white text-slate-950 shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Pratinjau Tampilan Reader
                </button>
              </div>

              {/* Pintasan Sisip Elemen Finansial */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => insertSnippet("## Subjudul Pembahasan\nTuliskan penjelasan konsep di sini.")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-500 cursor-pointer"
                >
                  + Subjudul
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet("```\nROE (%) = (Laba Bersih Setahun / Total Ekuitas) × 100%\n```")
                  }
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 flex items-center gap-1 cursor-pointer"
                >
                  <Code2 className="w-3 h-3" />+ Kotak Rumus
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet("> **Catatan Penting**: Tuliskan highlight atau aturan praktis analisis di sini.")
                  }
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 cursor-pointer"
                >
                  + Highlight
                </button>
              </div>
            </div>

            {editorTab === "write" ? (
              <div>
                <textarea
                  rows={11}
                  required
                  value={form.contentBody}
                  onChange={(e) => setForm((prev) => ({ ...prev, contentBody: e.target.value }))}
                  placeholder="Tulis isi materi pembelajaran menggunakan format Markdown. Gunakan blok tiga backtick (```) untuk membuat kotak formula matematis..."
                  className="w-full p-4 rounded-2xl text-xs sm:text-sm font-mono leading-relaxed bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 custom-scrollbar"
                />
                {fieldErrors.contentBody && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{fieldErrors.contentBody}</span>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#080808] border border-slate-200 dark:border-slate-800 min-h-[260px]">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <div>
                    <LevelBadge level={form.level} showFull />
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
                      {form.title || "Judul Modul Materi"}
                    </h4>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    ⏱ {form.estimatedMinutes || 5} Menit Baca
                  </span>
                </div>
                <MarkdownArticlePreview content={form.contentBody} />
              </div>
            )}
          </div>

          {/* Footer Tombol Simpan */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/90 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving
                ? "Menyimpan..."
                : isEditMode
                  ? "Simpan Perubahan Modul"
                  : "Simpan & Terbitkan Modul"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

