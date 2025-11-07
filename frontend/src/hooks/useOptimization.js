/**
 * Custom Hook for Portfolio Optimization
 * 포트폴리오 최적화 로직 재사용
 */

import { useState } from 'react';
import axios from 'axios';

export const useOptimization = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 기본 최적화 (티커만)
   */
  const optimizePortfolio = async (tickers, riskFactor, method, period) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const timeout = method === 'quantum' ? 300000 : 60000;
      const autoSave = localStorage.getItem('autoSave') === 'true';

      const response = await axios.post(
        '/api/portfolio/optimize',
        {
          tickers,
          risk_factor: riskFactor,
          method,
          period,
          auto_save: autoSave,
        },
        {
          timeout,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data.success) {
        const resultData = response.data.result;
        setResult(resultData);
        
        // Save to localStorage for Analytics page
        localStorage.setItem('lastOptimizationResult', JSON.stringify({
          result: resultData,
          method,
          timestamp: new Date().toISOString(),
        }));
        
        return { success: true, data: resultData };
      } else {
        const errorMsg = response.data.error || '최적화에 실패했습니다.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Optimization error:', err);
      
      let errorMsg = '최적화 요청에 실패했습니다.';
      
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = `요청 실패: ${err.message}`;
      }
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 가중치 기반 최적화
   */
  const optimizeWithWeights = async (tickers, initialWeights, riskFactor, method, period) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const timeout = method === 'quantum' ? 300000 : 60000;
      const autoSave = localStorage.getItem('autoSave') === 'true';
      
      // Save input data for comparison
      const inputData = {
        tickers,
        initialWeights,
        riskFactor,
        method,
        period
      };

      const response = await axios.post(
        '/api/portfolio/optimize/with-weights',
        {
          tickers,
          initial_weights: initialWeights,
          risk_factor: riskFactor,
          method,
          period,
          auto_save: autoSave,
        },
        {
          timeout,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data.success) {
        const resultData = response.data.result;
        setResult(resultData);
        
        // Save to localStorage for Analytics page with input data
        localStorage.setItem('lastOptimizationResult', JSON.stringify({
          result: resultData,
          input: inputData,
          method,
          timestamp: new Date().toISOString(),
        }));
        
        return { success: true, data: resultData };
      } else {
        const errorMsg = response.data.error || '최적화에 실패했습니다.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Optimization with weights error:', err);
      
      let errorMsg = '가중치 최적화에 실패했습니다.';
      
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = `요청 실패: ${err.message}`;
      }
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * AI Agent Workflow 최적화
   */
  const optimizeWithWorkflow = async (tickers, initialWeights, riskFactor, method, period) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const timeout = method === 'quantum' ? 300000 : 60000;

      const requestData = {
        tickers,
        risk_factor: riskFactor,
        method,
        period,
      };

      if (initialWeights) {
        requestData.initial_weights = initialWeights;
      }

      const response = await axios.post(
        '/api/portfolio/optimize/workflow',
        requestData,
        {
          timeout,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data.success) {
        setResult(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.data.error || '워크플로우 최적화에 실패했습니다.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Workflow optimization error:', err);
      
      let errorMsg = '워크플로우 요청에 실패했습니다.';
      
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = `요청 실패: ${err.message}`;
      }
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 결과 및 에러 초기화
   */
  const reset = () => {
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return {
    result,
    loading,
    error,
    optimizePortfolio,
    optimizeWithWeights,
    optimizeWithWorkflow,
    reset,
  };
};

export default useOptimization;

