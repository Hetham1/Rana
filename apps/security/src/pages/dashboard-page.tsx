import { ClipboardPlus, PackageCheck, ScanLine } from "lucide-react";
import { NavLink } from "react-router-dom";

const actions = [
  { to: "/requests", title: "درخواست ورود", description: "ثبت درخواست برای ورود افراد یا کالا", icon: ClipboardPlus, color: "from-blue-800 to-blue-600" },
  { to: "/dispatch", title: "سفارش‌های خروجی", description: "مشاهده سفارش‌های تجمیع‌شده", icon: PackageCheck, color: "from-blue-700 to-cyan-600" },
  { to: "/scanner", title: "کنترل خروج", description: "اسکن سفارش و ثبت اطلاعات راننده", icon: ScanLine, color: "from-teal-700 to-teal-500" },
];

export default function DashboardPage() {
  return (
    <section className="mx-auto max-w-4xl py-3">
      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-700">کنترل تردد</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">عملیات شیفت جاری</h2>
        <p className="mt-2 text-sm text-slate-500">وضعیت سفارش را پیش از خروج کنترل و اطلاعات حمل را کامل ثبت کنید.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map(({ to, title, description, icon: Icon, color }, index) => (
          <NavLink
            key={to}
            to={to}
            className="action-tile group flex min-h-44 flex-col justify-between p-5"
            style={{ animation: `page-enter 420ms ${index * 70}ms cubic-bezier(.22,1,.36,1) both` }}
          >
            <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-md transition-transform duration-200 group-hover:scale-105`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="mt-6">
              <strong className="block text-lg text-slate-900">{title}</strong>
              <span className="mt-1 block text-sm leading-6 text-slate-500">{description}</span>
            </span>
          </NavLink>
        ))}
      </div>
    </section>
  );
}
