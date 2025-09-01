// src/hooks/useDrugSlangAPI.js

import { useState, useEffect, useCallback } from 'react';
import { checkAPIHealth, predictText, predictBatchTexts, getModelInfo } from '../services/apiService';

export const useDrugSlangAPI = () => {
  const [apiHealth, setApiHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [batchResults, setBatchResults] = useState(null);

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkAPIHealth();
        setApiHealth(health);
      } catch (err) {
        setApiHealth({ status: 'unhealthy', model_loaded: false, error: err.message });
      }
    };

    checkHealth();

    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Single text prediction
  const analyzeSingleText = useCallback(async (text) => {
    setLoading(true);
    setError(null);

    try {
      const result = await predictText(text);
      setResults(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Batch text prediction
  const analyzeBatchTexts = useCallback(async (texts) => {
    setBatchLoading(true);
    setError(null);

    try {
      const result = await predictBatchTexts(texts);
      setBatchResults(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBatchLoading(false);
    }
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setResults(null);
    setBatchResults(null);
    setError(null);
  }, []);

  // Refresh API health
  const refreshHealth = useCallback(async () => {
    try {
      const health = await checkAPIHealth();
      setApiHealth(health);
      return health;
    } catch (err) {
      setApiHealth({ status: 'unhealthy', model_loaded: false, error: err.message });
      throw err;
    }
  }, []);

  return {
    // State
    apiHealth,
    loading,
    batchLoading,
    error,
    results,
    batchResults,

    // Actions
    analyzeSingleText,
    analyzeBatchTexts,
    clearResults,
    refreshHealth,

    // Computed values
    isAPIHealthy: apiHealth?.status === 'healthy' && apiHealth?.model_loaded,
    isLoading: loading || batchLoading,
  };
};

export default useDrugSlangAPI;