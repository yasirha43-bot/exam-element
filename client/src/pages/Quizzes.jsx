import React, { useState, useContext, useEffect } from 'react';
import { quizAPI } from '../api';
import { ThemeContext } from '../App';
import SubscriptionModal from '../components/SubscriptionModal';

const SUBJECTS = ['Biology', 'Chemistry', 'Physics'];
const EXAM_BOARDS = ['AQA', 'OCR', 'Edexcel'];
const FREE_QUIZZES_PER_DAY = 5;

export default function Quizzes({ user, showSubscriptionModal, setShowSubscriptionModal }) {
  const { darkMode } = useContext(ThemeContext);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [examBoard, setExamBoard] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [quizzesToday, setQuizzesToday] = useState(0);

  useEffect(() => {
    // Check how many quizzes user has taken today
    const today = new Date().toDateString();
    const lastQuizDate = localStorage.getItem('lastQuizDate');
    const quizCount = parseInt(localStorage.getItem('quizzesToday') || '0');

    if (lastQuizDate === today) {
      setQuizzesToday(quizCount);
    } else {
      localStorage.setItem('lastQuizDate', today);
      localStorage.setItem('quizzesToday', '0');
      setQuizzesToday(0);
    }
  }, []);

  const canTakeQuiz = user?.is_subscribed || quizzesToday < FREE_QUIZZES_PER_DAY;
  const remainingQuizzes = FREE_QUIZZES_PER_DAY - quizzesToday;

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!user?.is_subscribed && quizzesToday >= FREE_QUIZZES_PER_DAY) {
      setShowSubscriptionModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await quizAPI.generate(subject, topic, examBoard, count);
      const quizData = await quizAPI.getQuiz(response.data.quizId);
      setQuiz({ ...quizData.data, quizId: response.data.quizId });
      setAnswers(new Array(quizData.data.questions.length).fill(null));

      // Increment quiz counter
      if (!user?.is_subscribed) {
        const today = new Date().toDateString();
        localStorage.setItem('lastQuizDate', today);
        localStorage.setItem('quizzesToday', String(quizzesToday + 1));
        setQuizzesToday(quizzesToday + 1);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (option) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = option;
    setAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    const quizAnswers = quiz.questions.map((q, idx) => ({
      questionId: q.id,
      userAnswer: answers[idx]
    }));

    try {
      const response = await quizAPI.submitQuiz(quiz.quizId, quizAnswers);
      const resultsData = await quizAPI.getResults(quiz.quizId);
      setResults({
        ...response.data,
        details: resultsData.data
      });
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit quiz');
    }
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Free tier message
  if (!canTakeQuiz && !quiz) {
    return (
      <div className={`min-h-screen py-12 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto max-w-4xl">
          <div className={`rounded-3xl p-12 text-center ${
            darkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200 shadow-lg'
          }`}>
            <div className="text-6xl mb-4">🎯</div>
            <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Daily Limit Reached
            </h1>
            <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              You've used all {FREE_QUIZZES_PER_DAY} free quizzes for today. Come back tomorrow or upgrade to unlimited access!
            </p>
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
            >
              🚀 Upgrade Now
            </button>
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

  // Quiz generator form
  if (!quiz) {
    return (
      <div className={`min-h-screen py-12 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🎯 Quiz Generator
            </h1>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Test your knowledge with custom quizzes
            </p>
          </div>

          {/* Free tier indicator */}
          {!user?.is_subscribed && (
            <div className={`mb-8 p-6 rounded-2xl border-2 ${
              darkMode
                ? 'bg-orange-900/20 border-orange-700 text-orange-200'
                : 'bg-orange-50 border-orange-300 text-orange-900'
            }`}>
              <p className="font-semibold text-lg">
                📊 Free Quizzes Remaining: <span className="text-2xl">{remainingQuizzes}</span> / {FREE_QUIZZES_PER_DAY}
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                Upgrade to Exam Element Pro for unlimited quizzes!
              </p>
            </div>
          )}

          {/* Form */}
          <div className={`rounded-3xl p-8 shadow-lg ${
            darkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Subject and Exam Board */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    📚 Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-orange-500'
                    } focus:outline-none transition-all`}
                    required
                  >
                    <option value="">Select a subject</option>
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    🏫 Exam Board
                  </label>
                  <select
                    value={examBoard}
                    onChange={(e) => setExamBoard(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-orange-500'
                    } focus:outline-none transition-all`}
                    required
                  >
                    <option value="">Select exam board</option>
                    {EXAM_BOARDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  🔍 Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, Protein Synthesis, Atomic Structure"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-orange-500'
                  } focus:outline-none transition-all`}
                  required
                />
              </div>

              {/* Number of Questions */}
              <div>
                <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  ❓ Number of Questions
                </label>
                <input
                  type="number"
                  min="5"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-orange-500'
                  } focus:outline-none transition-all`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-200 transform hover:scale-105 ${
                  loading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg'
                }`}
              >
                {loading ? '⏳ Generating Quiz...' : '🚀 Generate Quiz'}
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

  // Quiz results
  if (results) {
    const percentage = Math.round((results.earnedMarks / results.totalMarks) * 100);
    let message = '💪 Keep studying!';
    let bgColor = darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300';

    if (percentage >= 70) {
      message = '🎉 Excellent work!';
      bgColor = darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300';
    } else if (percentage >= 50) {
      message = '📚 Good effort! Keep practicing!';
      bgColor = darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-300';
    }

    return (
      <div className={`min-h-screen py-12 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto max-w-4xl">
          <h1 className={`text-4xl font-bold text-center mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Quiz Results
          </h1>

          {/* Score Card */}
          <div className={`rounded-3xl p-12 text-center mb-8 border-2 ${bgColor} ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="text-7xl font-bold text-orange-500 mb-4">{percentage}%</div>
            <p className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              {results.earnedMarks} / {results.totalMarks} Correct
            </p>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {message}
            </p>
          </div>

          {/* Questions Review */}
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Review Your Answers
          </h2>
          <div className="space-y-4">
            {results.details.map((question, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 border-2 ${
                  question.is_correct
                    ? darkMode
                      ? 'bg-green-900/20 border-green-700'
                      : 'bg-green-50 border-green-300'
                    : darkMode
                    ? 'bg-red-900/20 border-red-700'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <h3 className={`text-lg font-bold mb-3 ${
                  question.is_correct
                    ? darkMode ? 'text-green-300' : 'text-green-700'
                    : darkMode ? 'text-red-300' : 'text-red-700'
                }`}>
                  {question.is_correct ? '✓' : '✗'} Question {idx + 1}
                </h3>
                <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {question.question}
                </p>
                <div className="space-y-2 text-sm">
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Your answer: <span className={`font-bold ${
                      question.is_correct
                        ? 'text-green-400'
                        : 'text-red-500'
                    }`}>{question.user_answer}</span>
                  </p>
                  {!question.is_correct && (
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Correct answer: <span className="font-bold text-green-500">{question.correct_answer}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              setQuiz(null);
              setCurrentQuestion(0);
              setAnswers([]);
              setResults(null);
            }}
            className="w-full mt-8 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
          >
            🔄 Create Another Quiz
          </button>
        </div>
      </div>
    );
  }

  // Active quiz
  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className={`min-h-screen py-12 px-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto max-w-4xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <p className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
            <p className={`text-sm font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              {Math.round(progress)}% Complete
            </p>
          </div>
          <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className={`rounded-3xl p-8 mb-8 shadow-lg ${
          darkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold mb-8 leading-relaxed ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {['option_a', 'option_b', 'option_c', 'option_d'].map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const value = question[opt];
              const isSelected = answers[currentQuestion] === letter;

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectAnswer(letter)}
                  className={`w-full p-5 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                    isSelected
                      ? darkMode
                        ? 'bg-orange-900/30 border-orange-500 shadow-lg'
                        : 'bg-orange-50 border-orange-500 shadow-lg'
                      : darkMode
                      ? 'bg-gray-700 border-gray-600 hover:border-orange-500 hover:bg-gray-650'
                      : 'bg-gray-50 border-gray-200 hover:border-orange-500 hover:bg-white'
                  }`}
                >
                  <span className={`font-bold mr-4 text-lg ${
                    isSelected
                      ? 'text-orange-500'
                      : darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {letter}
                  </span>
                  <span className={darkMode ? 'text-gray-100' : 'text-gray-900'}>
                    {value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-200 ${
              currentQuestion === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'transform hover:scale-105'
            } ${
              darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            ← Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              ✓ Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
