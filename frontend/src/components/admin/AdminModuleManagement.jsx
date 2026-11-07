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
import { LEVEL_META, LevelBadge, MarkdownArticlePreview } from "./adminConstants";

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
    <div className="space-y-5">
      {/* Toolbar Atas: Filter Level, Filter Status, Search, dan Tombol Tambah Materi */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Level Kurikulum */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800/90">
            {[
              { id: "ALL", label: "Semua Level" },
              { id: "BEGINNER", label: "🟢 Pemula" },
              { id: "INTERMEDIATE", label: "🟡 Menengah" },
              { id: "ADVANCED", label: "🔴 Mahir" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLevelFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  levelFilter === item.id
                    ? "bg-white text-slate-950 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Filter Status Publikasi */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800/90">
            {[
              { id: "ALL", label: "Semua Status" },
              { id: "published", label: "Published" },
              { id: "draft", label: "Draft" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? "bg-white text-slate-950 shadow-2xs"
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau slug modul..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500"
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
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Materi Baru
          </button>
        </div>
      </div>

      {/* Tabel Daftar Artikel Materi Pembelajaran */}
      <div className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#272727] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              Tabel Kurikulum Materi Pembelajaran ({filteredModules.length} Modul)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Klik jumlah soal kuis untuk langsung mengelola butir soal pada modul terkait
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800/90 bg-slate-50/70 dark:bg-[#12151e]/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4 w-16">Urutan</th>
                <th className="py-3.5 px-4">Judul & Ringkasan Materi</th>
                <th className="py-3.5 px-4">Slug URL</th>
                <th className="py-3.5 px-4">Tingkat Kesulitan</th>
                <th className="py-3.5 px-4">Waktu Baca</th>
                <th className="py-3.5 px-4">Bank Soal</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/70 text-xs">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-5 w-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </td>
                    <td className="py-4 px-4 space-y-2">
                      <div className="h-4 w-56 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-72 bg-slate-100 dark:bg-slate-800/60 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredModules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-6 text-center space-y-2">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto opacity-60" />
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Belum ada modul pembelajaran yang sesuai filter
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Tambahkan modul materi baru atau ubah filter pencarian untuk melihat daftar kurikulum.
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
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* 1. Urutan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 font-mono font-bold tabular-nums text-slate-700 dark:text-slate-300">
                          #{orderIndex}
                        </span>
                      </td>

                      {/* 2. Judul & Ringkasan */}
                      <td className="py-3.5 px-4 max-w-md">
                        <button
                          type="button"
                          onClick={() => setPreviewModule(mod)}
                          className="text-left group cursor-pointer"
                        >
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors block leading-snug">
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
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#12151e] px-2 py-1 rounded-md border border-slate-200/70 dark:border-slate-800">
                          /{mod.slug}
                        </span>
                      </td>

                      {/* 4. Tingkat Kesulitan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <LevelBadge level={mod.level} />
                      </td>

                      {/* 5. Estimasi Waktu Baca */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono font-bold tabular-nums text-slate-700 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {estimatedMinutes} Menit
                        </span>
                      </td>

                      {/* 6. Jumlah Soal Kuis (Klik untuk Kelola Kuis Modul) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onOpenModuleQuizzes && onOpenModuleQuizzes(mod)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono tabular-nums bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                          title="Kelola Bank Soal Kuis untuk modul ini"
                        >
                          <FileQuestion className="w-3.5 h-3.5" />
                          {quizCount} Soal →
                        </button>
                      </td>

                      {/* 7. Status Publikasi (Klik untuk Toggle) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={togglingId === mod.id}
                          onClick={() => handleTogglePublish(mod)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            isPublished
                              ? "bg-emerald-950/10 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                          }`}
                          title="Klik untuk mengubah status Published / Draft"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {togglingId === mod.id ? "..." : isPublished ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* 8. Aksi */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewModule(mod)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 transition-colors cursor-pointer"
                            title="Pratinjau Isi Materi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(mod)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(mod)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hps
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

      {/* Modal Pratinjau Artikel */}
      {previewModule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[88vh] rounded-3xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#12151e] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <LevelBadge level={previewModule.level} showFull />
                <span className="font-mono text-xs text-slate-400">
                  #{previewModule.orderIndex ?? previewModule.order_index} •{" "}
                  {previewModule.estimatedMinutes ?? previewModule.estimated_minutes} Menit Baca
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModule(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {previewModule.title}
                </h2>
                <span className="text-xs font-mono text-slate-400 block mt-1">
                  Slug: /learn/{previewModule.slug}
                </span>
              </div>

              {previewModule.summary && (
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  {previewModule.summary}
                </div>
              )}

              <MarkdownArticlePreview
                content={previewModule.contentBody || previewModule.content_body}
              />
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const mod = previewModule;
                  setPreviewModule(null);
                  if (onOpenModuleQuizzes) onOpenModuleQuizzes(mod);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 cursor-pointer"
              >
                Kelola Soal Kuis ({previewModule.quizCount ?? 0} Soal) →
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const mod = previewModule;
                    setPreviewModule(null);
                    handleOpenEdit(mod);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
                >
                  Edit Modul Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Modul */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#12151e] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Hapus Modul Pembelajaran?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Anda akan menghapus modul{" "}
                  <strong className="text-slate-900 dark:text-white">"{deleteTarget.title}"</strong>.
                  {(deleteTarget.quizCount ?? 0) > 0 && (
                    <span className="block mt-1 text-rose-500 font-semibold">
                      Perhatian: {deleteTarget.quizCount} butir soal kuis yang terikat pada modul ini juga akan ikut terhapus secara otomatis (Cascade Delete).
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

