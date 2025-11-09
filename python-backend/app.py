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
    주식 검색 API (한국 + 미국)
 
 Query Parameters:
 q: ()
 
 Response:
 [
 {
 "ticker": "005930.KS",
 "name": "Samsung Electronics",
 "exchange": "KRX"
 },
 ...
    ]
    """
    try:
        query = request.args.get('q', '').upper()
        
        if not query or len(query) < 1:
            return jsonify([])
        
        results = []
        
        # 한국 주식 검색
        korean_stocks = {
 # '005930': 'Samsung Electronics',
 '000660': 'SK Hynix',
 '035420': 'NAVER',
 '035720': 'Kakao',
 '051910': 'LG Chem',
 '006400': 'Samsung SDI',
 '005380': 'Hyundai Motor',
 '012330': 'Hyundai Mobis',
 '028260': 'Samsung C&T',
 
 # /'068270': 'Celltrion',
 '207940': 'Samsung Biologics',
 '326030': 'SK Biopharmaceuticals',
 '128940': 'Han Mi Pharm',
 '214450': 'Celltrion Healthcare',
 
 # IT/'251270': 'Netmarble',
 '036570': 'NCsoft',
 '259960': 'Krafton',
 '018260': 'Samsung SDS',
 '035900': 'JYP Entertainment',
 
 # '055550': 'Shinhan Financial Group',
 '086790': 'Hana Financial Group',
 '105560': 'KB Financial Group',
 '032830': 'Samsung Life Insurance',
 
 # /'015760': 'Korea Electric Power',
 '010950': 'S-Oil',
 '009540': 'Korea Gas',
 '034730': 'SK',
 
 # '017670': 'SK Telecom',
 '030200': 'KT',
 '032640': 'LG Uplus',
 
 # /'000270': 'Kia',
 '161390': 'Hanon Systems',
 
 # /'005490': 'POSCO',
 '096770': 'SK Innovation',
 '010130': 'Korea Zinc',
 
 # '033780': 'KT&G',
 '003550': 'LG',
 '018880': 'Samsung Securities',
            '000720': 'Hyundai Engineering & Construction'
        }
        
        # 한국 주식 검색 루프
        for code, name in korean_stocks.items():
            if query in code or query in name.upper():
                ticker = f"{code}.KS"
                try:
                    price_data = get_stock_price(ticker)
                    if price_data and price_data.get('success'):
                        price_info = price_data.get('data', {})
                        results.append({
                            'ticker': ticker,
                            'name': name,
                            'exchange': 'KRX',
                            'currentPrice': price_info.get('currentPrice', 0),
                            'currency': price_info.get('currency', 'KRW'),
                            'changePercent': price_info.get('changePercent', '0%'),
                            'changeAmount': price_info.get('changeAmount', 0)
                        })
                    else:
                        results.append({
                            'ticker': ticker,
                            'name': name,
                            'exchange': 'KRX'
                        })
                except Exception as e:
                    logger.debug(f"Price fetch failed for {ticker}: {str(e)}")
                    results.append({
                        'ticker': ticker,
                        'name': name,
                        'exchange': 'KRX'
                    })
        
        # 미국 주식 데이터베이스
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
            'GE': 'General Electric'
        }
        
        # 미국 주식 검색 루프
        for ticker, name in us_stocks.items():
            if query in ticker or query in name.upper():
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
                                'changeAmount': price_info.get('changeAmount', 0)
                            })
                        else:
                            results.append({
                                'ticker': ticker,
                                'name': name,
                                'exchange': exchange
                            })
                    except Exception as e:
                        logger.debug(f"Price fetch failed for {ticker}: {str(e)}")
                        results.append({
                            'ticker': ticker,
                            'name': name,
                            'exchange': exchange
                        })
        
        # Alpha Vantage API (외부 데이터베이스)
        if len(results) == 0:
            try:
                logger.info(f"Searching Alpha Vantage for: {query}")
                av_url = f'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={query}&apikey={ALPHA_VANTAGE_KEY}'
                av_response = requests.get(av_url, timeout=5)
                av_data = av_response.json()
                
                for match in av_data.get('bestMatches', [])[:10]:
                    ticker = match.get('1. symbol', '')
                    name = match.get('2. name', '')
                    region = match.get('4. region', 'Unknown')
                    match_score = match.get('9. matchScore', '0')
                    
                    # 매치 스코어 0.5 이상만 추가
                    if float(match_score) >= 0.5:
                        results.append({
                            'ticker': ticker,
                            'name': name,
                            'exchange': region
                        })
                
                logger.info(f"Alpha Vantage found {len(results)} results")
                
            except requests.exceptions.Timeout:
                logger.warning("Alpha Vantage API timeout")
            except Exception as e:
                logger.warning(f"Alpha Vantage API error: {str(e)}")
            # Fallback to yfinance
            try:
                stock = yf.Ticker(query)
                info = stock.info
                
                if info and 'longName' in info:
                    results.append({
                        'ticker': query,
                        'name': info.get('longName', query),
                        'exchange': info.get('exchange', 'UNKNOWN')
                    })
            except Exception as yf_error:
                logger.debug(f"yfinance lookup also failed: {str(yf_error)}")
        
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



