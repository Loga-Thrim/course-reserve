"use client";

import { useEffect, useState } from "react";
import { FiGrid, FiBook, FiFile, FiCheckCircle, FiAlertCircle, FiClock, FiArrowRight, FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import ProfessorLayout from "../../../components/professor/ProfessorLayout";
import { professorDashboardAPI } from "../../../lib/professorApi";

export default function ProfessorDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage
    const savedUser = localStorage.getItem("professorUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const fetchStats = async () => {
      try {
        const response = await professorDashboardAPI.getStats();
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statCards = [
    {
      title: "รายวิชาทั้งหมด",
      value: stats?.totalCourses || 0,
      icon: FiGrid,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      title: "รายวิชาที่มีหนังสือ",
      value: stats?.coursesWithBooks || 0,
      icon: FiCheckCircle,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      title: "หนังสือที่เพิ่มแล้ว",
      value: stats?.totalBooks || 0,
      icon: FiBook,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      title: "ไฟล์ที่อัปโหลด",
      value: stats?.totalFiles || 0,
      icon: FiFile,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50",
    },
  ];

  const quickActions = [
    {
      title: "ลงทะเบียนรายวิชา",
      description: "เพิ่มและจัดการรายวิชาของคุณ",
      icon: FiGrid,
      href: "/professor/course-registration",
      color: "emerald",
    },
    {
      title: "จัดการหนังสือ",
      description: "เพิ่มหนังสือสำรองให้รายวิชา",
      icon: FiBook,
      href: "/professor/course-books",
      color: "blue",
    },
  ];

  if (loading) {
    return (
      <ProfessorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500"></div>
        </div>
      </ProfessorLayout>
    );
  }

  return (
    <ProfessorLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            สวัสดี, {user?.name || "อาจารย์"}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base">
            ยินดีต้อนรับสู่ระบบทรัพยากรสำรองรายวิชา
          </p>
          {user?.role === 'admin' && (
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
              ผู้ดูแลระบบ
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${card.bgGradient} rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 p-4 sm:p-6`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
                      {card.title}
                    </p>
                    <p className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`bg-gradient-to-r ${card.gradient} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md`}
                  >
                    <Icon className="text-white text-lg sm:text-xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Courses */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiClock className="text-emerald-600" />
                <h2 className="font-semibold text-gray-800">รายวิชาล่าสุด</h2>
              </div>
              <button
                onClick={() => router.push("/professor/course-registration")}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
              >
                ดูทั้งหมด <FiArrowRight className="text-xs" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.recentCourses?.length > 0 ? (
                stats.recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push("/professor/course-registration")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {course.code_th}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {course.name_th}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 ml-2">
                        <span className="flex items-center gap-1">
                          <FiBook className="text-blue-500" /> {course.book_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiFile className="text-orange-500" /> {course.file_count}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(course.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FiGrid className="mx-auto text-3xl text-gray-300 mb-2" />
                  <p className="text-sm">ยังไม่มีรายวิชา</p>
                  <button
                    onClick={() => router.push("/professor/course-registration")}
                    className="mt-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1 mx-auto"
                  >
                    <FiPlus /> เพิ่มรายวิชาแรก
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Courses Needing Books */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-amber-500" />
                <h2 className="font-semibold text-gray-800">รายวิชาที่ยังไม่มีหนังสือ</h2>
              </div>
              <button
                onClick={() => router.push("/professor/course-books")}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
              >
                จัดการ <FiArrowRight className="text-xs" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {stats?.coursesNeedingBooks?.length > 0 ? (
                stats.coursesNeedingBooks.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/professor/course-books?courseId=${course.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {course.code_th}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {course.name_th}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                        ยังไม่มีหนังสือ
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FiCheckCircle className="mx-auto text-3xl text-emerald-400 mb-2" />
                  <p className="text-sm">ทุกรายวิชามีหนังสือแล้ว!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">เมนูลัด</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={index}
                  onClick={() => router.push(action.href)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-gray-100 p-5 cursor-pointer hover:scale-[1.02] group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`bg-${action.color}-100 p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                      <Icon className={`text-2xl text-${action.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {action.description}
                      </p>
                    </div>
                    <FiArrowRight className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
}
