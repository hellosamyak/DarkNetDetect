// src/services/apiService.js

// API Configuration
const API_CONFIG = {
  BASE_URL: "http://localhost:8000",
  HEADERS: {
    "Content-Type": "application/json",
  },
  TIMEOUT: 10000, // 10 seconds
};

// Custom fetch with timeout
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// API Service Class
class DrugSlangAPIService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.headers = API_CONFIG.HEADERS;
  }

  // Health Check
  async checkHealth() {
    try {
      const response = await fetchWithTimeout(`${this.baseURL}/health`);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Health check error:", error);
      return {
        status: "unhealthy",
        model_loaded: false,
        error: error.message,
      };
    }
  }

  // Single Text Prediction
  async predictSingleText(text) {
    try {
      if (!text || text.trim() === "") {
        throw new Error("Text cannot be empty");
      }

      const response = await fetchWithTimeout(`${this.baseURL}/predict`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Single prediction error:", error);
      throw error;
    }
  }

  // Batch Text Prediction
  async predictBatchTexts(texts) {
    try {
      if (!texts || texts.length === 0) {
        throw new Error("Texts array cannot be empty");
      }

      const filteredTexts = texts.filter((text) => text && text.trim() !== "");

      if (filteredTexts.length === 0) {
        throw new Error("No valid texts provided");
      }

      const response = await fetchWithTimeout(`${this.baseURL}/predict/batch`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ texts: filteredTexts }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Batch prediction error:", error);
      throw error;
    }
  }

  // Get Model Information
  async getModelInfo() {
    try {
      const response = await fetchWithTimeout(`${this.baseURL}/model/info`);

      if (!response.ok) {
        throw new Error(`Model info request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Model info error:", error);
      throw error;
    }
  }

  // Test API Connection
  async testConnection() {
    try {
      const response = await fetchWithTimeout(`${this.baseURL}/`);

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Connection test error:", error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new DrugSlangAPIService();

// Export individual functions for easy use
export const checkAPIHealth = () => apiService.checkHealth();
export const predictText = (text) => apiService.predictSingleText(text);
export const predictBatchTexts = (texts) => apiService.predictBatchTexts(texts);
export const getModelInfo = () => apiService.getModelInfo();
export const testConnection = () => apiService.testConnection();

// Export service instance
export default apiService;
