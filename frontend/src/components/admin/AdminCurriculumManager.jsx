import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileQuestion,
  FileText,
  FolderOpen,
  Layers,
  PenTool,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "../../services/apiClient";
import { LEVEL_META, LevelBadge, slugifyTitle } from "./adminConstants";

function StatusBadge({ status }) {
  const isPublished =
    String(status || "").toUpperCase() === "PUBLISHED" || status === true;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
        isPublished
          ? "bg-emerald-50 dark:bg-[#062c19]/70 text-emerald-700 dark:text-[#34d399] border border-emerald-200 dark:border-[#0e4429]"
          : "bg-slate-100 dark:bg-[#18181b] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#27272a]"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPublished ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {isPublished ? "Terbit" : "Draft"}
    </span>
  );
}

export default function AdminCurriculumManager({
  onOpenMaterialInEditor,
  onOpenModuleQuizzes,
  onCurriculumChanged,
  onNotify,
  onBreadcrumbChange,
}) {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tree expansion state
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  // Selected entity in the left tree: { type: "course" | "module" | "lesson", id: string }
  const [selectedNode, setSelectedNode] = useState(null);

  // Editable form state for the right detail panel
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLevel, setFormLevel] = useState("BEGINNER");
  const [formSubmodule, setFormSubmodule] = useState("");
  const [formStatus, setFormStatus] = useState("PUBLISHED");
  const [formEstimatedMinutes, setFormEstimatedMinutes] = useState(5);
  const [formCourseId, setFormCourseId] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Create (Tingkat / Modul / Materi)
  const [createModal, setCreateModal] = useState(null); // { type: "course" | "module" | "lesson", courseId?, moduleId?, level? }
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLevel, setNewLevel] = useState("BEGINNER");
  const [newSubmodule, setNewSubmodule] = useState("Dasar Pasar Modal");
  const [isCreating, setIsCreating] = useState(false);

  // Modal Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, title }
  const [isDeleting, setIsDeleting] = useState(false);

  const notify = useCallback(
    (msg, type = "success") => {
      if (onNotify) onNotify(msg, type);
    },
    [onNotify]
  );

  const loadTree = useCallback(
    async (preferredNode = null) => {
      try {
        setIsLoading(true);
        const res = await adminApi.getCmsTree();
        const loadedCourses = res?.data?.courses || [];
        setCourses(loadedCourses);

        // Expand all levels and modules by default
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

        const target = preferredNode || selectedNode;
        if (target) {
          setSelectedNode(target);
        } else if (loadedCourses.length > 0) {
          setSelectedNode({ type: "course", id: loadedCourses[0].id });
        }
      } catch (err) {
        notify(err.message || "Gagal memuat struktur kurikulum.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [notify, selectedNode]
  );

  useEffect(() => {
    loadTree();
  }, []);

  // Resolve active entity object from selectedNode
  const activeEntity = useMemo(() => {
    if (!selectedNode) return null;
    for (const c of courses) {
      if (selectedNode.type === "course" && c.id === selectedNode.id) {
        return { type: "course", data: c, course: c };
      }
      for (const m of c.modules || []) {
        if (selectedNode.type === "module" && m.id === selectedNode.id) {
          return { type: "module", data: m, course: c, module: m };
        }
        for (const l of m.lessons || []) {
          if (selectedNode.type === "lesson" && l.id === selectedNode.id) {
            return { type: "lesson", data: l, course: c, module: m };
          }
        }
      }
    }
    return null;
  }, [courses, selectedNode]);

  // Hydrate detail form when activeEntity changes
  useEffect(() => {
    if (!activeEntity) return;
    const { type, data, course } = activeEntity;
    if (type === "course") {
      setFormTitle(data.title || "");
      setFormDescription(data.description || "");
      setFormLevel(data.learningLevel || "BEGINNER");
      setFormStatus(data.status || "PUBLISHED");
      if (onBreadcrumbChange) {
        onBreadcrumbChange(`Tabel Kurikulum / ${data.title}`);
      }
    } else if (type === "module") {
      setFormTitle(data.title || "");
      setFormDescription(data.summary || "");
      setFormLevel(data.level || course?.learningLevel || "BEGINNER");
      setFormSubmodule(data.submoduleTitle || "Modul Pembelajaran");
      setFormEstimatedMinutes(data.estimatedMinutes || 5);
      setFormStatus(data.status || (data.isPublished ? "PUBLISHED" : "DRAFT"));
      setFormCourseId(data.courseId || course?.id || "");
      if (onBreadcrumbChange) {
        onBreadcrumbChange(
          `Tabel Kurikulum / ${LEVEL_META[data.level]?.label || "Tingkat"} / ${data.title}`
        );
      }
    } else if (type === "lesson") {
      setFormTitle(data.title || "");
      setFormDescription(data.summary || "");
      setFormLevel(data.difficultyLevel || "BEGINNER");
      setFormSubmodule(data.submoduleTitle || "");
      setFormEstimatedMinutes(data.estimatedDuration || 5);
      setFormStatus(data.status || "PUBLISHED");
      if (onBreadcrumbChange) {
        onBreadcrumbChange(
          `Tabel Kurikulum / ${activeEntity.module?.title || "Modul"} / ${data.title}`
        );
      }
    }
    setIsDirty(false);
  }, [activeEntity, onBreadcrumbChange]);

  // Save changes to selected Tingkat / Modul / Materi metadata
  const handleSaveDetail = async (e) => {
    e.preventDefault();
    if (!activeEntity || !formTitle.trim()) return;
    try {
      setIsSaving(true);
      const { type, data } = activeEntity;
      if (type === "course") {
        await adminApi.updateCourse(data.id, {
          title: formTitle.trim(),
          description: formDescription.trim(),
          learningLevel: formLevel,
          status: formStatus,
        });
        notify(`Tingkat pembelajaran "${formTitle.trim()}" berhasil diperbarui.`);
      } else if (type === "module") {
        await adminApi.updateModule(data.id, {
          title: formTitle.trim(),
          summary: formDescription.trim(),
          level: formLevel,
          submoduleTitle: formSubmodule.trim() || "Modul Pembelajaran",
          estimatedMinutes: Math.max(1, Number(formEstimatedMinutes) || 5),
          isPublished: formStatus === "PUBLISHED",
        });
        notify(`Modul "${formTitle.trim()}" berhasil diperbarui.`);
      } else if (type === "lesson") {
        await adminApi.updateLesson(data.id, {
          title: formTitle.trim(),
          summary: formDescription.trim(),
          difficultyLevel: formLevel,
          submoduleTitle: formSubmodule.trim() || "Materi Utama",
          estimatedDuration: Math.max(1, Number(formEstimatedMinutes) || 5),
          status: formStatus,
        });
        notify(`Informasi materi "${formTitle.trim()}" berhasil diperbarui.`);
      }
      setIsDirty(false);
      await loadTree(selectedNode);
      if (onCurriculumChanged) onCurriculumChanged();
    } catch (err) {
      notify(err.message || "Gagal menyimpan perubahan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder items (courses, modules, lessons)
  const handleReorder = async (itemType, itemsArray, currentIndex, direction) => {
    const targetIdx = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIdx < 0 || targetIdx >= itemsArray.length) return;
    const copy = [...itemsArray];
    const [moved] = copy.splice(currentIndex, 1);
    copy.splice(targetIdx, 0, moved);

    try {
      await adminApi.reorderCms({
        itemType,
        orderedIds: copy.map((item) => item.id),
      });
      notify("Urutan kurikulum berhasil diperbarui.");
      await loadTree(selectedNode);
      if (onCurriculumChanged) onCurriculumChanged();
    } catch (err) {
      notify(err.message || "Gagal mengubah urutan.", "error");
    }
  };

  // Create Tingkat / Modul / Materi
  const handleOpenCreateModal = (config) => {
    setCreateModal(config);
    setNewTitle("");
    setNewDescription("");
    setNewLevel(config.level || "BEGINNER");
    setNewSubmodule(config.submoduleTitle || "Dasar Pasar Modal");
  };

  const handleConfirmCreate = async (e) => {
    e.preventDefault();
    if (!createModal || !newTitle.trim()) return;
    try {
      setIsCreating(true);
      if (createModal.type === "course") {
        const res = await adminApi.createCourse({
          title: newTitle.trim(),
          description: newDescription.trim(),
          learningLevel: newLevel,
          status: "PUBLISHED",
        });
        const created = res?.data?.course;
        notify(`Tingkat pembelajaran "${newTitle.trim()}" berhasil dibuat.`);
        await loadTree(created ? { type: "course", id: created.id } : null);
      } else if (createModal.type === "module") {
        const res = await adminApi.createModule({
          courseId: createModal.courseId,
          title: newTitle.trim(),
          slug: slugifyTitle(newTitle.trim()),
          submoduleTitle: newSubmodule.trim() || "Modul Pembelajaran",
          summary:
            newDescription.trim() ||
            `Modul pembelajaran mengenai ${newTitle.trim()}.`,
          level: newLevel,
          estimatedMinutes: 6,
          isPublished: false,
          contentBody: `## ${newTitle.trim()}\n\nTuliskan pembahasan materi pada modul ini.`,
        });
        const createdMod = res?.data?.module;
        notify(`Modul "${newTitle.trim()}" berhasil ditambahkan.`);
        await loadTree(createdMod ? { type: "module", id: createdMod.id } : null);
      } else if (createModal.type === "lesson") {
        const res = await adminApi.createLesson({
          courseId: createModal.courseId,
          moduleId: createModal.moduleId,
          submoduleTitle: newSubmodule.trim() || "Materi Utama",
          title: newTitle.trim(),
          slug: slugifyTitle(newTitle.trim()),
          summary:
            newDescription.trim() ||
            `Pembahasan terstruktur mengenai ${newTitle.trim()}.`,
          difficultyLevel: newLevel,
          estimatedDuration: 5,
          status: "DRAFT",
        });
        const createdLes = res?.data?.lesson;
        notify(`Materi "${newTitle.trim()}" berhasil dibuat.`);
        await loadTree(createdLes ? { type: "lesson", id: createdLes.id } : null);
      }
      if (onCurriculumChanged) onCurriculumChanged();
      setCreateModal(null);
    } catch (err) {
      notify(err.message || "Gagal menambahkan item kurikulum.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  // Delete confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      if (deleteTarget.type === "course") {
        await adminApi.deleteCourse(deleteTarget.id);
      } else if (deleteTarget.type === "module") {
        await adminApi.deleteModule(deleteTarget.id);
      } else {
        await adminApi.deleteLesson(deleteTarget.id);
      }
      notify(`"${deleteTarget.title}" berhasil dihapus.`);
      setDeleteTarget(null);
      setSelectedNode(null);
      await loadTree(null);
      if (onCurriculumChanged) onCurriculumChanged();
    } catch (err) {
      notify(err.message || "Gagal menghapus item.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ====================================================================
          PAGE HEADER (Section 3.4 & 5.2)
          ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Manajemen Kurikulum
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Atur tingkat pembelajaran, modul, dan urutan materi dalam satu struktur yang terorganisasi.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            onClick={() =>
              handleOpenCreateModal({ type: "course", level: "BEGINNER" })
            }
            className="h-10 px-4 rounded-lg text-xs font-semibold bg-[#e3252f] hover:bg-[#c91e25] text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tingkat</span>
          </Button>
        </div>
      </div>

      {/* ====================================================================
          TWO-PANEL MASTER-DETAIL LAYOUT (Section 5.2: 38% Struktur | 62% Detail)
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================================================================
            PANEL KIRI: STRUKTUR KURIKULUM (5 Cols / ~40%)
            ================================================================== */}
        <aside className="lg:col-span-5 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-200 dark:border-[#242424] bg-slate-50/70 dark:bg-[#141414] flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Struktur Kurikulum
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {courses.length} Tingkat
            </span>
          </div>

          <div className="p-3 space-y-2.5 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-12 rounded-lg bg-slate-100 dark:bg-[#181818] animate-pulse"
                  />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Belum ada tingkat pembelajaran
                </p>
                <Button
                  type="button"
                  onClick={() =>
                    handleOpenCreateModal({ type: "course", level: "BEGINNER" })
                  }
                  className="h-8 px-3 text-xs rounded-lg bg-[#e3252f] text-white cursor-pointer"
                >
                  + Tambah Tingkat
                </Button>
              </div>
            ) : (
              courses.map((course, cIdx) => {
                const isCourseExpanded = Boolean(expandedCourses[course.id]);
                const isCourseSelected =
                  selectedNode?.type === "course" && selectedNode?.id === course.id;

                return (
                  <div
                    key={course.id}
                    className="rounded-xl border border-slate-200 dark:border-[#242424] overflow-hidden bg-slate-50/30 dark:bg-[#0c0c0c]"
                  >
                    {/* LEVEL 1: TINGKAT PEMBELAJARAN (COURSE) */}
                    <div
                      className={`group px-3 py-2.5 flex items-center justify-between gap-2 transition-colors ${
                        isCourseSelected
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                          : "bg-slate-100/80 dark:bg-[#141414] text-slate-900 dark:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-[#1c1c1c]"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCourses((prev) => ({
                              ...prev,
                              [course.id]: !prev[course.id],
                            }))
                          }
                          aria-label="Buka atau tutup tingkat"
                          className="p-0.5 rounded opacity-75 hover:opacity-100 cursor-pointer"
                        >
                          {isCourseExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedNode({ type: "course", id: course.id })
                          }
                          className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <Layers className="w-4 h-4 shrink-0 opacity-80" />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold truncate">
                              {course.title}
                            </div>
                            <div
                              className={`text-[10px] ${
                                isCourseSelected
                                  ? "text-slate-300 dark:text-slate-600"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              Tingkat:{" "}
                              {LEVEL_META[course.learningLevel]?.label ||
                                course.learningLevel}{" "}
                              • {(course.modules || []).length} Modul
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Contextual Actions for Tingkat */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={cIdx === 0}
                          onClick={() =>
                            handleReorder("courses", courses, cIdx, "up")
                          }
                          title="Pindah ke atas"
                          className="p-1 rounded opacity-70 hover:opacity-100 disabled:opacity-25 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={cIdx === courses.length - 1}
                          onClick={() =>
                            handleReorder("courses", courses, cIdx, "down")
                          }
                          title="Pindah ke bawah"
                          className="p-1 rounded opacity-70 hover:opacity-100 disabled:opacity-25 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenCreateModal({
                              type: "module",
                              courseId: course.id,
                              level: course.learningLevel,
                            })
                          }
                          title="Tambah Modul pada Tingkat ini"
                          className="p-1 rounded opacity-80 hover:opacity-100 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* LEVEL 2: DAFTAR MODUL DALAM TINGKAT */}
                    {isCourseExpanded && (
                      <div className="p-2 space-y-2 bg-white dark:bg-[#101010]">
                        {(course.modules || []).length === 0 ? (
                          <div className="px-3 py-2 text-xs text-slate-400 flex items-center justify-between">
                            <span>Belum ada modul pada tingkat ini.</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenCreateModal({
                                  type: "module",
                                  courseId: course.id,
                                  level: course.learningLevel,
                                })
                              }
                              className="text-[#e3252f] font-medium hover:underline cursor-pointer"
                            >
                              + Tambah Modul
                            </button>
                          </div>
                        ) : (
                          (course.modules || []).map((mod, mIdx) => {
                            const isModExpanded = Boolean(expandedModules[mod.id]);
                            const isModSelected =
                              selectedNode?.type === "module" &&
                              selectedNode?.id === mod.id;

                            return (
                              <div
                                key={mod.id}
                                className="rounded-lg border border-slate-200/80 dark:border-[#222222] overflow-hidden"
                              >
                                {/* Baris Modul */}
                                <div
                                  className={`group px-2.5 py-2 flex items-center justify-between gap-2 transition-colors ${
                                    isModSelected
                                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold"
                                      : "bg-slate-50/70 dark:bg-[#141414] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1a1a]"
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedModules((prev) => ({
                                          ...prev,
                                          [mod.id]: !prev[mod.id],
                                        }))
                                      }
                                      className="p-0.5 rounded opacity-70 hover:opacity-100 cursor-pointer"
                                    >
                                      {isModExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedNode({
                                          type: "module",
                                          id: mod.id,
                                        })
                                      }
                                      className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                                    >
                                      <FolderOpen className="w-3.5 h-3.5 shrink-0 opacity-75" />
                                      <span className="text-xs truncate">
                                        Modul {mIdx + 1}: {mod.title}
                                      </span>
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                      type="button"
                                      disabled={mIdx === 0}
                                      onClick={() =>
                                        handleReorder(
                                          "modules",
                                          course.modules,
                                          mIdx,
                                          "up"
                                        )
                                      }
                                      title="Pindah modul ke atas"
                                      className="p-0.5 rounded opacity-70 hover:opacity-100 disabled:opacity-25 cursor-pointer"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={
                                        mIdx === (course.modules || []).length - 1
                                      }
                                      onClick={() =>
                                        handleReorder(
                                          "modules",
                                          course.modules,
                                          mIdx,
                                          "down"
                                        )
                                      }
                                      title="Pindah modul ke bawah"
                                      className="p-0.5 rounded opacity-70 hover:opacity-100 disabled:opacity-25 cursor-pointer"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenCreateModal({
                                          type: "lesson",
                                          courseId: course.id,
                                          moduleId: mod.id,
                                          level: mod.level,
                                          submoduleTitle: mod.submoduleTitle,
                                        })
                                      }
                                      title="Tambahkan Materi ke Modul ini"
                                      className="p-0.5 rounded opacity-80 hover:opacity-100 cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* LEVEL 3: DAFTAR MATERI DALAM MODUL */}
                                {isModExpanded && (
                                  <div className="p-1.5 pl-5 space-y-1 bg-white dark:bg-[#0e0e0e] border-t border-slate-100 dark:border-[#1c1c1c]">
                                    {(mod.lessons || []).map((les, lIdx) => {
                                      const isLesSelected =
                                        selectedNode?.type === "lesson" &&
                                        selectedNode?.id === les.id;
                                      return (
                                        <div
                                          key={les.id}
                                          className={`group px-2.5 py-1.5 rounded-md flex items-center justify-between gap-2 text-xs transition-colors ${
                                            isLesSelected
                                              ? "bg-[#e3252f]/10 text-[#e3252f] font-semibold border border-[#e3252f]/30"
                                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#161616]"
                                          }`}
                                        >
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setSelectedNode({
                                                type: "lesson",
                                                id: les.id,
                                              })
                                            }
                                            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                                          >
                                            <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                                            <span className="truncate">
                                              {lIdx + 1}. {les.title}
                                            </span>
                                          </button>

                                          <div className="flex items-center gap-1 shrink-0">
                                            <StatusBadge status={les.status} />
                                            <div className="hidden group-hover:flex items-center gap-0.5">
                                              <button
                                                type="button"
                                                disabled={lIdx === 0}
                                                onClick={() =>
                                                  handleReorder(
                                                    "lessons",
                                                    mod.lessons,
                                                    lIdx,
                                                    "up"
                                                  )
                                                }
                                                title="Pindah ke atas"
                                                className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-[#262626] disabled:opacity-30 cursor-pointer"
                                              >
                                                <ArrowUp className="w-3 h-3" />
                                              </button>
                                              <button
                                                type="button"
                                                disabled={
                                                  lIdx ===
                                                  (mod.lessons || []).length - 1
                                                }
                                                onClick={() =>
                                                  handleReorder(
                                                    "lessons",
                                                    mod.lessons,
                                                    lIdx,
                                                    "down"
                                                  )
                                                }
                                                title="Pindah ke bawah"
                                                className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-[#262626] disabled:opacity-30 cursor-pointer"
                                              >
                                                <ArrowDown className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
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
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ==================================================================
            PANEL KANAN: DETAIL ITEM TERPILIH (7 Cols / ~60%)
            ================================================================== */}
        <section className="lg:col-span-7 rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] overflow-hidden">
          {!activeEntity ? (
            <div className="p-12 text-center space-y-2">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Pilih Tingkat Pembelajaran, Modul, atau Materi di panel kiri untuk melihat dan mengubah detailnya.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveDetail} className="divide-y divide-slate-200 dark:divide-[#242424]">
              {/* Header Detail Panel */}
              <div className="px-6 py-4 bg-slate-50/60 dark:bg-[#141414] flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {activeEntity.type === "course"
                      ? "Detail Tingkat Pembelajaran"
                      : activeEntity.type === "module"
                      ? `Detail Modul • ${activeEntity.course?.title || ""}`
                      : `Detail Materi • ${activeEntity.module?.title || ""}`}
                  </span>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                    {activeEntity.data.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {activeEntity.type === "lesson" && onOpenMaterialInEditor && (
                    <Button
                      type="button"
                      onClick={() => onOpenMaterialInEditor(activeEntity.data.id)}
                      className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-[#e3252f] hover:bg-[#c91e25] text-white inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Buka Editor Materi</span>
                    </Button>
                  )}

                  {activeEntity.type === "module" && onOpenModuleQuizzes && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenModuleQuizzes(activeEntity.data)}
                      className="h-9 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileQuestion className="w-3.5 h-3.5" />
                      <span>Bank Soal ({activeEntity.data.quizCount ?? 0})</span>
                    </Button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        type: activeEntity.type,
                        id: activeEntity.data.id,
                        title: activeEntity.data.title,
                      })
                    }
                    title="Hapus item ini"
                    className="h-9 px-2.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-6 space-y-5 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    {activeEntity.type === "course"
                      ? "Nama Tingkat Pembelajaran *"
                      : activeEntity.type === "module"
                      ? "Nama Modul *"
                      : "Judul Materi *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full h-10 px-3.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Tingkat Kemampuan
                    </label>
                    <select
                      value={formLevel}
                      onChange={(e) => {
                        setFormLevel(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                    >
                      <option value="BEGINNER">Pemula</option>
                      <option value="INTERMEDIATE">Menengah</option>
                      <option value="ADVANCED">Mahir</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Status Publikasi
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => {
                        setFormStatus(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                    >
                      <option value="PUBLISHED">Terbit</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                </div>

                {activeEntity.type !== "course" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        Kategori / Submodul
                      </label>
                      <input
                        type="text"
                        value={formSubmodule}
                        onChange={(e) => {
                          setFormSubmodule(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="Contoh: Dasar Pasar Modal"
                        className="w-full h-10 px-3.5 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                        Estimasi Waktu Baca (Menit)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={formEstimatedMinutes}
                        onChange={(e) => {
                          setFormEstimatedMinutes(e.target.value);
                          setIsDirty(true);
                        }}
                        className="w-full h-10 px-3.5 rounded-lg font-mono bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Deskripsi / Ringkasan
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => {
                      setFormDescription(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Tuliskan deskripsi singkat..."
                    className="w-full p-3 rounded-lg bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727] leading-relaxed"
                  />
                </div>

                {/* ============================================================
                    DAFTAR SUB-ITEM (Section 5.8: Pengelolaan Modul / Materi)
                    ============================================================ */}
                {activeEntity.type === "course" && (
                  <div className="pt-4 border-t border-slate-200 dark:border-[#242424] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Daftar Modul dalam Tingkat Ini (
                        {(activeEntity.data.modules || []).length})
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCreateModal({
                            type: "module",
                            courseId: activeEntity.data.id,
                            level: activeEntity.data.learningLevel,
                          })
                        }
                        className="text-xs font-semibold text-[#e3252f] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Modul</span>
                      </button>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-[#242424] rounded-xl border border-slate-200 dark:border-[#242424] overflow-hidden">
                      {(activeEntity.data.modules || []).map((m, idx) => (
                        <div
                          key={m.id}
                          className="px-4 py-3 bg-slate-50/40 dark:bg-[#0c0c0c] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {idx + 1}. {m.title}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{(m.lessons || []).length} materi</span>
                              <span>•</span>
                              <span>{m.quizCount ?? 0} soal kuis</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={m.status} />
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedNode({ type: "module", id: m.id })
                              }
                              className="h-8 px-2.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272727] bg-white dark:bg-[#141414] hover:bg-slate-100 cursor-pointer"
                            >
                              Kelola Modul
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeEntity.type === "module" && (
                  <div className="pt-4 border-t border-slate-200 dark:border-[#242424] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Daftar Materi dalam Modul Ini (
                        {(activeEntity.data.lessons || []).length})
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenCreateModal({
                            type: "lesson",
                            courseId: activeEntity.course?.id,
                            moduleId: activeEntity.data.id,
                            level: activeEntity.data.level,
                            submoduleTitle: activeEntity.data.submoduleTitle,
                          })
                        }
                        className="text-xs font-semibold text-[#e3252f] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambahkan Materi</span>
                      </button>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-[#242424] rounded-xl border border-slate-200 dark:border-[#242424] overflow-hidden">
                      {(activeEntity.data.lessons || []).map((les, idx) => (
                        <div
                          key={les.id}
                          className="px-4 py-3 bg-slate-50/40 dark:bg-[#0c0c0c] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {idx + 1}. {les.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Estimasi {les.estimatedDuration || 5} menit baca
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={les.status} />
                            {onOpenMaterialInEditor && (
                              <button
                                type="button"
                                onClick={() => onOpenMaterialInEditor(les.id)}
                                className="h-8 px-3 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <PenTool className="w-3 h-3" />
                                <span>Edit Materi</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Detail Panel */}
              <div className="px-6 py-4 bg-slate-50/60 dark:bg-[#141414] flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {isDirty
                    ? "Ada perubahan struktur yang belum disimpan."
                    : "Seluruh perubahan telah tersimpan."}
                </span>
                <Button
                  type="submit"
                  disabled={!isDirty || isSaving}
                  className="h-10 px-5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 disabled:opacity-40 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>

      {/* ====================================================================
          MODAL TAMBAH TINGKAT / MODUL / MATERI (Section 5.6 & 5.7)
          ==================================================================== */}
      {createModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleConfirmCreate}
            className="w-full max-w-md rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {createModal.type === "course"
                  ? "Tambah Tingkat Pembelajaran"
                  : createModal.type === "module"
                  ? "Tambah Modul Pembelajaran"
                  : "Tambahkan Materi Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setCreateModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                {createModal.type === "course"
                  ? "Nama Tingkat *"
                  : createModal.type === "module"
                  ? "Nama Modul *"
                  : "Judul Materi *"}
              </label>
              <input
                type="text"
                required
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={
                  createModal.type === "course"
                    ? "Contoh: Investasi Saham Pemula"
                    : createModal.type === "module"
                    ? "Contoh: Dasar Pasar Modal"
                    : "Masukkan judul materi..."
                }
                className="w-full h-10 px-3.5 rounded-lg text-xs sm:text-sm bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Tingkat Pembelajaran
              </label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
              >
                <option value="BEGINNER">Pemula</option>
                <option value="INTERMEDIATE">Menengah</option>
                <option value="ADVANCED">Mahir</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Deskripsi Singkat
              </label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Tuliskan gambaran singkat..."
                className="w-full p-3 rounded-lg text-xs bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#272727]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModal(null)}
                className="h-9 px-3.5 text-xs rounded-lg cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !newTitle.trim()}
                className="h-9 px-4 text-xs font-semibold rounded-lg bg-[#e3252f] hover:bg-[#c91e25] text-white cursor-pointer"
              >
                {isCreating ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================================================
          DIALOG KONFIRMASI PENGHAPUSAN (Section 11.6)
          ==================================================================== */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Hapus {deleteTarget.type === "course" ? "Tingkat" : deleteTarget.type === "module" ? "Modul" : "Materi"} Ini?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Anda akan menghapus{" "}
              <strong className="text-slate-900 dark:text-white">
                &ldquo;{deleteTarget.title}&rdquo;
              </strong>
              . Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                className="h-9 px-3.5 text-xs rounded-lg cursor-pointer"
              >
                Kembali
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="h-9 px-4 text-xs font-semibold rounded-lg bg-[#c62828] hover:bg-rose-700 text-white cursor-pointer"
              >
                {isDeleting ? "Menghapus..." : "Hapus Permanen"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

