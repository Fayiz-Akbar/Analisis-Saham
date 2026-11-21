import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
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
  Plus,
  Quote,
  RefreshCw,
  Search,
  Sparkles,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Underline,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "../../services/apiClient";
import StructuredLessonRenderer from "../learning/StructuredLessonRenderer";
import { LEVEL_META, LevelBadge, slugifyTitle } from "./adminConstants";

// ============================================================================
// CONVERTER: STRUCTURED BLOCKS <-> SINGLE CONTINUOUS WYSIWYG HTML DOCUMENT
// Memungkinkan seluruh materi diedit langsung dalam 1 dokumen menyatu (seperti
// Google Docs / Notion) tanpa dipisah-pisah menjadi kotak paragraf/heading.
// ============================================================================

function escapeHtml(raw = "") {
  return String(raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInlineMarkdownToHtml(raw = "") {
  let html = escapeHtml(raw);
  // Restore allowed <u>...</u>
  html = html.replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/gi, "<u>$1</u>");
  // Links [label](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#E5242A] underline font-medium">$1</a>'
  );
  // Bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Strikethrough ~~text~~
  html = html.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  // Inline code `text`
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[0.9em]">$1</code>'
  );
  // Italic *text*
  html = html.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  return html;
}

export function blocksToEditableHtml(contentBlocksInput) {
  const blocks = Array.isArray(contentBlocksInput?.blocks)
    ? contentBlocksInput.blocks
    : Array.isArray(contentBlocksInput)
      ? contentBlocksInput
      : [];

  if (blocks.length === 0) {
    return "<p>Mulai tulis isi materi pembelajaran di sini...</p>";
  }

  const htmlParts = [];

  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const textVal = block.content ?? block.text ?? "";

    switch (block.type) {
      case "heading": {
        const level = [1, 2, 3].includes(Number(block.level))
          ? Number(block.level)
          : 2;
        const tag = level === 1 ? "h1" : level === 3 ? "h3" : "h2";
        htmlParts.push(`<${tag}>${formatInlineMarkdownToHtml(textVal)}</${tag}>`);
        break;
      }

      case "paragraph": {
        htmlParts.push(`<p>${formatInlineMarkdownToHtml(textVal)}</p>`);
        break;
      }

      case "list": {
        const isOrdered = Boolean(block.ordered || block.style === "ordered");
        const tag = isOrdered ? "ol" : "ul";
        const itemsHtml = (block.items || [])
          .map((it) => `<li>${formatInlineMarkdownToHtml(String(it || ""))}</li>`)
          .join("");
        htmlParts.push(`<${tag}>${itemsHtml || "<li>Poin pembahasan</li>"}</${tag}>`);
        break;
      }

      case "callout": {
        const title = block.title || "Catatan Penting";
        htmlParts.push(
          `<blockquote data-block-type="callout" data-variant="${escapeHtml(
            block.variant || "concept"
          )}" data-title="${escapeHtml(title)}"><strong>${escapeHtml(
            title
          )}:</strong> ${formatInlineMarkdownToHtml(textVal)}</blockquote>`
        );
        break;
      }

      case "quote": {
        const author = block.author ? ` — ${escapeHtml(block.author)}` : "";
        htmlParts.push(
          `<blockquote data-block-type="quote">${formatInlineMarkdownToHtml(
            textVal
          )}${author}</blockquote>`
        );
        break;
      }

      case "formula": {
        const expr = block.expression || textVal || "";
        const expl = block.explanation || "";
        htmlParts.push(
          `<pre data-block-type="formula" data-title="${escapeHtml(
            block.title || "Formula Finansial"
          )}">${escapeHtml(expr)}${expl ? `\n${escapeHtml(expl)}` : ""}</pre>`
        );
        break;
      }

      case "code": {
        htmlParts.push(
          `<pre data-block-type="code" data-language="${escapeHtml(
            block.language || "financial"
          )}">${escapeHtml(block.code || textVal)}</pre>`
        );
        break;
      }

      case "table": {
        const headers = Array.isArray(block.headers) ? block.headers : [];
        const rows = Array.isArray(block.rows) ? block.rows : [];
        const thead =
          headers.length > 0
            ? `<thead><tr>${headers
                .map((h) => `<th>${formatInlineMarkdownToHtml(String(h ?? ""))}</th>`)
                .join("")}</tr></thead>`
            : "";
        const tbody = `<tbody>${rows
          .map(
            (row) =>
              `<tr>${(Array.isArray(row) ? row : [])
                .map((cell) => `<td>${formatInlineMarkdownToHtml(String(cell ?? ""))}</td>`)
                .join("")}</tr>`
          )
          .join("")}</tbody>`;
        htmlParts.push(
          `<table data-caption="${escapeHtml(block.caption || "")}">${thead}${tbody}</table>`
        );
        break;
      }

      case "image": {
        if (block.url) {
          htmlParts.push(
            `<figure data-block-type="image"><img src="${escapeHtml(
              block.url
            )}" alt="${escapeHtml(block.alt || block.caption || "Ilustrasi")}" />${
              block.caption
                ? `<figcaption>${escapeHtml(block.caption)}</figcaption>`
                : ""
            }</figure>`
          );
        }
        break;
      }

      case "steps": {
        const stepsList = (block.steps || [])
          .map(
            (st) =>
              `<li><strong>${escapeHtml(st.title || "")}:</strong> ${formatInlineMarkdownToHtml(
                st.description || ""
              )}</li>`
          )
          .join("");
        if (block.title) {
          htmlParts.push(`<h3>${escapeHtml(block.title)}</h3>`);
        }
        htmlParts.push(`<ol>${stepsList}</ol>`);
        break;
      }

      case "accordion": {
        if (block.title) {
          htmlParts.push(`<h3>${escapeHtml(block.title)}</h3>`);
        }
        for (const item of block.items || []) {
          htmlParts.push(
            `<p><strong>${escapeHtml(item.title || "")}</strong><br/>${formatInlineMarkdownToHtml(
              item.content || ""
            )}</p>`
          );
        }
        break;
      }

      case "interactive_quiz": {
        const opts = Array.isArray(block.options)
          ? block.options
              .map((o, i) => {
                const txt = typeof o === "string" ? o : o?.text || "";
                const key = ["A", "B", "C", "D"][i] || String(i + 1);
                return `${key}. ${escapeHtml(txt)}`;
              })
              .join(" | ")
          : "";
        htmlParts.push(
          `<blockquote data-block-type="callout" data-variant="info" data-title="Uji Pemahaman"><strong>Uji Pemahaman:</strong> ${escapeHtml(
            block.question || ""
          )} (${opts}) — <em>Kunci: ${escapeHtml(
            block.correctAnswer || "A"
          )}. ${escapeHtml(block.explanation || "")}</em></blockquote>`
        );
        break;
      }

      case "divider": {
        htmlParts.push("<hr />");
        break;
      }

      default: {
        if (textVal) {
          htmlParts.push(`<p>${formatInlineMarkdownToHtml(textVal)}</p>`);
        }
        break;
      }
    }
  }

  return htmlParts.join("\n");
}

function serializeInlineNodeToMarkdown(node) {
  if (!node) return "";
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const tag = node.tagName.toLowerCase();
  const inner = Array.from(node.childNodes)
    .map(serializeInlineNodeToMarkdown)
    .join("");

  if (tag === "strong" || tag === "b") {
    return inner.trim() ? `**${inner.trim()}**` : "";
  }
  if (tag === "em" || tag === "i") {
    return inner.trim() ? `*${inner.trim()}*` : "";
  }
  if (tag === "u") {
    return inner.trim() ? `<u>${inner.trim()}</u>` : "";
  }
  if (tag === "del" || tag === "s" || tag === "strike") {
    return inner.trim() ? `~~${inner.trim()}~~` : "";
  }
  if (tag === "code") {
    return inner.trim() ? `\`${inner.trim()}\`` : "";
  }
  if (tag === "a") {
    const href = node.getAttribute("href") || "https://www.idx.co.id";
    return `[${inner.trim() || href}](${href})`;
  }
  if (tag === "br") {
    return "\n";
  }
  return inner;
}

export function parseEditableHtmlToBlocks(htmlString = "") {
  if (typeof DOMParser === "undefined") {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlString}</div>`, "text/html");
  const root = doc.body.firstChild;
  if (!root) return [];

  const blocks = [];
  let counter = 1;
  const nextId = () => `block-${String(counter++).padStart(3, "0")}`;

  const processElement = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = (node.textContent || "").trim();
      if (txt) {
        blocks.push({
          id: nextId(),
          type: "paragraph",
          content: txt,
          text: txt,
          alignment: "left",
        });
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName.toLowerCase();

    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
      const level = tag === "h1" ? 1 : tag === "h3" || tag === "h4" ? 3 : 2;
      const text = serializeInlineNodeToMarkdown(node).trim();
      if (text) {
        blocks.push({
          id: nextId(),
          type: "heading",
          level,
          content: text,
          text,
          alignment: "left",
        });
      }
      return;
    }

    if (tag === "ul" || tag === "ol") {
      const items = Array.from(node.querySelectorAll(":scope > li"))
        .map((li) => serializeInlineNodeToMarkdown(li).trim())
        .filter(Boolean);
      if (items.length > 0) {
        blocks.push({
          id: nextId(),
          type: "list",
          ordered: tag === "ol",
          style: tag === "ol" ? "ordered" : "unordered",
          items,
        });
      }
      return;
    }

    if (tag === "blockquote") {
      const rawText = serializeInlineNodeToMarkdown(node).trim();
      if (!rawText) return;
      const bType = node.getAttribute("data-block-type");
      const colonMatch = rawText.match(/^\*\*([^*]+)\*\*:\s*([\s\S]+)$/);
      if (bType === "callout" || colonMatch) {
        const title =
          node.getAttribute("data-title") ||
          (colonMatch ? colonMatch[1].replace(/:$/, "").trim() : "Catatan Penting");
        const content = colonMatch
          ? colonMatch[2].trim()
          : rawText.replace(new RegExp(`^\\*\\*${title}:?\\*\\*\\s*`, "i"), "").trim();
        blocks.push({
          id: nextId(),
          type: "callout",
          variant: node.getAttribute("data-variant") || "concept",
          title,
          content: content || rawText,
          text: content || rawText,
        });
      } else {
        blocks.push({
          id: nextId(),
          type: "quote",
          content: rawText,
          text: rawText,
          author: "",
        });
      }
      return;
    }

    if (tag === "pre") {
      const rawCode = (node.textContent || "").trim();
      if (!rawCode) return;
      const bType = node.getAttribute("data-block-type");
      if (bType === "code") {
        blocks.push({
          id: nextId(),
          type: "code",
          language: node.getAttribute("data-language") || "financial",
          code: rawCode,
          caption: "",
        });
      } else {
        const lines = rawCode
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        blocks.push({
          id: nextId(),
          type: "formula",
          title: node.getAttribute("data-title") || "Formula Finansial",
          expression: lines[0] || rawCode,
          explanation: lines.slice(1).join(" • ") || "",
        });
      }
      return;
    }

    if (tag === "table") {
      const headerCells = Array.from(node.querySelectorAll("thead th, thead td"));
      const bodyRows = Array.from(node.querySelectorAll("tbody tr"));
      let headers = headerCells.map((c) => serializeInlineNodeToMarkdown(c).trim());
      let rows = bodyRows.map((tr) =>
        Array.from(tr.querySelectorAll("td, th")).map((c) =>
          serializeInlineNodeToMarkdown(c).trim()
        )
      );
      if (headers.length === 0 && rows.length > 0) {
        headers = rows[0];
        rows = rows.slice(1);
      }
      blocks.push({
        id: nextId(),
        type: "table",
        hasHeader: true,
        caption: node.getAttribute("data-caption") || "",
        headers: headers.length > 0 ? headers : ["Kolom 1", "Kolom 2"],
        rows,
      });
      return;
    }

    if (tag === "figure" || tag === "img") {
      const imgEl = tag === "img" ? node : node.querySelector("img");
      const capEl = tag === "figure" ? node.querySelector("figcaption") : null;
      if (imgEl && imgEl.getAttribute("src")) {
        const caption = capEl ? (capEl.textContent || "").trim() : "";
        blocks.push({
          id: nextId(),
          type: "image",
          url: imgEl.getAttribute("src"),
          alt: imgEl.getAttribute("alt") || caption || "Ilustrasi materi",
          caption,
          size: "lg",
          alignment: "center",
        });
      }
      return;
    }

    if (tag === "hr") {
      blocks.push({
        id: nextId(),
        type: "divider",
        style: "line",
      });
      return;
    }

    // Jika paragraf/div berisi gambar di dalamnya
    const nestedImg = node.querySelector && node.querySelector("img");
    if (nestedImg && nestedImg.getAttribute("src")) {
      blocks.push({
        id: nextId(),
        type: "image",
        url: nestedImg.getAttribute("src"),
        alt: nestedImg.getAttribute("alt") || "Ilustrasi materi",
        caption: "",
        size: "lg",
        alignment: "center",
      });
    }

    // Paragraf atau div biasa
    if (tag === "div" && node.children.length > 0) {
      const hasBlockChildren = Array.from(node.children).some((ch) =>
        ["p", "h1", "h2", "h3", "ul", "ol", "table", "blockquote", "pre", "figure", "hr"].includes(
          ch.tagName.toLowerCase()
        )
      );
      if (hasBlockChildren) {
        Array.from(node.childNodes).forEach(processElement);
        return;
      }
    }

    const paraText = serializeInlineNodeToMarkdown(node).trim();
    if (paraText) {
      blocks.push({
        id: nextId(),
        type: "paragraph",
        content: paraText,
        text: paraText,
        alignment: "left",
      });
    }
  };

  Array.from(root.childNodes).forEach(processElement);

  if (blocks.length === 0) {
    blocks.push({
      id: "block-001",
      type: "paragraph",
      content: "",
      text: "",
      alignment: "left",
    });
  }

  return blocks;
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
  onFullPageEditorChange,
}) {
  const [viewMode, setViewMode] = useState(
    initialLessonId ? "editor" : "library"
  ); // "library" | "editor" | "preview"
  const [courses, setCourses] = useState([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);

  // Library Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Active Material in Full-Page Editor
  const [selectedLessonId, setSelectedLessonId] = useState(initialLessonId);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  // Document Fields
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

  // Single Unified ContentEditable Surface Ref
  const editorSurfaceRef = useRef(null);
  const titleInputRef = useRef(null);
  const summaryInputRef = useRef(null);
  const savedSelectionRangeRef = useRef(null);
  const inlineImageInputRef = useRef(null);
  const autosaveTimerRef = useRef(null);
  const isHydratingRef = useRef(false);

  const [saveState, setSaveState] = useState("saved"); // "saved" | "unsaved" | "saving" | "failed"
  const [blockFormatTag, setBlockFormatTag] = useState("p");

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

  // Notify parent when Full-Page Editor / Preview is active so Sidebar & Topbar hide!
  useEffect(() => {
    const isFullPage = viewMode === "editor" || viewMode === "preview";
    if (onFullPageEditorChange) {
      onFullPageEditorChange(isFullPage);
    }
    if (typeof window !== "undefined") {
      if (isFullPage && selectedLessonId) {
        const editPath = `/admin/materi/${selectedLessonId}/edit`;
        if (window.location.pathname !== editPath) {
          window.history.pushState({ lessonId: selectedLessonId }, "", editPath);
        }
      } else if (!isFullPage && window.location.pathname.startsWith("/admin/materi/")) {
        window.history.pushState({}, "", "/admin");
      }
    }
    return () => {
      if (onFullPageEditorChange) onFullPageEditorChange(false);
    };
  }, [viewMode, selectedLessonId, onFullPageEditorChange]);

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
          const rawBlocks = Array.isArray(l.contentBlocks?.blocks)
            ? l.contentBlocks.blocks
            : Array.isArray(l.contentBlocks)
              ? l.contentBlocks
              : [];
          const firstImage =
            rawBlocks.find((b) => b.type === "image" && b.url)?.url || null;

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

  // Load Lesson Detail & Hydrate Single Continuous Document Surface
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
        setEstimatedMinutes(
          lesson.estimatedDuration || lesson.estimatedMinutes || 5
        );
        setStatus(lesson.status || (lesson.isPublished ? "PUBLISHED" : "DRAFT"));
        setModuleId(lesson.moduleId || "");
        setLearningObjectives(
          Array.isArray(lesson.learningObjectives) &&
            lesson.learningObjectives.length > 0
            ? lesson.learningObjectives
            : ["Memahami konsep utama materi secara terstruktur"]
        );
        setKeywordsText(
          Array.isArray(lesson.keywords) ? lesson.keywords.join(", ") : ""
        );
        setReferences(
          Array.isArray(lesson.references) ? lesson.references : []
        );

        const rawBlocks = Array.isArray(lesson.contentBlocks?.blocks)
          ? lesson.contentBlocks.blocks
          : Array.isArray(lesson.contentBlocks)
            ? lesson.contentBlocks
            : [];
        setContentBlocks(rawBlocks);

        // Set HTML into single unified contentEditable surface
        const initialHtml = blocksToEditableHtml(rawBlocks);
        setTimeout(() => {
          if (editorSurfaceRef.current) {
            editorSurfaceRef.current.innerHTML = initialHtml;
          }
          isHydratingRef.current = false;
        }, 60);

        setSaveState("saved");
      } catch (err) {
        notify(err.message || "Gagal memuat detail materi.", "error");
        isHydratingRef.current = false;
      } finally {
        setIsLoadingLesson(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    if (selectedLessonId && viewMode === "editor") {
      loadLessonDetail(selectedLessonId);
    }
  }, [selectedLessonId, viewMode, loadLessonDetail]);

  // Synchronize contentEditable HTML to contentBlocks when switching to preview or saving
  const readBlocksFromSurface = useCallback(() => {
    if (editorSurfaceRef.current) {
      const parsed = parseEditableHtmlToBlocks(
        editorSurfaceRef.current.innerHTML
      );
      setContentBlocks(parsed);
      return parsed;
    }
    return contentBlocks;
  }, [contentBlocks]);

  const buildLessonPayload = useCallback(
    (overrideStatus = null, blocksToSave = null) => {
      const targetStatus = overrideStatus || status;
      const keywords = keywordsText
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      const finalBlocks = blocksToSave || readBlocksFromSurface();

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
        learningObjectives: learningObjectives
          .map((o) => o.trim())
          .filter(Boolean),
        keywords,
        tags: keywords,
        references: references.filter((r) => r && r.title?.trim()),
        contentBlocks: {
          schemaVersion: 1,
          blocks: finalBlocks,
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
      readBlocksFromSurface,
    ]
  );

  const handleSaveLesson = useCallback(
    async ({ overrideStatus = null, isAuto = false } = {}) => {
      if (!selectedLessonId) return;
      try {
        setSaveState("saving");
        const latestBlocks = readBlocksFromSurface();
        const payload = buildLessonPayload(overrideStatus, latestBlocks);
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
    [
      selectedLessonId,
      readBlocksFromSurface,
      buildLessonPayload,
      notify,
      loadLibrary,
      onModulesChanged,
    ]
  );

  const markDirty = useCallback(() => {
    if (isHydratingRef.current || !selectedLessonId) return;
    setSaveState("unsaved");
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      handleSaveLesson({ isAuto: true });
    }, 3500);
  }, [selectedLessonId, handleSaveLesson]);

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  // Auto-resize Judul Materi & Ringkasan Pengantar textareas so long titles always wrap completely without clipping!
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.style.height = "auto";
      titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`;
    }
  }, [title, viewMode]);

  useEffect(() => {
    if (summaryInputRef.current) {
      summaryInputRef.current.style.height = "auto";
      summaryInputRef.current.style.height = `${summaryInputRef.current.scrollHeight}px`;
    }
  }, [summary, viewMode]);

  // ==========================================================================
  // CONTINUOUS WYSIWYG DOCUMENT COMMANDS (Single Surface)
  // ==========================================================================
  const saveCurrentSelection = () => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (
      sel &&
      sel.rangeCount > 0 &&
      editorSurfaceRef.current &&
      editorSurfaceRef.current.contains(sel.anchorNode)
    ) {
      savedSelectionRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSavedSelection = () => {
    if (typeof window === "undefined") return;
    editorSurfaceRef.current?.focus();
    if (savedSelectionRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRangeRef.current);
      }
    }
  };

  const execEditorCommand = (command, value = null) => {
    restoreSavedSelection();
    document.execCommand(command, false, value);
    saveCurrentSelection();
    markDirty();
  };

  const handleFormatBlockChange = (tagValue) => {
    setBlockFormatTag(tagValue);
    restoreSavedSelection();
    if (tagValue === "callout") {
      document.execCommand(
        "insertHTML",
        false,
        `<blockquote data-block-type="callout" data-variant="concept" data-title="Catatan Penting"><strong>Catatan Penting:</strong> Tuliskan poin sorotan penting di sini...</blockquote><p><br/></p>`
      );
    } else if (tagValue === "formula") {
      document.execCommand(
        "insertHTML",
        false,
        `<pre data-block-type="formula" data-title="Formula Finansial">ROE = (Laba Bersih / Total Ekuitas) × 100%</pre><p><br/></p>`
      );
    } else {
      document.execCommand("formatBlock", false, `<${tagValue}>`);
    }
    saveCurrentSelection();
    markDirty();
  };

  const insertHtmlAtCursor = (htmlSnippet) => {
    restoreSavedSelection();
    document.execCommand("insertHTML", false, htmlSnippet);
    saveCurrentSelection();
    markDirty();
  };

  const handleConfirmInsertLink = (e) => {
    e.preventDefault();
    const label = linkLabel.trim() || "Tautan Referensi";
    const url = linkUrl.trim() || "https://www.idx.co.id";
    insertHtmlAtCursor(
      `<a href="${escapeHtml(
        url
      )}" target="_blank" rel="noopener noreferrer" class="text-[#E5242A] underline font-medium">${escapeHtml(
        label
      )}</a>&nbsp;`
    );
    setLinkModalOpen(false);
    setLinkLabel("");
    setLinkUrl("https://");
  };

  const handleInlineImageUpload = (file) => {
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      notify("Ukuran gambar maksimal 2.5 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const altText = file.name.replace(/\.[^.]+$/, "");
      insertHtmlAtCursor(
        `<figure data-block-type="image"><img src="${dataUrl}" alt="${escapeHtml(
          altText
        )}" /><figcaption>${escapeHtml(altText)}</figcaption></figure><p><br/></p>`
      );
    };
    reader.readAsDataURL(file);
  };

  const handleInsertTable = () => {
    insertHtmlAtCursor(
      `<table><thead><tr><th>Indikator</th><th>Penjelasan</th><th>Standar Ideal</th></tr></thead><tbody><tr><td>ROE</td><td>Return on Equity</td><td>&gt; 15%</td></tr><tr><td>DER</td><td>Debt to Equity Ratio</td><td>&lt; 1.0x</td></tr></tbody></table><p><br/></p>`
    );
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
            {
              id: `blk-${Date.now()}-2`,
              type: "paragraph",
              text: "Tuliskan isi pembahasan materi pembelajaran di sini...",
              content: "Tuliskan isi pembahasan materi pembelajaran di sini...",
              align: "left",
            },
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

  // ==========================================================================
  // SCREEN A: DAFTAR MATERI PEMBELAJARAN (CONTENT LIBRARY)
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

        {/* Main White Card Container */}
        <div className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/80 dark:border-[#242424] shadow-xs overflow-visible">
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
                    <th className="py-3.5 px-5 text-right w-28">Aksi</th>
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
                      : "21 Nov 2026";

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
                                className="text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-[#E5242A] dark:hover:text-[#f87171] break-words transition-colors cursor-pointer"
                              >
                                {item.title}
                              </button>
                              <div className="text-xs text-slate-500 dark:text-slate-400 break-words mt-0.5">
                                {item.moduleTitle} • {item.estimatedDuration || 5} menit baca
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <LevelBadge level={item.level} />
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <ReferenceStatusPill status={item.status} />
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {formattedDate}
                        </td>

                        <td className="py-3.5 px-5 whitespace-nowrap text-right relative">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLessonId(item.id);
                                setViewMode("editor");
                              }}
                              className="h-8 px-3 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#242424] text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                              Edit
                            </button>

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
                          </div>

                          {openMenuId === item.id && (
                            <div className="absolute right-5 mt-1 w-44 rounded-xl bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#2a2a2a] shadow-xl p-1.5 z-30 text-left text-xs space-y-0.5">
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
                  {isCreating ? "Menyimpan..." : "Buat & Buka Editor"}
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
  // SCREEN B: FULL-PAGE PRATINJAU MATERI
  // ==========================================================================
  if (viewMode === "preview") {
    return (
      <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#080808] py-6 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="px-5 py-3.5 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] flex items-center justify-between gap-3 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:text-[#E5242A] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Halaman Edit Materi</span>
            </button>

            <Button
              type="button"
              onClick={() => handleSaveLesson({ overrideStatus: status })}
              className="h-9 px-4 rounded-xl text-xs font-semibold bg-[#E5242A] hover:bg-[#C91E25] text-white cursor-pointer"
            >
              Simpan Perubahan
            </Button>
          </div>

          <article className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] p-6 sm:p-10 space-y-6 shadow-xs">
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
      </div>
    );
  }

  // ==========================================================================
  // SCREEN C: DEDICATED FULL-PAGE EDIT MATERI (TANPA SIDEBAR & TANPA SECTION SAMPING!)
  // Seluruh isi materi langsung dapat diedit dalam 1 dokumen menyatu tanpa
  // dipisah menjadi kotak paragraf/heading.
  // ==========================================================================
  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#080808] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* ====================================================================
          TOP FULL-PAGE EDITOR BAR (Kembali, Pengaturan Ringkas Inline, Pratinjau, & Simpan)
          ==================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#101010]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#242424] px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Kiri: Tombol Kembali & Indikator Simpan */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setViewMode("library");
                loadLibrary();
              }}
              className="h-9 px-3.5 rounded-xl bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#242424] text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Materi</span>
            </button>

            <span className="px-2.5 py-1 rounded-full text-xs bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#262626] inline-flex items-center gap-1.5 text-slate-500">
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

          {/* Kanan: Kontrol Ringkas (Tingkat, Waktu Baca, Status, Pratinjau, Simpan) */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                markDirty();
              }}
              aria-label="Tingkat Materi"
              className="h-9 px-3 rounded-xl text-xs font-medium bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#2a2a2a] cursor-pointer"
            >
              <option value="BEGINNER">Tingkat: Pemula</option>
              <option value="INTERMEDIATE">Tingkat: Menengah</option>
              <option value="ADVANCED">Tingkat: Mahir</option>
            </select>

            <div className="h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#2a2a2a] inline-flex items-center gap-1 text-xs">
              <input
                type="number"
                min={1}
                max={180}
                value={estimatedMinutes}
                onChange={(e) => {
                  setEstimatedMinutes(e.target.value);
                  markDirty();
                }}
                className="w-10 font-mono font-semibold text-center bg-transparent focus:outline-none"
              />
              <span className="text-slate-400">mnt</span>
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                markDirty();
              }}
              aria-label="Status Publikasi"
              className="h-9 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#2a2a2a] cursor-pointer"
            >
              <option value="PUBLISHED">● Published (Terbit)</option>
              <option value="DRAFT">● Draft</option>
            </select>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                readBlocksFromSurface();
                setViewMode("preview");
              }}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#141414] border-slate-200 dark:border-[#282828] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau</span>
            </Button>

            <Button
              type="button"
              disabled={saveState === "saving"}
              onClick={() => handleSaveLesson({ overrideStatus: status })}
              className="h-9 px-5 rounded-xl text-xs font-semibold bg-[#E5242A] hover:bg-[#C91E25] text-white shadow-sm cursor-pointer"
            >
              {saveState === "saving" ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          FULL-PAGE CENTERED DOCUMENT WORKSPACE (Fokus 100% ke Edit Materi)
          ==================================================================== */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6">
        {isLoadingLesson ? (
          <div className="p-14 rounded-2xl bg-white dark:bg-[#101010] border border-slate-200 dark:border-[#242424] text-center text-xs text-slate-500">
            Memuat dokumen materi pembelajaran...
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-[#101010] border border-slate-200/90 dark:border-[#242424] shadow-sm overflow-visible">
            {/* ==============================================================
                1 SINGLE STICKY FORMATTING BAR (Mengontrol dokumen menyatu)
                ============================================================== */}
            <div className="sticky top-[61px] z-20 px-4 py-2.5 bg-slate-50/95 dark:bg-[#151515]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#262626] rounded-t-2xl flex flex-wrap items-center gap-1.5">
              {/* Format Teks (Untuk teks yang sedang diblok / kursor aktif) */}
              <select
                value={blockFormatTag}
                onChange={(e) => handleFormatBlockChange(e.target.value)}
                aria-label="Format Baris"
                className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#2a2a2a] text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="p">Teks Normal</option>
                <option value="h1">Judul Besar (H1)</option>
                <option value="h2">Subjudul (H2)</option>
                <option value="h3">Sub-bagian (H3)</option>
                <option value="callout">+ Kotak Catatan</option>
                <option value="formula">+ Kotak Rumus</option>
              </select>

              <span className="w-px h-5 bg-slate-200 dark:bg-[#2a2a2a] mx-1" />

              {/* Bold, Italic, Underline, Strikethrough */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execEditorCommand("bold")}
                title="Tebal (Ctrl+B)"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execEditorCommand("italic")}
                title="Miring (Ctrl+I)"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execEditorCommand("underline")}
                title="Garis Bawah (Ctrl+U)"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execEditorCommand("strikeThrough")}
                title="Coret"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <span className="w-px h-5 bg-slate-200 dark:bg-[#2a2a2a] mx-1" />

              {/* Alignment */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execEditorCommand("justifyLeft")}
                title="Rata Kiri"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execEditorCommand("justifyCenter")}
                title="Rata Tengah"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execEditorCommand("justifyRight")}
                title="Rata Kanan"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <AlignRight className="w-4 h-4" />
              </button>

              <span className="w-px h-5 bg-slate-200 dark:bg-[#2a2a2a] mx-1" />

              {/* Bullet & Numbered Lists */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execEditorCommand("insertUnorderedList")}
                title="Daftar Poin (Bullet List)"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execEditorCommand("insertOrderedList")}
                title="Daftar Bernomor (Numbered List)"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <span className="w-px h-5 bg-slate-200 dark:bg-[#2a2a2a] mx-1" />

              {/* Sematkan Link, Gambar, Tabel, Rumus, Pemisah */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveCurrentSelection();
                }}
                onClick={() => setLinkModalOpen(true)}
                title="Sematkan Link"
                className="h-8 px-2.5 rounded-lg text-xs font-medium bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#2a2a2a] hover:border-slate-400 text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5 text-[#E5242A]" />
                <span>Link</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveCurrentSelection();
                }}
                onClick={() => inlineImageInputRef.current?.click()}
                title="Unggah & Sisipkan Gambar"
                className="h-8 px-2.5 rounded-lg text-xs font-medium bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#2a2a2a] hover:border-slate-400 text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#E5242A]" />
                <span>Gambar</span>
              </button>
              <input
                ref={inlineImageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleInlineImageUpload(e.target.files?.[0])}
                className="hidden"
              />

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveCurrentSelection();
                }}
                onClick={handleInsertTable}
                title="Sisipkan Tabel"
                className="h-8 px-2.5 rounded-lg text-xs font-medium bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-[#2a2a2a] hover:border-slate-400 text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <TableIcon className="w-3.5 h-3.5 text-[#E5242A]" />
                <span>Tabel</span>
              </button>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveCurrentSelection();
                }}
                onClick={() =>
                  insertHtmlAtCursor("<hr /><p><br/></p>")
                }
                title="Sisipkan Garis Pemisah"
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200/70 dark:hover:bg-[#242424] text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* ==============================================================
                ONE CONTINUOUS DOCUMENT PAPER (Judul + Ringkasan + Isi Menyatu!)
                ============================================================== */}
            <div className="px-6 sm:px-14 py-8 sm:py-12">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Bagian Atas Kertas: Judul Materi & Ringkasan Pengantar */}
                <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-[#222222]">
                  <textarea
                    ref={titleInputRef}
                    rows={1}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                      markDirty();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        summaryInputRef.current?.focus();
                      }
                    }}
                    placeholder="Judul Materi Pembelajaran..."
                    className="w-full text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-snug text-slate-900 dark:text-white bg-transparent focus:outline-none resize-none overflow-hidden break-words"
                  />

                  <textarea
                    ref={summaryInputRef}
                    rows={2}
                    value={summary}
                    onChange={(e) => {
                      setSummary(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                      markDirty();
                    }}
                    placeholder="Tuliskan ringkasan pengantar materi (opsional)..."
                    className="w-full text-sm sm:text-base text-slate-500 dark:text-slate-400 bg-transparent focus:outline-none resize-none overflow-hidden leading-relaxed break-words"
                  />
                </div>

                {/* ============================================================
                    SINGLE CONTINUOUS CONTENTEDITABLE DOCUMENT SURFACE
                    Semua teks, subjudul, poin, tabel, rumus, dan gambar dapat
                    diedit langsung dalam 1 aliran dokumen tanpa dipisah-pisah!
                    ============================================================ */}
                <div
                  ref={editorSurfaceRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => {
                    saveCurrentSelection();
                    markDirty();
                  }}
                  onKeyUp={saveCurrentSelection}
                  onMouseUp={saveCurrentSelection}
                  aria-label="Isi dokumen materi pembelajaran"
                  className="min-h-[560px] focus:outline-none text-base leading-[1.8] text-slate-800 dark:text-slate-200
                    [&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:dark:text-white [&_h1]:mt-7 [&_h1]:mb-3
                    [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:dark:text-white [&_h2]:mt-6 [&_h2]:mb-2.5 [&_h2]:pb-1.5 [&_h2]:border-b [&_h2]:border-slate-200 [&_h2]:dark:border-[#242424]
                    [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:dark:text-white [&_h3]:mt-5 [&_h3]:mb-2
                    [&_p]:my-3 [&_p]:leading-[1.8]
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-1.5
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:space-y-1.5
                    [&_blockquote]:my-4 [&_blockquote]:p-4 [&_blockquote]:rounded-xl [&_blockquote]:bg-slate-50 [&_blockquote]:dark:bg-[#151515] [&_blockquote]:border [&_blockquote]:border-slate-200 [&_blockquote]:dark:border-[#282828] [&_blockquote]:border-l-4 [&_blockquote]:border-l-[#E5242A]
                    [&_pre]:my-4 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:text-white [&_pre]:font-mono [&_pre]:text-sm [&_pre]:overflow-x-auto
                    [&_table]:w-full [&_table]:my-5 [&_table]:border-collapse [&_table]:text-sm
                    [&_th]:bg-slate-100 [&_th]:dark:bg-[#181818] [&_th]:border [&_th]:border-slate-200 [&_th]:dark:border-[#2a2a2a] [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold
                    [&_td]:border [&_td]:border-slate-200 [&_td]:dark:border-[#262626] [&_td]:px-3.5 [&_td]:py-2.5
                    [&_figure]:my-5 [&_figure]:text-center
                    [&_img]:max-h-80 [&_img]:mx-auto [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-200 [&_img]:dark:border-[#262626]
                    [&_figcaption]:text-xs [&_figcaption]:text-slate-500 [&_figcaption]:mt-2
                    [&_hr]:my-6 [&_hr]:border-slate-200 [&_hr]:dark:border-[#262626]"
                />
              </div>
            </div>
          </div>
        )}
      </main>

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
