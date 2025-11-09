#!/usr/bin/env python3
"""
Real-time Stock Data Fetcher
[EMOJI] [EMOJI] [EMOJI] [EMOJI] (yfinance [EMOJI])
"""

import json
import random
from datetime import datetime
from typing import Dict, Optional

try:
    import yfinance as yf
    import requests
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False
    print("Warning: yfinance not installed. Using mock data only.")

# Mock stock prices for fallback
MOCK_PRICES = {
    # Korean stocks (KRW)
    '005930.KS': 71000,   # Samsung Electronics
    '000660.KS': 127000,  # SK Hynix
    '035420.KS': 185000,  # NAVER
    '035720.KS': 45000,   # Kakao
    '051910.KS': 418000,  # LG Chem
    '006400.KS': 365000,  # Samsung SDI
    '207940.KS': 845000,  # Samsung Biologics
    '005380.KS': 233000,  # Hyundai Motor
    '000270.KS': 95000,   # Kia
    '068270.KS': 180000,  # Celltrion
    
    # US stocks (USD)
    'AAPL': 180,
    'MSFT': 375,
    'GOOGL': 140,
    'AMZN': 145,
    'TSLA': 242,
    'NVDA': 495,
    'META': 325,
    'JPM': 152,
    'V': 257,
    'MA': 412,
}

DEFAULT_USD_TO_KRW = 1300.0


def get_exchange_rate() -> float:
    """
    Fetch real-time USD to KRW exchange rate
    [EMOJI] USD → KRW [EMOJI] [EMOJI]
    """
    try:
        response = requests.get('https://api.exchangerate-api.com/v4/latest/USD', timeout=3)
        if response.status_code == 200:
            data = response.json()
            krw_rate = data['rates'].get('KRW')
            if krw_rate and krw_rate > 1000:  # Sanity check
                print(f"Real-time exchange rate: 1 USD = {krw_rate:.2f} KRW")
                return krw_rate
    except Exception as e:
        print(f"Failed to fetch exchange rate: {e}")
    
    print(f"Using fallback exchange rate: 1 USD = {DEFAULT_USD_TO_KRW} KRW")
    return DEFAULT_USD_TO_KRW


def normalize_korean_symbol(symbol: str) -> str:
    """
    Normalize Korean stock symbols
    [EMOJI] [EMOJI] [EMOJI] [EMOJI]
    
    Examples:
        '005930' -> '005930.KS' (KOSPI)
        '035720' -> '035720.KS' (KOSPI)
        'AAPL' -> 'AAPL' (unchanged)
    """
    # If it's 6 digits, assume it's Korean KOSPI stock
    if symbol.isdigit() and len(symbol) == 6:
        return f"{symbol}.KS"
    return symbol


def fetch_real_time_price(symbol: str) -> Dict:
    """
    Fetch real-time stock price using yfinance
    yfinance[EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI]
    
    Args:
        symbol: Stock ticker symbol (e.g., 'AAPL', '005930.KS')
    
    Returns:
        Dictionary with stock data
    """
    try:
        # Normalize Korean symbols
        symbol = normalize_korean_symbol(symbol)
        
        # Get exchange rate
        usd_to_krw = get_exchange_rate()
        
        # Fetch data from yfinance
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period='1mo')
        
        if hist.empty:
            raise ValueError(f"No data found for {symbol}")
        
        # Get current price
        current_price = (
            info.get('regularMarketPrice') or
            info.get('currentPrice') or
            hist['Close'].iloc[-1]
        )
        
        # Get previous close
        previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else info.get('previousClose', current_price)
        
        # Check if foreign stock
        is_foreign = not (symbol.endswith('.KS') or symbol.endswith('.KQ'))
        
        # Convert USD to KRW for foreign stocks
        if is_foreign:
            current_price = current_price * usd_to_krw
            previous_close = previous_close * usd_to_krw
        
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100 if previous_close != 0 else 0
        
        # Calculate statistics
        pct_changes = hist['Close'].pct_change().dropna()
        
        # Determine exchange
        if symbol.endswith('.KS'):
            exchange = 'KOSPI'
        elif symbol.endswith('.KQ'):
            exchange = 'KOSDAQ'
        else:
            exchange = info.get('exchange', 'NASDAQ')
        
        result = {
            'success': True,
            'symbol': symbol,
            'name': info.get('longName') or info.get('shortName') or symbol,
            'currentPrice': round(float(current_price), 2),
            'change': round(float(change), 2),
            'changePercent': round(float(change_percent), 2),
            'volume': int(info.get('volume', 0)),
            'averageVolume': int(info.get('averageVolume', 0)),
            'high52Week': round(float(info.get('fiftyTwoWeekHigh', 0) * (usd_to_krw if is_foreign else 1)), 2),
            'low52Week': round(float(info.get('fiftyTwoWeekLow', 0) * (usd_to_krw if is_foreign else 1)), 2),
            'marketCap': int(info.get('marketCap', 0)) if info.get('marketCap') else 0,
            'peRatio': round(float(info.get('trailingPE', 0)), 2) if info.get('trailingPE') else 0,
            'dividendYield': round(float(info.get('dividendYield', 0)), 4) if info.get('dividendYield') else 0,
            'beta': round(float(info.get('beta', 1.0)), 2) if info.get('beta') else 1.0,
            'exchange': exchange,
            'exchangeRate': round(float(usd_to_krw), 2) if is_foreign else None,
            'marketState': info.get('marketState', 'UNKNOWN'),
            'statistics': {
                'mean': round(float(pct_changes.mean()), 4) if len(pct_changes) > 0 else 0,
                'std': round(float(pct_changes.std()), 4) if len(pct_changes) > 0 else 0,
                'min': round(float(pct_changes.min()), 4) if len(pct_changes) > 0 else 0,
                'max': round(float(pct_changes.max()), 4) if len(pct_changes) > 0 else 0,
                'median': round(float(pct_changes.median()), 4) if len(pct_changes) > 0 else 0
            },
            'timestamp': datetime.now().isoformat(),
            'dataSource': 'yfinance',
            'note': 'yfinance provides 15-20 minute delayed data'
        }
        
        print(f"[OK] Fetched real-time data for {symbol}: {current_price:.2f}")
        return result
        
    except Exception as e:
        print(f"[ERROR] Error fetching real data for {symbol}: {str(e)}")
        raise


def fetch_mock_price(symbol: str) -> Dict:
    """
    Fetch mock stock price for demo/fallback
    [EMOJI]/[EMOJI] Mock [EMOJI] [EMOJI]
    """
    symbol = normalize_korean_symbol(symbol)
    
    if symbol not in MOCK_PRICES:
        raise ValueError(f"Symbol not found in mock database: {symbol}")
    
    base_price = MOCK_PRICES[symbol]
    
    # Convert USD to KRW for foreign stocks
    is_foreign = not (symbol.endswith('.KS') or symbol.endswith('.KQ'))
    if is_foreign:
        base_price = base_price * DEFAULT_USD_TO_KRW
    
    # Add random variation (+/- 2%)
    variation = random.uniform(-0.02, 0.02)
    current_price = base_price * (1 + variation)
    previous_price = base_price
    
    change = current_price - previous_price
    change_percent = (change / previous_price) * 100
    
    # Determine exchange
    if symbol.endswith('.KS'):
        exchange = 'KOSPI'
    elif symbol.endswith('.KQ'):
        exchange = 'KOSDAQ'
    else:
        exchange = 'NASDAQ'
    
    result = {
        'success': True,
        'symbol': symbol,
        'name': symbol,
        'currentPrice': round(current_price, 2),
        'change': round(change, 2),
        'changePercent': round(change_percent, 2),
        'volume': random.randint(1000000, 10000000),
        'averageVolume': random.randint(5000000, 15000000),
        'high52Week': round(base_price * 1.2, 2),
        'low52Week': round(base_price * 0.8, 2),
        'marketCap': random.randint(1000000000, 1000000000000),
        'peRatio': round(random.uniform(10, 50), 2),
        'dividendYield': round(random.uniform(0, 0.05), 4),
        'beta': round(random.uniform(0.8, 1.5), 2),
        'exchange': exchange,
        'statistics': {
            'mean': round(random.uniform(-0.01, 0.01), 4),
            'std': round(random.uniform(0.01, 0.05), 4),
            'min': round(random.uniform(-0.1, -0.01), 4),
            'max': round(random.uniform(0.01, 0.1), 4),
            'median': round(random.uniform(-0.005, 0.005), 4)
        },
        'timestamp': datetime.now().isoformat(),
        'dataSource': 'mock'
    }
    
    print(f"[MOCK] Using mock data for {symbol}: {current_price:.2f}")
    return result


def get_stock_price(symbol: str) -> Dict:
    """
    Get stock price - tries real data first, falls back to mock
    [EMOJI] [EMOJI] - [EMOJI] [EMOJI] [EMOJI], [EMOJI] [EMOJI] Mock [EMOJI]
    """
    # Try real data first if yfinance is available
    if YFINANCE_AVAILABLE:
        try:
            return fetch_real_time_price(symbol)
        except Exception as e:
            print(f"Real data fetch failed: {e}")
            print(f"Falling back to mock data...")
    
    # Fall back to mock data
    try:
        return fetch_mock_price(symbol)
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'symbol': symbol,
            'message': 'Failed to fetch stock data'
        }


# For testing
if __name__ == '__main__':
    print("Testing stock data fetcher...\n")
    
    # Test Korean stock
    print("1. Testing Korean stock (Samsung Electronics):")
    result = get_stock_price('005930')
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    print("\n2. Testing US stock (Apple):")
    result = get_stock_price('AAPL')
    print(json.dumps(result, indent=2, ensure_ascii=False))

