import React, { useState } from "react";
import { ChevronDown, ChevronUp, Lock, Unlock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEVEL_META, LevelBadge, MarkdownArticlePreview, toSlugClient } from "./adminConstants";

const getInitialFormState = (initialModule, suggestedNextOrderByLevel = {}) => {
  if (initialModule) {
    return {
      title: initialModule.title || "",
      slug: initialModule.slug || "",
      level: initialModule.level || "BEGINNER",
      summary: initialModule.summary || "",
      contentBody: initialModule.contentBody || initialModule.content_body || "",
      estimatedMinutes: initialModule.estimatedMinutes ?? initialModule.estimated_minutes ?? 5,
      orderIndex: initialModule.orderIndex ?? initialModule.order_index ?? 1,
      isPublished: initialModule.isPublished ?? initialModule.is_published ?? true,
    };
  }

  return {
    title: "",
    slug: "",
    level: "BEGINNER",
    summary: "",
    contentBody: "",
    estimatedMinutes: 5,
    orderIndex: suggestedNextOrderByLevel.BEGINNER || 1,
    isPublished: true,
  };
};

export default function AdminModuleFormModal({
  isOpen,
  onClose,
  initialModule,
  SuggestedNextOrderByLevel = {},
  onSubmitModule,
}) {
  if (!isOpen) return null;

  return (
    <AdminModuleFormModalContent
      key={initialModule?.id || "new-module"}
      onClose={onClose}
      initialModule={initialModule}
      suggestedNextOrderByLevel={SuggestedNextOrderByLevel}
      onSubmitModule={onSubmitModule}
    />
  );
}

function AdminModuleFormModalContent({
  onClose,
  initialModule,
  suggestedNextOrderByLevel,
  onSubmitModule,
}) {
  const isEditMode = Boolean(initialModule?.id);

  const [form, setForm] = useState(() =>
    getInitialFormState(initialModule, suggestedNextOrderByLevel)
  );
  const [slugLocked, setSlugLocked] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [editorTab, setEditorTab] = useState("write"); // "write" | "preview"
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (errorMessage) setErrorMessage("");
  };

  const handleTitleChange = (value) => {
    clearFieldError("title");
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
        ? suggestedNextOrderByLevel[newLevel] || prev.orderIndex
        : prev.orderIndex,
    }));
  };

  const insertSnippet = (snippet) => {
    clearFieldError("contentBody");
    setForm((prev) => ({
      ...prev,
      contentBody: prev.contentBody
        ? `${prev.contentBody.trimEnd()}\n\n${snippet}\n`
        : `${snippet}\n`,
    }));
    setEditorTab("write");
  };

  const validateClient = () => {
    const errors = {};
    const trimmedTitle = form.title.trim();
    const candidateSlug = (form.slug || toSlugClient(form.title)).trim();
    const trimmedContent = form.contentBody.trim();
    const minutes = Number(form.estimatedMinutes);
    const order = Number(form.orderIndex);

    if (!trimmedTitle) {
      errors.title = "Judul materi wajib diisi.";
    } else if (trimmedTitle.length < 5) {
      errors.title = "Judul materi minimal 5 karakter.";
    }

    if (!candidateSlug || candidateSlug.length < 3) {
      errors.slug = "Slug URL minimal 3 karakter.";
      setShowAdvancedSettings(true);
    }

    if (!trimmedContent) {
      errors.contentBody = "Konten pembelajaran wajib diisi.";
    } else if (trimmedContent.length < 20) {
      errors.contentBody = "Konten pembelajaran minimal 20 karakter.";
    }

    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) {
      errors.estimatedMinutes = "Durasi baca harus antara 1 hingga 180 menit.";
    }

    if (!Number.isFinite(order) || order < 1 || order > 999) {
      errors.orderIndex = "Urutan tampil harus antara 1 hingga 999.";
      setShowAdvancedSettings(true);
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitWithPublishStatus = async (overridePublished) => {
    setErrorMessage("");
    setFieldErrors({});

    if (!validateClient()) return;

    const targetPublished =
      overridePublished !== undefined ? Boolean(overridePublished) : Boolean(form.isPublished);

    try {
      setIsSaving(true);
      await onSubmitModule({
        title: form.title.trim(),
        slug: form.slug || toSlugClient(form.title),
        level: form.level,
        summary: form.summary.trim(),
        contentBody: form.contentBody,
        estimatedMinutes: Number(form.estimatedMinutes),
        orderIndex: Number(form.orderIndex),
        isPublished: targetPublished,
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Gagal menyimpan materi pembelajaran.");
      if (Array.isArray(err.details) && err.details.length > 0) {
        const mapped = {};
        for (const d of err.details) {
          if (d.field) mapped[d.field] = d.message;
        }
        if (mapped.slug || mapped.orderIndex) {
          setShowAdvancedSettings(true);
        }
        setFieldErrors(mapped);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitWithPublishStatus(form.isPublished);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="module-form-modal-title"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5"
    >
      <div className="w-full max-w-4xl max-h-[92vh] rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-white dark:bg-[#101010] border-b border-slate-200 dark:border-[#242424] flex items-center justify-between gap-3">
          <div>
            <h2
              id="module-form-modal-title"
              className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
            >
              {isEditMode ? "Edit Materi Pembelajaran" : "Tambah Materi Pembelajaran"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Lengkapi informasi materi dan pengaturan kurikulum sebelum menyimpan.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Tutup form"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {errorMessage && (
            <div
              role="alert"
              className="px-4 py-3 rounded-lg bg-rose-50 dark:bg-[#2a0e12] border border-rose-200 dark:border-[#4c151c] text-xs text-rose-700 dark:text-[#f87171]"
            >
              {errorMessage}
            </div>
          )}

          {/* BAGIAN 1: INFORMASI MATERI */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-[#1e1e1e] pb-2">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                1. Informasi Materi
              </h3>
            </div>

            <div>
              <label
                htmlFor="module-title"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Judul Materi <span className="text-rose-500">*</span>
              </label>
              <input
                id="module-title"
                type="text"
                required
                disabled={isSaving}
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Analisis Profitabilitas: Return on Equity (ROE)"
                className={`w-full h-10 px-3.5 rounded-lg text-sm bg-white dark:bg-[#0a0a0a] border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none transition-colors ${
                  fieldErrors.title
                    ? "border-rose-500 dark:border-[#f87171]"
                    : "border-slate-200 dark:border-[#272727] focus:border-slate-900 dark:focus:border-slate-400"
                }`}
              />
              {fieldErrors.title && (
                <p className="text-xs text-rose-600 dark:text-[#f87171] mt-1">
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="module-summary"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Ringkasan Materi
              </label>
              <textarea
                id="module-summary"
                rows={2}
                maxLength={500}
                disabled={isSaving}
                value={form.summary}
                onChange={(e) => {
                  clearFieldError("summary");
                  setForm((prev) => ({ ...prev, summary: e.target.value }));
                }}
                placeholder="Ringkasan singkat (1–2 kalimat) mengenai kompetensi yang dipelajari pada materi ini..."
                className="w-full p-3 rounded-lg text-xs sm:text-sm bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus:border-slate-900 dark:focus:border-slate-400 transition-colors"
              />
            </div>

            {/* Editor Konten & Pratinjau */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="module-content"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Konten Pembelajaran <span className="text-rose-500">*</span>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        insertSnippet("## Subjudul Pembahasan\nTuliskan penjelasan konsep di sini.")
                      }
                      className="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 dark:bg-[#161616] border border-slate-200 dark:border-[#272727] text-slate-600 dark:text-slate-300 hover:border-slate-400 cursor-pointer"
                    >
                      + Subjudul
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertSnippet(
                          "```\nROE (%) = (Laba Bersih Setahun / Total Ekuitas) × 100%\n```"
                        )
                      }
                      className="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 dark:bg-[#161616] border border-slate-200 dark:border-[#272727] text-slate-600 dark:text-slate-300 hover:border-slate-400 cursor-pointer"
                    >
                      + Formula
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertSnippet(
                          "> **Catatan Penting**: Tuliskan poin utama analisis di sini."
                        )
                      }
                      className="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 dark:bg-[#161616] border border-slate-200 dark:border-[#272727] text-slate-600 dark:text-slate-300 hover:border-slate-400 cursor-pointer"
                    >
                      + Kutipan
                    </button>
                  </div>

                  <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-[#161616] border border-slate-200 dark:border-[#272727]">
                    <button
                      type="button"
                      onClick={() => setEditorTab("write")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        editorTab === "write"
                          ? "bg-white dark:bg-[#242424] text-slate-900 dark:text-white"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Tulis Materi
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("preview")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        editorTab === "preview"
                          ? "bg-white dark:bg-[#242424] text-slate-900 dark:text-white"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Pratinjau
                    </button>
                  </div>
                </div>
              </div>

              {editorTab === "write" ? (
                <div>
                  <textarea
                    id="module-content"
                    rows={10}
                    required
                    disabled={isSaving}
                    value={form.contentBody}
                    onChange={(e) => {
                      clearFieldError("contentBody");
                      setForm((prev) => ({ ...prev, contentBody: e.target.value }));
                    }}
                    placeholder="Tulis isi materi pembelajaran. Gunakan format Markdown atau tombol bantu di atas untuk menambahkan subjudul dan kotak rumus..."
                    className={`w-full p-3.5 rounded-lg text-xs sm:text-sm font-mono leading-relaxed bg-white dark:bg-[#0a0a0a] border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none transition-colors custom-scrollbar ${
                      fieldErrors.contentBody
                        ? "border-rose-500 dark:border-[#f87171]"
                        : "border-slate-200 dark:border-[#272727] focus:border-slate-900 dark:focus:border-slate-400"
                    }`}
                  />
                  {fieldErrors.contentBody && (
                    <p className="text-xs text-rose-600 dark:text-[#f87171] mt-1">
                      {fieldErrors.contentBody}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] min-h-[240px]">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#242424] pb-3 mb-4">
                    <div>
                      <LevelBadge level={form.level} />
                      <h4 className="text-base font-semibold text-slate-900 dark:text-white mt-1.5">
                        {form.title || "Judul Materi"}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {form.estimatedMinutes || 5} menit baca
                    </span>
                  </div>
                  <MarkdownArticlePreview content={form.contentBody} />
                </div>
              )}
            </div>
          </div>

          {/* BAGIAN 2: PENGATURAN MATERI */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 dark:border-[#1e1e1e] pb-2">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                2. Pengaturan Materi
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Jenjang Pembelajaran */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenjang Pembelajaran <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(LEVEL_META).map((lvl) => {
                    const active = form.level === lvl.id;
                    return (
                      <button
                        type="button"
                        key={lvl.id}
                        disabled={isSaving}
                        onClick={() => handleLevelChange(lvl.id)}
                        className={`h-10 px-3 rounded-lg border text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
                          active
                            ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 font-semibold"
                            : "border-slate-200 dark:border-[#272727] bg-white dark:bg-[#0a0a0a] text-slate-600 dark:text-slate-400 hover:border-slate-400"
                        }`}
                      >
                        <span>{lvl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Estimasi Durasi */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="module-duration"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Estimasi Durasi (Menit) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="module-duration"
                  type="number"
                  min={1}
                  max={180}
                  required
                  disabled={isSaving}
                  value={form.estimatedMinutes}
                  onChange={(e) => {
                    clearFieldError("estimatedMinutes");
                    setForm((prev) => ({ ...prev, estimatedMinutes: e.target.value }));
                  }}
                  className="w-full h-10 px-3 rounded-lg text-sm font-mono tabular-nums bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-slate-100 focus-visible:outline-none focus:border-slate-900 dark:focus:border-slate-400"
                />
                {fieldErrors.estimatedMinutes && (
                  <p className="text-xs text-rose-600 dark:text-[#f87171] mt-1">
                    {fieldErrors.estimatedMinutes}
                  </p>
                )}
              </div>

              {/* Status Publikasi */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="module-status"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Status Publikasi
                </label>
                <select
                  id="module-status"
                  disabled={isSaving}
                  value={form.isPublished ? "published" : "draft"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isPublished: e.target.value === "published",
                    }))
                  }
                  className="w-full h-10 px-3 rounded-lg text-xs font-medium bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-slate-100 focus-visible:outline-none focus:border-slate-900 dark:focus:border-slate-400 cursor-pointer"
                >
                  <option value="published">Terbit (Published)</option>
                  <option value="draft">Draft (Disembunyikan)</option>
                </select>
              </div>
            </div>

            {/* Pengaturan Teknis Opsional (Slug URL & Urutan Tampil) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
              >
                {showAdvancedSettings ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                <span>Pengaturan URL Slug &amp; Urutan Tampil</span>
              </button>

              {showAdvancedSettings && (
                <div className="mt-3 p-4 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#242424] grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8">
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="module-slug"
                        className="text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Slug URL
                      </label>
                      <button
                        type="button"
                        onClick={() => setSlugLocked(!slugLocked)}
                        className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
                      >
                        {slugLocked ? (
                          <>
                            <Lock className="w-3 h-3" /> Ubah manual
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" /> Buat otomatis
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      id="module-slug"
                      type="text"
                      readOnly={slugLocked}
                      value={form.slug}
                      onChange={(e) => {
                        clearFieldError("slug");
                        setForm((prev) => ({ ...prev, slug: toSlugClient(e.target.value) }));
                      }}
                      placeholder="contoh-slug-materi"
                      className={`w-full h-9 px-3 rounded-lg text-xs font-mono bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-slate-100 focus-visible:outline-none ${
                        slugLocked ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    />
                    {fieldErrors.slug && (
                      <p className="text-xs text-rose-600 dark:text-[#f87171] mt-1">
                        {fieldErrors.slug}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-4">
                    <label
                      htmlFor="module-order"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Urutan Tampil di Jenjang Ini
                    </label>
                    <input
                      id="module-order"
                      type="number"
                      min={1}
                      max={999}
                      value={form.orderIndex}
                      onChange={(e) => {
                        clearFieldError("orderIndex");
                        setForm((prev) => ({ ...prev, orderIndex: e.target.value }));
                      }}
                      className="w-full h-9 px-3 rounded-lg text-xs font-mono tabular-nums bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-slate-100 focus-visible:outline-none"
                    />
                    {fieldErrors.orderIndex && (
                      <p className="text-xs text-rose-600 dark:text-[#f87171] mt-1">
                        {fieldErrors.orderIndex}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Tombol Simpan */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#242424] flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={onClose}
              className="h-9 px-4 rounded-lg text-xs font-medium border-slate-200 dark:border-[#272727] bg-white dark:bg-[#141414] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e1e1e] cursor-pointer"
            >
              Batal
            </Button>

            {!isEditMode && (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => submitWithPublishStatus(false)}
                className="h-9 px-4 rounded-lg text-xs font-medium border-slate-200 dark:border-[#272727] bg-slate-50 dark:bg-[#161616] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#202020] cursor-pointer"
              >
                Simpan Draft
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSaving}
              className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 cursor-pointer"
            >
              {isSaving
                ? "Menyimpan..."
                : isEditMode
                  ? "Simpan Perubahan"
                  : form.isPublished
                    ? "Terbitkan Materi"
                    : "Simpan Materi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
