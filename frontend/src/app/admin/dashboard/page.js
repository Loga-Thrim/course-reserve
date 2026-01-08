"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";
import { adminUsersAPI, adminReportsAPI, adminFacultiesAPI, adminActivityLogsAPI } from "../../../lib/adminApi";
import { 
  FiUsers, FiBook, FiFolder, FiLayers, FiFile, FiGrid,
  FiTrendingUp, FiArrowRight, FiCheckCircle, FiAlertCircle,
  FiLogIn, FiActivity
} from "react-icons/fi";

export default function CMSDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    coursesWithBooks: 0,
    totalBooks: 0,
    totalFiles: 0,
    totalFaculties: 0,
    totalCurriculums: 0,
    loading: true,
  });
  const [facultyStats, setFacultyStats] = useState([]);
  const [activityStats, setActivityStats] = useState(null);
  const [studentReport, setStudentReport] = useState(null);
  const [professorReport, setProfessorReport] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [usersRes, overviewRes, facultyRes, activityRes, studentRes, professorRes] = await Promise.all([
        adminUsersAPI.getAll({ limit: 1 }),
        adminReportsAPI.getOverview(),
        adminReportsAPI.getByFaculty(),
        adminActivityLogsAPI.getStats(),
        adminActivityLogsAPI.getStudentReport(),
        adminActivityLogsAPI.getProfessorReport(),
      ]);

      setStats({
        totalUsers: usersRes.data.pagination?.total || 0,
        totalCourses: overviewRes.data.totalCourses || 0,
        coursesWithBooks: overviewRes.data.coursesWithBooks || 0,
        totalBooks: overviewRes.data.totalBooks || 0,
        totalFiles: overviewRes.data.totalFiles || 0,
        totalFaculties: overviewRes.data.totalFaculties || 0,
        totalCurriculums: overviewRes.data.totalCurriculums || 0,
        loading: false,
      });

      setFacultyStats(facultyRes.data.slice(0, 5));
      setActivityStats(activityRes.data);
      setStudentReport(studentRes.data);
      setProfessorReport(professorRes.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      title: "รายวิชาทั้งหมด",
      value: stats.totalCourses,
      icon: FiGrid,
      color: "emerald",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "รายวิชาที่มีหนังสือ",
      value: stats.coursesWithBooks,
      icon: FiCheckCircle,
      color: "teal",
      gradient: "from-teal-500 to-teal-600",
    },
    {
      title: "ทรัพยากรทั้งหมด",
      value: stats.totalBooks,
      icon: FiBook,
      color: "cyan",
      gradient: "from-cyan-500 to-cyan-600",
    },
    {
      title: "ไฟล์เอกสาร",
      value: stats.totalFiles,
      icon: FiFile,
      color: "amber",
      gradient: "from-amber-500 to-amber-600",
    },
    {
      title: "คณะ",
      value: stats.totalFaculties,
      icon: FiFolder,
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "หลักสูตร",
      value: stats.totalCurriculums,
      icon: FiLayers,
      color: "pink",
      gradient: "from-pink-500 to-pink-600",
    },
    {
      title: "ผู้ใช้ทั้งหมด",
      value: stats.totalUsers,
      icon: FiUsers,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
    },
  ];

  const coursesWithoutBooks = stats.totalCourses - stats.coursesWithBooks;
  const coveragePercent = stats.totalCourses > 0 
    ? Math.round((stats.coursesWithBooks / stats.totalCourses) * 100) 
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              แดชบอร์ด
            </h1>
            <p className="text-gray-500 mt-1">ภาพรวมระบบแนะนำหนังสือประจำวิชา</p>
          </div>
          <Link 
            href="/admin/reports"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-sm"
          >
            ดูรายงานทั้งหมด
            <FiArrowRight />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`bg-gradient-to-r ${card.gradient} p-2 rounded-lg`}>
                    <Icon className="text-white text-lg" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.loading ? "..." : card.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">{card.title}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coverage Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ความครอบคลุมหนังสือ
            </h2>
            
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-emerald-600">
                  {coveragePercent}% ของรายวิชามีหนังสือ
                </span>
              </div>
              <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-100">
                <div
                  style={{ width: `${coveragePercent}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-500" />
                  <span className="text-sm text-gray-700">มีหนังสือแล้ว</span>
                </div>
                <span className="font-semibold text-emerald-600">
                  {stats.coursesWithBooks} วิชา
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="text-amber-500" />
                  <span className="text-sm text-gray-700">ยังไม่มีหนังสือ</span>
                </div>
                <span className="font-semibold text-amber-600">
                  {coursesWithoutBooks} วิชา
                </span>
              </div>
            </div>

            <Link 
              href="/admin/course-books"
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
            >
              จัดการหนังสือประจำวิชา
              <FiArrowRight />
            </Link>
          </div>

          {/* Faculty Stats */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                สถิติตามคณะ
              </h2>
              <Link 
                href="/admin/reports"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                ดูทั้งหมด
              </Link>
            </div>

            {facultyStats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">ไม่มีข้อมูล</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">คณะ</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">รายวิชา</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">หนังสือ</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">ไฟล์</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">ความครอบคลุม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facultyStats.map((faculty, index) => {
                      const coverage = faculty.course_count > 0 
                        ? Math.round((faculty.book_count / faculty.course_count) * 100)
                        : 0;
                      return (
                        <tr key={faculty.faculty_id || index} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <span className="text-sm font-medium text-gray-800 line-clamp-1">
                              {faculty.faculty_name}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="text-sm text-gray-600">{faculty.course_count}</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="text-sm text-emerald-600 font-medium">{faculty.book_count}</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="text-sm text-amber-600">{faculty.file_count}</span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${Math.min(coverage, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-10 text-right">
                                {coverage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Activity Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Usage */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                การใช้งานของนักศึกษา
              </h2>
              <Link 
                href="/admin/activity-logs"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                ดูทั้งหมด
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xl font-bold text-blue-600">{studentReport?.totals?.total_logins || 0}</p>
                <p className="text-xs text-gray-500">เข้าใช้งาน</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xl font-bold text-emerald-600">{studentReport?.totals?.unique_students || 0}</p>
                <p className="text-xs text-gray-500">จำนวนนักศึกษา</p>
              </div>
            </div>

            {/* Top Programs */}
            {studentReport?.byProgram?.length > 0 ? (
              <div className="space-y-2">
                {studentReport.byProgram.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.program || '-'}</p>
                      <p className="text-xs text-gray-400 truncate">{item.faculty}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-2">
                      <span className="text-sm font-medium text-blue-600">{item.login_count}</span>
                      <span className="text-xs text-gray-400">{item.unique_users} คน</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm">ยังไม่มีข้อมูล</p>
            )}
          </div>

          {/* Professor Usage */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                การใช้งานของอาจารย์
              </h2>
              <Link 
                href="/admin/activity-logs"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                ดูทั้งหมด
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xl font-bold text-blue-600">{professorReport?.totals?.total_logins || 0}</p>
                <p className="text-xs text-gray-500">เข้าใช้งาน</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xl font-bold text-emerald-600">{professorReport?.totals?.unique_professors || 0}</p>
                <p className="text-xs text-gray-500">จำนวนอาจารย์</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xl font-bold text-purple-600">{professorReport?.totals?.total_creates || 0}</p>
                <p className="text-xs text-gray-500">เพิ่มข้อมูล</p>
              </div>
            </div>

            {/* Top Professors */}
            {professorReport?.topProfessors?.length > 0 ? (
              <div className="space-y-2">
                {professorReport.topProfessors.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.user_name}</p>
                      <p className="text-xs text-gray-400 truncate">{item.faculty || '-'}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-2">
                      <span className="text-xs text-emerald-600">{item.courses_created} วิชา</span>
                      <span className="text-xs text-purple-600">{item.books_added} หนังสือ</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm">ยังไม่มีข้อมูล</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            การดำเนินการด่วน
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/admin/users"
              className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <FiUsers className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">จัดการผู้ใช้</h3>
                <p className="text-sm text-gray-500">เพิ่ม แก้ไข ลบผู้ใช้</p>
              </div>
            </Link>

            <Link 
              href="/admin/course-books"
              className="flex items-center gap-4 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <FiBook className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">หนังสือประจำวิชา</h3>
                <p className="text-sm text-gray-500">แนะนำหนังสือให้รายวิชา</p>
              </div>
            </Link>

            <Link 
              href="/admin/activity-logs"
              className="flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <FiActivity className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">บันทึกกิจกรรม</h3>
                <p className="text-sm text-gray-500">ดูสถิติการใช้งาน</p>
              </div>
            </Link>

            <Link 
              href="/admin/reports?filter=no-books"
              className="flex items-center gap-4 p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <FiAlertCircle className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">รายวิชาที่ยังไม่มีหนังสือ</h3>
                <p className="text-sm text-gray-500">{coursesWithoutBooks} รายวิชา</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
