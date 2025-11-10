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
import ExchangeRateWidget from './components/ExchangeRateWidget';
import './App.css';
import './styles/About.css';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Listen for navigation events from other components
  useEffect(() => {
    // 디버깅: 이벤트 리스너 등록 확인
    console.log('[App] 🔧 Setting up navigation event listeners');
    
    const handleNavigate = (event) => {
      console.log('='.repeat(80));
      console.log('[App] 📍 Navigation event received:', event.detail);
      
      if (!event.detail || !event.detail.page) {
        console.warn('[App] ⚠️ Navigation event missing page detail');
        return;
      }

      const targetPage = event.detail.page;
      console.log('[App] 🎯 Navigating to:', targetPage);

      if (targetPage === 'workflow' || targetPage === 'about') {
        console.log('[App] Redirecting to insights');
        setCurrentPage('insights');
        return;
      }

      if (targetPage === 'chatbot') {
        console.log('[App] Opening chat dock');
        window.dispatchEvent(
          new CustomEvent('openChatDock', { detail: { openChat: true } })
        );
        return;
      }

      // 함수형 업데이트로 최신 상태 보장
      setCurrentPage(prevPage => {
        console.log('[App] Current page before navigation:', prevPage);
        console.log('[App] ✅ Setting currentPage to:', targetPage);
        console.log('[App] ✅ Navigation completed');
        console.log('='.repeat(80));
        return targetPage;
      });
    };

    const handleForceNavigate = (event) => {
      console.log('='.repeat(80));
      console.log('[App] 🔥 FORCE navigation event received:', event.detail);
      if (event.detail && event.detail.page) {
        const targetPage = event.detail.page;
        console.log('[App] 🔥 Force navigating to:', targetPage);
        
        // 함수형 업데이트로 최신 상태 보장
        setCurrentPage(prevPage => {
          console.log('[App] Current page before force navigation:', prevPage);
          console.log('[App] ✅ Force navigation completed');
          console.log('='.repeat(80));
          return targetPage;
        });
      } else {
        console.warn('[App] ⚠️ Force navigation event missing page detail');
      }
    };

    console.log('[App] ✅ Event listeners registered');
    window.addEventListener('navigateTo', handleNavigate);
    window.addEventListener('forceNavigate', handleForceNavigate);
    
    // 디버깅: 이벤트 리스너 등록 확인
    console.log('[App] ✅ navigateTo listener registered');
    console.log('[App] ✅ forceNavigate listener registered');
    
    // 테스트: 이벤트 리스너가 작동하는지 확인
    const testListener = (e) => {
      console.log('[App] 🧪 Test navigation event caught:', e.detail);
    };
    window.addEventListener('forceNavigate', testListener);
    console.log('[App] 🧪 Test listener registered for debugging');
    
    return () => {
      console.log('[App] 🧹 Cleaning up event listeners');
      window.removeEventListener('navigateTo', handleNavigate);
      window.removeEventListener('forceNavigate', handleForceNavigate);
      window.removeEventListener('forceNavigate', testListener);
    };
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
