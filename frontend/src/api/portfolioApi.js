/**
 * Portfolio Optimization API Client
 * AI Agent Workflow 통합
 */

import axios from 'axios';

const API_BASE_URL = '/api/portfolio';

/**
 * 기본 포트폴리오 최적화
 */
export async function optimizePortfolio(inputData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize`, inputData);
    return response.data;
  } catch (error) {
    console.error('Optimization error:', error);
    throw error;
  }
}

/**
 * 가중치 기반 포트폴리오 최적화
 */
export async function optimizePortfolioWithWeights(inputData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/with-weights`, inputData);
    return response.data;
  } catch (error) {
    console.error('Optimization with weights error:', error);
    throw error;
  }
}

/**
 * AI Agent 워크플로우를 사용한 최적화
 * 
 * Flow:
 * 1. Form Submission
 * 2. AI Agent Processing
 * 3. Optimization (Qiskit)
 * 4. Risk Analysis
 * 5. Conditional Branching
 * 6. Action Execution
 * 
 * @param {Object} inputData - Portfolio data
 * @param {Array<string>} inputData.tickers - Stock tickers
 * @param {Array<number>} inputData.initial_weights - Initial weights (optional)
 * @param {number} inputData.risk_factor - Risk factor (0-1)
 * @param {string} inputData.method - Optimization method ('quantum' or 'classical')
 * @param {string} inputData.period - Data period ('1y', '6mo', etc.)
 * 
 * @returns {Promise<Object>} Workflow result
 */
export async function optimizeWithWorkflow(inputData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize/workflow`, inputData, {
      timeout: 300000, // 5 minutes for quantum
    });
    
    return response.data;
  } catch (error) {
    console.error('Workflow optimization error:', error);
    throw error;
  }
}

/**
 * 워크플로우 상태 조회
 */
export async function getWorkflowStatus(workflowId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/workflow/${workflowId}/status`);
    return response.data;
  } catch (error) {
    console.error('Get workflow status error:', error);
    throw error;
  }
}

/**
 * 실시간 주가 조회
 */
export async function getStockPrice(symbol) {
  try {
    const response = await axios.get(`${API_BASE_URL}/stock/price/${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Get stock price error:', error);
    throw error;
  }
}

/**
 * 주식 검색
 */
export async function searchStocks(query) {
  try {
    const response = await axios.get(`${API_BASE_URL}/stock/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Search stocks error:', error);
    throw error;
  }
}

export default {
  optimizePortfolio,
  optimizePortfolioWithWeights,
  optimizeWithWorkflow,
  getWorkflowStatus,
  getStockPrice,
  searchStocks,
};

