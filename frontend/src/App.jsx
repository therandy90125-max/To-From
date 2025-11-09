import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PortfolioOptimizer from './components/PortfolioOptimizer';
import PortfolioOptimizerEnhanced from './components/PortfolioOptimizerEnhanced';
import Settings from './components/Settings';
import EnhancedCharts from './components/EnhancedCharts';
import Insights from './components/Insights';
import ChatDock from './components/ChatDock';
import './App.css';
import './styles/About.css';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Listen for navigation events from other components
  useEffect(() => {
    const handleNavigate = (event) => {
      if (!event.detail || !event.detail.page) return;

      const targetPage = event.detail.page;

      if (targetPage === 'workflow' || targetPage === 'about') {
        setCurrentPage('insights');
        return;
      }

      if (targetPage === 'chatbot') {
        window.dispatchEvent(
          new CustomEvent('openChatDock', { detail: { openChat: true } })
        );
        return;
      }

      setCurrentPage(targetPage);
    };

    window.addEventListener('navigateTo', handleNavigate);
    return () => window.removeEventListener('navigateTo', handleNavigate);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'optimizer':
        return <PortfolioOptimizer />;
      case 'optimizer-enhanced':
        return <PortfolioOptimizerEnhanced />;
      case 'charts':
        return <EnhancedCharts />;
      case 'settings':
        return <Settings />;
      case 'insights':
        return <Insights />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
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
      <ChatDock />
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
