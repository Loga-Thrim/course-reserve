"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { adminActivityLogsAPI } from "../../../lib/adminApi";
import { 
  FiActivity, FiFilter, FiDownload, FiRefreshCw, FiUser, FiClock,
  FiLogIn, FiPlus, FiEdit, FiTrash2, FiEye, FiDownloadCloud,
  FiChevronLeft, FiChevronRight, FiSearch, FiX, FiUsers, FiBook
} from "react-icons/fi";

const ACTION_ICONS = {
  login: FiLogIn,
  logout: FiLogIn,
  create: FiPlus,
  update: FiEdit,
  delete: FiTrash2,
  view: FiEye,
  download: FiDownloadCloud,
};

const ACTION_COLORS = {
  login: "text-blue-500 bg-blue-50",
  logout: "text-gray-500 bg-gray-50",
  create: "text-emerald-500 bg-emerald-50",
  update: "text-amber-500 bg-amber-50",
  delete: "text-red-500 bg-red-50",
  view: "text-purple-500 bg-purple-50",
  download: "text-cyan-500 bg-cyan-50",
};

const USER_TYPE_LABELS = {
  student: "นักศึกษา",
  professor: "อาจารย์",
  admin: "ผู้ดูแลระบบ",
};

const ACTION_LABELS = {
  login: "เข้าสู่ระบบ",
  logout: "ออกจากระบบ",
  create: "เพิ่ม",
  update: "แก้ไข",
  delete: "ลบ",
  view: "เข้าดู",
  download: "ดาวน์โหลด",
};

const RESOURCE_LABELS = {
  auth: "",
  course: "รายวิชา",
  book: "หนังสือ",
  file: "ไฟล์",
  user: "ผู้ใช้",
};

export default function ActivityLogsPage() {
  const [activeTab, setActiveTab] = useState("all"); // all, student, professor
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [studentReport, setStudentReport] = useState(null);
  const [professorReport, setProfessorReport] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ userTypes: [], actions: [], resourceTypes: [] });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, totalPages: 0 });
  
  // Filters
  const [filters, setFilters] = useState({
    userType: "",
    action: "",
    resourceType: "",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      fetchLogs();
    } else if (activeTab === "student") {
      fetchStudentReport();
    } else if (activeTab === "professor") {
      fetchProfessorReport();
    }
  }, [activeTab, pagination.page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      };
      const response = await adminActivityLogsAPI.getLogs(params);
      setLogs(response.data.logs);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }));
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminActivityLogsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchStudentReport = async () => {
    try {
      setLoading(true);
      const response = await adminActivityLogsAPI.getStudentReport();
      setStudentReport(response.data);
    } catch (error) {
      console.error("Error fetching student report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessorReport = async () => {
    try {
      setLoading(true);
      const response = await adminActivityLogsAPI.getProfessorReport();
      setProfessorReport(response.data);
    } catch (error) {
      console.error("Error fetching professor report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await adminActivityLogsAPI.getFilterOptions();
      setFilterOptions(response.data);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      userType: "",
      action: "",
      resourceType: "",
      search: "",
      startDate: "",
      endDate: "",
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = async () => {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const response = await adminActivityLogsAPI.exportLogs(params);
      
      const data = response.data;
      if (data.length === 0) return;
      
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
      ].join('\n');
      
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error("Error exporting logs:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  const tabs = [
    { id: "all", label: "ทั้งหมด", icon: FiActivity },
    { id: "student", label: "นักศึกษา", icon: FiUsers },
    { id: "professor", label: "อาจารย์", icon: FiBook },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              บันทึกกิจกรรม
            </h1>
            <p className="text-gray-500 mt-1">ติดตามการใช้งานระบบของผู้ใช้ทั้งหมด</p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "all" && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  showFilters || hasActiveFilters
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FiFilter />
                ตัวกรอง
              </button>
            )}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm"
            >
              <FiDownload />
              ส่งออก
            </button>
            <button
              onClick={() => {
                fetchStats();
                if (activeTab === "all") fetchLogs();
                else if (activeTab === "student") fetchStudentReport();
                else fetchProfessorReport();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-sm"
            >
              <FiRefreshCw />
              รีเฟรช
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Stats Cards - Show for All tab */}
        {activeTab === "all" && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FiLogIn className="text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.allTime?.logins || 0}</p>
                  <p className="text-xs text-gray-500">จำนวนครั้งที่ Login</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <FiPlus className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.allTime?.creates || 0}</p>
                  <p className="text-xs text-gray-500">ข้อมูลใหม่</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FiUser className="text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.allTime?.unique_users || 0}</p>
                  <p className="text-xs text-gray-500">ผู้ใช้งานทั้งหมด</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <FiActivity className="text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.allTime?.total || 0}</p>
                  <p className="text-xs text-gray-500">activity</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Report Tab */}
        {activeTab === "student" && (
          <div className="space-y-6">
            {studentReport && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-2xl font-bold text-blue-600">{studentReport.totals?.total_logins || 0}</p>
                    <p className="text-xs text-gray-500">จำนวนครั้งที่ Login</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-2xl font-bold text-emerald-600">{studentReport.totals?.unique_students || 0}</p>
                    <p className="text-xs text-gray-500">จำนวนนักศึกษา</p>
                  </div>
                </div>

                {/* Combined Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">สถิติการใช้งานของนักศึกษา</h3>
                  {studentReport.byProgram?.length > 0 ? (
                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-white">
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">คณะ / สาขา</th>
                            <th className="text-center py-3 px-3 text-sm font-semibold text-gray-600 w-28">เข้าใช้งาน</th>
                            <th className="text-center py-3 px-3 text-sm font-semibold text-gray-600 w-28">จำนวนนักศึกษา</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentReport.byProgram.map((item, index) => (
                            <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-3 px-3">
                                <p className="text-sm font-medium text-gray-800">{item.program || '-'}</p>
                                <p className="text-xs text-gray-400">{item.faculty}</p>
                              </td>
                              <td className="py-3 px-3 text-center text-sm font-medium text-blue-600">{item.login_count}</td>
                              <td className="py-3 px-3 text-center text-sm text-gray-600">{item.unique_users}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูล</p>
                  )}
                </div>
              </>
            )}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <FiRefreshCw className="animate-spin text-2xl text-emerald-500" />
              </div>
            )}
          </div>
        )}

        {/* Professor Report Tab */}
        {activeTab === "professor" && (
          <div className="space-y-6">
            {professorReport && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-2xl font-bold text-blue-600">{professorReport.totals?.total_logins || 0}</p>
                    <p className="text-xs text-gray-500">จำนวนครั้งที่ Login</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-2xl font-bold text-emerald-600">{professorReport.totals?.unique_professors || 0}</p>
                    <p className="text-xs text-gray-500">จำนวนอาจารย์</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <p className="text-2xl font-bold text-purple-600">{professorReport.totals?.total_creates || 0}</p>
                    <p className="text-xs text-gray-500">เพิ่มข้อมูลใหม่</p>
                  </div>
                </div>

                {/* Combined Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">สถิติการใช้งานของอาจารย์</h3>
                  {professorReport.topProfessors?.length > 0 ? (
                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-white">
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">ชื่อ / คณะ</th>
                            <th className="text-center py-3 px-3 text-sm font-semibold text-gray-600 w-24">สร้างวิชา</th>
                            <th className="text-center py-3 px-3 text-sm font-semibold text-gray-600 w-24">เพิ่มหนังสือ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {professorReport.topProfessors.map((item, index) => (
                            <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-3 px-3">
                                <p className="text-sm font-medium text-gray-800">{item.user_name}</p>
                                <p className="text-xs text-gray-400">{item.faculty || '-'}</p>
                              </td>
                              <td className="py-3 px-3 text-center text-sm text-emerald-600">{item.courses_created}</td>
                              <td className="py-3 px-3 text-center text-sm text-purple-600">{item.books_added}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูล</p>
                  )}
                </div>
              </>
            )}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <FiRefreshCw className="animate-spin text-2xl text-emerald-500" />
              </div>
            )}
          </div>
        )}

        {/* All Logs Tab */}
        {activeTab === "all" && (
          <>
            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">ตัวกรอง</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <FiX className="text-xs" />
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ค้นหา</label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        placeholder="ชื่อ, อีเมล..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ประเภทผู้ใช้</label>
                    <select
                      value={filters.userType}
                      onChange={(e) => handleFilterChange("userType", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">ทั้งหมด</option>
                      {filterOptions.userTypes.map(type => (
                        <option key={type} value={type}>{USER_TYPE_LABELS[type] || type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">การกระทำ</label>
                    <select
                      value={filters.action}
                      onChange={(e) => handleFilterChange("action", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">ทั้งหมด</option>
                      {filterOptions.actions.map(action => (
                        <option key={action} value={action}>{ACTION_LABELS[action] || action}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ประเภททรัพยากร</label>
                    <select
                      value={filters.resourceType}
                      onChange={(e) => handleFilterChange("resourceType", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">ทั้งหมด</option>
                      {filterOptions.resourceTypes.map(type => (
                        <option key={type} value={type}>{RESOURCE_LABELS[type] || type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ตั้งแต่วันที่</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange("startDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ถึงวันที่</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange("endDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">เวลา</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">ผู้ใช้</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">ประเภท</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">การกระทำ</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">รายละเอียด</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <div className="flex items-center justify-center gap-2 text-gray-500">
                            <FiRefreshCw className="animate-spin" />
                            กำลังโหลด...
                          </div>
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500">
                          ไม่พบข้อมูล
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => {
                        const ActionIcon = ACTION_ICONS[log.action] || FiActivity;
                        const actionColor = ACTION_COLORS[log.action] || "text-gray-500 bg-gray-50";
                        return (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiClock className="text-gray-400 text-xs" />
                                {formatDate(log.created_at)}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{log.user_name || '-'}</p>
                                <p className="text-xs text-gray-400">{log.user_email}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                log.user_type === 'student' ? 'bg-blue-50 text-blue-600' :
                                log.user_type === 'professor' ? 'bg-purple-50 text-purple-600' :
                                'bg-amber-50 text-amber-600'
                              }`}>
                                {USER_TYPE_LABELS[log.user_type] || log.user_type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${actionColor}`}>
                                  <ActionIcon className="text-sm" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    {ACTION_LABELS[log.action] || log.action}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {RESOURCE_LABELS[log.resource_type] || log.resource_type}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm text-gray-600 max-w-xs truncate" title={log.resource_name}>
                                {log.resource_name || '-'}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs text-gray-400 font-mono">
                                {log.ip_address?.replace('::ffff:', '') || '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    แสดง {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} จาก {pagination.total} รายการ
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft />
                    </button>
                    <span className="text-sm text-gray-600">
                      หน้า {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
