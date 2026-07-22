import { useEffect, useMemo, useState } from "react";
import { Filter, PackageOpen, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryDetails } from "@/components/inventory-details";
import { SelectField } from "@/components/select-field";
import { EmptyState, Field, WorkflowHeader } from "@/components/workflow";

type InventoryRow = Record<string, string | number | boolean | null>;
interface Workplace { wpId: string; wpName: string; }
interface Product { prodId: string; prodName: string; }

const sectors = Array.from({ length: 12 }, (_, index) => String.fromCharCode(65 + index));
const materials = ["مس", "آلومینیوم"];
const colors = ["آبی", "قرمز", "مشکی", "سبز", "سفید", "زرد"];

export default function InventoryReportsPage() {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState({ wpId: "", date: "", sector: "", material: "", color: "", type: "" });
  const [groups, setGroups] = useState<InventoryRow[][]>([]);
  const [activeGroup, setActiveGroup] = useState(0);
  const [selected, setSelected] = useState<InventoryRow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`${apiBaseUrl}/workplace`), api.get(`${apiBaseUrl}/prod/name`)]).then(([workplaceResponse, productResponse]) => { setWorkplaces(workplaceResponse.data.data); setProducts(productResponse.data.data); }).catch((error) => toast.error(getApiErrorMessage(error, "دریافت گزینه‌های گزارش ناموفق بود")));
  }, []);

  async function searchInventory() {
    setLoading(true);
    try {
      const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
      const response = await api.get(`${apiBaseUrl}/report/query?${query}`);
      setGroups(response.data.data);
      const firstNonEmpty = response.data.data.findIndex((group: InventoryRow[]) => group.length > 0);
      setActiveGroup(Math.max(0, firstNonEmpty));
      toast.success("گزارش موجودی به‌روزرسانی شد");
    } catch (error) { setGroups([]); toast.error(getApiErrorMessage(error, "کالایی با این فیلترها یافت نشد")); }
    finally { setLoading(false); }
  }

  const activeRows = groups[activeGroup] || [];
  const total = useMemo(() => groups.reduce((sum, group) => sum + group.length, 0), [groups]);
  const groupLabels = ["قرقره", "عایق", "محصول نهایی"];

  return (
    <section className="mx-auto w-full max-w-7xl">
      <WorkflowHeader icon={SlidersHorizontal} eyebrow="جستجوی موجودی" title="گزارش کالاها" description="فیلترها را ترکیب کنید و جزئیات هر کالا را بدون خروج از صفحه ببینید." />
      <div className="workflow-card p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800"><Filter className="h-4 w-4 text-blue-700"/>پارامترهای گزارش</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="مکان"><SelectField value={filters.wpId} onValueChange={(wpId) => setFilters({ ...filters, wpId })} placeholder="همه مکان‌ها" options={workplaces.map((item) => ({ value: item.wpId, label: item.wpName }))} /></Field>
          <Field label="تاریخ ثبت"><input className="field-control" type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })}/></Field>
          <Field label="سکتور"><SelectField value={filters.sector} onValueChange={(sector) => setFilters({ ...filters, sector })} placeholder="همه سکتورها" options={sectors.map((item) => ({ value: item, label: item }))} /></Field>
          <Field label="جنس قرقره"><SelectField value={filters.material} onValueChange={(material) => setFilters({ ...filters, material, color: "", type: "" })} placeholder="همه مواد" options={materials.map((item) => ({ value: item, label: item }))} /></Field>
          <Field label="رنگ عایق"><SelectField value={filters.color} onValueChange={(color) => setFilters({ ...filters, color, material: "", type: "" })} placeholder="همه رنگ‌ها" options={colors.map((item) => ({ value: item, label: item }))} /></Field>
          <Field label="نوع محصول نهایی"><SelectField value={filters.type} onValueChange={(type) => setFilters({ ...filters, type, material: "", color: "" })} placeholder="همه محصولات" options={products.map((item) => ({ value: item.prodName, label: item.prodName }))} /></Field>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => setFilters({ wpId: "", date: "", sector: "", material: "", color: "", type: "" })}>پاک‌کردن فیلترها</Button><Button onClick={() => void searchInventory()} disabled={loading}><Search className="ml-2 h-4 w-4"/>{loading ? "در حال جستجو…" : "جستجو در موجودی"}</Button></div>
      </div>

      <div className="mt-5">
        {groups.length === 0 ? <EmptyState icon={PackageOpen} title="هنوز گزارشی اجرا نشده" description="فیلترهای موردنظر را انتخاب و دکمه جستجو را بزنید."/> : <><div className="mb-4 flex flex-wrap items-center gap-2">{groupLabels.map((label, index) => <button key={label} type="button" onClick={() => setActiveGroup(index)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeGroup === index ? "bg-blue-700 text-white shadow-md" : "border bg-white text-slate-600 hover:border-blue-300"}`}>{label} ({(groups[index]?.length || 0).toLocaleString("fa-IR")})</button>)}<span className="mr-auto text-xs text-slate-400">مجموع {total.toLocaleString("fa-IR")} رکورد</span></div>{activeRows.length === 0 ? <EmptyState icon={PackageOpen} title={`رکوردی برای ${groupLabels[activeGroup]} نیست`} description="دسته دیگری را انتخاب کنید یا فیلترها را تغییر دهید."/> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{activeRows.map((row, index) => { const id = String(row.wspId || row.insId || row.fpId || index); const sector = row.wspSector || row.insSector || row.fpSector || "—"; return <button key={id} type="button" onClick={() => setSelected(row)} className="workflow-card flex items-center justify-between p-4 text-right hover:border-blue-300 hover:shadow-xl"><div><p className="font-mono text-xs text-blue-700" dir="ltr">{id}</p><strong className="mt-1 block text-sm text-slate-800">{groupLabels[activeGroup]}</strong></div><span className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">سکتور {String(sector)}</span></button>; })}</div>}</>}
      </div>
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl"><DialogHeader><DialogTitle className="text-right">جزئیات کالا</DialogTitle></DialogHeader>{selected && <InventoryDetails detail={selected}/>}</DialogContent></Dialog>
    </section>
  );
}
