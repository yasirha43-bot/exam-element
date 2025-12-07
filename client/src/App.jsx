import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './api';
import Navbar from './components/Navbar';
import SubscriptionModal from './components/SubscriptionModal';

// Pages
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Contact from './pages/Contact';
import Flashcards from './pages/Flashcards';
import Quizzes from './pages/Quizzes';
import MockExams from './pages/MockExams';
import Dashboard from './pages/Dashboard';
import './index.css';

// Create theme context
export const ThemeContext = createContext();

function ProtectedRoute({ children, user, loading }) {
  if (loading) {
    return <div className="container py-8"><p>Loading...</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    // Check localStorage first
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      authAPI.getMe()
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else if (storedUser) {
      // If no token but user data exists, try to refresh from stored data
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    
    // Clear cookies
    document.cookie = 'auth_token=; max-age=0; path=/';
    document.cookie = 'user_email=; max-age=0; path=/';
    
    setUser(null);
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <Router>
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
          <Navbar user={user} onLogout={handleLogout} />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home user={user} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcards"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Flashcards
                  user={user}
                  showSubscriptionModal={showSubscriptionModal}
                  setShowSubscriptionModal={setShowSubscriptionModal}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Quizzes
                  user={user}
                  showSubscriptionModal={showSubscriptionModal}
                  setShowSubscriptionModal={setShowSubscriptionModal}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-exams"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <MockExams
                  user={user}
                  showSubscriptionModal={showSubscriptionModal}
                  setShowSubscriptionModal={setShowSubscriptionModal}
                />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>

        {/* Global Subscription Modal */}
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          user={user}
        />
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}
