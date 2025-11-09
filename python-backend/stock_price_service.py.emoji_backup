"""
Real-time stock price fetching service
실시간 주가 조회 서비스

Supports US (NYSE/NASDAQ) and Korean (KOSPI/KOSDAQ) markets
미국 (NYSE/NASDAQ) 및 한국 (KOSPI/KOSDAQ) 시장 지원
"""

import yfinance as yf
from datetime import datetime
from typing import Dict, Optional, List
import logging

logger = logging.getLogger(__name__)


class StockPriceService:
    """
    Fetches real-time stock prices using yfinance
    yfinance를 사용한 실시간 주가 조회
    
    Handles both US and Korean markets automatically
    미국 및 한국 시장 자동 처리
    """
    
    @staticmethod
    def get_stock_info(symbol: str) -> Optional[Dict]:
        """
        Fetch comprehensive stock information
        종합 주식 정보 조회
        
        Args:
            symbol: Stock symbol (e.g., "AAPL", "005930.KS")
                   주식 심볼 (예: "AAPL", "005930.KS")
            
        Returns:
            Dictionary with stock info or None if failed
            주식 정보 딕셔너리 또는 실패 시 None
            
            {
                "symbol": "AAPL",
                "name": "Apple Inc.",
                "currentPrice": 178.50,
                "currency": "USD",
                "market": "NASDAQ",
                "changePercent": "+2.5",
                "changeAmount": 4.35,
                "previousClose": 174.15,
                "lastUpdated": "2024-01-15T16:00:00",
                "volume": 52847392,
                "marketCap": 2780000000000
            }
        """
        try:
            # Normalize Korean symbols (6-digit codes)
            symbol = StockPriceService._normalize_symbol(symbol)
            
            # Create Ticker object
            ticker = yf.Ticker(symbol)
            
            # Fetch real-time info
            info = ticker.info
            
            # Get latest price (try multiple fields for reliability)
            current_price = (
                info.get('currentPrice') or
                info.get('regularMarketPrice') or
                info.get('previousClose')
            )
            
            if current_price is None:
                logger.error(f"No price data for {symbol}")
                return None
            
            # Detect market and currency
            market = StockPriceService._detect_market(symbol, info)
            currency = StockPriceService._detect_currency(market)
            
            # Calculate price change
            previous_close = info.get('previousClose', current_price)
            change_amount = current_price - previous_close
            change_percent = (change_amount / previous_close * 100) if previous_close else 0
            
            return {
                "symbol": symbol,
                "name": info.get('longName') or info.get('shortName') or symbol,
                "currentPrice": float(current_price),
                "currency": currency,
                "market": market,
                "changePercent": f"{change_percent:+.2f}",  # "+2.50" format
                "changeAmount": float(change_amount),
                "previousClose": float(previous_close),
                "lastUpdated": datetime.now().isoformat(),
                "volume": int(info.get('volume', 0)),
                "marketCap": int(info.get('marketCap', 0)) if info.get('marketCap') else 0
            }
            
        except Exception as e:
            logger.error(f"Error fetching {symbol}: {str(e)}")
            return None
    
    @staticmethod
    def _normalize_symbol(symbol: str) -> str:
        """
        Normalize Korean stock symbols
        한국 주식 심볼 정규화
        
        Examples:
            '005930' -> '005930.KS'
            '035720' -> '035720.KS'
            'AAPL' -> 'AAPL' (unchanged)
        """
        # If it's 6 digits, assume it's Korean KOSPI stock
        if symbol.isdigit() and len(symbol) == 6:
            return f"{symbol}.KS"
        return symbol
    
    @staticmethod
    def _detect_market(symbol: str, info: Dict) -> str:
        """
        Detect market from symbol and info
        심볼과 정보에서 시장 감지
        """
        if symbol.endswith('.KS'):
            return 'KOSPI'
        elif symbol.endswith('.KQ'):
            return 'KOSDAQ'
        else:
            exchange = info.get('exchange', '')
            if 'NASDAQ' in exchange.upper():
                return 'NASDAQ'
            elif 'NYSE' in exchange.upper():
                return 'NYSE'
            return 'NYSE/NASDAQ'
    
    @staticmethod
    def _detect_currency(market: str) -> str:
        """
        Detect currency from market
        시장에서 통화 감지
        """
        if 'KOS' in market:
            return 'KRW'
        return 'USD'
    
    @staticmethod
    def get_batch_prices(symbols: List[str]) -> Dict[str, Dict]:
        """
        Fetch prices for multiple stocks (optimized)
        여러 주식의 가격 조회 (최적화)
        
        Args:
            symbols: List of stock symbols
                    주식 심볼 리스트
            
        Returns:
            Dictionary mapping symbol to price info
            심볼을 가격 정보로 매핑하는 딕셔너리
        """
        results = {}
        
        for symbol in symbols:
            info = StockPriceService.get_stock_info(symbol)
            if info:
                results[symbol] = info
        
        return results


# Flask API endpoint integration
def create_price_endpoints(app):
    """
    Add stock price endpoints to existing Flask app
    기존 Flask 앱에 주가 엔드포인트 추가
    
    Usage in app.py:
        from stock_price_service import create_price_endpoints
        create_price_endpoints(app)
    """
    from flask import jsonify, request
    
    @app.route('/api/stock/price/<symbol>', methods=['GET'])
    def get_stock_price(symbol):
        """
        GET /api/stock/price/AAPL
        GET /api/stock/price/005930.KS
        
        Returns:
            {
                "success": true,
                "data": {
                    "symbol": "AAPL",
                    "name": "Apple Inc.",
                    "currentPrice": 178.50,
                    "currency": "USD",
                    "market": "NASDAQ",
                    ...
                }
            }
        """
        info = StockPriceService.get_stock_info(symbol)
        
        if info:
            return jsonify({
                "success": True,
                "data": info
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": f"Failed to fetch price for {symbol}"
            }), 404
    
    @app.route('/api/stock/prices', methods=['POST'])
    def get_batch_prices():
        """
        POST /api/stock/prices
        Body: {"symbols": ["AAPL", "005930.KS", "GOOGL"]}
        
        Returns:
            {
                "success": true,
                "data": {
                    "AAPL": {...},
                    "005930.KS": {...},
                    "GOOGL": {...}
                }
            }
        """
        data = request.json
        symbols = data.get('symbols', [])
        
        if not symbols:
            return jsonify({
                "success": False,
                "error": "No symbols provided"
            }), 400
        
        results = StockPriceService.get_batch_prices(symbols)
        
        return jsonify({
            "success": True,
            "data": results
        }), 200

