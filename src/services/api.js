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

export default api;
