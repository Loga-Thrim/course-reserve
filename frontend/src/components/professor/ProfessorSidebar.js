"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiBook, FiGrid, FiLogOut, FiAward, FiX } from "react-icons/fi";

export default function ProfessorSidebar({ onLogout, onClose }) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/professor/dashboard", icon: FiHome, label: "แดชบอร์ด", color: "blue" },
    { href: "/professor/course-registration", icon: FiGrid, label: "ลงทะเบียนรายวิชา", color: "purple" },
  ];

  return (
    <div className="w-72 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 h-full flex flex-col shadow-xl border-r border-emerald-100">
      {/* Logo */}
      <div className="p-6 bg-white/60 backdrop-blur-sm border-b border-emerald-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiAward className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">ทรัพยากรสำรองรายวิชา</h1>
              <p className="text-xs text-gray-500">Course Reserves</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <FiX className="text-xl text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 transform scale-105"
                      : "bg-white/50 text-gray-700 hover:bg-white hover:shadow-md hover:scale-102"
                  }`}
                >
                  <div className={`${isActive ? "text-white" : "text-emerald-600"}`}>
                    <Icon className="text-xl" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info Section */}
      <div className="p-4 bg-white/60 backdrop-blur-sm border-t border-emerald-100">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-all duration-200 group"
        >
          <FiLogOut className="text-lg group-hover:transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
}
