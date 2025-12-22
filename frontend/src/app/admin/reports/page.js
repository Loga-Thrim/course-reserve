"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { adminReportsAPI, adminFacultiesAPI } from "../../../lib/adminApi";
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

  useEffect(() => {
    fetchFaculties();
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === "faculty") fetchFacultyReport();
    if (activeTab === "curriculum") fetchCurriculumReport();
    if (activeTab === "courses") fetchCourseReport();
    if (activeTab === "books") fetchBookReport();
  }, [activeTab, filters]);

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

  const exportToCSV = async (type, filename) => {
    try {
      setExporting(true);
      const response = await adminReportsAPI.getExportData(type);
      const data = response.data;

      if (data.length === 0) {
        alert("ไม่มีข้อมูลสำหรับ Export");
        return;
      }

      // Convert to CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              let cell = row[header] ?? "";
              // Escape quotes and wrap in quotes if contains comma
              cell = String(cell).replace(/"/g, '""');
              if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(",")
        ),
      ].join("\n");

      // Add BOM for Thai characters
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

      // Create Excel-compatible HTML table
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
    { id: "overview", label: "ภาพรวม", icon: FiPieChart },
    { id: "faculty", label: "ตามคณะ", icon: FiBarChart2 },
    { id: "curriculum", label: "ตามหลักสูตร", icon: FiList },
    { id: "courses", label: "รายวิชา", icon: FiGrid },
    { id: "books", label: "หนังสือ", icon: FiBook },
  ];

  const statCards = [
    { title: "รายวิชาทั้งหมด", value: overview?.totalCourses || 0, icon: FiGrid, color: "emerald" },
    { title: "รายวิชาที่มีหนังสือ", value: overview?.coursesWithBooks || 0, icon: FiBook, color: "blue" },
    { title: "หนังสือทั้งหมด", value: overview?.totalBooks || 0, icon: FiBook, color: "purple" },
    { title: "ไฟล์ทั้งหมด", value: overview?.totalFiles || 0, icon: FiFile, color: "orange" },
    { title: "คณะที่มีรายวิชา", value: overview?.totalFaculties || 0, icon: FiUsers, color: "pink" },
    { title: "หลักสูตรที่มีรายวิชา", value: overview?.totalCurriculums || 0, icon: FiList, color: "cyan" },
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="text-lg" />
                {tab.label}
              </button>
            );
          })}
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
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
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
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{row.code_th}</td>
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
          </>
        )}
      </div>
    </AdminLayout>
  );
}

// Export Card Component
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
