import React, { useState, useContext } from 'react';
import { authAPI } from '../api';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';

export default function SignUp() {
  const { darkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    if (!pwd) return '';
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const isLongEnough = pwd.length >= 8;
    
    if (!hasUpperCase) return 'Need at least one uppercase letter';
    if (!hasNumber) return 'Need at least one number';
    if (!isLongEnough) return 'Must be 8+ characters';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const pwdError = validatePassword(formData.password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }
    
    if (!formData.email || !formData.firstName) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await authAPI.signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName || null
      );
      
      setSuccess('Account created! Redirecting...');
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('loginTime', new Date().toISOString());
      
      // Also set cookies for session persistence (30 days)
      document.cookie = `auth_token=${response.data.token}; max-age=${30 * 24 * 60 * 60}; path=/`;
      document.cookie = `user_email=${response.data.user.email}; max-age=${30 * 24 * 60 * 60}; path=/`;
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.error || 'Signup failed. Try another email.');
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
            Create an account
          </h2>
          <p className={`text-sm mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Join thousands of students mastering their exams
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
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
                Last Name <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-base ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30'
                } focus:outline-none`}
              />
            </div>

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
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-base ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30'
                } focus:outline-none`}
                required
              />
              {passwordError && (
                <p className={`text-xs mt-2 flex items-center gap-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  ⚠️ {passwordError}
                </p>
              )}
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

            {success && (
              <div className={`p-4 rounded-lg text-sm font-medium ${
                darkMode 
                  ? 'bg-green-900/30 text-green-300 border border-green-800' 
                  : 'bg-green-100 text-green-700 border border-green-300'
              }`}>
                ✓ {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!passwordError}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white text-base transition-all duration-200 ${
                loading || !!passwordError
                  ? 'opacity-50 cursor-not-allowed bg-gray-400'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105'
              }`}
            >
              {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
            </button>
          </form>

          <p className={`text-center text-sm mt-8 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            Already have an account?{' '}
            <a href="/login" className="font-bold text-orange-600 hover:text-orange-500 transition-colors">
              Log in
            </a>
          </p>

          <p className={`text-center text-xs mt-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            By signing up, you agree to our Terms & Conditions
          </p>
        </div>
      </div>

      {/* Right side - Testimonials */}
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
            This is hands down the best platform for GCSE revision. The AI-generated content is incredibly accurate and helpful!
          </p>

          {/* Author */}
          <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Emma T.
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            GCSE Student, Grade 9 in Science
          </p>
        </div>
      </div>
    </div>
  );
}
