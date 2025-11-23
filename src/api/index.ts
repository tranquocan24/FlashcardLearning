// src/api/index.js
import axios from 'axios';
import { API_TIMEOUT, API_URL, STORAGE_KEYS } from '../constants/config';
import { storage } from '../utils/storage';

const API = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token if available
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem<string>(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token added to request:', config.url);
      } else {
        console.log('No token found for request:', config.url);
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // No response received
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;
