import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  ExternalLink,
  FileQuestion,
  Loader2,
  Menu,
  Minimize2,
  NotebookPen,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { aiTutorApi, learningApi } from "../../services/apiClient";
import { LEVEL_META, LevelBadge } from "../admin/adminConstants";
import StructuredLessonRenderer from "./StructuredLessonRenderer";

const GUEST_PROGRESS_STORAGE_KEY = "investpedia_guest_lesson_progress_v1";
const GUEST_NOTES_STORAGE_KEY = "investpedia_guest_study_notes_v1";

const QUICK_AI_PROMPTS = [
  "Ringkas poin paling penting dari materi ini.",
  "Berikan contoh simulasi nyata di Bursa Efek Indonesia (BEI).",
  "Apa kesalahan umum investor pemula terkait topik ini?",
];

function LessonStatusIcon({ status, isActive }) {
  const s = String(status || "NOT_STARTED").toUpperCase();
  if (s === "COMPLETED") {
    return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
  }
  if (s === "IN_PROGRESS" || isActive) {
    return (
      <span className="w-4 h-4 rounded-full border-2 border-[#e3252f] flex items-center justify-center shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e3252f]" />
      </span>
    );
  }
  return <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />;
}

export default function UserLearningPage({ defaultOpenAi = false }) {
  const { isAuthenticated } = useAuth();

  // Catalog & Active Selection
  const [courses, setCourses] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState(null);
  const [selectedLessonSlug, setSelectedLessonSlug] = useState(null);

  // Active Lesson Detail
  const [lessonDetail, setLessonDetail] = useState(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  // Sidebar & Navigation UI
  const [sidebarTab, setSidebarTab] = useState("modules"); // "modules" | "notes"
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [lessonSearchQuery, setLessonSearchQuery] = useState("");

  // Guest Progress Fallback (merged with server progress when authenticated)
  const [guestProgressMap, setGuestProgressMap] = useState(() => {
    try {
      const raw = localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Study Notes
  const [notes, setNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Module Quiz Evaluation Runner
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Learning with AI (Bottom Bar / Expandable Tutor)
  const [aiExpanded, setAiExpanded] = useState(Boolean(defaultOpenAi));
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Halo! Saya **InvestPedia AI Investment Tutor**. Saya membaca materi yang sedang Anda pelajari secara langsung. Tanyakan konsep, rumus, atau istilah pasar modal yang ingin Anda pahami lebih dalam.",
      sources: [],
    },
  ]);
  const [isAskingAi, setIsAskingAi] = useState(false);
  const aiChatEndRef = useRef(null);

  // Load courses catalog
  const loadCatalog = useCallback(async (preserveSelection = true) => {
    try {
      setIsLoadingCatalog(true);
      const res = await learningApi.getCourses();
      const loadedCourses = res?.data?.courses || [];
      setCourses(loadedCourses);

      // Expand all modules by default
      const exp = {};
      for (const c of loadedCourses) {
        for (const m of c.modules || []) {
          exp[m.id] = true;
        }
      }
      setExpandedModules((prev) => ({ ...exp, ...prev }));

      if (loadedCourses.length > 0) {
        setSelectedCourseSlug((prevCourse) => {
          if (preserveSelection && prevCourse && loadedCourses.some((c) => c.slug === prevCourse)) {
            return prevCourse;
          }
          return loadedCourses[0].slug;
        });

        setSelectedLessonSlug((prevLesson) => {
          if (preserveSelection && prevLesson) {
            for (const c of loadedCourses) {
              for (const m of c.modules || []) {
                if ((m.lessons || []).some((l) => l.slug === prevLesson)) {
                  return prevLesson;
                }
              }
            }
          }
          const firstCourse = loadedCourses[0];
          const firstLesson = firstCourse?.modules?.[0]?.lessons?.[0];
          return firstLesson?.slug || null;
        });
      }
    } catch (err) {
      console.error("Failed to load learning catalog:", err);
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog(false);
  }, [loadCatalog]);

  // Active course object
  const activeCourse = useMemo(() => {
    if (!courses.length) return null;
    return courses.find((c) => c.slug === selectedCourseSlug) || courses[0];
  }, [courses, selectedCourseSlug]);

  // Flatten all lessons in the active course for Previous/Next navigation & progress calculation
  const courseLessonsFlat = useMemo(() => {
    if (!activeCourse) return [];
    const list = [];
    for (const mod of activeCourse.modules || []) {
      for (const lesson of mod.lessons || []) {
        const effectiveStatus = isAuthenticated
          ? lesson.progressStatus || "NOT_STARTED"
          : guestProgressMap[lesson.id] || lesson.progressStatus || "NOT_STARTED";
        list.push({
          ...lesson,
          progressStatus: effectiveStatus,
          moduleTitle: mod.title,
          moduleId: mod.id,
          moduleQuizCount: mod.quizCount ?? 0,
        });
      }
    }
    return list;
  }, [activeCourse, isAuthenticated, guestProgressMap]);

  // Calculate active course progress
  const courseProgressStats = useMemo(() => {
    const total = courseLessonsFlat.length;
    const completed = courseLessonsFlat.filter(
      (l) => l.progressStatus === "COMPLETED"
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [courseLessonsFlat]);

  // Load selected lesson detail
  const loadLesson = useCallback(async (slug) => {
    if (!slug) return;
    try {
      setIsLoadingLesson(true);
      const res = await learningApi.getLessonBySlug(slug);
      const lesson = res?.data?.lesson;
      if (lesson) {
        setLessonDetail(lesson);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Failed to load lesson detail:", err);
    } finally {
      setIsLoadingLesson(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLessonSlug) {
      loadLesson(selectedLessonSlug);
    }
  }, [selectedLessonSlug, loadLesson]);

  // Load study notes for active lesson
  const loadNotes = useCallback(
    async (lessonId) => {
      if (!lessonId) return;
      if (!isAuthenticated) {
        try {
          const raw = localStorage.getItem(GUEST_NOTES_STORAGE_KEY);
          const allGuestNotes = raw ? JSON.parse(raw) : [];
          setNotes(allGuestNotes.filter((n) => n.lessonId === lessonId));
        } catch {
          setNotes([]);
        }
        return;
      }
      try {
        const res = await learningApi.getNotes(lessonId);
        setNotes(res?.data?.notes || []);
      } catch {
        setNotes([]);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    if (lessonDetail?.id) {
      loadNotes(lessonDetail.id);
    }
  }, [lessonDetail?.id, loadNotes]);

  // Handle switching course
  const handleSelectCourse = (course) => {
    setSelectedCourseSlug(course.slug);
    const firstLesson = course.modules?.[0]?.lessons?.[0];
    if (firstLesson) {
      setSelectedLessonSlug(firstLesson.slug);
    }
  };

  // Mark lesson completed / in-progress
  const handleToggleLessonCompleted = async () => {
    if (!lessonDetail?.id) return;
    const currentEffective = isAuthenticated
      ? lessonDetail.progressStatus || "NOT_STARTED"
      : guestProgressMap[lessonDetail.id] || "NOT_STARTED";
    const nextStatus = currentEffective === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";

    try {
      setIsUpdatingProgress(true);
      if (isAuthenticated) {
        await learningApi.updateLessonProgress(lessonDetail.id, {
          status: nextStatus,
        });
        await loadCatalog(true);
      } else {
        const updatedMap = {
          ...guestProgressMap,
          [lessonDetail.id]: nextStatus,
        };
        setGuestProgressMap(updatedMap);
        localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(updatedMap));
      }
      setLessonDetail((prev) =>
        prev ? { ...prev, progressStatus: nextStatus } : prev
      );
    } catch (err) {
      console.error("Failed to update progress:", err);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Study Notes CRUD
  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !lessonDetail?.id) return;
    try {
      setIsSavingNote(true);
      if (isAuthenticated) {
        await learningApi.createNote({
          lessonId: lessonDetail.id,
          content: newNoteContent.trim(),
        });
        await loadNotes(lessonDetail.id);
      } else {
        const raw = localStorage.getItem(GUEST_NOTES_STORAGE_KEY);
        const all = raw ? JSON.parse(raw) : [];
        const newNote = {
          id: `guest-note-${Date.now()}`,
          lessonId: lessonDetail.id,
          content: newNoteContent.trim(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [newNote, ...all];
        localStorage.setItem(GUEST_NOTES_STORAGE_KEY, JSON.stringify(updated));
        setNotes(updated.filter((n) => n.lessonId === lessonDetail.id));
      }
      setNewNoteContent("");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSaveEditNote = async (noteId) => {
    if (!editingNoteText.trim() || !lessonDetail?.id) return;
    try {
      setIsSavingNote(true);
      if (isAuthenticated) {
        await learningApi.updateNote(noteId, { content: editingNoteText.trim() });
        await loadNotes(lessonDetail.id);
      } else {
        const raw = localStorage.getItem(GUEST_NOTES_STORAGE_KEY);
        const all = raw ? JSON.parse(raw) : [];
        const updated = all.map((n) =>
          n.id === noteId
            ? { ...n, content: editingNoteText.trim(), updatedAt: new Date().toISOString() }
            : n
        );
        localStorage.setItem(GUEST_NOTES_STORAGE_KEY, JSON.stringify(updated));
        setNotes(updated.filter((n) => n.lessonId === lessonDetail.id));
      }
      setEditingNoteId(null);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!lessonDetail?.id) return;
    if (isAuthenticated) {
      await learningApi.deleteNote(noteId);
      await loadNotes(lessonDetail.id);
    } else {
      const raw = localStorage.getItem(GUEST_NOTES_STORAGE_KEY);
      const all = raw ? JSON.parse(raw) : [];
      const updated = all.filter((n) => n.id !== noteId);
      localStorage.setItem(GUEST_NOTES_STORAGE_KEY, JSON.stringify(updated));
      setNotes(updated.filter((n) => n.lessonId === lessonDetail.id));
    }
  };

  // Module Quiz Runner Handlers
  const handleOpenModuleQuiz = async (moduleId) => {
    if (!moduleId) return;
    try {
      setQuizModalOpen(true);
      setIsLoadingQuiz(true);
      setQuizResult(null);
      setQuizAnswers({});
      const res = await learningApi.getModuleQuiz(moduleId);
      setQuizData(res?.data || null);
    } catch (err) {
      console.error("Failed to load module quiz:", err);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleSubmitModuleQuiz = async () => {
    if (!quizData?.module?.id) return;
    const questions = quizData.questions || [];
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      selectedKey: quizAnswers[q.id] || "A",
      selectedOption: quizAnswers[q.id] || "A",
    }));

    try {
      setIsSubmittingQuiz(true);
      const res = await learningApi.submitModuleQuiz(
        quizData.module.id,
        formattedAnswers
      );
      setQuizResult(res?.data || null);
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Ask AI Investment Tutor (Grounded on Active Lesson)
  const handleAskAiTutor = async (questionText) => {
    const q = (questionText ?? aiInput).trim();
    if (!q || isAskingAi) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text: q,
    };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setAiExpanded(true);

    try {
      setIsAskingAi(true);
      const res = await aiTutorApi.askTutor({
        question: q,
        courseSlug: activeCourse?.slug || null,
        moduleId: lessonDetail?.moduleId || null,
        lessonId: lessonDetail?.id || null,
        lessonSlug: lessonDetail?.slug || null,
      });
      const data = res?.data;
      const chunksUsed = data?.context?.chunksUsed || data?.sources || [];
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          text:
            data?.answer ||
            "Berikut penjelasan berdasarkan materi pembelajaran InvestPedia.",
          sources: chunksUsed.map((c) => ({
            heading: c.sectionTitle || c.heading || c.lessonTitle || "Materi Terkait",
          })),
          disclaimer: data?.disclaimer,
        },
      ]);
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          text:
            err.message ||
            "Maaf, terjadi kendala saat menghubungi AI Investment Tutor. Silakan coba kembali.",
          sources: [],
        },
      ]);
    } finally {
      setIsAskingAi(false);
      setTimeout(() => {
        aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Filtered modules in sidebar by search query
  const filteredSidebarModules = useMemo(() => {
    if (!activeCourse) return [];
    const mods = activeCourse.modules || [];
    if (!lessonSearchQuery.trim()) return mods;
    const q = lessonSearchQuery.trim().toLowerCase();
    return mods
      .map((m) => {
        const matchedLessons = (m.lessons || []).filter(
          (l) =>
            l.title?.toLowerCase().includes(q) ||
            l.summary?.toLowerCase().includes(q)
        );
        if (m.title?.toLowerCase().includes(q) || matchedLessons.length > 0) {
          return {
            ...m,
            lessons: matchedLessons.length > 0 ? matchedLessons : m.lessons,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [activeCourse, lessonSearchQuery]);

  // Current lesson effective progress status
  const activeLessonEffectiveStatus = useMemo(() => {
    if (!lessonDetail?.id) return "NOT_STARTED";
    return isAuthenticated
      ? lessonDetail.progressStatus || "NOT_STARTED"
      : guestProgressMap[lessonDetail.id] || lessonDetail.progressStatus || "NOT_STARTED";
  }, [lessonDetail, isAuthenticated, guestProgressMap]);

  // Previous / Next Lesson from courseLessonsFlat
  const { prevLesson, nextLesson } = useMemo(() => {
    const idx = courseLessonsFlat.findIndex((l) => l.slug === selectedLessonSlug);
    if (idx === -1) {
      return {
        prevLesson: lessonDetail?.navigation?.previousLesson || null,
        nextLesson: lessonDetail?.navigation?.nextLesson || null,
      };
    }
    return {
      prevLesson: idx > 0 ? courseLessonsFlat[idx - 1] : null,
      nextLesson:
        idx < courseLessonsFlat.length - 1 ? courseLessonsFlat[idx + 1] : null,
    };
  }, [courseLessonsFlat, selectedLessonSlug, lessonDetail]);

  return (
    <div className="min-h-[calc(100vh-7rem)] pb-28">
      {/* ====================================================================
          8.1 TOP LEARNING NAVIGATION & COURSE SWITCHER BAR
          ==================================================================== */}
      <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Mobile Drawer Trigger + Course Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden h-9 px-3 rounded-lg border border-slate-200 dark:border-[#272727] bg-slate-50 dark:bg-[#161616] text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>Daftar Modul</span>
          </button>

          <div className="flex flex-wrap items-center gap-1.5">
            {courses.map((course) => {
              const isSelected = course.slug === activeCourse?.slug;
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleSelectCourse(course)}
                  className={`h-9 px-3.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-xs"
                      : "bg-slate-100/80 dark:bg-[#161616] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{course.title}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-white/15 dark:bg-slate-900/15"
                        : "bg-slate-200/70 dark:bg-[#242424]"
                    }`}
                  >
                    {LEVEL_META[course.level]?.label || course.level}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Search Lessons & Active Module Quiz CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={lessonSearchQuery}
              onChange={(e) => setLessonSearchQuery(e.target.value)}
              placeholder="Cari topik atau materi..."
              className="w-full h-9 pl-8 pr-7 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400"
            />
            {lessonSearchQuery && (
              <button
                type="button"
                onClick={() => setLessonSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {lessonDetail?.moduleId && (
            <button
              type="button"
              onClick={() => handleOpenModuleQuiz(lessonDetail.moduleId)}
              className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-[#e3252f] hover:bg-[#c91f28] text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <FileQuestion className="w-3.5 h-3.5" />
              <span>Evaluasi Kuis Modul</span>
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================
          MAIN WORKSPACE GRID (8.2 Left Sidebar + 8.3 Center Lesson Reader)
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Mobile Drawer Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}

        {/* ==================================================================
            8.2 LEARNING SIDEBAR (LEFT — 4 Cols on Desktop, Drawer on Mobile)
            ================================================================== */}
        <aside
          className={`lg:col-span-4 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] overflow-hidden flex flex-col ${
            mobileSidebarOpen
              ? "fixed inset-y-0 left-0 z-50 w-80 max-w-[90vw] rounded-none"
              : "hidden lg:flex lg:sticky lg:top-20 max-h-[calc(100vh-8rem)]"
          }`}
        >
          {/* Active Course Progress Card */}
          <div className="p-5 bg-slate-950 text-white border-b border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#e3252f] text-white font-semibold">
                  {LEVEL_META[activeCourse?.level]?.label || "Kurikulum"}
                </span>
                <h2 className="text-base font-bold tracking-tight text-white leading-snug">
                  {activeCourse?.title || "Investasi Saham"}
                </h2>
              </div>
              {mobileSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Progress Bar & Stats */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  {courseProgressStats.completed} dari {courseProgressStats.total} materi selesai
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {courseProgressStats.percentage}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${courseProgressStats.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Tabs: 1. Daftar Modul | 2. Catatan Belajar */}
          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-[#242424] bg-slate-50/80 dark:bg-[#141414]">
            <button
              type="button"
              onClick={() => setSidebarTab("modules")}
              className={`py-3 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                sidebarTab === "modules"
                  ? "border-[#e3252f] text-slate-900 dark:text-white bg-white dark:bg-[#101010]"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Daftar Modul</span>
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab("notes")}
              className={`py-3 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                sidebarTab === "notes"
                  ? "border-[#e3252f] text-slate-900 dark:text-white bg-white dark:bg-[#101010]"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <NotebookPen className="w-3.5 h-3.5" />
              <span>Catatan Belajar ({notes.length})</span>
            </button>
          </div>

          {/* TAB 1: DAFTAR MODUL & MATERI */}
          {sidebarTab === "modules" ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
              {isLoadingCatalog ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-lg bg-slate-100 dark:bg-[#181818] animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredSidebarModules.length === 0 ? (
                <div className="py-10 px-4 text-center text-xs text-slate-500">
                  Tidak ada modul atau materi yang cocok dengan kata kunci pencarian.
                </div>
              ) : (
                filteredSidebarModules.map((mod, modIdx) => {
                  const isOpen = Boolean(expandedModules[mod.id]);
                  const modLessons = mod.lessons || [];
                  const completedInMod = modLessons.filter((l) => {
                    const st = isAuthenticated
                      ? l.progressStatus
                      : guestProgressMap[l.id] || l.progressStatus;
                    return st === "COMPLETED";
                  }).length;

                  return (
                    <div
                      key={mod.id}
                      className="rounded-xl border border-slate-200 dark:border-[#242424] bg-slate-50/40 dark:bg-[#0c0c0c] overflow-hidden"
                    >
                      {/* Module Header */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedModules((prev) => ({
                            ...prev,
                            [mod.id]: !prev[mod.id],
                          }))
                        }
                        className="w-full px-3.5 py-3 flex items-start justify-between gap-2 text-left hover:bg-slate-100/70 dark:hover:bg-[#161616] transition-colors cursor-pointer"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                            Modul {modIdx + 1} • {completedInMod}/{modLessons.length} Selesai
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                            {mod.title}
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                        )}
                      </button>

                      {/* Lessons List inside Module */}
                      {isOpen && (
                        <div className="px-2 pb-2 pt-1 space-y-1 border-t border-slate-200/70 dark:border-[#1e1e1e]">
                          {modLessons.map((lesson) => {
                            const isActive = lesson.slug === selectedLessonSlug;
                            const effectiveStatus = isAuthenticated
                              ? lesson.progressStatus || "NOT_STARTED"
                              : guestProgressMap[lesson.id] ||
                                lesson.progressStatus ||
                                "NOT_STARTED";

                            return (
                              <button
                                key={lesson.id}
                                type="button"
                                onClick={() => {
                                  setSelectedLessonSlug(lesson.slug);
                                  setMobileSidebarOpen(false);
                                }}
                                className={`w-full px-3 py-2.5 rounded-lg flex items-start gap-2.5 text-left transition-all cursor-pointer ${
                                  isActive
                                    ? "bg-[#e3252f]/10 dark:bg-[#e3252f]/15 text-[#e3252f] font-semibold border border-[#e3252f]/30"
                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#181818]"
                                }`}
                              >
                                <div className="mt-0.5">
                                  <LessonStatusIcon
                                    status={effectiveStatus}
                                    isActive={isActive}
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs leading-snug line-clamp-2">
                                    {lesson.title}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                    <span>{lesson.estimatedMinutes || 5} menit</span>
                                    {effectiveStatus === "COMPLETED" && (
                                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                        • Selesai
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}

                          {/* Module Quiz Trigger Row */}
                          {(mod.quizCount ?? 0) > 0 && (
                            <button
                              type="button"
                              onClick={() => handleOpenModuleQuiz(mod.id)}
                              className="w-full mt-1 px-3 py-2 rounded-lg text-xs font-medium bg-white dark:bg-[#141414] hover:bg-slate-100 dark:hover:bg-[#1c1c1c] border border-slate-200 dark:border-[#262626] text-slate-700 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <FileQuestion className="w-3.5 h-3.5 text-[#e3252f]" />
                                <span>Kuis Evaluasi Modul</span>
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#222222]">
                                {mod.quizCount} soal
                              </span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* TAB 2: CATATAN BELAJAR (STUDY NOTES CRUD) */
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <form onSubmit={handleCreateNote} className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                  Tambah Catatan pada Materi Ini
                </label>
                <textarea
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Tulis rangkuman pribadi, rumus penting, atau poin kunci..."
                  className="w-full p-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900"
                />
                <Button
                  type="submit"
                  disabled={isSavingNote || !newNoteContent.trim()}
                  className="w-full h-8 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
                >
                  {isSavingNote ? "Menyimpan..." : "+ Simpan Catatan Belajar"}
                </Button>
              </form>

              <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-[#242424]">
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Belum ada catatan belajar untuk materi ini.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#242424] space-y-2 text-xs"
                    >
                      {editingNoteId === note.id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            className="w-full p-2 rounded bg-white dark:bg-[#141414] border border-slate-300 dark:border-[#333]"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="px-2 py-1 rounded text-[11px] text-slate-500 cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditNote(note.id)}
                              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {note.content}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>
                              {note.updatedAt
                                ? new Date(note.updatedAt).toLocaleDateString("id-ID")
                                : "Baru saja"}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditingNoteText(note.content);
                                }}
                                className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
                              >
                                Ubah
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-rose-500 hover:underline cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>

        {/* ==================================================================
            8.3 MAIN LEARNING CONTENT AREA (CENTER/RIGHT — 8 Cols)
            ================================================================== */}
        <section className="lg:col-span-8 space-y-6">
          {isLoadingLesson || !lessonDetail ? (
            <div className="p-8 sm:p-12 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] space-y-4">
              <div className="h-6 w-40 rounded bg-slate-100 dark:bg-[#1a1a1a] animate-pulse" />
              <div className="h-9 w-3/4 rounded bg-slate-100 dark:bg-[#1a1a1a] animate-pulse" />
              <div className="h-32 w-full rounded bg-slate-100 dark:bg-[#1a1a1a] animate-pulse" />
            </div>
          ) : (
            <article className="rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] overflow-hidden">
              {/* Article Top Header */}
              <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-[#222222] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <LevelBadge level={lessonDetail.difficultyLevel || lessonDetail.level} />
                    <span>•</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {lessonDetail.submoduleTitle || lessonDetail.moduleTitle || lessonDetail.module?.title}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {lessonDetail.estimatedDuration || lessonDetail.estimatedMinutes || 5} menit baca
                    </span>
                  </div>

                  {activeLessonEffectiveStatus === "COMPLETED" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-[#062c19] text-emerald-700 dark:text-[#34d399] border border-emerald-200 dark:border-[#0e4429]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Selesai Dipelajari
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {lessonDetail.title}
                </h1>

                {lessonDetail.summary && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {lessonDetail.summary}
                  </p>
                )}

                {/* Learning Objectives Box */}
                {Array.isArray(lessonDetail.learningObjectives) &&
                  lessonDetail.learningObjectives.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200/90 dark:border-[#242424] space-y-2">
                      <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[#e3252f]" />
                        <span>Tujuan Pembelajaran</span>
                      </div>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
                        {lessonDetail.learningObjectives.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              {/* Structured Block Content Body */}
              <div className="p-6 sm:p-8 max-w-3xl mx-auto">
                <StructuredLessonRenderer blocks={lessonDetail.contentBlocks || []} />

                {/* Official References Section */}
                {Array.isArray(lessonDetail.references) &&
                  lessonDetail.references.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-slate-200 dark:border-[#222222] space-y-3">
                      <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Referensi & Sumber Materi
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {lessonDetail.references.map((ref, idx) => (
                          <a
                            key={idx}
                            href={ref.url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-lg bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#242424] hover:border-[#e3252f] flex items-center justify-between gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            <span className="truncate">{ref.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* ==============================================================
                  BOTTOM LESSON PROGRESS & PREVIOUS / NEXT NAVIGATION
                  ============================================================== */}
              <div className="px-6 sm:px-8 py-5 bg-slate-50/80 dark:bg-[#0c0c0c] border-t border-slate-200 dark:border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Previous Lesson Button */}
                <div>
                  {prevLesson ? (
                    <button
                      type="button"
                      onClick={() => setSelectedLessonSlug(prevLesson.slug)}
                      className="h-10 px-4 rounded-xl text-xs font-medium border border-slate-200 dark:border-[#272727] bg-white dark:bg-[#141414] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1c1c1c] inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-[10px] text-slate-400">Sebelumnya</div>
                        <div className="font-semibold truncate max-w-[160px]">
                          {prevLesson.title}
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Mark as Completed + Next Lesson */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isUpdatingProgress}
                    onClick={handleToggleLessonCompleted}
                    className={`h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                      activeLessonEffectiveStatus === "COMPLETED"
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                    }`}
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    <span>
                      {activeLessonEffectiveStatus === "COMPLETED"
                        ? "Selesai Dipelajari ✓"
                        : "Tandai Selesai"}
                    </span>
                  </button>

                  {nextLesson && (
                    <button
                      type="button"
                      onClick={() => setSelectedLessonSlug(nextLesson.slug)}
                      className="h-10 px-4 rounded-xl text-xs font-semibold bg-[#e3252f] hover:bg-[#c91f28] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <div className="text-right">
                        <div className="text-[10px] text-white/80">Selanjutnya</div>
                        <div className="truncate max-w-[160px]">{nextLesson.title}</div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          )}
        </section>
      </div>

      {/* ====================================================================
          8.4 LEARNING WITH AI (BOTTOM BAR & EXPANDABLE AI INVESTMENT TUTOR)
          ==================================================================== */}
      <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none px-4 pb-3">
        <div className="max-w-5xl mx-auto pointer-events-auto">
          <div className="rounded-2xl bg-white/95 dark:bg-[#101010]/95 backdrop-blur-md border border-slate-200 dark:border-[#2a2a2a] shadow-2xl overflow-hidden">
            {/* Expanded Conversation Area */}
            {aiExpanded && (
              <div className="border-b border-slate-200 dark:border-[#242424]">
                {/* Header Drawer AI */}
                <div className="px-4 py-2.5 bg-slate-950 text-white flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold">
                      Learning with AI — InvestPedia Tutor
                    </span>
                    {lessonDetail?.title && (
                      <span className="hidden sm:inline-block text-[11px] font-mono text-slate-300 truncate max-w-xs px-2 py-0.5 rounded bg-white/10">
                        Konteks: {lessonDetail.title}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiExpanded(false)}
                    className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages History */}
                <div className="max-h-72 overflow-y-auto p-4 space-y-3 bg-slate-50/60 dark:bg-[#0a0a0a] custom-scrollbar">
                  {aiMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-2xl rounded-xl px-4 py-3 text-xs sm:text-sm space-y-2 ${
                          msg.role === "user"
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-medium"
                            : "bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <div className="whitespace-pre-line leading-relaxed">
                          {msg.text}
                        </div>

                        {Array.isArray(msg.sources) && msg.sources.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 dark:border-[#222222] flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="font-mono uppercase">Sumber Materi:</span>
                            {msg.sources.map((src, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1f1f1f] text-slate-600 dark:text-slate-300"
                              >
                                {src.heading}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isAskingAi && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-[#e3252f]" />
                      <span>Menganalisis materi pembelajaran yang aktif...</span>
                    </div>
                  )}
                  <div ref={aiChatEndRef} />
                </div>

                {/* Quick Prompt Chips */}
                <div className="px-4 py-2 bg-white dark:bg-[#101010] border-t border-slate-100 dark:border-[#1e1e1e] flex flex-wrap items-center gap-1.5">
                  {QUICK_AI_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAskAiTutor(prompt)}
                      className="px-2.5 py-1 rounded-full text-[11px] bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compact Bottom Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAiTutor();
              }}
              className="px-4 py-2.5 flex items-center gap-2.5"
            >
              <button
                type="button"
                onClick={() => setAiExpanded((prev) => !prev)}
                className="h-9 px-3 rounded-xl bg-[#e3252f]/10 text-[#e3252f] border border-[#e3252f]/25 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Learning with AI</span>
                {aiExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </button>

              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onFocus={() => setAiExpanded(true)}
                placeholder={
                  lessonDetail?.title
                    ? `Tanyakan ke AI seputar "${lessonDetail.title}"...`
                    : "Tanyakan konsep investasi saham ke AI Tutor..."
                }
                className="flex-1 h-9 px-3.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400"
              />

              <Button
                type="submit"
                disabled={isAskingAi || !aiInput.trim()}
                className="h-9 px-4 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tanya AI</span>
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MODAL EVALUASI KUIS MODUL (DETERMINISTIC SCORING + DIAGNOSTIC)
          ==================================================================== */}
      {quizModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-2xl max-h-[88vh] rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#242424] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#e3252f] font-semibold">
                  Evaluasi Pemahaman Kurikulum
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {quizData?.module?.title || "Kuis Modul Pembelajaran"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuizModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {isLoadingQuiz ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Memuat soal evaluasi modul...
                </div>
              ) : !quizData?.questions?.length ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Belum ada soal evaluasi pada modul ini.
                </div>
              ) : (
                <>
                  {quizResult && (
                    <div
                      className={`p-4 rounded-xl border space-y-2 ${
                        quizResult.passed
                          ? "bg-emerald-50 dark:bg-[#062c19]/60 border-emerald-200 dark:border-[#0e4429]"
                          : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Skor Evaluasi Anda
                        </span>
                        <span className="text-xl font-bold font-mono">
                          {quizResult.scorePercentage ?? quizResult.score} / 100 ({quizResult.correctCount}/
                          {quizResult.totalQuestions} Benar)
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        {quizResult.aiFeedback?.summary_narrative || quizResult.aiRecommendation}
                      </p>
                    </div>
                  )}

                  {quizData.questions.map((q, qIdx) => {
                    const selected = quizAnswers[q.id];
                    const evalList = quizResult?.evaluations || quizResult?.details || [];
                    const detailFeedback = evalList.find((d) => d.questionId === q.id);

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#242424] space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                            {qIdx + 1}. {q.questionText}
                          </span>
                          {(q.indicatorConcept || q.indicatorTag) && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200/70 dark:bg-[#222222] text-slate-600 dark:text-slate-300 shrink-0">
                              {q.indicatorConcept || q.indicatorTag}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          {["A", "B", "C", "D"].map((letter) => {
                            const optFromArray = Array.isArray(q.options)
                              ? q.options.find((o) => o.key === letter)?.text
                              : null;
                            const optionText = optFromArray || q[`option${letter}`] || "";
                            const isChosen = selected === letter;
                            return (
                              <button
                                key={letter}
                                type="button"
                                disabled={Boolean(quizResult)}
                                onClick={() =>
                                  setQuizAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: letter,
                                  }))
                                }
                                className={`w-full p-2.5 rounded-lg text-left text-xs flex items-center gap-2.5 border transition-colors cursor-pointer ${
                                  isChosen
                                    ? "border-slate-900 dark:border-white bg-white dark:bg-[#1c1c1c] font-semibold"
                                    : "border-slate-200 dark:border-[#262626] bg-white/70 dark:bg-[#0c0c0c]"
                                }`}
                              >
                                <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-[#222222] font-mono font-bold flex items-center justify-center shrink-0">
                                  {letter}
                                </span>
                                <span>{optionText}</span>
                              </button>
                            );
                          })}
                        </div>

                        {detailFeedback && (
                          <div
                            className={`p-2.5 rounded-lg text-xs ${
                              detailFeedback.isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300"
                            }`}
                          >
                            <strong>
                              {detailFeedback.isCorrect
                                ? "Jawaban Tepat!"
                                : `Kurang Tepat (Kunci: ${detailFeedback.correctKey || detailFeedback.correctOption}).`}
                            </strong>{" "}
                            {detailFeedback.explanationText || detailFeedback.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-[#242424] flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-[#0c0c0c]">
              {quizResult ? (
                <Button
                  type="button"
                  onClick={() => {
                    setQuizResult(null);
                    setQuizAnswers({});
                  }}
                  className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
                >
                  Ulangi Evaluasi
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={
                    isSubmittingQuiz ||
                    !quizData?.questions?.length ||
                    Object.keys(quizAnswers).length < (quizData?.questions?.length || 0)
                  }
                  onClick={handleSubmitModuleQuiz}
                  className="h-9 px-5 rounded-lg text-xs font-semibold bg-[#e3252f] hover:bg-[#c91f28] text-white cursor-pointer"
                >
                  {isSubmittingQuiz ? "Menilai Jawaban..." : "Kirim Jawaban Evaluasi"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
