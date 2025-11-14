import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Add timeout and better error handling
const axiosInstance = axios.create({
  baseURL: API,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject(new Error('Cannot connect to server. Please check if backend is running.'));
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Detect API key provider and get available models
  detectApiKey: async (apiKey) => {
    try {
      const response = await axiosInstance.post('/keys/detect', {
        api_key: apiKey
      });
      return response.data;
    } catch (error) {
      console.error('Error detecting API key:', error);
      throw error;
    }
  },

  // Validate API key
  validateApiKey: async (apiKey, provider) => {
    try {
      const response = await axiosInstance.post('/keys/validate', {
        api_key: apiKey,
        provider: provider
      });
      return response.data;
    } catch (error) {
      console.error('Error validating API key:', error);
      throw error;
    }
  },

  // Send chat completion request
  chatCompletion: async (messages, apiKey, provider, model, sessionId = 'default') => {
    try {
      const response = await axiosInstance.post('/chat/completions', {
        messages: messages,
        api_key: apiKey,
        provider: provider,
        model: model,
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error in chat completion:', error);
      if (error.response?.data) {
        // Return the error response from backend
        return error.response.data;
      }
      throw error;
    }
  }
};
