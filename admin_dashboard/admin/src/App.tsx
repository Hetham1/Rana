import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Home } from "./pages/Home";
import Header from "./layout/header";
import Requesto from "./pages/RequestO";
import Requesti from "./pages/RequestI";
import Report from "./pages/Report";
import Login from "./pages/login";
import ProtectedRoute from './layout/protect';

/**
 * This component wraps the Header component and determines whether
 * the Header should be rendered or not based on the current location.
 * If the current location is the login page, the Header is not rendered.
 * @param onLogout a function to be called when the user logs out
 * @returns a Header component if the current location is not the login page, otherwise null
 */
function HeaderWrapper({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return null;
  }

  return <Header onLogout={onLogout} />;
}

/**
 * This is the main App component that renders the entire application.
 */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if there is a token in local storage and set isAuthenticated accordingly
    return !!localStorage.getItem('token');
  });

  /**
   * This function is called when the user logs in successfully.
   * It sets isAuthenticated to true.
   */
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  /**
   * This function is called when the user logs out.
   * It removes the token from local storage and sets isAuthenticated to false.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  /**
   * This effect checks if there is a token in local storage and sets isAuthenticated accordingly.
   * This is done to ensure that the application is in the correct state when the user reloads the page.
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      {/* Render the Header component if the current location is not the login page */}
      <HeaderWrapper onLogout={handleLogout} />
      <Routes>
        {/* If the user is not authenticated, redirect to the login page */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
        } />

        {/* If the user is authenticated, render the protected routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          {/* Render the Home page */}
          <Route path="/" element={<Home />} />
          {/* Render the Received Requests page */}
          <Route path="/req-received" element={<Requesti />} />
          {/* Render the Sent Requests page */}
          <Route path="/req-sent" element={<Requesto />} />
          {/* Render the Report page */}
          <Route path="/rep" element={<Report />} />
        </Route>

        {/* If the user is not authenticated, redirect to the login page */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

