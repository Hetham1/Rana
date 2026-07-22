import { useEffect, useState } from "react";
import { Factory, ScanLine } from "lucide-react";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { useQrScanner } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";
import { Field, WorkflowHeader } from "@/components/workflow";
import { SelectField } from "@/components/select-field";

export default function ProductionPage() {
  const [plans, setPlans] = useState<string[]>([]);
  const [planId, setPlanId] = useState("");
  const [line, setLine] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [scanHandled, setScanHandled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { videoRef, canvasRef, cameraError, startScanning } = useQrScanner({ onScan(uid) { setScanResult(uid); setScanHandled(false); } });

  useEffect(() => { api.get(`${apiBaseUrl}/pp`).then((response) => setPlans(response.data.data.map((item: { ppId: string }) => item.ppId))).catch((error) => toast.error(getApiErrorMessage(error, "دریافت برنامه‌های تولید ناموفق بود"))); }, []);

  async function assignMaterial() {
    if (!planId || !line || !scanResult) return toast.warning("برنامه، خط تولید و شناسه کالا الزامی است");
    setSubmitting(true);
    try {
      await api.put(`${apiBaseUrl}/pp/assign/${planId}`, { uid: scanResult, ppDevice: line });
      toast.success("مواد به برنامه تولید تخصیص یافت", { description: `${scanResult} ← ${planId}` });
      setScanHandled(true);
    } catch (error) { toast.error(getApiErrorMessage(error, "تخصیص مواد به برنامه تولید ناموفق بود")); }
    finally { setSubmitting(false); }
  }

  function scanNextMaterial() {
    setScanResult("");
    setScanHandled(false);
    startScanning();
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <WorkflowHeader icon={Factory} eyebrow="خط تولید" title="تخصیص مواد به برنامه ساخت" description="برنامه و خط را انتخاب کنید، سپس QR قرقره یا عایق را اسکن کنید." />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
        <div className="scanner-frame"><video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" muted playsInline/><canvas ref={canvasRef} className="hidden"/>{cameraError && <p className="absolute inset-x-4 bottom-4 z-10 rounded-xl bg-red-950/85 p-3 text-center text-sm text-white">{cameraError}</p>}</div>
        <div className="workflow-card p-5"><div className="grid gap-4"><Field label="برنامه تولید"><SelectField value={planId} onValueChange={setPlanId} placeholder="انتخاب برنامه" options={plans.map((plan) => ({ value: plan, label: plan }))} /></Field><Field label="خط تولید"><SelectField value={line} onValueChange={setLine} placeholder="انتخاب خط" options={["خط ۱", "خط ۲", "خط ۳"].map((item) => ({ value: item, label: item }))} /></Field><div className="rounded-2xl bg-blue-50 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-blue-800"><ScanLine className="h-4 w-4"/>شناسه اسکن‌شده</div><p className="mt-2 break-all font-mono text-sm text-blue-700" dir="ltr">{scanResult || "منتظر اسکن…"}</p></div></div><Button className="mt-5 w-full" size="lg" onClick={() => void assignMaterial()} disabled={submitting || scanHandled || !planId || !line || !scanResult}>{submitting ? "در حال تخصیص…" : scanHandled ? "با موفقیت ثبت شد" : "ثبت در برنامه تولید"}</Button>{scanResult && <Button className="mt-2 w-full" variant="outline" onClick={scanNextMaterial}>اسکن کالای بعدی</Button>}</div>
      </div>
    </section>
  );
}
