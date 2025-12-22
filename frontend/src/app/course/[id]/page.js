'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { courseBooksAPI } from '../../../lib/api';
import Navbar from '../../../components/Navbar';
import Loading from '../../../components/Loading';
import { FiBook, FiArrowLeft, FiUsers, FiFile, FiExternalLink, FiDownload } from 'react-icons/fi';

export default function CourseDetailPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [books, setBooks] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && courseId) {
      fetchCourseData();
    }
  }, [isAuthenticated, courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const curriculumRes = await courseBooksAPI.getCurriculums();
      if (curriculumRes.data.length > 0) {
        const curriculum = curriculumRes.data[0];
        const foundCourse = curriculum.courses.find(c => c.id === parseInt(courseId));
        if (foundCourse) {
          setCourse({ ...foundCourse, faculty_name: curriculum.faculty_name });
        }
      }

      const [booksRes, filesRes] = await Promise.all([
        courseBooksAPI.getBooks({ courseId }),
        courseBooksAPI.getCourseFiles(courseId)
      ]);
      setBooks(booksRes.data);
      setFiles(filesRes.data);
    } catch (err) {
      console.error('Error fetching course data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) return '📊';
    if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return '📑';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('video')) return '🎬';
    if (fileType?.includes('audio')) return '🎵';
    if (fileType?.includes('zip') || fileType?.includes('rar')) return '📦';
    return '📎';
  };

  const handleDownload = (file) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.open(`${API_URL}/uploads/course-files/${file.filename}`, '_blank');
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-gray-500">ไม่พบรายวิชา</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <FiArrowLeft />
          </div>
          <span className="font-medium">กลับไปรายวิชา</span>
        </Link>

        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold">
              {course.code_th}
            </span>
            {course.code_en && (
              <span className="text-xs text-gray-400">{course.code_en}</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{course.name_th}</h1>
          {course.name_en && (
            <p className="text-gray-500 mb-3">{course.name_en}</p>
          )}

          {/* Instructor */}
          {course.instructors && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-50 rounded-lg">
              <FiUsers className="text-emerald-500 text-sm" />
              <span className="text-xs text-emerald-600">อาจารย์ผู้สอน:</span>
              <span className="text-sm text-gray-700">{course.instructors}</span>
            </div>
          )}

          {/* Description */}
          {course.description_th && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">คำอธิบายรายวิชา</p>
              <p className="text-sm text-gray-600 leading-relaxed">{course.description_th}</p>
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <FiBook className="text-emerald-500" />
              {books.length} หนังสือ
            </span>
            {files.length > 0 && (
              <span className="flex items-center gap-1.5">
                <FiFile className="text-amber-500" />
                {files.length} ไฟล์
              </span>
            )}
            {course.website && (
              <a
                href={course.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600"
              >
                <FiExternalLink />
                เว็บไซต์สำหรับศึกษาเพิ่มเติม
              </a>
            )}
          </div>
        </div>

        {/* Files Section */}
        {files.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">ไฟล์เอกสาร</h2>
              <span className="text-sm text-gray-400">{files.length} ไฟล์</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 hover:border-amber-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {getFileIcon(file.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">
                        {file.original_name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.file_size)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(file)}
                      className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-amber-500 flex items-center justify-center"
                    >
                      <FiDownload className="text-gray-400 hover:text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Books Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">หนังสือประจำวิชา</h2>
          <span className="text-sm text-gray-400">{books.length} เล่ม</span>
        </div>

        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <FiBook className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-500">ยังไม่มีหนังสือในรายวิชานี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/course/${courseId}/book/${book.id}`}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-emerald-200 hover:shadow-md flex cursor-pointer"
              >
                {/* Book Cover */}
                <div className="w-24 h-32 bg-gradient-to-br from-gray-100 to-gray-50 relative flex-shrink-0">
                  {book.bookcover ? (
                    <img
                      src={book.bookcover}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 ${book.bookcover ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50`}>
                    <FiBook className="text-2xl text-emerald-300" />
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-3 flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  {book.author && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">{book.author}</p>
                  )}
                  {book.callnumber && (
                    <div className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">
                      {book.callnumber}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
