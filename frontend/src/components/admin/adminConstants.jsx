import React from "react";

/**
 * Konfigurasi 3 Tingkat Kurikulum sesuai design.md §7.1, anti-ai-slop & KF-02
 * Menggunakan palet finansial autentik tanpa emoji atau neon gradients.
 */
export const LEVEL_META = {
  BEGINNER: {
    id: "BEGINNER",
    label: "Pemula",
    fullLabel: "Level 1 • Pemula (Beginner)",
    dotClass: "bg-emerald-500",
    badgeClass:
      "bg-emerald-50 dark:bg-[#062c19]/70 text-emerald-700 dark:text-[#34d399] border border-emerald-200 dark:border-[#0e4429]",
    pillActiveClass:
      "bg-emerald-600 text-white dark:bg-[#062c19] dark:text-[#34d399] dark:border-[#0e4429]",
  },
  INTERMEDIATE: {
    id: "INTERMEDIATE",
    label: "Menengah",
    fullLabel: "Level 2 • Menengah (Intermediate)",
    dotClass: "bg-blue-500",
    badgeClass:
      "bg-blue-50 dark:bg-[#0c2340]/70 text-blue-700 dark:text-[#60a5fa] border border-blue-200 dark:border-[#1e3a8a]",
    pillActiveClass:
      "bg-blue-600 text-white dark:bg-[#0c2340] dark:text-[#60a5fa] dark:border-[#1e3a8a]",
  },
  ADVANCED: {
    id: "ADVANCED",
    label: "Mahir",
    fullLabel: "Level 3 • Mahir (Advanced)",
    dotClass: "bg-rose-500",
    badgeClass:
      "bg-rose-50 dark:bg-[#2a0e12]/70 text-rose-700 dark:text-[#f87171] border border-rose-200 dark:border-[#4c151c]",
    pillActiveClass:
      "bg-rose-600 text-white dark:bg-[#2a0e12] dark:text-[#f87171] dark:border-[#4c151c]",
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${meta.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass} shrink-0`} />
      <span>{showFull ? meta.fullLabel : meta.label}</span>
    </span>
  );
}

/**
 * Penampil pratinjau artikel markdown & kotak formula finansial (design.md §7.2)
 * Desain bersih tanpa glow neon atau border berlebihan.
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
            className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#1a1f2c] border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 font-semibold"
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
              className="p-4 my-3 rounded-xl bg-slate-900 dark:bg-[#080808] border border-slate-700 dark:border-[#272727] flex flex-col items-center justify-center text-center"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Formula Finansial
              </span>
              <pre className="font-mono font-bold text-xs sm:text-sm text-slate-100 tracking-wide whitespace-pre-wrap">
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
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#12151e] border-l-2 border-slate-400 dark:border-slate-600 text-xs text-slate-700 dark:text-slate-300"
                  >
                    {renderInline(line.slice(2))}
                  </blockquote>
                );
              }
              if (line.startsWith("- ") || line.startsWith("* ")) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-slate-400 font-bold mt-0.5">•</span>
                    <span className="flex-1">{renderInline(line.slice(2))}</span>
                  </div>
                );
              }
              if (/^\d+\.\s/.test(line)) {
                const match = line.match(/^(\d+\.)\s+(.*)$/);
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
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
