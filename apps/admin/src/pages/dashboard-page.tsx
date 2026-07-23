import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Activity, Boxes, ClipboardCheck, PackageCheck, ShoppingCart, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchAnalytics, getApiErrorMessage, type AnalyticsData } from "@/lib/api";

const palette = { blue: "#1254a0", cyan: "#2879d0", teal: "#15a699", amber: "#f59e0b" };
const numberFormatter = new Intl.NumberFormat("fa-IR");
const monthFormatter = new Intl.DateTimeFormat("fa-IR", { month: "short" });
const monthLabel = (value: string) => monthFormatter.format(new Date(`${value}-01T00:00:00`));
const statusLabels: Record<string, string> = { pending: "در انتظار", approved: "تایید شده", denied: "رد شده" };

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      setAnalytics(await fetchAnalytics());
      setUpdatedAt(new Date());
    } catch (error) {
      toast.error(getApiErrorMessage(error, "دریافت اطلاعات داشبورد ناموفق بود"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadAnalytics(); }, [loadAnalytics]);

  if (!analytics && loading) {
    return <div className="grid min-h-[60vh] place-items-center"><div className="route-progress" /></div>;
  }
  if (!analytics) {
    return <div className="surface-card grid min-h-80 place-items-center p-8 text-center"><div><Activity className="mx-auto h-9 w-9 text-slate-300"/><h1 className="mt-4 font-bold text-slate-800">داشبورد در دسترس نیست</h1><Button className="mt-5" onClick={() => void loadAnalytics()}>تلاش دوباره</Button></div></div>;
  }

  const metrics = [
    { label: "کل سفارش‌ها", value: analytics.summary.totalOrders, detail: `${numberFormatter.format(analytics.summary.ordersThisMonth)} سفارش در ماه جاری`, icon: ShoppingCart, tone: "bg-blue-50 text-blue-700" },
    { label: "در انتظار جمع‌آوری", value: analytics.summary.submittedOrders, detail: "نیازمند اقدام واحد عملیات", icon: ClipboardCheck, tone: "bg-cyan-50 text-cyan-700" },
    { label: "تجمیع‌شده", value: analytics.summary.gatheredOrders, detail: "آماده کنترل و خروج", icon: Boxes, tone: "bg-amber-50 text-amber-700" },
    { label: "خارج‌شده", value: analytics.summary.exitedOrders, detail: "ثبت‌شده در چرخه حمل", icon: PackageCheck, tone: "bg-teal-50 text-teal-700" },
  ];

  return (
    <main className="w-full space-y-6 py-2" dir="rtl">
      <header className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-gradient-to-l from-blue-950 via-blue-800 to-cyan-700 p-6 text-white shadow-xl shadow-blue-950/10 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="flex items-center gap-2 text-sm font-semibold text-cyan-100"><Activity className="h-4 w-4"/>مرکز عملیات زنده</div><h1 className="mt-2 text-2xl font-black sm:text-3xl">سلام، {localStorage.getItem("fullName") || "مدیر سامانه"}</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-blue-100">سفارش، تولید، موجودی و درخواست‌ها مستقیماً از PostgreSQL در یک نمای مدیریتی یکپارچه شده‌اند.</p></div>
        <div className="text-left text-xs text-blue-100"><span className="block">آخرین بروزرسانی</span><strong className="mt-1 block text-white">{updatedAt?.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }) || "—"}</strong></div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, tone }) => <article key={label} className="surface-card group flex items-center justify-between gap-4 p-5 transition-transform duration-200 hover:-translate-y-1"><div><p className="text-sm font-semibold text-slate-500">{label}</p><strong className="mt-2 block text-3xl font-black text-slate-900">{numberFormatter.format(value)}</strong><span className="mt-2 block text-xs text-slate-400">{detail}</span></div><span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition-transform duration-200 group-hover:scale-105 ${tone}`}><Icon className="h-6 w-6"/></span></article>)}
      </section>

      <ChartPanel title="روند سفارش‌ها" description="سفارش‌های ثبت‌شده و خارج‌شده در دوازده ماه اخیر" action={<Link className="text-xs font-semibold text-blue-700 hover:text-blue-900" to="/rep">مشاهده گزارش موجودی</Link>}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analytics.monthlyOrders} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
            <defs><linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={palette.blue} stopOpacity={0.28}/><stop offset="95%" stopColor={palette.blue} stopOpacity={0.02}/></linearGradient></defs>
            <CartesianGrid vertical={false} stroke="#e8eef6"/>
            <XAxis dataKey="month" tickFormatter={monthLabel} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }}/>
            <YAxis width={36} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }}/>
            <Tooltip labelFormatter={monthLabel} contentStyle={{ borderRadius: 16, borderColor: "#dbe5f1", direction: "rtl" }}/>
            <Legend/>
            <Area name="کل سفارش" type="monotone" dataKey="total" stroke={palette.blue} strokeWidth={3} fill="url(#ordersGradient)"/>
            <Area name="خارج‌شده" type="monotone" dataKey="exited" stroke={palette.teal} strokeWidth={2.5} fill="transparent"/>
          </AreaChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="روند تولید" description="حجم تولید ثبت‌شده ماهانه و تعداد برنامه‌های اجراشده" action={<Link className="text-xs font-semibold text-blue-700 hover:text-blue-900" to="/pro-rep">گزارش کامل تولید</Link>}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.productionTrend} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e8eef6"/>
            <XAxis dataKey="month" tickFormatter={monthLabel} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }}/>
            <YAxis width={54} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }}/>
            <Tooltip labelFormatter={monthLabel} contentStyle={{ borderRadius: 16, borderColor: "#dbe5f1", direction: "rtl" }}/>
            <Bar name="حجم تولید" dataKey="amount" fill={palette.teal} radius={[9, 9, 0, 0]} maxBarSize={48}/>
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <ChartPanel title="محصولات پرتقاضا" description="تعداد اقلام سفارش‌داده‌شده به تفکیک محصول" compact>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.productDemand} layout="vertical" margin={{ top: 4, right: 8, left: 20, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#e8eef6"/>
              <XAxis type="number" axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" width={120} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#dbe5f1", direction: "rtl" }}/>
              <Bar name="تقاضا" dataKey="quantity" fill={palette.cyan} radius={[0, 9, 9, 0]} maxBarSize={26}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <article className="surface-card p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">سلامت موجودی</h2><p className="mt-1 text-sm text-slate-500">موجودی قابل استفاده و انتظار QC</p></div><Warehouse className="h-6 w-6 text-blue-700"/></div>
          <div className="mt-5 space-y-3">{analytics.inventory.map((item) => { const ratio = item.total ? Math.round((item.available / item.total) * 100) : 0; return <div key={item.key} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"><div className="flex items-center justify-between"><strong className="text-sm text-slate-800">{item.label}</strong><span className="text-xs text-slate-400">{numberFormatter.format(item.available)} از {numberFormatter.format(item.total)}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-l from-blue-700 to-cyan-500 transition-all duration-500" style={{ width: `${ratio}%` }}/></div><div className="mt-2 flex justify-between text-xs"><span className="text-slate-400">{numberFormatter.format(ratio)}٪ آماده</span>{item.qcPending > 0 && <span className="font-semibold text-amber-700">{numberFormatter.format(item.qcPending)} در انتظار QC</span>}</div></div>; })}</div>
        </article>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6"><div><h2 className="text-lg font-bold text-slate-900">آخرین درخواست‌ها</h2><p className="mt-1 text-sm text-slate-500">آخرین گردش‌های کاری بین واحدها</p></div><Link to="/req-received" className="text-xs font-semibold text-blue-700">مشاهده همه</Link></div>
        <div className="divide-y divide-slate-100">{analytics.recentRequests.map((request) => <div key={request.requestId} className="grid gap-3 p-4 transition-colors hover:bg-blue-50/40 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-6"><div><strong className="text-sm text-slate-800">{request.type}</strong><p className="mt-1 text-xs text-slate-400">{request.sender} ← {request.receiver}</p></div><Badge className={request.status === "approved" ? "border-0 bg-teal-50 text-teal-700" : request.status === "denied" ? "border-0 bg-red-50 text-red-700" : "border-0 bg-amber-50 text-amber-700"}>{statusLabels[request.status] || request.status}</Badge><time className="text-xs text-slate-400">{new Date(request.requestedAt).toLocaleDateString("fa-IR")}</time></div>)}</div>
      </section>
    </main>
  );
}

function ChartPanel({ title, description, children, action, compact = false }: { title: string; description: string; children: ReactNode; action?: ReactNode; compact?: boolean }) {
  return <section className="surface-card min-w-0 overflow-hidden p-5 sm:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>{action}</div><div className={compact ? "h-80 w-full min-w-0" : "h-80 w-full min-w-0 sm:h-96"}>{children}</div></section>;
}
