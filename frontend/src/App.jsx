import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import PortfolioOptimizer from './components/PortfolioOptimizer';
import Settings from './components/Settings';
import WorkflowVisualization from './components/WorkflowVisualization';
import EnhancedCharts from './components/EnhancedCharts';
import './App.css';
import './styles/About.css';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { t } = useLanguage();

  // Listen for navigation events from other components
  useEffect(() => {
    const handleNavigate = (event) => {
      if (event.detail && event.detail.page) {
        setCurrentPage(event.detail.page);
      }
    };

    window.addEventListener('navigateTo', handleNavigate);
    return () => window.removeEventListener('navigateTo', handleNavigate);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'chatbot':
        return <Chatbot />;
      case 'optimizer':
        return <PortfolioOptimizer />;
      case 'workflow':
        return <WorkflowVisualization />;
      case 'charts':
        return <EnhancedCharts />;
      case 'settings':
        return <Settings />;
      case 'about':
        return (
          <div className="about-page">
            <div className="about-content">
              <img 
                src="/quantafolio-logo.png" 
                alt="QuantaFolio Navigator" 
                className="about-logo"
              />
              <h1 className="about-title">QuantaFolio Navigator</h1>
              <p className="about-subtitle">{t('aboutDescription')}</p>
              <div className="about-features">
                <div className="feature-card">
                  <span className="feature-icon">⚛️</span>
                  <h3>{t('quantumOptimization')}</h3>
                  <p>QAOA & VQE algorithms</p>
                </div>
                <div className="feature-card">
                  <span className="feature-icon">🤖</span>
                  <h3>AI Chatbot</h3>
                  <p>Investment advice powered by AI</p>
                </div>
                <div className="feature-card">
                  <span className="feature-icon">📊</span>
                  <h3>Portfolio Analytics</h3>
                  <p>Real-time portfolio tracking</p>
                </div>
                <div className="feature-card">
                  <span className="feature-icon">🔍</span>
                  <h3>Stock Search</h3>
                  <p>Global stock database via Alpha Vantage</p>
                </div>
              </div>
              <div className="about-footer">
                <p>{t('poweredBy')}</p>
                <div className="tech-stack">
                  <span className="tech-badge">React</span>
                  <span className="tech-badge">Spring Boot</span>
                  <span className="tech-badge">Flask</span>
                  <span className="tech-badge">Qiskit</span>
                  <span className="tech-badge">Alpha Vantage</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Sidebar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
