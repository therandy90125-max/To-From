import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/StockSearchInput.css';

export default function StockSearchInput({ onSelectStock, placeholder, disabled }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // 검색어 변경 시 디바운스 적용
  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      await handleStockSearch(searchQuery);
    }, 300); // 300ms 대기 후 검색

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStockSearch = async (query) => {
    try {
      setIsSearching(true);
      const response = await axios.get(`/api/stocks/search?q=${encodeURIComponent(query)}`);
      
      if (response.data.success) {
        setSearchResults(response.data.results || []);
        setShowDropdown(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Stock search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectStock = (stock) => {
    setSearchQuery('');
    setShowDropdown(false);
    setSearchResults([]);
    if (onSelectStock) {
      onSelectStock(stock);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelectStock(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="stock-search-container" ref={dropdownRef}>
      <div className="stock-search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="stock-search-input"
          placeholder={placeholder || t('searchStockOrTicker')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        {isSearching && (
          <div className="stock-search-spinner">
            <div className="spinner-small"></div>
          </div>
        )}
      </div>

      {showDropdown && searchResults.length > 0 && (
        <div className="stock-search-dropdown">
          {searchResults.map((stock, index) => (
            <div
              key={stock.ticker}
              className={`stock-search-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelectStock(stock)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="stock-ticker">{stock.ticker}</div>
              <div className="stock-name">{stock.name}</div>
              <div className="stock-exchange">{stock.exchange}</div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && searchResults.length === 0 && !isSearching && searchQuery.length > 0 && (
        <div className="stock-search-dropdown">
          <div className="stock-search-no-results">
            {t('noResultsFound')}
          </div>
        </div>
      )}
    </div>
  );
}

