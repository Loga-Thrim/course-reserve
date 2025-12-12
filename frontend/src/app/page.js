'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { courseBooksAPI } from '../lib/api';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import { FiBook, FiChevronDown, FiStar } from 'react-icons/fi';

export default function HomePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [curriculums, setCurriculums] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [showCurriculumDropdown, setShowCurriculumDropdown] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurriculums();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedCurriculum || selectedCourse) {
      fetchBooks();
    }
  }, [selectedCurriculum, selectedCourse]);

  const fetchCurriculums = async () => {
    try {
      setLoading(true);
      const response = await courseBooksAPI.getCurriculums();
      setCurriculums(response.data);
      if (response.data.length > 0) {
        setSelectedCurriculum(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching curriculums:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoadingBooks(true);
      const params = {};
      if (selectedCourse) {
        params.courseId = selectedCourse.id;
      } else if (selectedCurriculum) {
        params.curriculum = selectedCurriculum.curriculum_th;
      }
      const response = await courseBooksAPI.getBooks(params);
      setBooks(response.data);
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleSelectCurriculum = (curriculum) => {
    setSelectedCurriculum(curriculum);
    setSelectedCourse(null);
    setShowCurriculumDropdown(false);
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setShowCourseDropdown(false);
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            หนังสือประจำวิชา
          </h1>
          <p className="text-gray-600 text-sm">
            เลือกหลักสูตรและรายวิชาเพื่อดูหนังสือที่อาจารย์แนะนำ
          </p>
        </div>

        {curriculums.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <FiBook className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">ยังไม่มีหนังสือประจำวิชาในระบบ</p>
            <p className="text-sm text-gray-400 mt-2">กรุณารอให้อาจารย์เพิ่มหนังสือในรายวิชา</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Curriculum Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">หลักสูตร</label>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowCurriculumDropdown(!showCurriculumDropdown);
                        setShowCourseDropdown(false);
                      }}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-brand transition-all"
                    >
                      <span className="truncate text-sm">
                        {selectedCurriculum?.curriculum_th || "เลือกหลักสูตร"}
                      </span>
                      <FiChevronDown className={`transition-transform flex-shrink-0 ${showCurriculumDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showCurriculumDropdown && (
                      <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {curriculums.map((curriculum, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectCurriculum(curriculum)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                              selectedCurriculum?.curriculum_th === curriculum.curriculum_th ? 'bg-gray-50 text-brand font-medium' : ''
                            }`}
                          >
                            <p className="font-medium">{curriculum.curriculum_th}</p>
                            <p className="text-xs text-gray-500">{curriculum.courses.length} รายวิชา</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">รายวิชา (ไม่บังคับ)</label>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowCourseDropdown(!showCourseDropdown);
                        setShowCurriculumDropdown(false);
                      }}
                      disabled={!selectedCurriculum}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="truncate text-sm">
                        {selectedCourse ? `${selectedCourse.code_th} - ${selectedCourse.name_th}` : "ทุกรายวิชา"}
                      </span>
                      <FiChevronDown className={`transition-transform flex-shrink-0 ${showCourseDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showCourseDropdown && selectedCurriculum && (
                      <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        <button
                          onClick={() => handleSelectCourse(null)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                            !selectedCourse ? 'bg-gray-50 text-brand font-medium' : ''
                          }`}
                        >
                          ทุกรายวิชา
                        </button>
                        {selectedCurriculum.courses.map((course) => (
                          <button
                            key={course.id}
                            onClick={() => handleSelectCourse(course)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                              selectedCourse?.id === course.id ? 'bg-gray-50 text-brand font-medium' : ''
                            }`}
                          >
                            <p className="font-medium">{course.code_th} - {course.name_th}</p>
                            <p className="text-xs text-gray-500">{course.book_count} หนังสือ</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Books Grid */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                หนังสือ ({books.length})
              </h2>
            </div>

            {loadingBooks ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand"></div>
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <FiBook className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">ไม่พบหนังสือในหลักสูตร/รายวิชาที่เลือก</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
                  <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                    <div className="aspect-[3/4] bg-gray-100 relative">
                      {book.bookcover ? (
                        <img
                          src={book.bookcover}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 ${book.bookcover ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-brand/10 to-brand/20`}>
                        <FiBook className="text-5xl text-brand/40" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">{book.title}</h3>
                      {book.author && (
                        <p className="text-xs text-gray-500 mb-2">โดย {book.author}</p>
                      )}
                      {book.callnumber && (
                        <p className="text-xs text-brand font-medium mb-2">เลขเรียก: {book.callnumber}</p>
                      )}
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-400 line-clamp-1">
                          {book.course_code} - {book.course_name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
