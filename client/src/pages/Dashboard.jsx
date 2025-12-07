import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../App';
import { flashcardAPI, quizAPI, mockExamAPI } from '../api';

export default function Dashboard({ user }) {
  const { darkMode } = useContext(ThemeContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real data from backend
        const flashcardsRes = await flashcardAPI.getFlashcards();
        const flashcards = flashcardsRes.data;
        
        // Extract unique topics from flashcards
        const topics = [...new Set(flashcards.map(card => card.topic))];

        setStats({
          flashcardsCreated: flashcards.length,
          quizzesTaken: 0,
          averageQuizScore: 0,
          mockExamsTaken: 0,
          averageMockScore: 0,
          studyStreak: 0,
          topicsStudied: topics
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default stats if fetch fails
        setStats({
          flashcardsCreated: 0,
          quizzesTaken: 0,
          averageQuizScore: 0,
          mockExamsTaken: 0,
          averageMockScore: 0,
          studyStreak: 0,
          topicsStudied: []
        });
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSubjectChange = async (subject) => {
    setSelectedSubject(subject);
    try {
      const analyticsResponse = await dashboardAPI.getAnalytics(subject);
      setAnalytics(analyticsResponse.data);

      const historyResponse = await dashboardAPI.getHistory(subject);
      setHistory(historyResponse.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode 
          ? 'bg-gray-900' 
          : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="mb-4">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${
              darkMode ? 'border-pink-500' : 'border-white'
            }`}></div>
          </div>
          <p className={`text-lg font-semibold ${
            darkMode 
              ? 'text-gray-300' 
              : 'text-white drop-shadow-md'
          }`}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 py-12 ${
      darkMode 
        ? 'bg-gray-900' 
        : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Welcome Section */}
        <div className={`mb-12 p-8 rounded-2xl transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-700' 
            : 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg'
        } text-white`}>
          <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">Welcome back, {user?.email?.split('@')[0]}! 👋</h1>
          <p className="text-lg opacity-90 drop-shadow-md">Keep up the great work with your revision!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon="📚"
            title="Flashcards"
            value={stats.flashcardsCreated}
            subtitle="created"
            darkMode={darkMode}
            gradient="from-orange-500 to-yellow-500"
          />

          <StatCard
            icon="📝"
            title="Quizzes"
            value={stats.quizzesTaken}
            subtitle="completed"
            darkMode={darkMode}
            gradient="from-pink-500 to-red-500"
          />

          <StatCard
            icon="📊"
            title="Quiz Score"
            value={`${stats.averageQuizScore}%`}
            subtitle="average"
            darkMode={darkMode}
            gradient="from-orange-400 to-pink-500"
          />

          <StatCard
            icon="🔥"
            title="Study Streak"
            value={stats.studyStreak}
            subtitle="days"
            darkMode={darkMode}
            gradient="from-red-500 to-orange-500"
          />
        </div>

        {/* Mock Exams Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className={`lg:col-span-2 p-8 rounded-2xl transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mock Exams Performance</h2>
            {stats.mockExamsTaken > 0 ? (
              <>
                <div className="space-y-4">
                  <PerformanceBar
                    label={`Mock Exam Average`}
                    score={stats.averageMockScore}
                    darkMode={darkMode}
                  />
                </div>
                <p className={`mt-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Taken: {stats.mockExamsTaken} exams | Average: {stats.averageMockScore}%
                </p>
              </>
            ) : (
              <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No mock exams taken yet. Start with the <a href="/mock-exams" className="text-purple-600 hover:underline">mock exams section</a> to get started! 🎯
              </p>
            )}
          </div>

          {/* Topics Studied */}
          <div className={`p-8 rounded-2xl transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Topics Studied</h2>
            {stats.topicsStudied.length > 0 ? (
              <div className="space-y-3">
                {stats.topicsStudied.map((topic, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg transition-colors duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ✓ {topic}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No topics studied yet. Create flashcards to get started! 📚
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionButton
            title="📚 Create Flashcards"
            description="Generate AI-powered flashcards for any topic"
            href="/flashcards"
            darkMode={darkMode}
            color="from-orange-500 to-yellow-500"
          />
          <QuickActionButton
            title="📝 Take a Quiz"
            description="Test your knowledge with interactive quizzes"
            href="/quizzes"
            darkMode={darkMode}
            color="from-pink-500 to-red-500"
          />
          <QuickActionButton
            title="🎯 Mock Exam"
            description="Full exam conditions to prepare properly"
            href="/mock-exams"
            darkMode={darkMode}
            color="from-red-500 to-orange-500"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, darkMode, gradient }) {
  return (
    <div className={`p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
      darkMode 
        ? 'bg-gray-800 hover:bg-gray-700 shadow-lg' 
        : 'bg-white hover:shadow-xl border border-gray-200'
    } cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-1`}>{title}</p>
          <p className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{value}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-1`}>{subtitle}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}

function PerformanceBar({ label, score, darkMode }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</p>
        <p className={`font-bold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{score}%</p>
      </div>
      <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function QuickActionButton({ title, description, href, darkMode, color }) {
  return (
    <a
      href={href}
      className={`p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}
    >
      <div className={`mb-4 p-4 rounded-xl inline-block bg-gradient-to-r ${color}`}>
        <span className="text-2xl">→</span>
      </div>
      <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
    </a>
  );
}
