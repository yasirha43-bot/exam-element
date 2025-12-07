import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable cookies
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (email, password, firstName, lastName) =>
    api.post('/auth/signup', { email, password, firstName, lastName }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const subscriptionAPI = {
  createCheckoutSession: () =>
    api.post('/subscription/create-checkout-session'),
  getStatus: () => api.get('/subscription/status'),
};

export const flashcardAPI = {
  generate: (subject, topic, examBoard, count) =>
    api.post('/flashcards/generate', { subject, topic, examBoard, count }),
  getFlashcards: (subject, topic) =>
    api.get('/flashcards', { params: { subject, topic } }),
  reviewFlashcard: (flashcardId, isCorrect) =>
    api.post(`/flashcards/${flashcardId}/review`, { isCorrect }),
  deleteFlashcard: (flashcardId) =>
    api.delete(`/flashcards/${flashcardId}`),
};

export const quizAPI = {
  generate: (subject, topic, examBoard, count) =>
    api.post('/quizzes/generate', { subject, topic, examBoard, count }),
  getQuiz: (quizId) => api.get(`/quizzes/${quizId}`),
  submitQuiz: (quizId, answers) =>
    api.post(`/quizzes/${quizId}/submit`, { answers }),
  getResults: (quizId) => api.get(`/quizzes/${quizId}/results`),
};

export const mockExamAPI = {
  generate: (subject, examLevel, examBoard) =>
    api.post('/mock-exams/generate', { subject, examLevel, examBoard }),
  getMockExam: (mockExamId) => api.get(`/mock-exams/${mockExamId}`),
  submitMockExam: (mockExamId, answers) =>
    api.post(`/mock-exams/${mockExamId}/submit`, { answers }),
  getResults: (mockExamId) => api.get(`/mock-exams/${mockExamId}/results`),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getAnalytics: (subject) => api.get(`/dashboard/analytics/${subject}`),
  getHistory: (subject, days = 30) =>
    api.get(`/dashboard/history/${subject}`, { params: { days } }),
};

export default api;
