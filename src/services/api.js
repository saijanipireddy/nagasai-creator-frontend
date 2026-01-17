import axios from 'axios';

export const BACKEND_URL = 'https://nagasai-creator-backend-2.onrender.com';
const API_URL = `${BACKEND_URL}/api`;
// const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============================================
// Client-Side Caching System
// ============================================
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

const getCacheKey = (url) => url;

const isExpired = (timestamp) => {
  return Date.now() - timestamp > CACHE_DURATION;
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && !isExpired(cached.timestamp)) {
    return cached.data;
  }
  // Remove expired cache
  if (cached) {
    cache.delete(key);
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Clear specific cache or all cache
export const clearCache = (key = null) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

// Cached API request wrapper
const cachedRequest = async (url, forceRefresh = false) => {
  const cacheKey = getCacheKey(url);

  // Return cached data if available and not forcing refresh
  if (!forceRefresh) {
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return { data: cachedData, fromCache: true };
    }
  }

  // Fetch fresh data
  const response = await api.get(url);
  setCache(cacheKey, response.data);
  return { data: response.data, fromCache: false };
};

// ============================================
// Course APIs with Caching
// ============================================
export const courseAPI = {
  getAll: (forceRefresh = false) => cachedRequest('/courses', forceRefresh),
  getById: (id, forceRefresh = false) => cachedRequest(`/courses/${id}`, forceRefresh),
  getTopics: (id, forceRefresh = false) => cachedRequest(`/courses/${id}/topics`, forceRefresh),
  // Invalidate cache when data changes
  invalidateCache: () => {
    clearCache();
  }
};

// Topic APIs with Caching
export const topicAPI = {
  getById: (id, forceRefresh = false) => cachedRequest(`/topics/${id}`, forceRefresh)
};

// ============================================
// Keep-Alive Ping (prevents Render cold starts)
// ============================================
const PING_INTERVAL = 4 * 60 * 1000; // Ping every 4 minutes
let pingIntervalId = null;

export const startKeepAlive = () => {
  if (pingIntervalId) return; // Already running

  const ping = async () => {
    try {
      await api.get('/courses');
      console.log('Keep-alive ping successful');
    } catch (error) {
      console.log('Keep-alive ping failed:', error.message);
    }
  };

  // Initial ping
  ping();

  // Set up interval
  pingIntervalId = setInterval(ping, PING_INTERVAL);
};

export const stopKeepAlive = () => {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }
};

export default api;
