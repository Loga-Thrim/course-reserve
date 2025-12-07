"use client";

import { useEffect, useState } from "react";
import ProfessorLayout from "../../../components/professor/ProfessorLayout";
import { professorCourseBooksAPI } from "../../../lib/professorApi";
import { FiSearch, FiPlus, FiTrash2, FiBook, FiChevronDown, FiX, FiLoader, FiZap, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ITEMS_PER_PAGE = 10;

export default function CourseBooksPage() {
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

  useEffect(() => {
    fetchMyCourses();
  }, []);

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
      // Fetch the updated suggestions
      const response = await professorCourseBooksAPI.getBookSuggestions(selectedCourse.id);
      setSuggestedBooks(response.data.books || []);
      setKeywords(response.data.keywords || []);
    } catch (error) {
      console.error("Error refreshing suggestions:", error);
      alert("ไม่สามารถรีเฟรชหนังสือแนะนำได้");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(suggestedBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = suggestedBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const handleAddBook = async (book) => {
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
      alert("เพิ่มหนังสือในรายวิชาเรียบร้อยแล้ว");
    } catch (error) {
      alert(error.response?.data?.error || "ไม่สามารถเพิ่มหนังสือได้");
    } finally {
      setAddingBook(null);
    }
  };

  const handleRemoveBook = async (bookId) => {
    if (!selectedCourse) return;
    if (!confirm("ต้องการลบหนังสือออกจากรายวิชานี้หรือไม่?")) return;

    try {
      await professorCourseBooksAPI.removeBookFromCourse(selectedCourse.id, bookId);
      fetchCourseBooks();
    } catch (error) {
      alert(error.response?.data?.error || "ไม่สามารถลบหนังสือได้");
    }
  };

  const isBookAdded = (bookId) => {
    return courseBooks.some(cb => cb.book_id === bookId);
  };

  const BookCard = ({ book, showAddButton = true, showRemoveButton = false, onRemove }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4">
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
          <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">{book.title}</h4>
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
            {showAddButton && !isBookAdded(book.id) && (
              <button
                onClick={() => handleAddBook(book)}
                disabled={addingBook === book.id}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs rounded-lg hover:shadow-md transition-all flex items-center gap-1 disabled:opacity-50"
              >
                {addingBook === book.id ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiPlus />
                )}
                เพิ่มในรายวิชา
              </button>
            )}
            {showAddButton && isBookAdded(book.id) && (
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
                ลบออก
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

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
                {selectedCourse ? `${selectedCourse.code_th} - ${selectedCourse.name_th}` : "เลือกรายวิชา"}
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
                    <p className="font-medium text-sm">{course.code_th} - {course.name_th}</p>
                    <p className="text-xs text-gray-500">{course.curriculum_th}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedCourse && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Search & Suggestions */}
            <div className="space-y-6">
              {/* Search Section */}
              <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl shadow-md border border-blue-100/50 p-6">
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
                {searchResults.length > 0 && (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {searchResults.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                )}
              </div>

              {/* AI Suggestions Section */}
              <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl shadow-md border border-purple-100/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FiZap className="text-purple-600" />
                    แนะนำหนังสือจาก AI ({suggestedBooks.length})
                  </h2>
                  <button
                    onClick={handleRefreshSuggestions}
                    disabled={loadingSuggestions}
                    className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    {loadingSuggestions ? <FiLoader className="animate-spin" /> : "ดึงข้อมูลใหม่จาก API"}
                  </button>
                </div>

                {keywords.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">คำสำคัญที่ใช้ค้นหา:</p>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((kw, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {loadingSuggestions ? (
                  <div className="flex justify-center py-8">
                    <FiLoader className="animate-spin text-2xl text-purple-500" />
                  </div>
                ) : suggestedBooks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">ไม่พบหนังสือที่แนะนำ</p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {paginatedBooks.map((book) => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-purple-100">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-purple-100 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-200 transition-all"
                        >
                          <FiChevronLeft />
                        </button>
                        <span className="text-sm text-gray-600 px-3">
                          หน้า {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg bg-purple-100 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-200 transition-all"
                        >
                          <FiChevronRight />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Course Books */}
            <div>
              <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md border border-emerald-100/50 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiBook className="text-emerald-600" />
                  หนังสือในรายวิชา ({courseBooks.length})
                </h2>
                {loadingCourseBooks ? (
                  <div className="flex justify-center py-8">
                    <FiLoader className="animate-spin text-2xl text-emerald-500" />
                  </div>
                ) : courseBooks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">ยังไม่มีหนังสือในรายวิชานี้</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
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
        )}
      </div>
    </ProfessorLayout>
  );
}
