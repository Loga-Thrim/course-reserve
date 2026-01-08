"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { studentAPI } from "../lib/api";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import {
  FiBook,
  FiChevronRight,
  FiGrid,
  FiFile,
  FiPlus,
  FiSearch,
  FiX,
  FiCheck,
  FiTrash2,
  FiChevronDown,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function HomePage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [addingCourse, setAddingCourse] = useState(null);
  const [welcome, setWelcome] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyCourses();
      fetchFaculties();
    }
  }, [isAuthenticated]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMyCourses();
      setMyCourses(response.data);
    } catch (err) {
      console.error("Error fetching my courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await studentAPI.getFaculties();
      setFaculties(response.data);
    } catch (err) {
      console.error("Error fetching faculties:", err);
    }
  };

  const fetchAllCourses = async () => {
    try {
      setLoadingCourses(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedFaculty) params.faculty_id = selectedFaculty;
      const response = await studentAPI.getAllCourses(params);
      setAllCourses(response.data);
    } catch (err) {
      console.error("Error fetching all courses:", err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (showAddModal) {
      fetchAllCourses();
    }
  }, [showAddModal, searchQuery, selectedFaculty]);

  const handleAddCourse = async (courseId) => {
    try {
      setAddingCourse(courseId);
      await studentAPI.addCourse(courseId);
      toast.success("เพิ่มรายวิชาเรียบร้อยแล้ว");
      // Add course to myCourses without re-fetching to prevent scroll jump
      const addedCourse = allCourses.find((c) => c.id === courseId);
      if (addedCourse) {
        setMyCourses((prev) => [
          { ...addedCourse, added_at: new Date().toISOString() },
          ...prev,
        ]);
      } else {
        fetchMyCourses();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "ไม่สามารถเพิ่มรายวิชาได้");
    } finally {
      setAddingCourse(null);
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!confirm("ต้องการลบรายวิชานี้ออกจากรายการหรือไม่?")) return;
    try {
      await studentAPI.removeCourse(courseId);
      toast.success("ลบรายวิชาเรียบร้อยแล้ว");
      fetchMyCourses();
    } catch (err) {
      toast.error(err.response?.data?.error || "ไม่สามารถลบรายวิชาได้");
    }
  };

  const myCourseIds = new Set(myCourses.map((c) => c.id));

  if (authLoading || loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalBooks = myCourses.reduce(
    (sum, c) => sum + parseInt(c.book_count || 0),
    0
  );

  return (
    <>
      {/* {welcome && (
        <div className="main-welcome">
          <div className="welcome-container">
            <button
              className="welcome-button"
              onClick={() => setWelcome(false)}
            >
              เข้าสู่เว็บไซต์
            </button>
          </div>
        </div>
      )} */}

      <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30">
        <Toaster position="top-center" />
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl p-8 mb-8 shadow-xl shadow-emerald-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1 tracking-wide">คลังทรัพยากรสนับสนุนหลักสูตรออนไลน์</p>
                <h1 className="text-2xl font-bold text-white mb-2">
                  สวัสดี, {user?.name || "นักศึกษา"} 👋
                </h1>
                <p className="text-emerald-100/80 text-sm">
                  ค้นหาหนังสือและทรัพยากรประกอบรายวิชาที่คุณลงทะเบียน
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <p className="text-3xl font-bold text-white">{myCourses.length}</p>
                  <p className="text-xs text-emerald-100">รายวิชา</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <p className="text-3xl font-bold text-white">{totalBooks}</p>
                  <p className="text-xs text-emerald-100">หนังสือ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Title */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              รายวิชาของฉัน
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all text-sm font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              <FiPlus />
              เพิ่มรายวิชา
            </button>
          </div>

          {myCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-emerald-100 shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                <FiBook className="text-3xl text-emerald-500" />
              </div>
              <p className="text-gray-800 font-semibold text-lg mb-2">ยังไม่มีรายวิชา</p>
              <p className="text-gray-500 text-sm mb-6 text-center max-w-xs">
                เริ่มต้นโดยการเพิ่มรายวิชาที่คุณลงทะเบียนเรียน
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all text-sm font-medium shadow-lg shadow-emerald-500/30"
              >
                <FiPlus />
                เพิ่มรายวิชา
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/course/${course.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Course Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                      <FiBook className="text-white text-xl" />
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">
                          {course.code_en || course.code_th}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-emerald-700">
                        {course.name_th}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <FiBook className="text-emerald-500" />
                          {course.book_count} หนังสือ
                        </span>
                        {parseInt(course.file_count) > 0 && (
                          <span className="flex items-center gap-1.5 text-gray-500">
                            <FiFile className="text-amber-500" />
                            {course.file_count} ไฟล์
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-500 flex items-center justify-center transition-all duration-300">
                      <FiChevronRight className="text-emerald-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  
                  {/* Delete button */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveCourse(course.id);
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <FiTrash2 className="text-xs" />
                      ลบรายวิชา
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        {/* Add Course Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddModal(false);
              setSearchQuery("");
              setSelectedFaculty("");
            }}
          >
            <div
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-500 to-teal-500">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      เพิ่มรายวิชา
                    </h2>
                    <p className="text-emerald-100 text-sm">เลือกรายวิชาที่คุณลงทะเบียน</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSearchQuery("");
                      setSelectedFaculty("");
                    }}
                    className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <FiX className="text-white" />
                  </button>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-200" />
                    <input
                      type="text"
                      placeholder="ค้นหารหัสวิชา หรือ ชื่อวิชา..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-emerald-200 focus:bg-white/30 focus:border-white focus:ring-0 outline-none transition-all"
                    />
                  </div>
                  <select
                    value={selectedFaculty}
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    className="px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:bg-white/30 focus:border-white focus:ring-0 outline-none transition-all"
                  >
                    <option value="" className="text-gray-900">ทุกคณะ</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id} className="text-gray-900">
                        {f.name_th}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Course List */}
              <div className="flex-1 overflow-y-auto p-6 bg-emerald-50/30">
                {loadingCourses ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                  </div>
                ) : allCourses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    ไม่พบรายวิชา
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allCourses.map((course) => {
                      const isAdded = myCourseIds.has(course.id);
                      return (
                        <div
                          key={course.id}
                          className={`p-4 rounded-2xl border transition-all bg-white ${
                            isAdded
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-gray-200 hover:border-emerald-300 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">
                                  {course.code_en || course.code_th}
                                </span>
                                {course.faculty_name && (
                                  <span className="text-xs text-gray-400">
                                    {course.faculty_name}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold text-gray-800 line-clamp-1">
                                {course.name_th}
                              </h3>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <FiBook className="text-emerald-500" />
                                  {course.book_count} หนังสือ
                                </span>
                                <span className="flex items-center gap-1">
                                  <FiFile className="text-amber-500" />
                                  {course.file_count} ไฟล์
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isAdded) handleAddCourse(course.id);
                              }}
                              disabled={isAdded || addingCourse === course.id}
                              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 ${
                                isAdded
                                  ? "bg-emerald-100 text-emerald-600 cursor-default"
                                  : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                              }`}
                            >
                              {addingCourse === course.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              ) : isAdded ? (
                                <>
                                  <FiCheck />
                                  เพิ่มแล้ว
                                </>
                              ) : (
                                <>
                                  <FiPlus />
                                  เพิ่ม
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
