import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Factory, SlidersHorizontal } from "lucide-react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianEn from "react-date-object/locales/persian_en";
import gregorian from "react-date-object/calendars/gregorian";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ReportDataTable, type ReportColumn, type ReportRow } from "@/components/report-data-table";

const headerMappings: Record<string, string> = {
  ppId: "شماره تولید", ppMFG: "تاریخ تولید", ppDevice: "خط تولید", ppProductAmount: "مقدار تولید", ppLinearVel: "سرعت خطی", ppOverlap: "اورلپ", insId: "کد عایق مصرفی", ppProdState: "وضعیت محصول", ppLength: "طول تولیدی", ppGauge: "ضخامت", ppAnnealing: "درصد آنیل", insType: "نوع عایق", insColor: "رنگ عایق", ppSize: "سایز تولید", prodId: "محصول تولیدی", ppOutGauge: "قطر خروجی", ppArcLength: "طول تاب", ppMaterialAmount: "مقدار مواد", ppInSp: "سرعت ورودی", ppOutSp: "سرعت خروجی", ppUserId: "کاربر", ppSituation: "وضعیت", ppDetail: "جزئیات", wspId: "رسانه مصرفی",
};

const pickerStyle = {
  backgroundColor: "#fff",
  borderRadius: "0.75rem",
  padding: "0.75rem",
  border: "1px solid #e2e8f0",
  width: "100%",
  height: "44px",
  fontSize: "14px",
  textAlign: "right" as const,
  cursor: "pointer",
};

export default function ProductionReportPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(180);
  const [startDate, setStartDate] = useState<DateObject | null>(null);
  const [endDate, setEndDate] = useState<DateObject | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  async function fetchRecent(nextDays: number) {
    setLoading(true);
    setDays(nextDays);
    try {
      const response = await api.get(`${apiBaseUrl}/adminreport/pp/default`, { params: { daysBefore: nextDays } });
      setRows(response.data.data || []);
      if (!response.data.data?.length) toast.warning("برنامه تولیدی در این بازه وجود ندارد");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "دریافت گزارش تولید ناموفق بود"));
      setRows([]);
    } finally { setLoading(false); }
  }

  useEffect(() => { void fetchRecent(180); }, []);

  function toGregorian(date: DateObject) {
    return date.convert(gregorian).format("YYYY-MM-DD");
  }

  async function fetchCustomRange() {
    if (!startDate || !endDate) return toast.warning("تاریخ شروع و پایان را انتخاب کنید");
    setLoading(true);
    try {
      const response = await api.get(`${apiBaseUrl}/adminreport/pp`, { params: { startDate: toGregorian(startDate), endDate: toGregorian(endDate) } });
      setRows(response.data.data || []);
      setDays(0);
      setFilterOpen(false);
      if (!response.data.data?.length) toast.warning("برنامه تولیدی در بازه انتخابی وجود ندارد");
      else toast.success("بازه سفارشی گزارش اعمال شد");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "دریافت گزارش تولید ناموفق بود"));
      setRows([]);
    } finally { setLoading(false); }
  }

  const columns = useMemo<ReportColumn[]>(() => rows.length ? Object.keys(rows[0]).map((key) => ({ key, label: headerMappings[key] || key })) : [], [rows]);

  return (
    <main className="w-full space-y-6 py-2" dir="rtl">
      <header><p className="text-sm font-semibold text-blue-700">برنامه‌ریزی و عملکرد خط</p><h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">گزارش تولید</h1><p className="mt-2 text-sm text-slate-500">برنامه‌های تولید، مواد مصرفی و مشخصات فنی خروجی را در بازه دلخواه بررسی کنید.</p></header>

      <section className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Factory className="h-6 w-6"/></span><div><strong className="block text-slate-900">بازه زمانی گزارش</strong><span className="text-xs text-slate-400">{days ? `${days.toLocaleString("fa-IR")} روز اخیر` : "بازه سفارشی"}</span></div></div>
        <div className="flex flex-wrap gap-2">{[7, 30, 180].map((value) => <Button key={value} variant={days === value ? "default" : "outline"} className="rounded-xl" onClick={() => void fetchRecent(value)}>{value.toLocaleString("fa-IR")} روز</Button>)}
          <Drawer open={filterOpen} onOpenChange={setFilterOpen}><DrawerTrigger asChild><Button variant="outline" className="rounded-xl"><SlidersHorizontal className="ml-2 h-4 w-4"/>بازه سفارشی</Button></DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle className="text-center">انتخاب بازه گزارش تولید</DrawerTitle></DrawerHeader><div className="mx-auto grid w-full max-w-2xl gap-4 p-5 sm:grid-cols-2"><label><span className="mb-2 block text-xs font-bold text-slate-600">تاریخ شروع</span><DatePicker calendar={persian} locale={persianEn} value={startDate} onChange={setStartDate} format="YYYY/MM/DD" placeholder="انتخاب تاریخ شروع" style={pickerStyle} calendarPosition="bottom-right"/></label><label><span className="mb-2 block text-xs font-bold text-slate-600">تاریخ پایان</span><DatePicker calendar={persian} locale={persianEn} value={endDate} onChange={setEndDate} format="YYYY/MM/DD" placeholder="انتخاب تاریخ پایان" style={pickerStyle} calendarPosition="bottom-right"/></label></div><DrawerFooter className="mx-auto w-full max-w-2xl"><Button onClick={() => void fetchCustomRange()}><CalendarDays className="ml-2 h-4 w-4"/>اعمال بازه</Button></DrawerFooter></DrawerContent></Drawer>
        </div>
      </section>

      <ReportDataTable title="برنامه‌های تولید" description={days ? `اطلاعات ثبت‌شده در ${days.toLocaleString("fa-IR")} روز اخیر` : "اطلاعات بازه زمانی انتخاب‌شده"} rows={rows} columns={columns} loading={loading}/>
    </main>
  );
}
