import WorkflowVisualization from './WorkflowVisualization';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/About.css';

export default function Insights() {
  const { t } = useLanguage();

  return (
    <div className="insights-page">
      <section className="insights-about">
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
              <p>{t('qaoaSuccessfullyExecuted')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🧠</span>
              <h3>{t('chatAssistant')}</h3>
              <p>{t('chatAssistantSubtitle')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3>{t('portfolioAnalytics')}</h3>
              <p>{t('portfolioDistribution')}</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔍</span>
              <h3>{t('stockSearch')}</h3>
              <p>{t('searchStockPlaceholder')}</p>
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
      </section>

      <section className="insights-workflow">
        <div className="insights-workflow-header">
          <h2>{t('workflowInsightsTitle')}</h2>
          <p>{t('workflowInsightsSubtitle')}</p>
        </div>
        <WorkflowVisualization embedded />
      </section>
    </div>
  );
}

