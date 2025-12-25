"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useSearchParams } from "next/navigation";
import ProfessorLayout from "../../../components/professor/ProfessorLayout";
import { professorCourseBooksAPI } from "../../../lib/professorApi";
import { FiSearch, FiPlus, FiTrash2, FiBook, FiChevronDown, FiX, FiLoader, FiZap, FiChevronLeft, FiChevronRight, FiStar, FiCalendar, FiMapPin, FiHash } from "react-icons/fi";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 12;

const BookCard = memo(({ book, showAddButton = true, showRemoveButton = false, onAdd, onRemove, isAdded, isAdding, isAdminRecommended = false, onShowDetail }) => (
  <div 
    className={`rounded-xl border shadow-sm hover:shadow-md transition-all p-4 cursor-pointer ${isAdminRecommended ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-gray-100'}`}
    onClick={() => onShowDetail && onShowDetail(book)}
  >
    <div className="flex gap-4">
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
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`w-full h-full ${book.bookcover ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100`}>
          <FiBook className="text-3xl text-emerald-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1 flex-1">{book.title}</h4>
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
          <p className="text-xs text-emerald-600 font-medium mb-1">เลขเรียก: {book.callnumber}</p>
        )}
        {book.publisher && (
          <p className="text-xs text-gray-400 line-clamp-1">{book.publisher}</p>
        )}
        <div className="mt-2 flex gap-2">
          {showAddButton && !isAdded && (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(book); }}
              disabled={isAdding}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs rounded-lg hover:shadow-md transition-all flex items-center gap-1 disabled:opacity-50"
            >
              {isAdding ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiPlus />
              )}
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
              onClick={(e) => { e.stopPropagation(); onRemove(book.id); }}
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
));

BookCard.displayName = 'BookCard';

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

  // Check auth before fetching data
  useEffect(() => {
    const token = localStorage.getItem('professorToken');
    const user = localStorage.getItem('professorUser');
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser.role === 'professor' || parsedUser.role === 'admin') {
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Error parsing user:', e);
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
      
      const courseIdFromUrl = searchParams.get('courseId');
      if (courseIdFromUrl) {
        const targetCourse = response.data.find(c => c.id === parseInt(courseIdFromUrl));
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
      const response = await professorCourseBooksAPI.getCourseBooks(selectedCourse.id);
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
      const response = await professorCourseBooksAPI.getBookSuggestions(selectedCourse.id);
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
      const response = await professorCourseBooksAPI.getBookSuggestions(selectedCourse.id);
      setSuggestedBooks(response.data.books || []);
      setKeywords(response.data.keywords || []);
    } catch (error) {
      console.error("Error refreshing suggestions:", error);
      toast.error("ไม่สามารถรีเฟรชหนังสือแนะนำได้ " + error.response?.data?.error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const totalPages = useMemo(() => Math.ceil(suggestedBooks.length / ITEMS_PER_PAGE), [suggestedBooks.length]);
  const paginatedBooks = useMemo(() => suggestedBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ), [suggestedBooks, currentPage]);

  const addedBookIds = useMemo(() => new Set(courseBooks.map(cb => cb.book_id)), [courseBooks]);

  const isBookAdded = useCallback((bookId) => addedBookIds.has(bookId), [addedBookIds]);

  const handleAddBook = useCallback(async (book) => {
    if (!selectedCourse) return;

    try {
      setAddingBook(book.id);
      await professorCourseBooksAPI.addBookToCourse(selectedCourse.id, {
        book_id: book.id,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        callnumber: book.callnumber,
        isbn: book.isbn,
        bookcover: book.bookcover
      });
      fetchCourseBooks();
      toast.success("เพิ่มหนังสือในรายวิชาเรียบร้อยแล้ว");
    } catch (error) {
      toast.error(error.response?.data?.error || "ไม่สามารถเพิ่มหนังสือได้");
    } finally {
      setAddingBook(null);
    }
  }, [selectedCourse]);

  const handleRemoveBook = useCallback(async (bookId) => {
    if (!selectedCourse) return;
    if (!confirm("ต้องการลบหนังสือออกจากรายวิชานี้หรือไม่?")) return;

    try {
      await professorCourseBooksAPI.removeBookFromCourse(selectedCourse.id, bookId);
      fetchCourseBooks();
    } catch (error) {
      toast.error(error.response?.data?.error || "ไม่สามารถลบหนังสือได้");
    }
  }, [selectedCourse]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;

    try {
      setLoadingSearch(true);
      setSearchResults([]);
      const response = await professorCourseBooksAPI.searchBooks(searchKeyword.trim());
      setSearchResults(response.data.books || []);
    } catch (error) {
      console.error("Error searching books:", error);
    } finally {
      setLoadingSearch(false);
    }
  };

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
          <p className="text-gray-600 text-lg font-medium">ยังไม่มีรายวิชาที่คุณเป็นผู้สอน</p>
          <p className="text-gray-400 mt-2">กรุณาลงทะเบียนรายวิชาและเพิ่มชื่อของคุณเป็นอาจารย์ผู้สอน</p>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">เลือกรายวิชา</label>
          <div className="relative">
            <button
              onClick={() => setShowCourseDropdown(!showCourseDropdown)}
              className="w-full sm:w-96 px-4 py-3 bg-white border-2 border-emerald-100 rounded-xl text-left flex items-center justify-between hover:border-emerald-400 transition-all"
            >
              <span className="truncate">
                {selectedCourse ? `${selectedCourse.code_en || selectedCourse.code_th} - ${selectedCourse.name_th}` : "เลือกรายวิชา"}
              </span>
              <FiChevronDown className={`transition-transform ${showCourseDropdown ? 'rotate-180' : ''}`} />
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
                      selectedCourse?.id === course.id ? 'bg-emerald-50 text-emerald-700' : ''
                    }`}
                  >
                    <p className="font-medium text-sm">{course.code_en || course.code_th} - {course.name_th}</p>
                    <p className="text-xs text-gray-500">{course.curriculum_th}</p>
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
                        ระบบค้นหาหนังสืออัตโนมัติที่เหมาะสมกับรายวิชา ({suggestedBooks.length} เล่ม)
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
                        <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 text-sm font-medium rounded-full border border-purple-200">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {loadingSuggestions ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <FiLoader className="animate-spin text-4xl text-purple-500 mb-4" />
                    <p className="text-gray-600">กำลังค้นหาหนังสือที่เหมาะสม...</p>
                  </div>
                ) : suggestedBooks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiBook className="text-3xl text-purple-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">ไม่พบหนังสือที่แนะนำ</p>
                    <p className="text-sm text-gray-400">ลองกดปุ่ม "ดึงข้อมูลใหม่จาก API" เพื่อค้นหาหนังสือที่เหมาะสม</p>
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
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2.5 rounded-xl bg-white border-2 border-purple-200 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm"
                        >
                          <FiChevronLeft className="text-lg" />
                        </button>
                        <span className="text-sm font-medium text-gray-700 px-4 py-2 bg-white rounded-xl border border-purple-100">
                          หน้า {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
                  ค้นหาหนังสือ {searchResults.length > 0 && `(${searchResults.length})`}
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
                    {loadingSearch ? <FiLoader className="animate-spin" /> : <FiSearch />}
                  </button>
                </form>
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
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiBook className="text-emerald-600" />
                  หนังสือในรายวิชา ({courseBooks.length})
                </h2>
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
                    {courseBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={{
                          id: book.book_id,
                          title: book.title,
                          author: book.author,
                          publisher: book.publisher,
                          callnumber: book.callnumber,
                          bookcover: book.bookcover
                        }}
                        showAddButton={false}
                        showRemoveButton={true}
                        onRemove={() => handleRemoveBook(book.id)}
                      />
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
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full ${selectedBook.bookcover ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100`}>
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
                      <p className="text-sm text-gray-800 font-medium">{selectedBook.author}</p>
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
                      <p className="text-sm text-gray-800 font-medium">{selectedBook.publisher}</p>
                    </div>
                  </div>
                )}

                {selectedBook.callnumber && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">เลขเรียกหนังสือ</p>
                      <p className="text-sm text-gray-800 font-medium">{selectedBook.callnumber}</p>
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
                      <p className="text-sm text-gray-800 font-medium">{selectedBook.isbn}</p>
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
                      <p className="text-sm text-gray-800 font-medium">{selectedBook.mattypeName}</p>
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
                      <p className="text-sm text-gray-800 font-medium">{selectedBook.lang}</p>
                    </div>
                  </div>
                )}

                {selectedBook.cat_date && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiCalendar className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">วันที่ลงรายการ</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {new Date(selectedBook.cat_date).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
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
                      <p className="text-xs text-gray-500 mb-0.5">คำค้นหาที่พบ</p>
                      <p className="text-sm text-gray-800 font-medium">{selectedBook.keyword_source}</p>
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
    </ProfessorLayout>
  );
}
