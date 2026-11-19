import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  FileQuestion,
  FolderKanban,
  Layers,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "../../services/apiClient";
import { LEVEL_META, LevelBadge } from "./adminConstants";

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
const LEVEL_SORT_ORDER = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 };
const DEFAULT_GROUPS_PER_PAGE = 4;
const DEFAULT_QUESTIONS_PER_GROUP_PAGE = 5;

function getCorrectOptionText(quiz) {
  const key = quiz.correctKey || quiz.correct_key || "A";
  const map = {
    A: quiz.optionA || quiz.option_a,
    B: quiz.optionB || quiz.option_b,
    C: quiz.optionC || quiz.option_c,
    D: quiz.optionD || quiz.option_d,
  };
  return map[key] || "";
}

/**
 * Sub-komponen: Kartu Grup Soal per Modul & Materi dengan Pagination Internal
 * Menjamin skalabilitas ketika satu modul memiliki puluhan hingga ratusan butir soal.
 */
function ModuleQuizGroupCard({
  group,
  isExpanded,
  onToggleExpand,
  onAddQuizToModule,
  onEditQuiz,
  onDeleteQuiz,
  onViewQuizDetail,
  onFocusSingleModule,
  isSingleModuleFocused,
}) {
  const [groupPage, setGroupPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState(
    isSingleModuleFocused ? 10 : DEFAULT_QUESTIONS_PER_GROUP_PAGE
  );

  const quizzes = group.quizzes || [];
  const totalQuestions = quizzes.length;
  const totalGroupPages = Math.max(1, Math.ceil(totalQuestions / questionsPerPage));
  const safeGroupPage = Math.min(groupPage, totalGroupPages);

  const paginatedQuizzes = useMemo(() => {
    const start = (safeGroupPage - 1) * questionsPerPage;
    return quizzes.slice(start, start + questionsPerPage);
  }, [quizzes, safeGroupPage, questionsPerPage]);

  // Reset ke halaman 1 jika jumlah soal berubah drastis
  useEffect(() => {
    if (groupPage > totalGroupPages) {
      setGroupPage(1);
    }
  }, [groupPage, totalGroupPages]);

  // Daftar indikator unik pada grup modul ini
  const uniqueIndicators = useMemo(() => {
    const set = new Set();
    for (const q of quizzes) {
      const ind = (q.indicatorConcept || q.indicator_concept || "").trim();
      if (ind) set.add(ind);
    }
    return Array.from(set);
  }, [quizzes]);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/90 dark:border-[#242424] shadow-xs overflow-hidden transition-all">
      {/* ====================================================================
          HEADER GRUP MODUL & MATERI
          ==================================================================== */}
      <div
        className={`px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 transition-colors ${
          isExpanded
            ? "bg-slate-50/90 dark:bg-[#151515] border-b border-slate-200/80 dark:border-[#242424]"
            : "bg-white dark:bg-[#101010] hover:bg-slate-50/50 dark:hover:bg-[#141414]"
        }`}
      >
        {/* Kiri: Tombol Expand + Informasi Modul & Materi */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={isExpanded ? "Tutup grup soal" : "Buka grup soal"}
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#1c1c1c] border border-slate-200/80 dark:border-[#2c2c2c] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-slate-400 shrink-0 mt-0.5 cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <LevelBadge level={group.level} />
              {group.submoduleTitle && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-[#1e1e1e] text-slate-600 dark:text-slate-300">
                  {group.submoduleTitle}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  totalQuestions > 0
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50"
                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/50"
                }`}
              >
                {totalQuestions} Butir Soal
              </span>
              {uniqueIndicators.length > 0 && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  • {uniqueIndicators.length} Indikator Kompetensi
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onToggleExpand}
              className="text-left block w-full cursor-pointer group"
            >
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#E5242A] dark:group-hover:text-[#f87171] transition-colors leading-snug">
                {group.title}
              </h2>
            </button>

            {group.summary && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {group.summary}
              </p>
            )}
          </div>
        </div>

        {/* Kanan: Aksi Kontekstual Grup Modul */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 pl-12 lg:pl-0">
          {!isSingleModuleFocused && onFocusSingleModule && (
            <button
              type="button"
              onClick={() => onFocusSingleModule(group.id)}
              className="h-9 px-3 rounded-xl text-xs font-medium border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#181818] text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
            >
              Fokus Modul Ini
            </button>
          )}

          <button
            type="button"
            onClick={() => onAddQuizToModule(group)}
            className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-[#E5242A] hover:bg-[#C91E25] text-white inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Soal</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          ISI GRUP: TABEL BUTIR SOAL + PAGINATION INTERNAL PER MODUL
          ==================================================================== */}
      {isExpanded && (
        <div>
          {totalQuestions === 0 ? (
            <div className="py-10 px-6 text-center space-y-2.5">
              <FileQuestion className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Belum ada butir soal pada modul &ldquo;{group.title}&rdquo;
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Tambahkan soal pilihan ganda beserta kunci jawaban deterministik dan indikator konsep untuk modul ini.
              </p>
              <Button
                type="button"
                onClick={() => onAddQuizToModule(group)}
                className="h-8 px-3.5 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
              >
                + Buat Soal Pertama
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table inside Module Group */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[#1e1e1e] bg-slate-50/40 dark:bg-[#0c0c0c] text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <th className="py-3 pl-5 pr-2 w-14">No</th>
                      <th className="py-3 px-4">Pertanyaan & Opsi</th>
                      <th className="py-3 px-4 w-56">Kunci Jawaban</th>
                      <th className="py-3 px-4 w-56">Indikator Materi</th>
                      <th className="py-3 px-5 text-right w-44">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1e1e1e] text-xs sm:text-sm">
                    {paginatedQuizzes.map((quiz, idx) => {
                      const questionNumber =
                        (safeGroupPage - 1) * questionsPerPage + idx + 1;
                      const correctKey =
                        quiz.correctKey || quiz.correct_key || "A";
                      const correctText = getCorrectOptionText(quiz);

                      return (
                        <tr
                          key={quiz.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Nomor Urut di dalam Modul */}
                          <td className="py-3.5 pl-5 pr-2 font-mono text-xs font-semibold text-slate-400">
                            #{questionNumber}
                          </td>

                          {/* Pertanyaan */}
                          <td className="py-3.5 px-4 max-w-md">
                            <button
                              type="button"
                              onClick={() => onViewQuizDetail(quiz)}
                              className="text-left group cursor-pointer"
                            >
                              <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#E5242A] dark:group-hover:text-[#f87171] line-clamp-2 leading-snug transition-colors">
                                {quiz.questionText || quiz.question_text}
                              </p>
                            </button>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              {OPTION_KEYS.map((k) => {
                                const isRight = k === correctKey;
                                return (
                                  <span
                                    key={k}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                      isRight
                                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60"
                                        : "bg-slate-100 dark:bg-[#181818] text-slate-500"
                                    }`}
                                  >
                                    {k}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          {/* Kunci Jawaban */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-2">
                              <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-[#062c19] border border-emerald-200 dark:border-[#0e4429] text-emerald-700 dark:text-[#34d399] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                                {correctKey}
                              </span>
                              <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug">
                                {correctText}
                              </span>
                            </div>
                          </td>

                          {/* Indikator Materi */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-[#181818] text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug">
                              {quiz.indicatorConcept ||
                                quiz.indicator_concept ||
                                "-"}
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="py-3.5 px-5 whitespace-nowrap text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => onViewQuizDetail(quiz)}
                                title="Lihat detail & pembahasan"
                                className="h-8 px-2.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272727] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] cursor-pointer"
                              >
                                Detail
                              </button>
                              <button
                                type="button"
                                onClick={() => onEditQuiz(quiz)}
                                className="h-8 px-2.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-[#272727] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteQuiz(quiz)}
                                className="h-8 px-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
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

              {/* Mobile Stacked Cards inside Module Group */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-[#1e1e1e]">
                {paginatedQuizzes.map((quiz, idx) => {
                  const questionNumber =
                    (safeGroupPage - 1) * questionsPerPage + idx + 1;
                  const correctKey =
                    quiz.correctKey || quiz.correct_key || "A";
                  const correctText = getCorrectOptionText(quiz);

                  return (
                    <div key={quiz.id} className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          Soal #{questionNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-[#181818] text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                          {quiz.indicatorConcept || quiz.indicator_concept}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                        {quiz.questionText || quiz.question_text}
                      </p>

                      <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 flex items-center gap-2 text-xs">
                        <span className="w-5 h-5 rounded bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                          {correctKey}
                        </span>
                        <span className="text-emerald-900 dark:text-emerald-200 font-medium line-clamp-1">
                          {correctText}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onViewQuizDetail(quiz)}
                          className="h-8 px-3 rounded-lg text-xs border border-slate-200 dark:border-[#272727]"
                        >
                          Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditQuiz(quiz)}
                          className="h-8 px-3 rounded-lg text-xs font-semibold border border-slate-200 dark:border-[#272727]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteQuiz(quiz)}
                          className="h-8 px-2.5 rounded-lg text-xs text-rose-600"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Pagination Internal Grup Modul */}
              <div className="px-5 py-3 bg-slate-50/60 dark:bg-[#0d0d0d] border-t border-slate-100 dark:border-[#1e1e1e] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span>
                    Menampilkan{" "}
                    <strong className="text-slate-700 dark:text-slate-200">
                      {(safeGroupPage - 1) * questionsPerPage + 1}–
                      {Math.min(safeGroupPage * questionsPerPage, totalQuestions)}
                    </strong>{" "}
                    dari{" "}
                    <strong className="text-slate-700 dark:text-slate-200">
                      {totalQuestions}
                    </strong>{" "}
                    soal pada modul ini
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={questionsPerPage}
                    onChange={(e) => {
                      setQuestionsPerPage(Number(e.target.value));
                      setGroupPage(1);
                    }}
                    aria-label="Jumlah soal per halaman dalam grup"
                    className="h-7 px-2 rounded-lg text-[11px] bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#2a2a2a] cursor-pointer"
                  >
                    <option value={5}>5 soal / hal</option>
                    <option value={10}>10 soal / hal</option>
                    <option value={20}>20 soal / hal</option>
                  </select>

                  {totalGroupPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={safeGroupPage <= 1}
                        onClick={() => setGroupPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#161616] disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                      >
                        Sebelumnya
                      </button>
                      <span className="px-2 font-mono text-[11px]">
                        {safeGroupPage} / {totalGroupPages}
                      </span>
                      <button
                        type="button"
                        disabled={safeGroupPage >= totalGroupPages}
                        onClick={() =>
                          setGroupPage((p) => Math.min(totalGroupPages, p + 1))
                        }
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#161616] disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                      >
                        Berikutnya
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminQuizManagement({
  modules = [],
  selectedModuleId,
  onSelectModuleId,
  onBackToModules,
  onQuizzesChanged,
  onNotify,
}) {
  const activeModuleFilter = selectedModuleId || "ALL";

  const [quizzesByModuleMap, setQuizzesByModuleMap] = useState({});
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Filter & Group Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [groupCompletionFilter, setGroupCompletionFilter] = useState("ALL"); // "ALL" | "WITH_QUIZ" | "EMPTY_QUIZ"
  const [groupCurrentPage, setGroupCurrentPage] = useState(1);
  const [groupsPerPage, setGroupsPerPage] = useState(DEFAULT_GROUPS_PER_PAGE);

  // Expanded state per module group ID
  const [expandedGroupIds, setExpandedGroupIds] = useState({});

  // Modal Form Tambah / Edit Soal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [form, setForm] = useState(EMPTY_QUIZ_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Modal Detail & Delete
  const [detailQuiz, setDetailQuiz] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all quizzes grouped by module
  const fetchGroupedQuizzes = useCallback(async () => {
    if (modules.length === 0) {
      setQuizzesByModuleMap({});
      return;
    }

    try {
      setIsLoadingQuizzes(true);
      setLoadError("");

      const targetModules =
        activeModuleFilter !== "ALL"
          ? modules.filter((m) => m.id === activeModuleFilter)
          : modules;

      const pairs = await Promise.all(
        targetModules.map(async (mod) => {
          const res = await adminApi.getModuleQuizzes(mod.id);
          const list = (res?.data?.quizzes || []).map((q) => ({
            ...q,
            moduleId: mod.id,
            moduleTitle: mod.title,
            moduleLevel: mod.level,
          }));
          return [mod.id, list];
        })
      );

      const nextMap = {};
      for (const [modId, list] of pairs) {
        nextMap[modId] = list;
      }
      setQuizzesByModuleMap(nextMap);

      // Default: expand first 2 groups (or the focused module)
      setExpandedGroupIds((prev) => {
        if (activeModuleFilter !== "ALL") {
          return { ...prev, [activeModuleFilter]: true };
        }
        if (Object.keys(prev).length > 0) return prev;
        const initialExp = {};
        targetModules.slice(0, 2).forEach((m) => {
          initialExp[m.id] = true;
        });
        return initialExp;
      });
    } catch (err) {
      setLoadError(err.message || "Gagal memuat data bank soal kuis.");
    } finally {
      setIsLoadingQuizzes(false);
    }
  }, [modules, activeModuleFilter]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchGroupedQuizzes();
    });
  }, [fetchGroupedQuizzes]);

  // Build structured module groups with filtered quizzes
  const moduleGroups = useMemo(() => {
    const sortedModules = [...modules].sort((a, b) => {
      const lvlDiff =
        (LEVEL_SORT_ORDER[a.level] || 99) - (LEVEL_SORT_ORDER[b.level] || 99);
      if (lvlDiff !== 0) return lvlDiff;
      return (
        (a.orderIndex ?? a.order_index ?? 1) -
        (b.orderIndex ?? b.order_index ?? 1)
      );
    });

    const q = searchQuery.trim().toLowerCase();

    return sortedModules
      .map((mod) => {
        if (activeModuleFilter !== "ALL" && mod.id !== activeModuleFilter) {
          return null;
        }
        if (levelFilter !== "ALL" && mod.level !== levelFilter) {
          return null;
        }

        const rawQuizzes =
          quizzesByModuleMap[mod.id] ||
          (Array.isArray(mod.quizzes) ? mod.quizzes : []);

        const filteredQuizzes = !q
          ? rawQuizzes
          : rawQuizzes.filter((quiz) => {
              const qText = (
                quiz.questionText ||
                quiz.question_text ||
                ""
              ).toLowerCase();
              const indText = (
                quiz.indicatorConcept ||
                quiz.indicator_concept ||
                ""
              ).toLowerCase();
              const optText = [
                quiz.optionA,
                quiz.optionB,
                quiz.optionC,
                quiz.optionD,
              ]
                .join(" ")
                .toLowerCase();
              return (
                qText.includes(q) || indText.includes(q) || optText.includes(q)
              );
            });

        const moduleTitleMatches =
          q &&
          (mod.title?.toLowerCase().includes(q) ||
            mod.submoduleTitle?.toLowerCase().includes(q));

        // Jika sedang mencari kata kunci, hanya tampilkan grup yang modulnya cocok atau memiliki soal yang cocok
        if (q && !moduleTitleMatches && filteredQuizzes.length === 0) {
          return null;
        }

        const finalQuizzes =
          q && moduleTitleMatches && filteredQuizzes.length === 0
            ? rawQuizzes
            : filteredQuizzes;

        if (
          groupCompletionFilter === "WITH_QUIZ" &&
          finalQuizzes.length === 0
        ) {
          return null;
        }
        if (
          groupCompletionFilter === "EMPTY_QUIZ" &&
          finalQuizzes.length > 0
        ) {
          return null;
        }

        return {
          id: mod.id,
          title: mod.title,
          slug: mod.slug,
          level: mod.level || "BEGINNER",
          submoduleTitle:
            mod.submoduleTitle ||
            LEVEL_META[mod.level]?.label ||
            "Modul Kurikulum",
          summary: mod.summary || "",
          isPublished: Boolean(mod.isPublished ?? mod.is_published),
          quizzes: finalQuizzes,
          totalRawQuizzes: rawQuizzes.length,
        };
      })
      .filter(Boolean);
  }, [
    modules,
    quizzesByModuleMap,
    activeModuleFilter,
    levelFilter,
    groupCompletionFilter,
    searchQuery,
  ]);

  // Summary metrics across all filtered groups
  const summaryStats = useMemo(() => {
    let totalQuestions = 0;
    let groupsWithQuestions = 0;
    for (const g of moduleGroups) {
      totalQuestions += g.quizzes.length;
      if (g.quizzes.length > 0) groupsWithQuestions += 1;
    }
    return {
      totalGroups: moduleGroups.length,
      totalQuestions,
      groupsWithQuestions,
      emptyGroups: Math.max(0, moduleGroups.length - groupsWithQuestions),
    };
  }, [moduleGroups]);

  // Pagination across Module Groups (Tier 1 Pagination)
  const totalGroupPages = Math.max(
    1,
    Math.ceil(moduleGroups.length / groupsPerPage)
  );
  const safeGroupCurrentPage = Math.min(groupCurrentPage, totalGroupPages);
  const paginatedModuleGroups = useMemo(() => {
    const start = (safeGroupCurrentPage - 1) * groupsPerPage;
    return moduleGroups.slice(start, start + groupsPerPage);
  }, [moduleGroups, safeGroupCurrentPage, groupsPerPage]);

  // Auto-expand matching groups when user searches
  useEffect(() => {
    if (searchQuery.trim()) {
      const next = {};
      for (const g of paginatedModuleGroups) {
        next[g.id] = true;
      }
      setExpandedGroupIds((prev) => ({ ...prev, ...next }));
    }
  }, [searchQuery, paginatedModuleGroups]);

  const handleToggleGroupExpand = (groupId) => {
    setExpandedGroupIds((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleExpandAllVisible = () => {
    const next = { ...expandedGroupIds };
    for (const g of paginatedModuleGroups) {
      next[g.id] = true;
    }
    setExpandedGroupIds(next);
  };

  const handleCollapseAllVisible = () => {
    const next = { ...expandedGroupIds };
    for (const g of paginatedModuleGroups) {
      next[g.id] = false;
    }
    setExpandedGroupIds(next);
  };

  const hasActiveFilters =
    levelFilter !== "ALL" ||
    groupCompletionFilter !== "ALL" ||
    activeModuleFilter !== "ALL" ||
    Boolean(searchQuery.trim());

  const handleResetFilters = () => {
    setSearchQuery("");
    setLevelFilter("ALL");
    setGroupCompletionFilter("ALL");
    if (onSelectModuleId) onSelectModuleId("ALL");
    setGroupCurrentPage(1);
  };

  // Modal Create / Edit Handlers
  const handleOpenCreateModalForModule = (targetMod = null) => {
    const defaultModuleId =
      targetMod?.id ||
      (activeModuleFilter !== "ALL" ? activeModuleFilter : modules[0]?.id || "");
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
      moduleId:
        quiz.moduleId || quiz.module_id || modules[0]?.id || "",
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
      errors.moduleId = "Modul / Materi terkait wajib dipilih.";
    }
    if (!form.questionText.trim() || form.questionText.trim().length < 10) {
      errors.questionText = "Pertanyaan minimal 10 karakter.";
    }
    if (
      !form.indicatorConcept.trim() ||
      form.indicatorConcept.trim().length < 3
    ) {
      errors.indicatorConcept = "Indikator materi minimal 3 karakter.";
    }
    for (const key of OPTION_KEYS) {
      const val = form[`option${key}`]?.trim();
      if (!val) {
        errors[`option${key}`] = `Pilihan ${key} wajib diisi.`;
      }
    }
    if (!OPTION_KEYS.includes(form.correctKey)) {
      errors.correctKey = "Pilih salah satu kunci jawaban (A, B, C, atau D).";
    }
    if (
      !form.explanationText.trim() ||
      form.explanationText.trim().length < 10
    ) {
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
        if (onNotify)
          onNotify("Soal kuis baru berhasil ditambahkan ke modul.", "success");
      }

      // Pastikan grup modul tempat soal ditambahkan otomatis terbuka
      setExpandedGroupIds((prev) => ({ ...prev, [form.moduleId]: true }));
      setIsFormModalOpen(false);
      setEditingQuiz(null);
      await fetchGroupedQuizzes();
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
      await fetchGroupedQuizzes();
      if (onQuizzesChanged) onQuizzesChanged();
    } catch (err) {
      if (onNotify)
        onNotify(err.message || "Gagal menghapus soal kuis.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (modules.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] text-center space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Belum Ada Modul & Materi Pembelajaran
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Tambahkan modul atau materi pembelajaran terlebih dahulu sebelum menyusun grup bank soal kuis.
        </p>
        {onBackToModules && (
          <Button
            type="button"
            onClick={onBackToModules}
            className="h-9 px-4 rounded-xl text-xs font-semibold bg-[#E5242A] text-white cursor-pointer"
          >
            Ke Materi Pembelajaran
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ====================================================================
          HEADER HALAMAN & RINGKASAN GRUP SOAL
          ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bank Soal Kuis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dikelompokkan berdasarkan Modul & Materi pembelajaran untuk pengelolaan evaluasi yang terstruktur.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeModuleFilter !== "ALL" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSelectModuleId && onSelectModuleId("ALL")}
              className="h-10 px-3.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Tampilkan Semua Grup Modul
            </Button>
          )}
          <Button
            type="button"
            onClick={() => handleOpenCreateModalForModule(null)}
            className="h-10 px-4 rounded-xl text-xs font-semibold bg-[#E5242A] hover:bg-[#C91E25] text-white shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soal Baru</span>
          </Button>
        </div>
      </div>

      {/* Ringkasan Cepat Grup Modul & Soal */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[#E5242A] flex items-center justify-center shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Grup Modul & Materi
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {summaryStats.totalGroups} Grup
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileQuestion className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Total Butir Soal
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {summaryStats.totalQuestions} Soal
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Modul Memiliki Kuis
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {summaryStats.groupsWithQuestions} / {summaryStats.totalGroups}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Halaman Grup Aktif
            </span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {safeGroupCurrentPage} / {totalGroupPages}
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          TOOLBAR FILTER & KONTROL GRUP (Search, Filter Tingkat, Filter Modul, Expand/Collapse)
          ==================================================================== */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] flex flex-col xl:flex-row xl:items-center justify-between gap-3 shadow-xs">
        {/* Kiri: Search Pertanyaan / Indikator / Judul Modul */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setGroupCurrentPage(1);
            }}
            placeholder="Cari modul, materi, pertanyaan, atau indikator..."
            aria-label="Cari bank soal"
            className="w-full h-10 pl-10 pr-8 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#2a2a2a] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setGroupCurrentPage(1);
              }}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Kanan: Filter Tingkat, Filter Modul, Status Kuis, & Buka/Tutup Semua Grup */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setGroupCurrentPage(1);
            }}
            aria-label="Filter Tingkat"
            className="h-10 px-3 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="ALL">Semua Tingkat</option>
            <option value="BEGINNER">Pemula</option>
            <option value="INTERMEDIATE">Menengah</option>
            <option value="ADVANCED">Mahir</option>
          </select>

          <select
            value={activeModuleFilter}
            onChange={(e) => {
              if (onSelectModuleId) onSelectModuleId(e.target.value);
              setGroupCurrentPage(1);
            }}
            aria-label="Filter Grup Modul"
            className="h-10 px-3 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-200 max-w-[230px] truncate cursor-pointer"
          >
            <option value="ALL">Semua Grup Modul ({modules.length})</option>
            {modules.map((mod) => (
              <option key={mod.id} value={mod.id}>
                [{LEVEL_META[mod.level]?.label || mod.level}] {mod.title}
              </option>
            ))}
          </select>

          <select
            value={groupCompletionFilter}
            onChange={(e) => {
              setGroupCompletionFilter(e.target.value);
              setGroupCurrentPage(1);
            }}
            aria-label="Filter Ketersediaan Soal"
            className="h-10 px-3 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="ALL">Semua Status Grup</option>
            <option value="WITH_QUIZ">Sudah Ada Soal</option>
            <option value="EMPTY_QUIZ">Belum Ada Soal (0)</option>
          </select>

          <div className="inline-flex items-center rounded-xl border border-slate-200/80 dark:border-[#2a2a2a] bg-slate-50 dark:bg-[#161616] p-0.5">
            <button
              type="button"
              onClick={handleExpandAllVisible}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#222] transition-colors cursor-pointer"
            >
              Buka Semua
            </button>
            <button
              type="button"
              onClick={handleCollapseAllVisible}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#222] transition-colors cursor-pointer"
            >
              Tutup Semua
            </button>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-10 px-3 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
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

      {/* ====================================================================
          DAFTAR GRUP MODUL & MATERI (ACCORDION CARDS + TIER-1 PAGINATION)
          ==================================================================== */}
      {isLoadingQuizzes ? (
        <div className="space-y-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-28 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] animate-pulse p-5"
            />
          ))}
        </div>
      ) : paginatedModuleGroups.length === 0 ? (
        <div className="py-14 px-6 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] text-center space-y-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
            Tidak ada grup modul atau soal kuis yang sesuai dengan filter.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau atur ulang filter tingkat dan modul.
          </p>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilters}
              className="h-9 px-4 text-xs rounded-xl cursor-pointer"
            >
              Reset Filter
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedModuleGroups.map((group) => (
            <ModuleQuizGroupCard
              key={group.id}
              group={group}
              isExpanded={Boolean(expandedGroupIds[group.id])}
              onToggleExpand={() => handleToggleGroupExpand(group.id)}
              onAddQuizToModule={(grp) => handleOpenCreateModalForModule(grp)}
              onEditQuiz={handleOpenEditModal}
              onDeleteQuiz={(q) => setDeleteTarget(q)}
              onViewQuizDetail={(q) => setDetailQuiz(q)}
              onFocusSingleModule={(modId) => {
                if (onSelectModuleId) onSelectModuleId(modId);
                setExpandedGroupIds((prev) => ({ ...prev, [modId]: true }));
                setGroupCurrentPage(1);
              }}
              isSingleModuleFocused={activeModuleFilter !== "ALL"}
            />
          ))}

          {/* ================================================================
              FOOTER PAGINATION ANTAR-GRUP MODUL (Tier-1 Group Pagination)
              ================================================================ */}
          <div className="px-5 py-3.5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Menampilkan{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {paginatedModuleGroups.length}
              </strong>{" "}
              dari{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {moduleGroups.length}
              </strong>{" "}
              grup modul & materi ({summaryStats.totalQuestions} total soal)
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={groupsPerPage}
                onChange={(e) => {
                  setGroupsPerPage(Number(e.target.value));
                  setGroupCurrentPage(1);
                }}
                aria-label="Jumlah grup modul per halaman"
                className="h-8 px-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#2a2a2a] cursor-pointer"
              >
                <option value={3}>3 grup modul / halaman</option>
                <option value={4}>4 grup modul / halaman</option>
                <option value={8}>8 grup modul / halaman</option>
                <option value={50}>Semua grup modul</option>
              </select>

              {totalGroupPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeGroupCurrentPage <= 1}
                    onClick={() =>
                      setGroupCurrentPage((p) => Math.max(1, p - 1))
                    }
                    className="h-8 px-3 rounded-xl border border-slate-200 dark:border-[#2a2a2a] bg-slate-50 dark:bg-[#161616] disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-2 font-mono font-semibold text-slate-700 dark:text-slate-200">
                    Hal {safeGroupCurrentPage} / {totalGroupPages}
                  </span>
                  <button
                    type="button"
                    disabled={safeGroupCurrentPage >= totalGroupPages}
                    onClick={() =>
                      setGroupCurrentPage((p) =>
                        Math.min(totalGroupPages, p + 1)
                      )
                    }
                    className="h-8 px-3 rounded-xl border border-slate-200 dark:border-[#2a2a2a] bg-slate-50 dark:bg-[#161616] disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL FORM TAMBAH & EDIT SOAL
          ==================================================================== */}
      {isFormModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quiz-form-modal-title"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5"
        >
          <div className="w-full max-w-2xl max-h-[92vh] rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#242424] flex items-center justify-between gap-3">
              <div>
                <h2
                  id="quiz-form-modal-title"
                  className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
                >
                  {editingQuiz ? "Edit Soal Kuis" : "Tambah Soal Kuis"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pilih modul/materi tujuan, lalu isi pertanyaan, opsi A–D, kunci jawaban, dan pembahasan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseFormModal}
                disabled={isSubmitting}
                aria-label="Tutup form soal"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitForm}
              noValidate
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {formError && (
                <div
                  role="alert"
                  className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-[#2a0e12] border border-rose-200 dark:border-[#4c151c] text-xs text-rose-700 dark:text-[#f87171]"
                >
                  {formError}
                </div>
              )}

              {/* A. INFORMASI PERTANYAAN & GRUP MODUL */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-[#1e1e1e] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    A. Grup Modul & Pertanyaan
                  </h3>
                </div>

                <div>
                  <label
                    htmlFor="quiz-module-id"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Grup Modul & Materi Terkait <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="quiz-module-id"
                    value={form.moduleId}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      clearFieldError("moduleId");
                      setForm((prev) => ({ ...prev, moduleId: e.target.value }));
                    }}
                    className="w-full h-10 px-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a] text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                  >
                    {modules.map((mod) => (
                      <option key={mod.id} value={mod.id}>
                        [{LEVEL_META[mod.level]?.label || mod.level}] {mod.title}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.moduleId && (
                    <p className="text-xs text-rose-600 mt-1">
                      {fieldErrors.moduleId}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="quiz-question-text"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
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
                      setForm((prev) => ({
                        ...prev,
                        questionText: e.target.value,
                      }));
                    }}
                    placeholder="Tuliskan pertanyaan kuis secara jelas..."
                    className={`w-full p-3.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#151515] border text-slate-900 dark:text-slate-100 focus:outline-none ${
                      fieldErrors.questionText
                        ? "border-rose-500"
                        : "border-slate-200 dark:border-[#2a2a2a]"
                    }`}
                  />
                  {fieldErrors.questionText && (
                    <p className="text-xs text-rose-600 mt-1">
                      {fieldErrors.questionText}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="quiz-indicator"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Indikator Konsep Materi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="quiz-indicator"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={form.indicatorConcept}
                    onChange={(e) => {
                      clearFieldError("indicatorConcept");
                      setForm((prev) => ({
                        ...prev,
                        indicatorConcept: e.target.value,
                      }));
                    }}
                    placeholder="Contoh: Perhitungan modal pembelian berdasarkan satuan lot"
                    className={`w-full h-10 px-3.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#151515] border text-slate-900 dark:text-slate-100 focus:outline-none ${
                      fieldErrors.indicatorConcept
                        ? "border-rose-500"
                        : "border-slate-200 dark:border-[#2a2a2a]"
                    }`}
                  />
                  {fieldErrors.indicatorConcept && (
                    <p className="text-xs text-rose-600 mt-1">
                      {fieldErrors.indicatorConcept}
                    </p>
                  )}
                </div>
              </div>

              {/* B. PILIHAN JAWABAN & KUNCI DETERMINISTIK */}
              <div className="space-y-3.5">
                <div className="border-b border-slate-100 dark:border-[#1e1e1e] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    B. Pilihan Jawaban (Klik Huruf untuk Menetapkan Kunci Jawaban)
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {OPTION_KEYS.map((key) => {
                    const fieldName = `option${key}`;
                    const isSelectedKey = form.correctKey === key;

                    return (
                      <div key={key}>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({ ...prev, correctKey: key }))
                            }
                            title={`Tandai Pilihan ${key} sebagai Kunci Jawaban`}
                            className={`w-9 h-10 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 border transition-colors cursor-pointer ${
                              isSelectedKey
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                                : "bg-slate-50 dark:bg-[#151515] border-slate-200 dark:border-[#2a2a2a] text-slate-500 hover:border-slate-400"
                            }`}
                          >
                            {key}
                          </button>
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
                            placeholder={`Teks pilihan jawaban ${key}...`}
                            className={`flex-1 h-10 px-3.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#151515] border text-slate-900 dark:text-slate-100 focus:outline-none ${
                              fieldErrors[fieldName]
                                ? "border-rose-500"
                                : isSelectedKey
                                  ? "border-emerald-500/70"
                                  : "border-slate-200 dark:border-[#2a2a2a]"
                            }`}
                          />
                        </div>
                        {fieldErrors[fieldName] && (
                          <p className="text-xs text-rose-600 mt-1 pl-11">
                            {fieldErrors[fieldName]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* C. PEMBAHASAN */}
              <div className="space-y-3">
                <div className="border-b border-slate-100 dark:border-[#1e1e1e] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    C. Pembahasan Jawaban <span className="text-rose-500">*</span>
                  </h3>
                </div>

                <div>
                  <textarea
                    id="quiz-explanation"
                    rows={3}
                    required
                    disabled={isSubmitting}
                    value={form.explanationText}
                    onChange={(e) => {
                      clearFieldError("explanationText");
                      setForm((prev) => ({
                        ...prev,
                        explanationText: e.target.value,
                      }));
                    }}
                    placeholder="Jelaskan alasan mengapa kunci jawaban tersebut benar..."
                    className={`w-full p-3.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#151515] border text-slate-900 dark:text-slate-100 focus:outline-none ${
                      fieldErrors.explanationText
                        ? "border-rose-500"
                        : "border-slate-200 dark:border-[#2a2a2a]"
                    }`}
                  />
                  {fieldErrors.explanationText && (
                    <p className="text-xs text-rose-600 mt-1">
                      {fieldErrors.explanationText}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-[#242424] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={handleCloseFormModal}
                  className="h-9 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-5 rounded-xl text-xs font-semibold bg-[#E5242A] hover:bg-[#C91E25] text-white cursor-pointer"
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

      {/* ====================================================================
          MODAL DETAIL LENGKAP SOAL
          ==================================================================== */}
      {detailQuiz && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#242424] flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  {detailQuiz.moduleTitle}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Detail Butir Soal Kuis
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailQuiz(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#181818] text-xs text-slate-600 dark:text-slate-300 mb-2">
                  Indikator:{" "}
                  {detailQuiz.indicatorConcept || detailQuiz.indicator_concept}
                </span>
                <p className="font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
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
                      className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-[#062c19]/60 border-emerald-300 dark:border-[#0e4429] text-emerald-900 dark:text-[#34d399] font-semibold"
                          : "bg-slate-50 dark:bg-[#0a0a0a] border-slate-200 dark:border-[#242424] text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="font-mono font-bold">{key}.</span>
                      <span className="flex-1">{text}</span>
                      {isCorrect && (
                        <span className="text-[11px] font-bold shrink-0">
                          ✓ Kunci Jawaban
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#242424] space-y-1 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
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
                className="h-8 px-3 text-xs rounded-xl cursor-pointer"
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
                className="h-8 px-3.5 text-xs font-semibold rounded-xl bg-[#E5242A] text-white cursor-pointer"
              >
                Edit Soal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL KONFIRMASI HAPUS SOAL
          ==================================================================== */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-6 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hapus Soal Kuis?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Anda yakin ingin menghapus pertanyaan berikut dari modul{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  {deleteTarget.moduleTitle}
                </strong>
                ?
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#272727] text-xs text-slate-700 dark:text-slate-300 line-clamp-3">
                &ldquo;{deleteTarget.questionText || deleteTarget.question_text}
                &rdquo;
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="h-9 px-3.5 rounded-xl text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="h-9 px-4 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
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
