import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bold,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileQuestion,
  Image as ImageIcon,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Paperclip,
  Plus,
  Quote,
  RefreshCw,
  Search,
  Sparkles,
  Table as TableIcon,
  Trash2,
  Underline,
  Upload,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "../../services/apiClient";
import StructuredLessonRenderer from "../learning/StructuredLessonRenderer";
import { LEVEL_META, LevelBadge, slugifyTitle } from "./adminConstants";

function createEmptyBlock(type) {
  const id = `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  switch (type) {
    case "heading":
      return {
        id,
        type: "heading",
        level: 2,
        text: "Subjudul Pembahasan",
        content: "Subjudul Pembahasan",
        align: "left",
      };
    case "paragraph":
      return {
        id,
        type: "paragraph",
        text: "",
        content: "",
        align: "left",
      };
    case "list":
      return {
        id,
        type: "list",
        style: "unordered",
        ordered: false,
        items: ["Poin pembahasan pertama", "Poin pembahasan kedua"],
      };
    case "callout":
      return {
        id,
        type: "callout",
        variant: "concept",
        title: "Catatan Penting",
        text: "Tuliskan catatan atau konsep kunci pada bagian ini.",
        content: "Tuliskan catatan atau konsep kunci pada bagian ini.",
      };
    case "formula":
      return {
        id,
        type: "formula",
        title: "Rumus Perhitungan",
        expression: "ROE = (Laba Bersih / Total Ekuitas) × 100%",
        explanation: "Penjelasan variabel dan interpretasi rumus.",
      };
    case "table":
      return {
        id,
        type: "table",
        caption: "Tabel Perbandingan",
        hasHeader: true,
        headers: ["Indikator", "Definisi", "Acuan Ideal"],
        rows: [
          ["ROE", "Return on Equity", "> 15%"],
          ["DER", "Debt to Equity Ratio", "< 1.0x"],
        ],
      };
    case "image":
      return {
        id,
        type: "image",
        url: "",
        alt: "Ilustrasi materi pembelajaran",
        caption: "",
        size: "large",
        align: "center",
      };
    case "video":
      return {
        id,
        type: "video",
        url: "",
        title: "Video Pembelajaran",
        caption: "",
      };
    case "attachment":
      return {
        id,
        type: "attachment",
        title: "Dokumen Lampiran",
        fileName: "Dokumen Lampiran",
        url: "https://www.idx.co.id",
        description: "Materi pendukung pembelajaran.",
      };
    case "code":
      return {
        id,
        type: "code",
        language: "financial",
        caption: "Simulasi Perhitungan",
        code: "1 Lot = 100 Lembar\nModal = Harga Saham × 100",
      };
    case "quote":
      return {
        id,
        type: "quote",
        text: "Price is what you pay. Value is what you get.",
        content: "Price is what you pay. Value is what you get.",
        author: "Warren Buffett",
        role: "",
      };
    case "interactive_quiz":
      return {
        id,
        type: "interactive_quiz",
        questionType: "multiple_choice",
        question: "Pertanyaan evaluasi singkat untuk menguji pemahaman:",
        options: [
          "Pilihan jawaban A",
          "Pilihan jawaban B",
          "Pilihan jawaban C",
          "Pilihan jawaban D",
        ],
        correctOptionIndex: 0,
        explanation: "Penjelasan singkat mengapa jawaban tersebut benar.",
      };
    case "accordion":
      return {
        id,
        type: "accordion",
        title: "Penjelasan Tambahan",
        items: [
          {
            title: "Pertanyaan atau Topik Detail",
            content: "Penjelasan lengkap ketika bagian ini dibuka oleh peserta.",
          },
        ],
      };
    case "steps":
      return {
        id,
        type: "steps",
        title: "Langkah-Langkah",
        steps: [
          {
            title: "Langkah Pertama",
            description: "Penjelasan langkah pertama secara ringkas.",
          },
          {
            title: "Langkah Kedua",
            description: "Penjelasan langkah kedua secara ringkas.",
          },
        ],
      };
    case "divider":
    default:
      return { id, type: "divider" };
  }
}

function ReferenceStatusPill({ status }) {
  const isPublished = String(status || "").toUpperCase() === "PUBLISHED";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isPublished
          ? "bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300"
          : "bg-amber-100/90 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPublished ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

export default function LearningContentStudio({
  initialLessonId = null,
  onClearInitialLessonId,
  onOpenModuleQuizzes,
  onModulesChanged,
  onNotify,
  onBreadcrumbChange,
  onUnsavedStateChange,
}) {
  const [viewMode, setViewMode] = useState(initialLessonId ? "editor" : "library"); // "library" | "editor" | "preview"
  const [courses, setCourses] = useState([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);

  // Library Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Active Lesson in Editor
  const [selectedLessonId, setSelectedLessonId] = useState(initialLessonId);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  // Form Fields (matching "← Edit Halaman" in reference image)
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
  const [references, setReferences] = useState([]);
  const [contentBlocks, setContentBlocks] = useState([]);

  // Single Toolbar State
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [showMoreToolbarMenu, setShowMoreToolbarMenu] = useState(false);
  const [showExtraMetadata, setShowExtraMetadata] = useState(false);
  const [saveState, setSaveState] = useState("saved"); // "saved" | "unsaved" | "saving" | "failed"
  const autosaveTimerRef = useRef(null);
  const isHydratingRef = useRef(false);
  const coverImageInputRef = useRef(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newLevel, setNewLevel] = useState("BEGINNER");
  const [newModuleId, setNewModuleId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const notify = useCallback(
    (msg, type = "success") => {
      if (onNotify) onNotify(msg, type);
    },
    [onNotify]
  );

  useEffect(() => {
    if (!onBreadcrumbChange) return;
    if (viewMode === "library") {
      onBreadcrumbChange("Konten / Materi Pembelajaran");
    } else if (viewMode === "preview") {
      onBreadcrumbChange("Konten / Pratinjau Materi");
    } else {
      onBreadcrumbChange("Konten / Edit Materi");
    }
  }, [viewMode, onBreadcrumbChange]);

  useEffect(() => {
    if (onUnsavedStateChange) {
      onUnsavedStateChange(viewMode === "editor" && saveState === "unsaved");
    }
  }, [viewMode, saveState, onUnsavedStateChange]);

  const loadLibrary = useCallback(async () => {
    try {
      setIsLoadingLibrary(true);
      const res = await adminApi.getCmsTree();
      setCourses(res?.data?.courses || []);
    } catch (err) {
      notify(err.message || "Gagal memuat daftar materi.", "error");
    } finally {
      setIsLoadingLibrary(false);
    }
  }, [notify]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const allModulesFlat = useMemo(() => {
    const list = [];
    for (const c of courses) {
      for (const m of c.modules || []) {
        list.push({
          ...m,
          courseId: c.id,
          courseTitle: c.title,
          courseLevel: c.learningLevel || m.level || "BEGINNER",
        });
      }
    }
    return list;
  }, [courses]);

  const allLessonsFlat = useMemo(() => {
    const list = [];
    for (const c of courses) {
      for (const m of c.modules || []) {
        for (const l of m.lessons || []) {
          // Find first image block if any for thumbnail preview
          const rawBlocks = Array.isArray(l.contentBlocks?.blocks)
            ? l.contentBlocks.blocks
            : Array.isArray(l.contentBlocks)
              ? l.contentBlocks
              : [];
          const firstImage = rawBlocks.find((b) => b.type === "image" && b.url)?.url || null;

          list.push({
            ...l,
            moduleId: m.id,
            moduleTitle: m.title,
            moduleQuizCount: m.quizCount ?? 0,
            courseId: c.id,
            courseTitle: c.title,
            level: l.difficultyLevel || m.level || c.learningLevel || "BEGINNER",
            thumbnailUrl: firstImage,
          });
        }
      }
    }
    return list;
  }, [courses]);

  const filteredLessons = useMemo(() => {
    return allLessonsFlat.filter((item) => {
      if (levelFilter !== "ALL" && item.level !== levelFilter) return false;
      const isPub = String(item.status || "").toUpperCase() === "PUBLISHED";
      if (statusFilter === "PUBLISHED" && !isPub) return false;
      if (statusFilter === "DRAFT" && isPub) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchModule = item.moduleTitle?.toLowerCase().includes(q);
        if (!matchTitle && !matchModule) return false;
      }
      return true;
    });
  }, [allLessonsFlat, levelFilter, statusFilter, searchQuery]);

  useEffect(() => {
    if (initialLessonId) {
      setSelectedLessonId(initialLessonId);
      setViewMode("editor");
      if (onClearInitialLessonId) onClearInitialLessonId();
    }
  }, [initialLessonId, onClearInitialLessonId]);

  const loadLessonDetail = useCallback(
    async (lessonId) => {
      if (!lessonId) return;
      try {
        setIsLoadingLesson(true);
        isHydratingRef.current = true;
        const res = await adminApi.getLessonDetail(lessonId);
        const lesson = res?.data?.lesson;
        if (!lesson) return;

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
        setReferences(Array.isArray(lesson.references) ? lesson.references : []);

        const rawBlocks = Array.isArray(lesson.contentBlocks?.blocks)
          ? lesson.contentBlocks.blocks
          : Array.isArray(lesson.contentBlocks)
            ? lesson.contentBlocks
            : [];
        const hydratedBlocks =
          rawBlocks.length > 0
            ? rawBlocks.map((b) => ({
                ...b,
                text: b.text ?? b.content ?? "",
                content: b.content ?? b.text ?? "",
                align: b.align ?? b.alignment ?? "left",
                style: b.style ?? (b.ordered ? "ordered" : "unordered"),
                options: Array.isArray(b.options)
                  ? b.options.map((opt) => (typeof opt === "string" ? opt : opt?.text || ""))
                  : b.options,
              }))
            : [createEmptyBlock("paragraph")];

        setContentBlocks(hydratedBlocks);
        setActiveBlockIndex(0);
        setSaveState("saved");
      } catch (err) {
        notify(err.message || "Gagal memuat detail materi.", "error");
      } finally {
        setIsLoadingLesson(false);
        setTimeout(() => {
          isHydratingRef.current = false;
        }, 120);
      }
    },
    [notify]
  );

  useEffect(() => {
    if (selectedLessonId && (viewMode === "editor" || viewMode === "preview")) {
      loadLessonDetail(selectedLessonId);
    }
  }, [selectedLessonId, viewMode, loadLessonDetail]);

  const buildLessonPayload = useCallback(
    (overrideStatus = null) => {
      const targetStatus = overrideStatus || status;
      const keywords = keywordsText
        .split(",")
        .map((k) => k.trim())
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
        tags: keywords,
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
        changeSummary: "Pembaruan materi pembelajaran",
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
      references,
      contentBlocks,
    ]
  );

  const handleSaveLesson = useCallback(
    async ({ overrideStatus = null, isAuto = false } = {}) => {
      if (!selectedLessonId) return;
      try {
        setSaveState("saving");
        const payload = buildLessonPayload(overrideStatus);
        const res = await adminApi.updateLesson(selectedLessonId, {
          ...payload,
          isAutosave: isAuto,
        });
        const updated = res?.data?.lesson;
        if (updated && overrideStatus) {
          setStatus(updated.status);
        }
        setSaveState("saved");
        if (!isAuto) {
          notify(`Perubahan materi "${payload.title}" berhasil disimpan.`);
          await loadLibrary();
          if (onModulesChanged) onModulesChanged();
        }
      } catch (err) {
        setSaveState("failed");
        if (!isAuto) {
          notify(err.message || "Gagal menyimpan perubahan.", "error");
        }
      }
    },
    [selectedLessonId, buildLessonPayload, notify, loadLibrary, onModulesChanged]
  );

  const markDirty = useCallback(() => {
    if (isHydratingRef.current || !selectedLessonId) return;
    setSaveState("unsaved");
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      handleSaveLesson({ isAuto: true });
    }, 3200);
  }, [selectedLessonId, handleSaveLesson]);

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  // ==========================================================================
  // SINGLE TOOLBAR & BLOCK OPERATIONS
  // ==========================================================================
  const safeActiveIndex =
    activeBlockIndex !== null &&
    activeBlockIndex >= 0 &&
    activeBlockIndex < contentBlocks.length
      ? activeBlockIndex
      : Math.max(0, contentBlocks.length - 1);

  const activeBlock = contentBlocks[safeActiveIndex] || null;

  const handleUpdateBlock = (index, patch) => {
    setContentBlocks((prev) =>
      prev.map((blk, idx) => {
        if (idx !== index) return blk;
        const updated = { ...blk, ...patch };
        if (patch.text !== undefined) updated.content = patch.text;
        if (patch.content !== undefined && patch.text === undefined)
          updated.text = patch.content;
        return updated;
      })
    );
    markDirty();
  };

  const handleChangeActiveBlockType = (newTypeValue) => {
    if (!activeBlock) return;
    if (newTypeValue.startsWith("heading-")) {
      const hLevel = Number(newTypeValue.split("-")[1]) || 2;
      handleUpdateBlock(safeActiveIndex, {
        type: "heading",
        level: hLevel,
        text: activeBlock.text || activeBlock.content || "Subjudul Bagian",
      });
    } else if (newTypeValue === "paragraph") {
      handleUpdateBlock(safeActiveIndex, {
        type: "paragraph",
        text: activeBlock.text || activeBlock.content || "",
      });
    } else if (newTypeValue === "callout") {
      handleUpdateBlock(safeActiveIndex, {
        type: "callout",
        variant: activeBlock.variant || "concept",
        title: activeBlock.title || "Catatan Penting",
        text: activeBlock.text || activeBlock.content || "",
      });
    } else if (newTypeValue === "quote") {
      handleUpdateBlock(safeActiveIndex, {
        type: "quote",
        text: activeBlock.text || activeBlock.content || "",
        author: activeBlock.author || "",
      });
    } else if (newTypeValue === "formula") {
      handleUpdateBlock(safeActiveIndex, {
        type: "formula",
        title: activeBlock.title || "Rumus Perhitungan",
        expression:
          activeBlock.expression || activeBlock.text || "ROE = Laba Bersih / Ekuitas",
        explanation: activeBlock.explanation || "",
      });
    }
  };

  const handleInsertBlockAfterActive = (type, extraPatch = {}) => {
    const newBlock = { ...createEmptyBlock(type), ...extraPatch };
    const insertAt =
      contentBlocks.length === 0 ? 0 : Math.min(contentBlocks.length, safeActiveIndex + 1);
    setContentBlocks((prev) => {
      const next = [...prev];
      next.splice(insertAt, 0, newBlock);
      return next;
    });
    setActiveBlockIndex(insertAt);
    setShowMoreToolbarMenu(false);
    markDirty();
  };

  const applyInlineFormat = (wrapperLeft, wrapperRight = wrapperLeft) => {
    if (!activeBlock) return;
    const inputEl = document.getElementById(`studio-block-input-${safeActiveIndex}`);
    const currentText = String(activeBlock.text ?? activeBlock.content ?? "");

    if (!inputEl || typeof inputEl.selectionStart !== "number") {
      handleUpdateBlock(safeActiveIndex, {
        text: `${currentText} ${wrapperLeft}teks${wrapperRight}`.trim(),
      });
      return;
    }

    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    const selected = currentText.slice(start, end) || "teks";
    const nextText =
      currentText.slice(0, start) +
      wrapperLeft +
      selected +
      wrapperRight +
      currentText.slice(end);

    handleUpdateBlock(safeActiveIndex, { text: nextText });
    setTimeout(() => {
      inputEl.focus();
      const cursor = start + wrapperLeft.length + selected.length + wrapperRight.length;
      inputEl.setSelectionRange(cursor, cursor);
    }, 20);
  };

  const handleConfirmInsertLink = (e) => {
    e.preventDefault();
    const label = linkLabel.trim() || "Tautan Referensi";
    const url = linkUrl.trim() || "https://www.idx.co.id";
    if (
      !activeBlock ||
      !["paragraph", "heading", "callout", "quote"].includes(activeBlock.type)
    ) {
      handleInsertBlockAfterActive("paragraph", {
        text: `[${label}](${url})`,
        content: `[${label}](${url})`,
      });
    } else {
      const inputEl = document.getElementById(`studio-block-input-${safeActiveIndex}`);
      const currentText = String(activeBlock.text ?? activeBlock.content ?? "");
      if (inputEl && typeof inputEl.selectionStart === "number") {
        const start = inputEl.selectionStart;
        const end = inputEl.selectionEnd;
        const nextText =
          currentText.slice(0, start) + `[${label}](${url})` + currentText.slice(end);
        handleUpdateBlock(safeActiveIndex, { text: nextText });
      } else {
        handleUpdateBlock(safeActiveIndex, {
          text: `${currentText} [${label}](${url})`.trim(),
        });
      }
    }
    setLinkModalOpen(false);
    setLinkLabel("");
    setLinkUrl("https://");
  };

  // Cover Image ("Gambar Utama" card on the right column, matching reference image!)
  const primaryImageIndex = useMemo(() => {
    return contentBlocks.findIndex((b) => b.type === "image");
  }, [contentBlocks]);

  const primaryImageBlock =
    primaryImageIndex >= 0 ? contentBlocks[primaryImageIndex] : null;

  const handleCoverImageUpload = (file) => {
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      notify("Ukuran gambar maksimal 2.5 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const altText = file.name.replace(/\.[^.]+$/, "");
      if (primaryImageIndex >= 0) {
        handleUpdateBlock(primaryImageIndex, { url: dataUrl, alt: altText });
      } else {
        handleInsertBlockAfterActive("image", {
          url: dataUrl,
          alt: altText,
          caption: altText,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCoverImage = () => {
    if (primaryImageIndex >= 0) {
      setContentBlocks((prev) => prev.filter((_, idx) => idx !== primaryImageIndex));
      markDirty();
    }
  };

  const handleImageBlockFileUpload = (index, file) => {
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

  const handleMoveBlock = (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= contentBlocks.length) return;
    setContentBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setActiveBlockIndex(targetIndex);
    markDirty();
  };

  const handleDeleteBlock = (index) => {
    if (contentBlocks.length <= 1) {
      handleUpdateBlock(0, { type: "paragraph", text: "", content: "" });
      return;
    }
    setContentBlocks((prev) => prev.filter((_, idx) => idx !== index));
    setActiveBlockIndex(Math.max(0, index - 1));
    markDirty();
  };

  // Library Create / Duplicate / Delete
  const handleOpenCreateModal = () => {
    setNewTitle("");
    setNewSummary("");
    const firstMod = allModulesFlat[0];
    setNewLevel(firstMod?.level || "BEGINNER");
    setNewModuleId(firstMod?.id || "");
    setCreateModalOpen(true);
  };

  const handleConfirmCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      setIsCreating(true);
      const targetMod =
        allModulesFlat.find((m) => m.id === newModuleId) || allModulesFlat[0];
      const res = await adminApi.createLesson({
        courseId: targetMod?.courseId || courses[0]?.id,
        moduleId: targetMod?.id || undefined,
        submoduleTitle: targetMod?.submoduleTitle || "Materi Utama",
        title: newTitle.trim(),
        slug: slugifyTitle(newTitle.trim()),
        summary: newSummary.trim(),
        difficultyLevel: newLevel,
        estimatedDuration: 5,
        status: "DRAFT",
        contentBlocks: {
          schemaVersion: 1,
          blocks: [
            {
              id: `blk-${Date.now()}-1`,
              type: "heading",
              level: 2,
              text: newTitle.trim(),
              content: newTitle.trim(),
              align: "left",
            },
            createEmptyBlock("paragraph"),
          ],
        },
      });
      const created = res?.data?.lesson;
      setCreateModalOpen(false);
      notify(`Materi "${newTitle.trim()}" berhasil dibuat.`);
      await loadLibrary();
      if (onModulesChanged) onModulesChanged();
      if (created?.id) {
        setSelectedLessonId(created.id);
        setViewMode("editor");
      }
    } catch (err) {
      notify(err.message || "Gagal membuat materi.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicateMaterial = async (lessonId) => {
    try {
      setOpenMenuId(null);
      await adminApi.duplicateLesson(lessonId);
      notify("Materi berhasil diduplikasi sebagai Draft.");
      await loadLibrary();
      if (onModulesChanged) onModulesChanged();
    } catch (err) {
      notify(err.message || "Gagal menduplikasi materi.", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await adminApi.deleteLesson(deleteTarget.id);
      notify(`Materi "${deleteTarget.title}" berhasil dihapus.`);
      setDeleteTarget(null);
      await loadLibrary();
      if (onModulesChanged) onModulesChanged();
    } catch (err) {
      notify(err.message || "Gagal menghapus materi.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeBlockSelectValue = useMemo(() => {
    if (!activeBlock) return "paragraph";
    if (activeBlock.type === "heading") return `heading-${activeBlock.level || 2}`;
    if (["paragraph", "callout", "quote", "formula"].includes(activeBlock.type)) {
      return activeBlock.type;
    }
    return "paragraph";
  }, [activeBlock]);

  // ==========================================================================
  // SCREEN A: DAFTAR MATERI (Matches Top-Right "Artikel / Blog" in Reference)
  // ==========================================================================
  if (viewMode === "library") {
    const allSelected =
      filteredLessons.length > 0 &&
      filteredLessons.every((l) => selectedIds.includes(l.id));

    return (
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Materi Pembelajaran
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kelola semua materi atau modul pembelajaran di platform Investpedia Anda.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="h-10 px-4 rounded-xl text-xs font-semibold bg-[#E5242A] hover:bg-[#C91E25] text-white shadow-sm inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Materi</span>
          </Button>
        </div>

        {/* Main White Card Container (Search + Filters + Table inside 1 clean card like reference) */}
        <div className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] shadow-xs overflow-visible">
          {/* Search & Dropdown Filters Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-[#202020] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari materi..."
                className="w-full h-10 pl-10 pr-8 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#2a2a2a] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="h-10 px-3.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="ALL">Semua Tingkat</option>
                <option value="BEGINNER">Pemula</option>
                <option value="INTERMEDIATE">Menengah</option>
                <option value="ADVANCED">Mahir</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoadingLibrary ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-14 rounded-xl bg-slate-100 dark:bg-[#181818] animate-pulse"
                />
              ))}
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="py-14 px-6 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Belum ada materi yang sesuai filter
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tambahkan materi baru atau ubah kata kunci pencarian Anda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#202020] bg-slate-50/60 dark:bg-[#141414] text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 pl-5 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredLessons.map((l) => l.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="rounded border-slate-300 accent-[#E5242A] cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">Judul</th>
                    <th className="py-3.5 px-4 w-32">Tingkat</th>
                    <th className="py-3.5 px-4 w-32">Status</th>
                    <th className="py-3.5 px-4 w-36">Tanggal</th>
                    <th className="py-3.5 px-5 text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e1e1e] text-xs sm:text-sm">
                  {filteredLessons.map((item) => {
                    const isChecked = selectedIds.includes(item.id);
                    const formattedDate = item.updatedAt
                      ? new Date(item.updatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "19 Nov 2026";

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3.5 pl-5 pr-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds((prev) => [...prev, item.id]);
                              } else {
                                setSelectedIds((prev) =>
                                  prev.filter((id) => id !== item.id)
                                );
                              }
                            }}
                            className="rounded border-slate-300 accent-[#E5242A] cursor-pointer"
                          />
                        </td>

                        {/* Judul with Thumbnail Box */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200/70 dark:border-[#2a2a2a] flex items-center justify-center overflow-hidden shrink-0">
                              {item.thumbnailUrl ? (
                                <img
                                  src={item.thumbnailUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BookOpen className="w-5 h-5 text-[#E5242A]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedLessonId(item.id);
                                  setViewMode("editor");
                                }}
                                className="text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-[#E5242A] dark:hover:text-[#f87171] line-clamp-1 transition-colors cursor-pointer"
                              >
                                {item.title}
                              </button>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md mt-0.5">
                                {item.moduleTitle} • {item.estimatedDuration || 5} menit baca
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Tingkat */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <LevelBadge level={item.level} />
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <ReferenceStatusPill status={item.status} />
                        </td>

                        {/* Tanggal */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {formattedDate}
                        </td>

                        {/* Aksi (⋯) */}
                        <td className="py-3.5 px-5 whitespace-nowrap text-right relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(openMenuId === item.id ? null : item.id)
                            }
                            aria-label="Menu aksi materi"
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1e1e1e] inline-flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {openMenuId === item.id && (
                            <div className="absolute right-5 mt-1 w-44 rounded-xl bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#2a2a2a] shadow-xl p-1.5 z-30 text-left text-xs space-y-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setSelectedLessonId(item.id);
                                  setViewMode("editor");
                                }}
                                className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#222222] font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                              >
                                <span>Edit Materi</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setSelectedLessonId(item.id);
                                  setViewMode("preview");
                                }}
                                className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#222222] text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Pratinjau</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateMaterial(item.id)}
                                className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#222222] text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Duplikasi</span>
                              </button>
                              {onOpenModuleQuizzes && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onOpenModuleQuizzes({
                                      id: item.moduleId,
                                      title: item.moduleTitle,
                                    });
                                  }}
                                  className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#222222] text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                                >
                                  <FileQuestion className="w-3.5 h-3.5" />
                                  <span>Bank Soal ({item.moduleQuizCount})</span>
                                </button>
                              )}
                              <div className="my-1 border-t border-slate-100 dark:border-[#262626]" />
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setDeleteTarget({
                                    id: item.id,
                                    title: item.title,
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Tambah Materi Baru */}
        {createModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <form
              onSubmit={handleConfirmCreate}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tambah Materi Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Judul Materi *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Mengenal Saham & Satuan Lot BEI"
                  className="w-full h-10 px-3.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Tingkat
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                  >
                    <option value="BEGINNER">Pemula</option>
                    <option value="INTERMEDIATE">Menengah</option>
                    <option value="ADVANCED">Mahir</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Modul
                  </label>
                  <select
                    value={newModuleId}
                    onChange={(e) => setNewModuleId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                  >
                    {allModulesFlat.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Ringkasan Singkat
                </label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Gambaran singkat materi..."
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                  className="h-9 px-3.5 text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="h-9 px-4 text-xs font-semibold rounded-xl bg-[#E5242A] hover:bg-[#C91E25] text-white cursor-pointer"
                >
                  {isCreating ? "Menyimpan..." : "Buat Materi"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Modal Konfirmasi Hapus */}
        {deleteTarget && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hapus Materi?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin menghapus{" "}
                <strong className="text-slate-900 dark:text-white">
                  &ldquo;{deleteTarget.title}&rdquo;
                </strong>
                ?
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteTarget(null)}
                  className="h-9 px-3.5 text-xs rounded-xl cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="h-9 px-4 text-xs font-semibold rounded-xl bg-rose-600 text-white cursor-pointer"
                >
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // SCREEN B: PRATINJAU MATERI
  // ==========================================================================
  if (viewMode === "preview") {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setViewMode("editor")}
            className="inline-flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white hover:text-[#E5242A] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Edit Materi</span>
          </button>

          <Button
            type="button"
            onClick={() => handleSaveLesson({ overrideStatus: status })}
            className="h-10 px-5 rounded-xl text-xs font-semibold bg-[#E5242A] hover:bg-[#C91E25] text-white cursor-pointer"
          >
            Simpan Perubahan
          </Button>
        </div>

        <article className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-6 sm:p-10 space-y-6">
          <div className="space-y-3 border-b border-slate-200 dark:border-[#222222] pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <LevelBadge level={level} />
              <span>•</span>
              <span>{submoduleTitle}</span>
              <span>•</span>
              <span>{estimatedMinutes} menit baca</span>
              <span>•</span>
              <ReferenceStatusPill status={status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
            {summary && (
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {summary}
              </p>
            )}
          </div>

          <StructuredLessonRenderer contentBlocks={contentBlocks} />
        </article>
      </div>
    );
  }

  // ==========================================================================
  // SCREEN C: ← EDIT MATERI (Matches Bottom-Left "← Edit Halaman" in Reference!)
  // ==========================================================================
  return (
    <div className="space-y-6">
      {/* Top Bar: "← Edit Materi" on left | Save Indicator + Pratinjau + "Simpan Perubahan" on right */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setViewMode("library");
              loadLibrary();
            }}
            className="inline-flex items-center gap-2.5 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white hover:text-[#E5242A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Edit Materi</span>
          </button>

          {/* Subtle Save Status Pill */}
          <span className="px-2.5 py-1 rounded-full text-xs bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] inline-flex items-center gap-1.5 text-slate-500">
            {saveState === "saving" ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : saveState === "unsaved" ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400">
                  Belum disimpan
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tersimpan</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setViewMode("preview")}
            className="h-10 px-4 rounded-xl text-xs font-semibold bg-white dark:bg-[#141414] border-slate-200 dark:border-[#282828] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau</span>
          </Button>

          <Button
            type="button"
            disabled={saveState === "saving"}
            onClick={() => handleSaveLesson({ overrideStatus: status })}
            className="h-10 px-5 rounded-xl text-xs font-semibold bg-[#E5242A] hover:bg-[#C91E25] text-white shadow-sm cursor-pointer"
          >
            {saveState === "saving" ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      {isLoadingLesson ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] text-center text-xs text-slate-500">
          Memuat halaman editor materi...
        </div>
      ) : (
        /* ====================================================================
           2-COLUMN EDIT LAYOUT (Left 8 Cols Main Form | Right 4 Cols Status & Gambar Utama)
           Matches the exact proportions of "← Edit Halaman" in reference image!
           ==================================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================================================================
              LEFT COLUMN (8 Cols): Judul Materi, Slug (URL), & Konten (1 Box!)
              ================================================================ */}
          <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] p-6 space-y-5 shadow-xs">
            {/* 1. Judul Materi */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                Judul Materi
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markDirty();
                }}
                placeholder="Masukkan judul materi..."
                className="w-full h-11 px-4 rounded-xl text-sm font-medium bg-slate-50/70 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a] text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#0c0c0c] focus:border-slate-400"
              />
            </div>

            {/* 2. Slug (URL) */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                Slug (URL)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(slugifyTitle(e.target.value));
                    markDirty();
                  }}
                  placeholder="slug-url-materi"
                  className="w-full h-11 pl-4 pr-10 rounded-xl text-xs sm:text-sm font-mono bg-slate-50/70 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-300 focus:outline-none focus:bg-white dark:focus:bg-[#0c0c0c] focus:border-slate-400"
                />
                <ExternalLink className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Konten (1 Single Toolbar + Unified Editor Box, exactly like reference!) */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                Konten
              </label>

              <div className="rounded-xl border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0c0c0c] overflow-visible">
                {/* SINGLE COMPACT TOOLBAR AT THE TOP OF KONTEN BOX */}
                <div className="px-3 py-2 bg-slate-50 dark:bg-[#161616] border-b border-slate-200 dark:border-[#262626] rounded-t-xl flex flex-wrap items-center gap-1">
                  {/* Paragraf / Heading Dropdown */}
                  <select
                    value={activeBlockSelectValue}
                    onChange={(e) => handleChangeActiveBlockType(e.target.value)}
                    aria-label="Jenis Teks"
                    className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#2a2a2a] text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                  >
                    <option value="paragraph">Paragraf</option>
                    <option value="heading-1">Heading 1</option>
                    <option value="heading-2">Heading 2</option>
                    <option value="heading-3">Heading 3</option>
                    <option value="callout">Catatan Penting</option>
                    <option value="formula">Rumus Finansial</option>
                    <option value="quote">Kutipan</option>
                  </select>

                  <span className="w-px h-5 bg-slate-200 dark:bg-[#2a2a2a] mx-1" />

                  {/* B I U */}
                  <button
                    type="button"
                    onClick={() => applyInlineFormat("**")}
                    title="Bold"
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyInlineFormat("*")}
                    title="Italic"
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyInlineFormat("<u>", "</u>")}
                    title="Underline"
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Underline className="w-4 h-4" />
                  </button>

                  <span className="w-px h-5 bg-slate-200 dark:bg-[#2a2a2a] mx-1" />

                  {/* Bullet List & Numbered List */}
                  <button
                    type="button"
                    onClick={() =>
                      handleInsertBlockAfterActive("list", {
                        style: "unordered",
                        ordered: false,
                      })
                    }
                    title="Daftar Poin"
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleInsertBlockAfterActive("list", {
                        style: "ordered",
                        ordered: true,
                      })
                    }
                    title="Daftar Bernomor"
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>

                  <span className="w-px h-5 bg-slate-200 dark:bg-[#2a2a2a] mx-1" />

                  {/* Link, Image, Table, & More (⋯) */}
                  <button
                    type="button"
                    onClick={() => setLinkModalOpen(true)}
                    title="Sematkan Link"
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertBlockAfterActive("image")}
                    title="Sematkan Gambar"
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertBlockAfterActive("table")}
                    title="Sematkan Tabel"
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>

                  {/* More (⋯) Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowMoreToolbarMenu((prev) => !prev)}
                      title="Elemen Lainnya"
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showMoreToolbarMenu && (
                      <div className="absolute left-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#2a2a2a] shadow-xl p-1.5 z-30 space-y-0.5 text-xs">
                        {[
                          { type: "callout", label: "Catatan Penting", icon: Info },
                          { type: "formula", label: "Rumus Finansial", icon: Sparkles },
                          {
                            type: "interactive_quiz",
                            label: "Kuis Cek Pemahaman",
                            icon: FileQuestion,
                          },
                          { type: "quote", label: "Kutipan (Quote)", icon: Quote },
                          { type: "video", label: "Video YouTube", icon: Video },
                          { type: "code", label: "Blok Kode / Simulasi", icon: Code2 },
                          { type: "steps", label: "Langkah Berurutan", icon: ListOrdered },
                          { type: "accordion", label: "Accordion", icon: BookOpen },
                          { type: "attachment", label: "Lampiran File", icon: Paperclip },
                          { type: "divider", label: "Garis Pemisah", icon: Minus },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.type}
                              type="button"
                              onClick={() => handleInsertBlockAfterActive(item.type)}
                              className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-[#222222] text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                            >
                              <Icon className="w-3.5 h-3.5 text-[#E5242A]" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* DOCUMENT WRITING AREA INSIDE THE KONTEN BOX */}
                <div className="p-5 sm:p-6 space-y-4 min-h-[420px]">
                  {/* Ringkasan / Pengantar Singkat */}
                  <div className="pb-3 border-b border-dashed border-slate-200 dark:border-[#242424]">
                    <textarea
                      rows={2}
                      value={summary}
                      onChange={(e) => {
                        setSummary(e.target.value);
                        markDirty();
                      }}
                      placeholder="Tuliskan ringkasan pengantar materi..."
                      className="w-full text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-transparent focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Seamless Document Blocks */}
                  {contentBlocks.map((block, index) => {
                    const isFocused = safeActiveIndex === index;
                    return (
                      <div
                        key={block.id || index}
                        onClick={() => setActiveBlockIndex(index)}
                        className={`group relative rounded-lg transition-colors pl-3 pr-2 py-1.5 border-l-2 ${
                          isFocused
                            ? "border-l-[#E5242A] bg-slate-50/70 dark:bg-[#151515]"
                            : "border-l-transparent hover:border-l-slate-200 dark:hover:border-l-[#262626]"
                        }`}
                      >
                        {/* Minimal Move/Delete Controls on Active/Hovered Block */}
                        <div
                          className={`absolute right-2 -top-2.5 z-10 items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2c2c2c] shadow-xs text-[10px] ${
                            isFocused ? "flex" : "hidden group-hover:flex"
                          }`}
                        >
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(index, "up");
                            }}
                            title="Geser ke atas"
                            className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#262626] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === contentBlocks.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(index, "down");
                            }}
                            title="Geser ke bawah"
                            className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#262626] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(index);
                            }}
                            title="Hapus bagian ini"
                            className="p-0.5 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {block.type === "heading" && (
                          <input
                            id={`studio-block-input-${index}`}
                            type="text"
                            value={block.text ?? block.content ?? ""}
                            onFocus={() => setActiveBlockIndex(index)}
                            onChange={(e) =>
                              handleUpdateBlock(index, { text: e.target.value })
                            }
                            placeholder="Subjudul bagian..."
                            className={`w-full bg-transparent focus:outline-none font-bold text-slate-900 dark:text-white ${
                              Number(block.level) === 1
                                ? "text-xl sm:text-2xl"
                                : Number(block.level) === 3
                                  ? "text-base"
                                  : "text-lg sm:text-xl"
                            }`}
                          />
                        )}

                        {block.type === "paragraph" && (
                          <textarea
                            id={`studio-block-input-${index}`}
                            rows={Math.max(
                              2,
                              Math.ceil(
                                String(block.text ?? block.content ?? "").length / 80
                              )
                            )}
                            value={block.text ?? block.content ?? ""}
                            onFocus={() => setActiveBlockIndex(index)}
                            onChange={(e) =>
                              handleUpdateBlock(index, { text: e.target.value })
                            }
                            placeholder="Tulis paragraf materi..."
                            className="w-full bg-transparent focus:outline-none text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 resize-y"
                          />
                        )}

                        {block.type === "list" && (
                          <div className="space-y-1.5 py-1">
                            {(block.items || []).map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-400 w-5 text-right">
                                  {block.style === "ordered" || block.ordered
                                    ? `${itemIdx + 1}.`
                                    : "•"}
                                </span>
                                <input
                                  type="text"
                                  value={item}
                                  onFocus={() => setActiveBlockIndex(index)}
                                  onChange={(e) => {
                                    const nextItems = [...(block.items || [])];
                                    nextItems[itemIdx] = e.target.value;
                                    handleUpdateBlock(index, { items: nextItems });
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const nextItems = [...(block.items || [])];
                                      nextItems.splice(itemIdx + 1, 0, "");
                                      handleUpdateBlock(index, { items: nextItems });
                                    }
                                  }}
                                  placeholder="Tulis poin..."
                                  className="flex-1 text-sm bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none py-0.5"
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
                                  className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateBlock(index, {
                                  items: [...(block.items || []), ""],
                                })
                              }
                              className="text-xs text-[#E5242A] font-medium hover:underline pl-7 cursor-pointer"
                            >
                              + Tambah poin
                            </button>
                          </div>
                        )}

                        {block.type === "callout" && (
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#282828] border-l-4 border-l-[#E5242A] space-y-1.5">
                            <input
                              type="text"
                              value={block.title || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { title: e.target.value })
                              }
                              placeholder="Judul catatan penting..."
                              className="w-full text-xs sm:text-sm font-bold bg-transparent focus:outline-none"
                            />
                            <textarea
                              id={`studio-block-input-${index}`}
                              rows={2}
                              value={block.text ?? block.content ?? ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { text: e.target.value })
                              }
                              placeholder="Isi catatan..."
                              className="w-full text-xs sm:text-sm bg-transparent focus:outline-none resize-y"
                            />
                          </div>
                        )}

                        {block.type === "formula" && (
                          <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-1.5">
                            <input
                              type="text"
                              value={block.title || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { title: e.target.value })
                              }
                              placeholder="Nama Rumus..."
                              className="w-full text-[11px] font-mono uppercase text-slate-400 bg-transparent focus:outline-none"
                            />
                            <input
                              id={`studio-block-input-${index}`}
                              type="text"
                              value={block.expression || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, {
                                  expression: e.target.value,
                                })
                              }
                              placeholder="ROE = (Laba Bersih / Ekuitas) × 100%"
                              className="w-full text-sm font-mono font-bold text-center py-2 rounded bg-black/40 border border-slate-800 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={block.explanation || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, {
                                  explanation: e.target.value,
                                })
                              }
                              placeholder="Keterangan rumus..."
                              className="w-full text-xs text-slate-300 bg-transparent focus:outline-none"
                            />
                          </div>
                        )}

                        {block.type === "image" && (
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] space-y-2">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={block.url || ""}
                                onChange={(e) =>
                                  handleUpdateBlock(index, { url: e.target.value })
                                }
                                placeholder="URL gambar atau pilih file"
                                className="flex-1 h-8 px-2.5 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#2a2a2a]"
                              />
                              <label className="h-8 px-3 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Pilih File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleImageBlockFileUpload(
                                      index,
                                      e.target.files?.[0]
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>
                            {block.url && (
                              <img
                                src={block.url}
                                alt={block.alt || "Ilustrasi"}
                                className="max-h-52 mx-auto rounded-lg object-contain"
                              />
                            )}
                            <input
                              type="text"
                              value={block.caption || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, {
                                  caption: e.target.value,
                                  alt: e.target.value || "Ilustrasi materi",
                                })
                              }
                              placeholder="Keterangan gambar..."
                              className="w-full text-xs text-center text-slate-500 bg-transparent focus:outline-none"
                            />
                          </div>
                        )}

                        {block.type === "table" && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] space-y-2">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={block.caption || ""}
                                onChange={(e) =>
                                  handleUpdateBlock(index, {
                                    caption: e.target.value,
                                  })
                                }
                                placeholder="Judul Tabel..."
                                className="text-xs font-semibold bg-transparent focus:outline-none"
                              />
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const headers = [
                                      ...(block.headers || ["Kolom 1"]),
                                      `Kolom ${(block.headers?.length || 1) + 1}`,
                                    ];
                                    const rows = (block.rows || []).map((r) => [
                                      ...r,
                                      "",
                                    ]);
                                    handleUpdateBlock(index, { headers, rows });
                                  }}
                                  className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#2a2a2a] cursor-pointer"
                                >
                                  + Kolom
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cols =
                                      (block.headers || []).length || 2;
                                    const rows = [
                                      ...(block.rows || []),
                                      Array.from({ length: cols }, () => ""),
                                    ];
                                    handleUpdateBlock(index, { rows });
                                  }}
                                  className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#2a2a2a] cursor-pointer"
                                >
                                  + Baris
                                </button>
                              </div>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0c0c0c]">
                              <table className="w-full text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-100 dark:bg-[#181818]">
                                    {(block.headers || []).map((h, cIdx) => (
                                      <th
                                        key={cIdx}
                                        className="p-1.5 border-b border-r border-slate-200 dark:border-[#262626]"
                                      >
                                        <input
                                          type="text"
                                          value={h}
                                          onChange={(e) => {
                                            const nextH = [
                                              ...(block.headers || []),
                                            ];
                                            nextH[cIdx] = e.target.value;
                                            handleUpdateBlock(index, {
                                              headers: nextH,
                                            });
                                          }}
                                          className="w-full font-semibold bg-transparent focus:outline-none"
                                        />
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(block.rows || []).map((row, rIdx) => (
                                    <tr
                                      key={rIdx}
                                      className="border-b border-slate-200/70 dark:border-[#222222]"
                                    >
                                      {row.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className="p-1.5 border-r border-slate-200/70 dark:border-[#222222]"
                                        >
                                          <input
                                            type="text"
                                            value={cell}
                                            onChange={(e) => {
                                              const nextR = (
                                                block.rows || []
                                              ).map((r, ri) =>
                                                ri === rIdx
                                                  ? r.map((c, ci) =>
                                                      ci === cIdx
                                                        ? e.target.value
                                                        : c
                                                    )
                                                  : r
                                              );
                                              handleUpdateBlock(index, {
                                                rows: nextR,
                                              });
                                            }}
                                            className="w-full bg-transparent focus:outline-none"
                                          />
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {block.type === "quote" && (
                          <div className="pl-4 border-l-2 border-slate-900 dark:border-white space-y-1">
                            <textarea
                              id={`studio-block-input-${index}`}
                              rows={2}
                              value={block.text ?? block.content ?? ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { text: e.target.value })
                              }
                              placeholder="Tulis kutipan..."
                              className="w-full text-sm italic bg-transparent focus:outline-none"
                            />
                            <input
                              type="text"
                              value={block.author || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, {
                                  author: e.target.value,
                                })
                              }
                              placeholder="— Tokoh / Sumber"
                              className="w-full text-xs text-slate-500 bg-transparent focus:outline-none"
                            />
                          </div>
                        )}

                        {block.type === "interactive_quiz" && (
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] space-y-2">
                            <div className="text-xs font-semibold text-[#E5242A]">
                              Kuis Cek Pemahaman Singkat
                            </div>
                            <input
                              type="text"
                              value={block.question || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, {
                                  question: e.target.value,
                                })
                              }
                              placeholder="Tulis pertanyaan..."
                              className="w-full text-xs font-semibold bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#2a2a2a] rounded-lg px-2.5 py-1.5"
                            />
                            <div className="space-y-1">
                              {(block.options || []).map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="radio"
                                    checked={
                                      Number(block.correctOptionIndex ?? 0) ===
                                      optIdx
                                    }
                                    onChange={() =>
                                      handleUpdateBlock(index, {
                                        correctOptionIndex: optIdx,
                                        correctAnswer: ["A", "B", "C", "D"][
                                          optIdx
                                        ],
                                      })
                                    }
                                    className="accent-emerald-600 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={
                                      typeof opt === "string"
                                        ? opt
                                        : opt?.text || ""
                                    }
                                    onChange={(e) => {
                                      const nextOpts = [
                                        ...(block.options || []),
                                      ];
                                      nextOpts[optIdx] = e.target.value;
                                      handleUpdateBlock(index, {
                                        options: nextOpts,
                                      });
                                    }}
                                    className="flex-1 h-7 px-2 rounded text-xs bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#2a2a2a]"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === "video" && (
                          <input
                            type="text"
                            value={block.url || ""}
                            onChange={(e) =>
                              handleUpdateBlock(index, { url: e.target.value })
                            }
                            placeholder="URL Video YouTube (https://www.youtube.com/watch?v=...)"
                            className="w-full h-9 px-3 rounded-lg text-xs font-mono bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626]"
                          />
                        )}

                        {block.type === "code" && (
                          <textarea
                            rows={3}
                            value={block.code || ""}
                            onChange={(e) =>
                              handleUpdateBlock(index, { code: e.target.value })
                            }
                            placeholder="Tulis simulasi perhitungan / kode..."
                            className="w-full p-3 rounded-xl text-xs font-mono bg-slate-950 text-slate-100"
                          />
                        )}

                        {block.type === "steps" && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] space-y-2">
                            <input
                              type="text"
                              value={block.title || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { title: e.target.value })
                              }
                              placeholder="Judul Langkah-Langkah..."
                              className="w-full text-xs font-semibold bg-transparent focus:outline-none"
                            />
                            {(block.steps || []).map((st, sIdx) => (
                              <div key={sIdx} className="flex gap-2">
                                <span className="text-xs font-mono font-bold mt-1">
                                  {sIdx + 1}.
                                </span>
                                <input
                                  type="text"
                                  value={st.title || ""}
                                  onChange={(e) => {
                                    const next = [...(block.steps || [])];
                                    next[sIdx] = {
                                      ...next[sIdx],
                                      title: e.target.value,
                                    };
                                    handleUpdateBlock(index, { steps: next });
                                  }}
                                  placeholder="Judul langkah..."
                                  className="flex-1 h-7 px-2 rounded text-xs bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#2a2a2a]"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {block.type === "accordion" && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] space-y-2">
                            <input
                              type="text"
                              value={block.title || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { title: e.target.value })
                              }
                              placeholder="Judul Accordion..."
                              className="w-full text-xs font-semibold bg-transparent focus:outline-none"
                            />
                            {(block.items || []).map((it, aIdx) => (
                              <input
                                key={aIdx}
                                type="text"
                                value={it.title || ""}
                                onChange={(e) => {
                                  const next = [...(block.items || [])];
                                  next[aIdx] = {
                                    ...next[aIdx],
                                    title: e.target.value,
                                  };
                                  handleUpdateBlock(index, { items: next });
                                }}
                                placeholder="Topik accordion..."
                                className="w-full h-7 px-2 rounded text-xs bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#2a2a2a]"
                              />
                            ))}
                          </div>
                        )}

                        {block.type === "attachment" && (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={block.title || block.fileName || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, {
                                  title: e.target.value,
                                  fileName: e.target.value,
                                })
                              }
                              placeholder="Nama File..."
                              className="h-8 px-2.5 rounded text-xs bg-slate-50 dark:bg-[#141414] border border-slate-200"
                            />
                            <input
                              type="text"
                              value={block.url || ""}
                              onChange={(e) =>
                                handleUpdateBlock(index, { url: e.target.value })
                              }
                              placeholder="https://..."
                              className="h-8 px-2.5 rounded text-xs font-mono bg-slate-50 dark:bg-[#141414] border border-slate-200"
                            />
                          </div>
                        )}

                        {block.type === "divider" && (
                          <hr className="my-2 border-slate-200 dark:border-[#262626]" />
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handleInsertBlockAfterActive("paragraph")}
                    className="w-full py-2 rounded-lg border border-dashed border-slate-200 dark:border-[#262626] hover:border-slate-400 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Paragraf</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================
              RIGHT COLUMN (4 Cols): Status Card & Gambar Utama Card
              Matches the exact right side of "← Edit Halaman" in reference!
              ================================================================ */}
          <div className="lg:col-span-4 space-y-5">
            {/* CARD 1: STATUS & STRUKTUR */}
            <div className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] p-5 space-y-4 shadow-xs">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      markDirty();
                    }}
                    className="w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a] text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="PUBLISHED">● Published (Terbit)</option>
                    <option value="DRAFT">● Draft (Disembunyikan)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                  Modul Kurikulum
                </label>
                <select
                  value={moduleId}
                  onChange={(e) => {
                    setModuleId(e.target.value);
                    markDirty();
                  }}
                  className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a]"
                >
                  {allModulesFlat.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{LEVEL_META[m.level]?.label || m.level}] {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    Tingkat
                  </label>
                  <select
                    value={level}
                    onChange={(e) => {
                      setLevel(e.target.value);
                      markDirty();
                    }}
                    className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a]"
                  >
                    <option value="BEGINNER">Pemula</option>
                    <option value="INTERMEDIATE">Menengah</option>
                    <option value="ADVANCED">Mahir</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                    Waktu Baca (Mnt)
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
                    className="w-full h-10 px-3 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a]"
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: GAMBAR UTAMA (Matches "Gambar Utama" in Reference!) */}
            <div className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] p-5 space-y-3.5 shadow-xs">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                Gambar Utama
              </label>

              {/* Image Preview Area */}
              <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-rose-50 via-slate-100 to-rose-100/70 dark:from-[#1a1214] dark:via-[#141418] dark:to-[#221316] border border-slate-200/80 dark:border-[#2a2a2a] flex flex-col items-center justify-center overflow-hidden">
                {primaryImageBlock?.url ? (
                  <img
                    src={primaryImageBlock.url}
                    alt={primaryImageBlock.alt || title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 space-y-1">
                    <ImageIcon className="w-7 h-7 text-[#E5242A]/70 mx-auto" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Belum ada ilustrasi utama
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: [ Ganti ] & [ 🗑️ Hapus ] */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => coverImageInputRef.current?.click()}
                  className="h-9 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#181818] hover:bg-slate-100 border border-slate-200 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ganti</span>
                </button>
                <input
                  ref={coverImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoverImageUpload(e.target.files?.[0])}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={!primaryImageBlock}
                  onClick={handleRemoveCoverImage}
                  className="h-9 px-3 rounded-xl text-xs font-semibold bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100/70 border border-rose-200/70 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 disabled:opacity-40 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>

            {/* CARD 3: PENGATURAN LANJUTAN & BANK SOAL (Collapsible so it stays super clean) */}
            <div className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] p-5 space-y-3 shadow-xs">
              <button
                type="button"
                onClick={() => setShowExtraMetadata((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span>Tujuan Belajar & Referensi</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showExtraMetadata ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showExtraMetadata && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#222222] text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block">
                      Kata Kunci Topik
                    </label>
                    <input
                      type="text"
                      value={keywordsText}
                      onChange={(e) => {
                        setKeywordsText(e.target.value);
                        markDirty();
                      }}
                      placeholder="saham, bei, roe, valuasi"
                      className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-600 dark:text-slate-400">
                        Tujuan Pembelajaran
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLearningObjectives((prev) => [...prev, ""]);
                          markDirty();
                        }}
                        className="text-[#E5242A] font-semibold hover:underline cursor-pointer"
                      >
                        + Tambah
                      </button>
                    </div>
                    {learningObjectives.map((obj, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <input
                          type="text"
                          value={obj}
                          onChange={(e) => {
                            const next = [...learningObjectives];
                            next[idx] = e.target.value;
                            setLearningObjectives(next);
                            markDirty();
                          }}
                          className="flex-1 h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-[#151515] border border-slate-200 dark:border-[#2a2a2a]"
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
              )}

              {moduleId && onOpenModuleQuizzes && (
                <button
                  type="button"
                  onClick={() => {
                    const mod = allModulesFlat.find((m) => m.id === moduleId);
                    if (mod) onOpenModuleQuizzes(mod);
                  }}
                  className="w-full h-9 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#181818] hover:bg-slate-200 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileQuestion className="w-3.5 h-3.5 text-[#E5242A]" />
                  <span>Kelola Bank Soal Modul Ini</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Sematkan Link */}
      {linkModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleConfirmInsertLink}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sematkan Tautan (Link)
              </h3>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                Teks Tautan
              </label>
              <input
                type="text"
                autoFocus
                required
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="Contoh: Panduan Resmi BEI"
                className="w-full h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                Alamat URL
              </label>
              <input
                type="url"
                required
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://www.idx.co.id"
                className="w-full h-9 px-3 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLinkModalOpen(false)}
                className="h-8 px-3 text-xs rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="h-8 px-3.5 text-xs font-semibold rounded-xl bg-[#E5242A] text-white cursor-pointer"
              >
                Sisipkan
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
