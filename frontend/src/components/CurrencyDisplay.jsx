import React, { useState, useEffect } from 'react';
import { apiClient, API_ENDPOINTS } from '../config/api';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * 가격을 통화별로 표시하는 컴포넌트
 * 언어에 따라 기본 통화 변경: 한국어=KRW, 영어=USD
 * USD/KRW 자동 변환 지원
 */
const CurrencyDisplay = ({ amount, currency, showConversion = true }) => {
  const { language } = useLanguage();
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 언어에 따라 기본 통화 결정
  const defaultCurrency = language === 'ko' ? 'KRW' : 'USD';
  const displayCurrency = currency || defaultCurrency;

  useEffect(() => {
    if (showConversion && displayCurrency && amount) {
      fetchExchangeRate();
    }
  }, [displayCurrency, showConversion, amount, language]);

  const fetchExchangeRate = async () => {
    if (!displayCurrency || !amount) return;
    
    setLoading(true);
    try {
      // 언어에 따라 변환 방향 결정
      // 한국어: 원래 통화 → KRW 변환 표시
      // 영어: 원래 통화 → USD 변환 표시
      const targetCurrency = language === 'ko' ? 'KRW' : 'USD';
      const fromCurrency = displayCurrency;
      
      // 같은 통화면 변환 불필요
      if (fromCurrency === targetCurrency) {
        setLoading(false);
        return;
      }
      
      const response = await apiClient.get(
        API_ENDPOINTS.EXCHANGE_RATE(fromCurrency, targetCurrency)
      );
      
      if (response.data && response.data.rate) {
        const rate = response.data.rate;
        setExchangeRate(rate);
        setConvertedAmount(amount * rate);
        
        console.log(`💱 Exchange rate: 1 ${fromCurrency} = ${rate} ${targetCurrency}`);
      }
      
    } catch (error) {
      console.error('환율 조회 실패:', error);
      // Fallback: 기본 환율 사용
      const defaultRate = displayCurrency === 'USD' ? 1300 : 0.00077;
      setExchangeRate(defaultRate);
      setConvertedAmount(amount * defaultRate);
    } finally {
      setLoading(false);
    }
  };

  // 통화 포맷팅
  const formatCurrency = (value, curr) => {
    if (!value || isNaN(value)) return 'N/A';
    
    const locale = curr === 'KRW' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: curr === 'KRW' ? 0 : 2,
      maximumFractionDigits: curr === 'KRW' ? 0 : 2
    }).format(value);
  };

  if (!amount || !displayCurrency) {
    return <span className="text-gray-400">N/A</span>;
  }

  // 언어에 따라 표시할 통화 결정
  const primaryCurrency = language === 'ko' ? 'KRW' : 'USD';
  const secondaryCurrency = language === 'ko' ? 'USD' : 'KRW';
  
  // 원래 통화가 언어 기본 통화와 다를 때만 변환 표시
  const needsConversion = displayCurrency !== primaryCurrency;

  return (
    <div className="inline-flex flex-col">
      {/* 메인 가격 (언어에 따라 기본 통화로 표시) */}
      <span className="font-semibold text-lg">
        {needsConversion && convertedAmount && exchangeRate 
          ? formatCurrency(convertedAmount, primaryCurrency)
          : formatCurrency(amount, displayCurrency)}
      </span>
      
      {/* 변환된 가격 (원래 통화 표시) */}
      {showConversion && needsConversion && (
        <>
          {loading ? (
            <span className="text-xs text-gray-400">
              {language === 'ko' ? '환율 조회 중...' : 'Fetching exchange rate...'}
            </span>
          ) : convertedAmount && exchangeRate ? (
            <span className="text-sm text-gray-500">
              ≈ {formatCurrency(amount, displayCurrency)}
              <span className="ml-1 text-xs">
                (1 {displayCurrency} = {exchangeRate.toFixed(2)} {primaryCurrency})
              </span>
            </span>
          ) : null}
        </>
      )}
    </div>
  );
};

export default CurrencyDisplay;

