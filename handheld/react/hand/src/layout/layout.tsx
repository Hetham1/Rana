import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function Layout() {
  const fullName = localStorage.getItem('fullName');
  const navigate = useNavigate();
  const location = useLocation(); // Get current route location
  const date = new Date().toLocaleString();

  const handleLogout = () => {
    // Clear local storage
    localStorage.clear();
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen w-screen overflow-hidden">
      <header className="bg-supblue text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">خوش آمدید</h1>
          <p>{fullName} | {date}</p>
        </div>
        {/* Show Logout button only on the home page ("/") */}
        {location.pathname === '/' && (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
          >
            خروج
          </button>
        )}
      </header>

      <main className="flex-1 px-4 py-4 overflow-auto bg-whiteback">
        <Outlet />
      </main>
    </div>
  );
}
