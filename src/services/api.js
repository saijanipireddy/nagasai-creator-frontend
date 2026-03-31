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
  },
  timeout: 30000
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studentToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors - redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('studentToken');
      localStorage.removeItem('studentInfo');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
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

// Job APIs
export const jobAPI = {
  getAll: (signal) => api.get('/jobs', { signal }).then(res => ({ ...res, data: res.data.jobs })),
  getById: (id, signal) => api.get(`/jobs/${id}`, { signal }),
};

// Enrollment APIs (student-facing)
export const enrollmentAPI = {
  getMyCourses: (signal) => api.get('/batches/student/my-courses', { signal }).then(res => ({
    ...res,
    data: res.data.courses,
    batches: res.data.batches || [],
  })),
  checkAccess: (courseId, signal) => api.get(`/batches/student/check-access/${courseId}`, { signal }),
};

// Practice/Score APIs
export const practiceAPI = {
  submitAttempt: (data) => api.post('/scores/practice-attempt', data),
  getAttempts: (topicId, signal) => api.get(`/scores/practice-attempts/${topicId}`, { signal }),
  getAttemptDetail: (attemptId, signal) => api.get(`/scores/practice-attempt/${attemptId}`, { signal }),
};

// Completion tracking APIs
export const completionAPI = {
  markComplete: (topicId, itemType) => api.post('/scores/complete', { topicId, itemType }),
  getCompletions: (courseId, signal) => api.get(`/scores/completions?courseId=${courseId}`, { signal }).then(res => res.data.completions),
};

// Leaderboard API
export const leaderboardAPI = {
  get: (batchId, signal) => {
    const url = batchId ? `/scores/leaderboard?batchId=${batchId}` : '/scores/leaderboard';
    return api.get(url, { signal });
  },
};

// Dashboard Widget API
export const dashboardWidgetAPI = {
  get: (month, year, signal) => {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (year) params.set('year', year);
    return api.get(`/scores/dashboard-widget?${params.toString()}`, { signal });
  },
};

export default api;
