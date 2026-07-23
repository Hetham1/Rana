import { useState, type FormEvent } from "react";
import { ArrowLeft, LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient, { apiBaseUrl, getApiErrorMessage } from "@/lib/api";
import BrandLockup from "@etemad-rana/design-system/assets/brand-lockup.png";

interface LoginProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiClient.post(`${apiBaseUrl}/login`, { username, password });
      const session = response.data;

      if (session.role !== "admin") {
        setError("این حساب اجازه ورود به پنل مدیریت را ندارد.");
        return;
      }

      localStorage.setItem("token", session.token);
      localStorage.setItem("workPlace", session.workPlace);
      localStorage.setItem("workPlaceId", session.workPlaceId || "");
      localStorage.setItem("userId", session.userId);
      localStorage.setItem("fullName", session.fullName);
      localStorage.setItem("role", session.role || "");

      onLogin();
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "ورود انجام نشد. اتصال شبکه را بررسی کنید."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10" dir="rtl">
      <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 -left-20 h-96 w-96 rounded-full bg-teal-400/15 blur-3xl" />

      <section className="surface-card page-shell relative w-full max-w-md overflow-hidden p-6 sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-blue-700 to-cyan-500 p-3 shadow-xl shadow-blue-900/20">
            <img src={BrandLockup} alt="نشان اعتماد رانا" className="h-full w-full object-contain brightness-0 invert" />
          </div>
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-blue-700">سامانه یکپارچه اعتماد رانا</p>
          <h1 className="text-2xl font-bold text-slate-900">ورود مدیریت</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">گزارش‌ها، درخواست‌ها و عملیات مدیریتی را از یک نقطه کنترل کنید.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">نام کاربری</span>
            <span className="relative block">
              <UserRound aria-hidden="true" className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                autoComplete="username"
                autoFocus
                className="h-12 w-full rounded-xl border border-slate-200 bg-white/80 pr-11 pl-4 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="نام کاربری خود را وارد کنید"
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">رمز عبور</span>
            <span className="relative block">
              <LockKeyhole aria-hidden="true" className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                autoComplete="current-password"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white/80 pr-11 pl-4 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="رمز عبور"
                required
              />
            </span>
          </label>

          <div className="min-h-6" aria-live="polite">
            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-800 to-blue-600 font-semibold text-white shadow-lg shadow-blue-800/20 hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0"
          >
            {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ArrowLeft className="h-5 w-5" />}
            {isSubmitting ? "در حال بررسی…" : "ورود به سامانه"}
          </button>
        </form>

        <p className="mt-7 text-center text-xs text-slate-400">ارتباط امن با سامانه مرکزی</p>
      </section>
    </main>
  );
}
