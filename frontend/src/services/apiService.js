import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const apiService = {
  // Detect API key provider and get available models
  detectApiKey: async (apiKey) => {
    try {
      const response = await axios.post(`${API}/keys/detect`, {
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
      const response = await axios.post(`${API}/keys/validate`, {
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
      const response = await axios.post(`${API}/chat/completions`, {
        messages: messages,
        api_key: apiKey,
        provider: provider,
        model: model,
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error in chat completion:', error);
      throw error;
    }
  }
};
