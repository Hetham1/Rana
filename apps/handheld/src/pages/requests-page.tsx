import { useEffect, useState } from "react";
import { CalendarClock, ClipboardList, Inbox } from "lucide-react";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, WorkflowHeader } from "@/components/workflow";

interface RequestData { reqId: string; reqDate: string; reqType: string; reqDetail: string; reqSender: string; }

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [selected, setSelected] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get(`${apiBaseUrl}/request`).then((response) => setRequests(response.data.data)).catch((error) => toast.error(getApiErrorMessage(error, "دریافت درخواست‌ها ناموفق بود"))).finally(() => setLoading(false)); }, []);

  return (
    <section className="mx-auto w-full max-w-5xl">
      <WorkflowHeader icon={ClipboardList} eyebrow="کارتابل عملیات" title="درخواست‌های در انتظار" description="درخواست‌های ارجاع‌شده به شما را مشاهده و بررسی کنید." />
      {loading ? <div className="grid min-h-64 place-items-center"><div className="route-progress"/></div> : requests.length === 0 ? <EmptyState icon={Inbox} title="درخواستی موجود نیست" description="کارتابل شما در حال حاضر خالی است."/> : <div className="grid gap-3 md:grid-cols-2">{requests.map((request) => <button key={request.reqId} type="button" onClick={() => setSelected(request)} className="workflow-card p-5 text-right hover:border-blue-300 hover:shadow-xl"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-slate-400">{request.reqId}</p><h3 className="mt-1 font-bold text-slate-900">{request.reqType}</h3></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">در انتظار</span></div><p className="mt-4 line-clamp-2 text-sm leading-7 text-slate-500">{request.reqDetail || "بدون توضیح"}</p><p className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-slate-400"><CalendarClock className="h-4 w-4"/>{new Date(request.reqDate).toLocaleString("fa-IR")}</p></button>)}</div>}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-w-lg rounded-2xl"><DialogHeader><DialogTitle className="text-right">{selected?.reqType}</DialogTitle></DialogHeader><p className="rounded-xl bg-slate-50 p-4 text-sm leading-8 text-slate-600">{selected?.reqDetail || "بدون توضیح"}</p><p className="text-xs text-slate-400">ارسال‌کننده: {selected?.reqSender}</p></DialogContent></Dialog>
    </section>
  );
}
