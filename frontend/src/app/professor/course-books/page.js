"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useSearchParams } from "next/navigation";
import ProfessorLayout from "../../../components/professor/ProfessorLayout";
import { professorCourseBooksAPI } from "../../../lib/professorApi";
import {
  FiSearch,
  FiPlus,
  FiTrash2,
  FiBook,
  FiChevronDown,
  FiX,
  FiLoader,
  FiZap,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiCalendar,
  FiMapPin,
  FiHash,
  FiCheck,
  FiSquare,
  FiCheckSquare,
  FiDownload,
  FiFileText,
} from "react-icons/fi";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 12;

const BookCard = memo(
  ({
    book,
    showAddButton = true,
    showRemoveButton = false,
    onAdd,
    onRemove,
    isAdded,
    isAdding,
    isAdminRecommended = false,
    onShowDetail,
    showCheckbox = false,
    isSelected = false,
    onToggleSelect,
  }) => (
    <div
      className={`rounded-xl border shadow-sm hover:shadow-md transition-all p-4 cursor-pointer ${
        isAdminRecommended
          ? "bg-amber-50/50 border-amber-200"
          : "bg-white border-gray-100"
      } ${isSelected ? "ring-2 ring-emerald-500 bg-emerald-50/50" : ""}`}
      onClick={() => onShowDetail && onShowDetail(book)}
    >
      <div className="flex gap-4">
        {showCheckbox && (
          <div className="flex items-start pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect && onToggleSelect(book);
              }}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-gray-300 hover:border-emerald-400"
              }`}
            >
              {isSelected && <FiCheck className="text-xs" />}
            </button>
          </div>
        )}
        <div className="w-20 h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
          {isAdminRecommended && (
            <div className="absolute top-1 left-1 z-10 p-1 bg-amber-500 rounded-full">
              <FiStar className="text-white text-xs" />
            </div>
          )}
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
            className={`w-full h-full ${
              book.bookcover ? "hidden" : "flex"
            } items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100`}
          >
            <FiBook className="text-3xl text-emerald-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1 flex-1">
              {book.title}
            </h4>
            {isAdminRecommended && (
              <span className="flex-shrink-0 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1">
                <FiStar className="text-amber-500 text-xs" />
                Admin
              </span>
            )}
          </div>
          {book.author && (
            <p className="text-xs text-gray-500 mb-1">โดย {book.author}</p>
          )}
          {book.callnumber && (
            <p className="text-xs text-emerald-600 font-medium mb-1">
              เลขเรียก: {book.callnumber}
            </p>
          )}
          {book.publisher && (
            <p className="text-xs text-gray-400 line-clamp-1">
              {book.publisher}
            </p>
          )}
          <div className="mt-2 flex gap-2">
            {showAddButton && !isAdded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(book);
                }}
                disabled={isAdding}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs rounded-lg hover:shadow-md transition-all flex items-center gap-1 disabled:opacity-50"
              >
                {isAdding ? <FiLoader className="animate-spin" /> : <FiPlus />}
                เพิ่มในรายวิชา
              </button>
            )}
            {showAddButton && isAdded && (
              <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-lg">
                เพิ่มแล้ว
              </span>
            )}
            {showRemoveButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(book.id);
                }}
                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 transition-all flex items-center gap-1"
              >
                <FiTrash2 />
                ลบออก
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  ),
);

BookCard.displayName = "BookCard";

export default function CourseBooksPage() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseBooks, setCourseBooks] = useState([]);
  const [suggestedBooks, setSuggestedBooks] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingCourseBooks, setLoadingCourseBooks] = useState(false);
  const [addingBook, setAddingBook] = useState(null);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Line Borrow states
  const [showLineBorrowModal, setShowLineBorrowModal] = useState(false);
  const [lineBorrowBook, setLineBorrowBook] = useState(null);
  const [borrowingLine, setBorrowingLine] = useState(false);
  const [borrowStatus, setBorrowStatus] = useState(null);
  const [statusChecked, setStatusChecked] = useState(false);
  const [canBorrow, setCanBorrow] = useState(false);

  // Multi-select states
  const [selectedSearchBooks, setSelectedSearchBooks] = useState(new Set());
  const [selectedCourseBooks, setSelectedCourseBooks] = useState(new Set());
  const [addingMultiple, setAddingMultiple] = useState(false);
  const [removingMultiple, setRemovingMultiple] = useState(false);

  // Expanded copies state
  const [expandedBookId, setExpandedBookId] = useState(null);

  // Check auth before fetching data
  useEffect(() => {
    const token = localStorage.getItem("professorToken");
    const user = localStorage.getItem("professorUser");
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser.role === "professor" || parsedUser.role === "admin") {
          setIsAuthenticated(true);
          setCurrentUser(parsedUser);
        }
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyCourses();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseBooks();
      fetchBookSuggestions();
    }
  }, [selectedCourse]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await professorCourseBooksAPI.getMyCourses();
      setCourses(response.data);

      const courseIdFromUrl = searchParams.get("courseId");
      if (courseIdFromUrl) {
        const targetCourse = response.data.find(
          (c) => c.id === parseInt(courseIdFromUrl),
        );
        if (targetCourse) {
          setSelectedCourse(targetCourse);
          return;
        }
      }

      if (response.data.length > 0) {
        setSelectedCourse(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseBooks = async () => {
    if (!selectedCourse) return;
    try {
      setLoadingCourseBooks(true);
      const response = await professorCourseBooksAPI.getCourseBooks(
        selectedCourse.id,
      );
      setCourseBooks(response.data);
    } catch (error) {
      console.error("Error fetching course books:", error);
    } finally {
      setLoadingCourseBooks(false);
    }
  };

  const fetchBookSuggestions = async () => {
    if (!selectedCourse) return;
    try {
      setLoadingSuggestions(true);
      setSuggestedBooks([]);
      setKeywords([]);
      setCurrentPage(1);
      const response = await professorCourseBooksAPI.getBookSuggestions(
        selectedCourse.id,
      );
      setSuggestedBooks(response.data.books || []);
      setKeywords(response.data.keywords || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleRefreshSuggestions = async () => {
    if (!selectedCourse) return;
    try {
      setLoadingSuggestions(true);
      setSuggestedBooks([]);
      setKeywords([]);
      setCurrentPage(1);
      await professorCourseBooksAPI.refreshBookSuggestions(selectedCourse.id);
      const response = await professorCourseBooksAPI.getBookSuggestions(
        selectedCourse.id,
      );
      setSuggestedBooks(response.data.books || []);
      setKeywords(response.data.keywords || []);
    } catch (error) {
      console.error("Error refreshing suggestions:", error);
      toast.error(
        "ไม่สามารถรีเฟรชหนังสือแนะนำได้ " + error.response?.data?.error,
      );
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const totalPages = useMemo(
    () => Math.ceil(suggestedBooks.length / ITEMS_PER_PAGE),
    [suggestedBooks.length],
  );
  const paginatedBooks = useMemo(
    () =>
      suggestedBooks.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [suggestedBooks, currentPage],
  );

  const addedBookIds = useMemo(
    () => new Set(courseBooks.map((cb) => cb.book_id)),
    [courseBooks],
  );

  // Group books by book_id to show copies count
  const groupedCourseBooks = useMemo(() => {
    const grouped = {};
    courseBooks.forEach((book) => {
      const bookId = book.book_id;
      if (!grouped[bookId]) {
        grouped[bookId] = {
          ...book,
          copies: [],
          copyCount: 0,
        };
      }
      grouped[bookId].copies.push({
        id: book.id,
        barcode: book.barcode,
        callnumber: book.callnumber,
        collection_name: book.collection_name,
        item_status: book.item_status,
        location: book.location,
      });
      grouped[bookId].copyCount++;
    });
    return Object.values(grouped);
  }, [courseBooks]);

  const isBookAdded = useCallback(
    (bookId) => addedBookIds.has(bookId),
    [addedBookIds],
  );

  const handleAddBook = useCallback(
    async (book) => {
      if (!selectedCourse) return;

      // Confirmation dialog
      if (!confirm(`ต้องการเพิ่มหนังสือ "${book.title}" ในรายวิชานี้หรือไม่?`))
        return;

      try {
        setAddingBook(book.id);
        await professorCourseBooksAPI.addBookToCourse(selectedCourse.id, {
          book_id: book.id,
          title: book.title,
          author: book.author,
          publisher: book.publisher,
          callnumber: book.callnumber,
          isbn: book.isbn,
          bookcover: book.bookcover,
        });
        fetchCourseBooks();
        toast.success("เพิ่มหนังสือในรายวิชาเรียบร้อยแล้ว");
      } catch (error) {
        toast.error(error.response?.data?.error || "ไม่สามารถเพิ่มหนังสือได้");
      } finally {
        setAddingBook(null);
      }
    },
    [selectedCourse],
  );

  const handleRemoveBook = useCallback(
    async (bookId) => {
      if (!selectedCourse) return;
      if (!confirm("ต้องการลบหนังสือออกจากรายวิชานี้หรือไม่?")) return;

      try {
        await professorCourseBooksAPI.removeBookFromCourse(
          selectedCourse.id,
          bookId,
        );
        fetchCourseBooks();
      } catch (error) {
        toast.error(error.response?.data?.error || "ไม่สามารถลบหนังสือได้");
      }
    },
    [selectedCourse],
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;

    try {
      setLoadingSearch(true);
      setSearchResults([]);
      setSelectedSearchBooks(new Set()); // Clear selection on new search
      const response = await professorCourseBooksAPI.searchBooks(
        searchKeyword.trim(),
      );
      setSearchResults(response.data.books || []);
    } catch (error) {
      console.error("Error searching books:", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Line Borrow handlers
  const openLineBorrowModal = async (book) => {
    setLineBorrowBook(book);
    setBorrowStatus(null);
    setStatusChecked(false);
    setCanBorrow(false);
    setShowLineBorrowModal(true);
    setBorrowingLine(true);

    // Auto check status when modal opens
    try {
      const response = await professorCourseBooksAPI.getLineBorrowStatus(
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
        // No borrow record found - can borrow
        setBorrowStatus(null);
        setCanBorrow(true);
      }
    } catch (error) {
      // If error (no record), can borrow
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

    if (!statusChecked) {
      toast.error("กรุณาเช็คสถานะก่อนยืม");
      return;
    }

    if (!canBorrow) {
      toast.error("ไม่สามารถยืมหนังสือเล่มนี้ได้ เนื่องจากมีรายการยืมอยู่แล้ว");
      return;
    }

    try {
      setBorrowingLine(true);
      const response = await professorCourseBooksAPI.lineBorrow({
        StudentID: currentUser.barcode,
        BibID: String(lineBorrowBook.id),
        Title: lineBorrowBook.title || "",
        Author: lineBorrowBook.author || "",
        CallNo: lineBorrowBook.callnumber || "",
        Pubyear: lineBorrowBook.pubyear || "",
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

  // Multi-select handlers for search results
  const toggleSearchBookSelect = useCallback((book) => {
    setSelectedSearchBooks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(book.id)) {
        newSet.delete(book.id);
      } else {
        newSet.add(book.id);
      }
      return newSet;
    });
  }, []);

  const selectAllSearchBooks = useCallback(() => {
    const notAddedBooks = searchResults.filter((book) => !isBookAdded(book.id));
    if (selectedSearchBooks.size === notAddedBooks.length) {
      setSelectedSearchBooks(new Set());
    } else {
      setSelectedSearchBooks(new Set(notAddedBooks.map((book) => book.id)));
    }
  }, [searchResults, selectedSearchBooks.size, isBookAdded]);

  const handleAddSelectedBooks = useCallback(async () => {
    if (!selectedCourse || selectedSearchBooks.size === 0) return;

    const booksToAdd = searchResults.filter(
      (book) => selectedSearchBooks.has(book.id) && !isBookAdded(book.id),
    );
    if (booksToAdd.length === 0) return;

    try {
      setAddingMultiple(true);
      let successCount = 0;

      for (const book of booksToAdd) {
        try {
          await professorCourseBooksAPI.addBookToCourse(selectedCourse.id, {
            book_id: book.id,
            title: book.title,
            author: book.author,
            publisher: book.publisher,
            callnumber: book.callnumber,
            isbn: book.isbn,
            bookcover: book.bookcover,
          });
          successCount++;
        } catch (error) {
          console.error(`Error adding book ${book.id}:`, error);
        }
      }

      fetchCourseBooks();
      setSelectedSearchBooks(new Set());
      toast.success(`เพิ่มหนังสือ ${successCount} เล่มเรียบร้อยแล้ว`);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มหนังสือ");
    } finally {
      setAddingMultiple(false);
    }
  }, [selectedCourse, selectedSearchBooks, searchResults, isBookAdded]);

  // Multi-select handlers for course books
  const toggleCourseBookSelect = useCallback((book) => {
    setSelectedCourseBooks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(book.id)) {
        newSet.delete(book.id);
      } else {
        newSet.add(book.id);
      }
      return newSet;
    });
  }, []);

  const selectAllCourseBooks = useCallback(() => {
    if (selectedCourseBooks.size === courseBooks.length) {
      setSelectedCourseBooks(new Set());
    } else {
      setSelectedCourseBooks(new Set(courseBooks.map((book) => book.id)));
    }
  }, [courseBooks, selectedCourseBooks.size]);

  const handleRemoveSelectedBooks = useCallback(async () => {
    if (!selectedCourse || selectedCourseBooks.size === 0) return;
    if (
      !confirm(
        `ต้องการลบหนังสือ ${selectedCourseBooks.size} เล่มออกจากรายวิชานี้หรือไม่?`,
      )
    )
      return;

    try {
      setRemovingMultiple(true);
      let successCount = 0;

      for (const bookId of selectedCourseBooks) {
        try {
          await professorCourseBooksAPI.removeBookFromCourse(
            selectedCourse.id,
            bookId,
          );
          successCount++;
        } catch (error) {
          console.error(`Error removing book ${bookId}:`, error);
        }
      }

      fetchCourseBooks();
      setSelectedCourseBooks(new Set());
      toast.success(`ลบหนังสือ ${successCount} เล่มเรียบร้อยแล้ว`);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการลบหนังสือ");
    } finally {
      setRemovingMultiple(false);
    }
  }, [selectedCourse, selectedCourseBooks]);

  // Export functions
  const exportToCSV = useCallback(() => {
    if (!selectedCourse || courseBooks.length === 0) return;

    const headers = [
      "ลำดับ",
      "ชื่อหนังสือ",
      "ผู้แต่ง",
      "สำนักพิมพ์",
      "เลขเรียกหนังสือ",
      "ISBN",
      "จำนวน (เล่ม)",
    ];
    const rows = groupedCourseBooks.map((book, index) => [
      index + 1,
      `"${(book.title || "").replace(/"/g, '""')}"`,
      `"${(book.author || "").replace(/"/g, '""')}"`,
      `"${(book.publisher || "").replace(/"/g, '""')}"`,
      `"${(book.callnumber || "").replace(/"/g, '""')}"`,
      `"${(book.isbn || "").replace(/"/g, '""')}"`,
      book.copyCount,
    ]);

    const BOM = "\uFEFF";
    const csvContent =
      BOM + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `หนังสือรายวิชา_${
        selectedCourse.code_en || selectedCourse.code_th
      }_${new Date().toLocaleDateString("th-TH")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว");
  }, [selectedCourse, courseBooks, groupedCourseBooks]);

  const exportToExcel = useCallback(() => {
    if (!selectedCourse || courseBooks.length === 0) return;

    const courseInfo = `รายการหนังสือประจำรายวิชา: ${
      selectedCourse.code_en || selectedCourse.code_th
    } - ${selectedCourse.name_th}`;
    const exportDate = `วันที่ส่งออก: ${new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
    const totalBooks = `จำนวนหนังสือทั้งหมด: ${groupedCourseBooks.length} รายการ (${courseBooks.length} เล่ม)`;

    const headers = [
      "ลำดับ",
      "ชื่อหนังสือ",
      "ผู้แต่ง",
      "สำนักพิมพ์",
      "เลขเรียกหนังสือ",
      "ISBN",
      "จำนวน (เล่ม)",
    ];
    const rows = groupedCourseBooks.map((book, index) => [
      index + 1,
      book.title || "",
      book.author || "",
      book.publisher || "",
      book.callnumber || "",
      book.isbn || "",
      book.copyCount,
    ]);

    // Create HTML table for Excel
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>หนังสือรายวิชา</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
      <body>
        <table>
          <tr><td colspan="7" style="font-size:16px;font-weight:bold;">${courseInfo}</td></tr>
          <tr><td colspan="7">${exportDate}</td></tr>
          <tr><td colspan="7">${totalBooks}</td></tr>
          <tr><td colspan="7"></td></tr>
          <tr style="background-color:#10b981;color:white;font-weight:bold;">
            ${headers
              .map(
                (h) =>
                  `<td style="padding:8px;border:1px solid #ccc;">${h}</td>`,
              )
              .join("")}
          </tr>
          ${rows
            .map(
              (row, idx) => `
            <tr style="background-color:${idx % 2 === 0 ? "#f0fdf4" : "white"}">
              ${row
                .map(
                  (cell, cellIdx) =>
                    `<td style="padding:6px;border:1px solid #e5e7eb;${
                      cellIdx === 0 || cellIdx === 6 ? "text-align:center;" : ""
                    }">${cell}</td>`,
                )
                .join("")}
            </tr>
          `,
            )
            .join("")}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `หนังสือรายวิชา_${
        selectedCourse.code_en || selectedCourse.code_th
      }_${new Date().toLocaleDateString("th-TH")}.xls`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้ว");
  }, [selectedCourse, courseBooks, groupedCourseBooks]);

  if (loading) {
    return (
      <ProfessorLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
        </div>
      </ProfessorLayout>
    );
  }

  if (courses.length === 0) {
    return (
      <ProfessorLayout>
        <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md p-12 text-center border border-emerald-100/50">
          <FiBook className="text-6xl text-emerald-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">
            ยังไม่มีรายวิชาที่คุณเป็นผู้สอน
          </p>
          <p className="text-gray-400 mt-2">
            กรุณาลงทะเบียนรายวิชาและเพิ่มชื่อของคุณเป็นอาจารย์ผู้สอน
          </p>
        </div>
      </ProfessorLayout>
    );
  }

  return (
    <ProfessorLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            คลังหนังสือประจำวิชา
          </h1>
        </div>

        {/* Course Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เลือกรายวิชา
          </label>
          <div className="relative">
            <button
              onClick={() => setShowCourseDropdown(!showCourseDropdown)}
              className="w-full sm:w-96 px-4 py-3 bg-white border-2 border-emerald-100 rounded-xl text-left flex items-center justify-between hover:border-emerald-400 transition-all"
            >
              <span className="truncate">
                {selectedCourse
                  ? `${selectedCourse.code_en || selectedCourse.code_th} - ${
                      selectedCourse.name_th
                    }`
                  : "เลือกรายวิชา"}
              </span>
              <FiChevronDown
                className={`transition-transform ${
                  showCourseDropdown ? "rotate-180" : ""
                }`}
              />
            </button>
            {showCourseDropdown && (
              <div className="absolute z-20 w-full sm:w-96 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowCourseDropdown(false);
                      setSearchResults([]);
                      setSearchKeyword("");
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors ${
                      selectedCourse?.id === course.id
                        ? "bg-emerald-50 text-emerald-700"
                        : ""
                    }`}
                  >
                    <p className="font-medium text-sm">
                      {course.code_en || course.code_th} - {course.name_th}
                    </p>
                    <p className="text-xs text-gray-500">
                      {course.curriculum_th}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedCourse && (
          <div className="space-y-6">
            {/* AI Suggestions Section - Full Width & Prominent */}
            <div className="bg-gradient-to-br from-purple-50 via-white to-violet-50 rounded-2xl shadow-lg border-2 border-purple-200 p-8 relative overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-violet-200/20 rounded-full blur-3xl -z-0"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-fuchsia-200/20 to-purple-200/20 rounded-full blur-3xl -z-0"></div>

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                      <FiZap className="text-2xl text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                        แนะนำหนังสือจาก AI
                      </h2>
                      <p className="text-sm text-gray-600">
                        ระบบค้นหาหนังสืออัตโนมัติที่เหมาะสมกับรายวิชา (
                        {suggestedBooks.length} เล่ม)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefreshSuggestions}
                    disabled={loadingSuggestions}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2 font-medium"
                  >
                    {loadingSuggestions ? (
                      <>
                        <FiLoader className="animate-spin" />
                        กำลังโหลด...
                      </>
                    ) : (
                      <>
                        <FiZap />
                        ดึงข้อมูลใหม่จาก API
                      </>
                    )}
                  </button>
                </div>

                {keywords.length > 0 && (
                  <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100">
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      คำสำคัญที่ใช้ค้นหา:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 text-sm font-medium rounded-full border border-purple-200"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {loadingSuggestions ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <FiLoader className="animate-spin text-4xl text-purple-500 mb-4" />
                    <p className="text-gray-600">
                      กำลังค้นหาหนังสือที่เหมาะสม...
                    </p>
                  </div>
                ) : suggestedBooks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiBook className="text-3xl text-purple-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">
                      ไม่พบหนังสือที่แนะนำ
                    </p>
                    <p className="text-sm text-gray-400">
                      ลองกดปุ่ม "ดึงข้อมูลใหม่จาก API"
                      เพื่อค้นหาหนังสือที่เหมาะสม
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paginatedBooks.map((book) => (
                        <BookCard
                          key={book.id}
                          book={book}
                          isAdminRecommended={book.admin_recommended}
                          onAdd={handleAddBook}
                          isAdded={isBookAdded(book.id)}
                          isAdding={addingBook === book.id}
                          onShowDetail={setSelectedBook}
                        />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t-2 border-purple-100">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="p-2.5 rounded-xl bg-white border-2 border-purple-200 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm"
                        >
                          <FiChevronLeft className="text-lg" />
                        </button>
                        <span className="text-sm font-medium text-gray-700 px-4 py-2 bg-white rounded-xl border border-purple-100">
                          หน้า {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="p-2.5 rounded-xl bg-white border-2 border-purple-200 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm"
                        >
                          <FiChevronRight className="text-lg" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Search & Course Books - Two Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Search Section */}
              <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl shadow-md border border-blue-100/50 p-6 flex flex-col h-[600px]">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiSearch className="text-blue-600" />
                  ค้นหาหนังสือ{" "}
                  {searchResults.length > 0 && `(${searchResults.length})`}
                </h2>
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="พิมพ์คำค้นหา..."
                    className="flex-1 px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loadingSearch}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loadingSearch ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiSearch />
                    )}
                  </button>
                </form>

                {/* Multi-select toolbar for search results */}
                {searchResults.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg">
                    <button
                      onClick={selectAllSearchBooks}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-all"
                    >
                      {selectedSearchBooks.size ===
                        searchResults.filter((b) => !isBookAdded(b.id))
                          .length && selectedSearchBooks.size > 0 ? (
                        <>
                          <FiCheckSquare /> ยกเลิกทั้งหมด
                        </>
                      ) : (
                        <>
                          <FiSquare /> เลือกทั้งหมด
                        </>
                      )}
                    </button>
                    {selectedSearchBooks.size > 0 && (
                      <>
                        <span className="text-xs text-blue-600">
                          เลือก {selectedSearchBooks.size} รายการ
                        </span>
                        <button
                          onClick={handleAddSelectedBooks}
                          disabled={addingMultiple}
                          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50"
                        >
                          {addingMultiple ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            <FiPlus />
                          )}
                          เพิ่มที่เลือก
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto bg-blue-50/30 rounded-lg p-3 -mx-1">
                  {searchResults.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.map((book) => (
                        <BookCard
                          key={book.id}
                          book={book}
                          onAdd={handleAddBook}
                          isAdded={isBookAdded(book.id)}
                          isAdding={addingBook === book.id}
                          onShowDetail={setSelectedBook}
                          showCheckbox={true}
                          isSelected={selectedSearchBooks.has(book.id)}
                          onToggleSelect={toggleSearchBookSelect}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      พิมพ์คำค้นหาเพื่อค้นหาหนังสือ
                    </div>
                  )}
                </div>
              </div>

              {/* Course Books */}
              <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md border border-emerald-100/50 p-6 flex flex-col h-[600px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FiBook className="text-emerald-600" />
                    หนังสือในรายวิชา ({groupedCourseBooks.length} รายการ,{" "}
                    {courseBooks.length} เล่ม)
                  </h2>

                  {/* Export Buttons */}
                  {courseBooks.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={exportToCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                        title="ส่งออกเป็น CSV"
                      >
                        <FiFileText className="text-green-600" />
                        CSV
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                        title="ส่งออกเป็น Excel"
                      >
                        <FiDownload className="text-emerald-600" />
                        Excel
                      </button>
                    </div>
                  )}
                </div>

                {/* Multi-select toolbar for course books */}
                {courseBooks.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-emerald-50 rounded-lg">
                    <button
                      onClick={selectAllCourseBooks}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all"
                    >
                      {selectedCourseBooks.size === courseBooks.length &&
                      selectedCourseBooks.size > 0 ? (
                        <>
                          <FiCheckSquare /> ยกเลิกทั้งหมด
                        </>
                      ) : (
                        <>
                          <FiSquare /> เลือกทั้งหมด
                        </>
                      )}
                    </button>
                    {selectedCourseBooks.size > 0 && (
                      <>
                        <span className="text-xs text-emerald-600">
                          เลือก {selectedCourseBooks.size} รายการ
                        </span>
                        <button
                          onClick={handleRemoveSelectedBooks}
                          disabled={removingMultiple}
                          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          {removingMultiple ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            <FiTrash2 />
                          )}
                          ลบที่เลือก
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto bg-emerald-50/30 rounded-lg p-3 -mx-1">
                  {loadingCourseBooks ? (
                    <div className="flex justify-center items-center h-full">
                      <FiLoader className="animate-spin text-2xl text-emerald-500" />
                    </div>
                  ) : courseBooks.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      ยังไม่มีหนังสือในรายวิชานี้
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {groupedCourseBooks.map((book) => (
                        <div
                          key={book.book_id}
                          className="rounded-xl border shadow-sm bg-white border-gray-100"
                        >
                          {/* Main Book Card */}
                          <div className="p-4">
                            <div className="flex gap-3">
                              {/* Book Cover */}
                              <div
                                className="w-16 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                                onClick={() =>
                                  setSelectedBook({
                                    id: book.book_id,
                                    title: book.title,
                                    author: book.author,
                                    publisher: book.publisher,
                                    callnumber: book.callnumber,
                                    bookcover: book.bookcover,
                                    isbn: book.isbn,
                                  })
                                }
                              >
                                {book.bookcover ? (
                                  <img
                                    src={book.bookcover}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FiBook className="text-gray-300 text-xl" />
                                  </div>
                                )}
                              </div>

                              {/* Book Info */}
                              <div className="flex-1 min-w-0">
                                <h3
                                  className="font-medium text-gray-800 text-sm line-clamp-2 cursor-pointer hover:text-emerald-600"
                                  onClick={() =>
                                    setSelectedBook({
                                      id: book.book_id,
                                      title: book.title,
                                      author: book.author,
                                      publisher: book.publisher,
                                      callnumber: book.callnumber,
                                      bookcover: book.bookcover,
                                      isbn: book.isbn,
                                    })
                                  }
                                >
                                  {book.title}
                                </h3>
                                {book.author && (
                                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    {book.author}
                                  </p>
                                )}

                                {/* Copy Count Badge */}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                    <FiBook className="text-xs" />
                                    {book.copyCount} เล่ม
                                  </span>
                                  {book.copyCount > 1 && (
                                    <button
                                      onClick={() =>
                                        setExpandedBookId(
                                          expandedBookId === book.book_id
                                            ? null
                                            : book.book_id,
                                        )
                                      }
                                      className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                    >
                                      {expandedBookId === book.book_id
                                        ? "ซ่อนรายละเอียด"
                                        : "ดูรายละเอียด"}
                                      <FiChevronDown
                                        className={`transition-transform ${expandedBookId === book.book_id ? "rotate-180" : ""}`}
                                      />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `ต้องการลบหนังสือ "${book.title}" ทั้งหมด ${book.copyCount} เล่มออกจากรายวิชานี้หรือไม่?`,
                                      )
                                    ) {
                                      // Remove all copies
                                      book.copies.forEach((copy) =>
                                        handleRemoveBook(copy.id),
                                      );
                                    }
                                  }}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="ลบหนังสือทั้งหมด"
                                >
                                  <FiTrash2 className="text-sm" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Copies List */}
                          {expandedBookId === book.book_id &&
                            book.copyCount > 1 && (
                              <div className="border-t border-gray-100 bg-gray-50/50 p-3">
                                <p className="text-xs font-medium text-gray-500 mb-2">
                                  รายละเอียดแต่ละเล่ม:
                                </p>
                                <div className="space-y-2">
                                  {book.copies.map((copy, idx) => (
                                    <div
                                      key={copy.id}
                                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 text-xs"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-gray-700">
                                            เล่มที่ {idx + 1}
                                          </span>
                                          {copy.barcode && (
                                            <span className="text-gray-400">
                                              ({copy.barcode})
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-gray-500">
                                          {copy.callnumber && (
                                            <span className="flex items-center gap-1">
                                              <FiHash className="text-xs" />{" "}
                                              {copy.callnumber}
                                            </span>
                                          )}
                                          {copy.location && (
                                            <span className="flex items-center gap-1">
                                              <FiMapPin className="text-xs" />{" "}
                                              {copy.location}
                                            </span>
                                          )}
                                          {copy.item_status && (
                                            <span
                                              className={`px-1.5 py-0.5 rounded text-xs ${
                                                copy.item_status === "Available"
                                                  ? "bg-green-100 text-green-700"
                                                  : "bg-amber-100 text-amber-700"
                                              }`}
                                            >
                                              {copy.item_status}
                                            </span>
                                          )}
                                        </div>
                                        {copy.collection_name && (
                                          <p className="text-gray-400 mt-1 truncate">
                                            {copy.collection_name}
                                          </p>
                                        )}
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleRemoveBook(copy.id)
                                        }
                                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                                        title="ลบเล่มนี้"
                                      >
                                        <FiTrash2 className="text-xs" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Book Detail Modal */}
      {selectedBook && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <h3 className="font-bold text-gray-800">รายละเอียดหนังสือ</h3>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
              >
                <FiX className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex gap-6">
                {/* Book Cover */}
                <div className="w-32 h-44 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-md">
                  {selectedBook.bookcover ? (
                    <img
                      src={selectedBook.bookcover}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full ${
                      selectedBook.bookcover ? "hidden" : "flex"
                    } items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100`}
                  >
                    <FiBook className="text-4xl text-emerald-400" />
                  </div>
                </div>

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
                    {selectedBook.title}
                  </h4>

                  {selectedBook.admin_recommended && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full mb-3">
                      <FiStar className="text-amber-500" />
                      แนะนำโดย Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="mt-6 space-y-4">
                {selectedBook.author && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm">👤</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">ผู้แต่ง</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {selectedBook.author}
                      </p>
                    </div>
                  </div>
                )}

                {selectedBook.publisher && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 text-sm">🏢</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">สำนักพิมพ์</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {selectedBook.publisher}
                      </p>
                    </div>
                  </div>
                )}

                {selectedBook.callnumber && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        เลขเรียกหนังสือ
                      </p>
                      <p className="text-sm text-gray-800 font-medium">
                        {selectedBook.callnumber}
                      </p>
                    </div>
                  </div>
                )}

                {selectedBook.isbn && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiHash className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">ISBN</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {selectedBook.isbn}
                      </p>
                    </div>
                  </div>
                )}

                {selectedBook.mattypeName && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiBook className="text-pink-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">ประเภท</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {selectedBook.mattypeName}
                      </p>
                    </div>
                  </div>
                )}

                {selectedBook.lang && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-cyan-600 text-sm">🌐</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">ภาษา</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {selectedBook.lang}
                      </p>
                    </div>
                  </div>
                )}

                {selectedBook.cat_date && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiCalendar className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        วันที่ลงรายการ
                      </p>
                      <p className="text-sm text-gray-800 font-medium">
                        {new Date(selectedBook.cat_date).toLocaleDateString(
                          "th-TH",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {selectedBook.keyword_source && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiSearch className="text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        คำค้นหาที่พบ
                      </p>
                      <p className="text-sm text-gray-800 font-medium">
                        {selectedBook.keyword_source}
                      </p>
                    </div>
                  </div>
                )}

                {/* Service Links - Only show for professors, not admins */}
                {currentUser?.role === "professor" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-3">บริการยืม-คืน</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openLineBorrowModal(selectedBook)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                        ยืมผ่าน Line
                      </button>
                      <button
                        disabled
                        className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg transition-colors cursor-not-allowed bg-gray-500"
                      >
                        <FiBook className="w-4 h-4" />
                        บริการ RDS
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              {!isBookAdded(selectedBook.id) ? (
                <button
                  onClick={() => {
                    handleAddBook(selectedBook);
                    setSelectedBook(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <FiPlus />
                  เพิ่มในรายวิชา
                </button>
              ) : (
                <span className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-center font-medium">
                  เพิ่มในรายวิชาแล้ว
                </span>
              )}
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

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
    </ProfessorLayout>
  );
}
