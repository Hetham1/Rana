import { ArrowRight, LogOut, Warehouse } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

const pageTitles: Record<string, string> = {
  "/": "میزکار عملیات",
  "/inventory/entry": "ثبت ورود و خروج",
  "/scanner": "اسکن شناسه کالا",
  "/requests": "درخواست‌ها",
  "/reports/inventory": "گزارش موجودی",
  "/inventory/relocate": "جانمایی کالا",
  "/orders/gather": "تجمیع سفارش",
  "/production": "ثبت تولید",
};

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const fullName = localStorage.getItem("fullName") || "کاربر عملیات";
  const workplace = localStorage.getItem("workPlace") || "محل کار";
  const isHome = location.pathname === "/";

  function handleLogout() {
    localStorage.clear();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell flex min-h-screen flex-col" dir="rtl">
      <header className="app-header sticky top-3 z-40 mx-3 mt-3 rounded-2xl px-4 py-3 sm:mx-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-800 to-cyan-500 text-white shadow-lg shadow-blue-800/20">
              <Warehouse className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">{pageTitles[location.pathname] || "عملیات انبار"}</h1>
              <p className="truncate text-xs text-slate-500">{fullName} · {workplace}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={isHome ? handleLogout : () => navigate(-1)}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-white text-slate-600 shadow-sm ${isHome ? "hover:border-red-200 hover:bg-red-50 hover:text-red-600" : "hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"}`}
            aria-label={isHome ? "خروج از حساب" : "بازگشت"}
          >
            {isHome ? <LogOut className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <main className="page-shell min-h-0 flex-1 overflow-y-auto px-3 pb-8 pt-5 sm:px-5">
        <Outlet />
      </main>
      <Toaster position="bottom-center" richColors closeButton />
    </div>
  );
}
