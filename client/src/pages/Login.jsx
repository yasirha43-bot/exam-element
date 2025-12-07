import React, { useState, useContext } from 'react';
import { authAPI } from '../api';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';

export default function Login() {
  const { darkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login(formData.email, formData.password);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('loginTime', new Date().toISOString());
      
      // Also set a cookie for session persistence (30 days)
      document.cookie = `auth_token=${response.data.token}; max-age=${30 * 24 * 60 * 60}; path=/`;
      document.cookie = `user_email=${response.data.user.email}; max-age=${30 * 24 * 60 * 60}; path=/`;
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900' 
        : 'bg-white'
    }`}>
      {/* Left side - Form */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center px-6 py-12 ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg mr-3">
              <span className="text-xl font-bold text-white">E</span>
            </div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Exam Element
            </h1>
          </div>

          <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Log In
          </h2>
          <p className={`text-sm mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Welcome back! Continue your GCSE revision journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-base ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30'
                } focus:outline-none`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-base ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30'
                } focus:outline-none`}
                required
              />
            </div>

            {error && (
              <div className={`p-4 rounded-lg text-sm font-medium ${
                darkMode 
                  ? 'bg-red-900/30 text-red-300 border border-red-800' 
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white text-base transition-all duration-200 ${
                loading
                  ? 'opacity-50 cursor-not-allowed bg-gray-400'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105'
              }`}
            >
              {loading ? '⏳ Logging in...' : '🚀 Log In'}
            </button>
          </form>

          <p className={`text-center text-sm mt-8 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            Don't have an account?{' '}
            <a href="/signup" className="font-bold text-orange-600 hover:text-orange-500 transition-colors">
              Sign up
            </a>
          </p>

          <p className={`text-center text-xs mt-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            By logging in, you agree to our Terms & Conditions
          </p>
        </div>
      </div>

      {/* Right side - Testimonial/Quote */}
      <div className={`hidden lg:flex w-1/2 items-center justify-center p-12 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-orange-50 to-orange-100'
      }`}>
        <div className="max-w-md text-center">
          {/* Bacteria Cell SVG */}
          <div className="mb-8">
            <svg width="128" height="128" viewBox="0 0 128 128" className="mx-auto">
              {/* Outer circle background */}
              <circle cx="64" cy="64" r="60" fill="#fed7aa" stroke="#f97316" strokeWidth="4"/>
              
              {/* Main cell body */}
              <ellipse cx="64" cy="64" rx="40" ry="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
              
              {/* Cell nucleus */}
              <circle cx="64" cy="64" r="18" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1.5"/>
              
              {/* DNA strands in nucleus */}
              <path d="M 54 58 Q 64 54, 74 58" stroke="#ea580c" strokeWidth="1.5" fill="none"/>
              <path d="M 54 70 Q 64 74, 74 70" stroke="#ea580c" strokeWidth="1.5" fill="none"/>
              
              {/* Flagella */}
              <path d="M 104 60 Q 110 50, 115 40" stroke="#fb923c" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M 104 68 Q 115 75, 120 88" stroke="#fb923c" strokeWidth="2" fill="none" strokeLinecap="round"/>
              
              {/* Pili */}
              <path d="M 30 55 Q 20 45, 15 35" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M 30 73 Q 18 80, 10 95" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              
              {/* Ribosomes (small dots) */}
              <circle cx="50" cy="50" r="3" fill="#ea580c" opacity="0.7"/>
              <circle cx="78" cy="58" r="3" fill="#ea580c" opacity="0.7"/>
              <circle cx="55" cy="78" r="3" fill="#ea580c" opacity="0.7"/>
              <circle cx="75" cy="75" r="3" fill="#ea580c" opacity="0.7"/>
            </svg>
          </div>

          {/* Quote Mark */}
          <div className={`text-6xl mb-6 leading-none ${
            darkMode ? 'text-orange-600/40' : 'text-orange-200'
          }`}>
            "
          </div>

          {/* Testimonial Text */}
          <p className={`text-xl font-semibold mb-8 leading-relaxed ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            This site helped me ace my GCSE biology exam. The AI-generated flashcards and quizzes are incredibly helpful!
          </p>

          {/* Author */}
          <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Sarah M.
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            GCSE Student, Grade 9
          </p>
        </div>
      </div>
    </div>
  );
}
