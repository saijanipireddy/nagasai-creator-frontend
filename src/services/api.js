import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

// Resolve file URLs from Supabase Storage
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  return filePath;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br'
  },
  timeout: 30000
});

// Attach student token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studentToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Helper to extract data from paginated responses
const extractData = (response) => {
  const data = response.data;
  if (data && data.courses) return { ...response, data: data.courses, pagination: data.pagination };
  if (data && data.topics) return { ...response, data: data.topics, pagination: data.pagination };
  return response;
};

// Course APIs
export const courseAPI = {
  getAll: (signal) => api.get('/courses', { signal }).then(extractData),
  getById: (id, signal) => api.get(`/courses/${id}`, { signal }),
  getTopics: (courseId, signal) => api.get(`/courses/${courseId}/topics`, { signal }).then(extractData),
  getTopicsSummary: (courseId, signal) => api.get(`/courses/${courseId}/topics-summary`, { signal }).then(extractData)
};

// Topic APIs
export const topicAPI = {
  getById: (id, signal) => api.get(`/topics/${id}`, { signal })
};

// Student Auth APIs
export const studentAuthAPI = {
  register: (data) => api.post('/student-auth/register', data),
  login: (data) => api.post('/student-auth/login', data),
  getProfile: () => api.get('/student-auth/profile')
};

// Score APIs
export const scoreAPI = {
  submitPractice: (data) => api.post('/scores/practice', data),
  submitPracticeAttempt: (data) => api.post('/scores/practice-attempt', data),
  getPracticeAttempts: (topicId, signal) => api.get(`/scores/practice-attempts/${topicId}`, { signal }),
  getPracticeAttemptDetail: (attemptId, signal) => api.get(`/scores/practice-attempt/${attemptId}`, { signal }),
  submitCoding: (data) => api.post('/scores/coding', data),
  submitCodingChallenge: (data) => api.post('/scores/coding-submit', data),
  getCodingSubmission: (topicId, signal) => api.get(`/scores/coding-submission/${topicId}`, { signal }),
  markComplete: (data) => api.post('/scores/complete', data),
  getCompletions: (courseId, signal) => api.get('/scores/completions', { params: { courseId }, signal }),
  getMyProgress: (signal) => api.get('/scores/my-progress', { signal }),
  getLeaderboard: (signal) => api.get('/scores/leaderboard', { signal }),
};

export default api;
