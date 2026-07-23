import { useState } from "react";
import { CheckCircle2, Info, MapPinned, ScanLine, XCircle } from "lucide-react";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { useQrScanner } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryDetails } from "@/components/inventory-details";
import { SelectField } from "@/components/select-field";
import { Field, WorkflowHeader } from "@/components/workflow";

type InventoryDetail = Record<string, string | number | boolean | null>;
const sectors = Array.from({ length: 12 }, (_, index) => String.fromCharCode(65 + index));

export default function RelocationPage() {
  const [sector, setSector] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [details, setDetails] = useState<InventoryDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const scanner = useQrScanner({ onScan(uid) { setScanResult(uid); void relocate(uid); } });
  const workplaceId = localStorage.getItem("workPlaceId");
  const workplace = localStorage.getItem("workPlace") || "محل کار";

  async function relocate(uid: string) {
    if (!sector) { toast.warning("قبل از اسکن، سکتور مقصد را انتخاب کنید"); return; }
    if (!workplaceId) { toast.error("شناسه محل کاری در نشست شما موجود نیست"); return; }
    try {
      await api.put(`${apiBaseUrl}/placement/${uid}`, { sectorNew: sector, wpId: workplaceId });
      setSuccessCount((count) => count + 1);
      toast.success(`کالا به سکتور ${sector} منتقل شد`, { description: uid });
    } catch (error) { setFailureCount((count) => count + 1); toast.error(getApiErrorMessage(error, "جانمایی کالا ناموفق بود")); }
  }

  async function fetchDetails() {
    if (!scanResult) return;
    try { const response = await api.get(`${apiBaseUrl}/uidDetails/${scanResult}`); setDetails(response.data.data[0]); setDetailOpen(true); }
    catch (error) { toast.error(getApiErrorMessage(error, "دریافت مشخصات کالا ناموفق بود")); }
  }

  function scanNext() { setScanResult(null); scanner.startScanning(); }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <WorkflowHeader icon={MapPinned} eyebrow={workplace} title="جانمایی کالا" description="سکتور مقصد را انتخاب کنید و سپس شناسه کالا را اسکن کنید." />
      <div className="mb-5 workflow-card p-4"><Field label="سکتور مقصد"><SelectField value={sector} onValueChange={setSector} placeholder="انتخاب سکتور" options={sectors.map((item) => ({ value: item, label: `سکتور ${item}` }))} /></Field></div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
        <div className="scanner-frame"><video ref={scanner.videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline/><canvas ref={scanner.canvasRef} className="hidden"/>{scanner.cameraError && <p className="absolute inset-x-4 bottom-4 z-10 rounded-xl bg-red-950/85 p-3 text-center text-sm text-white">{scanner.cameraError}</p>}</div>
        <div className="space-y-4"><div className="workflow-card p-5"><div className="flex items-center gap-2 text-sm font-semibold text-blue-800"><ScanLine className="h-4 w-4"/>آخرین شناسه</div><p className="mt-3 break-all rounded-xl bg-blue-50 p-4 font-mono text-sm text-blue-700" dir="ltr">{scanResult || "منتظر اسکن…"}</p><div className="mt-4 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => void fetchDetails()} disabled={!scanResult}><Info className="ml-2 h-4 w-4"/>مشخصات</Button><Button onClick={scanNext} disabled={!scanResult}>اسکن بعدی</Button></div></div><div className="grid grid-cols-2 gap-3"><div className="workflow-card bg-teal-50 p-4 text-teal-800"><CheckCircle2 className="h-5 w-5"/><strong className="mt-2 block text-2xl">{successCount.toLocaleString("fa-IR")}</strong><span className="text-xs">موفق</span></div><div className="workflow-card bg-red-50 p-4 text-red-800"><XCircle className="h-5 w-5"/><strong className="mt-2 block text-2xl">{failureCount.toLocaleString("fa-IR")}</strong><span className="text-xs">ناموفق</span></div></div></div>
      </div>
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}><DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl"><DialogHeader><DialogTitle className="text-right">مشخصات {scanResult}</DialogTitle></DialogHeader>{details && <InventoryDetails detail={details}/>}</DialogContent></Dialog>
    </section>
  );
}
