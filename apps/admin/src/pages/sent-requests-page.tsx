import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface RequestData { reqId: string; reqDate: string; reqType: string; reqDetail: string; reqOk: string; reqSender: string; reqReciever: string; }
interface UserOption { userId: string; fullName: string; username: string; }
const statuses: Record<string, { label: string; className: string }> = {
  "1": { label: "تایید شده", className: "bg-teal-50 text-teal-700" },
  "0": { label: "رد شده", className: "bg-red-50 text-red-700" },
  pending: { label: "در انتظار", className: "bg-amber-50 text-amber-700" },
};

export default function SentRequestsPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ reqType: "", reqDetail: "", reqReciever: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [requestResponse, userResponse] = await Promise.all([api.get(`${apiBaseUrl}/adminrequest/sent`), api.get(`${apiBaseUrl}/users`)]);
      setRequests(requestResponse.data.data || []);
      setUsers(userResponse.data.data || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "دریافت درخواست‌های ارسالی ناموفق بود"));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  async function deleteRequest(requestId: string) {
    try {
      await api.delete(`${apiBaseUrl}/adminrequest/sent/delete/${requestId}`);
      setRequests((current) => current.filter((request) => request.reqId !== requestId));
      toast.success("درخواست حذف شد");
    } catch (error) { toast.error(getApiErrorMessage(error, "فقط درخواست در انتظار قابل حذف است")); }
  }

  async function submitRequest() {
    if (!form.reqType.trim() || !form.reqReciever) return toast.warning("نوع درخواست و گیرنده الزامی است");
    setSubmitting(true);
    try {
      await api.post(`${apiBaseUrl}/request/new`, form);
      toast.success("درخواست جدید ارسال شد");
      setForm({ reqType: "", reqDetail: "", reqReciever: "" });
      setDialogOpen(false);
      await loadData();
    } catch (error) { toast.error(getApiErrorMessage(error, "ارسال درخواست ناموفق بود")); }
    finally { setSubmitting(false); }
  }

  return (
    <main className="w-full space-y-6 py-2" dir="rtl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-blue-700">هماهنگی بین واحدها</p><h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">درخواست‌های ارسالی</h1><p className="mt-2 text-sm text-slate-500">درخواست جدید ثبت کنید و وضعیت پاسخ‌ها را پیگیری کنید.</p></div><AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}><AlertDialogTrigger asChild><Button className="rounded-xl"><Plus className="ml-2 h-4 w-4"/>درخواست جدید</Button></AlertDialogTrigger><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle className="text-right">ایجاد درخواست جدید</AlertDialogTitle></AlertDialogHeader><div className="grid gap-4 py-2"><label><span className="mb-2 block text-xs font-bold text-slate-600">نوع درخواست</span><Input className="h-11 rounded-xl" value={form.reqType} onChange={(event) => setForm({ ...form, reqType: event.target.value })} placeholder="مثلاً تامین مواد اولیه"/></label><label><span className="mb-2 block text-xs font-bold text-slate-600">گیرنده</span><Select value={form.reqReciever || null} onValueChange={(value) => setForm({ ...form, reqReciever: value ?? "" })} items={users.map((user) => ({ value: user.userId, label: user.fullName }))}><SelectTrigger><SelectValue>{(value) => users.find((user) => user.userId === value)?.fullName || "انتخاب گیرنده"}</SelectValue></SelectTrigger><SelectContent>{users.map((user) => <SelectItem key={user.userId} value={user.userId}>{user.fullName} · {user.username}</SelectItem>)}</SelectContent></Select></label><label><span className="mb-2 block text-xs font-bold text-slate-600">جزئیات</span><Textarea className="min-h-28 rounded-xl" value={form.reqDetail} onChange={(event) => setForm({ ...form, reqDetail: event.target.value })} placeholder="توضیحات تکمیلی…"/></label></div><AlertDialogFooter className="gap-2"><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={(event) => { event.preventDefault(); void submitRequest(); }} disabled={submitting}>{submitting ? "در حال ارسال…" : "ارسال درخواست"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></header>
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,.45)]">
        {loading ? <div className="grid min-h-64 place-items-center"><div className="route-progress"/></div> : requests.length === 0 ? <div className="grid min-h-72 place-items-center text-center"><div><Send className="mx-auto h-8 w-8 text-slate-300"/><h2 className="mt-4 font-bold text-slate-800">هنوز درخواستی ارسال نشده</h2></div></div> : <Table><TableHeader><TableRow><TableHead>شناسه</TableHead><TableHead>تاریخ</TableHead><TableHead>نوع</TableHead><TableHead>جزئیات</TableHead><TableHead>گیرنده</TableHead><TableHead>وضعیت</TableHead><TableHead><span className="sr-only">عملیات</span></TableHead></TableRow></TableHeader><TableBody>{requests.map((request) => { const status = statuses[request.reqOk] || statuses.pending; return <TableRow key={request.reqId}><TableCell><span className="font-mono text-xs font-bold text-blue-700" dir="ltr">{request.reqId}</span></TableCell><TableCell>{new Date(request.reqDate).toLocaleString("fa-IR")}</TableCell><TableCell className="font-semibold text-slate-900">{request.reqType}</TableCell><TableCell><span className="block max-w-sm truncate text-slate-500" title={request.reqDetail}>{request.reqDetail || "بدون جزئیات"}</span></TableCell><TableCell>{request.reqReciever}</TableCell><TableCell><Badge className={`border-0 ${status.className}`}>{status.label}</Badge></TableCell><TableCell><DropdownMenu><DropdownMenuTrigger render={<Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-700"/>}><MoreHorizontal className="h-4 w-4"/><span className="sr-only">عملیات درخواست</span></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400">عملیات</DropdownMenuLabel><DropdownMenuItem disabled={request.reqOk !== "pending"} className="text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700" onClick={() => void deleteRequest(request.reqId)}><Trash2 className="h-4 w-4"/>حذف درخواست</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>; })}</TableBody></Table>}
      </section>
    </main>
  );
}
