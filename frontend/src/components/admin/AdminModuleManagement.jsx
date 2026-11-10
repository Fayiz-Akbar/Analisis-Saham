import React, { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminModuleFormModal from "./AdminModuleFormModal";
import { LevelBadge, MarkdownArticlePreview } from "./adminConstants";

const LEVEL_ORDER = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 };
const PAGE_SIZE = 10;

export default function AdminModuleManagement({
  modules = [],
  isLoading,
  onCreateModule,
  onUpdateModule,
  onDeleteModule,
  onOpenModuleQuizzes,
  externalCreateModalOpen = false,
  onExternalCreateModalHandled,
}) {
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("curriculum"); // "curriculum" | "updated" | "title" | "quizzes"
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Form Create/Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  // Modal Pratinjau Artikel
  const [previewModule, setPreviewModule] = useState(null);

  // Modal Konfirmasi Perubahan Status Publikasi
  const [statusToggleTarget, setStatusToggleTarget] = useState(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Modal Konfirmasi Hapus
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCreateModalVisible = isFormOpen || externalCreateModalOpen;

  // Hitung saran order_index berikutnya per level
  const suggestedNextOrderByLevel = useMemo(() => {
    const next = { BEGINNER: 1, INTERMEDIATE: 1, ADVANCED: 1 };
    for (const m of modules) {
      const currentOrder = Number(m.orderIndex ?? m.order_index ?? 0);
      if (next[m.level] !== undefined && currentOrder >= next[m.level]) {
        next[m.level] = currentOrder + 1;
      }
    }
    return next;
  }, [modules]);

  const filteredModules = useMemo(() => {
    const filtered = modules.filter((mod) => {
      if (levelFilter !== "ALL" && mod.level !== levelFilter) return false;
      const isPub = Boolean(mod.isPublished ?? mod.is_published);
      if (statusFilter === "published" && !isPub) return false;
      if (statusFilter === "draft" && isPub) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = mod.title?.toLowerCase().includes(q);
        const matchSummary = mod.summary?.toLowerCase().includes(q);
        if (!matchTitle && !matchSummary) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "", "id");
      }
      if (sortBy === "quizzes") {
        const qa = a.quizCount ?? a.quiz_count ?? 0;
        const qb = b.quizCount ?? b.quiz_count ?? 0;
        return qb - qa;
      }
      if (sortBy === "updated") {
        const da = new Date(a.updatedAt || a.updated_at || a.createdAt || 0).getTime();
        const db = new Date(b.updatedAt || b.updated_at || b.createdAt || 0).getTime();
        return db - da;
      }
      // Default: urutan kurikulum (level -> orderIndex)
      const lvlDiff = (LEVEL_ORDER[a.level] || 99) - (LEVEL_ORDER[b.level] || 99);
      if (lvlDiff !== 0) return lvlDiff;
      return (a.orderIndex ?? a.order_index ?? 1) - (b.orderIndex ?? b.order_index ?? 1);
    });
  }, [modules, levelFilter, statusFilter, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredModules.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedModules = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredModules.slice(start, start + PAGE_SIZE);
  }, [filteredModules, safePage]);

  const hasActiveFilters =
    levelFilter !== "ALL" || statusFilter !== "ALL" || Boolean(searchQuery.trim());

  const handleResetFilters = () => {
    setLevelFilter("ALL");
    setStatusFilter("ALL");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingModule(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingModule(null);
    if (onExternalCreateModalHandled) onExternalCreateModalHandled();
  };

  const handleOpenEdit = (mod) => {
    setEditingModule(mod);
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (formPayload) => {
    if (editingModule?.id) {
      await onUpdateModule(editingModule.id, formPayload);
    } else {
      await onCreateModule(formPayload);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusToggleTarget) return;
    try {
      setIsTogglingStatus(true);
      const currentPublished = Boolean(
        statusToggleTarget.isPublished ?? statusToggleTarget.is_published
      );
      await onUpdateModule(statusToggleTarget.id, { isPublished: !currentPublished });
      setStatusToggleTarget(null);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await onDeleteModule(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Materi Pembelajaran
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola materi, jenjang pembelajaran, dan soal terkait.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreate}
          className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Materi</span>
        </Button>
      </div>

      {/* Area Toolbar Ringkas: Pencarian, Filter Jenjang, Filter Status, & Sorting */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Kiri: Search Judul Materi */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari judul materi..."
            aria-label="Cari judul materi"
            className="w-full h-9 pl-9 pr-8 rounded-lg text-xs sm:text-sm bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus:border-slate-900 dark:focus:border-slate-400 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Kanan: Filter Jenjang, Status, & Urutan */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter Jenjang"
            className="h-9 px-3 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-700 dark:text-slate-200 focus-visible:outline-none focus:border-slate-900 dark:focus:border-slate-400 cursor-pointer"
          >
            <option value="ALL">Semua Jenjang</option>
            <option value="BEGINNER">Pemula</option>
            <option value="INTERMEDIATE">Menengah</option>
            <option value="ADVANCED">Mahir</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter Status"
            className="h-9 px-3 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-700 dark:text-slate-200 focus-visible:outline-none focus:border-slate-900 dark:focus:border-slate-400 cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="published">Terbit</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Urutkan Materi"
            className="h-9 px-3 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-700 dark:text-slate-200 focus-visible:outline-none focus:border-slate-900 dark:focus:border-slate-400 cursor-pointer"
          >
            <option value="curriculum">Urutan Kurikulum</option>
            <option value="updated">Terbaru Diperbarui</option>
            <option value="title">Judul (A–Z)</option>
            <option value="quizzes">Jumlah Soal</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-9 px-3 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Kontainer Data Materi */}
      <div className="rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-14 rounded-lg bg-slate-100 dark:bg-[#181818] animate-pulse"
              />
            ))}
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
              {modules.length === 0
                ? "Belum ada materi pembelajaran."
                : "Tidak ada materi yang sesuai dengan pencarian atau filter."}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {modules.length === 0
                ? "Mulai susun kurikulum dengan menambahkan materi pembelajaran pertama."
                : "Coba ubah kata kunci pencarian atau atur ulang filter yang aktif."}
            </p>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                className="h-8 px-3 text-xs rounded-lg cursor-pointer"
              >
                Reset Filter
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleOpenCreate}
                className="h-8 px-3 text-xs rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
              >
                + Tambah Materi
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Tabel Desktop & Tablet */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#242424] bg-slate-50/70 dark:bg-[#0c0c0c] text-xs font-medium text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-5">Materi</th>
                    <th className="py-3.5 px-4 w-32">Jenjang</th>
                    <th className="py-3.5 px-4 w-28">Durasi</th>
                    <th className="py-3.5 px-4 w-32">Bank Soal</th>
                    <th className="py-3.5 px-4 w-28">Status</th>
                    <th className="py-3.5 px-5 text-right w-72">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-[#222222] text-xs sm:text-sm">
                  {paginatedModules.map((mod) => {
                    const isPublished = Boolean(mod.isPublished ?? mod.is_published);
                    const estimatedMinutes =
                      mod.estimatedMinutes ?? mod.estimated_minutes ?? 5;
                    const quizCount = mod.quizCount ?? mod.quiz_count ?? 0;

                    return (
                      <tr
                        key={mod.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* 1. Materi (Judul & Ringkasan Singkat) */}
                        <td className="py-4 px-5 max-w-md">
                          <div className="font-medium text-slate-900 dark:text-slate-100 leading-snug">
                            {mod.title}
                          </div>
                          {mod.summary && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                              {mod.summary}
                            </p>
                          )}
                        </td>

                        {/* 2. Jenjang */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <LevelBadge level={mod.level} />
                        </td>

                        {/* 3. Durasi */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-mono tabular-nums">
                          {estimatedMinutes} menit
                        </td>

                        {/* 4. Bank Soal */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                          {quizCount} soal
                        </td>

                        {/* 5. Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setStatusToggleTarget(mod)}
                            title="Klik untuk mengubah status publikasi"
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                              isPublished
                                ? "bg-emerald-50 dark:bg-[#062c19]/70 text-emerald-700 dark:text-[#34d399] border border-emerald-200 dark:border-[#0e4429]"
                                : "bg-slate-100 dark:bg-[#18181b] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#27272a]"
                            }`}
                          >
                            {isPublished ? "Terbit" : "Draft"}
                          </button>
                        </td>

                        {/* 6. Aksi */}
                        <td className="py-4 px-5 whitespace-nowrap text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenModuleQuizzes && onOpenModuleQuizzes(mod)}
                              className="h-8 px-3 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 transition-colors cursor-pointer"
                            >
                              Kelola Soal
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(mod)}
                              className="h-8 px-2.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272727] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewModule(mod)}
                              className="h-8 px-2.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272727] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                            >
                              Pratinjau
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(mod)}
                              className="h-8 px-2.5 rounded-lg text-xs font-medium text-rose-600 dark:text-[#f87171] hover:bg-rose-50 dark:hover:bg-[#2a0e12]/60 transition-colors cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Daftar Item Mobile (< md) */}
            <div className="md:hidden divide-y divide-slate-200 dark:divide-[#242424]">
              {paginatedModules.map((mod) => {
                const isPublished = Boolean(mod.isPublished ?? mod.is_published);
                const estimatedMinutes = mod.estimatedMinutes ?? mod.estimated_minutes ?? 5;
                const quizCount = mod.quizCount ?? mod.quiz_count ?? 0;

                return (
                  <div key={mod.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                          {mod.title}
                        </h3>
                        {mod.summary && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {mod.summary}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setStatusToggleTarget(mod)}
                        className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          isPublished
                            ? "bg-emerald-50 dark:bg-[#062c19]/70 text-emerald-700 dark:text-[#34d399] border border-emerald-200 dark:border-[#0e4429]"
                            : "bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#2e2e2e]"
                        }`}
                      >
                        {isPublished ? "Terbit" : "Draft"}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <LevelBadge level={mod.level} />
                      <span>{estimatedMinutes} menit</span>
                      <span>•</span>
                      <span>{quizCount} soal</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onOpenModuleQuizzes && onOpenModuleQuizzes(mod)}
                        className="h-8 px-3 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
                      >
                        Kelola Soal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(mod)}
                        className="h-8 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272727] text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewModule(mod)}
                        className="h-8 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272727] text-slate-600 dark:text-slate-400 cursor-pointer"
                      >
                        Pratinjau
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(mod)}
                        className="h-8 px-2.5 rounded-lg text-xs font-medium text-rose-600 dark:text-[#f87171] cursor-pointer ml-auto"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Tabel / Pagination */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-[#242424] bg-slate-50/50 dark:bg-[#0c0c0c] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Menampilkan {paginatedModules.length} dari {filteredModules.length} materi
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-[#272727] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-2 font-mono">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-[#272727] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] cursor-pointer"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal Form Tambah / Edit Materi */}
      <AdminModuleFormModal
        isOpen={isCreateModalVisible}
        onClose={handleCloseForm}
        initialModule={editingModule}
        SuggestedNextOrderByLevel={suggestedNextOrderByLevel}
        onSubmitModule={handleSubmitForm}
      />

      {/* Modal Pratinjau Materi */}
      {previewModule && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-module-title"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-3xl max-h-[88vh] rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#242424] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <LevelBadge level={previewModule.level} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {previewModule.estimatedMinutes ?? previewModule.estimated_minutes} menit baca
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModule(null)}
                aria-label="Tutup pratinjau"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div>
                <h2
                  id="preview-module-title"
                  className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-white"
                >
                  {previewModule.title}
                </h2>
                <span className="text-xs font-mono text-slate-400 block mt-1">
                  Slug: /{previewModule.slug}
                </span>
              </div>

              {previewModule.summary && (
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#242424] text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {previewModule.summary}
                </div>
              )}

              <MarkdownArticlePreview
                content={previewModule.contentBody || previewModule.content_body}
              />
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 dark:border-[#242424] flex items-center justify-between bg-slate-50/50 dark:bg-[#0c0c0c]">
              <button
                type="button"
                onClick={() => {
                  const mod = previewModule;
                  setPreviewModule(null);
                  if (onOpenModuleQuizzes) onOpenModuleQuizzes(mod);
                }}
                className="h-9 px-3.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272727] bg-white dark:bg-[#141414] text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                Kelola Soal ({previewModule.quizCount ?? 0})
              </button>
              <button
                type="button"
                onClick={() => {
                  const mod = previewModule;
                  setPreviewModule(null);
                  handleOpenEdit(mod);
                }}
                className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 cursor-pointer"
              >
                Edit Materi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Perubahan Status Publikasi */}
      {statusToggleTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-6 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Ubah Status Publikasi Materi?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Materi{" "}
                <strong className="text-slate-900 dark:text-slate-200">
                  &ldquo;{statusToggleTarget.title}&rdquo;
                </strong>{" "}
                akan diubah menjadi{" "}
                <strong className="text-slate-900 dark:text-slate-200">
                  {statusToggleTarget.isPublished ?? statusToggleTarget.is_published
                    ? "Draft (Disembunyikan)"
                    : "Terbit (Published)"}
                </strong>
                .
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isTogglingStatus}
                onClick={() => setStatusToggleTarget(null)}
                className="h-9 px-3.5 rounded-lg text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={isTogglingStatus}
                onClick={handleConfirmToggleStatus}
                className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
              >
                {isTogglingStatus ? "Menyimpan..." : "Ya, Ubah Status"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Materi */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-6 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Hapus Materi Pembelajaran?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Anda akan menghapus materi{" "}
                <strong className="text-slate-900 dark:text-slate-200">
                  &ldquo;{deleteTarget.title}&rdquo;
                </strong>
                . Tindakan ini bersifat permanen.
              </p>
              {(deleteTarget.quizCount ?? 0) > 0 && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-[#2a0e12] border border-rose-200 dark:border-[#4c151c] text-xs text-rose-700 dark:text-[#f87171]">
                  Materi ini memiliki <strong>{deleteTarget.quizCount} soal kuis</strong> terkait
                  yang juga akan ikut terhapus sesuai relasi database.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="h-9 px-3.5 rounded-lg text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="h-9 px-4 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
              >
                {isDeleting ? "Menghapus..." : "Hapus Materi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
