import React, { useId, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  CircleX,
  Columns3,
  Filter,
  ListFilter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CATEGORY_FILTER_FN = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  return filterValue.includes(row.getValue(columnId));
};

const LABEL_FILTER_FN = (row, _columnId, filterValue) => {
  const term = String(filterValue || "").trim().toLowerCase();
  if (!term) return true;
  const hay = `${row.original.label} ${row.original.category}`.toLowerCase();
  return hay.includes(term);
};

const ROW_DEFINITIONS = [
  { key: "revenue", label: "Total Penjualan (Revenue)", category: "Laba Rugi", type: "currency", isBold: true },
  { key: "netIncome", label: "Laba Bersih (Net Income)", category: "Laba Rugi", type: "currency", isBold: true, colorBySign: true },
  { key: "netProfitMargin", label: "Sisa Laba dari Penjualan (NPM)", category: "Laba Rugi", type: "percent", isPointDiff: true, colorBySign: true },
  { key: "eps", label: "Laba per 1 Lembar Saham (EPS)", category: "Laba Rugi", type: "eps", colorBySign: true },
  { key: "totalAssets", label: "Total Harta (Aset)", category: "Neraca", type: "currency", isBold: true },
  { key: "totalEquity", label: "Modal Bersih (Ekuitas)", category: "Neraca", type: "currency", isBold: true },
  { key: "totalLiabilities", label: "Total Utang (Liabilitas)", category: "Neraca", type: "currency" },
  { key: "cashEquivalents", label: "Uang Kas Tersedia", category: "Neraca", type: "currency" },
  { key: "roe", label: "Laba dari Modal Sendiri (ROE)", category: "Rasio Usaha", type: "percent", isPointDiff: true, colorBySign: true },
  { key: "roa", label: "Laba dari Total Harta (ROA)", category: "Rasio Usaha", type: "percent", isPointDiff: true, colorBySign: true },
];

export default function FinancialDataTable({
  activePeriods = [],
  regularPeriods = [],
  deltaHeaderLabel = "Perubahan YoY",
  formatFinancialValue,
  formatEpsValue,
  formatPct,
  formatDeltaCell,
  getValueColorClass,
}) {
  const id = useId();
  const inputRef = useRef(null);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState([]);

  const rowsData = useMemo(() => {
    const computeDelta = (fieldKey, isPointDiff) => {
      if (regularPeriods.length < 2) return null;
      const curr = regularPeriods[regularPeriods.length - 1]?.[fieldKey];
      const prev = regularPeriods[regularPeriods.length - 2]?.[fieldKey];
      if (curr === null || curr === undefined || prev === null || prev === undefined) return null;
      const cNum = Number(curr);
      const pNum = Number(prev);
      if (isNaN(cNum) || isNaN(pNum)) return null;
      if (isPointDiff) return Number((cNum - pNum).toFixed(1));
      if (pNum === 0) return null;
      return Number((((cNum - pNum) / Math.abs(pNum)) * 100).toFixed(1));
    };

    return ROW_DEFINITIONS.map((def) => {
      const periodValues = {};
      for (const p of activePeriods) {
        periodValues[p.period] = p[def.key] ?? null;
      }
      return {
        ...def,
        values: periodValues,
        delta: computeDelta(def.key, Boolean(def.isPointDiff)),
      };
    });
  }, [activePeriods, regularPeriods]);

  const columns = useMemo(() => {
    const baseCols = [
      {
        id: "label",
        accessorKey: "label",
        header: "Pos Laporan Keuangan",
        filterFn: LABEL_FILTER_FN,
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-medium text-zinc-900 dark:text-zinc-100 block text-[11px] sm:text-xs leading-snug sm:whitespace-nowrap">
            {row.original.label}
          </span>
        ),
      },
      {
        id: "category",
        accessorKey: "category",
        header: "Kategori",
        filterFn: CATEGORY_FILTER_FN,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="rounded-md px-2 py-0.5 text-[10px] font-semibold border-zinc-200 dark:border-white/[0.1] bg-zinc-100/70 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-300 whitespace-nowrap"
          >
            {row.original.category}
          </Badge>
        ),
      },
    ];

    const periodCols = activePeriods.map((p) => ({
      id: `period_${p.period}`,
      header: p.label,
      accessorFn: (row) => {
        const val = row.values?.[p.period];
        return val !== null && val !== undefined && !isNaN(val) ? Number(val) : null;
      },
      sortUndefined: "last",
      meta: { isTTM: Boolean(p.isTTM), headerLabel: p.label },
      cell: ({ row }) => {
        const rawVal = row.original.values?.[p.period];
        let formatted = "-";
        if (row.original.type === "currency") formatted = formatFinancialValue(rawVal);
        else if (row.original.type === "eps") formatted = formatEpsValue(rawVal);
        else if (row.original.type === "percent") formatted = formatPct(rawVal);

        const colorClass = row.original.colorBySign
          ? getValueColorClass(rawVal)
          : "text-zinc-900 dark:text-zinc-100";

        return (
          <div
            className={cn(
              "text-right font-mono tabular-nums whitespace-nowrap",
              row.original.isBold ? "font-bold" : "font-semibold",
              colorClass,
            )}
          >
            {formatted}
          </div>
        );
      },
    }));

    const deltaCol = {
      id: "delta",
      accessorKey: "delta",
      header: deltaHeaderLabel,
      sortUndefined: "last",
      meta: { isRight: true, headerLabel: deltaHeaderLabel },
      cell: ({ row }) => (
        <div
          className={cn(
            "text-right font-mono font-semibold tabular-nums whitespace-nowrap",
            getValueColorClass(row.original.delta),
          )}
        >
          {formatDeltaCell(row.original.delta, Boolean(row.original.isPointDiff))}
        </div>
      ),
    };

    return [...baseCols, ...periodCols, deltaCol];
  }, [
    activePeriods,
    deltaHeaderLabel,
    formatFinancialValue,
    formatEpsValue,
    formatPct,
    formatDeltaCell,
    getValueColorClass,
  ]);

  const table = useReactTable({
    data: rowsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    enableSortingRemoval: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const categoryColumn = table.getColumn("category");
  const labelColumn = table.getColumn("label");
  const categoryFacets = categoryColumn?.getFacetedUniqueValues();

  const uniqueCategoryValues = useMemo(() => {
    if (!categoryFacets) return ["Laba Rugi", "Neraca", "Rasio Usaha"];
    return Array.from(categoryFacets.keys());
  }, [categoryFacets]);

  const rawCategoryFilter = categoryColumn?.getFilterValue();
  const selectedCategories = Array.isArray(rawCategoryFilter) ? rawCategoryFilter : [];

  const searchValue = String(labelColumn?.getFilterValue() ?? "");

  const handleCategoryChange = (checked, value) => {
    const next = checked
      ? [...selectedCategories, value]
      : selectedCategories.filter((item) => item !== value);
    categoryColumn?.setFilterValue(next.length ? next : undefined);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar Filter ala OriginUI / shadcn DataTable */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Input Cari Pos Laporan */}
          <div className="relative w-full sm:w-64 md:w-72">
            <Input
              id={`${id}-search`}
              ref={inputRef}
              value={searchValue}
              onChange={(e) => {
                labelColumn?.setFilterValue(e.target.value);
              }}
              placeholder="Cari pos laporan (mis. Laba, Kas, ROE)..."
              type="text"
              aria-label="Cari pos laporan keuangan"
              className={cn(
                "peer w-full ps-8 bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1]",
                searchValue && "pe-8",
              )}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2.5 text-muted-foreground">
              <ListFilter className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            {searchValue && (
              <button
                type="button"
                aria-label="Hapus pencarian"
                onClick={() => {
                  labelColumn?.setFilterValue("");
                  inputRef.current?.focus();
                }}
                className="absolute inset-y-0 end-0 flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <CircleX className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Popover Filter Kategori */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1]"
              >
                <Filter className="w-3.5 h-3.5 mr-1.5 opacity-70" aria-hidden="true" />
                Kategori
                {selectedCategories.length > 0 && (
                  <span className="ml-2 inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-semibold">
                    {selectedCategories.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" align="start">
              <div className="space-y-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Kelompok Laporan
                </div>
                <div className="space-y-2">
                  {uniqueCategoryValues.map((cat, idx) => (
                    <div key={cat} className="flex items-center gap-2">
                      <Checkbox
                        id={`${id}-cat-${idx}`}
                        checked={selectedCategories.includes(cat)}
                        onCheckedChange={(checked) => handleCategoryChange(Boolean(checked), cat)}
                      />
                      <Label
                        htmlFor={`${id}-cat-${idx}`}
                        className="flex grow justify-between gap-2 font-normal cursor-pointer"
                      >
                        <span>{cat}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {categoryFacets?.get(cat) ?? 0}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Dropdown Visibilitas Kolom Periode */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1]"
              >
                <Columns3 className="w-3.5 h-3.5 mr-1.5 opacity-70" aria-hidden="true" />
                Kolom
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Tampilkan Kolom</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => {
                  const colTitle =
                    col.columnDef.meta?.headerLabel ||
                    (typeof col.columnDef.header === "string" ? col.columnDef.header : col.id);
                  return (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(Boolean(val))}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {colTitle}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {(searchValue || selectedCategories.length > 0 || sorting.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setColumnFilters([]);
              setSorting([]);
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Reset Filter
          </Button>
        )}
      </div>

      {/* Tabel Data Utama (shadcn Table + TanStack Table) */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1014]">
        <Table>
          <TableHeader className="bg-zinc-50/90 dark:bg-white/[0.02]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                {headerGroup.headers.map((header, idx) => {
                  const isStickyFirst = idx === 0;
                  const isRightAligned =
                    header.column.id.startsWith("period_") || header.column.id === "delta";
                  const isTTM = Boolean(header.column.columnDef.meta?.isTTM);

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-11 px-2.5 sm:px-4 whitespace-nowrap text-[11px] font-semibold text-zinc-500 dark:text-zinc-400",
                        isStickyFirst &&
                          "sticky left-0 z-20 bg-zinc-50 dark:bg-[#131419] border-r border-zinc-200/70 dark:border-white/[0.06] w-[148px] min-w-[148px] max-w-[155px] sm:w-auto sm:min-w-[220px] sm:max-w-none",
                        isRightAligned && "text-right font-mono",
                        isTTM &&
                          "bg-zinc-100/80 dark:bg-white/[0.04] text-zinc-900 dark:text-white font-bold border-l border-zinc-200 dark:border-white/[0.08]",
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          className={cn(
                            "flex h-full cursor-pointer select-none items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors",
                            isRightAligned && "justify-end",
                          )}
                        >
                          <span>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {{
                            asc: <ChevronUp className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true" />,
                            desc: <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true" />,
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-50/70 dark:hover:bg-white/[0.02]"
                >
                  {row.getVisibleCells().map((cell, idx) => {
                    const isStickyFirst = idx === 0;
                    const isTTM = Boolean(cell.column.columnDef.meta?.isTTM);

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-2.5 px-2.5 sm:px-4",
                          isStickyFirst &&
                            "sticky left-0 z-10 bg-white dark:bg-[#0f1014] border-r border-zinc-100 dark:border-white/[0.04] w-[148px] min-w-[148px] max-w-[155px] sm:w-auto sm:min-w-0 sm:max-w-none",
                          isTTM &&
                            "bg-zinc-50/60 dark:bg-white/[0.02] border-l border-zinc-200/70 dark:border-white/[0.06]",
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  Tidak ada pos laporan keuangan yang cocok dengan pencarian.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
