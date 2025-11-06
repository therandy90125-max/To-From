"""
Flask API Server for Portfolio Optimization
포트폴리오 최적화를 위한 Flask REST API 서버
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from optimizer import optimize_portfolio, PortfolioOptimizer
from chatbot import chat
import traceback
import logging
import os

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static')
CORS(app)  # CORS 활성화 (프론트엔드 연결용)


@app.route('/')
def home():
    """홈 엔드포인트"""
    return jsonify({
        'message': '✅ ToAndFrom Portfolio Optimization API',
        'version': '1.0.0',
        'endpoints': {
            '/api/optimize': 'POST - 포트폴리오 최적화',
            '/api/health': 'GET - 서버 상태 확인',
            '/test': 'GET - 테스트 페이지'
        }
    })


@app.route('/test')
def test_page():
    """테스트 페이지"""
    return send_from_directory(app.static_folder, 'test.html')


@app.route('/api/health', methods=['GET'])
def health():
    """서버 상태 확인"""
    return jsonify({
        'status': 'healthy',
        'service': 'ToAndFrom Portfolio Optimizer'
    })


@app.route('/api/optimize', methods=['POST'])
def optimize():
    """
    포트폴리오 최적화 API
    
    Request Body (JSON):
    {
        "tickers": ["AAPL", "GOOGL", "MSFT"],
        "risk_factor": 0.5,  # 0.0 ~ 1.0 (선택사항, 기본값: 0.5)
        "method": "classical",  # "classical" 또는 "quantum" (선택사항, 기본값: "classical")
        "period": "1y",  # "1y", "6mo", "3mo" 등 (선택사항, 기본값: "1y")
        "reps": 1  # 양자 최적화 시 reps (선택사항, 기본값: 1)
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
        reps = data.get('reps', 1)
        
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
                reps=reps
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
        logger.error(f"서버 오류: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'서버 오류가 발생했습니다: {str(e)}'
        }), 500


@app.route('/api/optimize/with-weights', methods=['POST'])
def optimize_with_weights():
    """
    기존 포트폴리오 비중을 받아서 최적화하는 API
    
    Request Body (JSON):
    {
        "tickers": ["AAPL", "GOOGL", "MSFT"],
        "initial_weights": [0.4, 0.4, 0.2],  # 기존 비중 (합이 1.0이어야 함)
        "risk_factor": 0.5,  # 0.0 ~ 1.0 (선택사항, 기본값: 0.5)
        "method": "quantum",  # "classical" 또는 "quantum" (선택사항, 기본값: "quantum")
        "period": "1y",  # "1y", "6mo", "3mo" 등 (선택사항, 기본값: "1y")
        "reps": 1  # 양자 최적화 시 reps (선택사항, 기본값: 1)
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
        
        if not isinstance(initial_weights, list) or len(initial_weights) != len(tickers):
            return jsonify({
                'success': False,
                'error': f'initial_weights는 tickers와 같은 길이의 리스트여야 합니다. (tickers: {len(tickers)}, weights: {len(initial_weights) if isinstance(initial_weights, list) else 0})'
            }), 400
        
        # 선택적 파라미터
        risk_factor = data.get('risk_factor', 0.5)
        method = data.get('method', 'quantum')
        period = data.get('period', '1y')
        reps = data.get('reps', 1)
        
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
        optimizer = PortfolioOptimizer(
            tickers=tickers,
            risk_factor=risk_factor,
            initial_weights=initial_weights
        )
        optimizer.fetch_data(period=period)
        
        if method == 'quantum':
            result = optimizer.optimize_with_weights(method=method, reps=reps)
        else:
            result = optimizer.optimize_with_weights(method=method)
        
        logger.info(f"비중 최적화 완료: 개선율 {result['improvements']['return_improvement']:.2f}%")
        
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
        logger.error(f"서버 오류: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'서버 오류가 발생했습니다: {str(e)}'
        }), 500


@app.route('/api/optimize/batch', methods=['POST'])
def optimize_batch():
    """
    여러 포트폴리오를 한 번에 최적화
    
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
        logger.error(f"배치 최적화 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'배치 최적화 오류: {str(e)}'
        }), 500


@app.route('/api/chatbot/chat', methods=['POST'])
def chatbot_chat():
    """
    챗봇 대화 API
    
    Request Body (JSON):
    {
        "message": "샤프 비율이란 무엇인가요?",
        "history": [],  # 선택사항
        "language": "ko"  # 선택사항, 기본값: "ko"
    }
    
    Response:
    {
        "success": true,
        "response": "샤프 비율은...",
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
        logger.error(f"챗봇 오류: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'챗봇 오류: {str(e)}'
        }), 500


@app.errorhandler(404)
def not_found(error):
    """404 에러 핸들러"""
    return jsonify({
        'success': False,
        'error': '엔드포인트를 찾을 수 없습니다.'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """500 에러 핸들러"""
    return jsonify({
        'success': False,
        'error': '서버 내부 오류가 발생했습니다.'
    }), 500


if __name__ == '__main__':
    print("ToAndFrom Portfolio Optimization API 서버 시작")
    print("=" * 50)
    print("API 엔드포인트:")
    print("   GET  /              - API 정보")
    print("   GET  /api/health    - 서버 상태")
    print("   POST /api/optimize  - 포트폴리오 최적화")
    print("   POST /api/optimize/batch - 배치 최적화")
    print("=" * 50)
    print("서버 실행: http://localhost:5000")
    print("=" * 50)
    
    # 양자 최적화는 시간이 오래 걸릴 수 있으므로 타임아웃을 길게 설정
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)

