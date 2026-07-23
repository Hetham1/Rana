import { useEffect, useState } from "react";
import { ArrowLeft, LogIn, LogOut, MapPin, ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import api, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, WorkflowHeader } from "@/components/workflow";
import { SelectField } from "@/components/select-field";

interface Workplace { wpId: string; wpName: string; }

export default function InventoryEntryPage() {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [workplaceId, setWorkplaceId] = useState("");
  const [operation, setOperation] = useState<"1" | "2" | "">("");
  const navigate = useNavigate();
  const currentWorkplace = localStorage.getItem("workPlace") || "محل کار ثبت‌نشده";

  useEffect(() => {
    api.get(`${apiBaseUrl}/workplace`).then((response) => setWorkplaces(response.data.data)).catch((error) => toast.error(getApiErrorMessage(error, "دریافت فهرست مکان‌ها ناموفق بود")));
  }, []);

  function continueToScanner() {
    if (!operation || !workplaceId) return toast.warning("نوع عملیات و مکان مقصد را انتخاب کنید");
    localStorage.setItem("radioOption", operation);
    localStorage.setItem("comboBoxValue", workplaceId);
    navigate("/scanner");
  }

  return (
    <section className="mx-auto w-full max-w-4xl">
      <WorkflowHeader icon={ScanLine} eyebrow="گردش موجودی" title="ثبت ورود یا خروج کالا" description="ابتدا نوع عملیات و محل را مشخص کنید، سپس شناسه کالا را اسکن کنید." />
      <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <div className="workflow-card p-5 sm:p-6">
          <Field label="نوع عملیات">
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setOperation("1")} className={`rounded-2xl border p-4 text-right ${operation === "1" ? "border-blue-600 bg-blue-50 text-blue-800 ring-4 ring-blue-500/10" : "bg-white text-slate-600 hover:border-blue-300"}`}><LogIn className="mb-3 h-6 w-6"/><strong className="block">ثبت ورود</strong><span className="mt-1 block text-xs opacity-70">افزودن کالا به موجودی محل</span></button>
              <button type="button" onClick={() => setOperation("2")} className={`rounded-2xl border p-4 text-right ${operation === "2" ? "border-teal-600 bg-teal-50 text-teal-800 ring-4 ring-teal-500/10" : "bg-white text-slate-600 hover:border-teal-300"}`}><LogOut className="mb-3 h-6 w-6"/><strong className="block">ثبت خروج</strong><span className="mt-1 block text-xs opacity-70">کسر کالا از موجودی محل</span></button>
            </div>
          </Field>
          <div className="mt-5"><Field label="مکان عملیات"><SelectField value={workplaceId} onValueChange={setWorkplaceId} placeholder="انتخاب مکان" options={workplaces.map((workplace) => ({ value: workplace.wpId, label: workplace.wpName }))} /></Field></div>
          <Button className="mt-6 w-full" size="lg" onClick={continueToScanner} disabled={!operation || !workplaceId}>ادامه و بازکردن اسکنر<ArrowLeft className="mr-2 h-4 w-4"/></Button>
        </div>
        <aside className="workflow-card flex flex-col justify-center bg-gradient-to-br from-blue-800 to-blue-600 p-6 text-white"><MapPin className="h-8 w-8 text-cyan-200"/><p className="mt-5 text-sm text-blue-100">محل کاری فعلی</p><strong className="mt-1 text-xl">{currentWorkplace}</strong><p className="mt-4 text-sm leading-7 text-blue-100">مکان انتخابی باید با محل فیزیکی عملیات مطابقت داشته باشد. تاریخچه هر حرکت در سامانه ثبت می‌شود.</p></aside>
      </div>
    </section>
  );
}
