import axios from 'axios';

if (!import.meta.env.VITE_BACKEND_URL && import.meta.env.PROD) {
  throw new Error('VITE_BACKEND_URL environment variable is required in production');
}
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

// Resolve file URLs from Supabase Storage
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  return filePath;
};

/* ------------------------------------------------------------------ */
/*  TOKEN STORE                                                       */
/*  Access token: in-memory (short-lived, 15min)                      */
/*  Refresh token: localStorage (survives page refresh, 7-day TTL)    */
/* ------------------------------------------------------------------ */
let accessToken = null;

export const setTokens = (access, refresh) => {
  accessToken = access || null;
  if (refresh) {
    localStorage.setItem('refresh_token', refresh);
  }
};

export const clearTokens = () => {
  accessToken = null;
  localStorage.removeItem('refresh_token');
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => localStorage.getItem('refresh_token');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

/* ------------------------------------------------------------------ */
/*  REQUEST INTERCEPTOR: attach Authorization header + CSRF           */
/* ------------------------------------------------------------------ */
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (!['get', 'head', 'options'].includes(config.method)) {
    const csrfMatch = document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrf_token='));
    if (csrfMatch) {
      config.headers['X-CSRF-Token'] = csrfMatch.split('=')[1];
    }
  }

  return config;
});

/* ------------------------------------------------------------------ */
/*  RESPONSE INTERCEPTOR: auto-refresh on 401                         */
/* ------------------------------------------------------------------ */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/student-auth/refresh') &&
      !originalRequest.url?.includes('/student-auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshConfig = {};
        const storedRefresh = getRefreshToken();
        if (storedRefresh) {
          refreshConfig.headers = { Authorization: `Bearer ${storedRefresh}` };
        }
        const { data } = await api.post('/student-auth/refresh', {}, refreshConfig);

        if (data.accessToken) {
          setTokens(data.accessToken, data.refreshToken);
        }

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        clearTokens();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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

// Auth APIs
export const studentAuthAPI = {
  login: (credentials) => api.post('/student-auth/login', credentials),
  register: (data) => api.post('/student-auth/register', data),
  getProfile: () => api.get('/student-auth/profile'),
  refresh: (refreshToken) => {
    const config = {};
    const token = refreshToken || getRefreshToken();
    if (token) config.headers = { Authorization: `Bearer ${token}` };
    return api.post('/student-auth/refresh', {}, config);
  },
  logout: () => api.post('/student-auth/logout'),
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

// Announcement APIs
export const announcementAPI = {
  getStudentAnnouncements: () => api.get('/announcements/student'),
  markRead: (id) => api.post(`/announcements/${id}/read`),
};

export default api;
