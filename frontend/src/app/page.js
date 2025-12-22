'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { courseBooksAPI } from '../lib/api';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import { FiBook, FiChevronRight, FiGrid, FiFile } from 'react-icons/fi';

export default function HomePage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurriculum();
    }
  }, [isAuthenticated]);

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      const response = await courseBooksAPI.getCurriculums();
      if (response.data.length > 0) {
        setCurriculum(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching curriculum:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalCourses = curriculum?.courses?.length || 0;
  const totalBooks = curriculum?.courses?.reduce((sum, c) => sum + parseInt(c.book_count || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!curriculum ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
              <FiBook className="text-3xl text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">ยังไม่มีหนังสือประจำวิชา</h2>
            <p className="text-gray-500 text-center max-w-md">
              {user?.program 
                ? `ยังไม่มีหนังสือสำหรับสาขา "${user.program}"` 
                : 'กรุณารอให้อาจารย์เพิ่มหนังสือในรายวิชา'}
            </p>
          </div>
        ) : (
          <>
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 mb-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative">
                {curriculum.faculty_name && (
                  <p className="text-emerald-100 text-sm mb-2">
                    {curriculum.faculty_name}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-white/20 text-white rounded-md text-xs font-medium">
                    {curriculum.curriculum_level || 'หลักสูตร'}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-white mb-2">
                  {curriculum.curriculum_name}
                </h1>
                {user?.program && (
                  <p className="text-emerald-100 text-sm">
                    ยินดีต้อนรับ! ค้นหาหนังสือประจำวิชาสำหรับสาขา {user.program}
                  </p>
                )}
              </div>
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">เลือกรายวิชา</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <FiGrid className="text-emerald-500" />
                  {totalCourses} วิชา
                </span>
                <span className="flex items-center gap-1.5">
                  <FiBook className="text-purple-500" />
                  {totalBooks} หนังสือ
                </span>
              </div>
            </div>
            
            {curriculum.courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <FiGrid className="text-2xl text-gray-400" />
                </div>
                <p className="text-gray-500">ยังไม่มีรายวิชาที่มีหนังสือ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {curriculum.courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/course/${course.id}`}
                    className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-emerald-400 p-5 cursor-pointer hover:shadow-md"
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
                            {course.code_th}
                          </span>
                          {course.code_en && (
                            <span className="text-xs text-gray-400">{course.code_en}</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">
                          {course.name_th}
                        </h3>
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
                      
                      {/* Arrow */}
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <FiChevronRight className="text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
