import { Boxes, ClipboardList, Factory, MapPinned, PackageOpen, ScanLine } from "lucide-react";
import { NavLink } from "react-router-dom";

const actions = [
  { to: "/inventory/entry", title: "ورود و خروج", description: "ثبت گردش کالا با اسکن QR", icon: ScanLine, color: "from-blue-800 to-blue-600" },
  { to: "/requests", title: "درخواست‌ها", description: "بررسی و پاسخ به درخواست‌ها", icon: ClipboardList, color: "from-blue-700 to-cyan-600" },
  { to: "/reports/inventory", title: "گزارش موجودی", description: "جستجو و پایش کالاها", icon: PackageOpen, color: "from-teal-700 to-teal-500" },
  { to: "/inventory/relocate", title: "جانمایی", description: "تغییر سکتور و محل نگهداری", icon: MapPinned, color: "from-blue-800 to-teal-600" },
  { to: "/orders/gather", title: "تجمیع سفارش", description: "آماده‌سازی اقلام سفارش", icon: Boxes, color: "from-blue-700 to-blue-500" },
  { to: "/production", title: "تولید", description: "تخصیص مواد به برنامه تولید", icon: Factory, color: "from-teal-800 to-cyan-600" },
];

export default function DashboardPage() {
  return (
    <section className="mx-auto max-w-4xl py-3">
      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-700">دسترسی سریع</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">امروز چه کاری انجام می‌دهید؟</h2>
        <p className="mt-2 text-sm text-slate-500">عملیات پرتکرار برای کار با یک دست و نمایشگرهای صنعتی بهینه شده‌اند.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
        {actions.map(({ to, title, description, icon: Icon, color }, index) => (
          <NavLink
            key={to}
            to={to}
            className="action-tile group flex flex-col justify-between p-4 sm:p-5"
            style={{ animation: `page-enter 420ms ${index * 55}ms cubic-bezier(.22,1,.36,1) both` }}
          >
            <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-md transition-transform duration-200 group-hover:scale-105`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-5 block">
              <strong className="block text-base text-slate-900">{title}</strong>
              <span className="mt-1 hidden text-xs leading-5 text-slate-500 sm:block">{description}</span>
            </span>
          </NavLink>
        ))}
      </div>
    </section>
  );
}
