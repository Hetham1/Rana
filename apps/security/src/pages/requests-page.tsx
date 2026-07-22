import { useEffect, useState } from "react";
import { ClipboardPlus, Inbox, Plus } from "lucide-react";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, Field, WorkflowHeader } from "@/components/workflow";
import { SelectField } from "@/components/select-field";

interface RequestData { reqId: string; reqDate: string; reqType: string; reqDetail: string; reqSender: string; }
interface UserOption { userId: string; fullName: string; }

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receiver, setReceiver] = useState("");
  const [product, setProduct] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [description, setDescription] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [requestResponse, userResponse, productResponse, manufacturerResponse] = await Promise.all([
        api.get(`${apiBaseUrl}/secrequest`), api.get(`${apiBaseUrl}/users`), api.get(`${apiBaseUrl}/prod/highdemand`), api.get(`${apiBaseUrl}/manf/name`),
      ]);
      setRequests(requestResponse.data.data);
      setUsers(userResponse.data.data.filter((user: UserOption) => user.userId !== localStorage.getItem("userId")));
      setProducts(productResponse.data.data.map((item: { prodName: string }) => item.prodName));
      setManufacturers(manufacturerResponse.data.data.map((item: { manfName: string }) => item.manfName));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "دریافت اطلاعات درخواست‌ها ناموفق بود"));
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadData(); }, []);

  async function submitRequest() {
    if (!receiver || !product || !manufacturer) return;
    setSubmitting(true);
    try {
      await api.post(`${apiBaseUrl}/request/new`, { reqReciever: receiver, reqType: product, reqDetail: `${manufacturer}${description ? ` - ${description}` : ""}` });
      toast.success("درخواست جدید ارسال شد");
      setReceiver(""); setProduct(""); setManufacturer(""); setDescription(""); setDialogOpen(false);
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "ارسال درخواست ناموفق بود"));
    } finally { setSubmitting(false); }
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <WorkflowHeader icon={ClipboardPlus} eyebrow="هماهنگی ورود" title="درخواست‌های حراست" description="درخواست جدید بسازید و موارد در انتظار را یکجا پیگیری کنید." action={<Button onClick={() => setDialogOpen(true)}><Plus className="ml-2 h-4 w-4"/>درخواست جدید</Button>} />
      {loading ? <div className="grid min-h-64 place-items-center"><div className="route-progress" /></div> : requests.length === 0 ? <EmptyState icon={Inbox} title="درخواستی در انتظار نیست" description="درخواست‌های ارسال‌شده شما در این بخش دیده می‌شوند."/> : <div className="grid gap-3 md:grid-cols-2">{requests.map((request) => <article key={request.reqId} className="workflow-card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-slate-400">{request.reqId}</p><h3 className="mt-1 font-bold text-slate-900">{request.reqType}</h3></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">در انتظار</span></div><p className="mt-4 text-sm leading-7 text-slate-600">{request.reqDetail || "بدون توضیح"}</p><p className="mt-4 border-t pt-3 text-xs text-slate-400">{new Date(request.reqDate).toLocaleString("fa-IR")}</p></article>)}</div>}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-xl rounded-2xl"><DialogHeader><DialogTitle className="text-right">ایجاد درخواست جدید</DialogTitle></DialogHeader><div className="grid gap-4"><Field label="محصول پرتقاضا"><SelectField value={product} onValueChange={setProduct} placeholder="انتخاب محصول" options={products.map((item) => ({ value: item, label: item }))} /></Field><Field label="تامین‌کننده"><SelectField value={manufacturer} onValueChange={setManufacturer} placeholder="انتخاب تامین‌کننده" options={manufacturers.map((item) => ({ value: item, label: item }))} /></Field><Field label="ارسال برای"><SelectField value={receiver} onValueChange={setReceiver} placeholder="انتخاب گیرنده" options={users.map((user) => ({ value: user.userId, label: user.fullName }))} /></Field><Field label="توضیحات"><textarea className="field-control min-h-24 py-3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیحات تکمیلی…"/></Field></div><DialogFooter className="gap-2 sm:justify-start"><Button onClick={() => void submitRequest()} disabled={submitting || !receiver || !product || !manufacturer}>{submitting ? "در حال ارسال…" : "ثبت درخواست"}</Button><Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button></DialogFooter></DialogContent></Dialog>
    </section>
  );
}
