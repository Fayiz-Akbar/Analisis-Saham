import React, { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Lightbulb,
  Play,
  Sparkles,
  XCircle,
} from "lucide-react";

/**
 * Parser teks inline aman (tanpa dangerouslySetInnerHTML)
 * Mendukung: **tebal**, *miring*, <u>garis bawah</u>, ~~coret~~, `kode`, dan [tautan](https://...)
 */
export function renderRichInlineText(rawText) {
  if (!rawText) return null;
  const text = String(rawText);

  const tokenRegex =
    /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*|<u>[\s\S]*?<\/u>|~~[^~]+~~|`[^`]+`|\*[^*\n]+\*)/g;

  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Hyperlink [label](url)
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (match) {
        return (
          <a
            key={idx}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#e3252f] dark:text-[#f87171] underline underline-offset-4 hover:opacity-80 inline-flex items-center gap-0.5"
          >
            <span>{match[1]}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
      }
    }

    // Bold **...**
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Underline <u>...</u>
    if (part.startsWith("<u>") && part.endsWith("</u>")) {
      return (
        <span key={idx} className="underline underline-offset-4">
          {part.slice(3, -4)}
        </span>
      );
    }

    // Strikethrough ~~...~~
    if (part.startsWith("~~") && part.endsWith("~~") && part.length > 4) {
      return (
        <span key={idx} className="line-through text-slate-400 dark:text-slate-500">
          {part.slice(2, -2)}
        </span>
      );
    }

    // Inline code `...`
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] font-mono text-[12px] text-slate-800 dark:text-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Italic *...*
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={idx} className="italic text-slate-800 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
}

/**
 * Konversi fallback apabila hanya tersedia string Markdown (contentBody)
 */
export function clientParseMarkdownToBlocks(markdown = "") {
  const raw = String(markdown || "").replace(/\r\n/g, "\n").trim();
  if (!raw) return [];

  const blocks = [];
  let idCounter = 1;
  const segments = raw.split(/(```[\s\S]*?```)/g);

  for (const segment of segments) {
    if (!segment.trim()) continue;
    if (segment.startsWith("```") && segment.endsWith("```")) {
      const body = segment
        .replace(/^```[a-zA-Z]*\n?/, "")
        .replace(/```$/, "")
        .trim();
      const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
      blocks.push({
        id: `auto-${idCounter++}`,
        type: "formula",
        title: "Formula Finansial",
        expression: lines[0] || body,
        explanation: lines.slice(1).join(" • ") || "",
      });
      continue;
    }

    const lines = segment.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      if (line.startsWith("### ")) {
        blocks.push({
          id: `auto-${idCounter++}`,
          type: "heading",
          level: 3,
          content: line.slice(4),
        });
      } else if (line.startsWith("## ")) {
        blocks.push({
          id: `auto-${idCounter++}`,
          type: "heading",
          level: 2,
          content: line.slice(3),
        });
      } else if (line.startsWith("# ")) {
        blocks.push({
          id: `auto-${idCounter++}`,
          type: "heading",
          level: 1,
          content: line.slice(2),
        });
      } else if (line.startsWith("> ")) {
        blocks.push({
          id: `auto-${idCounter++}`,
          type: "callout",
          variant: "note",
          title: "Catatan Penting",
          content: line.slice(2).replace(/^\*\*[^*]+\*\*:\s*/, ""),
        });
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        blocks.push({
          id: `auto-${idCounter++}`,
          type: "list",
          ordered: false,
          items: [line.slice(2)],
        });
      } else if (/^\d+\.\s+/.test(line)) {
        blocks.push({
          id: `auto-${idCounter++}`,
          type: "list",
          ordered: true,
          items: [line.replace(/^\d+\.\s+/, "")],
        });
      } else {
        blocks.push({
          id: `auto-${idCounter++}`,
          type: "paragraph",
          content: line,
        });
      }
    }
  }

  return blocks;
}

const CALLOUT_STYLES = {
  info: {
    icon: Info,
    label: "Informasi Penting",
    container:
      "bg-slate-50 dark:bg-[#121318] border-slate-200 dark:border-[#262936] border-l-4 border-l-slate-700 dark:border-l-slate-300",
    titleColor: "text-slate-900 dark:text-slate-100",
  },
  note: {
    icon: BookOpen,
    label: "Catatan",
    container:
      "bg-slate-50 dark:bg-[#121212] border-slate-200 dark:border-[#262626] border-l-4 border-l-slate-500",
    titleColor: "text-slate-900 dark:text-slate-100",
  },
  tip: {
    icon: Lightbulb,
    label: "Tips Praktis",
    container:
      "bg-emerald-50/50 dark:bg-[#071f14]/60 border-emerald-200/80 dark:border-[#123d28] border-l-4 border-l-emerald-600 dark:border-l-[#34d399]",
    titleColor: "text-emerald-900 dark:text-[#34d399]",
  },
  warning: {
    icon: AlertTriangle,
    label: "Peringatan Risiko",
    container:
      "bg-rose-50/60 dark:bg-[#220c10]/70 border-rose-200/80 dark:border-[#49171e] border-l-4 border-l-[#e3252f]",
    titleColor: "text-rose-900 dark:text-[#f87171]",
  },
  concept: {
    icon: Sparkles,
    label: "Konsep Penting",
    container:
      "bg-slate-50 dark:bg-[#141113] border-slate-200 dark:border-[#2e2225] border-l-4 border-l-[#e3252f]",
    titleColor: "text-slate-900 dark:text-white",
  },
  summary: {
    icon: CheckCircle2,
    label: "Kesimpulan Materi",
    container:
      "bg-slate-100/80 dark:bg-[#141414] border-slate-300 dark:border-[#2a2a2a] border-l-4 border-l-slate-900 dark:border-l-white",
    titleColor: "text-slate-900 dark:text-white",
  },
};

function CodeBlockRenderer({ block }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(block.code || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-[#262626] bg-slate-950 text-slate-100">
      <div className="px-4 py-2 bg-slate-900 dark:bg-[#141414] border-b border-slate-800 dark:border-[#242424] flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono uppercase tracking-wider text-[11px]">
          {block.language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Salin Kode</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed">
        <code>{block.code}</code>
      </pre>
      {block.caption && (
        <div className="px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400">
          {block.caption}
        </div>
      )}
    </div>
  );
}

function InteractiveQuizBlockRenderer({ block }) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [shortInput, setShortInput] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const qType = block.questionType || "multiple_choice";
  const userValue = qType === "short_answer" ? shortInput.trim() : selectedAnswer;
  const expectedKey =
    block.correctAnswer ||
    block.correctAnswerText ||
    (block.correctOptionIndex !== undefined
      ? ["A", "B", "C", "D"][Number(block.correctOptionIndex)] || "A"
      : "A");
  const isCorrect =
    qType === "short_answer"
      ? userValue.toLowerCase() === String(expectedKey).trim().toLowerCase()
      : userValue.toUpperCase() === String(expectedKey).trim().toUpperCase();

  const options =
    qType === "true_false"
      ? [
          { key: "BENAR", text: "Benar" },
          { key: "SALAH", text: "Salah" },
        ]
      : Array.isArray(block.options) && block.options.length > 0
        ? block.options.map((opt, idx) =>
            typeof opt === "string"
              ? { key: ["A", "B", "C", "D"][idx] || String(idx + 1), text: opt }
              : {
                  key: opt?.key || ["A", "B", "C", "D"][idx] || String(idx + 1),
                  text: opt?.text || "",
                }
          )
        : [
            { key: "A", text: "Pilihan A" },
            { key: "B", text: "Pilihan B" },
            { key: "C", text: "Pilihan C" },
            { key: "D", text: "Pilihan D" },
          ];

  return (
    <div className="my-5 p-5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#262626] space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
          <HelpCircle className="w-4 h-4 text-[#e3252f]" />
          <span>Uji Pemahaman Singkat</span>
        </div>
        {block.indicatorConcept && (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] text-slate-600 dark:text-slate-400">
            {block.indicatorConcept}
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
        {renderRichInlineText(block.question)}
      </p>

      {qType === "short_answer" ? (
        <div>
          <input
            type="text"
            disabled={isSubmitted}
            value={shortInput}
            onChange={(e) => setShortInput(e.target.value)}
            placeholder="Ketik jawaban singkat Anda..."
            className="w-full h-10 px-3.5 rounded-lg text-sm bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#2a2a2a] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {options.map((opt) => {
            const active = selectedAnswer === opt.key;
            const isRightOption =
              String(opt.key).toUpperCase() ===
              String(block.correctAnswer || "A").toUpperCase();

            let styleClass =
              "bg-white dark:bg-[#0b0b0b] border-slate-200 dark:border-[#262626] text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600";

            if (!isSubmitted && active) {
              styleClass =
                "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white font-medium";
            } else if (isSubmitted) {
              if (isRightOption) {
                styleClass =
                  "bg-emerald-50 dark:bg-[#062c19]/70 border-emerald-400 dark:border-[#10b981] text-emerald-900 dark:text-[#34d399] font-medium";
              } else if (active && !isRightOption) {
                styleClass =
                  "bg-rose-50 dark:bg-[#2a0e12]/70 border-rose-400 dark:border-[#f87171] text-rose-900 dark:text-[#f87171]";
              }
            }

            return (
              <button
                key={opt.key}
                type="button"
                disabled={isSubmitted}
                onClick={() => setSelectedAnswer(opt.key)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-left text-xs sm:text-sm flex items-center justify-between gap-3 transition-colors cursor-pointer ${styleClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold opacity-80">{opt.key}.</span>
                  <span>{opt.text}</span>
                </div>
                {isSubmitted && isRightOption && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
                {isSubmitted && active && !isRightOption && (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        {!isSubmitted ? (
          <button
            type="button"
            disabled={!userValue}
            onClick={() => setIsSubmitted(true)}
            className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 disabled:opacity-40 cursor-pointer"
          >
            Periksa Jawaban
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setSelectedAnswer("");
              setShortInput("");
            }}
            className="h-8 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#2a2a2a] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1a1a] cursor-pointer"
          >
            Coba Lagi
          </button>
        )}
      </div>

      {isSubmitted && (
        <div
          className={`p-3.5 rounded-lg border text-xs sm:text-sm leading-relaxed ${
            isCorrect
              ? "bg-emerald-50/70 dark:bg-[#062c19]/50 border-emerald-200 dark:border-[#0e4429] text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50/70 dark:bg-[#2a0e12]/50 border-rose-200 dark:border-[#4c151c] text-rose-900 dark:text-rose-200"
          }`}
        >
          <div className="font-semibold mb-1">
            {isCorrect
              ? "Jawaban Anda Tepat!"
              : `Kurang Tepat — Kunci Jawaban: ${block.correctAnswer}`}
          </div>
          {block.explanation && <p>{renderRichInlineText(block.explanation)}</p>}
        </div>
      )}
    </div>
  );
}

function AccordionBlockRenderer({ block }) {
  const [openIds, setOpenIds] = useState(() => {
    const first = block.items?.[0]?.id;
    return first ? { [first]: true } : {};
  });

  const toggleItem = (id) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="my-4 rounded-xl border border-slate-200 dark:border-[#262626] overflow-hidden divide-y divide-slate-200 dark:divide-[#262626]">
      {block.title && (
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#141414] text-xs font-semibold text-slate-700 dark:text-slate-300">
          {block.title}
        </div>
      )}
      {(block.items || []).map((item, idx) => {
        const itemId = item.id || `acc-${idx}`;
        const isOpen = Boolean(openIds[itemId]);
        return (
          <div key={itemId} className="bg-white dark:bg-[#0d0d0d]">
            <button
              type="button"
              onClick={() => toggleItem(itemId)}
              className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
            >
              <span>{item.title}</span>
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </button>
            {isOpen && (
              <div className="px-4 pb-3.5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-[#1c1c1c]">
                {renderRichInlineText(item.content)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Komponen Utama Renderer Materi Terstruktur
 * Digunakan bersama oleh Halaman Belajar Pengguna & Live Preview di Learning Content Studio Admin.
 */
export default function StructuredLessonRenderer({
  contentBlocks,
  blocks: blocksProp,
  contentBody = "",
  onSelectRelatedSlug,
}) {
  const rawInput = contentBlocks ?? blocksProp;
  const blocks =
    Array.isArray(rawInput?.blocks) && rawInput.blocks.length > 0
      ? rawInput.blocks
      : Array.isArray(rawInput) && rawInput.length > 0
        ? rawInput
        : clientParseMarkdownToBlocks(contentBody);

  if (!blocks || blocks.length === 0) {
    return (
      <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-[#262626] text-center text-xs text-slate-400">
        Belum ada blok konten pada materi ini.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
      {blocks.map((block, index) => {
        const key = block.id || `block-${index}`;
        const alignVal = block.alignment || block.align || "left";
        const alignClass =
          alignVal === "center"
            ? "text-center"
            : alignVal === "right"
              ? "text-right"
              : alignVal === "justify"
                ? "text-justify"
                : "text-left";
        const textBody = block.content || block.text || "";

        switch (block.type) {
          case "heading": {
            const level = Number(block.level) || 2;
            if (level === 1) {
              return (
                <h2
                  key={key}
                  id={key}
                  className={`text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white pt-4 pb-1 ${alignClass}`}
                >
                  {renderRichInlineText(textBody)}
                </h2>
              );
            }
            if (level === 3) {
              return (
                <h4
                  key={key}
                  id={key}
                  className={`text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 pt-3 ${alignClass}`}
                >
                  {renderRichInlineText(textBody)}
                </h4>
              );
            }
            return (
              <h3
                key={key}
                id={key}
                className={`text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-white pt-4 pb-1.5 border-b border-slate-200/80 dark:border-[#222222] ${alignClass}`}
              >
                {renderRichInlineText(textBody)}
              </h3>
            );
          }

          case "paragraph":
            return (
              <p key={key} className={`leading-7 text-slate-700 dark:text-slate-300 ${alignClass}`}>
                {renderRichInlineText(textBody)}
              </p>
            );

          case "list": {
            const items = Array.isArray(block.items) ? block.items : [];
            const isOrdered = block.ordered || block.style === "ordered";
            if (isOrdered) {
              return (
                <ol key={key} className="space-y-2 pl-1 my-2">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{renderRichInlineText(item)}</span>
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={key} className="space-y-2 pl-2 my-2">
                {items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e3252f] mt-2.5 shrink-0" />
                    <span className="flex-1 leading-relaxed">{renderRichInlineText(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }

          case "callout": {
            const meta = CALLOUT_STYLES[block.variant] || CALLOUT_STYLES.info;
            const Icon = meta.icon;
            return (
              <div
                key={key}
                className={`my-4 p-4 rounded-xl border ${meta.container} space-y-1.5`}
              >
                <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${meta.titleColor}`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{block.title || meta.label}</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                  {renderRichInlineText(textBody)}
                </div>
              </div>
            );
          }

          case "formula":
            return (
              <div
                key={key}
                className="my-5 p-5 rounded-xl bg-slate-900 dark:bg-[#0d0d0d] border border-slate-800 dark:border-[#262626] text-slate-100 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    {block.title || "Rumus Perhitungan"}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950 dark:bg-[#060606] border border-slate-800/80 dark:border-[#1e1e1e] text-center overflow-x-auto">
                  <pre className="font-mono font-semibold text-xs sm:text-sm text-white tracking-wide whitespace-pre-wrap">
                    {block.expression || block.content}
                  </pre>
                </div>
                {block.explanation && (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {renderRichInlineText(block.explanation)}
                  </p>
                )}
                {Array.isArray(block.variables) && block.variables.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {block.variables.map((v, vIdx) => (
                      <div key={vIdx} className="flex items-baseline gap-2">
                        <code className="font-mono font-bold text-[#f87171]">{v.symbol}</code>
                        <span className="text-slate-400">: {v.meaning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );

          case "table": {
            const headers = Array.isArray(block.headers) ? block.headers : [];
            const rows = Array.isArray(block.rows) ? block.rows : [];
            return (
              <div key={key} className="my-5 space-y-2">
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#262626]">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    {block.hasHeader !== false && headers.length > 0 && (
                      <thead>
                        <tr className="bg-slate-50 dark:bg-[#141414] border-b border-slate-200 dark:border-[#262626] text-slate-700 dark:text-slate-200 font-semibold">
                          {headers.map((h, hIdx) => (
                            <th key={hIdx} className="py-3 px-4">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody className="divide-y divide-slate-200/80 dark:divide-[#202020] bg-white dark:bg-[#0b0b0b]">
                      {rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                        >
                          {(Array.isArray(row) ? row : []).map((cell, cIdx) => (
                            <td key={cIdx} className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                              {renderRichInlineText(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {block.caption && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    {block.caption}
                  </p>
                )}
              </div>
            );
          }

          case "image": {
            const sizeWidth =
              block.size === "sm"
                ? "max-w-xs"
                : block.size === "md"
                  ? "max-w-md"
                  : block.size === "full"
                    ? "w-full"
                    : "max-w-2xl";
            const alignWrap =
              block.alignment === "left"
                ? "mr-auto"
                : block.alignment === "right"
                  ? "ml-auto"
                  : "mx-auto";

            if (!block.url) return null;
            return (
              <figure key={key} className={`my-5 ${sizeWidth} ${alignWrap} space-y-2`}>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#262626] bg-slate-100 dark:bg-[#121212]">
                  <img
                    src={block.url}
                    alt={block.alt || block.caption || "Ilustrasi materi"}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case "video": {
            if (!block.url) return null;
            const ytMatch = String(block.url).match(
              /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/
            );
            return (
              <div
                key={key}
                className="my-5 rounded-xl overflow-hidden border border-slate-200 dark:border-[#262626] bg-slate-950"
              >
                {ytMatch ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                      title={block.title || "Video Pembelajaran"}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="p-4 flex items-center justify-between gap-3 bg-slate-900 text-slate-100">
                    <div className="flex items-center gap-3">
                      <Play className="w-5 h-5 text-[#e3252f]" />
                      <div>
                        <div className="text-xs font-semibold">
                          {block.title || "Video Pembelajaran"}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-md">
                          {block.url}
                        </div>
                      </div>
                    </div>
                    <a
                      href={block.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-900"
                    >
                      Buka Video
                    </a>
                  </div>
                )}
                {block.caption && (
                  <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-800">
                    {block.caption}
                  </div>
                )}
              </div>
            );
          }

          case "attachment":
            return (
              <div
                key={key}
                className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-[#262626] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {block.fileName || block.title || "Dokumen Lampiran"}
                    </div>
                    {block.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {block.description}
                      </p>
                    )}
                  </div>
                </div>
                {block.url && (
                  <a
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 shrink-0"
                  >
                    <span>Unduh</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            );

          case "code":
            return <CodeBlockRenderer key={key} block={block} />;

          case "quote":
            return (
              <blockquote
                key={key}
                className="my-4 pl-4 py-2 border-l-2 border-slate-900 dark:border-slate-200 italic text-slate-800 dark:text-slate-200 space-y-1"
              >
                <p>&ldquo;{renderRichInlineText(textBody)}&rdquo;</p>
                {block.author && (
                  <footer className="text-xs not-italic font-medium text-slate-500 dark:text-slate-400">
                    — {block.author}
                    {block.role ? `, ${block.role}` : ""}
                  </footer>
                )}
              </blockquote>
            );

          case "interactive_quiz":
            return <InteractiveQuizBlockRenderer key={key} block={block} />;

          case "accordion":
            return <AccordionBlockRenderer key={key} block={block} />;

          case "steps":
            return (
              <div
                key={key}
                className="my-5 p-5 rounded-xl bg-slate-50/70 dark:bg-[#101010] border border-slate-200 dark:border-[#242424] space-y-4"
              >
                {block.title && (
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    {block.title}
                  </h4>
                )}
                <div className="space-y-3">
                  {(block.steps || []).map((st, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-3.5">
                      <div className="w-6 h-6 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {sIdx + 1}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {st.title}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {renderRichInlineText(st.description)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "divider":
            return block.style === "dots" ? (
              <div key={key} className="py-4 text-center text-slate-400 tracking-[0.5em]">
                •••
              </div>
            ) : (
              <hr key={key} className="my-6 border-slate-200 dark:border-[#242424]" />
            );

          case "related":
            return (
              <div
                key={key}
                className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-[#242424] space-y-2.5"
              >
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {block.title || "Materi Terkait"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(block.items || []).map((it, iIdx) => (
                    <button
                      key={iIdx}
                      type="button"
                      onClick={() => onSelectRelatedSlug && it.slug && onSelectRelatedSlug(it.slug)}
                      className="p-3 rounded-lg bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#272727] hover:border-slate-400 text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {it.title}
                      </div>
                      {it.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {it.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
