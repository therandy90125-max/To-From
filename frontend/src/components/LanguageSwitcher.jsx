import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [isOptimizing, setIsOptimizing] = useState(false);

  // 언어 변경시 document.lang 업데이트
  useEffect(() => {
    document.documentElement.lang = language;
    
    // 전역 이벤트 발생 (다른 컴포넌트에서 감지 가능)
    window.dispatchEvent(new CustomEvent('languageChange', { 
      detail: { language } 
    }));
    
    console.log('🌐 Language changed to:', language);
  }, [language]);

  // 양자 최적화 진행 상태 감지
  useEffect(() => {
    const handleOptimizationStart = () => {
      setIsOptimizing(true);
    };

    const handleOptimizationEnd = () => {
      setIsOptimizing(false);
    };

    // 전역 이벤트 리스너
    window.addEventListener('quantumOptimizationStart', handleOptimizationStart);
    window.addEventListener('quantumOptimizationEnd', handleOptimizationEnd);

    return () => {
      window.removeEventListener('quantumOptimizationStart', handleOptimizationStart);
      window.removeEventListener('quantumOptimizationEnd', handleOptimizationEnd);
    };
  }, []);

  const toggleLanguage = () => {
    if (!isOptimizing) {
      setLanguage(prev => prev === 'ko' ? 'en' : 'ko');
    }
  };

  // 양자 최적화 진행 중일 때
  if (isOptimizing) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg">
        {/* Interconnected Nodes Animation */}
        <div className="relative w-8 h-6 flex items-center justify-center">
          <svg 
            width="32" 
            height="20" 
            viewBox="0 0 128 80" 
            className="overflow-visible"
          >
            {/* First Wave */}
            <g className="animate-pulse" style={{ animationDelay: '0s' }}>
              <rect x="10" y="30" width="20" height="8" rx="4" fill="#ffffff" opacity="0.8" />
              <circle cx="25" cy="34" r="6" fill="#C084FC" />
              <rect x="25" y="30" width="20" height="8" rx="4" fill="#ffffff" opacity="0.8" />
            </g>
            
            {/* Second Wave */}
            <g className="animate-pulse" style={{ animationDelay: '0.3s' }}>
              <rect x="44" y="20" width="20" height="8" rx="4" fill="#ffffff" opacity="0.8" />
              <circle cx="59" cy="24" r="6" fill="#C084FC" />
              <rect x="59" y="20" width="20" height="8" rx="4" fill="#ffffff" opacity="0.8" />
            </g>
            
            {/* Third Wave */}
            <g className="animate-pulse" style={{ animationDelay: '0.6s' }}>
              <rect x="78" y="40" width="20" height="8" rx="4" fill="#ffffff" opacity="0.8" />
              <circle cx="93" cy="44" r="6" fill="#C084FC" />
              <rect x="93" y="40" width="20" height="8" rx="4" fill="#ffffff" opacity="0.8" />
            </g>
            
            {/* Connecting Lines */}
            <g className="opacity-30">
              <line 
                x1="35" 
                y1="34" 
                x2="44" 
                y2="24" 
                stroke="#ffffff" 
                strokeWidth="2"
                className="animate-pulse"
                style={{ animationDelay: '0.15s' }}
              />
              <line 
                x1="69" 
                y1="24" 
                x2="78" 
                y2="44" 
                stroke="#ffffff" 
                strokeWidth="2"
                className="animate-pulse"
                style={{ animationDelay: '0.45s' }}
              />
            </g>
          </svg>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {language === 'ko' ? '양자 최적화 실행 중' : 'Quantum Optimizing'}
          </span>
          <span className="flex space-x-1">
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </span>
        </div>
      </div>
    );
  }

  // 일반 언어 전환 버튼
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      <span className="text-2xl">{language === 'ko' ? '🇰🇷' : '🇺🇸'}</span>
      <span className="font-medium">
        {language === 'ko' ? '한국어' : 'English'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;

