"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import ProfessorSidebar from "./ProfessorSidebar";

export default function ProfessorLayout({ children }) {
  const [professorUser, setProfessorUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/professor/login") {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("professorToken");
    const user = localStorage.getItem("professorUser");

    if (!token || !user) {
      router.push("/professor/login");
      return;
    }

    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== "professor" && parsedUser.role !== "admin") {
      router.push("/professor/login");
      return;
    }

    setProfessorUser(parsedUser);
    setLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("professorToken");
    localStorage.removeItem("professorUser");
    router.push("/professor/login");
  };

  if (pathname === "/professor/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, slide in when open */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:transform-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <ProfessorSidebar onLogout={handleLogout} onClose={() => setMobileMenuOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiMenu className="text-2xl text-gray-600" />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">ทรัพยากรสำรองรายวิชา</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">
                  {professorUser?.name}
                </p>
                <p className="text-xs text-gray-500">{professorUser?.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                {professorUser?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
