import React from "react";

/**
 * Konfigurasi 3 Tingkat Kurikulum sesuai design.md §7.1 & KF-02
 */
export const LEVEL_META = {
  BEGINNER: {
    id: "BEGINNER",
    label: "Pemula",
    fullLabel: "Level 1 • Pemula (Beginner)",
    dot: "🟢",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
    pillActiveClass:
      "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
  },
  INTERMEDIATE: {
    id: "INTERMEDIATE",
    label: "Menengah",
    fullLabel: "Level 2 • Menengah (Intermediate)",
    dot: "🟡",
    badgeClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25",
    pillActiveClass:
      "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40",
  },
  ADVANCED: {
    id: "ADVANCED",
    label: "Mahir",
    fullLabel: "Level 3 • Mahir (Advanced)",
    dot: "🔴",
    badgeClass:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25",
    pillActiveClass:
      "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40",
  },
};

export const toSlugClient = (text) =>
  String(text || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200)
    .replace(/-+$/g, "");

export function LevelBadge({ level, showFull = false }) {
  const meta = LEVEL_META[level] || LEVEL_META.BEGINNER;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${meta.badgeClass}`}
    >
      <span>{meta.dot}</span>
      <span>{showFull ? meta.fullLabel : meta.label}</span>
    </span>
  );
}

/**
 * Penampil pratinjau artikel markdown & kotak formula finansial (design.md §7.2)
 */
export function MarkdownArticlePreview({ content }) {
  if (!content || !content.trim()) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 italic">
        Belum ada isi materi untuk ditampilkan pada pratinjau.
      </div>
    );
  }

  // Pisahkan blok kode/rumus ``` ... ``` dari paragraf biasa
  const segments = content.split(/(```[\s\S]*?```)/g);

  const renderInline = (line) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 font-mono text-[12px] text-indigo-600 dark:text-indigo-300 font-bold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      {segments.map((segment, idx) => {
        if (segment.startsWith("```") && segment.endsWith("```")) {
          const formulaLines = segment
            .replace(/^```[a-zA-Z]*\n?/, "")
            .replace(/```$/, "")
            .trim();
          return (
            <div
              key={idx}
              className="p-4 my-3 rounded-2xl bg-slate-900 dark:bg-[#12151e] border border-indigo-500/30 shadow-inner flex flex-col items-center justify-center text-center"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1.5">
                Formula / Kaidah Finansial
              </span>
              <pre className="font-mono font-bold text-xs sm:text-sm text-white tracking-wide whitespace-pre-wrap">
                {formulaLines}
              </pre>
            </div>
          );
        }

        const lines = segment.split("\n");
        return (
          <div key={idx} className="space-y-2">
            {lines.map((rawLine, lineIdx) => {
              const line = rawLine.trim();
              if (!line) return null;

              if (line.startsWith("### ")) {
                return (
                  <h4
                    key={lineIdx}
                    className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white pt-2"
                  >
                    {line.slice(4)}
                  </h4>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h3
                    key={lineIdx}
                    className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white pt-2 border-b border-slate-200 dark:border-slate-800 pb-1"
                  >
                    {line.slice(3)}
                  </h3>
                );
              }
              if (line.startsWith("> ")) {
                return (
                  <blockquote
                    key={lineIdx}
                    className="p-3 rounded-xl bg-indigo-500/10 border-l-4 border-indigo-500 text-xs text-slate-700 dark:text-slate-200"
                  >
                    {renderInline(line.slice(2))}
                  </blockquote>
                );
              }
              if (line.startsWith("- ") || line.startsWith("* ")) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span className="flex-1">{renderInline(line.slice(2))}</span>
                  </div>
                );
              }
              if (/^\d+\.\s/.test(line)) {
                const match = line.match(/^(\d+\.)\s+(.*)$/);
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="font-mono font-bold text-indigo-500 dark:text-indigo-400">
                      {match[1]}
                    </span>
                    <span className="flex-1">{renderInline(match[2])}</span>
                  </div>
                );
              }

              return <p key={lineIdx}>{renderInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

