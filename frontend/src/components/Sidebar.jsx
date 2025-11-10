import BackgroundMusic from "./BackgroundMusic";
import ExchangeRateWidget from "./ExchangeRateWidget";
import TechStackBadges from "./TechStackBadges";
import { useLanguage } from "../contexts/LanguageContext";

export default function Sidebar({ currentPage, onPageChange, onLanguageChange }) {
  const { t, language, setLanguage } = useLanguage();
  
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: t('dashboard') },
    { id: 'optimizer', icon: '🎯', label: t('optimizer') },
    { id: 'charts', icon: '📈', label: t('analytics') },
    { id: 'insights', icon: '🧭', label: t('insights') },
    { id: 'settings', icon: '⚙️', label: t('settings') },
  ];

  const handleLanguageChange = () => {
    const newLang = language === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <img 
            src="/quantafolio-logo.png" 
            alt="QuantaFolio Navigator" 
            className="sidebar-logo-image"
          />
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onPageChange(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        {/* 환율 위젯 */}
        <div style={{ marginBottom: '1rem' }}>
          <ExchangeRateWidget />
        </div>
        
        {/* 기술 스택 배지 */}
        <div style={{ marginBottom: '1rem' }}>
          <TechStackBadges />
        </div>
        
        <BackgroundMusic />
        <button
          className="language-toggle"
          onClick={handleLanguageChange}
          title={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
        >
          {language === 'ko' ? '🇺🇸 ENG' : '🇰🇷 한국어'}
        </button>
      </div>
    </div>
  );
}

