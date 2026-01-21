"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { adminReportsAPI, adminFacultiesAPI, adminStudentReportsAPI } from "../../../lib/adminApi";
import { BASE_PATH } from "../../../lib/basePath";
import {
  FiGrid,
  FiBook,
  FiFile,
  FiUsers,
  FiDownload,
  FiFilter,
  FiBarChart2,
  FiPieChart,
  FiList,
  FiChevronDown,
  FiTrendingUp,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiUserCheck,
} from "react-icons/fi";

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [facultyReport, setFacultyReport] = useState([]);
  const [curriculumReport, setCurriculumReport] = useState([]);
  const [courseReport, setCourseReport] = useState([]);
  const [bookReport, setBookReport] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [filters, setFilters] = useState({
    facultyId: "",
    curriculumId: "",
    hasBooks: "",
  });
  const [exporting, setExporting] = useState(false);
  
  // Student reports state
  const [studentOverview, setStudentOverview] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [activeStudents, setActiveStudents] = useState([]);
  const [facultyStats, setFacultyStats] = useState([]);
  const [coursesWithoutStudents, setCoursesWithoutStudents] = useState([]);
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFacultyFilter, setStudentFacultyFilter] = useState("");

  useEffect(() => {
    fetchFaculties();
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === "faculty") fetchFacultyReport();
    if (activeTab === "curriculum") fetchCurriculumReport();
    if (activeTab === "courses") fetchCourseReport();
    if (activeTab === "books") fetchBookReport();
    if (activeTab === "students") fetchStudentOverview();
    if (activeTab === "enrollments") fetchEnrollments();
    if (activeTab === "no-students") fetchCoursesWithoutStudents();
  }, [activeTab, filters, studentPage, studentSearch, studentFacultyFilter]);

  const fetchFaculties = async () => {
    try {
      const response = await adminFacultiesAPI.getAll();
      setFaculties(response.data);
    } catch (error) {
      console.error("Error fetching faculties:", error);
    }
  };

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await adminReportsAPI.getOverview();
      setOverview(response.data);
    } catch (error) {
      console.error("Error fetching overview:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultyReport = async () => {
    try {
      setLoading(true);
      const response = await adminReportsAPI.getByFaculty();
      setFacultyReport(response.data);
    } catch (error) {
      console.error("Error fetching faculty report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurriculumReport = async () => {
    try {
      setLoading(true);
      const response = await adminReportsAPI.getByCurriculum({
        facultyId: filters.facultyId || undefined,
      });
      setCurriculumReport(response.data);
    } catch (error) {
      console.error("Error fetching curriculum report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseReport = async () => {
    try {
      setLoading(true);
      const response = await adminReportsAPI.getCourses({
        facultyId: filters.facultyId || undefined,
        hasBooks: filters.hasBooks || undefined,
      });
      setCourseReport(response.data);
    } catch (error) {
      console.error("Error fetching course report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookReport = async () => {
    try {
      setLoading(true);
      const response = await adminReportsAPI.getBooks({
        facultyId: filters.facultyId || undefined,
      });
      setBookReport(response.data);
    } catch (error) {
      console.error("Error fetching book report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Student report functions
  const fetchStudentOverview = async () => {
    try {
      setLoading(true);
      const [overviewRes, popularRes, activeRes, facultyRes] = await Promise.all([
        adminStudentReportsAPI.getOverview(),
        adminStudentReportsAPI.getPopularCourses({ limit: 10 }),
        adminStudentReportsAPI.getActiveStudents({ limit: 10 }),
        adminStudentReportsAPI.getByFaculty(),
      ]);
      setStudentOverview(overviewRes.data);
      setPopularCourses(popularRes.data);
      setActiveStudents(activeRes.data);
      setFacultyStats(facultyRes.data);
    } catch (error) {
      console.error("Error fetching student overview:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await adminStudentReportsAPI.getEnrollments({
        page: studentPage,
        limit: 20,
        search: studentSearch,
        faculty_id: studentFacultyFilter,
      });
      setEnrollments(response.data.data);
      setStudentTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesWithoutStudents = async () => {
    try {
      setLoading(true);
      const response = await adminStudentReportsAPI.getCoursesWithoutStudents();
      setCoursesWithoutStudents(response.data);
    } catch (error) {
      console.error("Error fetching courses without students:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportStudentEnrollments = async () => {
    try {
      setExporting(true);
      const res = await adminStudentReportsAPI.exportEnrollments();
      const data = res.data;
      if (data.length === 0) {
        alert("ไม่มีข้อมูลสำหรับ Export");
        return;
      }
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map(row => Object.values(row).map(v => `"${v || ''}"`).join(","));
      const csv = [headers, ...rows].join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `student-enrollments-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = async (type, filename) => {
    try {
      setExporting(true);
      const response = await adminReportsAPI.getExportData(type);
      const data = response.data;

      if (data.length === 0) {
        alert("ไม่มีข้อมูลสำหรับ Export");
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              let cell = row[header] ?? "";
              cell = String(cell).replace(/"/g, '""');
              if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(",")
        ),
      ].join("\n");

      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    } catch (error) {
      console.error("Export error:", error);
      alert("เกิดข้อผิดพลาดในการ Export");
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async (type, filename) => {
    try {
      setExporting(true);
      const response = await adminReportsAPI.getExportData(type);
      const data = response.data;

      if (data.length === 0) {
        alert("ไม่มีข้อมูลสำหรับ Export");
        return;
      }

      const headers = Object.keys(data[0]);
      let tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="UTF-8"></head>
        <body>
        <table border="1">
          <tr>${headers.map((h) => `<th style="background:#4ade80;font-weight:bold">${h}</th>`).join("")}</tr>
          ${data.map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`).join("")}
        </table>
        </body></html>
      `;

      const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}_${new Date().toISOString().split("T")[0]}.xls`;
      link.click();
    } catch (error) {
      console.error("Export error:", error);
      alert("เกิดข้อผิดพลาดในการ Export");
    } finally {
      setExporting(false);
    }
  };

  const tabs = [
    { id: "overview", label: "ภาพรวม", icon: FiPieChart, group: "course" },
    { id: "faculty", label: "ตามคณะ", icon: FiBarChart2, group: "course" },
    { id: "curriculum", label: "ตามหลักสูตร", icon: FiList, group: "course" },
    { id: "courses", label: "รายวิชา", icon: FiGrid, group: "course" },
    { id: "books", label: "หนังสือ", icon: FiBook, group: "course" },
    { id: "students", label: "นักศึกษา", icon: FiUserCheck, group: "student" },
    { id: "enrollments", label: "การลงทะเบียน", icon: FiUsers, group: "student" },
    { id: "no-students", label: "วิชาไม่มีนักศึกษา", icon: FiAlertCircle, group: "student" },
  ];

  const statCards = [
    { title: "รายวิชาทั้งหมด", value: overview?.totalCourses || 0, icon: FiGrid, color: "emerald", tab: "courses" },
    { title: "รายวิชาที่มีหนังสือ", value: overview?.coursesWithBooks || 0, icon: FiBook, color: "blue", tab: "courses" },
    { title: "หนังสือทั้งหมด", value: overview?.totalBooks || 0, icon: FiBook, color: "purple", tab: "books" },
    { title: "ไฟล์ทั้งหมด", value: overview?.totalFiles || 0, icon: FiFile, color: "orange", tab: "courses" },
    { title: "คณะที่มีรายวิชา", value: overview?.totalFaculties || 0, icon: FiUsers, color: "pink", tab: "faculty" },
    { title: "หลักสูตรที่มีรายวิชา", value: overview?.totalCurriculums || 0, icon: FiList, color: "cyan", tab: "curriculum" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">รายงาน</h1>
            <p className="text-gray-500 text-sm">สรุปข้อมูลและ Export รายงาน</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <div className="flex flex-wrap gap-4">
            {/* Course Reports Group */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-400 px-2">รายวิชา & หนังสือ</span>
              <div className="flex flex-wrap gap-1">
                {tabs.filter(t => t.group === "course").map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-emerald-500 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="text-base" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Divider */}
            <div className="hidden sm:block w-px bg-gray-200 self-stretch my-1"></div>
            
            {/* Student Reports Group */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-400 px-2">นักศึกษา</span>
              <div className="flex flex-wrap gap-1">
                {tabs.filter(t => t.group === "student").map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setStudentPage(1); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-blue-500 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="text-base" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={index}
                        onClick={() => setActiveTab(card.tab)}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`text-${card.color}-500 text-xl`} />
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                        <p className="text-xs text-gray-500">{card.title}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Export Buttons */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Export รายงาน</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ExportCard
                      title="รายงานรายวิชา"
                      description="รายละเอียดรายวิชาทั้งหมด"
                      onExportCSV={() => exportToCSV("courses", "courses_report")}
                      onExportExcel={() => exportToExcel("courses", "courses_report")}
                      exporting={exporting}
                    />
                    <ExportCard
                      title="รายงานหนังสือ"
                      description="หนังสือที่เพิ่มในรายวิชา"
                      onExportCSV={() => exportToCSV("books", "books_report")}
                      onExportExcel={() => exportToExcel("books", "books_report")}
                      exporting={exporting}
                    />
                    <ExportCard
                      title="สรุปตามคณะ"
                      description="จำนวนรายวิชา/หนังสือแยกตามคณะ"
                      onExportCSV={() => exportToCSV("faculty-summary", "faculty_summary")}
                      onExportExcel={() => exportToExcel("faculty-summary", "faculty_summary")}
                      exporting={exporting}
                    />
                    <ExportCard
                      title="สรุปตามหลักสูตร"
                      description="จำนวนรายวิชา/หนังสือแยกตามหลักสูตร"
                      onExportCSV={() => exportToCSV("curriculum-summary", "curriculum_summary")}
                      onExportExcel={() => exportToExcel("curriculum-summary", "curriculum_summary")}
                      exporting={exporting}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Faculty Tab */}
            {activeTab === "faculty" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">รายงานตามคณะ</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportToCSV("faculty-summary", "faculty_summary")}
                      disabled={exporting}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                    >
                      <FiDownload /> CSV
                    </button>
                    <button
                      onClick={() => exportToExcel("faculty-summary", "faculty_summary")}
                      disabled={exporting}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      <FiDownload /> Excel
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">คณะ</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">หลักสูตร</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">รายวิชา</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">หนังสือ</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ไฟล์</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {facultyReport.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">{row.faculty_name}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">{row.curriculum_count}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">{row.course_count}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">{row.book_count}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600">{row.file_count}</td>
                        </tr>
                      ))}
                      {facultyReport.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">ไม่มีข้อมูล</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50 font-semibold">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-800">รวม</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-800">
                          {facultyReport.reduce((sum, r) => sum + parseInt(r.curriculum_count), 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-800">
                          {facultyReport.reduce((sum, r) => sum + parseInt(r.course_count), 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-800">
                          {facultyReport.reduce((sum, r) => sum + parseInt(r.book_count), 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-800">
                          {facultyReport.reduce((sum, r) => sum + parseInt(r.file_count), 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === "curriculum" && (
              <div className="space-y-4">
                {/* Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <FiFilter className="text-gray-400" />
                      <span className="text-sm text-gray-600">กรอง:</span>
                    </div>
                    <select
                      value={filters.facultyId}
                      onChange={(e) => setFilters({ ...filters, facultyId: e.target.value })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">ทุกคณะ</option>
                      {faculties.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => exportToCSV("curriculum-summary", "curriculum_summary")}
                        disabled={exporting}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                      >
                        <FiDownload /> CSV
                      </button>
                      <button
                        onClick={() => exportToExcel("curriculum-summary", "curriculum_summary")}
                        disabled={exporting}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        <FiDownload /> Excel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">คณะ</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">หลักสูตร</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ระดับ</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">รายวิชา</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">หนังสือ</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ไฟล์</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {curriculumReport.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">{row.faculty_name || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">{row.curriculum_name}</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">{row.curriculum_level || "-"}</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">{row.course_count}</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">{row.book_count}</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">{row.file_count}</td>
                          </tr>
                        ))}
                        {curriculumReport.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">ไม่มีข้อมูล</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div className="space-y-4">
                {/* Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <FiFilter className="text-gray-400" />
                      <span className="text-sm text-gray-600">กรอง:</span>
                    </div>
                    <select
                      value={filters.facultyId}
                      onChange={(e) => setFilters({ ...filters, facultyId: e.target.value })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">ทุกคณะ</option>
                      {faculties.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                    <select
                      value={filters.hasBooks}
                      onChange={(e) => setFilters({ ...filters, hasBooks: e.target.value })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">ทุกสถานะ</option>
                      <option value="true">มีหนังสือ</option>
                      <option value="false">ยังไม่มีหนังสือ</option>
                    </select>
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => exportToCSV("courses", "courses_report")}
                        disabled={exporting}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                      >
                        <FiDownload /> CSV
                      </button>
                      <button
                        onClick={() => exportToExcel("courses", "courses_report")}
                        disabled={exporting}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        <FiDownload /> Excel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">รหัสวิชา</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อวิชา</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">คณะ</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">หลักสูตร</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้สอน</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">หนังสือ</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ไฟล์</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {courseReport.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">
                              <a 
                                href={`${BASE_PATH}/professor/course-books?courseId=${row.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 hover:underline"
                              >
                                {row.code_en || row.code_th}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{row.name_th}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{row.faculty_name || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{row.curriculum_name || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{row.instructors || "-"}</td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                parseInt(row.book_count) > 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                              }`}>
                                {row.book_count}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">{row.file_count}</td>
                          </tr>
                        ))}
                        {courseReport.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">ไม่มีข้อมูล</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-gray-100 text-sm text-gray-500">
                    แสดง {courseReport.length} รายการ
                  </div>
                </div>
              </div>
            )}

            {/* Books Tab */}
            {activeTab === "books" && (
              <div className="space-y-4">
                {/* Filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <FiFilter className="text-gray-400" />
                      <span className="text-sm text-gray-600">กรอง:</span>
                    </div>
                    <select
                      value={filters.facultyId}
                      onChange={(e) => setFilters({ ...filters, facultyId: e.target.value })}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">ทุกคณะ</option>
                      {faculties.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => exportToCSV("books", "books_report")}
                        disabled={exporting}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                      >
                        <FiDownload /> CSV
                      </button>
                      <button
                        onClick={() => exportToExcel("books", "books_report")}
                        disabled={exporting}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        <FiDownload /> Excel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อหนังสือ</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้แต่ง</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">เลขเรียก</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">รายวิชา</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">คณะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bookReport.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate">{row.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{row.author || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{row.callnumber || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{row.course_code} - {row.course_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{row.faculty_name || "-"}</td>
                          </tr>
                        ))}
                        {bookReport.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">ไม่มีข้อมูล</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-gray-100 text-sm text-gray-500">
                    แสดง {bookReport.length} รายการ
                  </div>
                </div>
              </div>
            )}

            {/* Students Overview Tab */}
            {activeTab === "students" && studentOverview && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FiUsers className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-800">{studentOverview.stats?.total_students || 0}</p>
                        <p className="text-sm text-gray-500">นักศึกษาทั้งหมด</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <FiTrendingUp className="text-emerald-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-800">{studentOverview.stats?.total_enrollments || 0}</p>
                        <p className="text-sm text-gray-500">การลงทะเบียนทั้งหมด</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <FiGrid className="text-purple-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-800">{studentOverview.stats?.courses_with_students || 0}</p>
                        <p className="text-sm text-gray-500">วิชาที่มีนักศึกษา</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <FiBook className="text-amber-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-800">{studentOverview.stats?.total_courses || 0}</p>
                        <p className="text-sm text-gray-500">วิชาทั้งหมด</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Popular Courses */}
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">วิชายอดนิยม</h2>
                    {popularCourses.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูล</p>
                    ) : (
                      <div className="space-y-3">
                        {popularCourses.map((course, index) => (
                          <div key={course.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{course.name_th}</p>
                              <p className="text-xs text-gray-500">
                                <a 
                                  href={`${BASE_PATH}/professor/course-books?courseId=${course.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:underline"
                                >
                                  {course.code_en || course.code_th}
                                </a>
                                {' • '}{course.faculty_name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600">{course.student_count}</p>
                              <p className="text-xs text-gray-400">นักศึกษา</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Students */}
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">นักศึกษาที่ลงทะเบียนมากที่สุด</h2>
                    {activeStudents.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูล</p>
                    ) : (
                      <div className="space-y-3">
                        {activeStudents.map((student, index) => (
                          <div key={student.student_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{student.student_name || student.student_id}</p>
                              <p className="text-xs text-gray-500">{student.student_id}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600">{student.course_count}</p>
                              <p className="text-xs text-gray-400">วิชา</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Faculty Stats */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">สถิติตามคณะ</h2>
                    <button
                      onClick={exportStudentEnrollments}
                      disabled={exporting}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      <FiDownload /> Export CSV
                    </button>
                  </div>
                  {facultyStats.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูล</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">คณะ</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">นักศึกษา</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">การลงทะเบียน</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">วิชา</th>
                          </tr>
                        </thead>
                        <tbody>
                          {facultyStats.map((faculty) => (
                            <tr key={faculty.id} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-800">{faculty.faculty_name}</td>
                              <td className="py-3 px-4 text-sm text-center text-blue-600 font-medium">{faculty.student_count}</td>
                              <td className="py-3 px-4 text-sm text-center text-emerald-600 font-medium">{faculty.enrollment_count}</td>
                              <td className="py-3 px-4 text-sm text-center text-purple-600 font-medium">{faculty.course_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enrollments Tab */}
            {activeTab === "enrollments" && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ค้นหารหัสนักศึกษา, ชื่อ, รหัสวิชา..."
                      value={studentSearch}
                      onChange={(e) => { setStudentSearch(e.target.value); setStudentPage(1); }}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-0 outline-none"
                    />
                  </div>
                  <select
                    value={studentFacultyFilter}
                    onChange={(e) => { setStudentFacultyFilter(e.target.value); setStudentPage(1); }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-0 outline-none bg-white"
                  >
                    <option value="">ทุกคณะ</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={exportStudentEnrollments}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
                  >
                    <FiDownload /> Export
                  </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">นักศึกษา</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">รายวิชา</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">คณะ</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">วันที่เพิ่ม</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-gray-500">
                              ไม่พบข้อมูล
                            </td>
                          </tr>
                        ) : (
                          enrollments.map((item) => (
                            <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <p className="font-medium text-gray-800">{item.student_name || "-"}</p>
                                <p className="text-xs text-gray-500">{item.student_id}</p>
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-medium text-gray-800">{item.course_name}</p>
                                <p className="text-xs text-gray-500">{item.course_code}</p>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">{item.faculty_name || "-"}</td>
                              <td className="py-3 px-4 text-sm text-gray-500">{formatDate(item.created_at)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {studentTotalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">หน้า {studentPage} จาก {studentTotalPages}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                          disabled={studentPage === 1}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <FiChevronLeft />
                        </button>
                        <button
                          onClick={() => setStudentPage(p => Math.min(studentTotalPages, p + 1))}
                          disabled={studentPage === studentTotalPages}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Courses Without Students Tab */}
            {activeTab === "no-students" && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm text-gray-500">
                    พบ <span className="font-bold text-amber-600">{coursesWithoutStudents.length}</span> วิชาที่ยังไม่มีนักศึกษาเลือก
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">รหัสวิชา</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">ชื่อวิชา</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">คณะ</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">หนังสือ</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">วันที่สร้าง</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coursesWithoutStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-500">
                            ทุกวิชามีนักศึกษาเลือกแล้ว 🎉
                          </td>
                        </tr>
                      ) : (
                        coursesWithoutStudents.map((course) => (
                          <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <a 
                                href={`${BASE_PATH}/professor/course-books?courseId=${course.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold hover:bg-emerald-200"
                              >
                                {course.code_en || course.code_th}
                              </a>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800">{course.name_th}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{course.faculty_name || "-"}</td>
                            <td className="py-3 px-4 text-sm text-center">
                              <span className={`font-medium ${parseInt(course.book_count) > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {course.book_count}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">{formatDate(course.created_at)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function ExportCard({ title, description, onExportCSV, onExportExcel, exporting }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
      <h4 className="font-medium text-gray-800 mb-1">{title}</h4>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <div className="flex gap-2">
        <button
          onClick={onExportCSV}
          disabled={exporting}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
        >
          <FiDownload /> CSV
        </button>
        <button
          onClick={onExportExcel}
          disabled={exporting}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <FiDownload /> Excel
        </button>
      </div>
    </div>
  );
}
