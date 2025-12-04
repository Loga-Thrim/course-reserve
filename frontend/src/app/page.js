'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { recommendationsAPI } from '../lib/api';
import Navbar from '../components/Navbar';
import BookCard from '../components/BookCard';
import Loading from '../components/Loading';
import { FiStar, FiTrendingUp } from 'react-icons/fi';

export default function HomePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sections, setSections] = useState([]);
  const [basedOn, setBasedOn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendations();
    }
  }, [isAuthenticated]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await recommendationsAPI.get();
      setSections(response.data.sections || []);
      setBasedOn(response.data.basedOn);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลแนะนำได้');
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            หนังสือแนะนำสำหรับคุณ
          </h1>
          <p className="text-gray-600 text-sm">
            ค้นพบหนังสือที่เหมาะกับความสนใจและประวัติการอ่านของคุณ
          </p>
        </div>

        {/* Based On Section */}
        {basedOn && (basedOn.favoriteCategories.length > 0 || basedOn.recentSearches.length > 0) && (
          <div className="bg-gray-50 rounded-lg p-5 mb-6 border border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
              <FiTrendingUp className="text-brand mr-2" />
              อิงจากกิจกรรมของคุณ
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {basedOn.favoriteCategories.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-2">หมวดหมู่ที่คุณชื่นชอบ</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {basedOn.favoriteCategories.slice(0, 5).map((cat, index) => (
                      <span key={index} className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-md text-xs">
                        หมวด #{cat.category_id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {basedOn.recentSearches.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-2">การค้นหาล่าสุด</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {basedOn.recentSearches.slice(0, 5).map((search, index) => (
                      <span key={index} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                        "{search}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50/50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Recommendation Sections */}
        {sections.length > 0 ? (
          <div className="space-y-14">
            {sections.map((section, index) => (
              <div key={index}>
                {/* Section Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    {section.type === 'personalized' && (
                      <FiStar className="text-2xl text-brand" />
                    )}
                    {section.type === 'popular' && (
                      <FiTrendingUp className="text-2xl text-brand" />
                    )}
                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">{section.subtitle}</p>
                </div>
                
                {/* Books Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {section.books.map((book) => (
                    <BookCard 
                      key={book.id} 
                      book={book} 
                      onBorrow={fetchRecommendations}
                      showBorrowButton={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">ไม่มีหนังสือแนะนำในขณะนี้</p>
            <p className="text-sm text-gray-400 mt-2">ลองยืมหนังสือเพื่อรับคำแนะนำที่เหมาะสม</p>
            <button
              onClick={() => router.push('/books')}
              className="btn-primary px-8 py-3 mt-4"
            >
              ค้นหาหนังสือ
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
