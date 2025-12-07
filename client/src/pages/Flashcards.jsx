import React, { useState, useContext } from 'react';
import { flashcardAPI } from '../api';
import SubscriptionModal from '../components/SubscriptionModal';
import { ThemeContext } from '../App';

const SUBJECTS = ['Biology', 'Chemistry', 'Physics'];
const EXAM_BOARDS = ['AQA', 'OCR', 'Edexcel'];

export default function Flashcards({ user = {}, showSubscriptionModal, setShowSubscriptionModal }) {
  const { darkMode } = useContext(ThemeContext);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [examBoard, setExamBoard] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGenerate = async (e) => {
    e.preventDefault();

    // Simple client-side guard for free users
    if (!user.is_subscribed && user.daily_flashcard_count >= 1) {
      setShowSubscriptionModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await flashcardAPI.generate(subject, topic, examBoard, count);
      const cards = res?.data?.flashcards || [];
      setFlashcards(cards);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Generate error', err);
      if (err?.response?.data?.needsSubscription) setShowSubscriptionModal(true);
      else alert(err?.response?.data?.error || 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (isCorrect) => {
    const card = flashcards[currentIndex];
    if (!card) return;
    try {
      await flashcardAPI.reviewFlashcard(card.id, isCorrect);
    } catch (err) {
      console.error('Review save failed', err);
    }

    if (currentIndex < flashcards.length - 1) setCurrentIndex((i) => i + 1);
    else {
      alert('All done!');
      setFlashcards([]);
    }
  };

  const currentFlashcard = flashcards[currentIndex] || {};

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
          {/* Left column: Title + Form or empty state when flashcards exist */}
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📇 Flashcard Generator
            </h1>
            <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Create AI-powered study cards for instant learning
            </p>

            {flashcards.length === 0 ? (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 shadow-lg`}>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="input"
                        required
                      >
                        <option value="">Select a subject</option>
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Exam Board</label>
                      <select
                        value={examBoard}
                        onChange={(e) => setExamBoard(e.target.value)}
                        className="input"
                        required
                      >
                        <option value="">Select exam board</option>
                        {EXAM_BOARDS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Topic</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Photosynthesis, Protein Synthesis"
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Cards</label>
                    <input
                      type="number"
                      min="1"
                      max={user.is_subscribed ? 20 : 5}
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value || '1', 10))}
                      className="input"
                    />
                    {!user.is_subscribed && (
                      <p className="text-sm text-slate-400 mt-2">Free users: 1 generation per day, max 5 cards</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-105'}`}
                  >
                    {loading ? '⏳ Generating...' : '🚀 Generate Flashcards'}
                  </button>
                </form>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 shadow-lg`}>
                <p className="text-center text-sm text-slate-400">Generated cards shown on the right. Use the buttons below each card to review.</p>
              </div>
            )}
          </div>

          {/* Right column: Illustration and card viewer */}
          <div>
            <div className="flex items-center justify-center mb-6">
              <svg width="320" height="320" viewBox="0 0 300 300" className={`rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 shadow-lg`}>
                <circle cx="150" cy="150" r="25" fill="#f97316" stroke="#ea580c" strokeWidth="2"/>
                <circle cx="150" cy="150" r="18" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
                <ellipse cx="150" cy="150" rx="80" ry="50" fill="none" stroke="#fb923c" strokeWidth="2" opacity="0.6"/>
                <ellipse cx="150" cy="150" rx="100" ry="70" fill="none" stroke="#fb923c" strokeWidth="2" opacity="0.5" transform="rotate(60 150 150)"/>
                <ellipse cx="150" cy="150" rx="90" ry="60" fill="none" stroke="#fb923c" strokeWidth="2" opacity="0.5" transform="rotate(120 150 150)"/>
                <circle cx="230" cy="150" r="6" fill="#ea580c"/>
                <circle cx="150" cy="100" r="6" fill="#ea580c"/>
                <circle cx="70" cy="150" r="6" fill="#ea580c"/>
                <text x="150" y="280" fontSize="14" fill="#92400e" fontWeight="bold" textAnchor="middle">Atom Structure</text>
              </svg>
            </div>

            {flashcards.length > 0 && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                <div className="mb-4 text-center">
                  <p className="text-slate-400">Card {currentIndex + 1} of {flashcards.length}</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded h-2 mt-2">
                    <div
                      className="bg-accent h-2 rounded transition-all"
                      style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="card min-h-40 flex flex-col justify-center items-center text-center">
                  <h2 className="text-xl md:text-2xl font-semibold mb-4">{currentFlashcard.question}</h2>
                  <p className="text-slate-400 text-sm mb-2">Answer</p>
                  <p className="text-2xl mb-4">{currentFlashcard.answer}</p>
                  {currentFlashcard.explanation && (
                    <div className="text-slate-300 text-sm max-w-prose">
                      <p className="font-semibold mb-1">Explanation</p>
                      <p>{currentFlashcard.explanation}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-6">
                  <button onClick={() => handleReview(false)} className="btn-danger flex-1">✗ Not Correct</button>
                  <button onClick={() => handleReview(true)} className="btn-primary flex-1">✓ Got It</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          user={user}
        />
      </div>
    </div>
  );
}
