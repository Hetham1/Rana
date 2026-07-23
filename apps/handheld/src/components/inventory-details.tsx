const labels: Record<string, string> = {
  wspId: "شناسه قرقره", wspDirection: "جهت", wspMaterial: "جنس", wspType: "نوع", wspState: "وضعیت", wspDate: "تاریخ ثبت", wspLength: "طول", wspWempty: "وزن خالی", wspWfull: "وزن پر", wspWpure: "وزن خالص", wspQC: "کنترل کیفیت", wspSector: "سکتور",
  insId: "شناسه عایق", insType: "نوع", insCode: "کد", manfId: "تامین‌کننده", insEntryDate: "تاریخ ورود", insRecNum: "شماره رسید", insState: "وضعیت", insEXP: "انقضا", insLoc: "محل", insColor: "رنگ", insCount: "مقدار", insQC: "کنترل کیفیت", insSector: "سکتور",
  fpId: "شناسه محصول", fpType: "نوع", fpCart: "سبد", fpEndUserCode: "کد مصرف‌کننده", fpLoc: "محل", fpWrapped: "بسته‌بندی", fpSituation: "وضعیت", fpSector: "سکتور",
};

export function InventoryDetails({ detail }: { detail: Record<string, string | number | boolean | null> }) {
  const entries = Object.entries(detail).filter(([key, value]) => labels[key] && value !== null && value !== "");
  return <div className="grid gap-3 sm:grid-cols-2">{entries.map(([key, value]) => <div key={key} className="rounded-xl border bg-slate-50 p-3"><span className="block text-xs text-slate-400">{labels[key]}</span><strong className="mt-1 block break-words text-sm text-slate-800">{typeof value === "boolean" ? (value ? "تایید" : "تایید نشده") : String(value)}</strong></div>)}</div>;
}
