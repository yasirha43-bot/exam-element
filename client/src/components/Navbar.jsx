import React, { useContext } from 'react';
import { ThemeContext } from '../App';

export default function Navbar({ user, onLogout }) {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className={`border-b transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200 shadow-md'
    }`}>
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="flex items-center gap-3">
          {/* Sunset gradient logo */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold text-white">✓</span>
          </div>
          <a href="/" className={`text-lg font-bold transition-colors ${
            darkMode 
              ? 'text-white' 
              : 'text-gray-900'
          }`}>
            Exam Element
          </a>
        </div>

        <div className="flex items-center space-x-6">
          <a href="/" className={`hover:text-orange-600 transition-colors font-medium ${
            darkMode 
              ? 'text-gray-300 hover:text-white' 
              : 'text-gray-700'
          }`}>
            Home
          </a>
          <a href="/flashcards" className={`hover:text-orange-600 transition-colors font-medium ${
            darkMode 
              ? 'text-gray-300 hover:text-white' 
              : 'text-gray-700'
          }`}>
            Flashcards
          </a>
          <a href="/dashboard" className={`hover:text-orange-600 transition-colors font-medium ${
            darkMode 
              ? 'text-gray-300 hover:text-white' 
              : 'text-gray-700'
          }`}>
            Dashboard
          </a>
          <a href="/contact" className={`hover:text-orange-600 transition-colors font-medium ${
            darkMode 
              ? 'text-gray-300 hover:text-white' 
              : 'text-gray-700'
          }`}>
            Contact
          </a>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                darkMode 
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {user ? (
              <>
                {!user.is_subscribed && (
                  <a href="/upgrade" className={`px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all ${
                    darkMode
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}>
                    Upgrade
                  </a>
                )}
                <span className={`text-sm font-medium ${
                  darkMode 
                    ? 'text-gray-400' 
                    : 'text-gray-700'
                }`}>
                  {user.email}
                </span>
                <button 
                  onClick={onLogout} 
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    darkMode 
                      ? 'bg-gray-700 text-red-400 hover:bg-gray-600' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  darkMode 
                    ? 'text-gray-200 border border-gray-600 hover:bg-gray-700' 
                    : 'text-gray-700 border border-gray-300 hover:border-orange-500 hover:text-orange-600'
                }`}>
                  Login
                </a>
                <a href="/signup" className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  darkMode
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg'
                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg'
                }`}>
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
