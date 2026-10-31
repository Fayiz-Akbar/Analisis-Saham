import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileQuestion,
  FileText,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import AdminModuleFormModal from "./AdminModuleFormModal";
import { LevelBadge, MarkdownArticlePreview } from "./adminConstants";

export default function AdminModuleManagement({
  modules = [],
  isLoading,
  onCreateModule,
  onUpdateModule,
  onDeleteModule,
  onOpenModuleQuizzes,
}) {
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Form Create/Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  // Modal Pratinjau Artikel
  const [previewModule, setPreviewModule] = useState(null);

  // Modal Konfirmasi Hapus
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle status terbit langsung dari tabel
  const [togglingId, setTogglingId] = useState(null);

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
    return modules.filter((mod) => {
      if (levelFilter !== "ALL" && mod.level !== levelFilter) return false;
      const isPub = Boolean(mod.isPublished ?? mod.is_published);
      if (statusFilter === "published" && !isPub) return false;
      if (statusFilter === "draft" && isPub) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = mod.title?.toLowerCase().includes(q);
        const matchSlug = mod.slug?.toLowerCase().includes(q);
        const matchSummary = mod.summary?.toLowerCase().includes(q);
        if (!matchTitle && !matchSlug && !matchSummary) return false;
      }
      return true;
    });
  }, [modules, levelFilter, statusFilter, searchQuery]);

  const handleOpenCreate = () => {
    setEditingModule(null);
    setIsFormOpen(true);
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

  const handleTogglePublish = async (mod) => {
    try {
      setTogglingId(mod.id);
      const currentPublished = Boolean(mod.isPublished ?? mod.is_published);
      await onUpdateModule(mod.id, { isPublished: !currentPublished });
    } finally {
      setTogglingId(null);
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
    <div className="space-y-4">
      {/* Toolbar Atas: Filter Level, Filter Status, Search, dan Tombol Tambah Materi */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Level Kurikulum (Clean Segmented) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10">
            {[
              { id: "ALL", label: "Semua Level" },
              { id: "BEGINNER", label: "Pemula" },
              { id: "INTERMEDIATE", label: "Menengah" },
              { id: "ADVANCED", label: "Mahir" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLevelFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  levelFilter === item.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Filter Status Publikasi */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10">
            {[
              { id: "ALL", label: "Semua Status" },
              { id: "published", label: "Terbit" },
              { id: "draft", label: "Draft" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kanan: Pencarian & Tombol + Tambah Materi Baru */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau slug..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c0e14] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Materi
          </button>
        </div>
      </div>

      {/* Tabel Kurikulum Materi Pembelajaran */}
      <div className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-[#272727] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase font-mono">
              Kurikulum Materi Pembelajaran ({filteredModules.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Klik kolom bank soal untuk langsung mengelola kuis terkait
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#272727] bg-slate-50/80 dark:bg-[#0c0e14] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                <th className="py-3 px-4 w-14">#</th>
                <th className="py-3 px-4">Judul & Ringkasan</th>
                <th className="py-3 px-4">Slug URL</th>
                <th className="py-3 px-4">Jenjang</th>
                <th className="py-3 px-4">Durasi</th>
                <th className="py-3 px-4">Bank Soal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-[#272727] text-xs">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="py-3.5 px-4 space-y-1.5">
                      <div className="h-4 w-52 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-64 bg-slate-100 dark:bg-slate-800/60 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredModules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-6 text-center space-y-2">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tidak ada modul pembelajaran yang sesuai filter
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Ganti kata kunci pencarian atau buat modul baru menggunakan tombol Tambah Materi.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredModules.map((mod) => {
                  const isPublished = Boolean(mod.isPublished ?? mod.is_published);
                  const orderIndex = mod.orderIndex ?? mod.order_index ?? 1;
                  const estimatedMinutes = mod.estimatedMinutes ?? mod.estimated_minutes ?? 5;
                  const quizCount = mod.quizCount ?? mod.quiz_count ?? 0;

                  return (
                    <tr
                      key={mod.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* 1. Urutan */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
                          #{orderIndex}
                        </span>
                      </td>

                      {/* 2. Judul & Ringkasan */}
                      <td className="py-3 px-4 max-w-md">
                        <button
                          type="button"
                          onClick={() => setPreviewModule(mod)}
                          className="text-left group cursor-pointer"
                        >
                          <span className="font-bold text-slate-900 dark:text-white group-hover:underline block leading-snug">
                            {mod.title}
                          </span>
                          {mod.summary && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 block">
                              {mod.summary}
                            </span>
                          )}
                        </button>
                      </td>

                      {/* 3. Slug */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#0c0e14] px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
                          /{mod.slug}
                        </span>
                      </td>

                      {/* 4. Tingkat Kesulitan */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <LevelBadge level={mod.level} />
                      </td>

                      {/* 5. Estimasi Waktu Baca */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {estimatedMinutes} Menit
                        </span>
                      </td>

                      {/* 6. Jumlah Soal Kuis (Klik untuk Kelola Kuis Modul) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onOpenModuleQuizzes && onOpenModuleQuizzes(mod)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                          title="Kelola Bank Soal Kuis untuk modul ini"
                        >
                          <FileQuestion className="w-3 h-3 text-slate-400" />
                          {quizCount} Soal →
                        </button>
                      </td>

                      {/* 7. Status Publikasi (Klik untuk Toggle) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={togglingId === mod.id}
                          onClick={() => handleTogglePublish(mod)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            isPublished
                              ? "bg-[#062c19]/70 text-[#34d399] border border-[#0e4429]"
                              : "bg-slate-100 dark:bg-[#1a1f2c] text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                          }`}
                          title="Klik untuk mengubah status Terbit / Draft"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {togglingId === mod.id ? "..." : isPublished ? "Terbit" : "Draft"}
                        </button>
                      </td>

                      {/* 8. Aksi */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewModule(mod)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            title="Pratinjau Artikel"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(mod)}
                            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(mod)}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-[#4c151c] text-rose-600 dark:text-[#f87171] hover:bg-rose-50 dark:hover:bg-[#2a0e12] transition-colors cursor-pointer"
                            title="Hapus Modul"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit Modul */}
      <AdminModuleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialModule={editingModule}
        SuggestedNextOrderByLevel={suggestedNextOrderByLevel}
        onSubmitModule={handleSubmitForm}
      />

      {/* Modal Pratinjau Artikel (Clean Flat Surface) */}
      {previewModule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[88vh] rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-[#272727] flex items-center justify-between gap-3 bg-slate-50 dark:bg-[#0c0e14]">
              <div className="flex items-center gap-2">
                <LevelBadge level={previewModule.level} showFull />
                <span className="font-mono text-xs text-slate-400">
                  #{previewModule.orderIndex ?? previewModule.order_index} •{" "}
                  {previewModule.estimatedMinutes ?? previewModule.estimated_minutes} Menit Baca
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModule(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {previewModule.title}
                </h2>
                <span className="text-xs font-mono text-slate-400 block mt-1">
                  Slug: /learn/{previewModule.slug}
                </span>
              </div>

              {previewModule.summary && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {previewModule.summary}
                </div>
              )}

              <MarkdownArticlePreview
                content={previewModule.contentBody || previewModule.content_body}
              />
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-[#272727] flex items-center justify-between bg-slate-50 dark:bg-[#0c0e14]">
              <button
                type="button"
                onClick={() => {
                  const mod = previewModule;
                  setPreviewModule(null);
                  if (onOpenModuleQuizzes) onOpenModuleQuizzes(mod);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Kelola Bank Soal ({previewModule.quizCount ?? 0} Soal) →
              </button>
              <button
                type="button"
                onClick={() => {
                  const mod = previewModule;
                  setPreviewModule(null);
                  handleOpenEdit(mod);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 cursor-pointer"
              >
                Edit Modul
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Modul (Clean Flat Alert) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-rose-600 dark:text-[#f87171] font-bold text-xs uppercase font-mono tracking-wider">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Konfirmasi Penghapusan Modul</span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Hapus "{deleteTarget.title}"?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Modul ini akan dihapus permanen.
                {(deleteTarget.quizCount ?? 0) > 0 && (
                  <span className="block mt-1 text-rose-600 dark:text-[#f87171] font-semibold">
                    Perhatian: {deleteTarget.quizCount} butir soal kuis pada modul ini akan otomatis terhapus (Cascade Delete).
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#272727]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 cursor-pointer transition-colors"
              >
                {isDeleting ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
