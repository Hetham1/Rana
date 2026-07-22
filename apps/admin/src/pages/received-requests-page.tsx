import { useCallback, useEffect, useState } from "react";
import { Check, Inbox, MoreHorizontal, X } from "lucide-react";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RequestData { reqId: string; reqDate: string; reqType: string; reqDetail: string; reqOk: string; reqSender: string; reqReciever: string; }

export default function ReceivedRequestsPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`${apiBaseUrl}/adminrequest/received`);
      setRequests(response.data.data || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "دریافت درخواست‌ها ناموفق بود"));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchRequests(); }, [fetchRequests]);

  async function resolveRequest(requestId: string, action: "approve" | "deny") {
    setWorkingId(requestId);
    try {
      await api.put(`${apiBaseUrl}/adminrequest/received/${action}/${requestId}`);
      toast.success(action === "approve" ? "درخواست تایید شد" : "درخواست رد شد");
      await fetchRequests();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "ثبت تصمیم درخواست ناموفق بود"));
    } finally { setWorkingId(null); }
  }

  return (
    <main className="w-full space-y-6 py-2" dir="rtl">
      <header className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-blue-700">کارتابل مدیریت</p><h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">درخواست‌های دریافتی</h1><p className="mt-2 text-sm text-slate-500">درخواست‌های در انتظار بررسی و تصمیم مدیریتی.</p></div><span className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">{requests.length.toLocaleString("fa-IR")} در انتظار</span></header>
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,.45)]">
        {loading ? <div className="grid min-h-64 place-items-center"><div className="route-progress"/></div> : requests.length === 0 ? <div className="grid min-h-72 place-items-center p-8 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-600"><Inbox className="h-7 w-7"/></span><h2 className="mt-4 font-bold text-slate-800">کارتابل شما خالی است</h2><p className="mt-1 text-sm text-slate-400">همه درخواست‌های دریافتی بررسی شده‌اند.</p></div></div> : <Table><TableHeader><TableRow><TableHead>شناسه</TableHead><TableHead>تاریخ</TableHead><TableHead>نوع درخواست</TableHead><TableHead>جزئیات</TableHead><TableHead>فرستنده</TableHead><TableHead>وضعیت</TableHead><TableHead><span className="sr-only">عملیات</span></TableHead></TableRow></TableHeader><TableBody>{requests.map((request) => <TableRow key={request.reqId}><TableCell><span className="font-mono text-xs font-bold text-blue-700" dir="ltr">{request.reqId}</span></TableCell><TableCell>{new Date(request.reqDate).toLocaleString("fa-IR")}</TableCell><TableCell className="font-semibold text-slate-900">{request.reqType}</TableCell><TableCell><span className="block max-w-sm truncate text-slate-500" title={request.reqDetail}>{request.reqDetail || "بدون جزئیات"}</span></TableCell><TableCell>{request.reqSender}</TableCell><TableCell><Badge className="border-0 bg-amber-50 text-amber-700">در انتظار</Badge></TableCell><TableCell><DropdownMenu><DropdownMenuTrigger render={<Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-700"/>}><MoreHorizontal className="h-4 w-4"/><span className="sr-only">عملیات درخواست</span></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400">تصمیم مدیریت</DropdownMenuLabel><DropdownMenuItem disabled={workingId === request.reqId} className="text-teal-700 data-[highlighted]:bg-teal-50 data-[highlighted]:text-teal-800" onClick={() => void resolveRequest(request.reqId, "approve")}><Check className="h-4 w-4"/>تایید درخواست</DropdownMenuItem><DropdownMenuItem disabled={workingId === request.reqId} className="text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700" onClick={() => void resolveRequest(request.reqId, "deny")}><X className="h-4 w-4"/>رد درخواست</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table>}
      </section>
    </main>
  );
}
