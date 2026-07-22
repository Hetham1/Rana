import { lazy, Suspense, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AppHeader from "./components/layout/app-header";
import ProtectedRoute from "./components/layout/protected-route";
import LoginPage from "./pages/login-page";

const DashboardPage = lazy(() => import("./pages/dashboard-page"));
const ReceivedRequestsPage = lazy(() => import("./pages/received-requests-page"));
const SentRequestsPage = lazy(() => import("./pages/sent-requests-page"));
const InventoryReportPage = lazy(() => import("./pages/inventory-report-page"));
const ProductionReportPage = lazy(() => import("./pages/production-report-page"));

function RouteFallback() {
  return (
    <div className="grid min-h-64 place-items-center" role="status" aria-label="در حال بارگذاری">
      <div className="route-progress" />
    </div>
  );
}

function ApplicationRoutes() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem("token")));
  const isLoginPage = location.pathname === "/login";

  function handleLogout() {
    localStorage.clear();
    setIsAuthenticated(false);
  }

  return (
    <div className="app-shell">
      {!isLoginPage && <AppHeader onLogout={handleLogout} />}
      <div className={isLoginPage ? "" : "page-shell px-3 pb-8 pt-5 md:px-5"}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />}
            />
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/requests/received" element={<ReceivedRequestsPage />} />
              <Route path="/requests/sent" element={<SentRequestsPage />} />
              <Route path="/reports/inventory" element={<InventoryReportPage />} />
              <Route path="/reports/production" element={<ProductionReportPage />} />
              <Route path="/req-received" element={<Navigate to="/requests/received" replace />} />
              <Route path="/req-sent" element={<Navigate to="/requests/sent" replace />} />
              <Route path="/rep" element={<Navigate to="/reports/inventory" replace />} />
              <Route path="/pro-rep" element={<Navigate to="/reports/production" replace />} />
            </Route>
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
          </Routes>
        </Suspense>
      </div>
      <a className="source-code-link" href="https://github.com/Hetham1/etemad" target="_blank" rel="noreferrer">
        کد منبع
      </a>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ApplicationRoutes />
    </BrowserRouter>
  );
}
