import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Course APIs
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  getTopics: (id) => api.get(`/courses/${id}/topics`)
};

// Topic APIs
export const topicAPI = {
  getById: (id) => api.get(`/topics/${id}`)
};

export default api;
