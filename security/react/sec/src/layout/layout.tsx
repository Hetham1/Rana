'use client'

import { useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { LogOutIcon } from 'lucide-react';
import type { Engine, ISourceOptions } from "tsparticles-engine";
import { Toaster } from "@/components/ui/sonner"
export default function Layout() {
  const fullName = localStorage.getItem('fullName');
  const navigate = useNavigate();
  const location = useLocation();
  const date = new Date().toLocaleString();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions: ISourceOptions = {
    background: {
      color: {
        value: "#f3f4f6", // Light gray background
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: {
          enable: false,
        },
        onHover: {
          enable: false,
        },
        resize: true,
      },
    },
    particles: {
      color: {
        value: "#3b82f6", // Blue particles
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: true,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 1400,
        },
        value: 50,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  };

  return (
    <div className="flex flex-col min-h-screen w-screen overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
      />
      <header className="bg-supblue text-white p-4 flex justify-between items-center relative z-10">
        <div>
          
          
          {location.pathname === '/' && (
          <div>
          <h1 className="text-xl font-bold">خوش آمدید</h1>
          </div>
          
        )}
        <p>{fullName} | {date}</p>
        </div>
        {location.pathname === '/' && (
          <div>
          <button
            onClick={handleLogout}
            className="bg-whitebox text-text py-1 text-center px-3 rounded-lg"
          >
            <LogOutIcon/>
          </button>
          </div>
          
        )}
      </header>

      <main className="flex-1 px-4 py-4 overflow-auto relative z-10">
        <Outlet />
        <Toaster position="bottom-center"/>
      </main>
    </div>
  );
}