'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../lib/api';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import { FiBook, FiChevronRight, FiGrid, FiFile, FiPlus, FiSearch, FiX, FiCheck, FiTrash2, FiChevronDown } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

export default function HomePage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [addingCourse, setAddingCourse] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
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
      console.error('Error fetching my courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await studentAPI.getFaculties();
      setFaculties(response.data);
    } catch (err) {
      console.error('Error fetching faculties:', err);
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
      console.error('Error fetching all courses:', err);
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
      toast.success('เพิ่มรายวิชาเรียบร้อยแล้ว');
      // Add course to myCourses without re-fetching to prevent scroll jump
      const addedCourse = allCourses.find(c => c.id === courseId);
      if (addedCourse) {
        setMyCourses(prev => [{ ...addedCourse, added_at: new Date().toISOString() }, ...prev]);
      } else {
        fetchMyCourses();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'ไม่สามารถเพิ่มรายวิชาได้');
    } finally {
      setAddingCourse(null);
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!confirm('ต้องการลบรายวิชานี้ออกจากรายการหรือไม่?')) return;
    try {
      await studentAPI.removeCourse(courseId);
      toast.success('ลบรายวิชาเรียบร้อยแล้ว');
      fetchMyCourses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'ไม่สามารถลบรายวิชาได้');
    }
  };

  const myCourseIds = new Set(myCourses.map(c => c.id));

  if (authLoading || loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalBooks = myCourses.reduce((sum, c) => sum + parseInt(c.book_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <Toaster position="top-center" />
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 mb-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative">
            <h1 className="text-xl font-bold text-white mb-2">
              ยินดีต้อนรับ, {user?.name || 'นักศึกษา'}
            </h1>
            <p className="text-emerald-100 text-sm">
              เลือกรายวิชาที่คุณลงทะเบียนเพื่อดูหนังสือประจำวิชา
            </p>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">รายวิชาของฉัน</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <FiGrid className="text-emerald-500" />
                {myCourses.length} วิชา
              </span>
              <span className="flex items-center gap-1.5">
                <FiBook className="text-purple-500" />
                {totalBooks} หนังสือ
              </span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
            >
              <FiPlus />
              เพิ่มรายวิชา
            </button>
          </div>
        </div>
        
        {myCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <FiGrid className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">ยังไม่มีรายวิชา</p>
            <p className="text-gray-400 text-sm mb-4">กดปุ่ม "เพิ่มรายวิชา" เพื่อเลือกรายวิชาที่คุณลงทะเบียน</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all text-sm"
            >
              <FiPlus />
              เพิ่มรายวิชา
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myCourses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-emerald-400 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Course Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <FiBook className="text-white text-lg" />
                  </div>
                  
                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                        {course.code_en || course.code_th}
                      </span>
                      {course.code_th && course.code_en && (
                        <span className="text-xs text-gray-400">{course.code_th}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1">
                      {course.name_th}
                    </h3>
                    {course.instructors && (
                      <p className="text-xs text-gray-400 mb-2 line-clamp-1">อาจารย์: {course.instructors}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <FiBook className="text-sm" />
                        {course.book_count} หนังสือ
                      </span>
                      {parseInt(course.file_count) > 0 && (
                        <span className="flex items-center gap-1.5 text-amber-600">
                          <FiFile className="text-sm" />
                          {course.file_count} ไฟล์
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/course/${course.id}`}
                      className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                    >
                      <FiChevronRight className="text-emerald-600" />
                    </Link>
                    <button
                      onClick={() => handleRemoveCourse(course.id)}
                      className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                    >
                      <FiTrash2 className="text-red-500 text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Course Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowAddModal(false);
            setSearchQuery('');
            setSelectedFaculty('');
          }}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">เพิ่มรายวิชา</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchQuery('');
                    setSelectedFaculty('');
                  }}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  <FiX className="text-gray-500" />
                </button>
              </div>
              
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหารหัสวิชา หรือ ชื่อวิชา..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-emerald-400 focus:ring-0 outline-none"
                  />
                </div>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-emerald-400 focus:ring-0 outline-none bg-white"
                >
                  <option value="">ทุกคณะ</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>{f.name_th}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Course List */}
            <div className="flex-1 overflow-y-auto p-6">
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
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isAdded ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                                {course.code_en || course.code_th}
                              </span>
                              {course.faculty_name && (
                                <span className="text-xs text-gray-400">{course.faculty_name}</span>
                              )}
                            </div>
                            <h3 className="font-medium text-gray-800 line-clamp-1">
                              {course.name_th}
                            </h3>
                            {course.instructors && (
                              <p className="text-xs text-gray-400 mt-1">อาจารย์: {course.instructors}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span>{course.book_count} หนังสือ</span>
                              <span>{course.file_count} ไฟล์</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!isAdded) handleAddCourse(course.id);
                            }}
                            disabled={isAdded || addingCourse === course.id}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 ${
                              isAdded
                                ? 'bg-emerald-100 text-emerald-600 cursor-default'
                                : 'bg-emerald-500 text-white hover:bg-emerald-600'
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
  );
}
