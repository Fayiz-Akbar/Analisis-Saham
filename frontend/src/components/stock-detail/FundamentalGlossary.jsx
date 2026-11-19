import React, { useId, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, CircleX, Filter, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

const TERM_FILTER_FN = (row, _columnId, filterValue) => {
  const term = String(filterValue || "").trim().toLowerCase();
  if (!term) return true;
  const hay = `${row.original.code} ${row.original.name} ${row.original.guide}`.toLowerCase();
  return hay.includes(term);
};

const GROUP_FILTER_FN = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  return filterValue.includes(row.getValue(columnId));
};

/**
 * Panduan Istilah & Indikator Fundamental (OriginUI / shadcn Table + TanStack Table)
 * Menyajikan nilai aktual emiten dan penjelasan sederhana dengan contoh nyata,
 * bebas jargon ambigu dan tanpa penilaian if-else otomatis.
 */
export default function FundamentalGlossary({ fundamentals, symbol }) {
  const id = useId();
  const inputRef = useRef(null);
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);

  const data = useMemo(() => {
    const f = fundamentals || {};
    const formatNum = (val, suffix = "") => {
      if (val === null || val === undefined || isNaN(val)) return "-";
      return `${Number(val).toLocaleString("id-ID", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      })}${suffix}`;
    };

    const formatEps = (val) => {
      if (val === null || val === undefined || isNaN(val)) return "-";
      const num = Number(val);
      return `Rp ${num.toLocaleString("id-ID", {
        minimumFractionDigits: Math.abs(num) < 10 ? 2 : 0,
        maximumFractionDigits: 2,
      })}`;
    };

    const pe = f.peRatio !== null && f.peRatio !== undefined ? Number(f.peRatio) : null;
    const pbv = f.pbvRatio !== null && f.pbvRatio !== undefined ? Number(f.pbvRatio) : null;
    const roe = f.roe !== null && f.roe !== undefined ? Number(f.roe) : null;
    const roa = f.roa !== null && f.roa !== undefined ? Number(f.roa) : null;
    const npm =
      f.netProfitMargin !== null && f.netProfitMargin !== undefined
        ? Number(f.netProfitMargin)
        : null;
    const der = f.der !== null && f.der !== undefined ? Number(f.der) : null;
    const eps = f.eps !== null && f.eps !== undefined ? Number(f.eps) : null;
    const dy =
      f.dividendYield !== null && f.dividendYield !== undefined ? Number(f.dividendYield) : null;

    return [
      {
        code: "PER",
        name: "Harga dibanding Laba (Price to Earnings)",
        group: "Valuasi Harga",
        numericValue: pe,
        currentValue: formatNum(pe, "x"),
        guide:
          "Mengukur berapa kali lipat harga saham dibanding keuntungan bersih per lembar dalam setahun. Contoh: PER 10x artinya butuh sekitar 10 tahun laba untuk menutup harga beli saham.",
      },
      {
        code: "PBV",
        name: "Harga dibanding Modal Bersih (Price to Book Value)",
        group: "Valuasi Harga",
        numericValue: pbv,
        currentValue: formatNum(pbv, "x"),
        guide:
          "Membandingkan harga saham dengan nilai modal bersih perusahaan (total harta dikurangi utang). PBV 1x artinya harga saham sama persis dengan nilai modal bersihnya.",
      },
      {
        code: "ROE",
        name: "Keuntungan dari Modal Sendiri (Return on Equity)",
        group: "Profitabilitas",
        numericValue: roe,
        currentValue: formatNum(roe, "%"),
        guide:
          "Persentase laba bersih yang berhasil dicetak dari modal pemilik saham. Contoh: ROE 15% artinya setiap Rp 100 modal mampu menghasilkan Rp 15 laba bersih dalam setahun.",
      },
      {
        code: "ROA",
        name: "Keuntungan dari Total Harta (Return on Assets)",
        group: "Profitabilitas",
        numericValue: roa,
        currentValue: formatNum(roa, "%"),
        guide:
          "Persentase laba bersih yang dihasilkan dari seluruh harta (aset) yang dimiliki perusahaan, baik yang berasal dari modal sendiri maupun dari utang.",
      },
      {
        code: "NPM",
        name: "Sisa Laba dari Penjualan (Net Profit Margin)",
        group: "Profitabilitas",
        numericValue: npm,
        currentValue: formatNum(npm, "%"),
        guide:
          "Persentase uang penjualan yang tersisa menjadi laba bersih setelah dipotong biaya operasional, bunga, dan pajak. Contoh: NPM 20% artinya dari Rp 100 penjualan, Rp 20 adalah laba bersih.",
      },
      {
        code: "DER",
        name: "Utang dibanding Modal (Debt to Equity)",
        group: "Modal & Utang",
        numericValue: der,
        currentValue: formatNum(der, "x"),
        guide:
          "Membandingkan total utang perusahaan dengan modal sendiri. DER 1x berarti jumlah utang sama besar dengan modal; di bawah 1x berarti modal lebih besar daripada utang.",
      },
      {
        code: "EPS",
        name: "Laba per 1 Lembar Saham (Earnings Per Share)",
        group: "Profitabilitas",
        numericValue: eps,
        currentValue: formatEps(eps),
        guide:
          "Jumlah keuntungan bersih perusahaan yang menjadi jatah setiap 1 lembar saham. Semakin tinggi EPS, semakin besar laba yang dihasilkan untuk setiap lembar saham yang Anda pegang.",
      },
      {
        code: "Yield",
        name: "Persentase Bagi Hasil Tunai (Dividend Yield)",
        group: "Valuasi Harga",
        numericValue: dy && dy > 0 ? dy : null,
        currentValue: dy && dy > 0 ? formatNum(dy, "%") : "-",
        guide:
          "Persentase dividen tunai yang dibagikan dalam setahun dibanding harga saham sekarang. Contoh: Yield 5% artinya dari pembelian saham Rp 1 juta, potensi dividen tunainya Rp 50 ribu per tahun.",
      },
      {
        code: "TTM",
        name: "Akumulasi 12 Bulan Terakhir (Trailing Twelve Months)",
        group: "Periode Data",
        numericValue: null,
        currentValue: "4 Kuartal",
        guide:
          "Gabungan laporan keuangan dari 4 kuartal (12 bulan) paling baru. Dipakai agar investor bisa melihat kinerja paling update tanpa harus menunggu laporan tahunan tutup buku.",
      },
    ];
  }, [fundamentals]);

  const columns = useMemo(
    () => [
      {
        id: "code",
        accessorKey: "code",
        header: "Istilah",
        filterFn: TERM_FILTER_FN,
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
              {row.original.code}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {row.original.name}
            </div>
          </div>
        ),
      },
      {
        id: "group",
        accessorKey: "group",
        header: "Kelompok",
        filterFn: GROUP_FILTER_FN,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="rounded-md px-2 py-0.5 text-[10px] font-semibold border-zinc-200 dark:border-white/[0.1] bg-zinc-100/70 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-300 whitespace-nowrap"
          >
            {row.original.group}
          </Badge>
        ),
      },
      {
        id: "currentValue",
        accessorFn: (row) => row.numericValue,
        sortUndefined: "last",
        header: `Nilai ${symbol}`,
        cell: ({ row }) => (
          <div className="text-right font-mono font-bold tabular-nums text-xs sm:text-sm text-zinc-900 dark:text-white whitespace-nowrap">
            {row.original.currentValue}
          </div>
        ),
      },
      {
        id: "guide",
        accessorKey: "guide",
        enableSorting: false,
        header: "Arti Sederhana & Contoh",
        cell: ({ row }) => (
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
            {row.original.guide}
          </p>
        ),
      },
    ],
    [symbol],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    enableSortingRemoval: true,
    state: { sorting, columnFilters },
  });

  const codeColumn = table.getColumn("code");
  const groupColumn = table.getColumn("group");
  const groupFacets = groupColumn?.getFacetedUniqueValues();
  const uniqueGroups = useMemo(
    () => (groupFacets ? Array.from(groupFacets.keys()) : []),
    [groupFacets],
  );
  const rawGroupFilter = groupColumn?.getFilterValue();
  const selectedGroups = Array.isArray(rawGroupFilter) ? rawGroupFilter : [];

  const searchValue = String(codeColumn?.getFilterValue() ?? "");

  const handleGroupChange = (checked, value) => {
    const next = checked
      ? [...selectedGroups, value]
      : selectedGroups.filter((item) => item !== value);
    groupColumn?.setFilterValue(next.length ? next : undefined);
  };

  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-zinc-200 dark:border-white/[0.08]">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Panduan Istilah & Indikator ({symbol})
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Penjelasan sederhana tiap istilah keuangan agar mudah dipahami sebelum membaca laporan{" "}
            {symbol}.
          </p>
        </div>
      </div>

      {/* Filter Bar ala OriginUI */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Input
              id={`${id}-search`}
              ref={inputRef}
              value={searchValue}
              onChange={(e) => codeColumn?.setFilterValue(e.target.value)}
              placeholder="Cari istilah (PER, ROE, TTM)..."
              type="text"
              aria-label="Cari istilah fundamental"
              className={cn(
                "peer w-56 sm:w-64 ps-8 bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1]",
                searchValue && "pe-8",
              )}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2.5 text-muted-foreground">
              <ListFilter className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            {searchValue && (
              <button
                type="button"
                aria-label="Hapus pencarian istilah"
                onClick={() => {
                  codeColumn?.setFilterValue("");
                  inputRef.current?.focus();
                }}
                className="absolute inset-y-0 end-0 flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <CircleX className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs bg-white dark:bg-[#0f1014] border-zinc-200 dark:border-white/[0.1]"
              >
                <Filter className="w-3.5 h-3.5 mr-1.5 opacity-70" aria-hidden="true" />
                Kelompok
                {selectedGroups.length > 0 && (
                  <span className="ml-2 inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-semibold">
                    {selectedGroups.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-3" align="start">
              <div className="space-y-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Filter Kelompok
                </div>
                <div className="space-y-2">
                  {uniqueGroups.map((group, idx) => (
                    <div key={group} className="flex items-center gap-2">
                      <Checkbox
                        id={`${id}-grp-${idx}`}
                        checked={selectedGroups.includes(group)}
                        onCheckedChange={(checked) => handleGroupChange(Boolean(checked), group)}
                      />
                      <Label
                        htmlFor={`${id}-grp-${idx}`}
                        className="flex grow justify-between gap-2 font-normal cursor-pointer"
                      >
                        <span>{group}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {groupFacets?.get(group) ?? 0}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {(searchValue || selectedGroups.length > 0 || sorting.length > 0) && (
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

      {/* Tabel Panduan Istilah */}
      <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1014] overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/90 dark:bg-white/[0.02]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                {headerGroup.headers.map((header) => {
                  const isRight = header.column.id === "currentValue";
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-11 text-[11px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400",
                        header.column.id === "code" && "min-w-[210px]",
                        header.column.id === "currentValue" && "text-right min-w-[115px]",
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
                            isRight && "justify-end",
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  Istilah tidak ditemukan. Coba kata kunci lain.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
