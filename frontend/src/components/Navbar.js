'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { FiBook, FiHome, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-brand p-2 rounded-lg">
              <FiBook className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold text-brand">BookRec</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`font-medium transition-colors ${
                pathname === '/' 
                  ? 'text-brand font-semibold' 
                  : 'text-gray-600 hover:text-brand'
              }`}
            >
              หนังสือแนะนำ
            </Link>
            <Link 
              href="/books" 
              className={`font-medium transition-colors ${
                pathname === '/books' 
                  ? 'text-brand font-semibold' 
                  : 'text-gray-600 hover:text-brand'
              }`}
            >
              ค้นหาหนังสือ
            </Link>

            {/* User Info and Logout */}
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="bg-brand p-2 rounded-full">
                    <FiUser className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-red-400 hover:text-red-700 font-medium transition-colors"
                >
                  <FiLogOut className="inline mr-1" />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors py-2 ${
                  pathname === '/' 
                    ? 'text-brand font-semibold' 
                    : 'text-gray-600 hover:text-brand'
                }`}
              >
                หนังสือแนะนำ
              </Link>
              <Link 
                href="/books" 
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors py-2 ${
                  pathname === '/books' 
                    ? 'text-brand font-semibold' 
                    : 'text-gray-600 hover:text-brand'
                }`}
              >
                ค้นหาหนังสือ
              </Link>

              {user && (
                <>
                  <div className="flex items-center space-x-2 py-2 border-t border-gray-100 pt-4">
                    <div className="bg-brand p-2 rounded-full">
                      <FiUser className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="text-red-400 hover:text-red-700 font-medium transition-colors text-left py-2"
                  >
                    <FiLogOut className="inline mr-2" />
                    ออกจากระบบ
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
