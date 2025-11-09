import React, { useState, useEffect, useCallback } from 'react';
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

  // ✅ State declarations must come FIRST before any functions that use them
  // 빈 포트폴리오로 시작 - 사용자가 직접 주식을 추가할 수 있도록
  const [portfolio, setPortfolio] = useState([]);

  const [currentPrices, setCurrentPrices] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [showAddStock, setShowAddStock] = useState(false);

  // 디버깅: props 전달 확인
  useEffect(() => {
    console.log('[Dashboard] Props received:', { 
      onNavigate: typeof onNavigate, 
      onNavigateValue: onNavigate,
      hasOnNavigate: !!onNavigate,
      isFunction: typeof onNavigate === 'function'
    });
    
    // React DevTools로 Props 검증
    console.log('[Dashboard] Full props object:', { onNavigate });
  }, [onNavigate]);

  // 버튼 DOM 요소 이벤트 캡처 확인
  useEffect(() => {
    const button = document.getElementById('quantum-optimize-button');
    if (button) {
      console.log('[Dashboard] ✅ Button element found:', button);
      
      // Raw DOM click event 캡처
      const rawClickHandler = (e) => {
        console.log('[Dashboard] 🎯 Raw DOM click event captured:', e);
        console.log('[Dashboard] Event target:', e.target);
        console.log('[Dashboard] Event currentTarget:', e.currentTarget);
      };
      
      button.addEventListener('click', rawClickHandler, true); // capture phase
      console.log('[Dashboard] ✅ Raw DOM click listener registered (capture phase)');
      
      return () => {
        button.removeEventListener('click', rawClickHandler, true);
      };
    } else {
      console.warn('[Dashboard] ⚠️ Button element not found!');
    }
  }, []);

  // CSS 우선순위 검증
  useEffect(() => {
    const button = document.getElementById('quantum-optimize-button');
    if (button) {
      const style = window.getComputedStyle(button);
      console.log('[Dashboard] 🔍 Button computed styles:', {
        cursor: style.cursor,
        pointerEvents: style.pointerEvents,
        zIndex: style.zIndex,
        position: style.position,
        opacity: style.opacity,
        display: style.display,
        visibility: style.visibility
      });
    }
  }, []);

  // handleOptimize 함수 정의 (state가 선언된 후에 정의)
  const handleOptimize = useCallback(() => {
    console.log('='.repeat(80));
    console.log('[Dashboard] 🚀 handleOptimize CALLED');
    console.log('[Dashboard] onNavigate prop:', onNavigate);
    console.log('[Dashboard] onNavigate type:', typeof onNavigate);
    console.log('[Dashboard] Portfolio:', portfolio);
    
    try {
      // 포트폴리오 유효성 검사
      const activePortfolio = portfolio.filter(s => s.shares > 0);
      console.log('[Dashboard] Active portfolio:', activePortfolio);
      console.log('[Dashboard] Active portfolio count:', activePortfolio.length);
      
      if (activePortfolio.length < 2) {
        const message = language === 'ko' 
          ? '최적화를 위해서는 최소 2개 이상의 주식이 필요합니다.\n포트폴리오에 주식을 추가하고 주식 수량을 설정해주세요.'
          : 'At least 2 stocks are required for optimization.\nPlease add stocks to your portfolio and set share quantities.';
        console.warn('[Dashboard] ❌ Validation failed:', message);
        alert(message);
        return;
      }

      // 포트폴리오 데이터를 localStorage에 저장
      const portfolioData = {
        portfolio: activePortfolio,
        totalValue,
        totalCost,
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem('currentPortfolio', JSON.stringify(portfolioData));
      console.log('[Dashboard] ✅ Portfolio saved to localStorage:', portfolioData);

      // 즉시 네비게이션 시도 (여러 방법 동시 실행)
      let navigationSuccess = false;

      // 방법 1: 직접 네비게이션 함수 사용 (최우선)
      if (onNavigate && typeof onNavigate === 'function') {
        console.log('[Dashboard] ✅ Method 1: Using onNavigate prop');
        try {
          onNavigate('optimizer');
          console.log('[Dashboard] ✅ Navigation via onNavigate completed');
          navigationSuccess = true;
        } catch (navError) {
          console.error('[Dashboard] ❌ onNavigate error:', navError);
        }
      } else {
        console.warn('[Dashboard] ⚠️ onNavigate is not a function:', typeof onNavigate);
      }

      // 방법 2: forceNavigate 이벤트 (즉시 실행)
      if (!navigationSuccess) {
        console.log('[Dashboard] ✅ Method 2: Dispatching forceNavigate event');
        const forceEvent = new CustomEvent('forceNavigate', { 
          detail: { page: 'optimizer' },
          bubbles: true,
          cancelable: false
        });
        window.dispatchEvent(forceEvent);
        console.log('[Dashboard] ✅ forceNavigate event dispatched');
      }

      // 방법 3: navigateTo 이벤트 (fallback)
      console.log('[Dashboard] ✅ Method 3: Dispatching navigateTo event');
      const navEvent = new CustomEvent('navigateTo', { 
        detail: { page: 'optimizer' },
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(navEvent);
      console.log('[Dashboard] ✅ navigateTo event dispatched');

      // 확인: 이벤트가 처리되었는지 확인
      setTimeout(() => {
        const saved = localStorage.getItem('currentPortfolio');
        if (saved) {
          console.log('[Dashboard] ✅ Portfolio data confirmed in localStorage');
        } else {
          console.error('[Dashboard] ❌ Portfolio data not found in localStorage');
        }
        
        // 추가 forceNavigate 재시도
        if (!navigationSuccess) {
          console.log('[Dashboard] 🔄 Retrying forceNavigate after 100ms');
          window.dispatchEvent(new CustomEvent('forceNavigate', { 
            detail: { page: 'optimizer' }
          }));
        }
      }, 100);

      console.log('[Dashboard] ✅ All navigation methods attempted');
      console.log('='.repeat(80));
    } catch (error) {
      console.error('[Dashboard] ❌ Navigation error:', error);
      console.error('[Dashboard] Error stack:', error.stack);
      alert(language === 'ko'
        ? `네비게이션 오류가 발생했습니다: ${error.message}\n콘솔을 확인해주세요.`
        : `Navigation error occurred: ${error.message}\nPlease check the console.`
      );
    }
  }, [portfolio, totalValue, totalCost, onNavigate, language]);

  // ✅ 직접 DOM 이벤트 리스너로 양자 최적화 실행
  useEffect(() => {
    const button = document.getElementById('quantum-optimize-button');
    
    if (!button) {
      console.warn('[Dashboard] ⚠️ Quantum optimize button not found');
      return;
    }

    // 버튼 위치와 크기 확인
    const rect = button.getBoundingClientRect();
    console.log('[Dashboard] 📍 Button position:', {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right
    });

    // 버튼 위에 다른 요소가 있는지 확인
    const elementAtPoint = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    console.log('[Dashboard] 🔍 Element at button center:', elementAtPoint);
    console.log('[Dashboard] 🔍 Is button itself?', elementAtPoint === button || button.contains(elementAtPoint));

    const handleDirectClick = (e) => {
      console.log('================================================================================');
      console.log('[Dashboard] 🎯 DIRECT DOM CLICK - Quantum optimization button');
      console.log('[Dashboard] Event details:', { 
        type: e.type, 
        target: e.target.id,
        button: e.button,
        currentTarget: e.currentTarget?.id
      });

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // 1. Validation - Dashboard의 portfolio 상태 사용
      const activePortfolio = portfolio.filter(s => s.shares > 0);
      
      if (!activePortfolio || activePortfolio.length < 2) {
        console.error('[Dashboard] ❌ Insufficient stocks selected:', activePortfolio.length);
        const msg = language === 'ko' 
          ? '최적화를 위해서는 최소 2개 이상의 주식이 필요합니다.\n포트폴리오에 주식을 추가하고 주식 수량을 설정해주세요.'
          : 'At least 2 stocks are required for optimization.\nPlease add stocks to your portfolio and set share quantities.';
        alert(msg);
        return;
      }

      console.log('[Dashboard] ✅ Validation passed');
      console.log('[Dashboard] Active portfolio:', activePortfolio);
      console.log('[Dashboard] Active portfolio count:', activePortfolio.length);

      // 2. Call handleOptimize
      if (typeof handleOptimize === 'function') {
        console.log('[Dashboard] 🚀 Calling handleOptimize function');
        try {
          handleOptimize();
          console.log('[Dashboard] ✅ handleOptimize called successfully');
        } catch (error) {
          console.error('[Dashboard] ❌ Error in handleOptimize:', error);
          alert(language === 'ko'
            ? `오류가 발생했습니다: ${error.message}`
            : `An error occurred: ${error.message}`
          );
        }
      } else {
        console.error('[Dashboard] ❌ handleOptimize is not a function:', typeof handleOptimize);
        alert(language === 'ko'
          ? '최적화 함수를 찾을 수 없습니다.'
          : 'Optimization function not found.'
        );
      }

      console.log('================================================================================');
    };

    const handleMouseDown = (e) => {
      console.log('[Dashboard] 🖱️ DIRECT DOM MOUSE DOWN on button');
      e.stopPropagation();
    };

    const handleMouseUp = (e) => {
      console.log('[Dashboard] 🖱️ DIRECT DOM MOUSE UP on button');
      e.stopPropagation();
    };

    // 여러 이벤트 타입에 리스너 추가 (capture phase 포함)
    button.addEventListener('click', handleDirectClick, true); // capture phase
    button.addEventListener('click', handleDirectClick, false); // bubble phase
    button.addEventListener('mousedown', handleMouseDown, true);
    button.addEventListener('mouseup', handleMouseUp, true);
    button.addEventListener('touchstart', handleDirectClick, true);
    button.addEventListener('touchend', handleDirectClick, true);
    
    console.log('[Dashboard] ✅ Direct DOM event listeners registered (multiple phases)');

    // Cleanup
    return () => {
      button.removeEventListener('click', handleDirectClick, true);
      button.removeEventListener('click', handleDirectClick, false);
      button.removeEventListener('mousedown', handleMouseDown, true);
      button.removeEventListener('mouseup', handleMouseUp, true);
      button.removeEventListener('touchstart', handleDirectClick, true);
      button.removeEventListener('touchend', handleDirectClick, true);
      console.log('[Dashboard] 🧹 Direct DOM event listeners removed');
    };
  }, [portfolio, language, handleOptimize]); // handleOptimize를 의존성에 추가

  // totalValue와 totalCost 계산
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

          <div className="callout-modern" style={{ position: 'relative' }}>
            <div>
              <h3>{language === 'ko' ? '🔬 양자 포트폴리오 최적화' : '🔬 Quantum Portfolio Optimization'}</h3>
              <p>{language === 'ko' 
                ? 'Qiskit QAOA 양자 알고리즘으로 포트폴리오를 최적화합니다.'
                : 'Optimize your portfolio using Qiskit QAOA quantum algorithm.'}
              </p>
            </div>
            <button
              type="button"
              id="quantum-optimize-button"
              className="optimize-button"
              style={{ 
                cursor: 'pointer',
                pointerEvents: 'auto',
                zIndex: 10001, // ChatDock (z-index: 50)보다 확실히 위에
                position: 'relative',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation',
                minWidth: '200px',
                opacity: 1,
                display: 'block',
                visibility: 'visible',
                margin: 0,
                padding: '0.95rem 2rem',
                isolation: 'isolate',
                transform: 'translateZ(0)' // GPU 가속으로 레이어 분리
              }}
              onMouseDown={(e) => {
                console.log('[Dashboard] 🖱️ MOUSE DOWN on button');
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                console.log('[Dashboard] 🖱️ MOUSE UP on button');
                e.stopPropagation();
              }}
              onClick={(e) => {
                console.log('='.repeat(80));
                console.log('[Dashboard] 🎯 BUTTON CLICKED - Quantum optimization button');
                console.log('[Dashboard] Event object:', e);
                console.log('[Dashboard] Event type:', e.type);
                console.log('[Dashboard] Event target:', e.target);
                console.log('[Dashboard] Event currentTarget:', e.currentTarget);
                console.log('[Dashboard] Active holdings count:', activeHoldingsCount);
                console.log('[Dashboard] onNavigate prop:', onNavigate);
                console.log('[Dashboard] onNavigate type:', typeof onNavigate);
                console.log('[Dashboard] handleOptimize function:', typeof handleOptimize);
                console.log('='.repeat(80));
                
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                if (activeHoldingsCount < 2) {
                  const msg = language === 'ko' 
                    ? '최적화를 위해서는 최소 2개 이상의 주식이 필요합니다.\n포트폴리오에 주식을 추가하고 주식 수량을 설정해주세요.'
                    : 'At least 2 stocks are required for optimization.\nPlease add stocks to your portfolio and set share quantities.';
                  console.warn('[Dashboard] ❌ Validation failed:', msg);
                  alert(msg);
                  return;
                }
                
                console.log('[Dashboard] ✅ Validation passed, calling handleOptimize');
                
                // 직접 handleOptimize 호출
                try {
                  handleOptimize();
                  console.log('[Dashboard] ✅ handleOptimize called successfully');
                } catch (error) {
                  console.error('[Dashboard] ❌ Error calling handleOptimize:', error);
                  console.error('[Dashboard] Error stack:', error.stack);
                  alert(language === 'ko'
                    ? `오류가 발생했습니다: ${error.message}`
                    : `An error occurred: ${error.message}`
                  );
                }
              }}
              onMouseEnter={() => {
                console.log('[Dashboard] 🖱️ Button mouse enter');
              }}
              onMouseLeave={() => {
                console.log('[Dashboard] 🖱️ Button mouse leave');
              }}
            >
              {language === 'ko' ? '🚀 양자 최적화 실행' : '🚀 Run Quantum Optimization'} →
            </button>
          </div>
          {activeHoldingsCount < 2 && (
            <p className="callout-hint" style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              textAlign: 'center',
              marginTop: '0.5rem',
              fontSize: '0.85rem'
            }}>
              {language === 'ko' 
                ? '최소 2개 이상의 주식이 필요합니다.'
                : 'At least 2 stocks are required.'}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

