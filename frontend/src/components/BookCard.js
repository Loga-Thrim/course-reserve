"use client";

import { useState } from "react";
import Image from "next/image";
import { FiBook, FiUser, FiTag, FiCalendar, FiBookOpen } from "react-icons/fi";
import { borrowsAPI } from "../lib/api";

export default function BookCard({ book, onBorrow, showBorrowButton = true }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState(false);

  const handleBorrow = async () => {
    setLoading(true);
    setMessage("");

    try {
      await borrowsAPI.borrow(book.id);
      setMessage("ยืมหนังสือสำเร็จ!");
      if (onBorrow) onBorrow();
    } catch (error) {
      setMessage(error.response?.data?.error || "ไม่สามารถยืมหนังสือได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in group">
      <div className="flex flex-col h-full">
        {/* Book Cover */}
        <div className="relative h-48 bg-gradient-to-br from-brand-light to-brand-dark overflow-hidden">
          {book.cover_url && !imageError ? (
            <>
              <Image
                src={book.cover_url}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-300"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300"></div>
              <FiBook className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-5xl group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
              </div>
            </>
          )}
        </div>

        {/* Book Details */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
            {book.title}
          </h3>

          <div className="space-y-1.5 mb-3 flex-grow">
            <div className="flex items-center text-gray-600 text-xs">
              <FiUser className="mr-2" />
              <span>{book.author}</span>
            </div>

            {book.category_name && (
              <div className="flex items-center text-gray-600 text-sm">
                <FiTag className="mr-2" />
                <span>{book.category_name}</span>
              </div>
            )}

            {book.published_year && (
              <div className="flex items-center text-gray-600 text-sm">
                <FiCalendar className="mr-2" />
                <span>{book.published_year}</span>
              </div>
            )}

            {book.description && (
              <p className="text-gray-600 text-sm mt-3 line-clamp-3">
                {book.description}
              </p>
            )}
          </div>

          {/* Availability */}
          <div className="mb-4">
            <span
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                book.available_copies > 0
                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                  : "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  book.available_copies > 0
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                }`}
              ></span>
              {book.available_copies > 0
                ? `มี ${book.available_copies} เล่ม`
                : "ไม่มีให้ยืม"}
            </span>
          </div>

          {/* Borrow Button */}
          {showBorrowButton && (
            <>
              <button
                onClick={handleBorrow}
                disabled={loading || book.available_copies <= 0}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  book.available_copies > 0
                    ? loading
                      ? "btn-primary opacity-90 cursor-wait"
                      : "btn-primary hover:scale-[1.02]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <span>กำลังดำเนินการ...</span>
                  </>
                ) : (
                  <>
                    <FiBookOpen className="text-lg" />
                    <span>ยืมหนังสือ</span>
                  </>
                )}
              </button>

              {message && (
                <p
                  className={`mt-2 text-xs text-center font-medium ${
                    message.includes("สำเร็จ")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
