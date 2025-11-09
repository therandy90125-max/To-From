import React, { useState, useEffect } from 'react';
import { useLanguage } from "../contexts/LanguageContext";
import { getCurrencySymbol, getCurrencyCode } from '../utils/currencyUtils';
import StockSearchInput from './StockSearchInput';
import CurrencyDisplay from './CurrencyDisplay';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA'];

const Dashboard = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const currencySymbol = getCurrencySymbol(language);
  const currencyCode = getCurrencyCode(language);

  const [portfolio, setPortfolio] = useState([
    { ticker: '005930.KS', name: 'Samsung Electronics', shares: 10, avgPrice: 70000, exchange: 'KRX' },
    { ticker: '000270.KS', name: 'Kia Corporation', shares: 15, avgPrice: 95000, exchange: 'KRX' },
    { ticker: '005380.KS', name: 'Hyundai Motor', shares: 5, avgPrice: 220000, exchange: 'KRX' },
  ]);

  const [currentPrices, setCurrentPrices] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [showAddStock, setShowAddStock] = useState(false);

  useEffect(() => {
    let cost = 0;
    let value = 0;

    portfolio.forEach((stock) => {
      cost += stock.shares * stock.avgPrice;
      const currentPrice = currentPrices[stock.ticker] || stock.avgPrice;
      value += stock.shares * currentPrice;
    });

    setTotalCost(cost);
    setTotalValue(value);
  }, [portfolio, currentPrices]);

  const handleAddStock = (stock) => {
    const exists = portfolio.some((s) => s.ticker === stock.ticker || s.ticker === stock.symbol);
    if (!exists) {
      setPortfolio([
        ...portfolio,
        {
          ticker: stock.ticker || stock.symbol,
          name: stock.name,
          shares: 0,
          avgPrice: 0,
          exchange: stock.exchange || 'NASDAQ',
        },
      ]);
      setShowAddStock(false);
    }
  };

  const updateStock = (index, field, value) => {
    const nextPortfolio = [...portfolio];
    nextPortfolio[index][field] = parseFloat(value) || 0;
    setPortfolio(nextPortfolio);
  };

  const removeStock = (index) => {
    const nextPortfolio = portfolio.filter((_, i) => i !== index);
    setPortfolio(nextPortfolio);
  };

  const portfolioDistribution = portfolio
    .filter((stock) => stock.shares > 0)
    .map((stock) => {
      const currentPrice = currentPrices[stock.ticker] || stock.avgPrice;
      const value = stock.shares * currentPrice;
      const baseName = (stock.name || stock.ticker).split('(')[0].trim();
      return {
        name: baseName,
        ticker: stock.ticker,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      };
    })
    .filter((entry) => entry.value > 0);

  const totalReturn = totalValue - totalCost;
  const returnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
  const activeHoldingsCount = portfolio.filter((s) => s.shares > 0).length;

  const heroHighlights = [
    { label: t('landingHeroMetricQuantumLabel'), value: t('landingHeroMetricQuantumValue') },
    { label: t('landingHeroMetricCoverageLabel'), value: t('landingHeroMetricCoverageValue') },
    { label: t('landingHeroMetricLatencyLabel'), value: t('landingHeroMetricLatencyValue') },
  ];

  const featuredStocks = portfolio.slice(0, 3).map((stock) => {
    const currentPrice = currentPrices[stock.ticker] || stock.avgPrice || 0;
    const baseline = stock.avgPrice || (currentPrice || 1);
    const change = baseline > 0 ? ((currentPrice - baseline) / baseline) * 100 : 0;
    const value = stock.shares * currentPrice;

    return {
      ticker: stock.ticker,
      name: stock.name,
      change,
      value,
    };
  });

  const handleOptimize = () => {
    try {
      // 포트폴리오 데이터를 localStorage에 저장
      localStorage.setItem(
        'currentPortfolio',
        JSON.stringify({
          portfolio,
          totalValue,
          totalCost,
          timestamp: new Date().toISOString(),
        }),
      );

      // 직접 네비게이션 함수 사용 (우선)
      if (onNavigate) {
        console.log('[Dashboard] Navigating via onNavigate prop');
        onNavigate('optimizer');
        return;
      }

      // Fallback: 네비게이션 이벤트 발생
      const navigateEvent = new CustomEvent('navigateTo', { 
        detail: { page: 'optimizer' },
        bubbles: true,
        cancelable: true
      });
      
      console.log('[Dashboard] Dispatching navigateTo event:', navigateEvent.detail);
      window.dispatchEvent(navigateEvent);
    } catch (error) {
      console.error('[Dashboard] Navigation error:', error);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <section className="landing-hero">
          <div className="hero-text">
            <span className="hero-badge">Quantum • AI • Finance</span>
            <h1>{t('landingHeroTitle')}</h1>
            <p>{t('landingHeroSubtitle')}</p>
            <div className="hero-actions">
              <button
                type="button"
                className="hero-button primary"
                onClick={handleOptimize}
                disabled={activeHoldingsCount < 2}
              >
                {t('landingHeroButtonPrimary')}
              </button>
              <button
                type="button"
                className="hero-button secondary"
                onClick={() => setShowAddStock(true)}
              >
                {t('landingHeroButtonSecondary')}
              </button>
            </div>
            <div className="hero-metrics">
              {heroHighlights.map((highlight) => (
                <div className="hero-metric" key={highlight.label}>
                  <span className="metric-label">{highlight.label}</span>
                  <span className="metric-value">{highlight.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-header">
                <h3>{t('landingHeroFeaturedTitle')}</h3>
                <p>{t('landingHeroFeaturedSubtitle')}</p>
              </div>
              <ul className="hero-featured-list">
                {featuredStocks.map((stock) => (
                  <li key={stock.ticker} className="hero-featured-item">
                    <div>
                      <span className="hero-featured-ticker">{stock.ticker}</span>
                      <span className="hero-featured-name">{stock.name}</span>
                    </div>
                    <div className="hero-featured-stats">
                      <span className={`hero-featured-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                        {stock.change >= 0 ? '+' : ''}
                        {Number.isFinite(stock.change) ? stock.change.toFixed(2) : '0.00'}%
                      </span>
                      <span className="hero-featured-value">
                        {currencySymbol}
                        {Number.isFinite(stock.value) ? stock.value.toLocaleString() : '0'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="hero-featured-footer">{t('landingHeroFeaturedChange')}</p>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-header">
            <div>
              <h2>{t('portfolioOverview')}</h2>
              <p>{t('optimizePortfolioDesc')}</p>
            </div>
            <div className="dashboard-code">
              <span>{t('totalPortfolioValue')}</span>
              <strong>
                {currencySymbol}
                {totalValue.toLocaleString()}
                <small>{currencyCode}</small>
              </strong>
            </div>
          </div>

          <div className="summary-grid">
            <div className="summary-card-modern border-blue">
              <span>{t('totalPortfolioValue')}</span>
              <strong>
                {currencySymbol}
                {totalValue.toLocaleString()}
              </strong>
              <small>{currencyCode}</small>
            </div>
            <div className="summary-card-modern border-green">
              <span>{t('totalReturn')}</span>
              <strong className={totalReturn >= 0 ? 'positive' : 'negative'}>
                {totalReturn >= 0 ? '+' : ''}
                {currencySymbol}
                {totalReturn.toLocaleString()}
              </strong>
              <small className={totalReturn >= 0 ? 'positive' : 'negative'}>
                {returnPercentage >= 0 ? '+' : ''}
                {returnPercentage.toFixed(2)}%
              </small>
            </div>
            <div className="summary-card-modern border-purple">
              <span>{t('holdings')}</span>
              <strong>{activeHoldingsCount}</strong>
              <small>{t('stocks')}</small>
            </div>
          </div>

          <div className="content-grid">
            <div className="card-modern">
              <div className="card-header">
                <h3>{t('currentHoldings')}</h3>
                <button
                  type="button"
                  className="card-cta"
                  onClick={() => setShowAddStock(!showAddStock)}
                >
                  + {t('addStock')}
                </button>
              </div>

              {showAddStock && (
                <div className="card-search">
                  <StockSearchInput onSelectStock={handleAddStock} />
                </div>
              )}

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>{t('stock')}</th>
                      <th>{t('shares')}</th>
                      <th>{t('avgPrice')}</th>
                      <th>{t('value')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((stock, index) => {
                      const currentPrice = currentPrices[stock.ticker] || stock.avgPrice;
                      const value = stock.shares * currentPrice;
                      const pl = stock.shares * (currentPrice - stock.avgPrice);
                      const plPercent = stock.avgPrice > 0 ? ((currentPrice - stock.avgPrice) / stock.avgPrice) * 100 : 0;

                      return (
                        <tr key={index}>
                          <td>
                            <div className="stock-cell">
                              <span className="ticker">{stock.ticker}</span>
                              <span className="name">{stock.name}</span>
                            </div>
                          </td>
                          <td className="numeric">
                            <input
                              type="number"
                              value={stock.shares}
                              onChange={(e) => updateStock(index, 'shares', e.target.value)}
                              min="0"
                            />
                          </td>
                          <td className="numeric">
                            <input
                              type="number"
                              value={stock.avgPrice}
                              onChange={(e) => updateStock(index, 'avgPrice', e.target.value)}
                              min="0"
                            />
                          </td>
                          <td className="numeric">
                            <div className="value-cell">
                              <CurrencyDisplay
                                amount={value}
                                currency={
                                  stock.exchange === 'KRX' ||
                                  stock.exchange === 'KOSPI' ||
                                  stock.exchange === 'KOSDAQ'
                                    ? 'KRW'
                                    : 'USD'
                                }
                                showConversion={true}
                              />
                              <span className={`pl ${pl >= 0 ? 'positive' : 'negative'}`}>
                                <CurrencyDisplay
                                  amount={Math.abs(pl)}
                                  currency={
                                    stock.exchange === 'KRX' ||
                                    stock.exchange === 'KOSPI' ||
                                    stock.exchange === 'KOSDAQ'
                                      ? 'KRW'
                                      : 'USD'
                                  }
                                  showConversion={false}
                                />
                                <em>
                                  ({pl >= 0 ? '+' : ''}
                                  {plPercent.toFixed(1)}%)
                                </em>
                              </span>
                            </div>
                          </td>
                          <td className="numeric">
                            <button
                              type="button"
                              className="remove-btn"
                              onClick={() => removeStock(index)}
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {portfolio.length === 0 && (
                  <div className="empty-state">
                    <p>{t('noStocks')}</p>
                    <span>{t('addStocksToStart')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card-modern">
              <div className="card-header">
                <h3>{t('portfolioDistribution')}</h3>
              </div>
              {portfolioDistribution.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={portfolioDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, ticker, percentage }) =>
                          `${name} (${ticker}) ${percentage.toFixed(1)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {portfolioDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, _name, entry) => [
                          `${currencySymbol}${Number(value).toLocaleString()}`,
                          entry?.payload?.ticker || ''
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    {portfolioDistribution.map((item, index) => (
                      <div key={item.ticker} className="legend-row">
                        <span
                          className="bullet"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="legend-name">
                          {item.ticker} · {item.name}
                        </span>
                        <span className="legend-value">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>{t('addStocksToSeeDistribution')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="callout-modern">
            <div>
              <h3>{t('readyToOptimize')}</h3>
              <p>{t('optimizePortfolioDesc')}</p>
            </div>
            <button
              type="button"
              onClick={handleOptimize}
              disabled={activeHoldingsCount < 2}
            >
              {t('optimizeMyPortfolio')} →
            </button>
          </div>
          {activeHoldingsCount < 2 && (
            <p className="callout-hint">{t('needAtLeast2Stocks')}</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

