import { lazy, Suspense, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/app-layout";
import ProtectedRoute from "./components/layout/protected-route";
import DashboardPage from "./pages/dashboard-page";
import LoginPage from "./pages/login-page";

const ScannerPage = lazy(() => import("./pages/scanner-page"));
const RequestsPage = lazy(() => import("./pages/requests-page"));
const DispatchPage = lazy(() => import("./pages/dispatch-page"));

function RouteFallback() {
  return <div className="grid min-h-64 place-items-center"><div className="route-progress" /></div>;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem("token")));

  return (
    <div className="app-shell">
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />} />
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated}><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/dispatch" element={<DispatchPage />} />
            <Route path="/qr" element={<Navigate to="/scanner" replace />} />
            <Route path="/req" element={<Navigate to="/requests" replace />} />
            <Route path="/taj" element={<Navigate to="/dispatch" replace />} />
          </Route>
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </Suspense>
      <a className="source-code-link" href="https://github.com/Hetham1/etemad" target="_blank" rel="noreferrer">
        کد منبع
      </a>
    </div>
  );
}
