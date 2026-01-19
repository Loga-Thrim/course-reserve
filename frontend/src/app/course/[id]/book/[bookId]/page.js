"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../../context/AuthContext";
import { courseBooksAPI, studentAPI } from "../../../../../lib/api";
import Navbar from "../../../../../components/Navbar";
import Loading from "../../../../../components/Loading";
import {
  FiBook,
  FiArrowLeft,
  FiUser,
  FiHash,
  FiBookOpen,
  FiCalendar,
  FiExternalLink,
  FiX,
  FiLoader,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function BookDetailPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id: courseId, bookId } = params;

  const [course, setCourse] = useState(null);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Line Borrow states
  const [showLineBorrowModal, setShowLineBorrowModal] = useState(false);
  const [borrowingLine, setBorrowingLine] = useState(false);
  const [borrowStatus, setBorrowStatus] = useState(null);
  const [statusChecked, setStatusChecked] = useState(false);
  const [canBorrow, setCanBorrow] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
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
        const foundCourse = curriculum.courses.find(
          (c) => c.id === parseInt(courseId)
        );
        if (foundCourse) {
          setCourse(foundCourse);
        }
      }

      const booksRes = await courseBooksAPI.getBooks({ courseId });
      const foundBook = booksRes.data.find((b) => b.id === parseInt(bookId));
      if (foundBook) {
        setBook(foundBook);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Line Borrow handlers
  const openLineBorrowModal = async () => {
    if (!currentUser?.barcode || !book) {
      toast.error("ไม่พบข้อมูลผู้ใช้");
      return;
    }

    setBorrowStatus(null);
    setStatusChecked(false);
    setCanBorrow(false);
    setShowLineBorrowModal(true);
    setBorrowingLine(true);

    // Auto check status when modal opens
    try {
      const response = await studentAPI.getLineBorrowStatus(
        currentUser.barcode
      );

      setStatusChecked(true);

      if (response.data.success && response.data.data) {
        const borrowData = response.data.data;
        setBorrowStatus(borrowData);

        // Check if the book is already borrowed (compare bib_id)
        if (String(borrowData.bib_id) === String(book.id)) {
          setCanBorrow(false);
        } else {
          setCanBorrow(true);
        }
      } else {
        setBorrowStatus(null);
        setCanBorrow(true);
      }
    } catch (error) {
      setStatusChecked(true);
      setBorrowStatus(null);
      setCanBorrow(true);
    } finally {
      setBorrowingLine(false);
    }
  };

  const handleLineBorrow = async () => {
    if (!currentUser?.barcode || !book) {
      toast.error("ไม่พบข้อมูลผู้ใช้");
      return;
    }

    if (!canBorrow) {
      toast.error("ไม่สามารถยืมหนังสือเล่มนี้ได้");
      return;
    }

    try {
      setBorrowingLine(true);
      const response = await studentAPI.lineBorrow({
        StudentID: currentUser.barcode,
        BibID: String(book.id),
        Title: book.title || "",
        Author: book.author || "",
        CallNo: book.callnumber || "",
        Pubyear: book.publishyear || "",
        isbn: book.isbn || "",
      });

      if (response.data.success) {
        toast.success(response.data.message || "ทำรายการยืมผ่านไลน์สำเร็จ");
        setShowLineBorrowModal(false);
      } else {
        toast.error(response.data.error || "ไม่สามารถทำรายการยืมได้");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "ไม่สามารถเชื่อมต่อระบบยืมผ่านไลน์ได้"
      );
    } finally {
      setBorrowingLine(false);
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
          <span className="font-medium">
            กลับไปรายวิชา {course?.code_en || course?.code_th}
          </span>
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
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`absolute inset-0 ${
                    book.bookcover ? "hidden" : "flex"
                  } items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50`}
                >
                  <FiBook className="text-5xl text-emerald-300" />
                </div>
              </div>

              {/* Book Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-3">
                  {book.title}
                </h1>

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

                {/* Line Borrow Button */}
                <button
                  onClick={openLineBorrowModal}
                  className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  ยืมผ่าน Line
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Line Borrow Modal */}
      {showLineBorrowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-500 to-green-600">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                <h3 className="text-lg font-semibold text-white">
                  ยืมผ่าน Line
                </h3>
              </div>
              <button
                onClick={() => setShowLineBorrowModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="text-xl text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* User Info */}
              <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                <p className="text-xs text-gray-500 mb-1">ผู้ยืม</p>
                <p className="font-medium text-gray-800 text-sm">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-green-600">
                  รหัส: {currentUser?.barcode}
                </p>
              </div>

              {/* Book Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">
                  หนังสือที่ต้องการยืม
                </p>
                <p className="font-medium text-gray-800 text-sm line-clamp-2">
                  {book.title}
                </p>
                {book.author && (
                  <p className="text-xs text-gray-500 mt-1">
                    โดย {book.author}
                  </p>
                )}
                {book.callnumber && (
                  <p className="text-xs text-emerald-600 mt-1">
                    เลขเรียก: {book.callnumber}
                  </p>
                )}
              </div>

              {/* Loading State */}
              {borrowingLine && !statusChecked && (
                <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-center gap-3">
                  <FiLoader className="animate-spin text-blue-500" />
                  <p className="text-sm text-blue-600">
                    กำลังตรวจสอบสถานะการยืม...
                  </p>
                </div>
              )}

              {/* Status Check Result - Only show if cannot borrow */}
              {statusChecked && !canBorrow && (
                <div className="mb-4 p-3 rounded-xl border bg-red-50 border-red-200">
                  <p className="text-sm font-medium mb-1 text-red-800">
                    ✗ ไม่สามารถยืมได้
                  </p>
                  {borrowStatus && (
                    <div className="mt-2 text-xs">
                      <p className="text-red-600">
                        สถานะ: {borrowStatus.status_name}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLineBorrowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleLineBorrow}
                  disabled={borrowingLine || !statusChecked || !canBorrow}
                  className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    statusChecked && canBorrow
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  {borrowingLine ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                  )}
                  {canBorrow ? "ยืนยันการยืม" : "ไม่สามารถยืมได้"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
