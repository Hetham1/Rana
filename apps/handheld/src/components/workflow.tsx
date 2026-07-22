import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function WorkflowHeader({ icon: Icon, eyebrow, title, description, action }: { icon: LucideIcon; eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-800 to-cyan-500 text-white shadow-lg shadow-blue-800/20"><Icon className="h-6 w-6" /></span>
        <div><p className="text-xs font-semibold text-blue-700">{eyebrow}</p><h2 className="mt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return <div className="empty-state"><div><Icon className="mx-auto h-9 w-9 text-slate-400"/><strong className="mt-3 block text-slate-700">{title}</strong><p className="mt-1 text-sm">{description}</p></div></div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}
