import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import PortfolioOptimizerWithWeights from "./components/PortfolioOptimizerWithWeights";
import Settings from "./components/Settings";
import Chatbot from "./components/Chatbot";
import { useLanguage } from "./contexts/LanguageContext";
import "./App.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { t, language, setLanguage } = useLanguage();

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigateToOptimizer={setCurrentPage} />;
      case "optimizer":
        return <PortfolioOptimizerWithWeights />;
      case "chatbot":
        return <Chatbot />;
      case "settings":
        return <Settings />;
      case "about":
        return (
          <div className="page-content">
            <h2>{t('about')}</h2>
            <p>{t('aboutDescription')}</p>
            <p>{t('poweredBy')}</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-tnf">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onLanguageChange={setLanguage}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
