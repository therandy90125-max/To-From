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
  const [primaryAmount, setPrimaryAmount] = useState(null);
  const [secondaryAmount, setSecondaryAmount] = useState(null);
  const [primaryRate, setPrimaryRate] = useState(1);
  const [secondaryRate, setSecondaryRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const defaultCurrency = language === 'ko' ? 'KRW' : 'USD';
  const displayCurrency = currency || defaultCurrency;
  const primaryCurrency = language === 'ko' ? 'KRW' : 'USD';
  const secondaryCurrency = language === 'ko' ? 'USD' : 'KRW';

  useEffect(() => {
    let cancelled = false;

    const fetchConversions = async () => {
      if (!amount) {
        setPrimaryAmount(null);
        setSecondaryAmount(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Primary conversion (display amount in language-preferred currency)
        if (displayCurrency === primaryCurrency) {
          setPrimaryAmount(amount);
          setPrimaryRate(1);
        } else {
          const response = await apiClient.get(API_ENDPOINTS.EXCHANGE_RATE(displayCurrency, primaryCurrency));
          const rate = response.data?.rate ?? 1;
          if (!cancelled) {
            setPrimaryRate(rate);
            setPrimaryAmount(amount * rate);
          }
        }

        if (!showConversion) {
          setSecondaryAmount(null);
          setSecondaryRate(null);
          return;
        }

        // Secondary conversion (display amount in the opposite currency)
        if (displayCurrency === secondaryCurrency) {
          setSecondaryAmount(amount);
          setSecondaryRate(1);
        } else {
          const responseSecondary = await apiClient.get(
            API_ENDPOINTS.EXCHANGE_RATE(displayCurrency, secondaryCurrency)
          );
          const secondary = responseSecondary.data?.rate ?? null;
          if (!cancelled) {
            setSecondaryRate(secondary);
            setSecondaryAmount(secondary ? amount * secondary : null);
          }
        }
      } catch (err) {
        console.error('환율 조회 실패:', err);
        setError(err);

        // Fallback rates
        const fallbackUsdToKrw = 1300;
        const fallbackKrwToUsd = 1 / fallbackUsdToKrw;

        if (displayCurrency === primaryCurrency) {
          setPrimaryAmount(amount);
          setPrimaryRate(1);
        } else {
          const rate = displayCurrency === 'USD' ? fallbackUsdToKrw : fallbackKrwToUsd;
          setPrimaryRate(rate);
          setPrimaryAmount(amount * rate);
        }

        if (!showConversion) {
          setSecondaryAmount(null);
          setSecondaryRate(null);
        } else if (displayCurrency === secondaryCurrency) {
          setSecondaryAmount(amount);
          setSecondaryRate(1);
        } else {
          const rate = displayCurrency === 'USD' ? fallbackUsdToKrw : fallbackKrwToUsd;
          setSecondaryRate(rate);
          setSecondaryAmount(amount * rate);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchConversions();

    return () => {
      cancelled = true;
    };
  }, [amount, displayCurrency, language, showConversion]);

  const formatCurrency = (value, curr) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return 'N/A';
    }

    const locale = curr === 'KRW' ? 'ko-KR' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: curr === 'KRW' ? 0 : 2,
      maximumFractionDigits: curr === 'KRW' ? 0 : 2,
    }).format(value);
  };

  if (!amount || !displayCurrency) {
    return <span className="text-gray-400">N/A</span>;
  }

  return (
    <div className="inline-flex flex-col gap-0.5">
      <span className="font-semibold text-lg text-slate-900">
        {formatCurrency(primaryAmount ?? amount, primaryCurrency)}
      </span>
      {showConversion && (
        <span className="text-sm text-gray-500 flex items-center gap-1.5">
          {loading && !secondaryAmount ? (
            <span className="text-xs text-gray-400">
              {language === 'ko' ? '환율 조회 중...' : 'Fetching exchange rate...'}
            </span>
          ) : (
            <>
              ≈ {formatCurrency(secondaryAmount ?? amount, secondaryCurrency)}
              {secondaryRate && (
                <span className="text-xs text-gray-400">
                  (1 {displayCurrency} = {secondaryRate.toFixed(2)} {secondaryCurrency})
                </span>
              )}
              {error && (
                <span className="text-xs text-amber-500">
                  {language === 'ko' ? '임시 환율 사용' : 'Fallback rate applied'}
                </span>
              )}
            </>
          )}
        </span>
      )}
    </div>
  );
};

export default CurrencyDisplay;

