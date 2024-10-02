import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/layout';
import Home from './pages/home';
import Entry from './pages/entry';
import QRScanner from './pages/QRScanner';
import Request from './pages/Request';
import Reports from './pages/Reports';
import Login from './pages/login';
import Relocate from './pages/Relocate';
import Gather from './pages/gather';
import ProtectedRoute from './layout/protect';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check for token in localStorage at initialization
    return !!localStorage.getItem('token');
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Optionally recheck authentication when the component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Routes>
        {/* Public route for login */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Private routes wrapped in ProtectedRoute */}
        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/entry" element={<Entry />} />
          <Route path="/qr" element={<QRScanner />} />
          <Route path="/req" element={<Request />} />
          <Route path="/rep" element={<Reports />} />
          <Route path="/rel" element={<Relocate />} />
          <Route path="/taj" element={<Gather />} />
        </Route>

        {/* Fallback route for undefined paths */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;
