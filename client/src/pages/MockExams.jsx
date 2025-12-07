import React, { useState, useEffect, useContext } from 'react';
import { mockExamAPI } from '../api';
import SubscriptionModal from '../components/SubscriptionModal';
import { ThemeContext } from '../App';

const SUBJECTS = ['Biology', 'Chemistry', 'Physics'];
const EXAM_BOARDS = ['AQA', 'OCR', 'Edexcel'];
const EXAM_LEVELS = ['GCSE', 'A-Level'];
const FREE_MOCKS_PER_DAY = 3;

export default function MockExams({ user, showSubscriptionModal, setShowSubscriptionModal }) {
  const { darkMode } = useContext(ThemeContext);
  const [subject, setSubject] = useState('');
  const [examLevel, setExamLevel] = useState('');
  const [examBoard, setExamBoard] = useState('');
  const [loading, setLoading] = useState(false);
  const [mockExam, setMockExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [mocksTaken, setMocksTaken] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();
    const mockCount = parseInt(localStorage.getItem('mocksTaken') || '0');
    if (localStorage.getItem('lastMockDate') === today) {
      setMocksTaken(mockCount);
    } else {
      localStorage.setItem('lastMockDate', today);
      localStorage.setItem('mocksTaken', '0');
      setMocksTaken(0);
    }
  }, []);

  const canTakeMock = user?.is_subscribed || mocksTaken < FREE_MOCKS_PER_DAY;

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!canTakeMock) {
      alert('You\'ve reached your daily free mock limit. Upgrade to take more!');
      return;
    }

    setLoading(true);
    try {
      const response = await mockExamAPI.generate(subject, examLevel, examBoard);
      const examData = await mockExamAPI.getMockExam(response.data.mockExamId);
      setMockExam({ ...examData.data, mockExamId: response.data.mockExamId });
      setAnswers(new Array(examData.data.questions.length).fill(null));
      
      // Increment mock counter
      const newCount = mocksTaken + 1;
      setMocksTaken(newCount);
      localStorage.setItem('mocksTaken', newCount.toString());
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to generate mock exam');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (text) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = text;
    setAnswers(newAnswers);
  };

  const handleSubmitExam = async () => {
    const examAnswers = mockExam.questions.map((q, idx) => ({
      questionId: q.id,
      userAnswer: answers[idx],
      marksAwarded: 0
    }));

    try {
      const response = await mockExamAPI.submitMockExam(mockExam.mockExamId, examAnswers);
      const resultsData = await mockExamAPI.getResults(mockExam.mockExamId);
      setResults({
        ...response.data,
        details: resultsData.data
      });
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit mock exam');
    }
  };

  const handleNext = () => {
    if (currentQuestion < mockExam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Daily limit reached screen
  if (!canTakeMock && !mockExam && !results) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center p-4`}>
        <div className={`max-w-md text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-8 shadow-lg`}>
          <div className="text-5xl mb-4">📚</div>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Daily Limit Reached
          </h2>
          <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You've used all {FREE_MOCKS_PER_DAY} free mock exams for today.
          </p>
          <p className={`text-base mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Upgrade to premium for unlimited mock exams!
          </p>
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-lg hover:scale-105 transition-transform duration-200 shadow-md"
          >
            Upgrade Now →
          </button>
        </div>
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          user={user}
        />
      </div>
    );
  }

  if (!mockExam) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} py-8`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📝 Mock Exam Generator
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Practice with full past paper style exams
            </p>
          </div>

          {/* Free Tier Indicator */}
          {!user?.is_subscribed && (
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md">
              <p className="text-center font-semibold">
                📊 Free Mock Exams Remaining: {FREE_MOCKS_PER_DAY - mocksTaken} / {FREE_MOCKS_PER_DAY}
              </p>
            </div>
          )}

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-8 shadow-lg`}>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-base font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    📚 Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 font-semibold text-base transition-all duration-200 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                    }`}
                    required
                  >
                    <option value="">Select a subject</option>
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-base font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    🎯 Exam Level
                  </label>
                  <select
                    value={examLevel}
                    onChange={(e) => setExamLevel(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 font-semibold text-base transition-all duration-200 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                    }`}
                    required
                  >
                    <option value="">Select level</option>
                    {EXAM_LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-base font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    🏛️ Exam Board
                  </label>
                  <select
                    value={examBoard}
                    onChange={(e) => setExamBoard(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 font-semibold text-base transition-all duration-200 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                    }`}
                    required
                  >
                    <option value="">Select exam board</option>
                    {EXAM_BOARDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !canTakeMock}
                className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 ${
                  loading || !canTakeMock
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 shadow-lg'
                }`}
              >
                {loading ? '⏳ Generating Mock Exam...' : '🚀 Generate Mock Exam'}
              </button>
            </form>
          </div>
        </div>
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          user={user}
        />
      </div>
    );
  }

  if (results) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} py-8`}>
        <div className="max-w-4xl mx-auto px-4">
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📝 Mock Exam Results
          </h1>
          <p className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Here's how you did
          </p>

          {/* Score Card */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-8 shadow-lg mb-8`}>
            <div className="text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-4">
                {results.percentage}%
              </div>
              <p className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Score: {results.userScore} / {results.totalMarks}
              </p>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {results.percentage >= 70 
                  ? '🎉 Excellent! You nailed it!' 
                  : results.percentage >= 50 
                  ? '📚 Good effort! Keep practicing!' 
                  : '💪 Keep going! You\'ll improve!'}
              </p>
            </div>
          </div>

          {/* Question Review */}
          <div className="space-y-4 mb-8">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Question Review
            </h2>
            {results.details.map((question, idx) => (
              <div 
                key={idx} 
                className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-6 shadow-md border-l-4 ${
                  (question.marks_awarded || 0) >= question.marks * 0.7
                    ? 'border-green-500'
                    : 'border-orange-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Question {idx + 1}
                  </h3>
                  <span className={`text-lg font-semibold ${
                    (question.marks_awarded || 0) >= question.marks * 0.7
                      ? 'text-green-500'
                      : 'text-orange-500'
                  }`}>
                    {question.marks_awarded || 0} / {question.marks} marks
                  </span>
                </div>
                
                <p className={`text-base mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {question.question_text}
                </p>
                
                <div className="space-y-3">
                  {question.user_answer && (
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-100'}`}>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                        Your Answer:
                      </p>
                      <p className={`text-base ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                        {question.user_answer}
                      </p>
                    </div>
                  )}
                  {question.sample_answer && (
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-100'}`}>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-green-300' : 'text-green-900'}`}>
                        Model Answer:
                      </p>
                      <p className={`text-base ${darkMode ? 'text-green-200' : 'text-green-800'}`}>
                        {question.sample_answer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setMockExam(null);
              setCurrentQuestion(0);
              setAnswers([]);
              setResults(null);
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 hover:scale-105 shadow-lg"
          >
            🚀 Create Another Mock Exam
          </button>
        </div>
      </div>
    );
  }

  const question = mockExam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / mockExam.questions.length) * 100;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} py-8`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📝 {mockExam.title}
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Question {currentQuestion + 1} of {mockExam.questions.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className={`w-full h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={`mt-2 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Question Card */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-8 shadow-lg mb-8`}>
          <div className="flex justify-between items-start mb-6">
            <h2 className={`text-2xl font-bold flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {question.question_text}
            </h2>
            <span className="ml-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-4 py-2 rounded-lg whitespace-nowrap">
              {question.marks} marks
            </span>
          </div>
          
          <div className="mt-8">
            <label className={`block text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ✍️ Your Answer:
            </label>
            <textarea
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Write your answer here... Take your time and explain your reasoning."
              className={`w-full px-4 py-4 rounded-lg border-2 font-base text-base resize-none transition-all duration-200 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
              }`}
              rows="8"
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
              currentQuestion === 0
                ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500'
                : darkMode
                ? 'bg-gray-700 text-white hover:scale-105 shadow-md'
                : 'bg-gray-200 text-gray-900 hover:scale-105 shadow-md'
            }`}
          >
            ← Previous
          </button>

          {currentQuestion === mockExam.questions.length - 1 ? (
            <button
              onClick={handleSubmitExam}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 hover:scale-105 shadow-lg"
            >
              ✅ Submit Exam
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
