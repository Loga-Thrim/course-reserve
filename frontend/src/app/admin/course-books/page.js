"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { adminCourseBooksAPI } from "../../../lib/adminApi";
import { FiSearch, FiPlus, FiTrash2, FiBook, FiChevronDown, FiLoader, FiStar, FiChevronLeft, FiChevronRight, FiInfo, FiUser, FiGlobe, FiFileText } from "react-icons/fi";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 12;

const BookCard = memo(({ book, showAddButton = false, showRemoveButton = false, isAdminRecommended = false, onAdd, onRemove, isAdded, isAdding }) => (
  <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-4 ${isAdminRecommended ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}>
    <div className="flex gap-4">
      <div className="w-20 h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
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
              <FiStar className="text-amber-500" />
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
        <div className="mt-2 flex flex-wrap gap-2">
          {showAddButton && !isAdded && (
            <button
              onClick={() => onAdd(book)}
              disabled={isAdding}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs rounded-lg hover:shadow-md transition-all flex items-center gap-1 disabled:opacity-50"
            >
              {isAdding ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiPlus />
              )}
              แนะนำหนังสือนี้
            </button>
          )}
          {showAddButton && isAdded && (
            <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-lg">
              เพิ่มแล้ว
            </span>
          )}
          {showRemoveButton && (
            <button
              onClick={() => onRemove(book.id)}
              className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 transition-all flex items-center gap-1"
            >
              <FiTrash2 />
              ลบ
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
));

BookCard.displayName = 'BookCard';

export default function AdminCourseBooksPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [addingBook, setAddingBook] = useState(null);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchRecommendedBooks();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await adminCourseBooksAPI.getAllCourses();
      setCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("ไม่สามารถโหลดรายวิชาได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedBooks = async () => {
    if (!selectedCourse) return;
    try {
      setLoadingBooks(true);
      const response = await adminCourseBooksAPI.getRecommendedBooks(selectedCourse.id);
      setRecommendedBooks(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching recommended books:", error);
      toast.error("ไม่สามารถโหลดหนังสือแนะนำได้");
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;

    try {
      setLoadingSearch(true);
      setSearchResults([]);
      const response = await adminCourseBooksAPI.searchBooks(searchKeyword.trim());
      setSearchResults(response.data.books || []);
    } catch (error) {
      console.error("Error searching books:", error);
      toast.error("ไม่สามารถค้นหาหนังสือได้");
    } finally {
      setLoadingSearch(false);
    }
  };

  const addedBookIds = useMemo(() => new Set(recommendedBooks.map(rb => rb.book_id)), [recommendedBooks]);

  const isBookAdded = useCallback((bookId) => addedBookIds.has(bookId), [addedBookIds]);

  const handleAddBook = useCallback(async (book) => {
    if (!selectedCourse) return;

    try {
      setAddingBook(book.id);
      await adminCourseBooksAPI.addRecommendedBook(selectedCourse.id, {
        book_id: book.id,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        callnumber: book.callnumber,
        isbn: book.isbn,
        bookcover: book.bookcover,
        mattype_name: book.mattypeName,
        lang: book.lang
      });
      fetchRecommendedBooks();
      toast.success("เพิ่มหนังสือแนะนำเรียบร้อยแล้ว");
    } catch (error) {
      toast.error(error.response?.data?.error || "ไม่สามารถเพิ่มหนังสือได้");
    } finally {
      setAddingBook(null);
    }
  }, [selectedCourse]);

  const handleRemoveBook = useCallback(async (bookId) => {
    if (!selectedCourse) return;
    if (!confirm("ต้องการลบหนังสือแนะนำนี้หรือไม่?")) return;

    try {
      await adminCourseBooksAPI.removeRecommendedBook(selectedCourse.id, bookId);
      fetchRecommendedBooks();
      toast.success("ลบหนังสือแนะนำเรียบร้อยแล้ว");
    } catch (error) {
      toast.error(error.response?.data?.error || "ไม่สามารถลบหนังสือได้");
    }
  }, [selectedCourse]);

  const filteredCourses = useMemo(() => courses.filter(course => 
    course.name_th?.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.name_en?.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.code_th?.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.code_en?.toLowerCase().includes(courseSearch.toLowerCase())
  ), [courses, courseSearch]);

  const adminBooks = useMemo(() => recommendedBooks.filter(book => book.admin_recommended), [recommendedBooks]);
  const aiBooks = useMemo(() => recommendedBooks.filter(book => !book.admin_recommended), [recommendedBooks]);

  const totalPages = useMemo(() => Math.ceil(aiBooks.length / ITEMS_PER_PAGE), [aiBooks.length]);
  const paginatedAiBooks = useMemo(() => aiBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ), [aiBooks, currentPage]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (courses.length === 0) {
    return (
      <AdminLayout>
        <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md p-12 text-center border border-emerald-100/50">
          <FiBook className="text-6xl text-emerald-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">ยังไม่มีรายวิชาในระบบ</p>
          <p className="text-gray-400 mt-2">กรุณารอให้อาจารย์ลงทะเบียนรายวิชาก่อน</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
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
              className="w-full sm:w-[500px] px-4 py-3 bg-white border-2 border-emerald-100 rounded-xl text-left flex items-center justify-between hover:border-emerald-400 transition-all"
            >
              <span className="truncate">
                {selectedCourse ? `${selectedCourse.code_th} - ${selectedCourse.name_th}` : "เลือกรายวิชา"}
              </span>
              <div className="flex items-center gap-2">
                {selectedCourse?.admin_books_count > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                    {selectedCourse.admin_books_count} แนะนำ
                  </span>
                )}
                <FiChevronDown className={`transition-transform ${showCourseDropdown ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {showCourseDropdown && (
              <div className="absolute z-20 w-full sm:w-[500px] mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="ค้นหารายวิชา..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowCourseDropdown(false);
                        setSearchResults([]);
                        setSearchKeyword("");
                        setCourseSearch("");
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors ${
                        selectedCourse?.id === course.id ? 'bg-emerald-50 text-emerald-700' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{course.code_th} - {course.name_th}</p>
                          <p className="text-xs text-gray-500">{course.curriculum_th}</p>
                        </div>
                        {course.admin_books_count > 0 && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                            {course.admin_books_count}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedCourse && (
          <div className="space-y-6">
            {/* Course Details Section */}
            <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md border border-emerald-100/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <FiInfo className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedCourse.code_th} - {selectedCourse.name_th}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedCourse.code_en} - {selectedCourse.name_en}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/60 rounded-lg p-4 border border-emerald-100">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <FiBook className="text-emerald-500" /> หลักสูตร
                  </p>
                  <p className="text-sm font-medium text-gray-700">{selectedCourse.curriculum_th || '-'}</p>
                  <p className="text-xs text-gray-500">{selectedCourse.curriculum_en || ''}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-4 border border-emerald-100">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <FiUser className="text-emerald-500" /> อาจารย์ผู้สอน
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCourse.instructors && selectedCourse.instructors.length > 0 ? (
                      selectedCourse.instructors.map((inst, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                          {inst.instructor_name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </div>
                </div>
              </div>

              {(selectedCourse.description_th || selectedCourse.description_en) && (
                <div className="bg-white/60 rounded-lg p-4 border border-emerald-100">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <FiFileText className="text-emerald-500" /> คำอธิบายรายวิชา
                  </p>
                  {selectedCourse.description_th && (
                    <p className="text-sm text-gray-700 mb-2">{selectedCourse.description_th}</p>
                  )}
                  {selectedCourse.description_en && (
                    <p className="text-sm text-gray-500 italic">{selectedCourse.description_en}</p>
                  )}
                </div>
              )}

              {selectedCourse.website && (
                <div className="mt-4">
                  <a 
                    href={selectedCourse.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    <FiGlobe /> {selectedCourse.website}
                  </a>
                </div>
              )}
            </div>

            {/* Search Section */}
            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl shadow-md border border-blue-100/50 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiSearch className="text-blue-600" />
                ค้นหาหนังสือจากห้องสมุด {searchResults.length > 0 && `(${searchResults.length})`}
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
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loadingSearch ? <FiLoader className="animate-spin" /> : <FiSearch />}
                </button>
              </form>
              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
                  {searchResults.map((book) => (
                    <BookCard 
                      key={book.id} 
                      book={book} 
                      showAddButton={true}
                      onAdd={handleAddBook}
                      isAdded={isBookAdded(book.id)}
                      isAdding={addingBook === book.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Admin Recommended Books Section */}
            <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-2xl shadow-lg border-2 border-amber-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <FiStar className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    หนังสือแนะนำจาก Admin ({adminBooks.length})
                  </h2>
                  <p className="text-sm text-gray-600">หนังสือเหล่านี้จะแสดงเป็นอันดับแรกให้อาจารย์เห็น</p>
                </div>
              </div>

              {loadingBooks ? (
                <div className="flex justify-center py-8">
                  <FiLoader className="animate-spin text-2xl text-amber-500" />
                </div>
              ) : adminBooks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ยังไม่มีหนังสือแนะนำจาก Admin</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminBooks.map((book) => (
                    <BookCard 
                      key={book.id} 
                      book={{
                        id: book.id,
                        title: book.title,
                        author: book.author,
                        publisher: book.publisher,
                        callnumber: book.callnumber,
                        bookcover: book.bookcover
                      }}
                      showRemoveButton={true}
                      isAdminRecommended={true}
                      onRemove={handleRemoveBook}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* AI Recommended Books Section */}
            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl shadow-md border border-purple-100/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <FiBook className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    หนังสือจาก AI ({aiBooks.length})
                  </h2>
                  <p className="text-sm text-gray-600">หนังสือที่ระบบแนะนำอัตโนมัติจากคำอธิบายรายวิชา</p>
                </div>
              </div>

              {loadingBooks ? (
                <div className="flex justify-center py-8">
                  <FiLoader className="animate-spin text-2xl text-purple-500" />
                </div>
              ) : aiBooks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ยังไม่มีหนังสือจาก AI</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedAiBooks.map((book) => (
                      <BookCard 
                        key={book.id} 
                        book={{
                          id: book.id,
                          title: book.title,
                          author: book.author,
                          publisher: book.publisher,
                          callnumber: book.callnumber,
                          bookcover: book.bookcover
                        }}
                        showRemoveButton={true}
                        isAdminRecommended={false}
                        onRemove={handleRemoveBook}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-purple-100">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-xl bg-white border-2 border-purple-200 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-all"
                      >
                        <FiChevronLeft />
                      </button>
                      <span className="text-sm font-medium text-gray-700 px-4 py-2 bg-white rounded-xl border border-purple-100">
                        หน้า {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 rounded-xl bg-white border-2 border-purple-200 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-all"
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
