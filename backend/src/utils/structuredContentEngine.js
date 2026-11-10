import { sanitizeText } from "./textSanitizer.js";

/**
 * Daftar tipe blok konten terstruktur yang didukung oleh Learning Content Studio & Renderer
 */
export const SUPPORTED_BLOCK_TYPES = [
  "heading",
  "paragraph",
  "list",
  "callout",
  "image",
  "video",
  "attachment",
  "table",
  "code",
  "formula",
  "quote",
  "interactive_quiz",
  "accordion",
  "steps",
  "divider",
  "related",
];

export const CALLOUT_VARIANTS = [
  "info",
  "note",
  "tip",
  "warning",
  "concept",
  "summary",
];

const CALLOUT_DEFAULT_TITLES = {
  info: "Informasi Penting",
  note: "Catatan",
  tip: "Tips Praktis",
  warning: "Peringatan Risiko",
  concept: "Konsep Penting",
  summary: "Kesimpulan Materi",
};

/**
 * Menghasilkan ID blok stabil apabila belum tersedia
 */
export const makeBlockId = (index = 1, prefix = "block") =>
  `${prefix}-${String(index).padStart(3, "0")}`;

/**
 * Mengonversi teks Markdown lama (contentBody) menjadi dokumen blok terstruktur
 * { schemaVersion: 1, blocks: [...] }
 */
export const parseMarkdownToBlocks = (markdownText = "") => {
  const raw = String(markdownText || "").replace(/\r\n/g, "\n").trim();
  if (!raw) {
    return { schemaVersion: 1, blocks: [] };
  }

  const blocks = [];
  let blockCounter = 1;
  const nextId = () => makeBlockId(blockCounter++);

  // Pisahkan berdasarkan blok kode / formula ``` ... ```
  const segments = raw.split(/(```[\s\S]*?```)/g);

  for (const segment of segments) {
    if (!segment.trim()) continue;

    if (segment.startsWith("```") && segment.endsWith("```")) {
      const firstNewline = segment.indexOf("\n");
      const langLine =
        firstNewline !== -1 ? segment.slice(3, firstNewline).trim().toLowerCase() : "";
      const body =
        firstNewline !== -1
          ? segment.slice(firstNewline + 1, -3).trim()
          : segment.slice(3, -3).trim();

      // Deteksi apakah blok ini berisi rumus finansial atau kode pemrograman
      const looksLikeFormula =
        !langLine ||
        langLine === "formula" ||
        langLine === "math" ||
        (/=/.test(body) &&
          !/function\s|const\s|let\s|import\s|SELECT\s|\{|\}/i.test(body));

      if (looksLikeFormula) {
        const lines = body
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        blocks.push({
          id: nextId(),
          type: "formula",
          title: "Formula Finansial",
          expression: lines[0] || body,
          explanation: lines.slice(1).join(" • ") || "",
          variables: [],
        });
      } else {
        blocks.push({
          id: nextId(),
          type: "code",
          language: langLine || "javascript",
          code: body,
          caption: "",
        });
      }
      continue;
    }

    const lines = segment.split("\n");
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i++;
        continue;
      }

      // Heading 1, 2, 3
      if (line.startsWith("### ")) {
        blocks.push({
          id: nextId(),
          type: "heading",
          level: 3,
          content: line.slice(4).trim(),
          alignment: "left",
        });
        i++;
        continue;
      }
      if (line.startsWith("## ")) {
        blocks.push({
          id: nextId(),
          type: "heading",
          level: 2,
          content: line.slice(3).trim(),
          alignment: "left",
        });
        i++;
        continue;
      }
      if (line.startsWith("# ")) {
        blocks.push({
          id: nextId(),
          type: "heading",
          level: 1,
          content: line.slice(2).trim(),
          alignment: "left",
        });
        i++;
        continue;
      }

      // Divider
      if (/^(-{3,}|\*{3,})$/.test(line)) {
        blocks.push({
          id: nextId(),
          type: "divider",
          style: "line",
        });
        i++;
        continue;
      }

      // Quote atau Callout (> **Judul**: Isi)
      if (line.startsWith("> ")) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith("> ")) {
          quoteLines.push(lines[i].trim().slice(2).trim());
          i++;
        }
        const joined = quoteLines.join(" ");
        const calloutMatch = joined.match(/^\*\*([^*]+)\*\*:\s*(.+)$/);
        if (calloutMatch) {
          const title = calloutMatch[1].trim();
          const content = calloutMatch[2].trim();
          const lowerTitle = title.toLowerCase();
          let variant = "info";
          if (lowerTitle.includes("peringatan") || lowerTitle.includes("risiko")) {
            variant = "warning";
          } else if (lowerTitle.includes("catatan") || lowerTitle.includes("sektor")) {
            variant = "note";
          } else if (lowerTitle.includes("tips")) {
            variant = "tip";
          } else if (lowerTitle.includes("konsep")) {
            variant = "concept";
          } else if (lowerTitle.includes("kesimpulan")) {
            variant = "summary";
          }
          blocks.push({
            id: nextId(),
            type: "callout",
            variant,
            title,
            content,
          });
        } else {
          blocks.push({
            id: nextId(),
            type: "quote",
            content: joined,
            author: "",
          });
        }
        continue;
      }

      // Unordered List (- atau *)
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const items = [];
        while (
          i < lines.length &&
          (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
        ) {
          items.push(lines[i].trim().slice(2).trim());
          i++;
        }
        blocks.push({
          id: nextId(),
          type: "list",
          ordered: false,
          items,
        });
        continue;
      }

      // Ordered List (1. 2. dst)
      if (/^\d+\.\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+\.\s+/, "").trim());
          i++;
        }
        blocks.push({
          id: nextId(),
          type: "list",
          ordered: true,
          items,
        });
        continue;
      }

      // Markdown Table
      if (line.startsWith("|") && line.endsWith("|")) {
        const tableLines = [];
        while (
          i < lines.length &&
          lines[i].trim().startsWith("|") &&
          lines[i].trim().endsWith("|")
        ) {
          tableLines.push(lines[i].trim());
          i++;
        }
        const parsedRows = tableLines
          .filter((tl) => !/^\|[\s:-]+\|$/.test(tl.replace(/\|/g, "|")))
          .filter((tl) => !/^\|(\s*:?-+:?\s*\|)+$/.test(tl))
          .map((tl) =>
            tl
              .slice(1, -1)
              .split("|")
              .map((cell) => cell.trim())
          );

        if (parsedRows.length > 0) {
          blocks.push({
            id: nextId(),
            type: "table",
            hasHeader: true,
            headers: parsedRows[0],
            rows: parsedRows.slice(1),
            caption: "",
          });
        }
        continue;
      }

      // Paragraph biasa (gabungkan baris berurutan yang bukan elemen blok khusus)
      const paraLines = [];
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !lines[i].trim().startsWith("#") &&
        !lines[i].trim().startsWith("> ") &&
        !lines[i].trim().startsWith("- ") &&
        !lines[i].trim().startsWith("* ") &&
        !/^\d+\.\s+/.test(lines[i].trim()) &&
        !(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|"))
      ) {
        paraLines.push(lines[i].trim());
        i++;
      }

      if (paraLines.length > 0) {
        blocks.push({
          id: nextId(),
          type: "paragraph",
          content: paraLines.join(" "),
          alignment: "left",
        });
      }
    }
  }

  return {
    schemaVersion: 1,
    blocks,
  };
};

/**
 * Normalisasi dan sanitasi dokumen contentBlocks agar selalu konsisten dan aman dari XSS
 */
export const normalizeContentBlocks = (rawBlocksInput, fallbackMarkdown = "") => {
  let rawBlocks = [];

  if (rawBlocksInput && typeof rawBlocksInput === "object") {
    if (Array.isArray(rawBlocksInput.blocks)) {
      rawBlocks = rawBlocksInput.blocks;
    } else if (Array.isArray(rawBlocksInput)) {
      rawBlocks = rawBlocksInput;
    }
  } else if (typeof rawBlocksInput === "string" && rawBlocksInput.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(rawBlocksInput);
      if (Array.isArray(parsed.blocks)) rawBlocks = parsed.blocks;
    } catch {
      rawBlocks = [];
    }
  }

  if ((!rawBlocks || rawBlocks.length === 0) && fallbackMarkdown) {
    return parseMarkdownToBlocks(fallbackMarkdown);
  }

  const normalizedBlocks = rawBlocks
    .filter((b) => b && typeof b === "object")
    .map((block, idx) => {
      const type = SUPPORTED_BLOCK_TYPES.includes(block.type) ? block.type : "paragraph";
      const id =
        typeof block.id === "string" && block.id.trim()
          ? block.id.trim()
          : makeBlockId(idx + 1);

      switch (type) {
        case "heading": {
          const level = [1, 2, 3].includes(Number(block.level)) ? Number(block.level) : 2;
          const textVal = sanitizeText(block.content || block.text || "");
          const alignVal = ["left", "center", "right"].includes(block.alignment || block.align)
            ? block.alignment || block.align
            : "left";
          return {
            id,
            type: "heading",
            level,
            content: textVal,
            text: textVal,
            alignment: alignVal,
            align: alignVal,
          };
        }

        case "paragraph": {
          const textVal = sanitizeText(block.content || block.text || "");
          const alignVal = ["left", "center", "right", "justify"].includes(
            block.alignment || block.align
          )
            ? block.alignment || block.align
            : "left";
          return {
            id,
            type: "paragraph",
            content: textVal,
            text: textVal,
            alignment: alignVal,
            align: alignVal,
          };
        }

        case "list": {
          const isOrdered =
            block.ordered !== undefined
              ? Boolean(block.ordered)
              : block.style === "ordered";
          return {
            id,
            type: "list",
            ordered: isOrdered,
            style: isOrdered ? "ordered" : "unordered",
            items: Array.isArray(block.items)
              ? block.items.map((item) => sanitizeText(String(item || ""))).filter(Boolean)
              : [],
          };
        }

        case "callout": {
          const variant = CALLOUT_VARIANTS.includes(block.variant) ? block.variant : "info";
          const textVal = sanitizeText(block.content || block.text || "");
          return {
            id,
            type: "callout",
            variant,
            title: sanitizeText(block.title || CALLOUT_DEFAULT_TITLES[variant]),
            content: textVal,
            text: textVal,
          };
        }

        case "image":
          return {
            id,
            type: "image",
            url: String(block.url || "").trim(),
            alt: sanitizeText(block.alt || block.caption || "Ilustrasi materi pembelajaran"),
            caption: sanitizeText(block.caption || ""),
            size: ["sm", "md", "lg", "full"].includes(block.size) ? block.size : "lg",
            alignment: ["left", "center", "right"].includes(block.alignment)
              ? block.alignment
              : "center",
          };

        case "video":
          return {
            id,
            type: "video",
            url: String(block.url || "").trim(),
            title: sanitizeText(block.title || "Video Pembelajaran"),
            caption: sanitizeText(block.caption || ""),
          };

        case "attachment": {
          const titleVal = sanitizeText(block.fileName || block.title || "Dokumen Lampiran");
          return {
            id,
            type: "attachment",
            url: String(block.url || "").trim(),
            fileName: titleVal,
            title: titleVal,
            fileSize: sanitizeText(block.fileSize || ""),
            description: sanitizeText(block.description || ""),
          };
        }

        case "table": {
          const headers = Array.isArray(block.headers)
            ? block.headers.map((h) => sanitizeText(String(h ?? "")))
            : ["Indikator", "Keterangan"];
          const rows = Array.isArray(block.rows)
            ? block.rows.map((r) =>
                Array.isArray(r) ? r.map((cell) => sanitizeText(String(cell ?? ""))) : []
              )
            : [];
          return {
            id,
            type: "table",
            hasHeader: block.hasHeader !== false,
            headers,
            rows,
            caption: sanitizeText(block.caption || ""),
          };
        }

        case "code":
          return {
            id,
            type: "code",
            language: sanitizeText(block.language || "javascript"),
            code: String(block.code || block.content || "").replace(/\r\n/g, "\n"),
            caption: sanitizeText(block.caption || ""),
          };

        case "formula":
          return {
            id,
            type: "formula",
            title: sanitizeText(block.title || "Rumus Perhitungan"),
            expression: sanitizeText(block.expression || block.content || ""),
            explanation: sanitizeText(block.explanation || ""),
            variables: Array.isArray(block.variables)
              ? block.variables
                  .map((v) => ({
                    symbol: sanitizeText(v?.symbol || ""),
                    meaning: sanitizeText(v?.meaning || ""),
                  }))
                  .filter((v) => v.symbol || v.meaning)
              : [],
          };

        case "quote": {
          const textVal = sanitizeText(block.content || block.text || "");
          return {
            id,
            type: "quote",
            content: textVal,
            text: textVal,
            author: sanitizeText(block.author || ""),
            role: sanitizeText(block.role || ""),
          };
        }

        case "interactive_quiz": {
          const normalizedOptions = Array.isArray(block.options)
            ? block.options.map((opt, oIdx) => {
                if (typeof opt === "string") {
                  return {
                    key: ["A", "B", "C", "D"][oIdx] || String(oIdx + 1),
                    text: sanitizeText(opt),
                  };
                }
                return {
                  key: sanitizeText(opt?.key || ["A", "B", "C", "D"][oIdx] || String(oIdx + 1)),
                  text: sanitizeText(opt?.text || ""),
                };
              })
            : [
                { key: "A", text: "Pilihan A" },
                { key: "B", text: "Pilihan B" },
                { key: "C", text: "Pilihan C" },
                { key: "D", text: "Pilihan D" },
              ];
          const correctIdx =
            block.correctOptionIndex !== undefined
              ? Number(block.correctOptionIndex)
              : ["A", "B", "C", "D"].indexOf(String(block.correctAnswer || "A").toUpperCase());
          const safeCorrectIdx = correctIdx >= 0 ? correctIdx : 0;
          const correctLetter =
            block.correctAnswer ||
            ["A", "B", "C", "D"][safeCorrectIdx] ||
            normalizedOptions[safeCorrectIdx]?.key ||
            "A";
          return {
            id,
            type: "interactive_quiz",
            questionType: ["multiple_choice", "true_false", "short_answer"].includes(
              block.questionType
            )
              ? block.questionType
              : "multiple_choice",
            question: sanitizeText(block.question || ""),
            options: normalizedOptions,
            correctOptionIndex: safeCorrectIdx,
            correctAnswer: sanitizeText(correctLetter),
            correctAnswerText: sanitizeText(block.correctAnswerText || correctLetter),
            explanation: sanitizeText(block.explanation || ""),
            indicatorConcept: sanitizeText(block.indicatorConcept || "Evaluasi Konsep"),
          };
        }

        case "accordion":
          return {
            id,
            type: "accordion",
            title: sanitizeText(block.title || "Detail Pembahasan"),
            items: Array.isArray(block.items)
              ? block.items
                  .map((item, iIdx) => ({
                    id: item?.id || `${id}-acc-${iIdx + 1}`,
                    title: sanitizeText(item?.title || ""),
                    content: sanitizeText(item?.content || ""),
                  }))
                  .filter((item) => item.title || item.content)
              : [],
          };

        case "steps":
          return {
            id,
            type: "steps",
            title: sanitizeText(block.title || "Langkah-Langkah Pembelajaran"),
            steps: Array.isArray(block.steps)
              ? block.steps
                  .map((st) => ({
                    title: sanitizeText(st?.title || ""),
                    description: sanitizeText(st?.description || st?.content || ""),
                  }))
                  .filter((st) => st.title || st.description)
              : [],
          };

        case "divider":
          return {
            id,
            type: "divider",
            style: block.style === "dots" ? "dots" : "line",
          };

        case "related":
          return {
            id,
            type: "related",
            title: sanitizeText(block.title || "Materi Terkait"),
            items: Array.isArray(block.items)
              ? block.items
                  .map((item) => ({
                    title: sanitizeText(item?.title || ""),
                    slug: sanitizeText(item?.slug || ""),
                    level: sanitizeText(item?.level || "BEGINNER"),
                    description: sanitizeText(item?.description || ""),
                  }))
                  .filter((item) => item.title)
              : [],
          };

        default:
          return {
            id,
            type: "paragraph",
            content: sanitizeText(block.content || ""),
            alignment: "left",
          };
      }
    });

  return {
    schemaVersion: 1,
    blocks: normalizedBlocks,
  };
};

/**
 * Mengonversi contentBlocks kembali menjadi Markdown string (untuk kompatibilitas penuh dengan contentBody)
 */
export const blocksToMarkdown = (contentBlocksDoc) => {
  const blocks = Array.isArray(contentBlocksDoc?.blocks)
    ? contentBlocksDoc.blocks
    : Array.isArray(contentBlocksDoc)
      ? contentBlocksDoc
      : [];

  if (blocks.length === 0) return "";

  const parts = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading": {
        const hashes = "#".repeat(Math.min(3, Math.max(1, Number(block.level) || 2)));
        parts.push(`${hashes} ${block.content}`);
        break;
      }
      case "paragraph":
        if (block.content) parts.push(block.content);
        break;
      case "list":
        if (Array.isArray(block.items) && block.items.length > 0) {
          parts.push(
            block.items
              .map((item, idx) => (block.ordered ? `${idx + 1}. ${item}` : `- ${item}`))
              .join("\n")
          );
        }
        break;
      case "callout":
        parts.push(`> **${block.title || "Informasi Penting"}**: ${block.content}`);
        break;
      case "formula":
        parts.push(
          `\`\`\`\n${block.expression}${block.explanation ? `\n${block.explanation}` : ""}\n\`\`\``
        );
        break;
      case "code":
        parts.push(`\`\`\`${block.language || ""}\n${block.code}\n\`\`\``);
        break;
      case "quote":
        parts.push(`> ${block.content}${block.author ? ` — ${block.author}` : ""}`);
        break;
      case "table": {
        const headers = block.headers || [];
        const rows = block.rows || [];
        if (headers.length > 0) {
          const headerLine = `| ${headers.join(" | ")} |`;
          const sepLine = `| ${headers.map(() => "---").join(" | ")} |`;
          const rowLines = rows.map((r) => `| ${r.join(" | ")} |`);
          parts.push([headerLine, sepLine, ...rowLines].join("\n"));
        }
        break;
      }
      case "steps":
        if (Array.isArray(block.steps) && block.steps.length > 0) {
          parts.push(
            `### ${block.title || "Langkah-Langkah"}\n` +
              block.steps
                .map((st, idx) => `${idx + 1}. **${st.title}**: ${st.description}`)
                .join("\n")
          );
        }
        break;
      case "accordion":
        if (Array.isArray(block.items) && block.items.length > 0) {
          parts.push(
            block.items.map((it) => `### ${it.title}\n${it.content}`).join("\n\n")
          );
        }
        break;
      case "image":
        if (block.caption || block.alt) {
          parts.push(`[Gambar: ${block.caption || block.alt}](${block.url || ""})`);
        }
        break;
      default:
        break;
    }
  }

  return parts.join("\n\n").trim();
};

/**
 * Mengekstrak Plain Text Terstruktur untuk LLM Context Retrieval (Section 10.2)
 */
export const extractStructuredPlainText = ({
  courseTitle = "Kurikulum InvestPedia",
  moduleTitle = "",
  lessonTitle = "",
  difficultyLevel = "BEGINNER",
  summary = "",
  learningObjectives = [],
  keywords = [],
  references = [],
  contentBlocks = { schemaVersion: 1, blocks: [] },
}) => {
  const lines = [];

  lines.push(`Course: ${courseTitle}`);
  if (moduleTitle) lines.push(`Module: ${moduleTitle}`);
  if (lessonTitle) lines.push(`Lesson: ${lessonTitle}`);
  lines.push(`Difficulty Level: ${difficultyLevel}`);

  if (summary) {
    lines.push(`\nSummary:\n${summary}`);
  }

  if (Array.isArray(learningObjectives) && learningObjectives.length > 0) {
    lines.push(`\nLearning Objectives:`);
    for (const obj of learningObjectives) {
      if (obj) lines.push(`- ${obj}`);
    }
  }

  if (Array.isArray(keywords) && keywords.length > 0) {
    lines.push(`\nKeywords: ${keywords.join(", ")}`);
  }

  lines.push(`\nContent:`);

  const blocks = Array.isArray(contentBlocks?.blocks) ? contentBlocks.blocks : [];
  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        lines.push(`\n[Section H${block.level || 2}] ${block.content}`);
        break;
      case "paragraph":
        lines.push(block.content);
        break;
      case "list":
        if (Array.isArray(block.items)) {
          for (let i = 0; i < block.items.length; i++) {
            lines.push(block.ordered ? `${i + 1}. ${block.items[i]}` : `- ${block.items[i]}`);
          }
        }
        break;
      case "callout":
        lines.push(
          `[${(block.variant || "info").toUpperCase()} - ${block.title || "Catatan"}]: ${block.content}`
        );
        break;
      case "formula":
        lines.push(
          `[FORMULA - ${block.title || "Rumus"}]: ${block.expression}${
            block.explanation ? ` (${block.explanation})` : ""
          }`
        );
        break;
      case "table": {
        const headers = (block.headers || []).join(" | ");
        lines.push(`[TABLE${block.caption ? ` - ${block.caption}` : ""}]: ${headers}`);
        for (const r of block.rows || []) {
          lines.push(`  Row: ${r.join(" | ")}`);
        }
        break;
      }
      case "code":
        lines.push(`[CODE (${block.language || "text"})]:\n${block.code}`);
        break;
      case "quote":
        lines.push(`[QUOTE]: "${block.content}"${block.author ? ` — ${block.author}` : ""}`);
        break;
      case "steps":
        lines.push(`[STEPS - ${block.title || "Langkah Pembelajaran"}]:`);
        for (let i = 0; i < (block.steps || []).length; i++) {
          const st = block.steps[i];
          lines.push(`  Step ${i + 1} (${st.title}): ${st.description}`);
        }
        break;
      case "accordion":
        lines.push(`[ACCORDION - ${block.title || "Penjelasan Tambahan"}]:`);
        for (const item of block.items || []) {
          lines.push(`  Q/Topic: ${item.title} -> ${item.content}`);
        }
        break;
      case "interactive_quiz":
        lines.push(
          `[CONCEPT CHECK - ${block.indicatorConcept || "Kuis"}]: ${block.question} | Jawaban Benar: ${block.correctAnswer} | Pembahasan: ${block.explanation}`
        );
        break;
      default:
        break;
    }
  }

  if (Array.isArray(references) && references.length > 0) {
    lines.push(`\nReferences / Sources:`);
    for (const ref of references) {
      if (typeof ref === "string") {
        lines.push(`- ${ref}`);
      } else if (ref && ref.title) {
        lines.push(`- ${ref.title}${ref.url ? ` (${ref.url})` : ""}`);
      }
    }
  }

  return lines.join("\n").trim();
};

/**
 * Content Chunking berbasis Heading / Section untuk RAG & AI Investment Tutor (Section 10.3)
 */
export const buildLessonContentChunks = ({
  courseId = null,
  courseTitle = "",
  moduleId = null,
  moduleTitle = "",
  lessonId = "",
  lessonTitle = "",
  lessonSlug = "",
  keywords = [],
  references = [],
  version = 1,
  status = "PUBLISHED",
  contentBlocks = { schemaVersion: 1, blocks: [] },
}) => {
  const blocks = Array.isArray(contentBlocks?.blocks) ? contentBlocks.blocks : [];
  const chunks = [];

  let currentSectionTitle = lessonTitle || "Pengantar Materi";
  let currentBuffer = [];
  let currentSemanticRoles = new Set();
  let chunkIndex = 1;

  const flushChunk = () => {
    const bodyText = currentBuffer.join("\n").trim();
    if (!bodyText) return;

    chunks.push({
      chunk_id: `${lessonId || lessonSlug || "lesson"}-v${version}-c${String(chunkIndex++).padStart(2, "0")}`,
      course_id: courseId,
      course_title: courseTitle,
      module_id: moduleId,
      module_title: moduleTitle,
      lesson_id: lessonId,
      lesson_slug: lessonSlug,
      lesson_title: lessonTitle,
      section_title: currentSectionTitle,
      semantic_roles: Array.from(currentSemanticRoles),
      content: `Materi: ${lessonTitle} — Bagian: ${currentSectionTitle}\n${bodyText}`,
      keywords: Array.isArray(keywords) ? keywords : [],
      source_reference: Array.isArray(references) ? references : [],
      content_version: version,
      published_status: status,
    });

    currentBuffer = [];
    currentSemanticRoles = new Set();
  };

  for (const block of blocks) {
    if (block.type === "heading") {
      // Jika sudah ada isi yang cukup pada bagian sebelumnya, simpan sebagai chunk tersendiri
      if (currentBuffer.join(" ").length >= 120) {
        flushChunk();
      }
      currentSectionTitle = block.content || currentSectionTitle;
      currentSemanticRoles.add("section_heading");
      continue;
    }

    switch (block.type) {
      case "paragraph":
        currentBuffer.push(block.content);
        currentSemanticRoles.add("explanation");
        break;
      case "list":
        currentBuffer.push(
          (block.items || [])
            .map((it, idx) => (block.ordered ? `${idx + 1}. ${it}` : `• ${it}`))
            .join("\n")
        );
        currentSemanticRoles.add("key_points");
        break;
      case "callout":
        currentBuffer.push(`[${block.title || "Catatan"}]: ${block.content}`);
        currentSemanticRoles.add(block.variant || "note");
        break;
      case "formula":
        currentBuffer.push(
          `Rumus (${block.title || "Formula"}): ${block.expression}. ${block.explanation || ""}`
        );
        currentSemanticRoles.add("formula");
        break;
      case "table":
        currentBuffer.push(
          `Tabel ${block.caption || ""}: ${(block.headers || []).join(" | ")} — ${(block.rows || [])
            .map((r) => r.join(" : "))
            .join("; ")}`
        );
        currentSemanticRoles.add("table");
        break;
      case "quote":
        currentBuffer.push(`Kutipan/Definisi: "${block.content}"`);
        currentSemanticRoles.add("definition");
        break;
      case "steps":
        currentBuffer.push(
          (block.steps || [])
            .map((st, idx) => `Langkah ${idx + 1} (${st.title}): ${st.description}`)
            .join("\n")
        );
        currentSemanticRoles.add("steps");
        break;
      case "accordion":
        currentBuffer.push(
          (block.items || []).map((it) => `${it.title}: ${it.content}`).join("\n")
        );
        currentSemanticRoles.add("faq");
        break;
      case "interactive_quiz":
        currentBuffer.push(
          `Contoh Evaluasi (${block.indicatorConcept}): ${block.question} -> Pembahasan: ${block.explanation}`
        );
        currentSemanticRoles.add("evaluation_example");
        break;
      default:
        break;
    }
  }

  flushChunk();

  return chunks;
};

/**
 * Validasi kelengkapan konten sebelum dipublikasikan (Section 7.H)
 */
export const validateLessonForPublication = (lessonData) => {
  const errors = [];

  if (!lessonData.title || String(lessonData.title).trim().length < 3) {
    errors.push({
      field: "title",
      message: "Judul materi wajib diisi (minimal 3 karakter).",
    });
  }

  if (!lessonData.moduleId) {
    errors.push({
      field: "moduleId",
      message: "Materi harus ditempatkan di dalam sebuah Modul yang valid.",
    });
  }

  const blocks = Array.isArray(lessonData.contentBlocks?.blocks)
    ? lessonData.contentBlocks.blocks
    : [];

  if (blocks.length === 0) {
    errors.push({
      field: "contentBlocks",
      message: "Konten materi tidak boleh kosong. Tambahkan minimal 1 blok materi.",
    });
  }

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === "image") {
      if (!b.url || !String(b.url).trim()) {
        errors.push({
          field: `blocks[${i}].url`,
          message: `Blok Gambar #${i + 1} belum memiliki URL atau file gambar.`,
        });
      }
      if (!b.alt || !String(b.alt).trim()) {
        errors.push({
          field: `blocks[${i}].alt`,
          message: `Blok Gambar #${i + 1} wajib memiliki teks alternatif (alt text) untuk aksesibilitas.`,
        });
      }
    }
    if (b.type === "formula" && (!b.expression || !String(b.expression).trim())) {
      errors.push({
        field: `blocks[${i}].expression`,
        message: `Blok Rumus #${i + 1} belum memiliki ekspresi rumus.`,
      });
    }
  }

  if (Array.isArray(lessonData.references)) {
    for (let i = 0; i < lessonData.references.length; i++) {
      const ref = lessonData.references[i];
      if (ref?.url && String(ref.url).trim() !== "") {
        const u = String(ref.url).trim();
        if (!/^https?:\/\//i.test(u)) {
          errors.push({
            field: `references[${i}].url`,
            message: `Tautan referensi "${ref.title || u}" harus diawali dengan http:// atau https://.`,
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
