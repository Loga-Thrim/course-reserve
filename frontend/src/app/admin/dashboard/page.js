"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { adminUsersAPI, adminBooksAPI } from "../../../lib/adminApi";
import { FiUsers, FiBook, FiTrendingUp, FiActivity } from "react-icons/fi";

export default function CMSDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    loading: true,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersResponse, booksResponse] = await Promise.all([
        adminUsersAPI.getAll({ limit: 1 }),
        adminBooksAPI.getAll({ limit: 1 }),
      ]);

      setStats({
        totalUsers: usersResponse.data.pagination.total,
        totalBooks: booksResponse.data.pagination.total,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      title: "ผู้ใช้ทั้งหมด",
      value: stats.totalUsers,
      icon: FiUsers,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "หนังสือทั้งหมด",
      value: stats.totalBooks,
      icon: FiBook,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "หนังสือที่ยืม",
      value: "-",
      icon: FiTrendingUp,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "ผู้ใช้งานออนไลน์",
      value: "-",
      icon: FiActivity,
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 sm:mb-8">แดชบอร์ด</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md hover:shadow-lg transition-all border border-emerald-100/50 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium text-sm">{card.title}</h3>
                  <div className={`bg-gradient-to-r ${card.gradient} p-3 rounded-xl shadow-lg`}>
                    <Icon className="text-white text-xl" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {stats.loading ? "..." : card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md p-6 sm:p-8 border border-emerald-100/50">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            ยินดีต้อนรับสู่ระบบจัดการ
          </h2>
          <p className="text-gray-600 mb-6">
            ระบบแนะนำหนังสือ - สำหรับผู้ดูแลระบบ
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-emerald-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                จัดการผู้ใช้
              </h3>
              <p className="text-sm text-gray-600">
                เพิ่ม แก้ไข และลบข้อมูลผู้ใช้งาน
              </p>
            </div>
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-1">จัดการคณะ</h3>
              <p className="text-sm text-gray-600">
                จัดการข้อมูลคณะต่างๆ ในระบบ
              </p>
            </div>
            <div className="border-l-4 border-emerald-600 pl-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                จัดการหนังสือ
              </h3>
              <p className="text-sm text-gray-600">
                เพิ่ม แก้ไข และจัดการคลังหนังสือ
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
