import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  // 언어 변경시 document.lang 업데이트
  useEffect(() => {
    document.documentElement.lang = language;
    
    // 전역 이벤트 발생 (다른 컴포넌트에서 감지 가능)
    window.dispatchEvent(new CustomEvent('languageChange', { 
      detail: { language } 
    }));
    
    console.log('🌐 Language changed to:', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ko' ? 'en' : 'ko');
  };

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

