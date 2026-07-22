import { useState } from "react";
import { CheckCircle2, CircleAlert, ScanLine, Truck, XCircle } from "lucide-react";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { useQrScanner } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, WorkflowHeader } from "@/components/workflow";

interface OrderDetail { prodId: string; prodName: string; contCount: number; }

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [permitted, setPermitted] = useState<boolean | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [orderDialog, setOrderDialog] = useState(false);
  const [driverDialog, setDriverDialog] = useState(false);
  const [dispatchCompleted, setDispatchCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverLicense, setDriverLicense] = useState("");
  const { videoRef, canvasRef, cameraError, startScanning } = useQrScanner({ onScan(uid) { setScanResult(uid); setDispatchCompleted(false); void checkPermission(uid); } });

  function scanNextOrder() {
    setScanResult(null);
    setPermitted(null);
    setOrderDetails([]);
    setDispatchCompleted(false);
    startScanning();
  }

  async function checkPermission(uid: string) {
    try {
      const response = await api.get(`${apiBaseUrl}/ordersc/${uid}`);
      const allowed = Boolean(response.data.success);
      setPermitted(allowed);
      if (allowed) toast.success("مجوز حراست معتبر است", { description: uid });
      else toast.error("این سفارش مجوز خروج ندارد", { description: uid });
    } catch (error) {
      setPermitted(false);
      toast.error(getApiErrorMessage(error, "بررسی مجوز سفارش ناموفق بود"));
    }
  }

  async function fetchOrderDetails() {
    if (!scanResult) return;
    try {
      const response = await api.get(`${apiBaseUrl}/orderDetails/${scanResult}`);
      if (response.data.data === "no") return toast.warning("این سفارش فاقد ردیف محصول است");
      setOrderDetails(response.data.data);
      setOrderDialog(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "دریافت جزئیات سفارش ناموفق بود"));
    }
  }

  async function registerDispatch() {
    if (!scanResult || !driverName || !driverPhone || !driverLicense) return;
    setSubmitting(true);
    try {
      await api.post(`${apiBaseUrl}/transports/new`, { orderId: scanResult, tpDriverName: driverName, driverPhone, driverLicense });
      toast.success("خروج سفارش با موفقیت ثبت شد", { description: `${scanResult} · ${driverName}` });
      setPermitted(null); setDispatchCompleted(true); setDriverName(""); setDriverPhone(""); setDriverLicense(""); setDriverDialog(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "ثبت اطلاعات حمل ناموفق بود"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <WorkflowHeader icon={ScanLine} eyebrow="کنترل نهایی" title="اسکن مجوز خروج" description="کد سفارش را مقابل دوربین بگیرید؛ نتیجه اعتبارسنجی به‌صورت خودکار نمایش داده می‌شود." />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
        <div className="scanner-frame"><video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline/><canvas ref={canvasRef} className="hidden"/>{cameraError && <p className="absolute inset-x-4 bottom-4 z-10 rounded-xl bg-red-950/85 p-3 text-center text-sm text-white">{cameraError}</p>}</div>
        <div className="workflow-card flex flex-col justify-between p-5">
          <div><p className="text-xs font-semibold text-blue-700">نتیجه آخرین اسکن</p><div className={`mt-4 flex items-center gap-3 rounded-2xl p-4 ${permitted === true || dispatchCompleted ? "bg-teal-50 text-teal-800" : permitted === false ? "bg-red-50 text-red-800" : "bg-slate-50 text-slate-500"}`}>{permitted === true || dispatchCompleted ? <CheckCircle2 className="h-7 w-7"/> : permitted === false ? <XCircle className="h-7 w-7"/> : <CircleAlert className="h-7 w-7"/>}<div><strong className="block">{dispatchCompleted ? "خروج ثبت شد" : permitted === true ? "خروج مجاز" : permitted === false ? "خروج غیرمجاز" : "منتظر اسکن"}</strong><span className="mt-1 block font-mono text-xs" dir="ltr">{scanResult || "—"}</span></div></div></div>
          <div className="mt-6 grid gap-2"><Button onClick={() => setDriverDialog(true)} disabled={!permitted}><Truck className="ml-2 h-4 w-4"/>ثبت راننده و خروج</Button><Button variant="outline" onClick={() => void fetchOrderDetails()} disabled={!permitted}>مشاهده اقلام سفارش</Button>{scanResult && <Button variant="ghost" onClick={scanNextOrder}>اسکن سفارش بعدی</Button>}</div>
        </div>
      </div>

      <Dialog open={orderDialog} onOpenChange={setOrderDialog}><DialogContent className="max-w-xl rounded-2xl"><DialogHeader><DialogTitle className="text-right">اقلام سفارش {scanResult}</DialogTitle></DialogHeader><div className="grid gap-3 sm:grid-cols-2">{orderDetails.map((item) => <div key={item.prodId} className="rounded-xl border bg-slate-50 p-4"><strong>{item.prodName}</strong><p className="mt-2 text-sm text-slate-500">تعداد: {item.contCount.toLocaleString("fa-IR")}</p></div>)}</div></DialogContent></Dialog>
      <Dialog open={driverDialog} onOpenChange={setDriverDialog}><DialogContent className="max-w-lg rounded-2xl"><DialogHeader><DialogTitle className="text-right">اطلاعات راننده</DialogTitle></DialogHeader><div className="grid gap-4"><Field label="نام و نام خانوادگی"><input className="field-control" value={driverName} onChange={(e) => setDriverName(e.target.value)} /></Field><Field label="شماره تماس"><input className="field-control" inputMode="tel" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} /></Field><Field label="شماره گواهینامه یا کد ملی"><input className="field-control" value={driverLicense} onChange={(e) => setDriverLicense(e.target.value)} /></Field></div><DialogFooter className="gap-2 sm:justify-start"><Button onClick={() => void registerDispatch()} disabled={submitting || !driverName || !driverPhone || !driverLicense}>{submitting ? "در حال ثبت…" : "تایید و ثبت خروج"}</Button><Button variant="outline" onClick={() => setDriverDialog(false)}>انصراف</Button></DialogFooter></DialogContent></Dialog>
    </section>
  );
}
