/**
 * Utilitas pembersih teks konten edukasi.
 *
 * Konten materi disimpan dalam format teks/markdown. Karakter seperti "<" atau ">"
 * tetap diperbolehkan (contoh: "PER < 15x"), namun blok tag HTML berbahaya
 * (script, style, iframe, object, embed) serta atribut event handler dan
 * protokol javascript: dihapus untuk mencegah XSS (api.md §7 Validation Standard).
 */

const DANGEROUS_BLOCK_TAGS = /<\s*(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const DANGEROUS_SINGLE_TAGS = /<\s*\/?\s*(script|style|iframe|object|embed|link|meta)\b[^>]*>/gi;
const EVENT_HANDLER_ATTR = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_PROTOCOL = /javascript\s*:/gi;

export const sanitizeText = (value) => {
  if (typeof value !== "string") return value;
  return value
    .replace(DANGEROUS_BLOCK_TAGS, "")
    .replace(DANGEROUS_SINGLE_TAGS, "")
    .replace(EVENT_HANDLER_ATTR, "")
    .replace(JS_PROTOCOL, "")
    .trim();
};

/**
 * Membuat slug URL-friendly dari judul (mendukung huruf beraksen latin).
 * Contoh: "Return on Equity (ROE) & Profitabilitas" -> "return-on-equity-roe-profitabilitas"
 */
export const slugify = (text) =>
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

