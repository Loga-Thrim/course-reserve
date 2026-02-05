"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { courseBooksAPI, studentAPI } from "../../../lib/api";
import Navbar from "../../../components/Navbar";
import Loading from "../../../components/Loading";
import {
  FiBook,
  FiArrowLeft,
  FiUsers,
  FiFile,
  FiExternalLink,
  FiDownload,
  FiX,
  FiLoader,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function CourseDetailPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [books, setBooks] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Line Borrow states
  const [showLineBorrowModal, setShowLineBorrowModal] = useState(false);
  const [lineBorrowBook, setLineBorrowBook] = useState(null);
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
        const foundCourse = curriculum.courses.find(
          (c) => c.id === parseInt(courseId),
        );
        if (foundCourse) {
          setCourse({ ...foundCourse, faculty_name: curriculum.faculty_name });
        }
      }

      const [booksRes, filesRes] = await Promise.all([
        courseBooksAPI.getBooks({ courseId }),
        courseBooksAPI.getCourseFiles(courseId),
      ]);
      setBooks(booksRes.data);
      setFiles(filesRes.data);
    } catch (err) {
      console.error("Error fetching course data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf")) return "📄";
    if (fileType?.includes("word") || fileType?.includes("document"))
      return "📝";
    if (fileType?.includes("excel") || fileType?.includes("spreadsheet"))
      return "📊";
    if (fileType?.includes("powerpoint") || fileType?.includes("presentation"))
      return "📑";
    if (fileType?.includes("image")) return "🖼️";
    if (fileType?.includes("video")) return "🎬";
    if (fileType?.includes("audio")) return "🎵";
    if (fileType?.includes("zip") || fileType?.includes("rar")) return "📦";
    return "📎";
  };

  const handleDownload = (file) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    window.open(`${API_URL}/uploads/course-files/${file.filename}`, "_blank");
  };

  // Line Borrow handlers
  const openLineBorrowModal = async (e, book) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser?.barcode) {
      toast.error("ไม่พบข้อมูลผู้ใช้");
      return;
    }

    setLineBorrowBook(book);
    setBorrowStatus(null);
    setStatusChecked(false);
    setCanBorrow(false);
    setShowLineBorrowModal(true);
    setBorrowingLine(true);

    // Auto check status when modal opens
    try {
      const response = await studentAPI.getLineBorrowStatus(
        currentUser.barcode,
      );

      setStatusChecked(true);

      if (response.data.success && response.data.data) {
        const borrowData = response.data.data;
        const bookIsbn = book.isbn.split(" ")[0];

        setBorrowStatus(
          borrowData.find((b) => b.isbn.split(" ")[0] === bookIsbn),
        );

        if (borrowData.some((b) => b.isbn.split(" ")[0] === bookIsbn)) {
          setCanBorrow(false);
        } else {
          setCanBorrow(true);
        }
      } else {
        setBorrowStatus(null);
        setCanBorrow(true);
      }
    } catch (error) {
      console.log("=== > ", error);
      setStatusChecked(true);
      setBorrowStatus(null);
      setCanBorrow(true);
    } finally {
      setBorrowingLine(false);
    }
  };

  const handleLineBorrow = async () => {
    if (!currentUser?.barcode || !lineBorrowBook) {
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
        BibID: String(lineBorrowBook.id),
        Title: lineBorrowBook.title || "",
        Author: lineBorrowBook.author || "",
        CallNo: lineBorrowBook.callnumber || "",
        Pubyear: lineBorrowBook.publishyear || "",
        isbn: lineBorrowBook.isbn || "",
      });

      if (response.data.success) {
        toast.success(response.data.message || "ทำรายการยืมผ่านไลน์สำเร็จ");
        setShowLineBorrowModal(false);
      } else {
        toast.error(response.data.error || "ไม่สามารถทำรายการยืมได้");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "ไม่สามารถเชื่อมต่อระบบยืมผ่านไลน์ได้",
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
              {course.code_en || course.code_th}
            </span>
            {course.code_th && course.code_en && (
              <span className="text-xs text-gray-400">{course.code_th}</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {course.name_th}
          </h1>
          {course.name_en && (
            <p className="text-gray-500 mb-3">{course.name_en}</p>
          )}

          {/* Instructor */}
          {course.instructors && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-50 rounded-lg">
              <FiUsers className="text-emerald-500 text-sm" />
              <span className="text-xs text-emerald-600">อาจารย์ผู้สอน:</span>
              <span className="text-sm text-gray-700">
                {course.instructors}
              </span>
            </div>
          )}

          {/* Description */}
          {course.description_th && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">คำอธิบายรายวิชา</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {course.description_th}
              </p>
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
              <h2 className="text-lg font-semibold text-gray-800">
                ไฟล์เอกสาร
              </h2>
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
          <h2 className="text-lg font-semibold text-gray-800">
            หนังสือประจำวิชา
          </h2>
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
              <div
                key={book.id}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <Link
                  href={`/course/${courseId}/book/${book.id}`}
                  className="flex cursor-pointer"
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
                      <FiBook className="text-2xl text-emerald-300" />
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-3 flex-1 min-w-0 flex flex-col">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                        {book.author}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2">
                      {book.callnumber && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">
                          {book.callnumber}
                        </span>
                      )}
                      <button
                        onClick={(e) => openLineBorrowModal(e, book)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                        ยืม
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Line Borrow Modal */}
      {showLineBorrowModal && lineBorrowBook && (
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
                  {lineBorrowBook.title}
                </p>
                {lineBorrowBook.author && (
                  <p className="text-xs text-gray-500 mt-1">
                    โดย {lineBorrowBook.author}
                  </p>
                )}
                {lineBorrowBook.callnumber && (
                  <p className="text-xs text-emerald-600 mt-1">
                    เลขเรียก: {lineBorrowBook.callnumber}
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
