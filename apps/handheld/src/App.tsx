import { lazy, Suspense, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/app-layout";
import ProtectedRoute from "./components/layout/protected-route";
import DashboardPage from "./pages/dashboard-page";
import LoginPage from "./pages/login-page";

const InventoryEntryPage = lazy(() => import("./pages/inventory-entry-page"));
const ScannerPage = lazy(() => import("./pages/scanner-page"));
const RequestsPage = lazy(() => import("./pages/requests-page"));
const InventoryReportsPage = lazy(() => import("./pages/inventory-reports-page"));
const RelocationPage = lazy(() => import("./pages/relocation-page"));
const OrderGatheringPage = lazy(() => import("./pages/order-gathering-page"));
const ProductionPage = lazy(() => import("./pages/production-page"));

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
            <Route path="/inventory/entry" element={<InventoryEntryPage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/reports/inventory" element={<InventoryReportsPage />} />
            <Route path="/inventory/relocate" element={<RelocationPage />} />
            <Route path="/orders/gather" element={<OrderGatheringPage />} />
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/entry" element={<Navigate to="/inventory/entry" replace />} />
            <Route path="/qr" element={<Navigate to="/scanner" replace />} />
            <Route path="/req" element={<Navigate to="/requests" replace />} />
            <Route path="/rep" element={<Navigate to="/reports/inventory" replace />} />
            <Route path="/rel" element={<Navigate to="/inventory/relocate" replace />} />
            <Route path="/taj" element={<Navigate to="/orders/gather" replace />} />
            <Route path="/tol" element={<Navigate to="/production" replace />} />
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
