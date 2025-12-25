'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../../context/AuthContext';
import { courseBooksAPI } from '../../../../../lib/api';
import Navbar from '../../../../../components/Navbar';
import Loading from '../../../../../components/Loading';
import { FiBook, FiArrowLeft, FiUser, FiHash, FiBookOpen, FiCalendar, FiExternalLink } from 'react-icons/fi';

export default function BookDetailPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id: courseId, bookId } = params;

  const [course, setCourse] = useState(null);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && courseId && bookId) {
      fetchData();
    }
  }, [isAuthenticated, courseId, bookId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const curriculumRes = await courseBooksAPI.getCurriculums();
      if (curriculumRes.data.length > 0) {
        const curriculum = curriculumRes.data[0];
        const foundCourse = curriculum.courses.find(c => c.id === parseInt(courseId));
        if (foundCourse) {
          setCourse(foundCourse);
        }
      }

      const booksRes = await courseBooksAPI.getBooks({ courseId });
      const foundBook = booksRes.data.find(b => b.id === parseInt(bookId));
      if (foundBook) {
        setBook(foundBook);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
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

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-gray-500">ไม่พบหนังสือ</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <Link
          href={`/course/${courseId}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <FiArrowLeft />
          </div>
          <span className="font-medium">กลับไปรายวิชา {course?.code_en || course?.code_th}</span>
        </Link>

        {/* Book Detail Card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Book Cover */}
              <div className="w-48 h-64 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden flex-shrink-0 mx-auto md:mx-0 relative">
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
                <div className={`absolute inset-0 ${book.bookcover ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50`}>
                  <FiBook className="text-5xl text-emerald-300" />
                </div>
              </div>

              {/* Book Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-3">{book.title}</h1>

                {book.author && (
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <FiUser className="text-emerald-500" />
                    <span>{book.author}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {book.callnumber && (
                    <div className="flex items-center gap-3">
                      <FiHash className="text-gray-400" />
                      <span className="text-gray-500 text-sm">เลขเรียก:</span>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                        {book.callnumber}
                      </span>
                    </div>
                  )}

                  {book.isbn && (
                    <div className="flex items-center gap-3">
                      <FiBookOpen className="text-gray-400" />
                      <span className="text-gray-500 text-sm">ISBN:</span>
                      <span className="text-gray-700">{book.isbn}</span>
                    </div>
                  )}

                  {book.publisher && (
                    <div className="flex items-center gap-3">
                      <FiBook className="text-gray-400" />
                      <span className="text-gray-500 text-sm">สำนักพิมพ์:</span>
                      <span className="text-gray-700">{book.publisher}</span>
                    </div>
                  )}

                  {book.publishyear && (
                    <div className="flex items-center gap-3">
                      <FiCalendar className="text-gray-400" />
                      <span className="text-gray-500 text-sm">ปีพิมพ์:</span>
                      <span className="text-gray-700">{book.publishyear}</span>
                    </div>
                  )}
                </div>

                {/* Note */}
                {book.note && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">หมายเหตุ</p>
                    <p className="text-sm text-gray-700">{book.note}</p>
                  </div>
                )}

                {/* Link to Library */}
                {book.link && (
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium"
                  >
                    <FiExternalLink />
                    ดูในระบบห้องสมุด
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
