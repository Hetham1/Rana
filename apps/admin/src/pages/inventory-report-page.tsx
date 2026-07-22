import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, Filter, Package, RotateCcw, Search, ShoppingBasket } from "lucide-react";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportDataTable, type ReportColumn, type ReportRow } from "@/components/report-data-table";

interface Workplace { wpId: string; wpName: string; }
type InventoryType = "wsp" | "ins" | "car" | "fip";

const inventoryTypes: Array<{ value: InventoryType; label: string; description: string; icon: typeof Boxes }> = [
  { value: "wsp", label: "قرقره", description: "سیم و هادی", icon: Boxes },
  { value: "ins", label: "عایق", description: "مواد و بچ", icon: Package },
  { value: "car", label: "سبد", description: "محصول میانی", icon: ShoppingBasket },
  { value: "fip", label: "محصول نهایی", description: "آماده ارسال", icon: Package },
];

const headerMappings: Record<InventoryType, Record<string, string>> = {
  wsp: { wspId: "شناسه قرقره", wspDirection: "جهت", wspMaterial: "مواد", wspType: "نوع", wspPp: "برنامه تولید", wspState: "وضعیت", wspDate: "تاریخ", wspIn: "قرقره ورودی", wspOut: "قرقره خروجی", wspLength: "طول", wspWempty: "وزن خالی", wspWfull: "وزن پر", wspWpure: "وزن خالص", wspQC: "کنترل کیفیت", wpId: "محل کار", wspLL: "موقعیت", wspSector: "سکتور", wspBj: "شماره بیجک" },
  ins: { insId: "شناسه عایق", insType: "نوع عایق", insCode: "کد عایق", manfId: "تامین‌کننده", insEntryDate: "تاریخ ورود", insRecNum: "شماره رسید", insState: "وضعیت", insEXP: "تاریخ انقضا", insLoc: "محل", insColor: "رنگ", insCount: "تعداد", insQC: "کنترل کیفیت", wpId: "محل کار", insLL: "موقعیت", insSector: "بخش" },
  car: { cartId: "شناسه سبد", cartType: "نوع سبد", cartDevice: "دستگاه", cartIn: "ورودی", cartOut: "خروجی", cartShift: "شیفت", cartLenght: "طول", prodName: "نام محصول", ppId: "برنامه تولید", cartMFG: "تاریخ تولید", userId: "کاربر", cartColor: "رنگ", insulId: "شناسه عایق", wireSpId: "شناسه قرقره", wpId: "محل کار", cartLL: "موقعیت", cartQc: "کنترل کیفیت" },
  fip: { fpId: "شناسه محصول نهایی", fpType: "نوع محصول", fpCart: "سبد محصول", uesrId: "کاربر", fpEndUserCode: "کد مصرف‌کننده", fpLoc: "محل", fpSituation: "وضعیت", wpId: "محل کار", fpLL: "موقعیت", fpSector: "بخش", fpWrapped: "بسته‌بندی" },
};

export default function InventoryReportPage() {
  const [type, setType] = useState<InventoryType>("wsp");
  const [workplaceId, setWorkplaceId] = useState("");
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async (nextType: InventoryType, selectedWorkplace: string) => {
    setLoading(true);
    try {
      const endpoint = selectedWorkplace ? "/adminreport" : "/adminreport/default";
      const response = await api.get(`${apiBaseUrl}${endpoint}`, { params: { searchType: nextType, ...(selectedWorkplace ? { wpId: selectedWorkplace } : {}) } });
      setRows(response.data.data || []);
      if (!response.data.data?.length) toast.warning("رکوردی با این فیلترها پیدا نشد");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "دریافت گزارش موجودی ناموفق بود"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get(`${apiBaseUrl}/workplace`).then((response) => setWorkplaces(response.data.data || [])).catch((error) => toast.error(getApiErrorMessage(error, "دریافت محل‌های کاری ناموفق بود")));
  }, []);
  useEffect(() => { void fetchRows(type, ""); }, [fetchRows, type]);

  const columns = useMemo<ReportColumn[]>(() => {
    if (!rows.length) return [];
    return Object.keys(rows[0]).map((key) => ({ key, label: headerMappings[type][key] || key }));
  }, [rows, type]);

  function changeType(nextType: InventoryType) {
    setType(nextType);
    setWorkplaceId("");
  }

  return (
    <main className="w-full space-y-6 py-2" dir="rtl">
      <header><p className="text-sm font-semibold text-blue-700">موجودی و گردش کالا</p><h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">گزارش موجودی</h1><p className="mt-2 text-sm text-slate-500">موجودی چهار گروه کالا را با فیلتر محل، جستجو و صفحه‌بندی بررسی کنید.</p></header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {inventoryTypes.map(({ value, label, description, icon: Icon }) => <button key={value} type="button" onClick={() => changeType(value)} className={`flex items-center gap-3 rounded-2xl border p-4 text-right transition-all duration-200 ${type === value ? "border-blue-600 bg-blue-700 text-white shadow-lg shadow-blue-800/15" : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"}`}><span className={`grid h-11 w-11 place-items-center rounded-xl ${type === value ? "bg-white/15" : "bg-blue-50 text-blue-700"}`}><Icon className="h-5 w-5"/></span><span><strong className="block">{label}</strong><small className={type === value ? "text-blue-100" : "text-slate-400"}>{description}</small></span></button>)}
      </section>

      <section className="surface-card flex flex-col gap-4 p-5 lg:flex-row lg:items-end">
        <div className="flex-1"><label className="mb-2 block text-xs font-bold text-slate-600">محل نگهداری</label><Select value={workplaceId || null} onValueChange={(value) => setWorkplaceId(value ?? "")} items={workplaces.map((item) => ({ value: item.wpId, label: item.wpName }))}><SelectTrigger><SelectValue>{(value) => workplaces.find((item) => item.wpId === value)?.wpName || "همه محل‌ها"}</SelectValue></SelectTrigger><SelectContent>{workplaces.map((item) => <SelectItem key={item.wpId} value={item.wpId}>{item.wpName}</SelectItem>)}</SelectContent></Select></div>
        <div className="flex gap-2"><Button variant="outline" className="rounded-xl" onClick={() => { setWorkplaceId(""); void fetchRows(type, ""); }}><RotateCcw className="ml-2 h-4 w-4"/>حذف فیلتر</Button><Button className="rounded-xl" onClick={() => void fetchRows(type, workplaceId)}><Search className="ml-2 h-4 w-4"/>اعمال فیلتر</Button></div>
        <span className="hidden items-center gap-2 text-xs text-slate-400 xl:flex"><Filter className="h-4 w-4"/>نوع کالا: {inventoryTypes.find((item) => item.value === type)?.label}</span>
      </section>

      <ReportDataTable title={`فهرست ${inventoryTypes.find((item) => item.value === type)?.label}`} description={workplaceId ? `نتایج محل ${workplaces.find((item) => item.wpId === workplaceId)?.wpName || workplaceId}` : "تمام محل‌های ثبت‌شده"} rows={rows} columns={columns} loading={loading}/>
    </main>
  );
}
