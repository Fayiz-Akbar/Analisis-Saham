import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Eye,
  FileQuestion,
  FileText,
  FolderOpen,
  GripVertical,
  Heading2,
  Image as ImageIcon,
  Info,
  Italic,
  Layers,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Paperclip,
  PenTool,
  Plus,
  Quote,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Type,
  Underline,
  Upload,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "../../services/apiClient";
import StructuredLessonRenderer from "../learning/StructuredLessonRenderer";
import { LEVEL_META, LevelBadge, slugifyTitle } from "./adminConstants";

const BLOCK_CATALOG = [
  {
    group: "Teks & Struktur",
    items: [
      { type: "heading", label: "Subjudul (H1–H3)", icon: Heading2 },
      { type: "paragraph", label: "Paragraf Teks", icon: Type },
      { type: "list", label: "Daftar Poin / Nomor", icon: List },
      { type: "quote", label: "Kutipan (Quote)", icon: Quote },
      { type: "divider", label: "Pemisah Bagian", icon: Minus },
    ],
  },
  {
    group: "Sorotan & Analisis",
    items: [
      { type: "callout", label: "Kotak Sorotan (Callout)", icon: Info },
      { type: "formula", label: "Rumus Finansial", icon: Sparkles },
      { type: "table", label: "Tabel Perbandingan", icon: TableIcon },
      { type: "code", label: "Blok Kode / Rumus Teknis", icon: Code2 },
    ],
  },
  {
    group: "Media & Lampiran",
    items: [
      { type: "image", label: "Gambar / Ilustrasi", icon: ImageIcon },
      { type: "video", label: "Video Embed", icon: Video },
      { type: "attachment", label: "File Lampiran", icon: Paperclip },
    ],
  },
  {
    group: "Interaktif & Evaluasi",
    items: [
      { type: "interactive_quiz", label: "Kuis Interaktif Inline", icon: FileQuestion },
      { type: "steps", label: "Langkah Berurutan", icon: ListOrdered },
      { type: "accordion", label: "Accordion (Buka-Tutup)", icon: ListChecks },
      { type: "related", label: "Tautan Materi Terkait", icon: Link2 },
    ],
  },
];

function createEmptyBlock(type) {
  const id = `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  switch (type) {
    case "heading":
      return { id, type: "heading", level: 2, text: "Subjudul Pembahasan Baru", align: "left" };
    case "paragraph":
      return {
        id,
        type: "paragraph",
        text: "Tuliskan penjelasan materi investasi secara jelas, terstruktur, dan mudah dipahami oleh pembelajar.",
        align: "left",
      };
    case "list":
      return {
        id,
        type: "list",
        style: "unordered",
        items: ["Poin pembahasan pertama", "Poin pembahasan kedua"],
      };
    case "callout":
      return {
        id,
        type: "callout",
        variant: "concept",
        title: "Konsep Utama",
        text: "Ringkasan konsep penting yang wajib diingat oleh investor.",
      };
    case "formula":
      return {
        id,
        type: "formula",
        title: "Rumus Perhitungan Rasio",
        expression: "ROE = (Laba Bersih / Total Ekuitas) × 100%",
        explanation: "Mengukur persentase laba bersih yang dihasilkan dari setiap rupiah modal pemegang saham.",
      };
    case "table":
      return {
        id,
        type: "table",
        caption: "Tabel Perbandingan Indikator",
        hasHeader: true,
        headers: ["Indikator", "Definisi", "Standar Ideal"],
        rows: [
          ["ROE", "Return on Equity", "> 15% per tahun"],
          ["DER", "Debt to Equity Ratio", "< 1.0x (sehat)"],
        ],
      };
    case "image":
      return {
        id,
        type: "image",
        url: "",
        alt: "Ilustrasi grafik pasar modal",
        caption: "Ilustrasi pergerakan harga dan kapitalisasi pasar.",
        size: "large",
        align: "center",
      };
    case "video":
      return {
        id,
        type: "video",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        title: "Video Penjelasan Materi",
        caption: "Simak video singkat berikut untuk memperdalam pemahaman konsep.",
      };
    case "attachment":
      return {
        id,
        type: "attachment",
        title: "Lembar Kerja Analisis Fundamental (PDF)",
        url: "https://www.idx.co.id",
        fileType: "PDF / Dokumen",
        fileSize: "1.2 MB",
        description: "Panduan ringkas pemeriksaan laporan keuangan emiten.",
      };
    case "code":
      return {
        id,
        type: "code",
        language: "financial",
        caption: "Contoh Simulasi Perhitungan Lot & Biaya Transaksi",
        code: "Harga Saham = Rp 2.500\n1 Lot = 100 Lembar\nModal 1 Lot = 2.500 x 100 = Rp 250.000",
      };
    case "quote":
      return {
        id,
        type: "quote",
        text: "Price is what you pay. Value is what you get.",
        author: "Warren Buffett",
        role: "Chairman & CEO Berkshire Hathaway",
      };
    case "interactive_quiz":
      return {
        id,
        type: "interactive_quiz",
        questionType: "multiple_choice",
        question: "Apa arti dari pembelian 1 lot saham di Bursa Efek Indonesia?",
        options: [
          "Membeli 1 lembar saham perusahaan",
          "Membeli 100 lembar saham perusahaan",
          "Membeli 1.000 lembar saham perusahaan",
          "Membeli obligasi pemerintah",
        ],
        correctOptionIndex: 1,
        explanation: "Sesuai regulasi BEI, 1 lot saham setara dengan 100 lembar saham.",
      };
    case "accordion":
      return {
        id,
        type: "accordion",
        title: "Pertanyaan Umum Seputar Materi",
        items: [
          {
            title: "Mengapa kita perlu melihat ROE dan DER secara bersamaan?",
            content:
              "ROE yang tinggi bisa saja didorong oleh utang (DER) yang besar. Memeriksa keduanya memastikan profitabilitas perusahaan benar-benar sehat.",
          },
        ],
      };
    case "steps":
      return {
        id,
        type: "steps",
        title: "Langkah Analisis Sebelum Membeli Saham",
        steps: [
          {
            title: "Periksa Model Bisnis & Sektor",
            description: "Pahami sumber pendapatan utama perusahaan dan posisi kompetitifnya.",
          },
          {
            title: "Evaluasi Profitabilitas & Solvabilitas",
            description: "Pastikan ROE konsisten bertumbuh dan DER berada pada batas aman.",
          },
        ],
      };
    case "related":
      return {
        id,
        type: "related",
        title: "Referensi & Materi Lanjutan",
        items: [
          {
            title: "Sekolah Pasar Modal — Bursa Efek Indonesia",
            url: "https://sekolahpasarmodal.idx.co.id",
            description: "Portal edukasi resmi bagi investor pasar modal Indonesia.",
          },
        ],
      };
    case "divider":
    default:
      return { id, type: "divider" };
  }
}

function StatusPill({ status }) {
  const s = String(status || "PUBLISHED").toUpperCase();
  if (s === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-[#062c19]/80 text-emerald-700 dark:text-[#34d399] border border-emerald-200 dark:border-[#0e4429]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Terbit
      </span>
    );
  }
  if (s === "ARCHIVED") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
        Arsip
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-[#18181b] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#27272a]">
      Draft
    </span>
  );
}

export default function LearningContentStudio({
  onOpenModuleQuizzes,
  onModulesChanged,
  onNotify,
}) {
  const [courses, setCourses] = useState([]);
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [treeSearch, setTreeSearch] = useState("");

  // Expanded state for courses and modules
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  // Currently selected lesson
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [lessonDetail, setLessonDetail] = useState(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  // Editor state for the active lesson
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [submoduleTitle, setSubmoduleTitle] = useState("Materi Utama");
  const [level, setLevel] = useState("BEGINNER");
  const [estimatedMinutes, setEstimatedMinutes] = useState(5);
  const [status, setStatus] = useState("PUBLISHED");
  const [moduleId, setModuleId] = useState("");
  const [learningObjectives, setLearningObjectives] = useState([]);
  const [keywordsText, setKeywordsText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [references, setReferences] = useState([]);
  const [contentBlocks, setContentBlocks] = useState([]);
  const [revisions, setRevisions] = useState([]);

  // Studio UI modes
  const [workspaceMode, setWorkspaceMode] = useState("editor"); // "editor" | "preview"
  const [rightPanelTab, setRightPanelTab] = useState("properties"); // "properties" | "revisions" | "ai_readiness"
  const [showAddBlockMenuAt, setShowAddBlockMenuAt] = useState(null); // index or "end"
  const [activeBlockIndex, setActiveBlockIndex] = useState(null);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState(null);

  // Autosave & Save Status
  const [saveState, setSaveState] = useState("saved"); // "saved" | "unsaved" | "saving" | "failed"
  const [validationErrors, setValidationErrors] = useState([]);
  const autosaveTimerRef = useRef(null);
  const isHydratingLessonRef = useRef(false);

  // Quick Create Modals (Course / Module / Lesson / Delete Confirmation)
  const [createDialog, setCreateDialog] = useState(null); // { type: "course" | "module" | "lesson", courseId?, moduleId?, level? }
  const [createFormTitle, setCreateFormTitle] = useState("");
  const [createFormSummary, setCreateFormSummary] = useState("");
  const [createFormSubmodule, setCreateFormSubmodule] = useState("Submodul 1: Konsep Dasar");
  const [createFormLevel, setCreateFormLevel] = useState("BEGINNER");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: "course" | "module" | "lesson", id, title }
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const notify = useCallback(
    (msg, type = "success") => {
      if (onNotify) onNotify(msg, type);
    },
    [onNotify]
  );

  // Load full CMS hierarchy
  const loadCmsTree = useCallback(
    async (preferredLessonId = null) => {
      try {
        setIsLoadingTree(true);
        const res = await adminApi.getCmsTree();
        const loadedCourses = res?.data?.courses || [];
        setCourses(loadedCourses);

        // Expand all courses & modules by default on first load
        setExpandedCourses((prev) => {
          const next = { ...prev };
          for (const c of loadedCourses) {
            if (next[c.id] === undefined) next[c.id] = true;
          }
          return next;
        });
        setExpandedModules((prev) => {
          const next = { ...prev };
          for (const c of loadedCourses) {
            for (const m of c.modules || []) {
              if (next[m.id] === undefined) next[m.id] = true;
            }
          }
          return next;
        });

        // Pick active lesson
        const targetId = preferredLessonId || selectedLessonId;
        let foundLesson = null;
        for (const c of loadedCourses) {
          for (const m of c.modules || []) {
            for (const l of m.lessons || []) {
              if (targetId && l.id === targetId) {
                foundLesson = l;
                break;
              }
              if (!foundLesson) foundLesson = l;
            }
          }
        }

        if (foundLesson && foundLesson.id !== selectedLessonId) {
          setSelectedLessonId(foundLesson.id);
        } else if (!foundLesson) {
          setSelectedLessonId(null);
          setLessonDetail(null);
        }
      } catch (err) {
        notify(err.message || "Gagal memuat hierarki CMS.", "error");
      } finally {
        setIsLoadingTree(false);
      }
    },
    [notify, selectedLessonId]
  );

  useEffect(() => {
    loadCmsTree();
  }, []);

  // Flatten modules for dropdown selection
  const allModulesFlat = useMemo(() => {
    const list = [];
    for (const c of courses) {
      for (const m of c.modules || []) {
        list.push({
          ...m,
          courseTitle: c.title,
          courseLevel: c.level,
        });
      }
    }
    return list;
  }, [courses]);

  // Hydrate lesson detail when selectedLessonId changes
  const loadLessonDetail = useCallback(
    async (lessonId) => {
      if (!lessonId) return;
      try {
        setIsLoadingLesson(true);
        isHydratingLessonRef.current = true;
        const res = await adminApi.getLessonDetail(lessonId);
        const lesson = res?.data?.lesson;
        if (!lesson) return;

        setLessonDetail(lesson);
        setTitle(lesson.title || "");
        setSlug(lesson.slug || "");
        setSummary(lesson.summary || "");
        setSubmoduleTitle(lesson.submoduleTitle || "Materi Utama");
        setLevel(lesson.difficultyLevel || lesson.level || "BEGINNER");
        setEstimatedMinutes(lesson.estimatedDuration || lesson.estimatedMinutes || 5);
        setStatus(lesson.status || (lesson.isPublished ? "PUBLISHED" : "DRAFT"));
        setModuleId(lesson.moduleId || "");
        setLearningObjectives(
          Array.isArray(lesson.learningObjectives) && lesson.learningObjectives.length > 0
            ? lesson.learningObjectives
            : ["Memahami konsep utama materi secara terstruktur"]
        );
        setKeywordsText(Array.isArray(lesson.keywords) ? lesson.keywords.join(", ") : "");
        setTagsText(Array.isArray(lesson.tags) ? lesson.tags.join(", ") : "");
        setReferences(Array.isArray(lesson.references) ? lesson.references : []);

        const rawBlocks = Array.isArray(lesson.contentBlocks?.blocks)
          ? lesson.contentBlocks.blocks
          : Array.isArray(lesson.contentBlocks)
            ? lesson.contentBlocks
            : [];
        const hydratedBlocks = rawBlocks.map((b) => ({
          ...b,
          text: b.text ?? b.content ?? "",
          content: b.content ?? b.text ?? "",
          align: b.align ?? b.alignment ?? "left",
          style: b.style ?? (b.ordered ? "ordered" : "unordered"),
          options: Array.isArray(b.options)
            ? b.options.map((opt) => (typeof opt === "string" ? opt : opt?.text || ""))
            : b.options,
        }));
        setContentBlocks(hydratedBlocks);
        setRevisions(
          Array.isArray(res?.data?.revisions)
            ? res.data.revisions
            : Array.isArray(lesson.revisions)
              ? lesson.revisions
              : []
        );
        setValidationErrors([]);
        setSaveState("saved");
      } catch (err) {
        notify(err.message || "Gagal memuat detail materi pembelajaran.", "error");
      } finally {
        setIsLoadingLesson(false);
        setTimeout(() => {
          isHydratingLessonRef.current = false;
        }, 120);
      }
    },
    [notify]
  );

  useEffect(() => {
    if (selectedLessonId) {
      loadLessonDetail(selectedLessonId);
    }
  }, [selectedLessonId, loadLessonDetail]);

  // Build payload from editor state
  const buildLessonPayload = useCallback(
    (overrideStatus = null, changeSummary = null) => {
      const targetStatus = overrideStatus || status;
      const keywords = keywordsText
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      const tags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      return {
        moduleId,
        submoduleTitle: submoduleTitle.trim() || "Materi Utama",
        title: title.trim() || "Materi Tanpa Judul",
        slug: slug.trim() || slugifyTitle(title || "materi-baru"),
        summary: summary.trim(),
        level,
        difficultyLevel: level,
        estimatedMinutes: Math.max(1, Number(estimatedMinutes) || 5),
        estimatedDuration: Math.max(1, Number(estimatedMinutes) || 5),
        status: targetStatus,
        isPublished: targetStatus === "PUBLISHED",
        learningObjectives: learningObjectives.map((o) => o.trim()).filter(Boolean),
        keywords,
        tags,
        references: references.filter((r) => r && r.title?.trim()),
        contentBlocks: {
          schemaVersion: 1,
          blocks: contentBlocks.map((b) => ({
            ...b,
            content: b.text ?? b.content ?? "",
            text: b.text ?? b.content ?? "",
            alignment: b.align ?? b.alignment ?? "left",
            ordered: b.style ? b.style === "ordered" : Boolean(b.ordered),
          })),
        },
        changeSummary: changeSummary || "Pembaruan materi melalui Learning Content Studio",
      };
    },
    [
      moduleId,
      submoduleTitle,
      title,
      slug,
      summary,
      level,
      estimatedMinutes,
      status,
      learningObjectives,
      keywordsText,
      tagsText,
      references,
      contentBlocks,
    ]
  );

  // Save handler (manual or autosave)
  const handleSaveLesson = useCallback(
    async ({ overrideStatus = null, isAuto = false, changeSummary = null } = {}) => {
      if (!selectedLessonId) return;
      try {
        setSaveState("saving");
        setValidationErrors([]);
        const payload = buildLessonPayload(overrideStatus, changeSummary);
        const res = await adminApi.updateLesson(selectedLessonId, payload);
        const updated = res?.data?.lesson;
        if (updated) {
          setLessonDetail((prev) => ({
            ...(prev || {}),
            ...updated,
          }));
          if (overrideStatus) {
            setStatus(updated.status);
          }
        }
        setSaveState("saved");
        if (!isAuto) {
          notify(
            overrideStatus === "PUBLISHED"
              ? `Materi "${payload.title}" berhasil dipublikasikan ke halaman belajar.`
              : `Perubahan materi "${payload.title}" berhasil disimpan.`,
            "success"
          );
          await loadCmsTree(selectedLessonId);
          if (onModulesChanged) onModulesChanged();
        }
      } catch (err) {
        setSaveState("failed");
        notify(err.message || "Gagal menyimpan perubahan materi.", "error");
      }
    },
    [selectedLessonId, buildLessonPayload, notify, loadCmsTree, onModulesChanged]
  );

  // Trigger unsaved state & debounced autosave when content changes
  const markDirty = useCallback(() => {
    if (isHydratingLessonRef.current || !selectedLessonId) return;
    setSaveState("unsaved");
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      handleSaveLesson({ isAuto: true, changeSummary: "Autosave blok materi" });
    }, 2800);
  }, [selectedLessonId, handleSaveLesson]);

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  // Block operations
  const handleAddBlock = (type, insertIndex = null) => {
    const newBlock = createEmptyBlock(type);
    setContentBlocks((prev) => {
      const next = [...prev];
      if (insertIndex === null || insertIndex === "end" || insertIndex >= next.length) {
        next.push(newBlock);
      } else {
        next.splice(insertIndex + 1, 0, newBlock);
      }
      return next;
    });
    setShowAddBlockMenuAt(null);
    markDirty();
  };

  const handleUpdateBlock = (index, patch) => {
    setContentBlocks((prev) =>
      prev.map((blk, idx) => (idx === index ? { ...blk, ...patch } : blk))
    );
    markDirty();
  };

  const handleDuplicateBlock = (index) => {
    setContentBlocks((prev) => {
      const target = prev[index];
      if (!target) return prev;
      const copy = JSON.parse(JSON.stringify(target));
      copy.id = `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
    markDirty();
  };

  const handleDeleteBlock = (index) => {
    setContentBlocks((prev) => prev.filter((_, idx) => idx !== index));
    markDirty();
  };

  const handleMoveBlock = (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    setContentBlocks((prev) => {
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    markDirty();
  };

  // Drag & Drop blocks
  const handleBlockDragStart = (index) => {
    setDraggedBlockIndex(index);
  };

  const handleBlockDragOver = (e, index) => {
    e.preventDefault();
    if (draggedBlockIndex === null || draggedBlockIndex === index) return;
    setContentBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggedBlockIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDraggedBlockIndex(index);
    markDirty();
  };

  const handleBlockDragEnd = () => {
    setDraggedBlockIndex(null);
  };

  // Inline formatting helper for active paragraph/heading block
  const applyInlineFormat = (index, wrapperLeft, wrapperRight = wrapperLeft) => {
    const textarea = document.getElementById(`block-editor-input-${index}`);
    const currentText = String(contentBlocks[index]?.text || "");
    if (!textarea) {
      handleUpdateBlock(index, {
        text: `${currentText} ${wrapperLeft}teks${wrapperRight}`,
      });
      return;
    }
    const start = textarea.selectionStart ?? currentText.length;
    const end = textarea.selectionEnd ?? currentText.length;
    const selected = currentText.slice(start, end) || "teks";
    const updated =
      currentText.slice(0, start) +
      wrapperLeft +
      selected +
      wrapperRight +
      currentText.slice(end);
    handleUpdateBlock(index, { text: updated });
  };

  // Image file upload to Data URL
  const handleImageFileUpload = (index, file) => {
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      notify("Ukuran gambar maksimal 2.5 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      handleUpdateBlock(index, {
        url: String(reader.result || ""),
        alt: contentBlocks[index]?.alt || file.name.replace(/\.[^.]+$/, ""),
      });
    };
    reader.readAsDataURL(file);
  };

  // Duplicate entire Lesson
  const handleDuplicateLesson = async (lessonId) => {
    try {
      const res = await adminApi.duplicateLesson(lessonId);
      const newLesson = res?.data?.lesson;
      notify(`Materi berhasil diduplikasi sebagai Draft.`, "success");
      await loadCmsTree(newLesson?.id);
      if (onModulesChanged) onModulesChanged();
    } catch (err) {
      notify(err.message || "Gagal menduplikasi materi.", "error");
    }
  };

  // Restore Revision
  const handleRestoreRevision = async (revisionId) => {
    if (!selectedLessonId) return;
    try {
      await adminApi.restoreLessonRevision(selectedLessonId, revisionId);
      notify("Versi materi berhasil dipulihkan.", "success");
      await loadLessonDetail(selectedLessonId);
      await loadCmsTree(selectedLessonId);
    } catch (err) {
      notify(err.message || "Gagal memulihkan versi materi.", "error");
    }
  };

  // Reorder lessons inside a module
  const handleReorderLessonInTree = async (mod, lessonIndex, direction) => {
    const lessons = [...(mod.lessons || [])];
    const targetIdx = direction === "up" ? lessonIndex - 1 : lessonIndex + 1;
    if (targetIdx < 0 || targetIdx >= lessons.length) return;
    const [moved] = lessons.splice(lessonIndex, 1);
    lessons.splice(targetIdx, 0, moved);

    try {
      await adminApi.reorderCms({
        itemType: "lessons",
        orderedIds: lessons.map((l) => l.id),
      });
      await loadCmsTree(selectedLessonId);
    } catch (err) {
      notify(err.message || "Gagal mengubah urutan materi.", "error");
    }
  };

  // Create Course / Module / Lesson Dialog Submit
  const handleOpenCreateDialog = (config) => {
    setCreateDialog(config);
    setCreateFormTitle("");
    setCreateFormSummary("");
    setCreateFormSubmodule("Submodul 1: Konsep Dasar");
    setCreateFormLevel(config.level || "BEGINNER");
  };

  const handleConfirmCreateDialog = async (e) => {
    e.preventDefault();
    if (!createDialog || !createFormTitle.trim()) return;
    try {
      setIsSubmittingCreate(true);
      if (createDialog.type === "course") {
        await adminApi.createCourse({
          title: createFormTitle.trim(),
          summary: createFormSummary.trim(),
          level: createFormLevel,
          status: "PUBLISHED",
          isPublished: true,
        });
        notify(`Course "${createFormTitle.trim()}" berhasil dibuat.`, "success");
        await loadCmsTree();
      } else if (createDialog.type === "module") {
        const res = await adminApi.createModule({
          courseId: createDialog.courseId,
          submoduleTitle: createFormSubmodule.trim() || "Modul Utama",
          title: createFormTitle.trim(),
          slug: slugifyTitle(createFormTitle.trim()),
          summary:
            createFormSummary.trim() ||
            `Pembahasan terstruktur mengenai ${createFormTitle.trim()} di pasar modal.`,
          level: createFormLevel,
          estimatedMinutes: 6,
          status: "DRAFT",
          isPublished: false,
          contentBlocks: [
            createEmptyBlock("heading"),
            createEmptyBlock("paragraph"),
            createEmptyBlock("callout"),
          ],
        });
        const createdMod = res?.data?.module;
        notify(`Modul "${createFormTitle.trim()}" berhasil ditambahkan.`, "success");
        await loadCmsTree(createdMod?.lessons?.[0]?.id);
        if (onModulesChanged) onModulesChanged();
      } else if (createDialog.type === "lesson") {
        const res = await adminApi.createLesson({
          moduleId: createDialog.moduleId,
          submoduleTitle: createFormSubmodule.trim() || "Materi Utama",
          title: createFormTitle.trim(),
          slug: slugifyTitle(createFormTitle.trim()),
          summary:
            createFormSummary.trim() ||
            `Pelajari konsep dan aplikasi ${createFormTitle.trim()} secara komprehensif.`,
          level: createFormLevel,
          estimatedMinutes: 5,
          status: "DRAFT",
          isPublished: false,
          contentBlocks: [
            {
              id: `blk-${Date.now()}-1`,
              type: "heading",
              level: 2,
              text: createFormTitle.trim(),
              align: "left",
            },
            createEmptyBlock("paragraph"),
            createEmptyBlock("callout"),
          ],
        });
        const newLesson = res?.data?.lesson;
        notify(`Materi "${createFormTitle.trim()}" berhasil dibuat.`, "success");
        await loadCmsTree(newLesson?.id);
        if (newLesson?.id) setSelectedLessonId(newLesson.id);
        if (onModulesChanged) onModulesChanged();
      }
      setCreateDialog(null);
    } catch (err) {
      notify(err.message || "Gagal membuat item baru.", "error");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Delete Course / Module / Lesson
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setIsDeletingItem(true);
      if (deleteConfirm.type === "course") {
        await adminApi.deleteCourse(deleteConfirm.id);
      } else if (deleteConfirm.type === "module") {
        await adminApi.deleteModule(deleteConfirm.id);
      } else {
        await adminApi.deleteLesson(deleteConfirm.id);
      }
      notify(`"${deleteConfirm.title}" berhasil dihapus.`, "success");
      setDeleteConfirm(null);
      await loadCmsTree();
      if (onModulesChanged) onModulesChanged();
    } catch (err) {
      notify(err.message || "Gagal menghapus item.", "error");
    } finally {
      setIsDeletingItem(false);
    }
  };

  // Filter tree by search query
  const filteredCourses = useMemo(() => {
    if (!treeSearch.trim()) return courses;
    const q = treeSearch.trim().toLowerCase();
    return courses
      .map((course) => {
        const matchedModules = (course.modules || [])
          .map((mod) => {
            const matchedLessons = (mod.lessons || []).filter(
              (l) =>
                l.title?.toLowerCase().includes(q) ||
                l.submoduleTitle?.toLowerCase().includes(q)
            );
            if (mod.title?.toLowerCase().includes(q) || matchedLessons.length > 0) {
              return {
                ...mod,
                lessons: matchedLessons.length > 0 ? matchedLessons : mod.lessons,
              };
            }
            return null;
          })
          .filter(Boolean);

        if (course.title?.toLowerCase().includes(q) || matchedModules.length > 0) {
          return {
            ...course,
            modules: matchedModules,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [courses, treeSearch]);

  const activeModuleMeta = useMemo(() => {
    return allModulesFlat.find((m) => m.id === moduleId) || null;
  }, [allModulesFlat, moduleId]);

  return (
    <div className="space-y-4">
      {/* ====================================================================
          TOP STUDIO HEADER BAR
          ==================================================================== */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider bg-[#e3252f]/10 text-[#e3252f] border border-[#e3252f]/25">
              <PenTool className="w-3 h-3" />
              Learning Content Studio
            </span>
            {lessonDetail?.version && (
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                v{lessonDetail.version}
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Visual Block-Based CMS & AI Knowledge Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola hierarki Course → Modul → Submodul → Materi secara visual. Setiap materi yang diterbitkan otomatis disinkronkan ke halaman belajar pengguna dan basis pengetahuan AI Tutor.
          </p>
        </div>

        {/* Status Autosave & Aksi Publikasi */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Save State Indicator */}
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#262626] text-xs flex items-center gap-1.5">
            {saveState === "saving" && (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span className="text-slate-600 dark:text-slate-300">Menyimpan...</span>
              </>
            )}
            {saveState === "saved" && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">Tersimpan</span>
              </>
            )}
            {saveState === "unsaved" && (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Belum disimpan
                </span>
              </>
            )}
            {saveState === "failed" && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  Gagal menyimpan
                </span>
              </>
            )}
          </div>

          {/* Toggle Mode Editor vs Live Preview */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-[#181818] border border-slate-200 dark:border-[#282828]">
            <button
              type="button"
              onClick={() => setWorkspaceMode("editor")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                workspaceMode === "editor"
                  ? "bg-white dark:bg-[#0c0c0c] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Visual Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode("preview")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                workspaceMode === "preview"
                  ? "bg-white dark:bg-[#0c0c0c] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau Belajar</span>
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={!selectedLessonId || saveState === "saving"}
            onClick={() =>
              handleSaveLesson({
                overrideStatus: "DRAFT",
                changeSummary: "Simpan sebagai Draft",
              })
            }
            className="h-9 px-3 rounded-lg text-xs font-medium cursor-pointer"
          >
            Simpan Draft
          </Button>

          <Button
            type="button"
            disabled={!selectedLessonId || saveState === "saving"}
            onClick={() =>
              handleSaveLesson({
                overrideStatus: "PUBLISHED",
                changeSummary: "Publikasi materi ke halaman belajar",
              })
            }
            className="h-9 px-4 rounded-lg text-xs font-semibold bg-[#e3252f] hover:bg-[#c91f28] text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan & Terbitkan</span>
          </Button>
        </div>
      </div>

      {/* ====================================================================
          3-COLUMN CMS STUDIO LAYOUT (Area 1: Tree | Area 2: Block Editor | Area 3: Properties)
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ==================================================================
            AREA 1: CONTENT NAVIGATION SIDEBAR (3 Cols)
            ================================================================== */}
        <aside className="lg:col-span-3 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] overflow-hidden flex flex-col max-h-[82vh]">
          <div className="p-3.5 border-b border-slate-200 dark:border-[#242424] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#e3252f]" />
                Struktur Kurikulum
              </span>
              <button
                type="button"
                onClick={() =>
                  handleOpenCreateDialog({ type: "course", level: "BEGINNER" })
                }
                className="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                title="Tambah Course / Kelas Baru"
              >
                <Plus className="w-3 h-3" />
                <span>Course</span>
              </button>
            </div>

            {/* Search in Tree */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={treeSearch}
                onChange={(e) => setTreeSearch(e.target.value)}
                placeholder="Cari course, modul, materi..."
                className="w-full h-8 pl-8 pr-7 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400"
              />
              {treeSearch && (
                <button
                  type="button"
                  onClick={() => setTreeSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Hierarchical Tree List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
            {isLoadingTree ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-12 rounded-lg bg-slate-100 dark:bg-[#181818] animate-pulse"
                  />
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Tidak ada materi yang cocok dengan filter.
              </div>
            ) : (
              filteredCourses.map((course) => {
                const isCourseOpen = Boolean(expandedCourses[course.id]);
                return (
                  <div
                    key={course.id}
                    className="rounded-lg border border-slate-200/90 dark:border-[#222222] bg-slate-50/40 dark:bg-[#0c0c0c] overflow-hidden"
                  >
                    {/* Course Header */}
                    <div className="px-2.5 py-2 flex items-center justify-between gap-1.5 bg-slate-100/70 dark:bg-[#141414]">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCourses((prev) => ({
                            ...prev,
                            [course.id]: !prev[course.id],
                          }))
                        }
                        className="flex items-center gap-1.5 min-w-0 text-left flex-1 cursor-pointer"
                      >
                        {isCourseOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {course.title}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span>{LEVEL_META[course.level]?.label || course.level}</span>
                            <span>•</span>
                            <span>{(course.modules || []).length} modul</span>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCreateDialog({
                            type: "module",
                            courseId: course.id,
                            level: course.level,
                          })
                        }
                        title="Tambah Modul di Course ini"
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#242424] text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Course Modules */}
                    {isCourseOpen && (
                      <div className="p-2 space-y-2">
                        {(course.modules || []).map((mod) => {
                          const isModOpen = Boolean(expandedModules[mod.id]);
                          const quizCount = mod._count?.quizQuestions ?? 0;

                          return (
                            <div
                              key={mod.id}
                              className="rounded-md border border-slate-200/70 dark:border-[#202020] bg-white dark:bg-[#101010]"
                            >
                              {/* Module Row */}
                              <div className="px-2.5 py-1.5 flex items-center justify-between gap-1 border-b border-slate-100 dark:border-[#1a1a1a]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedModules((prev) => ({
                                      ...prev,
                                      [mod.id]: !prev[mod.id],
                                    }))
                                  }
                                  className="flex items-center gap-1.5 min-w-0 text-left flex-1 cursor-pointer"
                                >
                                  <FolderOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {mod.title}
                                  </span>
                                </button>

                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenCreateDialog({
                                        type: "lesson",
                                        moduleId: mod.id,
                                        level: mod.level,
                                      })
                                    }
                                    title="Tambah Materi (Lesson) di Modul ini"
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  {onOpenModuleQuizzes && (
                                    <button
                                      type="button"
                                      onClick={() => onOpenModuleQuizzes(mod)}
                                      title={`Kelola Kuis Modul (${quizCount} soal)`}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                                    >
                                      {quizCount}Q
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Module Lessons */}
                              {isModOpen && (
                                <div className="p-1.5 space-y-1">
                                  {(mod.lessons || []).map((lesson, lIdx) => {
                                    const isSelected = lesson.id === selectedLessonId;
                                    return (
                                      <div
                                        key={lesson.id}
                                        className={`group px-2 py-1.5 rounded-md flex items-center justify-between gap-1.5 text-xs transition-colors ${
                                          isSelected
                                            ? "bg-[#e3252f]/10 dark:bg-[#e3252f]/15 text-[#e3252f] font-semibold border border-[#e3252f]/30"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#181818]"
                                        }`}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => setSelectedLessonId(lesson.id)}
                                          className="flex items-start gap-1.5 min-w-0 text-left flex-1 cursor-pointer"
                                        >
                                          <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-75" />
                                          <div className="min-w-0">
                                            <div className="truncate leading-snug">
                                              {lesson.title}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                              <StatusPill status={lesson.status} />
                                              <span className="text-[10px] text-slate-400">
                                                {lesson.estimatedMinutes || 5}m
                                              </span>
                                            </div>
                                          </div>
                                        </button>

                                        {/* Quick Lesson Tree Actions */}
                                        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                                          <button
                                            type="button"
                                            disabled={lIdx === 0}
                                            onClick={() =>
                                              handleReorderLessonInTree(mod, lIdx, "up")
                                            }
                                            title="Pindah ke atas"
                                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-[#262626] disabled:opacity-30 cursor-pointer"
                                          >
                                            <ArrowUp className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={lIdx === (mod.lessons || []).length - 1}
                                            onClick={() =>
                                              handleReorderLessonInTree(mod, lIdx, "down")
                                            }
                                            title="Pindah ke bawah"
                                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-[#262626] disabled:opacity-30 cursor-pointer"
                                          >
                                            <ArrowDown className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDuplicateLesson(lesson.id)}
                                            title="Duplikasi Materi"
                                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-[#262626] cursor-pointer"
                                          >
                                            <Copy className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setDeleteConfirm({
                                                type: "lesson",
                                                id: lesson.id,
                                                title: lesson.title,
                                              })
                                            }
                                            title="Hapus Materi"
                                            className="p-0.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ==================================================================
            AREA 2: VISUAL CONTENT EDITOR WORKSPACE / PREVIEW (6 Cols)
            ================================================================== */}
        <section className="lg:col-span-6 space-y-4">
          {!selectedLessonId || isLoadingLesson ? (
            <div className="p-12 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {isLoadingLesson
                  ? "Memuat blok materi pembelajaran..."
                  : "Pilih materi di panel kiri atau buat materi baru untuk mulai menyusun konten."}
              </p>
            </div>
          ) : workspaceMode === "preview" ? (
            /* ================================================================
               LIVE PREVIEW MODE (Exact Same Renderer as User Learning View)
               ================================================================ */
            <div className="rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] overflow-hidden">
              <div className="px-6 py-3.5 bg-slate-50 dark:bg-[#141414] border-b border-slate-200 dark:border-[#242424] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#e3252f]" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Pratinjau Tampilan Pengguna (Single Source of Truth)
                  </span>
                </div>
                <StatusPill status={status} />
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-2 border-b border-slate-200 dark:border-[#222222] pb-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <LevelBadge level={level} />
                    <span>•</span>
                    <span>{submoduleTitle}</span>
                    <span>•</span>
                    <span>Estimasi {estimatedMinutes} menit baca</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {title}
                  </h2>
                  {summary && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {summary}
                    </p>
                  )}
                </div>

                {learningObjectives.filter(Boolean).length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#242424] space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Tujuan Pembelajaran
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 list-disc pl-5">
                      {learningObjectives.filter(Boolean).map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <StructuredLessonRenderer blocks={contentBlocks} />
              </div>
            </div>
          ) : (
            /* ================================================================
               VISUAL BLOCK-BASED WYSIWYG EDITOR WORKSPACE
               ================================================================ */
            <div className="space-y-4">
              {/* Validation Errors Banner */}
              {validationErrors.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-[#2a0e12] border border-rose-200 dark:border-[#4c151c] space-y-1.5">
                  <div className="text-xs font-semibold text-rose-800 dark:text-[#f87171] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Validasi Publikasi Materi
                  </div>
                  <ul className="text-xs text-rose-700 dark:text-rose-200 list-disc pl-5 space-y-1">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lesson Title & Summary Header Card */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <input
                    type="text"
                    value={submoduleTitle}
                    onChange={(e) => {
                      setSubmoduleTitle(e.target.value);
                      markDirty();
                    }}
                    placeholder="Nama Submodul (contoh: Submodul 1: Konsep Dasar)"
                    className="text-xs font-mono font-medium text-[#e3252f] bg-transparent border-b border-transparent focus:border-[#e3252f] focus:outline-none px-0.5 py-0.5"
                  />
                  <div className="flex items-center gap-2">
                    <StatusPill status={status} />
                    <span className="text-[11px] font-mono text-slate-400">
                      {contentBlocks.length} blok konten
                    </span>
                  </div>
                </div>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    markDirty();
                  }}
                  placeholder="Judul Materi Pembelajaran..."
                  className="w-full text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-[#242424] focus:border-slate-900 dark:focus:border-white focus:outline-none pb-2"
                />

                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    markDirty();
                  }}
                  placeholder="Ringkasan eksekutif materi (ditampilkan pada kartu modul & pengantar belajar)..."
                  className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#242424] rounded-lg p-2.5 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 resize-none"
                />
              </div>

              {/* BLOCKS CANVAS */}
              <div className="space-y-3">
                {contentBlocks.map((block, index) => {
                  const isFocused = activeBlockIndex === index;
                  return (
                    <div
                      key={block.id || index}
                      draggable
                      onDragStart={() => handleBlockDragStart(index)}
                      onDragOver={(e) => handleBlockDragOver(e, index)}
                      onDragEnd={handleBlockDragEnd}
                      onClick={() => setActiveBlockIndex(index)}
                      className={`rounded-xl bg-white dark:bg-[#101010] border transition-all ${
                        isFocused
                          ? "border-slate-900 dark:border-slate-300 ring-1 ring-slate-900/10 dark:ring-white/10"
                          : "border-slate-200 dark:border-[#242424] hover:border-slate-300 dark:hover:border-[#333333]"
                      }`}
                    >
                      {/* Block Top Toolbar */}
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-[#1c1c1c] bg-slate-50/60 dark:bg-[#141414]/60 flex flex-wrap items-center justify-between gap-2 rounded-t-xl">
                        <div className="flex items-center gap-2">
                          <span
                            title="Seret untuk mengubah urutan blok"
                            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
                          >
                            <GripVertical className="w-4 h-4" />
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-200/70 dark:bg-[#222222] text-slate-700 dark:text-slate-200">
                            {block.type}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            #{index + 1}
                          </span>
                        </div>

                        {/* Inline Formatting Toolbar for Text/Paragraph/Heading */}
                        {(block.type === "paragraph" || block.type === "heading") && (
                          <div className="flex items-center gap-0.5 bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#262626] rounded-md p-0.5">
                            <button
                              type="button"
                              onClick={() => applyInlineFormat(index, "**")}
                              title="Tebal (Bold)"
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                              <Bold className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => applyInlineFormat(index, "*")}
                              title="Miring (Italic)"
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                              <Italic className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => applyInlineFormat(index, "<u>", "</u>")}
                              title="Garis Bawah (Underline)"
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                              <Underline className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => applyInlineFormat(index, "~~")}
                              title="Coret (Strikethrough)"
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                              <Strikethrough className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => applyInlineFormat(index, "`")}
                              title="Kode Inline"
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                              <Code2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                applyInlineFormat(index, "[", "](https://www.idx.co.id)")
                              }
                              title="Sisipkan Tautan"
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-px h-3.5 bg-slate-200 dark:bg-[#262626] mx-0.5" />
                            {[
                              { id: "left", icon: AlignLeft, label: "Rata Kiri" },
                              { id: "center", icon: AlignCenter, label: "Rata Tengah" },
                              { id: "right", icon: AlignRight, label: "Rata Kanan" },
                              { id: "justify", icon: AlignJustify, label: "Rata Kiri-Kanan" },
                            ].map((al) => {
                              const AlignIcon = al.icon;
                              return (
                                <button
                                  key={al.id}
                                  type="button"
                                  onClick={() => handleUpdateBlock(index, { align: al.id })}
                                  title={al.label}
                                  className={`p-1 rounded cursor-pointer ${
                                    (block.align || "left") === al.id
                                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1f1f1f]"
                                  }`}
                                >
                                  <AlignIcon className="w-3.5 h-3.5" />
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Block Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveBlock(index, "up")}
                            title="Pindah ke atas"
                            className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-[#222222] disabled:opacity-30 text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === contentBlocks.length - 1}
                            onClick={() => handleMoveBlock(index, "down")}
                            title="Pindah ke bawah"
                            className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-[#222222] disabled:opacity-30 text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateBlock(index)}
                            title="Duplikasi blok ini"
                            className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-[#222222] text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlock(index)}
                            title="Hapus blok ini"
                            className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* ======================================================
                          BLOCK-SPECIFIC VISUAL CONTROLS
                          ====================================================== */}
                      <div className="p-4 space-y-3">
                        {/* 1. HEADING BLOCK */}
                        {block.type === "heading" && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={block.level || 2}
                              onChange={(e) =>
                                handleUpdateBlock(index, { level: Number(e.target.value) })
                              }
                              className="h-9 px-2.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            >
                              <option value={1}>H1 — Judul Utama</option>
                              <option value={2}>H2 — Subjudul Bagian</option>
                              <option value={3}>H3 — Sub-bagian</option>
                            </select>
                            <input
                              id={`block-editor-input-${index}`}
                              type="text"
                              value={block.text || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { text: e.target.value })
                              }
                              placeholder="Tulis subjudul bagian..."
                              className="flex-1 h-9 px-3 rounded-lg text-sm font-semibold bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-white focus:outline-none focus:border-slate-900"
                            />
                          </div>
                        )}

                        {/* 2. PARAGRAPH BLOCK */}
                        {block.type === "paragraph" && (
                          <textarea
                            id={`block-editor-input-${index}`}
                            rows={4}
                            value={block.text || ""}
                            onChange={(e) =>
                              handleUpdateBlock(index, { text: e.target.value })
                            }
                            placeholder="Tulis paragraf materi..."
                            className="w-full p-3 rounded-lg text-xs sm:text-sm leading-relaxed bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 resize-y"
                          />
                        )}

                        {/* 3. LIST BLOCK (Ordered / Unordered) */}
                        {block.type === "list" && (
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">Gaya Daftar:</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateBlock(index, { style: "unordered" })
                                }
                                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                                  block.style !== "ordered"
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                    : "bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300"
                                }`}
                              >
                                • Bullet List
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateBlock(index, { style: "ordered" })
                                }
                                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                                  block.style === "ordered"
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                    : "bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300"
                                }`}
                              >
                                1. Numbered List
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              {(block.items || []).map((item, itemIdx) => (
                                <div key={itemIdx} className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-slate-400 w-5 text-right">
                                    {block.style === "ordered" ? `${itemIdx + 1}.` : "•"}
                                  </span>
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                      const nextItems = [...(block.items || [])];
                                      nextItems[itemIdx] = e.target.value;
                                      handleUpdateBlock(index, { items: nextItems });
                                    }}
                                    className="flex-1 h-8 px-2.5 rounded-lg text-xs sm:text-sm bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextItems = (block.items || []).filter(
                                        (_, i) => i !== itemIdx
                                      );
                                      handleUpdateBlock(index, {
                                        items: nextItems.length ? nextItems : [""],
                                      });
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateBlock(index, {
                                  items: [...(block.items || []), "Poin pembahasan baru"],
                                })
                              }
                              className="text-xs font-medium text-[#e3252f] hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah Poin Daftar</span>
                            </button>
                          </div>
                        )}

                        {/* 4. CALLOUT BLOCK */}
                        {block.type === "callout" && (
                          <div className="space-y-2.5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <select
                                value={block.variant || "info"}
                                onChange={(e) =>
                                  handleUpdateBlock(index, { variant: e.target.value })
                                }
                                className="h-9 px-2.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                              >
                                <option value="concept">Konsep Utama</option>
                                <option value="info">Informasi (Info)</option>
                                <option value="note">Catatan Penting</option>
                                <option value="tip">Tips Praktis</option>
                                <option value="warning">Peringatan Risiko</option>
                                <option value="summary">Ringkasan Kunci</option>
                              </select>
                              <input
                                type="text"
                                value={block.title || ""}
                                onChange={(e) =>
                                  handleUpdateBlock(index, { title: e.target.value })
                                }
                                placeholder="Judul Callout..."
                                className="sm:col-span-2 h-9 px-3 rounded-lg text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                              />
                            </div>
                            <textarea
                              rows={3}
                              value={block.text || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { text: e.target.value })
                              }
                              placeholder="Isi pesan callout / catatan penting..."
                              className="w-full p-2.5 rounded-lg text-xs sm:text-sm bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                          </div>
                        )}

                        {/* 5. FORMULA BLOCK */}
                        {block.type === "formula" && (
                          <div className="space-y-2.5">
                            <input
                              type="text"
                              value={block.title || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { title: e.target.value })
                              }
                              placeholder="Nama Rumus (contoh: Rumus Return on Equity)"
                              className="w-full h-8 px-3 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                            <input
                              type="text"
                              value={block.expression || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { expression: e.target.value })
                              }
                              placeholder="Ekspresi Rumus (contoh: ROE = (Laba Bersih / Ekuitas) × 100%)"
                              className="w-full h-10 px-3 rounded-lg text-sm font-mono font-semibold bg-slate-900 text-white border border-slate-700"
                            />
                            <textarea
                              rows={2}
                              value={block.explanation || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { explanation: e.target.value })
                              }
                              placeholder="Penjelasan variabel dan interpretasi rumus..."
                              className="w-full p-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                          </div>
                        )}

                        {/* 6. VISUAL TABLE EDITOR BLOCK */}
                        {block.type === "table" && (
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <input
                                type="text"
                                value={block.caption || ""}
                                onChange={(e) =>
                                  handleUpdateBlock(index, { caption: e.target.value })
                                }
                                placeholder="Judul / Caption Tabel..."
                                className="flex-1 h-8 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                              />
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const headers = [
                                      ...(block.headers || ["Kolom 1"]),
                                      `Kolom ${(block.headers?.length || 1) + 1}`,
                                    ];
                                    const rows = (block.rows || []).map((r) => [...r, "-"]);
                                    handleUpdateBlock(index, { headers, rows });
                                  }}
                                  className="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 cursor-pointer"
                                >
                                  + Kolom
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const colCount = (block.headers || []).length || 2;
                                    const rows = [
                                      ...(block.rows || []),
                                      Array.from({ length: colCount }, () => ""),
                                    ];
                                    handleUpdateBlock(index, { rows });
                                  }}
                                  className="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 cursor-pointer"
                                >
                                  + Baris
                                </button>
                              </div>
                            </div>

                            <div className="overflow-x-auto border border-slate-200 dark:border-[#272727] rounded-lg">
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-100 dark:bg-[#161616]">
                                    {(block.headers || []).map((h, colIdx) => (
                                      <th
                                        key={colIdx}
                                        className="p-1.5 border-b border-r border-slate-200 dark:border-[#262626]"
                                      >
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="text"
                                            value={h}
                                            onChange={(e) => {
                                              const nextHeaders = [...(block.headers || [])];
                                              nextHeaders[colIdx] = e.target.value;
                                              handleUpdateBlock(index, {
                                                headers: nextHeaders,
                                              });
                                            }}
                                            className="w-full px-1.5 py-1 rounded font-semibold bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#262626]"
                                          />
                                          {(block.headers || []).length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const nextHeaders = (
                                                  block.headers || []
                                                ).filter((_, c) => c !== colIdx);
                                                const nextRows = (block.rows || []).map((r) =>
                                                  r.filter((_, c) => c !== colIdx)
                                                );
                                                handleUpdateBlock(index, {
                                                  headers: nextHeaders,
                                                  rows: nextRows,
                                                });
                                              }}
                                              title="Hapus kolom"
                                              className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                      </th>
                                    ))}
                                    <th className="w-8" />
                                  </tr>
                                </thead>
                                <tbody>
                                  {(block.rows || []).map((row, rowIdx) => (
                                    <tr
                                      key={rowIdx}
                                      className="border-b border-slate-200/70 dark:border-[#222222]"
                                    >
                                      {row.map((cell, colIdx) => (
                                        <td
                                          key={colIdx}
                                          className="p-1.5 border-r border-slate-200/70 dark:border-[#222222]"
                                        >
                                          <input
                                            type="text"
                                            value={cell}
                                            onChange={(e) => {
                                              const nextRows = (block.rows || []).map(
                                                (r, rI) =>
                                                  rI === rowIdx
                                                    ? r.map((c, cI) =>
                                                        cI === colIdx ? e.target.value : c
                                                      )
                                                    : r
                                              );
                                              handleUpdateBlock(index, { rows: nextRows });
                                            }}
                                            className="w-full px-1.5 py-1 rounded bg-slate-50 dark:bg-[#0a0a0a] border border-transparent focus:border-slate-400"
                                          />
                                        </td>
                                      ))}
                                      <td className="p-1 text-center">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextRows = (block.rows || []).filter(
                                              (_, rI) => rI !== rowIdx
                                            );
                                            handleUpdateBlock(index, { rows: nextRows });
                                          }}
                                          title="Hapus baris"
                                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 7. IMAGE BLOCK (Upload File or URL + Size + Caption + Alt + Alignment) */}
                        {block.type === "image" && (
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={block.url || ""}
                                onChange={(e) =>
                                  handleUpdateBlock(index, { url: e.target.value })
                                }
                                placeholder="Tempel URL gambar (https://...) atau unggah file di samping"
                                className="flex-1 h-9 px-3 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                              />
                              <label className="h-9 px-3 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Unggah Gambar</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleImageFileUpload(index, e.target.files?.[0])
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {block.url && (
                              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#242424] text-center">
                                <img
                                  src={block.url}
                                  alt={block.alt || "Preview"}
                                  className="max-h-52 mx-auto rounded object-contain"
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <input
                                type="text"
                                value={block.caption || ""}
                                onChange={(e) =>
                                  handleUpdateBlock(index, { caption: e.target.value })
                                }
                                placeholder="Caption gambar..."
                                className="h-8 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                              />
                              <input
                                type="text"
                                value={block.alt || ""}
                                onChange={(e) =>
                                  handleUpdateBlock(index, { alt: e.target.value })
                                }
                                placeholder="Alt text aksesibilitas..."
                                className="h-8 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                              />
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={block.size || "large"}
                                  onChange={(e) =>
                                    handleUpdateBlock(index, { size: e.target.value })
                                  }
                                  className="flex-1 h-8 px-2 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                                >
                                  <option value="small">Kecil</option>
                                  <option value="medium">Sedang</option>
                                  <option value="large">Besar</option>
                                  <option value="full">Lebar Penuh</option>
                                </select>
                                <select
                                  value={block.align || "center"}
                                  onChange={(e) =>
                                    handleUpdateBlock(index, { align: e.target.value })
                                  }
                                  className="flex-1 h-8 px-2 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                                >
                                  <option value="left">Kiri</option>
                                  <option value="center">Tengah</option>
                                  <option value="right">Kanan</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 8. VIDEO EMBED BLOCK */}
                        {block.type === "video" && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={block.title || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { title: e.target.value })
                              }
                              placeholder="Judul Video Pembelajaran..."
                              className="w-full h-8 px-2.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                            <input
                              type="text"
                              value={block.url || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { url: e.target.value })
                              }
                              placeholder="URL YouTube / Video Embed (contoh: https://www.youtube.com/watch?v=...)"
                              className="w-full h-8 px-2.5 rounded-lg text-xs font-mono bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                            <input
                              type="text"
                              value={block.caption || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { caption: e.target.value })
                              }
                              placeholder="Catatan / keterangan video..."
                              className="w-full h-8 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                          </div>
                        )}

                        {/* 9. ATTACHMENT BLOCK */}
                        {block.type === "attachment" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={block.title || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { title: e.target.value })
                              }
                              placeholder="Nama Dokumen / Lampiran..."
                              className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                            <input
                              type="text"
                              value={block.url || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { url: e.target.value })
                              }
                              placeholder="URL Unduhan File..."
                              className="h-8 px-2.5 rounded-lg text-xs font-mono bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                            <input
                              type="text"
                              value={block.description || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { description: e.target.value })
                              }
                              placeholder="Deskripsi singkat file..."
                              className="sm:col-span-2 h-8 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                          </div>
                        )}

                        {/* 10. CODE BLOCK */}
                        {block.type === "code" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <select
                                value={block.language || "financial"}
                                onChange={(e) =>
                                  handleUpdateBlock(index, { language: e.target.value })
                                }
                                className="h-8 px-2.5 rounded-lg text-xs font-mono bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                              >
                                <option value="financial">Simulasi Finansial</option>
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="sql">SQL</option>
                                <option value="json">JSON</option>
                              </select>
                              <input
                                type="text"
                                value={block.caption || ""}
                                onChange={(e) =>
                                  handleUpdateBlock(index, { caption: e.target.value })
                                }
                                placeholder="Keterangan blok kode..."
                                className="flex-1 h-8 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                              />
                            </div>
                            <textarea
                              rows={4}
                              value={block.code || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { code: e.target.value })
                              }
                              placeholder="Tulis kode atau simulasi perhitungan..."
                              className="w-full p-3 rounded-lg text-xs font-mono bg-[#0d1117] text-slate-100 border border-slate-800 focus:outline-none"
                            />
                          </div>
                        )}

                        {/* 11. QUOTE BLOCK */}
                        {block.type === "quote" && (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={block.text || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { text: e.target.value })
                              }
                              placeholder="Tulis kutipan penting..."
                              className="w-full p-2.5 rounded-lg text-xs sm:text-sm italic bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={block.author || ""}
                                onChange={(e) =>
                                  handleUpdateBlock(index, { author: e.target.value })
                                }
                                placeholder="Tokoh / Sumber Kutipan..."
                                className="h-8 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                              />
                              <input
                                type="text"
                                value={block.role || ""}
                                onChange={(e) =>
                                  handleUpdateBlock(index, { role: e.target.value })
                                }
                                placeholder="Jabatan / Konteks..."
                                className="h-8 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                              />
                            </div>
                          </div>
                        )}

                        {/* 12. INTERACTIVE QUIZ BLOCK */}
                        {block.type === "interactive_quiz" && (
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-[#e3252f]">
                                Kuis Cek Pemahaman Inline
                              </span>
                              <select
                                value={block.questionType || "multiple_choice"}
                                onChange={(e) => {
                                  const qType = e.target.value;
                                  const nextPatch = { questionType: qType };
                                  if (qType === "true_false") {
                                    nextPatch.options = ["Benar", "Salah"];
                                    nextPatch.correctOptionIndex = 0;
                                  }
                                  handleUpdateBlock(index, nextPatch);
                                }}
                                className="h-8 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                              >
                                <option value="multiple_choice">Pilihan Ganda</option>
                                <option value="true_false">Benar / Salah</option>
                                <option value="short_answer">Isian Singkat</option>
                              </select>
                            </div>

                            <input
                              type="text"
                              value={block.question || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { question: e.target.value })
                              }
                              placeholder="Tulis pertanyaan evaluasi pemahaman..."
                              className="w-full h-9 px-3 rounded-lg text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />

                            {block.questionType === "short_answer" ? (
                              <input
                                type="text"
                                value={block.correctAnswerText || ""}
                                onChange={(e) =>
                                  handleUpdateBlock(index, {
                                    correctAnswerText: e.target.value,
                                  })
                                }
                                placeholder="Kunci Jawaban Singkat..."
                                className="w-full h-8 px-3 rounded-lg text-xs bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800"
                              />
                            ) : (
                              <div className="space-y-1.5">
                                {(block.options || []).map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      checked={
                                        Number(block.correctOptionIndex ?? 0) === optIdx
                                      }
                                      onChange={() =>
                                        handleUpdateBlock(index, {
                                          correctOptionIndex: optIdx,
                                        })
                                      }
                                      title="Tandai sebagai jawaban benar"
                                      className="accent-emerald-600 cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const nextOpts = [...(block.options || [])];
                                        nextOpts[optIdx] = e.target.value;
                                        handleUpdateBlock(index, { options: nextOpts });
                                      }}
                                      className="flex-1 h-8 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            <textarea
                              rows={2}
                              value={block.explanation || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { explanation: e.target.value })
                              }
                              placeholder="Penjelasan jawaban benar (ditampilkan setelah pengguna menjawab)..."
                              className="w-full p-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                          </div>
                        )}

                        {/* 13. STEPS BLOCK */}
                        {block.type === "steps" && (
                          <div className="space-y-2.5">
                            <input
                              type="text"
                              value={block.title || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { title: e.target.value })
                              }
                              placeholder="Judul Rangkaian Langkah..."
                              className="w-full h-8 px-2.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                            {(block.steps || []).map((st, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#242424] space-y-1.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-mono font-semibold text-[#e3252f]">
                                    Langkah #{sIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = (block.steps || []).filter(
                                        (_, i) => i !== sIdx
                                      );
                                      handleUpdateBlock(index, { steps: next });
                                    }}
                                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  value={st.title || ""}
                                  onChange={(e) => {
                                    const next = [...(block.steps || [])];
                                    next[sIdx] = { ...next[sIdx], title: e.target.value };
                                    handleUpdateBlock(index, { steps: next });
                                  }}
                                  placeholder="Judul langkah..."
                                  className="w-full h-8 px-2.5 rounded text-xs font-semibold bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727]"
                                />
                                <textarea
                                  rows={2}
                                  value={st.description || ""}
                                  onChange={(e) => {
                                    const next = [...(block.steps || [])];
                                    next[sIdx] = {
                                      ...next[sIdx],
                                      description: e.target.value,
                                    };
                                    handleUpdateBlock(index, { steps: next });
                                  }}
                                  placeholder="Penjelasan langkah..."
                                  className="w-full p-2 rounded text-xs bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727]"
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateBlock(index, {
                                  steps: [
                                    ...(block.steps || []),
                                    { title: "Langkah Berikutnya", description: "" },
                                  ],
                                })
                              }
                              className="text-xs font-medium text-[#e3252f] hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah Langkah</span>
                            </button>
                          </div>
                        )}

                        {/* 14. ACCORDION BLOCK */}
                        {block.type === "accordion" && (
                          <div className="space-y-2.5">
                            <input
                              type="text"
                              value={block.title || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { title: e.target.value })
                              }
                              placeholder="Judul Bagian Accordion..."
                              className="w-full h-8 px-2.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                            {(block.items || []).map((acc, aIdx) => (
                              <div
                                key={aIdx}
                                className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#242424] space-y-1.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <input
                                    type="text"
                                    value={acc.title || ""}
                                    onChange={(e) => {
                                      const next = [...(block.items || [])];
                                      next[aIdx] = { ...next[aIdx], title: e.target.value };
                                      handleUpdateBlock(index, { items: next });
                                    }}
                                    placeholder="Judul item buka-tutup..."
                                    className="flex-1 h-8 px-2.5 rounded text-xs font-semibold bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = (block.items || []).filter(
                                        (_, i) => i !== aIdx
                                      );
                                      handleUpdateBlock(index, { items: next });
                                    }}
                                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <textarea
                                  rows={2}
                                  value={acc.content || ""}
                                  onChange={(e) => {
                                    const next = [...(block.items || [])];
                                    next[aIdx] = { ...next[aIdx], content: e.target.value };
                                    handleUpdateBlock(index, { items: next });
                                  }}
                                  placeholder="Isi penjelasan saat dibuka..."
                                  className="w-full p-2 rounded text-xs bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727]"
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateBlock(index, {
                                  items: [
                                    ...(block.items || []),
                                    { title: "Pertanyaan / Topik Baru", content: "" },
                                  ],
                                })
                              }
                              className="text-xs font-medium text-[#e3252f] hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah Item Accordion</span>
                            </button>
                          </div>
                        )}

                        {/* 15. RELATED CONTENT BLOCK */}
                        {block.type === "related" && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={block.title || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { title: e.target.value })
                              }
                              placeholder="Judul Bagian Tautan Terkait..."
                              className="w-full h-8 px-2.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                            />
                            {(block.items || []).map((rel, rIdx) => (
                              <div
                                key={rIdx}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#242424]"
                              >
                                <input
                                  type="text"
                                  value={rel.title || ""}
                                  onChange={(e) => {
                                    const next = [...(block.items || [])];
                                    next[rIdx] = { ...next[rIdx], title: e.target.value };
                                    handleUpdateBlock(index, { items: next });
                                  }}
                                  placeholder="Judul referensi..."
                                  className="h-7 px-2 rounded text-xs bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727]"
                                />
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={rel.url || ""}
                                    onChange={(e) => {
                                      const next = [...(block.items || [])];
                                      next[rIdx] = { ...next[rIdx], url: e.target.value };
                                      handleUpdateBlock(index, { items: next });
                                    }}
                                    placeholder="https://..."
                                    className="flex-1 h-7 px-2 rounded text-xs font-mono bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = (block.items || []).filter(
                                        (_, i) => i !== rIdx
                                      );
                                      handleUpdateBlock(index, { items: next });
                                    }}
                                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateBlock(index, {
                                  items: [
                                    ...(block.items || []),
                                    { title: "Referensi Baru", url: "https://www.idx.co.id" },
                                  ],
                                })
                              }
                              className="text-xs font-medium text-[#e3252f] hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah Tautan Terkait</span>
                            </button>
                          </div>
                        )}

                        {/* 16. DIVIDER BLOCK */}
                        {block.type === "divider" && (
                          <div className="py-2 flex items-center gap-3">
                            <hr className="flex-1 border-slate-200 dark:border-[#2a2a2a]" />
                            <span className="text-[10px] font-mono uppercase text-slate-400">
                              Garis Pemisah Bagian
                            </span>
                            <hr className="flex-1 border-slate-200 dark:border-[#2a2a2a]" />
                          </div>
                        )}
                      </div>

                      {/* Insert Block Below Trigger */}
                      <div className="px-4 py-1.5 border-t border-slate-100 dark:border-[#1a1a1a] flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            setShowAddBlockMenuAt(
                              showAddBlockMenuAt === index ? null : index
                            )
                          }
                          className="text-[11px] font-medium text-slate-400 hover:text-[#e3252f] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Sisipkan Blok di Bawah</span>
                        </button>
                      </div>

                      {showAddBlockMenuAt === index && (
                        <div className="p-3 border-t border-slate-200 dark:border-[#242424] bg-slate-50 dark:bg-[#0c0c0c] space-y-2">
                          <div className="text-[11px] font-semibold text-slate-500">
                            Pilih Jenis Blok Konten:
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {BLOCK_CATALOG.flatMap((g) => g.items).map((item) => {
                              const BlockIcon = item.icon;
                              return (
                                <button
                                  key={item.type}
                                  type="button"
                                  onClick={() => handleAddBlock(item.type, index)}
                                  className="p-2 rounded-lg text-left text-xs bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] hover:border-[#e3252f] flex items-center gap-2 cursor-pointer"
                                >
                                  <BlockIcon className="w-3.5 h-3.5 text-[#e3252f] shrink-0" />
                                  <span className="truncate">{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Block Adder Palette */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#101010] border border-dashed border-slate-300 dark:border-[#2a2a2a] space-y-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#e3252f]" />
                  <span>Tambahkan Blok Pembelajaran Baru</span>
                </div>
                <div className="space-y-2.5">
                  {BLOCK_CATALOG.map((group) => (
                    <div key={group.group} className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {group.group}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.type}
                              type="button"
                              onClick={() => handleAddBlock(item.type, "end")}
                              className="px-2.5 py-2 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#151515] hover:bg-slate-100 dark:hover:bg-[#1e1e1e] border border-slate-200/80 dark:border-[#262626] text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Icon className="w-3.5 h-3.5 text-[#e3252f] shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ==================================================================
            AREA 3: CONTENT PROPERTIES, REVISION HISTORY & AI METADATA (3 Cols)
            ================================================================== */}
        <aside className="lg:col-span-3 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] overflow-hidden">
          {/* Right Panel Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-200 dark:border-[#242424] bg-slate-50/70 dark:bg-[#141414] text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setRightPanelTab("properties")}
              className={`py-2.5 px-2 text-center border-b-2 transition-colors cursor-pointer ${
                rightPanelTab === "properties"
                  ? "border-[#e3252f] text-slate-900 dark:text-white font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Properti
            </button>
            <button
              type="button"
              onClick={() => setRightPanelTab("ai_readiness")}
              className={`py-2.5 px-2 text-center border-b-2 transition-colors cursor-pointer ${
                rightPanelTab === "ai_readiness"
                  ? "border-[#e3252f] text-slate-900 dark:text-white font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Metadata AI
            </button>
            <button
              type="button"
              onClick={() => setRightPanelTab("revisions")}
              className={`py-2.5 px-2 text-center border-b-2 transition-colors cursor-pointer ${
                rightPanelTab === "revisions"
                  ? "border-[#e3252f] text-slate-900 dark:text-white font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Riwayat ({revisions.length})
            </button>
          </div>

          {/* TAB 1: PROPERTI MATERI */}
          {rightPanelTab === "properties" && (
            <div className="p-4 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Status Publikasi
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    markDirty();
                  }}
                  className="w-full h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] font-medium"
                >
                  <option value="PUBLISHED">Published (Tampil ke Pengguna & AI)</option>
                  <option value="DRAFT">Draft (Belum Dipublikasikan)</option>
                  <option value="ARCHIVED">Archived (Diarsipkan)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Modul Induk
                </label>
                <select
                  value={moduleId}
                  onChange={(e) => {
                    setModuleId(e.target.value);
                    markDirty();
                  }}
                  className="w-full h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                >
                  {allModulesFlat.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{LEVEL_META[m.level]?.label || m.level}] {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Jenjang Kesulitan
                  </label>
                  <select
                    value={level}
                    onChange={(e) => {
                      setLevel(e.target.value);
                      markDirty();
                    }}
                    className="w-full h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                  >
                    <option value="BEGINNER">Pemula</option>
                    <option value="INTERMEDIATE">Menengah</option>
                    <option value="ADVANCED">Mahir</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Estimasi Baca (Menit)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={estimatedMinutes}
                    onChange={(e) => {
                      setEstimatedMinutes(e.target.value);
                      markDirty();
                    }}
                    className="w-full h-9 px-2.5 rounded-lg font-mono bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Slug URL Materi
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(slugifyTitle(e.target.value));
                    markDirty();
                  }}
                  className="w-full h-8 px-2.5 rounded-lg font-mono text-[11px] bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                />
              </div>

              {/* Learning Objectives */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#222222]">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tujuan Pembelajaran
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLearningObjectives((prev) => [...prev, ""]);
                      markDirty();
                    }}
                    className="text-[11px] text-[#e3252f] font-medium hover:underline cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-1.5">
                  {learningObjectives.map((obj, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => {
                          const next = [...learningObjectives];
                          next[idx] = e.target.value;
                          setLearningObjectives(next);
                          markDirty();
                        }}
                        placeholder="Tujuan belajar..."
                        className="flex-1 h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLearningObjectives((prev) =>
                            prev.filter((_, i) => i !== idx)
                          );
                          markDirty();
                        }}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions for Active Module Quizzes */}
              {activeModuleMeta && onOpenModuleQuizzes && (
                <div className="pt-3 border-t border-slate-200 dark:border-[#222222]">
                  <button
                    type="button"
                    onClick={() => onOpenModuleQuizzes(activeModuleMeta)}
                    className="w-full h-9 px-3 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileQuestion className="w-3.5 h-3.5" />
                    <span>Kelola Bank Soal Modul Ini</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: METADATA AI & RAG CHUNKS */}
          {rightPanelTab === "ai_readiness" && (
            <div className="p-4 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#242424] space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e3252f]" />
                  <span>AI-Ready Content Architecture</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Konten blok otomatis diekstrak menjadi teks terstruktur dan dipecah per subjudul (semantic chunking) untuk AI Investment Tutor.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Kata Kunci (Keywords — pisahkan koma)
                </label>
                <input
                  type="text"
                  value={keywordsText}
                  onChange={(e) => {
                    setKeywordsText(e.target.value);
                    markDirty();
                  }}
                  placeholder="saham, bei, roe, valuasi, lot"
                  className="w-full h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Tag Topik (pisahkan koma)
                </label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => {
                    setTagsText(e.target.value);
                    markDirty();
                  }}
                  placeholder="fundamental, risiko, pasar-modal"
                  className="w-full h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                />
              </div>

              {/* References */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#222222]">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Referensi Resmi Materi
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setReferences((prev) => [
                        ...prev,
                        { title: "Bursa Efek Indonesia (IDX)", url: "https://www.idx.co.id" },
                      ]);
                      markDirty();
                    }}
                    className="text-[11px] text-[#e3252f] font-medium hover:underline cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {references.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#242424] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <input
                          type="text"
                          value={ref.title || ""}
                          onChange={(e) => {
                            const next = [...references];
                            next[idx] = { ...next[idx], title: e.target.value };
                            setReferences(next);
                            markDirty();
                          }}
                          placeholder="Judul sumber referensi..."
                          className="flex-1 h-7 px-2 rounded bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setReferences((prev) => prev.filter((_, i) => i !== idx));
                            markDirty();
                          }}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={ref.url || ""}
                        onChange={(e) => {
                          const next = [...references];
                          next[idx] = { ...next[idx], url: e.target.value };
                          setReferences(next);
                          markDirty();
                        }}
                        placeholder="https://..."
                        className="w-full h-7 px-2 rounded font-mono text-[11px] bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#272727]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Chunks */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-[#222222]">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Segmen Pengetahuan LLM ({(lessonDetail?.contentChunks || []).length} chunk)
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {(lessonDetail?.contentChunks || []).map((chunk, cIdx) => (
                    <div
                      key={chunk.chunkId || chunk.chunk_id || cIdx}
                      className="p-2 rounded bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#242424] text-[11px]"
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        #{cIdx + 1} {chunk.heading || chunk.section_title || "Bagian Materi"}
                      </div>
                      <div className="text-slate-400 font-mono text-[10px]">
                        ~{chunk.tokenEstimate || Math.ceil(String(chunk.content || "").length / 4) || 50} token
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RIWAYAT VERSI (REVISION HISTORY) */}
          {rightPanelTab === "revisions" && (
            <div className="p-4 space-y-3 text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                Setiap perubahan struktur materi dicatat otomatis agar Admin dapat meninjau atau memulihkan versi sebelumnya.
              </div>

              {revisions.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  Belum ada riwayat revisi tercatat.
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {revisions.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#242424] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">
                          Versi {rev.version}
                        </span>
                        <StatusPill status={rev.status} />
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {rev.changeSummary || "Pembaruan materi"}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">
                          {rev.createdAt
                            ? new Date(rev.createdAt).toLocaleString("id-ID")
                            : ""}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRestoreRevision(rev.id)}
                          className="px-2 py-1 rounded text-[11px] font-medium bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#282828] hover:border-[#e3252f] text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Pulihkan</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* ====================================================================
          MODAL TAMBAH COURSE / MODUL / MATERI BARU
          ==================================================================== */}
      {createDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleConfirmCreateDialog}
            className="w-full max-w-md rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {createDialog.type === "course"
                  ? "Tambah Course / Kelas Baru"
                  : createDialog.type === "module"
                  ? "Tambah Modul Kurikulum Baru"
                  : "Tambah Materi Pembelajaran (Lesson)"}
              </h3>
              <button
                type="button"
                onClick={() => setCreateDialog(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createDialog.type !== "course" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                  Label Submodul
                </label>
                <input
                  type="text"
                  value={createFormSubmodule}
                  onChange={(e) => setCreateFormSubmodule(e.target.value)}
                  placeholder="Submodul 1: Konsep Dasar"
                  className="w-full h-9 px-3 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                Judul *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={createFormTitle}
                onChange={(e) => setCreateFormTitle(e.target.value)}
                placeholder="Masukkan judul..."
                className="w-full h-9 px-3 rounded-lg text-xs sm:text-sm bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                Jenjang Kemampuan
              </label>
              <select
                value={createFormLevel}
                onChange={(e) => setCreateFormLevel(e.target.value)}
                className="w-full h-9 px-3 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
              >
                <option value="BEGINNER">Pemula</option>
                <option value="INTERMEDIATE">Menengah</option>
                <option value="ADVANCED">Mahir</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                Ringkasan Singkat
              </label>
              <textarea
                rows={3}
                value={createFormSummary}
                onChange={(e) => setCreateFormSummary(e.target.value)}
                placeholder="Deskripsi singkat materi..."
                className="w-full p-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialog(null)}
                className="h-9 px-3.5 text-xs rounded-lg cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingCreate}
                className="h-9 px-4 text-xs font-semibold rounded-lg bg-[#e3252f] hover:bg-[#c91f28] text-white cursor-pointer"
              >
                {isSubmittingCreate ? "Menyimpan..." : "Buat Sekarang"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================================
          MODAL KONFIRMASI HAPUS ITEM
          ==================================================================== */}
      {deleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Konfirmasi Penghapusan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Apakah Anda yakin ingin menghapus{" "}
              <strong className="text-slate-900 dark:text-white">
                &ldquo;{deleteConfirm.title}&rdquo;
              </strong>
              ? Tindakan ini bersifat permanen.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="h-9 px-3.5 text-xs rounded-lg cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={isDeletingItem}
                onClick={handleConfirmDelete}
                className="h-9 px-4 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
              >
                {isDeletingItem ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
