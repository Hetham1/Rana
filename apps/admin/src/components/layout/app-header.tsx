import { BarChart3, Factory, Home, Inbox, LogOut, Menu, Send } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import BrandSymbol from "@etemad-rana/design-system/assets/brand-symbol.png";

const navigation = [
  { to: "/", label: "خانه", icon: Home, end: true },
  { to: "/requests/received", label: "دریافتی", icon: Inbox },
  { to: "/requests/sent", label: "ارسالی", icon: Send },
  { to: "/reports/inventory", label: "گزارش موجودی", icon: BarChart3 },
  { to: "/reports/production", label: "گزارش تولید", icon: Factory },
];

function NavigationLinks() {
  return (
    <nav className="flex flex-col gap-1 md:flex-row md:items-center" aria-label="ناوبری اصلی">
      {navigation.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
            isActive
              ? "bg-blue-700 text-white shadow-md shadow-blue-800/15"
              : "text-slate-600 hover:bg-blue-50 hover:text-blue-800"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppHeader({ onLogout }: { onLogout: () => void }) {
  const fullName = localStorage.getItem("fullName") || "مدیر سامانه";

  return (
    <header className="app-header sticky top-3 z-50 mx-3 mt-3 rounded-2xl px-4 py-3 md:mx-5 md:px-5" dir="rtl">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-800 to-cyan-500 p-2 shadow-lg shadow-blue-800/20">
            <img src={BrandSymbol} alt="نشان اعتماد رانا" className="h-full w-full object-contain brightness-0 invert" />
          </span>
          <div className="hidden min-w-0 lg:block">
            <p className="font-bold text-slate-900">اعتماد رانا</p>
            <p className="truncate text-xs text-slate-500">پنل مدیریت · {fullName}</p>
          </div>
        </div>

        <div className="hidden md:block">
          <NavigationLinks />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="hidden gap-2 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 sm:flex"
          >
            <LogOut className="h-4 w-4" />
            خروج
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl md:hidden" aria-label="باز کردن منو">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72" dir="rtl">
              <div className="mb-7 mt-3">
                <p className="text-lg font-bold text-slate-900">اعتماد رانا</p>
                <p className="text-sm text-slate-500">{fullName}</p>
              </div>
              <NavigationLinks />
              <Button variant="ghost" onClick={onLogout} className="mt-6 w-full justify-start gap-2 text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
                خروج از حساب
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
