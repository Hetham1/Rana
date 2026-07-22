import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Database, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type ReportRow = Record<string, string | number | boolean | null>;
export interface ReportColumn { key: string; label: string; }

interface ReportDataTableProps {
  title: string;
  description: string;
  rows: ReportRow[];
  columns: ReportColumn[];
  loading?: boolean;
  pageSize?: number;
}

const numberFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 3 });

function formatCell(value: ReportRow[string], key: string) {
  if (value === null || value === "" || value === undefined) return <span className="text-slate-300">—</span>;
  if (typeof value === "boolean" || /qc|wrapped|approval/i.test(key)) {
    const approved = value === true || value === 1 || value === "1" || value === "سالم";
    return <Badge className={approved ? "border-0 bg-teal-50 text-teal-700" : "border-0 bg-amber-50 text-amber-700"}>{approved ? "تایید شده" : "در انتظار"}</Badge>;
  }
  if (/date|mfg|exp/i.test(key) && typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toLocaleDateString("fa-IR");
  }
  if (typeof value === "number") return numberFormatter.format(value);
  if (/state|situation/i.test(key)) {
    const isAvailable = ["ورود", "سالم", "available"].includes(String(value));
    return <Badge className={isAvailable ? "border-0 bg-blue-50 text-blue-700" : "border-0 bg-slate-100 text-slate-600"}>{String(value)}</Badge>;
  }
  return <span className={/id|code/i.test(key) ? "font-mono text-xs font-semibold text-slate-700" : ""} dir={/id|code/i.test(key) ? "ltr" : undefined}>{String(value)}</span>;
}

export function ReportDataTable({ title, description, rows, columns, loading = false, pageSize = 12 }: ReportDataTableProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fa");
    if (!normalized) return rows;
    return rows.filter((row) => columns.some(({ key }) => String(row[key] ?? "").toLocaleLowerCase("fa").includes(normalized)));
  }, [columns, query, rows]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [query, rows]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,.45)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">{filteredRows.length.toLocaleString("fa-IR")} رکورد</span>
          <label className="relative block min-w-64"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 rounded-xl border-slate-200 pr-9" placeholder="جستجو در نتایج…" /></label>
        </div>
      </div>
      {loading ? (
        <div className="grid min-h-64 place-items-center"><div className="route-progress" /></div>
      ) : visibleRows.length === 0 ? (
        <div className="grid min-h-64 place-items-center p-8 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Database className="h-6 w-6"/></span><p className="mt-4 font-semibold text-slate-700">رکوردی برای نمایش نیست</p><p className="mt-1 text-sm text-slate-400">فیلتر یا عبارت جستجو را تغییر دهید.</p></div></div>
      ) : (
        <Table className="min-w-max">
          <TableHeader><TableRow>{columns.map((column) => <TableHead key={column.key}>{column.label}</TableHead>)}</TableRow></TableHeader>
          <TableBody>{visibleRows.map((row, rowIndex) => <TableRow key={String(row.id || row.wspId || row.insId || row.cartId || row.fpId || row.ppId || rowIndex)}>{columns.map((column) => <TableCell key={column.key}>{formatCell(row[column.key], column.key)}</TableCell>)}</TableRow>)}</TableBody>
        </Table>
      )}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
        <p className="text-xs text-slate-400">صفحه {page.toLocaleString("fa-IR")} از {pageCount.toLocaleString("fa-IR")}</p>
        <div className="flex gap-2"><Button size="icon" variant="outline" className="h-9 w-9 rounded-xl" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} aria-label="صفحه قبل"><ChevronRight className="h-4 w-4"/></Button><Button size="icon" variant="outline" className="h-9 w-9 rounded-xl" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount} aria-label="صفحه بعد"><ChevronLeft className="h-4 w-4"/></Button></div>
      </div>
    </section>
  );
}
