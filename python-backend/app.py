# -*- coding: utf-8 -*-
"""
QuantaFolio Navigator - Flask Quantum Service
Complete Windows cp949 compatibility solution
"""

import sys
import io
import os
import warnings

# ================================
# CRITICAL: Windows cp949 
# ================================

# 
os.environ['PYTHONIOENCODING'] = 'utf-8'
os.environ['PYTHONUTF8'] = '1'

# / UTF-8 ( )
if sys.platform == 'win32':
 sys.stdout = io.TextIOWrapper(
 sys.stdout.buffer, 
 encoding='utf-8', 
 errors='replace', # '?' 
 line_buffering=True
 )
 sys.stderr = io.TextIOWrapper(
 sys.stderr.buffer, 
 encoding='utf-8', 
 errors='replace',
 line_buffering=True
 )

# ( )
warnings.filterwarnings('ignore')

# UTF-8 
import logging
logging.basicConfig(
 level=logging.INFO,
 format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
 handlers=[
 logging.StreamHandler(sys.stdout)
 ]
)

print("[INFO] UTF-8 encoding forcefully enabled (errors='replace')")
print("[INFO] All non-UTF-8 characters will be replaced with '?'")

# ================================
# import
# ================================

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from optimizer import optimize_portfolio, PortfolioOptimizer
from chatbot import chat
from stock_data import get_stock_price
from stock_price_service import StockPriceService, create_price_endpoints
from workflow_engine import (
 workflow_engine, 
 create_portfolio_agent,
 WorkflowState
)
import traceback
import yfinance as yf
import requests
import uuid
import urllib.parse
import json
from pathlib import Path

# ================================
# JSON 데이터 로더
# ================================

def load_korean_stocks():
    """한국 주식 데이터 JSON 파일 로드"""
    data_dir = Path(__file__).parent / 'data'
    json_file = data_dir / 'korean_stocks.json'
    
    if not json_file.exists():
        logger.warning(f"Korean stocks JSON file not found: {json_file}, using fallback")
        return {}
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # JSON 배열을 딕셔너리로 변환: {ticker: (name_en, name_ko)}
        korean_stocks = {}
        for stock in data:
            ticker = stock.get('ticker', '')
            name_en = stock.get('name_en', '')
            name_ko = stock.get('name_ko', '')
            if ticker:
                korean_stocks[ticker] = (name_en, name_ko)
        
        logger.info(f"Loaded {len(korean_stocks)} Korean stocks from JSON")
        return korean_stocks
    except Exception as e:
        logger.error(f"Failed to load Korean stocks JSON: {e}")
        return {}

def load_us_stocks():
    """미국 주식/ETF 데이터 JSON 파일 로드"""
    data_dir = Path(__file__).parent / 'data'
    json_file = data_dir / 'us_stocks.json'
    
    if not json_file.exists():
        logger.warning(f"US stocks JSON file not found: {json_file}, using fallback")
        return {}
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # JSON 배열을 딕셔너리로 변환: {symbol: name}
        us_stocks = {}
        for stock in data:
            symbol = stock.get('symbol', '')
            name = stock.get('name', '')
            if symbol:
                us_stocks[symbol] = name
        
        logger.info(f"Loaded {len(us_stocks)} US stocks/ETFs from JSON")
        return us_stocks
    except Exception as e:
        logger.error(f"Failed to load US stocks JSON: {e}")
        return {}

# ================================
# ================================
# Windows cp949 ? ?ы
# ================================

def remove_emojis(text):
    """
    ???? ? (Windows cp949 ?)
    """
    import re
    # ?ш? ? ?⑦
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  #  ?
        "\U0001F300-\U0001F5FF"  # ?щ & ?
        "\U0001F680-\U0001F6FF"  #  & ??
        "\U0001F1E0-\U0001F1FF"  # ?
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"  # ? ?щ
        "\U0001FA00-\U0001FAFF"  # ? ?щ
        "\U00002600-\U000026FF"  # ? ?щ
        "\U00002700-\U000027BF"  # Dingbats
        "]+",
        flags=re.UNICODE
    )
    return emoji_pattern.sub(r'', text)

def safe_encode_error(error_msg):
    """? ? ?? ? ??? ?"""
    return remove_emojis(str(error_msg))

# ( )

# 커스텀 로거 핸들러 (이모지 제거) - UTF-8 강제 설정 후에도 안전장치
class SafeLoggingHandler(logging.StreamHandler):
    def emit(self, record):
        try:
            # 메시지에서 이모지 제거
            if hasattr(record, 'msg') and isinstance(record.msg, str):
                record.msg = remove_emojis(record.msg)
            if hasattr(record, 'args') and record.args:
                # args 튜플 처리
                safe_args = tuple(remove_emojis(str(arg)) if isinstance(arg, str) else arg for arg in record.args)
                record.args = safe_args
            super().emit(record)
        except (UnicodeEncodeError, UnicodeDecodeError):
            # 인코딩 오류 발생 시 안전하게 처리
            try:
                record.msg = str(record.msg).encode('ascii', 'ignore').decode('ascii')
                super().emit(record)
            except:
                pass  # 최후의 수단: 로그 출력 건너뛰기

logger = logging.getLogger(__name__)
# 기존 핸들러 제거 후 안전한 핸들러 추가
for handler in logger.handlers[:]:
    logger.removeHandler(handler)
logger.addHandler(SafeLoggingHandler())
logger.setLevel(logging.INFO)

# Alpha Vantage API Key - Load from environment variable for security
ALPHA_VANTAGE_KEY = os.getenv('ALPHA_VANTAGE_API_KEY', '')
if not ALPHA_VANTAGE_KEY:
 logger.warning("ALPHA_VANTAGE_API_KEY not set in environment. Stock search may be limited.")

app = Flask(__name__, static_folder='static')
CORS(app) # CORS ( )

# ================================
# JSON (after_request )
# ================================
@app.after_request
def clean_response(response):
    """모든 JSON 응답에서 이모지 자동 제거"""
    if response.content_type and 'application/json' in response.content_type:
        try:
            import json
            data = json.loads(response.get_data(as_text=True))
            # 이모지 제거
            def clean_dict(obj):
                if isinstance(obj, dict):
                    return {k: clean_dict(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [clean_dict(item) for item in obj]
                elif isinstance(obj, str):
                    return remove_emojis(obj)
                else:
                    return obj
            
            cleaned_data = clean_dict(data)
            response.set_data(json.dumps(cleaned_data, ensure_ascii=True))
        except:
            # JSON 파싱 실패 시 원본 응답 반환
            pass
    return response

# ================================
# Windows cp949 
# ================================

def remove_emojis(text):
 """
 (Windows cp949 )
 () - \U0001f4e6 () 
 """
 import re
 # ( )
 emoji_pattern = re.compile(
 "["
 "\U0001F600-\U0001F64F" # 
 "\U0001F300-\U0001F5FF" # & 
 "\U0001F680-\U0001F6FF" # & 
 "\U0001F1E0-\U0001F1FF" # 
 "\U00002702-\U000027B0"
 "\U000024C2-\U0001F251"
 "\U0001F900-\U0001F9FF" # ( )
 "\U0001FA00-\U0001FAFF" # 
 "\U00002600-\U000026FF" # 
 "\U00002700-\U000027BF" # Dingbats
 "]+",
 flags=re.UNICODE
 )
 return emoji_pattern.sub(r'', text)

def safe_encode_error(error_msg):
 """"""
 return remove_emojis(str(error_msg))

def safe_json_response(data, status_code=200):
    """
    Windows cp949 환경에서 안전한 JSON 응답
    
    Args:
        data (dict): 응답 데이터
        status_code (int): HTTP 상태 코드
        
    Returns:
        Response: Flask 응답 객체
    """
    import json
    # 모든 문자열 값에서 이모지 제거
    def clean_dict(obj):
        if isinstance(obj, dict):
            return {k: clean_dict(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [clean_dict(item) for item in obj]
        elif isinstance(obj, str):
            return remove_emojis(obj)
        else:
            return obj
    
    cleaned_data = clean_dict(data)
    
    # ensure_ascii=True로 안전한 JSON 생성
    response = app.response_class(
        response=json.dumps(cleaned_data, ensure_ascii=True),
        status=status_code,
        mimetype='application/json'
    )
    return response


@app.route('/')
def home():
 """"""
 return jsonify({
 'message': 'ToAndFrom Portfolio Optimization API',
 'version': '1.0.0',
 'endpoints': {
 '/api/optimize': 'POST - ',
 '/api/health': 'GET - ',
 '/test': 'GET - '
 }
 })


@app.route('/test')
def test_page():
 """"""
 return send_from_directory(app.static_folder, 'test.html')


@app.route('/api/health', methods=['GET'])
def health():
 """"""
 return jsonify({
 'status': 'healthy',
 'service': 'ToAndFrom Portfolio Optimizer'
 })


@app.route('/api/optimize', methods=['POST'])
@app.route('/api/portfolio/optimize', methods=['POST'])  # Spring Boot 호환성
def optimize():
    """
    포트폴리오 최적화 API
 
    Request Body (JSON):
    {
        "tickers": ["AAPL", "GOOGL", "MSFT"],
        "risk_factor": 0.5,  # 0.0 ~ 1.0 (기본값: 0.5)
        "method": "classical",  # "classical" 또는 "quantum" (기본값: "classical")
        "period": "1y",  # "1y", "6mo", "3mo" (기본값: "1y")
        "reps": 1  # QAOA reps (기본값: 1)
    }
 
    Response:
    {
        "success": true,
        "result": {
            "selected_tickers": ["AAPL", "GOOGL"],
            "weights": [0.5, 0.5],
            "expected_return": 0.15,
            "risk": 0.20,
            "sharpe_ratio": 0.75,
            "method": "classical"
        }
    }
    """
    try:
        data = request.get_json()
        
        # 필수 파라미터 확인
        if not data or 'tickers' not in data:
            return jsonify({
                'success': False,
                'error': 'tickers 필드가 필요합니다.'
            }), 400
        
        tickers = data['tickers']
        
        if not isinstance(tickers, list) or len(tickers) == 0:
            return jsonify({
                'success': False,
                'error': 'tickers는 비어있지 않은 리스트여야 합니다.'
            }), 400
        
        # 선택적 파라미터
        risk_factor = data.get('risk_factor', 0.5)
        method = data.get('method', 'classical')
        period = data.get('period', '1y')
        # QAOA 회로 깊이 (reps)
        reps = data.get('reps', 1)  # 기본값: 1 (개발/테스트), 프로덕션: 2 추천
        precision = data.get('precision', 4)  # Weight precision in bits per asset
        
        # 유효성 검사
        if not 0.0 <= risk_factor <= 1.0:
            return jsonify({
                'success': False,
                'error': 'risk_factor는 0.0과 1.0 사이여야 합니다.'
            }), 400
        
        if method not in ['classical', 'quantum']:
            return jsonify({
                'success': False,
                'error': 'method는 "classical" 또는 "quantum"이어야 합니다.'
            }), 400
        
        logger.info(f"포트폴리오 최적화 요청: tickers={tickers}, method={method}, risk={risk_factor}")
        
        # 최적화 실행
        if method == 'quantum':
            result = optimize_portfolio(
                tickers=tickers,
                risk_factor=risk_factor,
                method=method,
                period=period,
                reps=reps,
                precision=precision
            )
        else:
            result = optimize_portfolio(
                tickers=tickers,
                risk_factor=risk_factor,
                method=method,
                period=period
            )
        
        logger.info(f"최적화 완료: {result['selected_tickers']}")
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except ValueError as e:
        logger.error(f"값 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        error_msg = safe_encode_error(str(e))
        # Traceback도 안전하게 처리
        try:
            tb_str = traceback.format_exc()
            safe_tb = safe_encode_error(tb_str)
            logger.error(f"서버 오류: {error_msg}\n{safe_tb}")
        except:
            logger.error(f"서버 오류: {error_msg}")
        return jsonify({
            'success': False,
            'error': f'서버 오류가 발생했습니다: {error_msg}'
        }), 500


@app.route('/api/optimize/with-weights', methods=['POST'])
@app.route('/api/portfolio/optimize/with-weights', methods=['POST'])  # Spring Boot 호환성
def optimize_with_weights():
    """
    기존 포트폴리오 비중을 받아서 최적화하는 API
 
 Request Body (JSON):
 {
 "tickers": ["AAPL", "GOOGL", "MSFT"],
 "initial_weights": [0.4, 0.4, 0.2], # (1.0)
 "risk_factor": 0.5, # 0.0 ~ 1.0 (, : 0.5)
 "method": "quantum", # "classical" "quantum" (, : "quantum")
 "period": "1y", # "1y", "6mo", "3mo" (, : "1y")
 "reps": 1 # reps (, : 1)
 }
 
 Response:
 {
 "success": true,
 "result": {
 "original": {
 "tickers": ["AAPL", "GOOGL", "MSFT"],
 "weights": [0.4, 0.4, 0.2],
 "expected_return": 0.15,
 "risk": 0.20,
 "sharpe_ratio": 0.75
 },
 "optimized": {
 "tickers": ["AAPL", "GOOGL", "MSFT"],
 "weights": [0.5, 0.3, 0.2],
 "expected_return": 0.16,
 "risk": 0.21,
 "sharpe_ratio": 0.76
 },
 "improvements": {
 "return_improvement": 6.67,
 "risk_change": 5.00,
 "sharpe_improvement": 1.33
 },
 "method": "quantum"
 }
 }
    """
    try:
        data = request.get_json()
        
        # 디버깅: JSON payload 확인 (이모지 제거)
        try:
            debug_msg = f"[DEBUG] Received: {data}"
            safe_debug = remove_emojis(debug_msg)
            print(safe_debug)
        except (UnicodeEncodeError, UnicodeDecodeError):
            # Windows cp949 환경에서 안전하게 출력
            print(f"[DEBUG] Received data (length: {len(str(data))})")
        if data and 'tickers' in data and 'initial_weights' in data:
            try:
                tickers_info = f" -> tickers: {data['tickers']} (count: {len(data['tickers'])})"
                weights_info = f" -> initial_weights: (count: {len(data['initial_weights']) if isinstance(data['initial_weights'], list) else 'N/A'})"
                print(remove_emojis(tickers_info))
                print(remove_emojis(weights_info))
            except (UnicodeEncodeError, UnicodeDecodeError):
                print(f" -> tickers count: {len(data['tickers'])}")
                print(f" -> weights count: {len(data['initial_weights']) if isinstance(data['initial_weights'], list) else 'N/A'}")
        
        # 필수 파라미터 확인
        if not data or 'tickers' not in data:
            return jsonify({
                'success': False,
                'error': 'tickers 필드가 필요합니다.'
            }), 400

        if 'initial_weights' not in data:
            return jsonify({
                'success': False,
                'error': 'initial_weights 필드가 필요합니다.'
            }), 400

        tickers = data['tickers']
        initial_weights = data['initial_weights']

        if not isinstance(tickers, list) or len(tickers) == 0:
            return jsonify({
                'success': False,
                'error': 'tickers는 비어있지 않은 리스트여야 합니다.'
            }), 400

        # initial_weights는 tickers와 정확히 같은 길이여야 함
        if not isinstance(initial_weights, list) or len(initial_weights) != len(tickers):
            return jsonify({
                'success': False,
                'error': f'initial_weights의 개수는 tickers와 일치해야 합니다. (tickers: {len(tickers)}개, weights: {len(initial_weights) if isinstance(initial_weights, list) else 0}개)'
            }), 400

        # 선택적 파라미터
        risk_factor = data.get('risk_factor', 0.5)
        method = data.get('method', 'quantum')
        period = data.get('period', '1y')
        # QAOA 회로 깊이 (reps)
        reps = data.get('reps', 1)  # 기본값: 1 (개발/테스트), 프로덕션: 2 추천
        precision = data.get('precision', 4)  # Weight precision in bits per asset

        # 유효성 검사
        if not 0.0 <= risk_factor <= 1.0:
            return jsonify({
                'success': False,
                'error': 'risk_factor는 0.0과 1.0 사이여야 합니다.'
            }), 400

        if method not in ['classical', 'quantum']:
            return jsonify({
                'success': False,
                'error': 'method는 "classical" 또는 "quantum"이어야 합니다.'
            }), 400

        weight_sum = sum(initial_weights)
        if abs(weight_sum - 1.0) > 0.01:
            return jsonify({
                'success': False,
                'error': f'initial_weights의 합이 1.0이어야 합니다. 현재: {weight_sum:.4f}'
            }), 400

        logger.info(f"포트폴리오 비중 최적화 요청: tickers={tickers}, method={method}, risk={risk_factor}")

        # 최적화 실행
        # Fast mode 설정 (reps=1, maxiter=50) - 빠른 테스트용
        fast_mode = data.get('fast_mode', True)  # 기본값: True (빠른 응답)
        
        optimizer = PortfolioOptimizer(
            tickers=tickers,
            risk_factor=risk_factor,
            initial_weights=initial_weights,
            fast_mode=fast_mode
        )
        optimizer.fetch_data(period=period)
        
        # Only quantum optimization is supported
        if method != 'quantum':
            return jsonify({
                'success': False,
                'error': 'Only quantum optimization is supported.'
            }), 400
        
        result = optimizer.optimize_with_weights(method='quantum', reps=reps, precision=precision)
        
        logger.info(f"최적화 완료: 수익률 개선 {result['improvements']['return_improvement']:.2f}%")
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except ValueError as e:
        error_msg = safe_encode_error(str(e))
        logger.error(f"값 오류: {error_msg}")
        return jsonify({
            'success': False,
            'error': error_msg
        }), 400
        
    except Exception as e:
        error_msg = safe_encode_error(str(e))
        # Traceback도 안전하게 처리
        try:
            tb_str = traceback.format_exc()
            safe_tb = safe_encode_error(tb_str)
            logger.error(f"서버 오류: {error_msg}\n{safe_tb}")
        except:
            logger.error(f"서버 오류: {error_msg}")
        return jsonify({
            'success': False,
            'error': f'서버 오류가 발생했습니다: {error_msg}'
        }), 500


@app.route('/api/optimize/batch', methods=['POST'])
def optimize_batch():
    """
    배치 포트폴리오 최적화 API
    
    Request Body (JSON):
    {
        "portfolios": [
            {
                "tickers": ["AAPL", "GOOGL"],
                "risk_factor": 0.5,
                "method": "classical"
            },
            {
                "tickers": ["MSFT", "AMZN"],
                "risk_factor": 0.7,
                "method": "quantum"
            }
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'portfolios' not in data:
            return jsonify({
                'success': False,
                'error': 'portfolios 필드가 필요합니다.'
            }), 400
        
        portfolios = data['portfolios']
        results = []
        
        for i, portfolio in enumerate(portfolios):
            try:
                tickers = portfolio.get('tickers', [])
                risk_factor = portfolio.get('risk_factor', 0.5)
                method = portfolio.get('method', 'classical')
                period = portfolio.get('period', '1y')
                reps = portfolio.get('reps', 1)
                
                if method == 'quantum':
                    result = optimize_portfolio(
                        tickers=tickers,
                        risk_factor=risk_factor,
                        method=method,
                        period=period,
                        reps=reps
                    )
                else:
                    result = optimize_portfolio(
                        tickers=tickers,
                        risk_factor=risk_factor,
                        method=method,
                        period=period
                    )
                
                results.append({
                    'success': True,
                    'portfolio_index': i,
                    'result': result
                })
                
            except Exception as e:
                results.append({
                    'success': False,
                    'portfolio_index': i,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        error_msg = safe_encode_error(str(e))
        logger.error(f"배치 최적화 오류: {error_msg}")
        return jsonify({
            'success': False,
            'error': f'서버 오류가 발생했습니다: {error_msg}'
        }), 500


@app.route('/api/optimize/workflow', methods=['POST'])
def optimize_with_workflow():
    """
    AI Agent 워크플로우를 통한 포트폴리오 최적화
    
    Flow:
    1. Form Submission -> 2. AI Agent -> 3. Optimization ->
    4. Risk Analysis -> 5. Conditional Branching -> 6. Action
    
    Request Body (JSON):
    {
        "tickers": ["AAPL", "GOOGL", "MSFT"],
        "initial_weights": [0.4, 0.3, 0.3],  # optional
        "risk_factor": 0.5,
        "method": "quantum",
        "period": "1y"
    }
    
    Response:
    {
        "success": true,
        "workflow_id": "wf_123abc",
        "optimization_result": {...},
        "risk_analysis": {
            "risk_level": "low|medium|high",
            "volatility_percentage": 15.2,
            "recommendation": "...",
            "sharpe_ratio": 0.85
        },
        "action_taken": "alert_manager|notify_user|auto_approve",
        "action_result": {...},
        "workflow_steps": [...]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'tickers' not in data:
            return jsonify({
                'success': False,
                'error': 'tickers 필드가 필요합니다.'
            }), 400
        
        # Generate workflow ID
        workflow_id = f"wf_{uuid.uuid4().hex[:8]}"
        
        # Create AI Agent
        agent = create_portfolio_agent()
        
        # Create workflow
        workflow_engine.create_workflow(workflow_id, agent)
        
        logger.info(f"Created workflow: {workflow_id}")
        
        # Prepare optimization function
        def run_optimization(tickers, initial_weights, risk_factor, method, period, fast_mode=True):
            """
            Optimization wrapper for workflow
            
            Args:
                tickers (list): 주식 티커 리스트
                initial_weights (list): 초기 가중치 리스트
                risk_factor (float): 리스크 팩터
                method (str): 최적화 방법
                period (str): 기간
                fast_mode (bool): 빠른 모드 (기본값: True)
            """
            # Safe check: avoid NumPy array boolean evaluation
            if initial_weights is not None and len(initial_weights) > 0:
                # With weights
                optimizer = PortfolioOptimizer(
                    tickers=tickers,
                    risk_factor=risk_factor,
                    initial_weights=initial_weights,
                    fast_mode=fast_mode
                )
                optimizer.fetch_data(period=period)
                return optimizer.optimize_with_weights(method=method)
            else:
                # Without weights
                optimizer = PortfolioOptimizer(
                    tickers=tickers,
                    risk_factor=risk_factor,
                    fast_mode=fast_mode
                )
                optimizer.fetch_data(period=period)
                return optimizer.optimize(method=method)
        
        # Execute workflow
        result = workflow_engine.execute_workflow(
            workflow_id=workflow_id,
            input_data=data,
            optimization_func=run_optimization
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 500
        
    except Exception as e:
        error_msg = safe_encode_error(str(e))
        # Traceback도 안전하게 처리
        try:
            tb_str = traceback.format_exc()
            safe_tb = safe_encode_error(tb_str)
            logger.error(f"워크플로우 오류: {error_msg}\n{safe_tb}")
        except:
            logger.error(f"워크플로우 오류: {error_msg}")
        return jsonify({
            'success': False,
            'error': f'서버 오류가 발생했습니다: {error_msg}'
        }), 500


@app.route('/api/workflow/<workflow_id>/status', methods=['GET'])
def get_workflow_status(workflow_id):
    """
    워크플로우 상태 조회 API
    
    Response:
 {
 "id": "wf_123abc",
 "status": "completed|processing|failed",
 "created_at": "2025-11-07T...",
 "steps": [...]
 }
    """
    try:
        status = workflow_engine.get_workflow_status(workflow_id)
        
        if 'error' in status:
            return jsonify(status), 404
        
        return jsonify(status)
        
    except Exception as e:
        error_msg = safe_encode_error(str(e))
        logger.error(f"워크플로우 상태 조회 오류: {error_msg}")
        return jsonify({
            'error': f'서버 오류가 발생했습니다: {error_msg}'
        }), 500


@app.route('/api/chatbot/chat', methods=['POST'])
def chatbot_chat():
    """
    챗봇 API
    
    Request Body (JSON):
    {
        "message": "포트폴리오 최적화에 대해 알려주세요",
        "history": [],  # 대화 기록
        "language": "ko"  # 언어 설정 (기본값: "ko")
    }
    
    Response:
    {
        "success": true,
        "response": "...",
        "language": "ko"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': 'message 필드가 필요합니다.'
            }), 400
        
        message = data['message']
        history = data.get('history', [])
        language = data.get('language', 'ko')
        
        result = chat(message, history, language)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 500
        
    except Exception as e:
        error_msg = safe_encode_error(str(e))
        # Traceback도 안전하게 처리
        try:
            tb_str = traceback.format_exc()
            safe_tb = safe_encode_error(tb_str)
            logger.error(f"챗봇 오류: {error_msg}\n{safe_tb}")
        except:
            logger.error(f"챗봇 오류: {error_msg}")
        return jsonify({
            'success': False,
            'error': f'서버 오류가 발생했습니다: {error_msg}'
        }), 500


@app.route('/api/stock/price/<symbol>', methods=['GET'])
@app.route('/api/portfolio/stock/price/<symbol>', methods=['GET'])  # Spring Boot 호환성
def get_stock_price_endpoint(symbol):
    """
    실시간 주가 조회 API (StockPriceService 사용)
 
 URL Parameter:
 symbol: (: 'AAPL', '005930', '005930.KS')
 
 Response:
 {
 "success": true,
 "data": {
 "symbol": "005930.KS",
 "name": "Samsung Electronics",
 "currentPrice": 71000,
 "currency": "KRW",
 "market": "KOSPI",
 "changePercent": "+1.50",
 "changeAmount": 1050,
 "previousClose": 69950,
 "volume": 12345678,
 "lastUpdated": "2025-01-27T10:30:00"
 }
    }
    """
    try:
        logger.info(f"주가 조회 요청: {symbol}")
        
        # Use new StockPriceService
        info = StockPriceService.get_stock_info(symbol)
        
        if info:
            return jsonify({
                "success": True,
                "data": info
            }), 200
        else:
            # Fallback to old method if new service fails
            logger.warning(f"StockPriceService failed for {symbol}, falling back to stock_data")
            result = get_stock_price(symbol)
            
            if result.get('success'):
                return jsonify(result)
            else:
                return jsonify({
                    "success": False,
                    "error": f"Failed to fetch price for {symbol}"
                }), 404
        
    except Exception as e:
        error_msg = safe_encode_error(str(e))
        # Traceback도 안전하게 처리
        try:
            tb_str = traceback.format_exc()
            safe_tb = safe_encode_error(tb_str)
            logger.error(f"주가 조회 오류: {error_msg}\n{safe_tb}")
        except:
            logger.error(f"주가 조회 오류: {error_msg}")
        return jsonify({
            'success': False,
            'error': f'서버 오류가 발생했습니다: {error_msg}'
        }), 500


@app.route('/api/stock/prices', methods=['POST'])
def get_batch_prices_endpoint():
    """
    배치 주가 조회 API
    
    Request Body:
    {
        "symbols": ["AAPL", "005930.KS", "GOOGL"]
    }
    
    Response:
 {
 "success": true,
 "data": {
 "AAPL": {
 "symbol": "AAPL",
 "name": "Apple Inc.",
 "currentPrice": 178.50,
 ...
 },
 "005930.KS": {
 "symbol": "005930.KS",
 "name": "Samsung Electronics",
 "currentPrice": 71000,
 ...
 }
    }
    }
    """
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        
        if not symbols:
            return jsonify({
                "success": False,
                "error": "No symbols provided"
            }), 400
        
        logger.info(f"배치 주가 조회 요청: {len(symbols)}개 심볼")
        
        results = StockPriceService.get_batch_prices(symbols)
        
        return jsonify({
            "success": True,
            "data": results
        }), 200
        
    except Exception as e:
        error_msg = safe_encode_error(str(e))
        # Traceback도 안전하게 처리
        try:
            tb_str = traceback.format_exc()
            safe_tb = safe_encode_error(tb_str)
            logger.error(f"배치 주가 조회 오류: {error_msg}\n{safe_tb}")
        except:
            logger.error(f"배치 주가 조회 오류: {error_msg}")
        return jsonify({
            'success': False,
            'error': f'서버 오류가 발생했습니다: {error_msg}'
        }), 500


@app.route('/api/stocks/search', methods=['GET'])
@app.route('/api/portfolio/stock/search', methods=['GET'])  # Spring Boot 호환성
def search_stocks_advanced():
    """
    주식 검색 API (한국 + 미국 + ETF)
    
    검색 폴백 순서:
    1. 로컬 DB 검색 (한국 주식 80개+, 미국 주식 60개+, ETF 30개)
    2. Alpha Vantage API 검색 (모든 미국 주식/ETF, 타임아웃 10초)
    3. yfinance Fallback
       - 한국 주식: 6자리 코드 자동 인식 → .KS/.KQ 자동 추가
       - 미국 주식: 심볼만으로 조회
 
    Query Parameters:
        q: 검색어 (티커 코드, 영문명, 한글명)
 
    Response:
        [
            {
                "ticker": "005930.KS",
                "name": "삼성전자",
                "exchange": "KRX",
                "source": "local" | "alphavantage" | "yfinance"
            },
            ...
        ]
    """
    try:
        # 원본 쿼리 유지 (한글 검색 지원)
        query_original = request.args.get('q', '').strip()
        query_upper = query_original.upper()  # 대문자 변환은 검색에만 사용
        
        if not query_original or len(query_original) < 1:
            return jsonify([])
        
        results = []
        
        # 한국 주식 검색 (한글 이름 포함) - JSON 파일에서 로드
        korean_stocks = load_korean_stocks()
        
        # JSON 파일이 없거나 비어있으면 fallback 데이터 사용
        if not korean_stocks:
            logger.warning("Using fallback Korean stocks data")
            korean_stocks = {
                # 대형주 (Large Cap)
                '005930': ('Samsung Electronics', '삼성전자'),
            '000660': ('SK Hynix', 'SK하이닉스'),
            '035420': ('NAVER', '네이버'),
            '035720': ('Kakao', '카카오'),
            '051910': ('LG Chem', 'LG화학'),
            '006400': ('Samsung SDI', '삼성SDI'),
            '005380': ('Hyundai Motor', '현대자동차'),
            '012330': ('Hyundai Mobis', '현대모비스'),
            '028260': ('Samsung C&T', '삼성물산'),
            '000270': ('Kia Corporation', '기아'),
            '005490': ('POSCO Holdings', 'POSCO홀딩스'),
            '003550': ('LG', 'LG'),
            '034730': ('SK', 'SK'),
            
            # 제약/바이오 (Pharma/Bio)
            '207940': ('Samsung Biologics', '삼성바이오로직스'),
            '326030': ('SK Biopharmaceuticals', 'SK바이오팜'),
            '128940': ('Han Mi Pharm', '한미약품'),
            '214450': ('Celltrion Healthcare', '셀트리온헬스케어'),
            '068270': ('Celltrion', '셀트리온'),
            '251270': ('Netmarble', '넷마블'),
            '067280': ('Merck Korea', '멕크론코리아'),
            '003670': ('Posco Future M', '포스코퓨처엠'),
            
            # IT/게임 (Tech/Gaming)
            '036570': ('NCsoft', '엔씨소프트'),
            '259960': ('Krafton', '크래프톤'),
            '018260': ('Samsung SDS', '삼성SDS'),
            '035900': ('JYP Entertainment', 'JYP엔터테인먼트'),
            '035760': ('CJ ENM', 'CJ ENM'),
            '011200': ('HMM', 'HMM'),
            '028300': ('HLB', 'HLB'),
            '006260': ('LS', 'LS'),
            
            # 금융 (Finance)
            '086790': ('Hana Financial Group', '하나금융지주'),
            '105560': ('KB Financial Group', 'KB금융'),
            '055550': ('Shinhan Financial Group', '신한지주'),
            '032830': ('Samsung Life Insurance', '삼성생명'),
            '018880': ('Samsung Securities', '삼성증권'),
            '006360': ('GS', 'GS'),
            '000120': ('CJ', 'CJ'),
            '000150': ('Doosan', '두산'),
            
            # 통신 (Telecom)
            '017670': ('SK Telecom', 'SK텔레콤'),
            '030200': ('KT', 'KT'),
            '032640': ('LG Uplus', 'LG유플러스'),
            
            # 에너지/화학 (Energy/Chemical)
            '010950': ('S-Oil', 'S-Oil'),
            '009540': ('Korea Gas', '한국가스공사'),
            '096770': ('SK Innovation', 'SK이노베이션'),
            '010130': ('Korea Zinc', '한국아연'),
            '015760': ('Korea Electric Power', '한국전력'),
            '011780': ('Korea Gas Corporation', '한국가스공사'),
            '002380': ('KCC', 'KCC'),
            '003230': ('Samyang Holdings', '삼양홀딩스'),
            
            # 자동차/부품 (Auto/Parts)
            '161390': ('Hanon Systems', '한온시스템'),
            '000720': ('Hyundai Engineering & Construction', '현대건설'),
            '012450': ('Hanwha Aerospace', '한화에어로스페이스'),
            '009830': ('Hanwha Solutions', '한화솔루션'),
            
            # 소비재/유통 (Consumer/Retail)
            '033780': ('KT&G', 'KT&G'),
            '028150': ('GS Retail', 'GS리테일'),
            '004020': ('Hyundai Steel', '현대제철'),
            '002790': ('Amorepacific', '아모레퍼시픽'),
            
            # 기타 (Others)
            '009150': ('Samsung Electro-Mechanics', '삼성전기'),
            '006800': ('Mirae Asset Securities', '미래에셋증권'),
            '003520': ('Yungjin Pharm', '영진약품'),
            '004170': ('Shinsegae', '신세계'),
            '001570': ('Kumho Tire', '금호타이어'),
            '007310': ('Ottogi', '오뚜기'),
            '002310': ('Asia Paper', '아세아제지'),
            '005830': ('DB Insurance', 'DB손해보험'),
            '005940': ('NH Investment & Securities', 'NH투자증권'),
            '006370': ('Doosan Heavy Industries', '두산중공업'),
            '008770': ('Hotel Shilla', '호텔신라'),
            '010140': ('Samsung Fire & Marine', '삼성화재'),
            '011070': ('LG Innotek', 'LG이노텍'),
            '016360': ('Samsung Securities', '삼성증권'),
            '017800': ('Hyundai Elevator', '현대엘리베이터'),
            '020150': ('Iljin Materials', '일진머티리얼즈'),
            '023530': ('Lotte Chemical', '롯데케미칼'),
            '024110': ('Heungkuk Fire & Marine', '흥국화재'),
            '028050': ('Samsung C&T', '삼성물산'),
            '029780': ('Samsung Card', '삼성카드'),
            '030000': ('Hyundai Department Store', '현대백화점'),
            '032350': ('Lotte Tour Development', '롯데관광개발'),
            '033270': ('Yuhan Corporation', '유한양행'),
            '034020': ('Doosan Corporation', '두산'),
            '035250': ('Kangwon Land', '강원랜드'),
            '036460': ('Korea Gas Corporation', '한국가스공사'),
            '037270': ('Yungjin Pharm', '영진약품'),
            '039130': ('HD Hyundai', 'HD현대'),
            '042660': ('Daewoo Shipbuilding', '대우조선해양'),
            '047810': ('Korea Aerospace Industries', '한국항공우주산업'),
            '051900': ('LG Household & Health Care', 'LG생활건강'),
            '052690': ('Hanwha Techwin', '한화테크윈')
        }
        
        # 한국 주식 검색 루프 (한글 이름 검색 지원)
        for code, (name_en, name_ko) in korean_stocks.items():
            # 티커 코드, 영문 이름, 한글 이름 모두 검색
            if (query_upper in code or 
                query_upper in name_en.upper() or 
                query_original in name_ko):
                ticker = f"{code}.KS"
                # 한글 이름이 있으면 한글 이름 사용, 없으면 영문 이름
                display_name = name_ko if name_ko else name_en
                try:
                    price_data = get_stock_price(ticker)
                    if price_data and price_data.get('success'):
                        price_info = price_data.get('data', {})
                        results.append({
                            'ticker': ticker,
                            'name': display_name,
                            'nameEn': name_en,
                            'nameKo': name_ko,
                            'exchange': 'KRX',
                            'currentPrice': price_info.get('currentPrice', 0),
                            'currency': price_info.get('currency', 'KRW'),
                            'changePercent': price_info.get('changePercent', '0%'),
                            'changeAmount': price_info.get('changeAmount', 0),
                            'source': 'local'
                        })
                    else:
                        results.append({
                            'ticker': ticker,
                            'name': display_name,
                            'nameEn': name_en,
                            'nameKo': name_ko,
                            'exchange': 'KRX',
                            'source': 'local'
                        })
                except Exception as e:
                    logger.debug(f"Price fetch failed for {ticker}: {str(e)}")
                    results.append({
                        'ticker': ticker,
                        'name': display_name,
                        'nameEn': name_en,
                        'nameKo': name_ko,
                        'exchange': 'KRX',
                        'source': 'local'
                    })
        
        # 미국 주식 데이터베이스 (주식 + ETF) - JSON 파일에서 로드
        us_stocks = load_us_stocks()
        
        # JSON 파일이 없거나 비어있으면 fallback 데이터 사용
        if not us_stocks:
            logger.warning("Using fallback US stocks data")
            us_stocks = {
            # Tech Giants
            'AAPL': 'Apple Inc.',
            'MSFT': 'Microsoft Corporation',
            'GOOGL': 'Alphabet Inc.',
            'GOOG': 'Alphabet Inc. (Class C)',
            'AMZN': 'Amazon.com Inc.',
            'META': 'Meta Platforms Inc.',
            'NVDA': 'NVIDIA Corporation',
            'TSLA': 'Tesla Inc.',
            'AMD': 'Advanced Micro Devices',
            'INTC': 'Intel Corporation',
            'CSCO': 'Cisco Systems',
            'ORCL': 'Oracle Corporation',
            'ADBE': 'Adobe Inc.',
            'CRM': 'Salesforce Inc.',
            'NFLX': 'Netflix Inc.',
            
            # Finance
            'BRK.B': 'Berkshire Hathaway',
            'JPM': 'JPMorgan Chase',
            'V': 'Visa Inc.',
            'MA': 'Mastercard Inc.',
            'BAC': 'Bank of America',
            'WFC': 'Wells Fargo',
            'GS': 'Goldman Sachs',
            'MS': 'Morgan Stanley',
            'C': 'Citigroup',
            'AXP': 'American Express',
            
            # Consumer
            'WMT': 'Walmart Inc.',
            'HD': 'Home Depot',
            'DIS': 'Walt Disney',
            'MCD': 'McDonald\'s Corporation',
            'NKE': 'Nike Inc.',
            'SBUX': 'Starbucks Corporation',
            'KO': 'Coca-Cola Company',
            'PEP': 'PepsiCo Inc.',
            'COST': 'Costco Wholesale',
            'TGT': 'Target Corporation',
            
            # Healthcare
            'UNH': 'UnitedHealth Group',
            'JNJ': 'Johnson & Johnson',
            'PFE': 'Pfizer Inc.',
            'ABBV': 'AbbVie Inc.',
            'TMO': 'Thermo Fisher Scientific',
            'ABT': 'Abbott Laboratories',
            'MRK': 'Merck & Co.',
            'LLY': 'Eli Lilly and Company',
            
            # Energy
            'XOM': 'Exxon Mobil',
            'CVX': 'Chevron Corporation',
            
            # Telecom
            'T': 'AT&T Inc.',
            'VZ': 'Verizon Communications',
            
            # Industrial
            'BA': 'Boeing Company',
            'CAT': 'Caterpillar Inc.',
            'GE': 'General Electric',
            
            # 주요 ETF (Major ETFs)
            'SPY': 'SPDR S&P 500 ETF Trust',
            'QQQ': 'Invesco QQQ Trust',
            'VOO': 'Vanguard S&P 500 ETF',
            'VTI': 'Vanguard Total Stock Market ETF',
            'IWM': 'iShares Russell 2000 ETF',
            'DIA': 'SPDR Dow Jones Industrial Average ETF',
            'VEA': 'Vanguard FTSE Developed Markets ETF',
            'VWO': 'Vanguard FTSE Emerging Markets ETF',
            'BND': 'Vanguard Total Bond Market ETF',
            'GLD': 'SPDR Gold Trust',
            'SLV': 'iShares Silver Trust',
            'USO': 'United States Oil Fund',
            'TLT': 'iShares 20+ Year Treasury Bond ETF',
            'HYG': 'iShares iBoxx $ High Yield Corporate Bond ETF',
            'XLF': 'Financial Select Sector SPDR Fund',
            'XLK': 'Technology Select Sector SPDR Fund',
            'XLE': 'Energy Select Sector SPDR Fund',
            'XLV': 'Health Care Select Sector SPDR Fund',
            'XLI': 'Industrial Select Sector SPDR Fund',
            'XLP': 'Consumer Staples Select Sector SPDR Fund',
            'XLY': 'Consumer Discretionary Select Sector SPDR Fund',
            'XLB': 'Materials Select Sector SPDR Fund',
            'XLU': 'Utilities Select Sector SPDR Fund',
            'XLC': 'Communication Services Select Sector SPDR Fund',
            'XRE': 'Real Estate Select Sector SPDR Fund',
            'ARKK': 'ARK Innovation ETF',
            'ARKQ': 'ARK Autonomous Technology & Robotics ETF',
            'ARKG': 'ARK Genomic Revolution ETF',
            'ARKW': 'ARK Next Generation Internet ETF',
            'ARKF': 'ARK Fintech Innovation ETF'
        }
        
        # 미국 주식 검색 루프
        for ticker, name in us_stocks.items():
            if query_upper in ticker or query_upper in name.upper():
                if not any(r['ticker'] == ticker for r in results):
                    # Determine exchange based on ticker
                    exchange = 'NYSE' if ticker in ['BRK.B', 'JPM', 'V', 'BAC', 'WMT', 'JNJ', 'PG', 'KO', 'PEP', 'XOM', 'CVX', 'BA', 'CAT', 'GE'] else 'NASDAQ'
                    try:
                        price_data = get_stock_price(ticker)
                        if price_data and price_data.get('success'):
                            price_info = price_data.get('data', {})
                            results.append({
                                'ticker': ticker,
                                'name': name,
                                'exchange': exchange,
                                'currentPrice': price_info.get('currentPrice', 0),
                                'currency': price_info.get('currency', 'USD'),
                                'changePercent': price_info.get('changePercent', '0%'),
                                'changeAmount': price_info.get('changeAmount', 0),
                                'source': 'local'
                            })
                        else:
                            results.append({
                                'ticker': ticker,
                                'name': name,
                                'exchange': exchange,
                                'source': 'local'
                            })
                    except Exception as e:
                        logger.debug(f"Price fetch failed for {ticker}: {str(e)}")
                        results.append({
                            'ticker': ticker,
                            'name': name,
                            'exchange': exchange,
                            'source': 'local'
                        })
        
        # Alpha Vantage API - 모든 미국 주식/ETF 검색 (항상 실행)
        # 로컬 결과가 있어도 미국 주식/ETF는 Alpha Vantage에서 추가 검색
        try:
            logger.info(f"Searching Alpha Vantage for: {query_original}")
            # URL 인코딩으로 한글 및 특수문자 지원
            encoded_query = urllib.parse.quote(query_original)
            av_url = f'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={encoded_query}&apikey={ALPHA_VANTAGE_KEY}'
            av_response = requests.get(av_url, timeout=10)  # 타임아웃 10초로 증가
            av_data = av_response.json()
            
            # Alpha Vantage 결과 처리
            for match in av_data.get('bestMatches', []):
                ticker = match.get('1. symbol', '')
                name = match.get('2. name', '')
                asset_type = match.get('3. type', '')
                region = match.get('4. region', 'Unknown')
                match_score = match.get('9. matchScore', '0')
                
                # 매치 스코어 0.5 이상만 추가
                if float(match_score) >= 0.5:
                    # 중복 체크 (이미 로컬 결과에 있는지 확인)
                    if not any(r.get('ticker') == ticker for r in results):
                        # 미국 주식/ETF만 추가 (한국 주식은 이미 로컬에서 처리)
                        if region == 'United States' or 'US' in region or ticker.endswith('.US'):
                            # Exchange 정보 추출
                            exchange = 'NASDAQ'
                            if 'NYSE' in name or 'New York' in name:
                                exchange = 'NYSE'
                            elif 'NASDAQ' in name:
                                exchange = 'NASDAQ'
                            
                            results.append({
                                'ticker': ticker,
                                'name': name,
                                'exchange': exchange,
                                'type': asset_type,  # Equity, ETF 등
                                'region': region,
                                'source': 'alphavantage'
                            })
            
            us_results_count = len([r for r in results if r.get('region') == 'United States'])
            logger.info(f"Alpha Vantage found {us_results_count} US results")
            
        except requests.exceptions.Timeout:
            logger.warning("Alpha Vantage API timeout (10초 초과) - yfinance fallback으로 전환")
        except requests.exceptions.RequestException as re:
            logger.warning(f"Alpha Vantage API connection error: {str(re)} - yfinance fallback으로 전환")
        except Exception as e:
            logger.warning(f"Alpha Vantage API error: {str(e)} - yfinance fallback으로 전환")
        
        # yfinance Fallback - 한국 주식 및 미국 주식 검색
        # 폴백 순서: 로컬 DB → Alpha Vantage → yfinance
        if len(results) < 10:
            try:
                # 1. 한국 주식 검색 시도 (6자리 코드 자동 인식)
                if query_original.isdigit() and len(query_original) == 6:
                    logger.info(f"Detected 6-digit Korean stock code: {query_original}, trying .KS and .KQ suffixes")
                    found_korean = False
                    
                    # .KS (KOSPI) 먼저 시도, 실패하면 .KQ (KOSDAQ) 시도
                    for suffix in ['.KS', '.KQ']:
                        try:
                            ticker = f"{query_original}{suffix}"
                            logger.debug(f"Trying yfinance lookup for {ticker}")
                            stock = yf.Ticker(ticker)
                            info = stock.info
                            
                            # yfinance가 유효한 정보를 반환하는지 확인
                            if info and isinstance(info, dict) and 'longName' in info and info.get('longName'):
                                # 중복 체크
                                if not any(r.get('ticker') == ticker for r in results):
                                    results.append({
                                        'ticker': ticker,
                                        'name': info.get('longName', query_original),
                                        'exchange': 'KRX',
                                        'source': 'yfinance',
                                        'market': 'KOSPI' if suffix == '.KS' else 'KOSDAQ'
                                    })
                                    logger.info(f"✅ Found Korean stock via yfinance: {ticker} - {info.get('longName')}")
                                    found_korean = True
                                    break
                        except KeyError as ke:
                            # yfinance가 해당 티커를 찾지 못한 경우
                            logger.debug(f"yfinance: {query_original}{suffix} not found: {str(ke)}")
                            continue
                        except Exception as e:
                            # 기타 에러 (네트워크, 타임아웃 등)
                            logger.debug(f"yfinance lookup error for {query_original}{suffix}: {str(e)}")
                            continue
                    
                    # 한국 주식을 찾았으면 미국 주식 검색 건너뛰기
                    if found_korean:
                        logger.info("Korean stock found via yfinance, skipping US stock lookup")
                        # 최대 10개 결과만 반환
                        return jsonify(results[:10])
                
                # 2. 미국 주식 검색 시도 (심볼만으로 조회)
                # 한국 주식 코드가 아니거나, 한국 주식을 찾지 못한 경우
                if not (query_original.isdigit() and len(query_original) == 6):
                    try:
                        logger.debug(f"Trying yfinance lookup for US stock: {query_original}")
                        stock = yf.Ticker(query_original.upper())
                        info = stock.info
                        
                        # yfinance가 유효한 정보를 반환하는지 확인
                        if info and isinstance(info, dict) and 'longName' in info and info.get('longName'):
                            ticker = query_original.upper()
                            # 중복 체크
                            if not any(r.get('ticker') == ticker for r in results):
                                # Exchange 정보 추출
                                exchange = info.get('exchange', 'UNKNOWN')
                                if 'NASDAQ' in exchange:
                                    exchange = 'NASDAQ'
                                elif 'NYSE' in exchange or 'New York' in exchange:
                                    exchange = 'NYSE'
                                
                                results.append({
                                    'ticker': ticker,
                                    'name': info.get('longName', query_original),
                                    'exchange': exchange,
                                    'source': 'yfinance',
                                    'type': info.get('quoteType', 'EQUITY')  # ETF인지 주식인지
                                })
                                logger.info(f"✅ Found US stock via yfinance: {ticker} - {info.get('longName')}")
                    except KeyError as ke:
                        # yfinance가 해당 티커를 찾지 못한 경우
                        logger.debug(f"yfinance: {query_original} not found: {str(ke)}")
                    except Exception as yf_error:
                        # 기타 에러 (네트워크, 타임아웃 등)
                        logger.warning(f"yfinance lookup failed for {query_original}: {str(yf_error)}")
                        # 에러가 발생해도 기존 결과는 반환
                        
            except Exception as yf_error:
                # 최상위 예외 처리 (예상치 못한 에러)
                logger.warning(f"yfinance fallback error: {str(yf_error)}")
                # 에러가 발생해도 기존 결과는 반환
        
        # 최대 10개 결과만 반환
        return jsonify(results[:10])
        
    except Exception as e:
        error_msg = safe_encode_error(str(e))
        # Traceback도 안전하게 처리
        try:
            tb_str = traceback.format_exc()
            safe_tb = safe_encode_error(tb_str)
            logger.error(f"주식 검색 오류: {error_msg}\n{safe_tb}")
        except:
            logger.error(f"주식 검색 오류: {error_msg}")
        return jsonify([])


@app.errorhandler(404)
def not_found(error):
    """404 에러 핸들러"""
    return jsonify({
        'success': False,
        'error': '요청한 리소스를 찾을 수 없습니다.'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """500 에러 핸들러"""
    return jsonify({
        'success': False,
        'error': '서버 내부 오류가 발생했습니다.'
    }), 500


if __name__ == '__main__':
    # UTF-8 환경 확인
    if sys.platform == 'win32':
        if os.getenv('PYTHONIOENCODING') == 'utf-8' or os.getenv('PYTHONUTF8') == '1':
            print("[INFO] UTF-8 encoding enabled via environment variables")
        else:
            print("[INFO] UTF-8 encoding recommended. Set PYTHONIOENCODING=utf-8")

    print("=" * 60)
    print("ToAndFrom Portfolio Optimization API Server")
    print("=" * 60)
    print("API Endpoints:")
    print("  GET / - API Information")
    print("  GET /api/health - Server Status")
    print("  POST /api/optimize - Portfolio Optimization")
    print("  POST /api/optimize/with-weights - Optimization with weights")
    print("  POST /api/optimize/batch - Batch Optimization")
    print("=" * 60)
    print("Server URL: http://127.0.0.1:5000")
    print("Health Check: http://127.0.0.1:5000/api/health")
    print("=" * 60)
    print("Fast Mode (default): reps=1, maxiter=50")
    print("Precise Mode: fast_mode=false (reps=2, maxiter=100)")
    print("=" * 60)
    print("Windows cp949 compatible: emoji-free responses")
    print("=" * 60)

    try:
        app.run(host='127.0.0.1', port=5000, debug=True, threaded=True, use_reloader=False)
    except OSError as e:
        if getattr(e, 'winerror', None) == 10038:
            print(f"[WARNING] Socket error detected: {e}")
            print("Trying alternative configuration...")
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind(('127.0.0.1', 5000))
                sock.close()
                app.run(host='127.0.0.1', port=5000, debug=False, threaded=True, use_reloader=False)
            except Exception as e2:
                print(f"[ERROR] Failed to start server: {e2}")
                print("Please check if port 5000 is already in use:")
                print("  netstat -ano | findstr :5000")
                raise
        else:
            raise



