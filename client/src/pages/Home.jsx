import React, { useContext } from 'react';
import { ThemeContext } from '../App';
import { useNavigate } from 'react-router-dom';

export default function Home({ user }) {
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <section className={`py-20 px-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div>
              <h1 className={`text-5xl lg:text-6xl font-bold mb-4 leading-tight ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                A Better Way to Study
              </h1>
              
              <p className={`text-xl mb-8 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                The all-in-one solution for GCSE Science
              </p>

              <button
                onClick={handleSignUp}
                className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
              >
                🚀 Sign Up for Free Today
              </button>
            </div>

            {/* Right side - Plant Cell SVG */}
            <div className={`relative flex items-center justify-center`}>
              <svg width="300" height="300" viewBox="0 0 300 300" className={`rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-orange-50'} border-2 ${darkMode ? 'border-gray-600' : 'border-orange-200'}`}>
                {/* Cell membrane */}
                <ellipse cx="150" cy="150" rx="120" ry="130" fill="none" stroke="#f97316" strokeWidth="3"/>
                
                {/* Cell wall */}
                <ellipse cx="150" cy="150" rx="125" ry="135" fill="none" stroke="#ea580c" strokeWidth="2" strokeDasharray="5,5"/>
                
                {/* Nucleus */}
                <circle cx="150" cy="110" r="35" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2"/>
                <ellipse cx="150" cy="110" rx="20" ry="25" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
                
                {/* Nucleolus */}
                <circle cx="150" cy="110" r="8" fill="#f97316"/>
                
                {/* Chloroplasts */}
                <ellipse cx="100" cy="150" rx="25" ry="30" fill="#10b981" stroke="#059669" strokeWidth="2" opacity="0.8"/>
                <ellipse cx="200" cy="150" rx="25" ry="30" fill="#10b981" stroke="#059669" strokeWidth="2" opacity="0.8"/>
                <ellipse cx="150" cy="220" rx="25" ry="30" fill="#10b981" stroke="#059669" strokeWidth="2" opacity="0.8"/>
                
                {/* Mitochondria */}
                <ellipse cx="120" cy="120" rx="15" ry="20" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" opacity="0.7"/>
                <ellipse cx="180" cy="140" rx="15" ry="20" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" opacity="0.7"/>
                
                {/* Vacuole */}
                <circle cx="150" cy="160" r="50" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" opacity="0.6"/>
                
                {/* Ribosomes */}
                <circle cx="110" cy="90" r="3" fill="#ea580c"/>
                <circle cx="190" cy="95" r="3" fill="#ea580c"/>
                <circle cx="130" cy="200" r="3" fill="#ea580c"/>
                <circle cx="170" cy="205" r="3" fill="#ea580c"/>
                
                {/* Labels */}
                <text x="40" y="80" fontSize="11" fill="#92400e" fontWeight="bold">Nucleus</text>
                <text x="210" y="160" fontSize="11" fill="#059669" fontWeight="bold">Chloroplast</text>
                <text x="75" y="240" fontSize="11" fill="#3b82f6" fontWeight="bold">Vacuole</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Arrow */}
      <section className={`py-16 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ↓ Notes • Flashcards • Quizzes & More ↓
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Notes */}
            <div className={`p-8 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
                : 'bg-white border border-gray-200 hover:shadow-lg'
            }`}>
              <div className="text-5xl mb-4">📝</div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Notes
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Organized study notes for every GCSE topic
              </p>
            </div>

            {/* Flashcards */}
            <div className={`p-8 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
                : 'bg-white border border-gray-200 hover:shadow-lg'
            }`}>
              <div className="text-5xl mb-4">🎯</div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Flashcards
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                AI-powered flashcards to ace your exams
              </p>
            </div>

            {/* Quizzes */}
            <div className={`p-8 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
                : 'bg-white border border-gray-200 hover:shadow-lg'
            }`}>
              <div className="text-5xl mb-4">📊</div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Quizzes
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Interactive quizzes to test your knowledge
              </p>
            </div>

            {/* Mock Exams */}
            <div className={`p-8 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
                : 'bg-white border border-gray-200 hover:shadow-lg'
            }`}>
              <div className="text-5xl mb-4">🎓</div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Mock Exams
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Full exam conditions to prepare properly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 px-4 ${darkMode ? 'bg-gray-800' : 'bg-orange-50'}`}>
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to transform your revision?
          </h2>
          <p className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join thousands of students using Exam Element to ace their GCSE exams.
          </p>
          <button
            onClick={handleSignUp}
            className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
          >
            🚀 Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
}
