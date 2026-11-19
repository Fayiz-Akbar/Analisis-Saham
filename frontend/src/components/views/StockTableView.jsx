import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleX,
  ExternalLink,
  Filter,
  HelpCircle,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/watchlist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ADVANCED_INDICATOR_FIELDS,
  CORE_RATIO_FIELDS,
  DEFAULT_SECTOR_ORDER,
  INITIAL_FILTER_STATE,
  PAGE_SIZE,
  QUICK_PRESETS,
  SCREENER_CATEGORY_TABS,
  SECTOR_LABELS_ID,
  buildScreenerQueryString,
  getRatioSummaryLabel,
  mergePresetsPatch,
  resolveStockMetric,
} from "./screenerConfig";

function RatioTooltipButton({ label, text }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Penjelasan ${label}`}
          title={text}
          className="inline-flex items-center justify-center w-6 h-6 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-64 p-3 text-xs leading-relaxed">
        <div className="font-semibold text-foreground mb-1">{label}</div>
        <p className="text-muted-foreground">{text}</p>
      </PopoverContent>
    </Popover>
  );
}

function RatioCriteriaControl({ field, appliedFilters, onApplyPatch, fullWidth = false }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(field.defaultMode || "lt");
  const [singleVal, setSingleVal] = useState("");
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");

  const curMin = String(appliedFilters?.[field.minKey] ?? "").trim();
  const curMax = String(appliedFilters?.[field.maxKey] ?? "").trim();
  const summary = getRatioSummaryLabel(field, appliedFilters);
  const isActive = curMin !== "" || curMax !== "";

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) {
      if (curMin && curMax) {
        setMode("between");
        setFromVal(curMin);
        setToVal(curMax);
        setSingleVal("");
      } else if (curMax) {
        setMode("lt");
        setSingleVal(curMax);
        setFromVal("");
        setToVal("");
      } else if (curMin) {
        setMode("gt");
        setSingleVal(curMin);
        setFromVal("");
        setToVal("");
      } else {
        setMode(field.defaultMode || "lt");
        setSingleVal("");
        setFromVal("");
        setToVal("");
      }
    }
    setOpen(nextOpen);
  };

  const handleApplyCustom = () => {
    const clean = (v) => String(v ?? "").trim().replace(",", ".");
    if (mode === "lt") {
      onApplyPatch({ [field.minKey]: "", [field.maxKey]: clean(singleVal) });
    } else if (mode === "gt") {
      onApplyPatch({ [field.minKey]: clean(singleVal), [field.maxKey]: "" });
    } else {
      onApplyPatch({ [field.minKey]: clean(fromVal), [field.maxKey]: clean(toVal) });
    }
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyCustom();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-9 px-2.5 rounded-xl border inline-flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer min-w-0",
            fullWidth ? "w-full" : "w-full lg:w-auto",
            isActive
              ? "border-zinc-900 dark:border-white/40 bg-zinc-100/90 dark:bg-white/[0.08] text-zinc-900 dark:text-white"
              : "border-zinc-200 dark:border-white/[0.1] bg-zinc-50/70 dark:bg-black/30 text-zinc-700 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-white/25"
          )}
        >
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
              {field.shortLabel}:
            </span>
            <span
              className={cn(
                "truncate",
                isActive ? "font-mono font-bold text-zinc-900 dark:text-white" : "font-medium"
              )}
            >
              {summary}
            </span>
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[min(310px,calc(100vw-24px))] p-3 space-y-3 bg-white dark:bg-[#12141c] border-zinc-200 dark:border-white/[0.12] text-zinc-900 dark:text-zinc-100"
      >
        <div className="space-y-1">
          <div className="text-xs font-bold text-zinc-900 dark:text-white">{field.label}</div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {field.tooltip}
          </p>
        </div>

        {/* Pilihan Cepat */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
            Pilihan Cepat
          </span>
          <div className="flex flex-wrap gap-1.5">
            {field.options.map((opt) => {
              const optSelected =
                String(opt.patch[field.minKey] ?? "") === curMin &&
                String(opt.patch[field.maxKey] ?? "") === curMax;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onApplyPatch(opt.patch);
                    setOpen(false);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer",
                    optSelected
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white"
                      : "bg-zinc-50 dark:bg-black/30 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.1] hover:border-zinc-400"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Atur Angka Sendiri */}
        <div className="pt-2.5 border-t border-zinc-200 dark:border-white/[0.08] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
            Atur Angka Sendiri
          </span>

          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "lt", label: "Di bawah (<)" },
              { id: "gt", label: "Di atas (>)" },
              { id: "between", label: "Antara" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={cn(
                  "h-7 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer",
                  mode === item.id
                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white"
                    : "bg-zinc-50 dark:bg-black/30 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.08]"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {mode === "between" ? (
            <div className="grid grid-cols-2 gap-1.5">
              <div className="relative">
                <Input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={fromVal}
                  onChange={(e) => setFromVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Dari"
                  aria-label={`${field.shortLabel} dari`}
                  className="h-8 px-2.5 pr-6 text-xs font-mono bg-zinc-50 dark:bg-black/40 border-zinc-200 dark:border-white/[0.1]"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400">
                  {field.unit}
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={toVal}
                  onChange={(e) => setToVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Sampai"
                  aria-label={`${field.shortLabel} sampai`}
                  className="h-8 px-2.5 pr-6 text-xs font-mono bg-zinc-50 dark:bg-black/40 border-zinc-200 dark:border-white/[0.1]"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400">
                  {field.unit}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Input
                type="number"
                step="any"
                inputMode="decimal"
                value={singleVal}
                onChange={(e) => setSingleVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Masukkan angka (cth: ${field.placeholderNumber})`}
                aria-label={`Nilai kustom ${field.shortLabel}`}
                className="h-8 px-2.5 pr-7 text-xs font-mono bg-zinc-50 dark:bg-black/40 border-zinc-200 dark:border-white/[0.1]"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400">
                {field.unit}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onApplyPatch({ [field.minKey]: "", [field.maxKey]: "" });
                setOpen(false);
              }}
              className="h-8 text-[11px] font-semibold bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1] cursor-pointer"
            >
              Kosongkan
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApplyCustom}
              className="h-8 text-[11px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer"
            >
              Terapkan
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function StockTableView({
  initialSector = "ALL",
  onSelectStock,
  onCompareStocks,
}) {
  const componentId = useId();
  const searchInputRef = useRef(null);
  const advancedSectionRef = useRef(null);

  const initialFilterFromProp = useMemo(() => {
    const cleanSector =
      initialSector && String(initialSector).toUpperCase() !== "ALL" ? [initialSector] : [];
    return { ...INITIAL_FILTER_STATE, sectors: cleanSector };
  }, [initialSector]);

  const [activeCategoryTab, setActiveCategoryTab] = useState("ikhtisar");
  const [draftFilters, setDraftFilters] = useState(initialFilterFromProp);
  const [appliedFilters, setAppliedFilters] = useState(initialFilterFromProp);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePresetIds, setActivePresetIds] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const [stocks, setStocks] = useState([]);
  const [sectorOptions, setSectorOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [sortBy, setSortBy] = useState("marketCap");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const [compareSymbols, setCompareSymbols] = useState([]);
  const { watchlistSymbols, toggleWatchlist: toggleWatchlistBySymbol } = useWatchlist();

  useEffect(() => {
    let isMounted = true;
    const qs = buildScreenerQueryString(appliedFilters, "marketCap", "desc");

    fetch(`http://localhost:5000/api/stocks/screener?${qs}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && json.data) {
          setStocks(Array.isArray(json.data.items) ? json.data.items : []);
          if (Array.isArray(json.data.sectors)) {
            setSectorOptions(json.data.sectors);
          }
          setFetchError(null);
        } else {
          setFetchError(json.message || "Gagal memuat data screener saham.");
        }
      })
      .catch((err) => {
        console.warn("Gagal menjalankan filter screener:", err);
        if (isMounted) {
          setFetchError("Tidak dapat terhubung ke server screener. Pastikan backend aktif.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [appliedFilters]);

  const orderedSectorOptions = useMemo(() => {
    const countMap = new Map(sectorOptions.map((s) => [s.sector, s.count]));
    const keys =
      sectorOptions.length > 0
        ? [
            ...new Set([
              ...DEFAULT_SECTOR_ORDER.filter((s) => countMap.has(s)),
              ...sectorOptions.map((s) => s.sector),
            ]),
          ]
        : DEFAULT_SECTOR_ORDER;

    return keys.map((sector) => ({
      sector,
      label: SECTOR_LABELS_ID[sector] || sector,
      count: countMap.get(sector) ?? null,
    }));
  }, [sectorOptions]);

  const activeTabConfig = useMemo(
    () =>
      SCREENER_CATEGORY_TABS.find((t) => t.id === activeCategoryTab) ||
      SCREENER_CATEGORY_TABS[0],
    [activeCategoryTab]
  );

  const activeExtraColumns = useMemo(() => {
    const shownIds = new Set(activeTabConfig.columns.map((c) => c.id));
    return ADVANCED_INDICATOR_FIELDS.filter(
      (f) =>
        !shownIds.has(f.dbField) &&
        (String(appliedFilters[f.minKey] ?? "").trim() !== "" ||
          String(appliedFilters[f.maxKey] ?? "").trim() !== "")
    );
  }, [activeTabConfig, appliedFilters]);

  const desktopExtraColumns = useMemo(() => {
    const fixedDesktopCols = new Set(["marketCap", "price", "changePercent"]);
    return activeExtraColumns.filter((f) => !fixedDesktopCols.has(f.dbField));
  }, [activeExtraColumns]);

  const activeAdvancedCount = useMemo(() => {
    return ADVANCED_INDICATOR_FIELDS.filter(
      (f) =>
        String(appliedFilters[f.minKey] ?? "").trim() !== "" ||
        String(appliedFilters[f.maxKey] ?? "").trim() !== ""
    ).length;
  }, [appliedFilters]);

  const activeFilterCount = useMemo(() => {
    const ratioCount = [...CORE_RATIO_FIELDS, ...ADVANCED_INDICATOR_FIELDS].filter(
      (f) =>
        String(appliedFilters[f.minKey] ?? "").trim() !== "" ||
        String(appliedFilters[f.maxKey] ?? "").trim() !== ""
    ).length;
    return appliedFilters.sectors.length + ratioCount;
  }, [appliedFilters]);

  const handleApplyPatchImmediate = (patch) => {
    const next = { ...appliedFilters, ...patch };
    setIsLoading(true);
    setFetchError(null);
    setActivePresetIds([]);
    setDraftFilters(next);
    setAppliedFilters(next);
    setCurrentPage(1);
  };

  const handleToggleDraftSector = (sectorName) => {
    setDraftFilters((prev) => {
      const exists = prev.sectors.includes(sectorName);
      return {
        ...prev,
        sectors: exists
          ? prev.sectors.filter((s) => s !== sectorName)
          : [...prev.sectors, sectorName],
      };
    });
  };

  // Klik pill sektor langsung memfilter secara instan dan mendukung pilihan multi-sektor
  const handleSelectSectorPill = (sectorName) => {
    setIsLoading(true);
    setFetchError(null);
    setCurrentPage(1);

    if (sectorName === "ALL") {
      setDraftFilters((prev) => ({ ...prev, sectors: [] }));
      setAppliedFilters((prev) => ({ ...prev, sectors: [] }));
      return;
    }

    const exists = draftFilters.sectors.includes(sectorName);
    const nextSectors = exists
      ? draftFilters.sectors.filter((s) => s !== sectorName)
      : [...draftFilters.sectors, sectorName];

    setDraftFilters((prev) => ({ ...prev, sectors: nextSectors }));
    setAppliedFilters((prev) => ({ ...prev, sectors: nextSectors }));
  };

  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setFetchError(null);
    setCurrentPage(1);
    setAppliedFilters({ ...draftFilters });
  };

  const handleResetAll = () => {
    const empty = { ...INITIAL_FILTER_STATE, sectors: [] };
    setIsLoading(true);
    setFetchError(null);
    setDraftFilters(empty);
    setAppliedFilters(empty);
    setSearchQuery("");
    setActivePresetIds([]);
    setCurrentPage(1);
  };

  const handleTogglePreset = (preset, { applyImmediate = true } = {}) => {
    const exists = activePresetIds.includes(preset.id);
    const nextIds = exists
      ? activePresetIds.filter((id) => id !== preset.id)
      : [...activePresetIds, preset.id];
    const combinedPatch = mergePresetsPatch(nextIds);
    const baseSectors = applyImmediate ? appliedFilters.sectors : draftFilters.sectors;
    const next = {
      ...INITIAL_FILTER_STATE,
      sectors: [...baseSectors],
      ...combinedPatch,
    };
    setActivePresetIds(nextIds);
    setDraftFilters(next);
    if (applyImmediate) {
      setIsLoading(true);
      setFetchError(null);
      setAppliedFilters(next);
      setCurrentPage(1);
    }
  };

  // Pencarian cepat + Sorting kolom angka dengan penempatan nilai kosong (null) di akhir
  const displayedStocks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? stocks.filter(
          (s) =>
            s.symbol.toLowerCase().includes(q) ||
            (s.companyName || "").toLowerCase().includes(q) ||
            (s.sector || "").toLowerCase().includes(q)
        )
      : [...stocks];

    list.sort((a, b) => {
      if (sortBy === "symbol") {
        return sortOrder === "asc"
          ? a.symbol.localeCompare(b.symbol)
          : b.symbol.localeCompare(a.symbol);
      }
      if (sortBy === "sector") {
        const cmp = (a.sector || "").localeCompare(b.sector || "");
        return sortOrder === "asc" ? cmp : -cmp;
      }

      const valA = resolveStockMetric(a, sortBy).raw;
      const valB = resolveStockMetric(b, sortBy).raw;
      if (valA === null && valB === null) return a.symbol.localeCompare(b.symbol);
      if (valA === null) return 1;
      if (valB === null) return -1;
      if (valA === valB) return a.symbol.localeCompare(b.symbol);
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    return list;
  }, [stocks, searchQuery, sortBy, sortOrder]);

  const totalMatched = displayedStocks.length;
  const totalPages = Math.max(1, Math.ceil(totalMatched / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const pageStartIdx = (safePage - 1) * PAGE_SIZE;

  const paginatedStocks = useMemo(
    () => displayedStocks.slice(pageStartIdx, pageStartIdx + PAGE_SIZE),
    [displayedStocks, pageStartIdx]
  );

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, safePage - 1, safePage, safePage + 1]);
    return Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }, [totalPages, safePage]);

  const goToPage = (page) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(clamped);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSort = (field) => {
    if (!field) return;
    setCurrentPage(1);
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const renderSortIcon = (field) => {
    if (!field) return null;
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-65 shrink-0" aria-hidden="true" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 text-zinc-900 dark:text-white shrink-0" aria-hidden="true" />
    ) : (
      <ArrowDown className="w-3 h-3 text-zinc-900 dark:text-white shrink-0" aria-hidden="true" />
    );
  };

  const handleToggleCompare = (e, symbol) => {
    if (e) e.stopPropagation();
    const sym = String(symbol).toUpperCase();
    setCompareSymbols((prev) => {
      if (prev.includes(sym)) return prev.filter((s) => s !== sym);
      if (prev.length >= 4) return prev;
      return [...prev, sym];
    });
  };

  const renderMetricValue = (metric, accent) => {
    const isNA = metric.text === "N/A";
    const isNeg = !isNA && metric.type === "signedPercent" && metric.raw < 0;
    const isPos = !isNA && metric.type === "signedPercent" && metric.raw > 0;
    const isEmeraldAccent = !isNA && accent === "emerald";

    return (
      <span
        className={cn(
          "font-mono tabular-nums whitespace-nowrap",
          isNA
            ? "text-zinc-400 dark:text-zinc-500 font-normal"
            : isPos || isEmeraldAccent
            ? "text-emerald-600 dark:text-[#26a69a] font-bold"
            : isNeg
            ? "text-rose-600 dark:text-[#ef5350] font-bold"
            : "text-zinc-900 dark:text-zinc-100 font-semibold"
        )}
      >
        {metric.text}
      </span>
    );
  };

  const desktopColCount = 8 + activeTabConfig.columns.length + desktopExtraColumns.length;

  return (
    <div className={cn("space-y-4", compareSymbols.length > 0 ? "pb-28" : "pb-12")}>
      {/* ========================================================
          1. 9 TAB KATEGORI ATAS (IKHTISAR, KINERJA, TEKNIKAL, DLL.)
          ======================================================== */}
      <div className="border-b border-zinc-200 dark:border-white/[0.08] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max pb-1.5">
          {SCREENER_CATEGORY_TABS.map((tab) => {
            const isActive = activeCategoryTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryTab(tab.id)}
                className={cn(
                  "min-h-[38px] px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer",
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-2xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          2. BARIS PENCARIAN & PILL KATEGORI SEKTOR BISNIS HORIZONTAL
          ======================================================== */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3 bg-white dark:bg-[#0f1014] p-3 rounded-2xl border border-zinc-200 dark:border-white/[0.08]">
        {/* Input Pencarian Simbol / Nama Emiten */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search
            className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <Input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari simbol atau emiten (e.g. BBCA)..."
            aria-label="Cari simbol atau emiten"
            className={cn(
              "h-9 ps-9 bg-zinc-50 dark:bg-black/40 border-zinc-200 dark:border-white/[0.1]",
              searchQuery && "pe-8"
            )}
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Hapus pencarian"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
                searchInputRef.current?.focus();
              }}
              className="absolute inset-y-0 end-0 flex w-8 items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              <CircleX className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Tombol Filter Multi-Sektor & Rasio + Pill Sektor Bisnis Horizontal */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Buka menu filter sektor dan rasio fundamental"
                className={cn(
                  "h-9 px-2.5 rounded-xl border inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer transition-colors",
                  activeFilterCount > 0 || filterPopoverOpen
                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white"
                    : "bg-zinc-50 dark:bg-black/40 border-zinc-200 dark:border-white/[0.12] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.08] hover:border-zinc-300 dark:hover:border-white/25"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold tabular-nums bg-white/20 text-white dark:bg-zinc-900/15 dark:text-zinc-950">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              className="w-[min(370px,calc(100vw-24px))] max-h-[80vh] overflow-y-auto p-3.5 space-y-3.5 bg-white dark:bg-[#12141c] border-zinc-200 dark:border-white/[0.12] text-zinc-900 dark:text-zinc-100"
            >
              {/* Multi-Select 12 Sektor IDX80 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Filter Multi-Sektor ({draftFilters.sectors.length || "Semua"})
                  </span>
                  {draftFilters.sectors.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setDraftFilters((prev) => ({ ...prev, sectors: [] }))
                      }
                      className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:underline cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {orderedSectorOptions.map((opt, idx) => {
                    const isChecked = draftFilters.sectors.includes(opt.sector);
                    return (
                      <div key={opt.sector} className="flex items-center gap-2 py-0.5">
                        <Checkbox
                          id={`${componentId}-pop-sec-${idx}`}
                          checked={isChecked}
                          onCheckedChange={() => handleToggleDraftSector(opt.sector)}
                        />
                        <Label
                          htmlFor={`${componentId}-pop-sec-${idx}`}
                          className="flex grow items-center justify-between gap-2 text-xs font-normal cursor-pointer text-zinc-800 dark:text-zinc-200"
                        >
                          <span className="truncate">{opt.label}</span>
                          {opt.count !== null && (
                            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
                              {opt.count}
                            </span>
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Kombinasi Filter Cepat Pemula */}
              <div className="space-y-2 pt-2.5 border-t border-zinc-200 dark:border-white/[0.08]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                  Kombinasi Filter Cepat ({activePresetIds.length || "Bebas"})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PRESETS.map((preset) => {
                    const isChecked = activePresetIds.includes(preset.id);
                    return (
                      <button
                        key={`pop-${preset.id}`}
                        type="button"
                        onClick={() => handleTogglePreset(preset, { applyImmediate: false })}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer",
                          isChecked
                            ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white"
                            : "bg-zinc-50 dark:bg-black/30 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/[0.1] hover:border-zinc-400"
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aksi Filter Lanjutan & Terapkan / Reset */}
              <div className="pt-2.5 border-t border-zinc-200 dark:border-white/[0.08] space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvanced(true);
                    setFilterPopoverOpen(false);
                    setTimeout(() => {
                      advancedSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      });
                    }, 50);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200/70 dark:hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  Atur Rasio Lanjutan (ROA, Margin, DER, Dividen, Laba, EPS)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      handleResetAll();
                      setFilterPopoverOpen(false);
                    }}
                    className="h-9 rounded-xl text-xs font-semibold bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                    Reset
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      handleApplyFilter();
                      setFilterPopoverOpen(false);
                    }}
                    className="h-9 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                    Terapkan
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 lg:pb-0">
            <button
              type="button"
              onClick={() => handleSelectSectorPill("ALL")}
              aria-pressed={draftFilters.sectors.length === 0}
              className={cn(
                "min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer border",
                draftFilters.sectors.length === 0
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white"
                  : "bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 border-transparent hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              Semua Sektor
            </button>

            {orderedSectorOptions.map((opt) => {
              const isSelected = draftFilters.sectors.includes(opt.sector);
              return (
                <button
                  key={opt.sector}
                  type="button"
                  onClick={() => handleSelectSectorPill(opt.sector)}
                  aria-pressed={isSelected}
                  title={
                    opt.count !== null
                      ? `${opt.label} (${opt.sector}) - ${opt.count} emiten`
                      : `${opt.label} (${opt.sector})`
                  }
                  className={cn(
                    "min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer border",
                    isSelected
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white"
                      : "bg-zinc-100 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 border-transparent hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          3. PANEL FILTER RINGKAS (KOMBINASI FILTER CEPAT + RASIO KUSTOM)
          ======================================================== */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1014] p-3 space-y-2.5">
        {/* Baris A: Kombinasi Filter Cepat (Bisa Pilih Lebih Dari 1) */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-2">
          <div className="flex items-center justify-between lg:pt-1.5 shrink-0 gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              Filter Cepat
              {activePresetIds.length > 0 && ` (${activePresetIds.length} aktif)`}:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 flex-1 min-w-0">
            {QUICK_PRESETS.map((preset) => {
              const isActive = activePresetIds.includes(preset.id);
              return (
                <div
                  key={preset.id}
                  title={`${preset.label} (${preset.summary})`}
                  className={cn(
                    "inline-flex items-center justify-between rounded-xl border transition-colors min-w-0",
                    isActive
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white"
                      : "bg-zinc-50 dark:bg-black/30 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-white/[0.1] hover:border-zinc-300 dark:hover:border-white/25"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleTogglePreset(preset)}
                    aria-pressed={isActive}
                    className="min-h-[34px] pl-2.5 pr-1 py-1 text-left cursor-pointer flex-1 min-w-0"
                  >
                    <span className="text-xs font-semibold block leading-tight truncate">
                      {preset.label}
                    </span>
                  </button>
                  <div className="pr-1 shrink-0">
                    <RatioTooltipButton
                      label={`${preset.label} (${preset.summary})`}
                      text={preset.description}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Baris B: Pilihan Rasio (Pilih Cepat / Atur Angka Sendiri) + Lanjutan + Reset */}
        <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.06] flex flex-col lg:flex-row lg:items-center gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2 flex-1 min-w-0">
            {CORE_RATIO_FIELDS.map((field) => (
              <RatioCriteriaControl
                key={field.id}
                field={field}
                appliedFilters={appliedFilters}
                onApplyPatch={handleApplyPatchImmediate}
              />
            ))}

            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              aria-expanded={showAdvanced}
              className={cn(
                "h-9 px-3 rounded-xl border inline-flex items-center justify-between lg:justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0",
                showAdvanced || activeAdvancedCount > 0
                  ? "border-zinc-400 dark:border-white/25 bg-zinc-100 dark:bg-white/[0.08] text-zinc-900 dark:text-white"
                  : "border-zinc-200 dark:border-white/[0.1] bg-zinc-50/70 dark:bg-black/30 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
                <span>Lanjutan</span>
                {activeAdvancedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950">
                    {activeAdvancedCount}
                  </span>
                )}
              </span>
              {showAdvanced ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 lg:flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              onClick={handleApplyFilter}
              className="h-9 px-4 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              Filter
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleResetAll}
              className="h-9 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              Reset
            </Button>
          </div>
        </div>

        {/* Panel Collapsible: Filter Lanjutan (Pilih Cepat / Angka Sendiri) */}
        {showAdvanced && (
          <div
            ref={advancedSectionRef}
            className="pt-2.5 border-t border-zinc-100 dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
          >
            {ADVANCED_INDICATOR_FIELDS.map((field) => (
              <RatioCriteriaControl
                key={field.id}
                field={field}
                appliedFilters={appliedFilters}
                onApplyPatch={handleApplyPatchImmediate}
                fullWidth
              />
            ))}
          </div>
        )}
      </div>

      {/* Kontrol Urutkan Khusus Mobile / Tablet (< md) */}
      <div className="md:hidden flex items-center justify-between gap-2 px-1">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium tabular-nums">
          {totalMatched} emiten
        </span>
        <div className="flex items-center gap-1.5">
          <label htmlFor={`${componentId}-m-sort`} className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Urutkan:
          </label>
          <select
            id={`${componentId}-m-sort`}
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 px-2.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#0f1014] border border-zinc-200 dark:border-white/[0.1] text-zinc-900 dark:text-white"
          >
            <option value="marketCap">Kap. Pasar</option>
            <option value="price">Harga Terkini</option>
            <option value="changePercent">Perubahan %</option>
            <option value="peRatio">PER</option>
            <option value="pbvRatio">PBV</option>
            <option value="roe">ROE</option>
            <option value="roa">ROA</option>
            <option value="netProfitMargin">Net Margin</option>
            <option value="der">DER</option>
            <option value="revenue">Pendapatan</option>
            <option value="netIncome">Laba Bersih</option>
            <option value="eps">EPS</option>
            <option value="dividendYield">Yield Dividen</option>
            <option value="symbol">Simbol (A-Z)</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
              setCurrentPage(1);
            }}
            aria-label={sortOrder === "asc" ? "Urutkan menurun" : "Urutkan menaik"}
            className="h-9 w-9 rounded-lg flex items-center justify-center bg-white dark:bg-[#0f1014] border border-zinc-200 dark:border-white/[0.1] text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            {sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Error State Backend */}
      {fetchError && (
        <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between gap-3 text-xs text-rose-700 dark:text-rose-300">
          <span>{fetchError}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setIsLoading(true);
              setFetchError(null);
              setAppliedFilters((prev) => ({ ...prev }));
            }}
            className="h-8 text-xs shrink-0"
          >
            Muat Ulang
          </Button>
        </div>
      )}

      {/* ========================================================
          4. EMPTY STATE EKSPLISIT (HASIL KOSONG)
          ======================================================== */}
      {!isLoading && !fetchError && paginatedStocks.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1014] py-14 px-5 text-center space-y-3">
          <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            Tidak ada saham sesuai
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Tidak ditemukan emiten IDX80 yang memenuhi kombinasi filter atau pencarian saat ini. Silakan ubah kriteria atau kembalikan filter ke kondisi awal.
          </p>
          <div className="pt-1">
            <Button
              type="button"
              onClick={handleResetAll}
              className="h-9 px-4 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              Atur Ulang Filter
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* ====================================================
              DAFTAR KARTU SAHAM KHUSUS MOBILE / TABLET (< md)
              ==================================================== */}
          <div className="md:hidden space-y-2.5">
            {isLoading ? (
              <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1014] py-14 text-center text-xs text-zinc-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                <span>Memuat data fundamental emiten bursa...</span>
              </div>
            ) : (
              paginatedStocks.map((stock) => {
                const sym = String(stock.symbol).toUpperCase();
                const isStarred = watchlistSymbols.includes(sym);
                const isCompared = compareSymbols.includes(sym);
                const compareDisabled = !isCompared && compareSymbols.length >= 4;
                const priceMetric = resolveStockMetric(stock, "price");
                const changeMetric = resolveStockMetric(stock, "changePercent");

                return (
                  <div
                    key={`mob-${sym}`}
                    onClick={() => onSelectStock?.(sym)}
                    className={cn(
                      "rounded-2xl border bg-white dark:bg-[#0f1014] p-3.5 space-y-3 transition-colors cursor-pointer",
                      isCompared
                        ? "border-zinc-900 dark:border-white/40"
                        : "border-zinc-200 dark:border-white/[0.08]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center min-w-[32px] min-h-[36px]"
                        >
                          <Checkbox
                            checked={isCompared}
                            disabled={compareDisabled}
                            onCheckedChange={() => handleToggleCompare(null, sym)}
                            aria-label={`Pilih ${sym} ke Stock Comparison`}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlistBySymbol(sym);
                          }}
                          aria-label={isStarred ? `Hapus ${sym} dari Watchlist` : `Tambahkan ${sym} ke Watchlist`}
                          className="w-8 h-9 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/[0.06] shrink-0 cursor-pointer"
                        >
                          <Star
                            className={cn(
                              "w-4 h-4",
                              isStarred ? "text-amber-400 fill-amber-400" : "text-zinc-400"
                            )}
                          />
                        </button>

                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 p-0.5 border border-zinc-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={stock.logoUrl || `https://assets.stockbit.com/logos/companies/${sym}.png`}
                            alt={sym}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-white tracking-tight">
                              {sym}
                            </span>
                            <Badge
                              variant="outline"
                              className="rounded-md px-1.5 py-0 text-[9.5px] font-semibold"
                            >
                              {SECTOR_LABELS_ID[stock.sector] || stock.sector || "N/A"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            {stock.companyName}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm">{renderMetricValue(priceMetric)}</div>
                        <div className="text-xs">{renderMetricValue(changeMetric)}</div>
                      </div>
                    </div>

                    {/* Grid 2 Kolom Metrik Sesuai Tab Aktif + Filter Lanjutan Aktif */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2.5 border-t border-zinc-100 dark:border-white/[0.06] text-xs">
                      {activeTabConfig.columns.map((col) => (
                        <div key={col.id} className="flex items-center justify-between gap-1.5 min-w-0">
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            {col.label}
                          </span>
                          {renderMetricValue(resolveStockMetric(stock, col.id), col.accent)}
                        </div>
                      ))}

                      {activeExtraColumns.map((col) => (
                        <div key={col.id} className="flex items-center justify-between gap-1.5 min-w-0">
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            {col.shortLabel}
                          </span>
                          {renderMetricValue(resolveStockMetric(stock, col.dbField))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ====================================================
              TABEL DATA SAHAM KOMPREHENSIF DESKTOP (md+)
              ==================================================== */}
          <div className="hidden md:block rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1014] overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50/90 dark:bg-black/60">
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="w-10 px-3 text-center" title="Pilih 2–4 saham untuk dibandingkan">
                    Banding
                  </TableHead>
                  <TableHead className="w-10 px-2 text-center">
                    <Star className="w-3.5 h-3.5 text-zinc-400 mx-auto" aria-hidden="true" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("symbol")}
                    className="min-w-[210px] cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                  >
                    <span className="inline-flex items-center gap-1">
                      <span>Simbol / Emiten</span>
                      {renderSortIcon("symbol")}
                    </span>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("sector")}
                    className="min-w-[140px] cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                  >
                    <span className="inline-flex items-center gap-1">
                      <span>Sektor</span>
                      {renderSortIcon("sector")}
                    </span>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("marketCap")}
                    className="text-right cursor-pointer hover:text-zinc-900 dark:hover:text-white whitespace-nowrap min-w-[120px]"
                  >
                    <span className="inline-flex items-center justify-end gap-1">
                      <span>Kap Pasar</span>
                      {renderSortIcon("marketCap")}
                    </span>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("price")}
                    className="text-right cursor-pointer hover:text-zinc-900 dark:hover:text-white whitespace-nowrap min-w-[105px]"
                  >
                    <span className="inline-flex items-center justify-end gap-1">
                      <span>Harga</span>
                      {renderSortIcon("price")}
                    </span>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("changePercent")}
                    className="text-right cursor-pointer hover:text-zinc-900 dark:hover:text-white whitespace-nowrap min-w-[105px]"
                  >
                    <span className="inline-flex items-center justify-end gap-1">
                      <span>Perubahan %</span>
                      {renderSortIcon("changePercent")}
                    </span>
                  </TableHead>

                  {/* Kolom Dinamis Sesuai Tab Kategori Aktif (9 Tab) */}
                  {activeTabConfig.columns.map((col) => (
                    <TableHead
                      key={col.id}
                      onClick={() => col.sortKey && handleSort(col.sortKey)}
                      className={cn(
                        "text-right whitespace-nowrap",
                        col.sortKey
                          ? "cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                          : "cursor-default"
                      )}
                    >
                      <span className="inline-flex items-center justify-end gap-1">
                        <span>{col.label}</span>
                        {renderSortIcon(col.sortKey)}
                      </span>
                    </TableHead>
                  ))}

                  {/* Kolom Rasio Tambahan dari Filter Lanjutan yang Aktif */}
                  {desktopExtraColumns.map((col) => (
                    <TableHead
                      key={col.id}
                      onClick={() => handleSort(col.sortKey)}
                      className="text-right cursor-pointer hover:text-zinc-900 dark:hover:text-white whitespace-nowrap bg-zinc-100/70 dark:bg-white/[0.03]"
                    >
                      <span className="inline-flex items-center justify-end gap-1">
                        <span>{col.shortLabel}</span>
                        {renderSortIcon(col.sortKey)}
                      </span>
                    </TableHead>
                  ))}

                  <TableHead className="text-center min-w-[88px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={desktopColCount} className="h-36 text-center text-zinc-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      <span>Memuat data fundamental emiten bursa...</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStocks.map((stock) => {
                    const sym = String(stock.symbol).toUpperCase();
                    const isStarred = watchlistSymbols.includes(sym);
                    const isCompared = compareSymbols.includes(sym);
                    const compareDisabled = !isCompared && compareSymbols.length >= 4;

                    return (
                      <TableRow
                        key={sym}
                        onClick={() => onSelectStock?.(sym)}
                        className={cn(
                          "border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-50/80 dark:hover:bg-white/[0.03] cursor-pointer",
                          isCompared && "bg-zinc-50 dark:bg-white/[0.04]"
                        )}
                      >
                        <TableCell className="px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isCompared}
                            disabled={compareDisabled}
                            onCheckedChange={() => handleToggleCompare(null, sym)}
                            aria-label={`Pilih ${sym} ke Stock Comparison`}
                            title={compareDisabled ? "Maksimal 4 emiten terpilih" : "Pilih untuk bandingkan"}
                          />
                        </TableCell>

                        <TableCell className="px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleWatchlistBySymbol(sym)}
                            aria-label={isStarred ? `Hapus ${sym} dari Watchlist` : `Simpan ${sym} ke Watchlist`}
                            title={isStarred ? "Hapus dari Watchlist" : "Tambahkan ke Watchlist"}
                            className="p-1.5 rounded-lg hover:bg-zinc-200/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <Star
                              className={cn(
                                "w-3.5 h-3.5",
                                isStarred ? "text-amber-400 fill-amber-400" : "text-zinc-400"
                              )}
                            />
                          </button>
                        </TableCell>

                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 p-0.5 border border-zinc-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              <img
                                src={stock.logoUrl || `https://assets.stockbit.com/logos/companies/${sym}.png`}
                                alt={sym}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-white tracking-tight">
                                  {sym}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300">
                                  IDX
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[190px]">
                                {stock.companyName}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className="rounded-md px-2 py-0.5 text-[10px] font-semibold border-zinc-200 dark:border-white/[0.1] bg-zinc-100/70 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-300 whitespace-nowrap"
                          >
                            {SECTOR_LABELS_ID[stock.sector] || stock.sector || "N/A"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          {renderMetricValue(resolveStockMetric(stock, "marketCap"))}
                        </TableCell>

                        <TableCell className="text-right">
                          {renderMetricValue(resolveStockMetric(stock, "price"))}
                        </TableCell>

                        <TableCell className="text-right">
                          {renderMetricValue(resolveStockMetric(stock, "changePercent"))}
                        </TableCell>

                        {activeTabConfig.columns.map((col) => (
                          <TableCell key={col.id} className="text-right">
                            {renderMetricValue(resolveStockMetric(stock, col.id), col.accent)}
                          </TableCell>
                        ))}

                        {desktopExtraColumns.map((col) => (
                          <TableCell
                            key={col.id}
                            className="text-right bg-zinc-50/50 dark:bg-white/[0.015]"
                          >
                            {renderMetricValue(resolveStockMetric(stock, col.dbField))}
                          </TableCell>
                        ))}

                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onSelectStock?.(sym)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Detail</span>
                            <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* ========================================================
          PAGINATION (15 EMITEN PER HALAMAN)
          ======================================================== */}
      {!isLoading && totalMatched > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums whitespace-nowrap" aria-live="polite">
            <span className="font-semibold text-zinc-900 dark:text-white">
              {pageStartIdx + 1}-{Math.min(pageStartIdx + PAGE_SIZE, totalMatched)}
            </span>{" "}
            dari <span className="font-semibold text-zinc-900 dark:text-white">{totalMatched}</span>{" "}
            emiten
          </p>

          {totalPages > 1 && (
            <Pagination className="w-auto mx-0">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => goToPage(1)}
                    disabled={safePage <= 1}
                    aria-label="Halaman pertama"
                    className="h-9 w-9 bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1]"
                  >
                    <ChevronFirst className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage <= 1}
                    aria-label="Halaman sebelumnya"
                    className="h-9 w-9 bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1]"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </PaginationItem>

                <PaginationItem className="sm:hidden px-2.5 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-200 tabular-nums">
                  {safePage} / {totalPages}
                </PaginationItem>

                {pageNumbers.map((pageNum, idx) => {
                  const prevNum = pageNumbers[idx - 1];
                  const showGap = prevNum && pageNum - prevNum > 1;
                  return (
                    <React.Fragment key={pageNum}>
                      {showGap && (
                        <PaginationItem className="hidden sm:inline-flex px-1 text-xs text-zinc-400">
                          ...
                        </PaginationItem>
                      )}
                      <PaginationItem className="hidden sm:inline-flex">
                        <Button
                          type="button"
                          size="sm"
                          variant={pageNum === safePage ? "default" : "outline"}
                          onClick={() => goToPage(pageNum)}
                          aria-current={pageNum === safePage ? "page" : undefined}
                          className={cn(
                            "h-9 min-w-[36px] px-2.5 font-mono text-xs",
                            pageNum === safePage
                              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold"
                              : "bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1]"
                          )}
                        >
                          {pageNum}
                        </Button>
                      </PaginationItem>
                    </React.Fragment>
                  );
                })}

                <PaginationItem>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    aria-label="Halaman berikutnya"
                    className="h-9 w-9 bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1]"
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => goToPage(totalPages)}
                    disabled={safePage >= totalPages}
                    aria-label="Halaman terakhir"
                    className="h-9 w-9 bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1]"
                  >
                    <ChevronLast className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* ========================================================
          5. FLOATING BAR PINTASAN KE STOCK COMPARISON (2-4 EMITEN)
          ======================================================== */}
      {compareSymbols.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(660px,calc(100vw-24px))] rounded-2xl border border-zinc-300 dark:border-white/[0.16] bg-white/95 dark:bg-[#14161d]/95 backdrop-blur-md shadow-xl p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mr-1">
              Bandingkan ({compareSymbols.length}/4):
            </span>
            {compareSymbols.map((sym) => (
              <span
                key={sym}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white"
              >
                <span>{sym}</span>
                <button
                  type="button"
                  onClick={() => handleToggleCompare(null, sym)}
                  aria-label={`Hapus ${sym}`}
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCompareSymbols([])}
              className="px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
            >
              Bersihkan
            </button>
            <Button
              type="button"
              disabled={compareSymbols.length < 2}
              onClick={() => onCompareStocks?.(compareSymbols)}
              className="h-9 px-4 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-50 cursor-pointer"
            >
              <span>
                {compareSymbols.length < 2
                  ? "Pilih Min. 2 Saham"
                  : `Bandingkan (${compareSymbols.length})`}
              </span>
              {compareSymbols.length >= 2 && <ArrowRight className="w-3.5 h-3.5 ml-1.5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
