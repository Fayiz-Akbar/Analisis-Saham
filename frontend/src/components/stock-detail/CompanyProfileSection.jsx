import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";

function formatWebsiteHost(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./i, "");
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0];
  }
}

function splitFirstSentence(text) {
  if (!text || typeof text !== "string") return { lead: "", rest: "" };
  const cleaned = text.trim();
  const match = cleaned.match(
    /^(.+?(?<!\bTbk)(?<!\bPT)(?<!\bInc)(?<!\bLtd)(?<!\bCorp)(?<!\bCo)[.!?])(?:\s+(.*))?$/is
  );
  if (!match) return { lead: cleaned, rest: "" };
  return {
    lead: match[1] || "",
    rest: (match[2] || "").trim(),
  };
}

/**
 * Ringkasan Profil & Bidang Usaha Emiten (Editorial Minimalis)
 */
export default function CompanyProfileSection({
  symbol,
  profile,
  isLoading,
  onRetry,
  error,
}) {
  const [lang, setLang] = useState("id");
  const [isExpanded, setIsExpanded] = useState(false);

  const hasId = Boolean(profile?.summaryId && profile.summaryId.trim());
  const hasEn = Boolean(profile?.summaryEn && profile.summaryEn.trim());
  const hasBilingual = hasId && hasEn;

  const activeSummary =
    lang === "en" && hasEn
      ? profile.summaryEn
      : profile?.summaryId || profile?.summary || profile?.summaryEn || null;

  const { lead, rest } = splitFirstSentence(activeSummary);
  const isLongSummary = Boolean(activeSummary && activeSummary.length > 360);

  const websiteHost = formatWebsiteHost(profile?.website);
  const locationText = [profile?.city, profile?.country]
    .filter((v) => typeof v === "string" && v.trim())
    .join(", ");

  const employeeText = profile?.fullTimeEmployees
    ? `${Number(profile.fullTimeEmployees).toLocaleString("id-ID")}`
    : "-";

  return (
    <section
      aria-label={`Profil Perusahaan ${symbol}`}
      className="pt-6 border-t border-slate-200 dark:border-white/[0.08] space-y-6"
    >
      {/* Baris Top Mini: Eyebrow & Switch Bahasa ID / EN */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Tentang Perusahaan
          </span>

          {hasBilingual && (
            <div
              role="group"
              aria-label="Bahasa deskripsi perusahaan"
              className="inline-flex items-center rounded-lg border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#0c0e14] p-0.5 text-[11px] font-semibold"
            >
              <button
                type="button"
                onClick={() => setLang("id")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  lang === "id"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  lang === "en"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                EN
              </button>
            </div>
          )}
        </div>

        {/* Deskripsi Utama: Kalimat pertama tegas + lanjutan deskripsi muted */}
        {isLoading && !activeSummary ? (
          <div className="space-y-2.5 animate-pulse w-full" aria-label="Memuat deskripsi perusahaan">
            <div className="h-5 bg-slate-200 dark:bg-white/[0.06] rounded w-full" />
            <div className="h-5 bg-slate-200 dark:bg-white/[0.06] rounded w-11/12" />
            <div className="h-5 bg-slate-200 dark:bg-white/[0.06] rounded w-3/4" />
          </div>
        ) : activeSummary ? (
          <div className="space-y-2 w-full">
            <p
              className={`text-base sm:text-xl leading-relaxed tracking-tight ${
                !isExpanded && isLongSummary ? "line-clamp-4" : ""
              }`}
            >
              <span className="font-semibold text-slate-900 dark:text-slate-100">{lead}</span>
              {rest && (
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  {" "}
                  {rest}
                </span>
              )}
            </p>

            {isLongSummary && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="min-h-[30px] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
              >
                {isExpanded ? "Tampilkan ringkas" : "Baca selengkapnya"}
              </button>
            )}
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 space-y-2">
            <p>
              {error
                ? "Gagal memuat deskripsi profil perusahaan dari Yahoo Finance API."
                : `Deskripsi bisnis untuk ${symbol} belum tersedia dari Yahoo Finance API.`}
            </p>
            {error && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-white/[0.1] hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
              >
                Muat Ulang Profil
              </button>
            )}
          </div>
        )}
      </div>

      {/* Baris Bawah: Lokasi, Karyawan, dan Website */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 pt-2">
        <div className="min-w-0">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-200 truncate">
            {locationText || "Indonesia"}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lokasi Kantor Pusat
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight text-slate-900 dark:text-slate-200">
            {employeeText}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Jumlah Karyawan
          </div>
        </div>

        <div className="min-w-0">
          {profile?.website && websiteHost ? (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-200 hover:underline underline-offset-4 max-w-full"
            >
              <span className="truncate">{websiteHost}</span>
              <ArrowUpRight className="w-4 h-4 shrink-0 text-slate-400" aria-hidden="true" />
            </a>
          ) : (
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-400 dark:text-slate-500">
              -
            </div>
          )}
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Website Resmi
          </div>
        </div>
      </div>
    </section>
  );
}
