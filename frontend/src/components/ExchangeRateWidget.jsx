import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

/**
 * 실시간 환율 위젯
 * Real-time Exchange Rate Widget
 * 
 * Features:
 * - USD ↔ KRW 실시간 환율 표시
 * - 15초마다 자동 업데이트
 * - 변동 추이 표시 (▲/▼)
 * - 다국어 지원 (한국어/English)
 * 
 * @version 1.0.0
 * @since 2025-11-10
 */
const ExchangeRateWidget = () => {
  const { t, language } = useLanguage();
  const [rate, setRate] = useState(null);
  const [prevRate, setPrevRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  /**
   * 환율 조회 함수
   * Fetch exchange rate from backend
   */
  const fetchExchangeRate = async () => {
    try {
      setError(null);
      
      // Spring Boot API 호출
      const response = await axios.get('http://localhost:8080/api/currency/rate', {
        params: {
          from: 'USD',
          to: 'KRW'
        }
      });
      
      if (response.data.success) {
        const newRate = response.data.rate;
        
        setPrevRate(rate);
        setRate(newRate);
        setLastUpdate(new Date());
        setLoading(false);
        
        console.log(`[ExchangeRate] Updated: ₩${newRate.toFixed(2)}`);
      }
    } catch (err) {
      console.error('[ExchangeRate] Failed to fetch:', err);
      setError(err.message);
      
      // Fallback rate (if no previous rate)
      if (!rate) {
        setRate(1320.50);
        setLastUpdate(new Date());
        setLoading(false);
      }
    }
  };

  /**
   * 초기 로드 & 자동 업데이트
   */
  useEffect(() => {
    // 초기 로드
    fetchExchangeRate();

    // 15초마다 자동 업데이트
    const interval = setInterval(() => {
      fetchExchangeRate();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  /**
   * 환율 변동 계산
   */
  const getRateChange = () => {
    if (!rate || !prevRate) return { value: 0, percent: 0 };
    const change = rate - prevRate;
    const percent = (change / prevRate) * 100;
    return { value: change, percent };
  };

  const change = getRateChange();
  const isUp = change.value > 0;
  const isDown = change.value < 0;

  /**
   * 로딩 상태
   */
  if (loading && !rate) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  /**
   * 메인 UI
   */
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-4 border border-blue-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            {language === 'ko' ? '실시간 환율' : 'Real-time Rate'}
          </span>
          <span 
            className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} 
            title={loading ? (language === 'ko' ? '업데이트 중' : 'Updating') : (language === 'ko' ? '활성' : 'Active')}
          />
        </div>
        {lastUpdate && (
          <span className="text-xs text-gray-400">
            {lastUpdate.toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        )}
      </div>
      
      {/* 환율 표시 */}
      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-2xl font-bold text-gray-900">
          ₩{rate?.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500">
          / $1 USD
        </div>
      </div>

      {/* 변동 추이 */}
      {prevRate && rate && Math.abs(change.value) > 0.01 && (
        <div className={`flex items-center gap-1 text-sm font-medium ${
          isUp ? 'text-red-600' : isDown ? 'text-blue-600' : 'text-gray-600'
        }`}>
          <span>
            {isUp && '▲'} {isDown && '▼'} {Math.abs(change.value).toFixed(2)}
            {language === 'ko' ? '원' : ' KRW'}
          </span>
          <span className="text-xs">
            ({change.percent > 0 ? '+' : ''}{change.percent.toFixed(2)}%)
          </span>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-2 text-xs text-red-500">
          {language === 'ko' ? '업데이트 실패 (이전 환율 사용 중)' : 'Update failed (using cached rate)'}
        </div>
      )}

      {/* 푸터 */}
      <div className="mt-2 pt-2 border-t border-blue-100">
        <div className="text-xs text-gray-500">
          {language === 'ko' ? '💡 15초마다 자동 업데이트' : '💡 Auto-updates every 15s'}
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateWidget;

