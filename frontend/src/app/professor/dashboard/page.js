"use client";

import { useEffect, useState } from "react";
import { FiGrid } from "react-icons/fi";
import { useRouter } from "next/navigation";
import ProfessorLayout from "../../../components/professor/ProfessorLayout";
import { professorCourseRegistrationAPI } from "../../../lib/professorApi";

export default function ProfessorDashboardPage() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    loading: true,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const coursesRes = await professorCourseRegistrationAPI.getAll();

        setStats({
          totalCourses: coursesRes.data.length || 0,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "รายวิชาที่ลงทะเบียน",
      value: stats.loading ? "..." : stats.totalCourses,
      icon: FiGrid,
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <ProfessorLayout>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 sm:mb-8">
          แดชบอร์ด
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md hover:shadow-lg transition-all border border-emerald-100/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-2">
                      {card.title}
                    </p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`bg-gradient-to-r ${card.gradient} w-16 h-16 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="text-white text-2xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => router.push("/professor/course-registration")}
            className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border border-emerald-100/50 p-6 cursor-pointer hover:scale-[1.02]"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-3 rounded-xl">
                <FiGrid className="text-2xl text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  ลงทะเบียนรายวิชา
                </h3>
                <p className="text-sm text-gray-600">
                  เพิ่มและจัดการรายวิชาของคุณ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
}
