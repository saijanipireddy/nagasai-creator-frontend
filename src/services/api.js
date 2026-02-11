import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

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
    console.error('API Error:', error.response?.data || error.message);
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
  getAll: () => api.get('/courses').then(extractData),
  getById: (id) => api.get(`/courses/${id}`),
  getTopics: (courseId) => api.get(`/courses/${courseId}/topics`).then(extractData)
};

// Topic APIs
export const topicAPI = {
  getById: (id) => api.get(`/topics/${id}`)
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
  submitCoding: (data) => api.post('/scores/coding', data),
  submitCodingChallenge: (data) => api.post('/scores/coding-submit', data),
  markComplete: (data) => api.post('/scores/complete', data),
  getCompletions: (courseId) => api.get('/scores/completions', { params: { courseId } }),
  getMyProgress: () => api.get('/scores/my-progress'),
  getLeaderboard: () => api.get('/scores/leaderboard'),
};

export default api;
