import { useState } from "react";
import { CheckCircle2, CircleAlert, Info, ScanLine, XCircle } from "lucide-react";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { useQrScanner } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryDetails } from "@/components/inventory-details";
import { WorkflowHeader } from "@/components/workflow";

type InventoryDetail = Record<string, string | number | boolean | null>;

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [details, setDetails] = useState<InventoryDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const scanner = useQrScanner({ onScan(uid) { setScanResult(uid); void processScan(uid); } });
  const operation = localStorage.getItem("radioOption") === "1" ? "entry" : "exit";
  const operationLabel = operation === "entry" ? "ورود" : "خروج";
  const workplaceId = localStorage.getItem("comboBoxValue");

  async function processScan(uid: string) {
    if (!workplaceId) { toast.error("مکان عملیات مشخص نیست"); return; }
    setProcessing(true);
    try {
      const response = await api.put(`${apiBaseUrl}/${operation}/${uid}`, { wpId: workplaceId });
      setSuccessCount((count) => count + 1);
      if (response.data.success === "alert") toast.warning(response.data.data, { description: response.data.alert });
      else toast.success(`${operationLabel} کالا ثبت شد`, { description: uid });
    } catch (error) {
      setFailureCount((count) => count + 1);
      toast.error(getApiErrorMessage(error, `ثبت ${operationLabel} ناموفق بود`), { description: uid });
    } finally { setProcessing(false); }
  }

  async function fetchDetails() {
    if (!scanResult) return;
    try {
      const response = await api.get(`${apiBaseUrl}/uidDetails/${scanResult}`);
      setDetails(response.data.data[0]);
      setDetailOpen(true);
    } catch (error) { toast.error(getApiErrorMessage(error, "دریافت مشخصات کالا ناموفق بود")); }
  }

  function scanNext() { setScanResult(null); scanner.startScanning(); }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <WorkflowHeader icon={ScanLine} eyebrow={`عملیات ${operationLabel}`} title="اسکن شناسه کالا" description="پس از هر ثبت، برای کالای بعدی دکمه ادامه اسکن را بزنید." />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
        <div className="scanner-frame"><video ref={scanner.videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline/><canvas ref={scanner.canvasRef} className="hidden"/>{scanner.cameraError && <p className="absolute inset-x-4 bottom-4 z-10 rounded-xl bg-red-950/85 p-3 text-center text-sm text-white">{scanner.cameraError}</p>}</div>
        <div className="space-y-4">
          <div className="workflow-card p-5"><p className="text-xs font-semibold text-blue-700">آخرین شناسه</p><div className="mt-3 flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-blue-800">{processing ? <div className="route-progress h-6 w-6"/> : scanResult ? <CheckCircle2 className="h-6 w-6"/> : <CircleAlert className="h-6 w-6"/>}<span className="break-all font-mono text-sm" dir="ltr">{scanResult || "منتظر اسکن…"}</span></div><div className="mt-4 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => void fetchDetails()} disabled={!scanResult}><Info className="ml-2 h-4 w-4"/>مشخصات</Button><Button onClick={scanNext} disabled={!scanResult || processing}>اسکن بعدی</Button></div></div>
          <div className="grid grid-cols-2 gap-3"><div className="workflow-card bg-teal-50 p-4 text-teal-800"><CheckCircle2 className="h-5 w-5"/><strong className="mt-3 block text-3xl">{successCount.toLocaleString("fa-IR")}</strong><span className="text-xs">ثبت موفق</span></div><div className="workflow-card bg-red-50 p-4 text-red-800"><XCircle className="h-5 w-5"/><strong className="mt-3 block text-3xl">{failureCount.toLocaleString("fa-IR")}</strong><span className="text-xs">ناموفق</span></div></div>
        </div>
      </div>
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}><DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl"><DialogHeader><DialogTitle className="text-right">مشخصات {scanResult}</DialogTitle></DialogHeader>{details && <InventoryDetails detail={details}/>}</DialogContent></Dialog>
    </section>
  );
}
