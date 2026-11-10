import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "../../services/apiClient";
import { LevelBadge } from "./adminConstants";

const EMPTY_QUIZ_FORM = {
  moduleId: "",
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctKey: "A",
  explanationText: "",
  indicatorConcept: "",
};

const OPTION_KEYS = ["A", "B", "C", "D"];
const PAGE_SIZE = 10;

export default function AdminQuizManagement({
  modules = [],
  selectedModuleId,
  onSelectModuleId,
  onBackToModules,
  onQuizzesChanged,
  onNotify,
}) {
  // Default filter ke selectedModuleId jika dikirim dari "Kelola Soal", atau "ALL"
  const activeModuleFilter = selectedModuleId || "ALL";
  const focusedModule = useMemo(
    () =>
      activeModuleFilter !== "ALL"
        ? modules.find((m) => m.id === activeModuleFilter) || null
        : null,
    [modules, activeModuleFilter]
  );

  const [allQuizzes, setAllQuizzes] = useState([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Form Tambah / Edit Soal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [form, setForm] = useState(EMPTY_QUIZ_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Modal Detail Soal
  const [detailQuiz, setDetailQuiz] = useState(null);

  // Modal Konfirmasi Hapus Soal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Muat daftar soal dari API (mendukung filter per materi maupun lintas seluruh materi)
  const fetchQuizzes = useCallback(async () => {
    if (modules.length === 0) {
      setAllQuizzes([]);
      return;
    }

    try {
      setIsLoadingQuizzes(true);
      setLoadError("");

      if (activeModuleFilter !== "ALL") {
        const res = await adminApi.getModuleQuizzes(activeModuleFilter);
        const modInfo = modules.find((m) => m.id === activeModuleFilter);
        const loaded = (res?.data?.quizzes || []).map((q) => ({
          ...q,
          moduleTitle: modInfo?.title || res?.data?.module?.title || "Materi",
          moduleLevel: modInfo?.level || res?.data?.module?.level || "BEGINNER",
        }));
        setAllQuizzes(loaded);
      } else {
        const results = await Promise.all(
          modules.map(async (mod) => {
            const res = await adminApi.getModuleQuizzes(mod.id);
            return (res?.data?.quizzes || []).map((q) => ({
              ...q,
              moduleTitle: mod.title,
              moduleLevel: mod.level,
            }));
          })
        );
        setAllQuizzes(results.flat());
      }
    } catch (err) {
      setLoadError(err.message || "Gagal memuat daftar bank soal kuis.");
    } finally {
      setIsLoadingQuizzes(false);
    }
  }, [modules, activeModuleFilter]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchQuizzes();
    });
  }, [fetchQuizzes]);

  const filteredQuizzes = useMemo(() => {
    return allQuizzes.filter((quiz) => {
      if (levelFilter !== "ALL" && quiz.moduleLevel !== levelFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const question = (quiz.questionText || quiz.question_text || "").toLowerCase();
        const indicator = (quiz.indicatorConcept || quiz.indicator_concept || "").toLowerCase();
        const modTitle = (quiz.moduleTitle || "").toLowerCase();
        if (!question.includes(q) && !indicator.includes(q) && !modTitle.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [allQuizzes, levelFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedQuizzes = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredQuizzes.slice(start, start + PAGE_SIZE);
  }, [filteredQuizzes, safePage]);

  const hasActiveFilters =
    levelFilter !== "ALL" || Boolean(searchQuery.trim());

  const handleResetFilters = () => {
    setSearchQuery("");
    setLevelFilter("ALL");
    setCurrentPage(1);
  };

  const handleOpenCreateModal = () => {
    const defaultModuleId =
      focusedModule?.id || modules[0]?.id || "";
    setEditingQuiz(null);
    setForm({
      ...EMPTY_QUIZ_FORM,
      moduleId: defaultModuleId,
    });
    setFormError("");
    setFieldErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (quiz) => {
    setEditingQuiz(quiz);
    setForm({
      moduleId: quiz.moduleId || quiz.module_id || focusedModule?.id || modules[0]?.id || "",
      questionText: quiz.questionText || quiz.question_text || "",
      optionA: quiz.optionA || quiz.option_a || "",
      optionB: quiz.optionB || quiz.option_b || "",
      optionC: quiz.optionC || quiz.option_c || "",
      optionD: quiz.optionD || quiz.option_d || "",
      correctKey: quiz.correctKey || quiz.correct_key || "A",
      explanationText: quiz.explanationText || quiz.explanation_text || "",
      indicatorConcept: quiz.indicatorConcept || quiz.indicator_concept || "",
    });
    setFormError("");
    setFieldErrors({});
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    if (isSubmitting) return;
    setIsFormModalOpen(false);
    setEditingQuiz(null);
    setFormError("");
    setFieldErrors({});
  };

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (formError) setFormError("");
  };

  const validateQuizForm = () => {
    const errors = {};
    if (!form.moduleId) {
      errors.moduleId = "Materi terkait wajib dipilih.";
    }
    if (!form.questionText.trim() || form.questionText.trim().length < 10) {
      errors.questionText = "Pertanyaan minimal 10 karakter.";
    }
    if (!form.indicatorConcept.trim() || form.indicatorConcept.trim().length < 3) {
      errors.indicatorConcept = "Indikator materi minimal 3 karakter.";
    }
    for (const key of OPTION_KEYS) {
      const val = form[`option${key}`]?.trim();
      if (!val) {
        errors[`option${key}`] = `Pilihan ${key} wajib diisi.`;
      }
    }
    if (!OPTION_KEYS.includes(form.correctKey)) {
      errors.correctKey = "Pilih salah satu kunci jawaban yang benar (A, B, C, atau D).";
    }
    if (!form.explanationText.trim() || form.explanationText.trim().length < 10) {
      errors.explanationText = "Pembahasan jawaban minimal 10 karakter.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    if (!validateQuizForm()) return;

    const payload = {
      moduleId: form.moduleId,
      questionText: form.questionText.trim(),
      optionA: form.optionA.trim(),
      optionB: form.optionB.trim(),
      optionC: form.optionC.trim(),
      optionD: form.optionD.trim(),
      correctKey: form.correctKey,
      explanationText: form.explanationText.trim(),
      indicatorConcept: form.indicatorConcept.trim(),
    };

    try {
      setIsSubmitting(true);
      if (editingQuiz?.id) {
        await adminApi.updateQuiz(editingQuiz.id, payload);
        if (onNotify) onNotify("Soal kuis berhasil diperbarui.", "success");
      } else {
        await adminApi.createQuiz(payload);
        if (onNotify) onNotify("Soal kuis baru berhasil ditambahkan.", "success");
      }

      setIsFormModalOpen(false);
      setEditingQuiz(null);
      await fetchQuizzes();
      if (onQuizzesChanged) onQuizzesChanged();
    } catch (err) {
      setFormError(err.message || "Gagal menyimpan soal kuis.");
      if (Array.isArray(err.details) && err.details.length > 0) {
        const mapped = {};
        for (const item of err.details) {
          if (item.field) mapped[item.field] = item.message;
        }
        setFieldErrors(mapped);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await adminApi.deleteQuiz(deleteTarget.id);
      setDeleteTarget(null);
      if (onNotify) onNotify("Soal kuis berhasil dihapus.", "success");
      await fetchQuizzes();
      if (onQuizzesChanged) onQuizzesChanged();
    } catch (err) {
      if (onNotify) onNotify(err.message || "Gagal menghapus soal kuis.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const getCorrectOptionText = (quiz) => {
    const key = quiz.correctKey || quiz.correct_key || "A";
    const map = {
      A: quiz.optionA || quiz.option_a,
      B: quiz.optionB || quiz.option_b,
      C: quiz.optionC || quiz.option_c,
      D: quiz.optionD || quiz.option_d,
    };
    return map[key] || "";
  };

  if (modules.length === 0) {
    return (
      <div className="p-12 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] text-center space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Belum Ada Materi Pembelajaran
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Tambahkan materi pembelajaran terlebih dahulu sebelum membuat soal kuis evaluasi.
        </p>
        {onBackToModules && (
          <Button
            type="button"
            onClick={onBackToModules}
            className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
          >
            Ke Materi Pembelajaran
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Kontekstual saat masuk dari "Kelola Soal" suatu materi */}
      {focusedModule && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#101010] border border-slate-200 dark:border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
            >
              <button
                type="button"
                onClick={onBackToModules}
                className="hover:text-slate-900 dark:hover:text-white hover:underline cursor-pointer"
              >
                Materi Pembelajaran
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[240px] sm:max-w-xs">
                {focusedModule.title}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-900 dark:text-white font-semibold">
                Bank Soal
              </span>
            </nav>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {focusedModule.title}
              </span>
              <LevelBadge level={focusedModule.level} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectModuleId && onSelectModuleId("ALL")}
            className="h-8 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272727] bg-white dark:bg-[#141414] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e1e1e] shrink-0 self-start sm:self-center cursor-pointer"
          >
            Tampilkan Semua Materi
          </button>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Bank Soal Kuis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola pertanyaan, pilihan jawaban, dan kunci jawaban kuis.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreateModal}
          className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Soal</span>
        </Button>
      </div>

      {/* Toolbar: Search Pertanyaan, Filter Materi, Filter Jenjang */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Pertanyaan */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari pertanyaan atau indikator..."
            aria-label="Cari pertanyaan"
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

        {/* Filter Materi & Filter Jenjang */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeModuleFilter}
            onChange={(e) => {
              if (onSelectModuleId) onSelectModuleId(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter berdasarkan materi"
            className="h-9 px-3 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-700 dark:text-slate-200 focus-visible:outline-none focus:border-slate-900 dark:focus:border-slate-400 max-w-xs truncate cursor-pointer"
          >
            <option value="ALL">Semua Materi ({modules.length})</option>
            {modules.map((mod) => (
              <option key={mod.id} value={mod.id}>
                {mod.title} ({mod.quizCount ?? 0} soal)
              </option>
            ))}
          </select>

          {activeModuleFilter === "ALL" && (
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter berdasarkan jenjang"
              className="h-9 px-3 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-700 dark:text-slate-200 focus-visible:outline-none focus:border-slate-900 dark:focus:border-slate-400 cursor-pointer"
            >
              <option value="ALL">Semua Jenjang</option>
              <option value="BEGINNER">Pemula</option>
              <option value="INTERMEDIATE">Menengah</option>
              <option value="ADVANCED">Mahir</option>
            </select>
          )}

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

      {loadError && (
        <div
          role="alert"
          className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-[#2a0e12] border border-rose-200 dark:border-[#4c151c] text-xs text-rose-700 dark:text-[#f87171]"
        >
          {loadError}
        </div>
      )}

      {/* Tabel Bank Soal */}
      <div className="rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] overflow-hidden">
        {isLoadingQuizzes ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-14 rounded-lg bg-slate-100 dark:bg-[#181818] animate-pulse"
              />
            ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
              {allQuizzes.length === 0
                ? "Belum ada soal kuis untuk materi ini."
                : "Tidak ada soal kuis yang sesuai dengan pencarian atau filter."}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {allQuizzes.length === 0
                ? "Tambahkan soal pilihan ganda baru untuk menguji pemahaman materi."
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
                onClick={handleOpenCreateModal}
                className="h-8 px-3 text-xs rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
              >
                + Tambah Soal
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
                    <th className="py-3.5 px-5">Pertanyaan</th>
                    <th className="py-3.5 px-4 w-56">Materi</th>
                    <th className="py-3.5 px-4 w-48">Kunci Jawaban</th>
                    <th className="py-3.5 px-4 w-52">Indikator</th>
                    <th className="py-3.5 px-5 text-right w-40">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-[#222222] text-xs sm:text-sm">
                  {paginatedQuizzes.map((quiz) => {
                    const correctKey = quiz.correctKey || quiz.correct_key || "A";
                    const correctText = getCorrectOptionText(quiz);

                    return (
                      <tr
                        key={quiz.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* 1. Pertanyaan */}
                        <td className="py-4 px-5 max-w-md">
                          <button
                            type="button"
                            onClick={() => setDetailQuiz(quiz)}
                            className="text-left group cursor-pointer"
                          >
                            <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:underline line-clamp-2 leading-snug">
                              {quiz.questionText || quiz.question_text}
                            </p>
                          </button>
                        </td>

                        {/* 2. Materi */}
                        <td className="py-4 px-4">
                          <div className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                            {quiz.moduleTitle}
                          </div>
                          <div className="mt-1">
                            <LevelBadge level={quiz.moduleLevel} />
                          </div>
                        </td>

                        {/* 3. Kunci Jawaban */}
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-[#062c19] border border-emerald-200 dark:border-[#0e4429] text-emerald-700 dark:text-[#34d399] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                              {correctKey}
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-snug">
                              {correctText}
                            </span>
                          </div>
                        </td>

                        {/* 4. Indikator */}
                        <td className="py-4 px-4">
                          <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug">
                            {quiz.indicatorConcept || quiz.indicator_concept || "-"}
                          </span>
                        </td>

                        {/* 5. Aksi */}
                        <td className="py-4 px-5 whitespace-nowrap text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(quiz)}
                              className="h-8 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272727] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(quiz)}
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
              {paginatedQuizzes.map((quiz) => {
                const correctKey = quiz.correctKey || quiz.correct_key || "A";
                const correctText = getCorrectOptionText(quiz);

                return (
                  <div key={quiz.id} className="p-4 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                        {quiz.moduleTitle}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDetailQuiz(quiz)}
                        className="text-left"
                      >
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                          {quiz.questionText || quiz.question_text}
                        </p>
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#242424] flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded bg-emerald-50 dark:bg-[#062c19] border border-emerald-200 dark:border-[#0e4429] text-emerald-700 dark:text-[#34d399] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {correctKey}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 line-clamp-1">
                        {correctText}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        Indikator: {quiz.indicatorConcept || quiz.indicator_concept}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(quiz)}
                          className="h-8 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272727] text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(quiz)}
                          className="h-8 px-2.5 rounded-lg text-xs font-medium text-rose-600 dark:text-[#f87171] cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Informasi Jumlah Soal & Pagination */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-[#242424] bg-slate-50/50 dark:bg-[#0c0c0c] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Menampilkan {paginatedQuizzes.length} dari {filteredQuizzes.length} soal
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

      {/* ================================================================
          MODAL FORM TAMBAH DAN EDIT SOAL (Section 8: A -> B -> C -> D)
          ================================================================ */}
      {isFormModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quiz-form-modal-title"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5"
        >
          <div className="w-full max-w-2xl max-h-[92vh] rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] flex flex-col overflow-hidden">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#242424] flex items-center justify-between gap-3">
              <div>
                <h2
                  id="quiz-form-modal-title"
                  className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
                >
                  {editingQuiz ? "Edit Soal Kuis" : "Tambah Soal Kuis"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Susun pertanyaan, empat pilihan jawaban, kunci jawaban, dan pembahasan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseFormModal}
                disabled={isSubmitting}
                aria-label="Tutup form soal"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleSubmitForm}
              noValidate
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {formError && (
                <div
                  role="alert"
                  className="px-4 py-3 rounded-lg bg-rose-50 dark:bg-[#2a0e12] border border-rose-200 dark:border-[#4c151c] text-xs text-rose-700 dark:text-[#f87171]"
                >
                  {formError}
                </div>
              )}

              {/* A. INFORMASI PERTANYAAN */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-[#1e1e1e] pb-2">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    A. Informasi Pertanyaan
                  </h3>
                </div>

                {/* Materi Terkait */}
                <div>
                  <label
                    htmlFor="quiz-module-id"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Materi Terkait <span className="text-rose-500">*</span>
                  </label>
                  {focusedModule && !editingQuiz ? (
                    <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#272727] flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                        {focusedModule.title}
                      </span>
                      <LevelBadge level={focusedModule.level} />
                    </div>
                  ) : (
                    <select
                      id="quiz-module-id"
                      value={form.moduleId}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        clearFieldError("moduleId");
                        setForm((prev) => ({ ...prev, moduleId: e.target.value }));
                      }}
                      className="w-full h-10 px-3 rounded-lg text-xs sm:text-sm bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-slate-100 focus-visible:outline-none focus:border-slate-900 dark:focus:border-slate-400 cursor-pointer"
                    >
                      {modules.map((mod) => (
                        <option key={mod.id} value={mod.id}>
                          {mod.title}
                        </option>
                      ))}
                    </select>
                  )}
                  {fieldErrors.moduleId && (
                    <p className="text-xs text-rose-600 dark:text-[#f87171] mt-1">
                      {fieldErrors.moduleId}
                    </p>
                  )}
                </div>

                {/* Pertanyaan */}
                <div>
                  <label
                    htmlFor="quiz-question-text"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Pertanyaan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="quiz-question-text"
                    rows={3}
                    required
                    disabled={isSubmitting}
                    value={form.questionText}
                    onChange={(e) => {
                      clearFieldError("questionText");
                      setForm((prev) => ({ ...prev, questionText: e.target.value }));
                    }}
                    placeholder="Tuliskan pertanyaan kuis secara jelas..."
                    className={`w-full p-3 rounded-lg text-xs sm:text-sm bg-white dark:bg-[#0a0a0a] border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none transition-colors ${
                      fieldErrors.questionText
                        ? "border-rose-500 dark:border-[#f87171]"
                        : "border-slate-200 dark:border-[#272727] focus:border-slate-900 dark:focus:border-slate-400"
                    }`}
                  />
                  {fieldErrors.questionText && (
                    <p className="text-xs text-rose-600 dark:text-[#f87171] mt-1">
                      {fieldErrors.questionText}
                    </p>
                  )}
                </div>

                {/* Indikator Materi */}
                <div>
                  <label
                    htmlFor="quiz-indicator"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Indikator Materi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="quiz-indicator"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={form.indicatorConcept}
                    onChange={(e) => {
                      clearFieldError("indicatorConcept");
                      setForm((prev) => ({ ...prev, indicatorConcept: e.target.value }));
                    }}
                    placeholder="Contoh: Perhitungan modal pembelian berdasarkan satuan lot"
                    className={`w-full h-10 px-3.5 rounded-lg text-xs sm:text-sm bg-white dark:bg-[#0a0a0a] border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none transition-colors ${
                      fieldErrors.indicatorConcept
                        ? "border-rose-500 dark:border-[#f87171]"
                        : "border-slate-200 dark:border-[#272727] focus:border-slate-900 dark:focus:border-slate-400"
                    }`}
                  />
                  {fieldErrors.indicatorConcept && (
                    <p className="text-xs text-rose-600 dark:text-[#f87171] mt-1">
                      {fieldErrors.indicatorConcept}
                    </p>
                  )}
                </div>
              </div>

              {/* B. PILIHAN JAWABAN */}
              <div className="space-y-3.5">
                <div className="border-b border-slate-100 dark:border-[#1e1e1e] pb-2">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    B. Pilihan Jawaban
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {OPTION_KEYS.map((key) => {
                    const fieldName = `option${key}`;
                    const isSelectedKey = form.correctKey === key;

                    return (
                      <div key={key}>
                        <label
                          htmlFor={`quiz-option-${key}`}
                          className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Pilihan {key} <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-8 h-10 rounded-lg font-mono text-xs font-semibold flex items-center justify-center shrink-0 border ${
                              isSelectedKey
                                ? "bg-emerald-50 dark:bg-[#062c19] border-emerald-300 dark:border-[#0e4429] text-emerald-700 dark:text-[#34d399]"
                                : "bg-slate-50 dark:bg-[#141414] border-slate-200 dark:border-[#272727] text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {key}
                          </span>
                          <input
                            id={`quiz-option-${key}`}
                            type="text"
                            required
                            disabled={isSubmitting}
                            value={form[fieldName]}
                            onChange={(e) => {
                              clearFieldError(fieldName);
                              setForm((prev) => ({
                                ...prev,
                                [fieldName]: e.target.value,
                              }));
                            }}
                            placeholder={`Masukkan teks pilihan ${key}...`}
                            className={`flex-1 h-10 px-3.5 rounded-lg text-xs sm:text-sm bg-white dark:bg-[#0a0a0a] border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none transition-colors ${
                              fieldErrors[fieldName]
                                ? "border-rose-500 dark:border-[#f87171]"
                                : "border-slate-200 dark:border-[#272727] focus:border-slate-900 dark:focus:border-slate-400"
                            }`}
                          />
                        </div>
                        {fieldErrors[fieldName] && (
                          <p className="text-xs text-rose-600 dark:text-[#f87171] mt-1 pl-10">
                            {fieldErrors[fieldName]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* C. KUNCI JAWABAN (Radio Selection) */}
              <div className="space-y-3">
                <div className="border-b border-slate-100 dark:border-[#1e1e1e] pb-2">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    C. Kunci Jawaban <span className="text-rose-500">*</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pilih satu opsi jawaban yang benar.
                  </p>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Kunci Jawaban"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
                >
                  {OPTION_KEYS.map((key) => {
                    const selected = form.correctKey === key;
                    return (
                      <label
                        key={key}
                        className={`h-10 px-3 rounded-lg border text-xs font-medium flex items-center gap-2.5 cursor-pointer transition-colors ${
                          selected
                            ? "bg-emerald-50 dark:bg-[#062c19]/80 border-emerald-400 dark:border-[#0e4429] text-emerald-800 dark:text-[#34d399] font-semibold"
                            : "bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-[#272727] text-slate-700 dark:text-slate-300 hover:border-slate-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctKey"
                          value={key}
                          checked={selected}
                          disabled={isSubmitting}
                          onChange={() =>
                            setForm((prev) => ({ ...prev, correctKey: key }))
                          }
                          className="accent-emerald-600 cursor-pointer"
                        />
                        <span>Pilihan {key}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* D. PEMBAHASAN */}
              <div className="space-y-3">
                <div className="border-b border-slate-100 dark:border-[#1e1e1e] pb-2">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    D. Pembahasan <span className="text-rose-500">*</span>
                  </h3>
                </div>

                <div>
                  <label
                    htmlFor="quiz-explanation"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Penjelasan Jawaban
                  </label>
                  <textarea
                    id="quiz-explanation"
                    rows={3}
                    required
                    disabled={isSubmitting}
                    value={form.explanationText}
                    onChange={(e) => {
                      clearFieldError("explanationText");
                      setForm((prev) => ({ ...prev, explanationText: e.target.value }));
                    }}
                    placeholder="Jelaskan alasan mengapa kunci jawaban tersebut benar..."
                    className={`w-full p-3 rounded-lg text-xs sm:text-sm bg-white dark:bg-[#0a0a0a] border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none transition-colors ${
                      fieldErrors.explanationText
                        ? "border-rose-500 dark:border-[#f87171]"
                        : "border-slate-200 dark:border-[#272727] focus:border-slate-900 dark:focus:border-slate-400"
                    }`}
                  />
                  {fieldErrors.explanationText && (
                    <p className="text-xs text-rose-600 dark:text-[#f87171] mt-1">
                      {fieldErrors.explanationText}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Modal */}
              <div className="pt-4 border-t border-slate-200 dark:border-[#242424] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={handleCloseFormModal}
                  className="h-9 px-4 rounded-lg text-xs cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 cursor-pointer"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : editingQuiz
                      ? "Simpan Perubahan"
                      : "Simpan Soal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Lengkap Soal */}
      {detailQuiz && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-xl rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#242424] flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  {detailQuiz.moduleTitle}
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Detail Soal Kuis
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailQuiz(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Indikator: {detailQuiz.indicatorConcept || detailQuiz.indicator_concept}
                </span>
                <p className="font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                  {detailQuiz.questionText || detailQuiz.question_text}
                </p>
              </div>

              <div className="space-y-2">
                {OPTION_KEYS.map((key) => {
                  const text =
                    detailQuiz[`option${key}`] ||
                    detailQuiz[`option_${key.toLowerCase()}`];
                  const isCorrect =
                    (detailQuiz.correctKey || detailQuiz.correct_key) === key;

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-[#062c19]/60 border-emerald-300 dark:border-[#0e4429] text-emerald-900 dark:text-[#34d399] font-medium"
                          : "bg-slate-50 dark:bg-[#0a0a0a] border-slate-200 dark:border-[#242424] text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="font-mono font-bold">{key}.</span>
                      <span className="flex-1">{text}</span>
                      {isCorrect && (
                        <span className="text-[11px] font-semibold shrink-0">
                          Kunci Jawaban
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#242424] space-y-1 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Pembahasan:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {detailQuiz.explanationText || detailQuiz.explanation_text}
                </p>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 dark:border-[#242424] flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-[#0c0c0c]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDetailQuiz(null)}
                className="h-8 px-3 text-xs rounded-lg cursor-pointer"
              >
                Tutup
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const q = detailQuiz;
                  setDetailQuiz(null);
                  handleOpenEditModal(q);
                }}
                className="h-8 px-3.5 text-xs rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
              >
                Edit Soal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Soal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-6 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Hapus Soal Kuis?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Anda yakin ingin menghapus pertanyaan berikut secara permanen?
              </p>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#272727] text-xs text-slate-700 dark:text-slate-300 line-clamp-3">
                &ldquo;{deleteTarget.questionText || deleteTarget.question_text}&rdquo;
              </div>
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
                {isDeleting ? "Menghapus..." : "Hapus Soal"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
