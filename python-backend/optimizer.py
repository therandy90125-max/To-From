"""
Qiskit-based Portfolio Optimization
양자 컴퓨팅을 활용한 포트폴리오 최적화 모듈
"""

import numpy as np
import pandas as pd
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit_algorithms import QAOA, NumPyMinimumEigensolver
from qiskit_algorithms.optimizers import COBYLA
from qiskit.primitives import StatevectorSampler
from qiskit_finance.applications.optimization import PortfolioOptimization
from qiskit_finance.data_providers import YahooDataProvider
from qiskit_optimization import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer
import yfinance as yf
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import warnings
warnings.filterwarnings('ignore')


class PortfolioOptimizer:
    """Qiskit을 사용한 포트폴리오 최적화 클래스"""
    
    def __init__(self, tickers: List[str], risk_factor: float = 0.5, initial_weights: List[float] = None):
        """
        Args:
            tickers: 주식 티커 리스트 (예: ['AAPL', 'GOOGL', 'MSFT'])
            risk_factor: 리스크 팩터 (0.0 ~ 1.0, 높을수록 보수적)
            initial_weights: 기존 포트폴리오 비중 (선택사항, None이면 자동 선택)
        """
        self.tickers = tickers
        self.risk_factor = risk_factor
        self.initial_weights = initial_weights
        self.expected_returns = None
        self.covariance_matrix = None
        self.data = None
        
    def fetch_data(self, period: str = "1y") -> pd.DataFrame:
        """Yahoo Finance에서 주식 데이터 가져오기"""
        print(f"데이터 가져오는 중: {', '.join(self.tickers)}")
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        
        data = {}
        for ticker in self.tickers:
            try:
                stock = yf.Ticker(ticker)
                hist = stock.history(period=period)
                if not hist.empty:
                    data[ticker] = hist['Close']
                    print(f"[OK] {ticker}: {len(hist)}일 데이터")
                else:
                    print(f"[WARN] {ticker}: 데이터 없음")
            except Exception as e:
                print(f"[ERROR] {ticker} 오류: {str(e)}")
        
        if not data:
            raise ValueError("데이터를 가져올 수 없습니다.")
        
        self.data = pd.DataFrame(data)
        return self.data
    
    def calculate_returns(self) -> Tuple[np.ndarray, np.ndarray]:
        """수익률 및 공분산 행렬 계산"""
        if self.data is None:
            raise ValueError("먼저 fetch_data()를 호출하세요.")
        
        # 일일 수익률 계산
        returns = self.data.pct_change().dropna()
        
        # 평균 수익률 (연율화)
        self.expected_returns = returns.mean().values * 252
        
        # 공분산 행렬 (연율화)
        self.covariance_matrix = returns.cov().values * 252
        
        print(f"평균 수익률 계산 완료: {len(self.expected_returns)}개 자산")
        print(f"공분산 행렬 크기: {self.covariance_matrix.shape}")
        
        return self.expected_returns, self.covariance_matrix
    
    def optimize_classical(self) -> Dict:
        """고전적 최적화 (NumPy 사용) - 빠른 결과"""
        if self.expected_returns is None or self.covariance_matrix is None:
            self.calculate_returns()
        
        n = len(self.tickers)
        
        # Quadratic Program 생성
        qp = QuadraticProgram()
        
        # 변수 추가 (각 주식의 비중, 0 또는 1)
        for i in range(n):
            qp.binary_var(name=f'x_{i}')
        
        # 목적 함수: -수익률 + 리스크
        # minimize: -mu^T * x + lambda * x^T * Sigma * x
        linear = {}
        quadratic = {}
        
        for i in range(n):
            linear[f'x_{i}'] = -self.expected_returns[i]
            for j in range(n):
                if (f'x_{i}', f'x_{j}') not in quadratic:
                    quadratic[(f'x_{i}', f'x_{j}')] = self.risk_factor * self.covariance_matrix[i, j]
        
        qp.minimize(linear=linear, quadratic=quadratic)
        
        # 제약 조건: 최소 1개, 최대 n개 선택
        qp.linear_constraint(
            linear={f'x_{i}': 1 for i in range(n)},
            sense='>=',
            rhs=1,
            name='min_selection'
        )
        
        qp.linear_constraint(
            linear={f'x_{i}': 1 for i in range(n)},
            sense='<=',
            rhs=n,
            name='max_selection'
        )
        
        # 고전적 최적화 실행
        print("고전적 최적화 실행 중...")
        exact_mes = NumPyMinimumEigensolver()
        exact = MinimumEigenOptimizer(exact_mes)
        result = exact.solve(qp)
        
        # 결과 파싱
        selected = []
        weights = []
        total_weight = 0
        
        for i, ticker in enumerate(self.tickers):
            if result.x[i] > 0.5:  # 선택됨
                selected.append(ticker)
                weights.append(1.0)  # 균등 가중치
                total_weight += 1.0
        
        if total_weight > 0:
            weights = [w / total_weight for w in weights]
        
        # 예상 수익률 및 리스크 계산
        portfolio_return = sum(weights[i] * self.expected_returns[self.tickers.index(selected[i])] 
                              for i in range(len(selected)))
        
        portfolio_risk = 0
        for i, ticker1 in enumerate(selected):
            idx1 = self.tickers.index(ticker1)
            for j, ticker2 in enumerate(selected):
                idx2 = self.tickers.index(ticker2)
                portfolio_risk += weights[i] * weights[j] * self.covariance_matrix[idx1, idx2]
        portfolio_risk = np.sqrt(portfolio_risk)
        
        return {
            'selected_tickers': selected,
            'weights': weights,
            'expected_return': float(portfolio_return),
            'risk': float(portfolio_risk),
            'sharpe_ratio': float(portfolio_return / portfolio_risk) if portfolio_risk > 0 else 0.0,
            'method': 'classical',
            'optimization_value': float(result.fval),  # 고전적 최적값
            'solution_vector': [float(x) for x in result.x],  # 최적해 벡터
            'quantum_verified': False  # 고전적 최적화 플래그
        }
    
    def optimize_quantum(self, num_qubits: int = None, reps: int = 3) -> Dict:
        """양자 최적화 (QAOA 사용) - 양자 컴퓨팅 시뮬레이션
        
        Args:
            num_qubits: 사용할 큐비트 수 (None이면 자동 결정)
            reps: QAOA 회로의 깊이 (기본값 3, 높을수록 정확하지만 느림)
        """
        if self.expected_returns is None or self.covariance_matrix is None:
            self.calculate_returns()
        
        n = len(self.tickers)
        print(f"\n{'='*60}")
        print(f"🔬 QUANTUM OPTIMIZATION STARTING (QAOA)")
        print(f"{'='*60}")
        print(f"  Number of stocks: {n}")
        print(f"  QAOA reps (circuit depth): {reps}")
        print(f"  Risk factor: {self.risk_factor}")
        print(f"{'='*60}\n")
        
        # Quadratic Program 생성
        qp = QuadraticProgram()
        
        for i in range(n):
            qp.binary_var(name=f'x_{i}')
        
        # 목적 함수
        linear = {}
        quadratic = {}
        
        for i in range(n):
            linear[f'x_{i}'] = -self.expected_returns[i]
            for j in range(n):
                if (f'x_{i}', f'x_{j}') not in quadratic:
                    quadratic[(f'x_{i}', f'x_{j}')] = self.risk_factor * self.covariance_matrix[i, j]
        
        qp.minimize(linear=linear, quadratic=quadratic)
        
        # 제약 조건
        qp.linear_constraint(
            linear={f'x_{i}': 1 for i in range(n)},
            sense='>=',
            rhs=1,
            name='min_selection'
        )
        
        # QAOA 최적화 실행
        print(f"양자 최적화 실행 중 (QAOA, reps={reps})...")
        print(f"  - Quadratic Program 변수 수: {qp.get_num_vars()}")
        print(f"  - Quadratic Program 제약 조건 수: {qp.get_num_linear_constraints()}")
        
        optimizer = COBYLA(maxiter=100)
        sampler = StatevectorSampler()
        print(f"  - StatevectorSampler 초기화 완료")
        
        qaoa = QAOA(sampler=sampler, optimizer=optimizer, reps=reps)
        print(f"  - QAOA 알고리즘 초기화 완료 (reps={reps})")
        
        quantum_mes = MinimumEigenOptimizer(qaoa)
        print(f"  - MinimumEigenOptimizer 초기화 완료")
        print(f"  - 양자 최적화 실행 시작...")
        
        result = quantum_mes.solve(qp)
        
        print(f"\n{'='*60}")
        print(f"✅ QUANTUM OPTIMIZATION COMPLETED!")
        print(f"{'='*60}")
        print(f"  Solution vector: {result.x}")
        print(f"  Optimal value: {result.fval:.6f}")
        print(f"  Selected stocks (x > 0.5): {[self.tickers[i] for i in range(n) if result.x[i] > 0.5]}")
        print(f"{'='*60}\n")
        
        # 결과 파싱
        selected = []
        weights = []
        total_weight = 0
        
        for i, ticker in enumerate(self.tickers):
            if result.x[i] > 0.5:
                selected.append(ticker)
                weights.append(1.0)
                total_weight += 1.0
        
        if total_weight > 0:
            weights = [w / total_weight for w in weights]
        
        # 예상 수익률 및 리스크 계산
        portfolio_return = sum(weights[i] * self.expected_returns[self.tickers.index(selected[i])] 
                              for i in range(len(selected))) if selected else 0
        
        portfolio_risk = 0
        for i, ticker1 in enumerate(selected):
            idx1 = self.tickers.index(ticker1)
            for j, ticker2 in enumerate(selected):
                idx2 = self.tickers.index(ticker2)
                portfolio_risk += weights[i] * weights[j] * self.covariance_matrix[idx1, idx2]
        portfolio_risk = np.sqrt(portfolio_risk) if portfolio_risk > 0 else 0
        
        return {
            'selected_tickers': selected,
            'weights': weights,
            'expected_return': float(portfolio_return),
            'risk': float(portfolio_risk),
            'sharpe_ratio': float(portfolio_return / portfolio_risk) if portfolio_risk > 0 else 0.0,
            'method': 'quantum',
            'reps': reps,
            'optimization_value': float(result.fval),  # QAOA 최적값
            'solution_vector': [float(x) for x in result.x],  # 최적해 벡터
            'quantum_verified': True  # 양자 최적화 실행 확인 플래그
        }
    
    def calculate_portfolio_metrics(self, weights: List[float]) -> Dict:
        """포트폴리오 비중에 대한 성과 지표 계산"""
        if self.expected_returns is None or self.covariance_matrix is None:
            self.calculate_returns()
        
        if len(weights) != len(self.tickers):
            raise ValueError(f"비중 개수({len(weights)})가 티커 개수({len(self.tickers)})와 일치하지 않습니다.")
        
        # 예상 수익률 계산
        portfolio_return = sum(weights[i] * self.expected_returns[i] for i in range(len(self.tickers)))
        
        # 리스크 계산
        portfolio_risk = 0
        for i in range(len(self.tickers)):
            for j in range(len(self.tickers)):
                portfolio_risk += weights[i] * weights[j] * self.covariance_matrix[i, j]
        portfolio_risk = np.sqrt(portfolio_risk)
        
        # 샤프 비율 계산
        sharpe_ratio = portfolio_return / portfolio_risk if portfolio_risk > 0 else 0.0
        
        return {
            'expected_return': float(portfolio_return),
            'risk': float(portfolio_risk),
            'sharpe_ratio': float(sharpe_ratio)
        }
    
    def optimize_with_weights(self, method: str = 'quantum', **kwargs) -> Dict:
        """
        기존 포트폴리오 비중을 받아서 최적화하는 메서드
        QAOA는 연속 변수를 지원하지 않으므로, 이진 변수로 선택 후 비중 재조정
        
        Returns:
            원본 포트폴리오와 최적화된 포트폴리오 비교 결과
        """
        if self.initial_weights is None:
            raise ValueError("기존 포트폴리오 비중이 필요합니다.")
        
        if len(self.initial_weights) != len(self.tickers):
            raise ValueError(f"비중 개수({len(self.initial_weights)})가 티커 개수({len(self.tickers)})와 일치하지 않습니다.")
        
        if abs(sum(self.initial_weights) - 1.0) > 0.01:
            raise ValueError(f"비중의 합이 1.0이어야 합니다. 현재: {sum(self.initial_weights)}")
        
        if self.expected_returns is None or self.covariance_matrix is None:
            self.calculate_returns()
        
        # 원본 포트폴리오 성과 계산
        original_metrics = self.calculate_portfolio_metrics(self.initial_weights)
        
        # 이진 변수로 최적화 (주식 선택)
        n = len(self.tickers)
        qp = QuadraticProgram()
        
        # 이진 변수 추가 (각 주식 선택 여부)
        for i in range(n):
            qp.binary_var(name=f'x_{i}')
        
        # 목적 함수: -수익률 + 리스크
        linear = {}
        quadratic = {}
        
        for i in range(n):
            linear[f'x_{i}'] = -self.expected_returns[i]
            for j in range(n):
                if (f'x_{i}', f'x_{j}') not in quadratic:
                    quadratic[(f'x_{i}', f'x_{j}')] = self.risk_factor * self.covariance_matrix[i, j]
        
        qp.minimize(linear=linear, quadratic=quadratic)
        
        # 제약 조건: 최소 1개, 최대 n개 선택
        qp.linear_constraint(
            linear={f'x_{i}': 1 for i in range(n)},
            sense='>=',
            rhs=1,
            name='min_selection'
        )
        
        qp.linear_constraint(
            linear={f'x_{i}': 1 for i in range(n)},
            sense='<=',
            rhs=n,
            name='max_selection'
        )
        
        # 최적화 실행
        reps = kwargs.get('reps', 1)
        if method == 'quantum':
            print(f"양자 최적화 실행 중 (QAOA, reps={reps})...")
            optimizer = COBYLA(maxiter=100)
            sampler = StatevectorSampler()
            qaoa = QAOA(sampler=sampler, optimizer=optimizer, reps=reps)
            quantum_mes = MinimumEigenOptimizer(qaoa)
            result = quantum_mes.solve(qp)
        else:
            print("고전적 최적화 실행 중...")
            exact_mes = NumPyMinimumEigensolver()
            exact = MinimumEigenOptimizer(exact_mes)
            result = exact.solve(qp)
        
        # 선택된 주식들
        selected_indices = [i for i in range(n) if result.x[i] > 0.5]
        
        if len(selected_indices) == 0:
            # 선택된 주식이 없으면 원본 유지
            optimized_weights = self.initial_weights.copy()
        else:
            # 선택된 주식들의 기대 수익률 기반으로 비중 재조정
            selected_returns = [self.expected_returns[i] for i in selected_indices]
            total_return = sum(selected_returns)
            
            if total_return > 0:
                # 수익률에 비례하여 비중 할당
                optimized_weights = [0.0] * n
                for idx, selected_idx in enumerate(selected_indices):
                    optimized_weights[selected_idx] = selected_returns[idx] / total_return
            else:
                # 균등 분배
                optimized_weights = [0.0] * n
                equal_weight = 1.0 / len(selected_indices)
                for selected_idx in selected_indices:
                    optimized_weights[selected_idx] = equal_weight
        
        # 비중 정규화 (합이 1.0이 되도록)
        weight_sum = sum(optimized_weights)
        if weight_sum > 0:
            optimized_weights = [w / weight_sum for w in optimized_weights]
        else:
            optimized_weights = self.initial_weights.copy()
        
        # 최적화된 포트폴리오 성과 계산
        optimized_metrics = self.calculate_portfolio_metrics(optimized_weights)
        
        # 개선율 계산
        return_improvement = ((optimized_metrics['expected_return'] - original_metrics['expected_return']) 
                             / original_metrics['expected_return'] * 100) if original_metrics['expected_return'] > 0 else 0
        risk_change = ((optimized_metrics['risk'] - original_metrics['risk']) 
                      / original_metrics['risk'] * 100) if original_metrics['risk'] > 0 else 0
        sharpe_improvement = ((optimized_metrics['sharpe_ratio'] - original_metrics['sharpe_ratio']) 
                             / original_metrics['sharpe_ratio'] * 100) if original_metrics['sharpe_ratio'] > 0 else 0
        
        # 최적화 점수 계산 (수익률 / 리스크)
        original_score = original_metrics['expected_return'] / original_metrics['risk'] if original_metrics['risk'] > 0 else 0
        optimized_score = optimized_metrics['expected_return'] / optimized_metrics['risk'] if optimized_metrics['risk'] > 0 else 0
        score_improvement = ((optimized_score - original_score) / original_score * 100) if original_score > 0 else 0
        
        return {
            'original': {
                'tickers': self.tickers,
                'weights': self.initial_weights,
                **original_metrics,
                'optimization_score': float(original_score)
            },
            'optimized': {
                'tickers': self.tickers,
                'weights': optimized_weights,
                **optimized_metrics,
                'optimization_score': float(optimized_score)
            },
            'improvements': {
                'return_improvement': float(return_improvement),
                'risk_change': float(risk_change),
                'sharpe_improvement': float(sharpe_improvement),
                'score_improvement': float(score_improvement)
            },
            'method': method,
            'optimization_value': float(result.fval),
            'quantum_verified': method == 'quantum'
        }
    
    def optimize(self, method: str = 'classical', **kwargs) -> Dict:
        """
        포트폴리오 최적화 실행
        
        Args:
            method: 'classical' 또는 'quantum'
            **kwargs: 추가 옵션 (quantum의 경우 reps 등)
        
        Returns:
            최적화 결과 딕셔너리
        """
        if method == 'classical':
            return self.optimize_classical()
        elif method == 'quantum':
            reps = kwargs.get('reps', 3)  # QAOA 회로 깊이 기본값 3
            return self.optimize_quantum(reps=reps)
        else:
            raise ValueError(f"알 수 없는 방법: {method}. 'classical' 또는 'quantum'을 사용하세요.")


def optimize_portfolio(tickers: List[str], risk_factor: float = 0.5, 
                      method: str = 'classical', period: str = "1y", **kwargs) -> Dict:
    """
    편의 함수: 포트폴리오 최적화 실행
    
    Args:
        tickers: 주식 티커 리스트
        risk_factor: 리스크 팩터 (0.0 ~ 1.0)
        method: 'classical' 또는 'quantum'
        period: 데이터 기간 ('1y', '6mo', '3mo' 등)
        **kwargs: 추가 옵션
    
    Returns:
        최적화 결과
    """
    optimizer = PortfolioOptimizer(tickers, risk_factor)
    optimizer.fetch_data(period=period)
    return optimizer.optimize(method=method, **kwargs)


if __name__ == "__main__":
    # 테스트 코드
    print("포트폴리오 최적화 테스트 시작\n")
    
    # 샘플 티커
    test_tickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']
    
    try:
        # 고전적 최적화
        print("=" * 50)
        print("고전적 최적화")
        print("=" * 50)
        result_classical = optimize_portfolio(
            tickers=test_tickers,
            risk_factor=0.5,
            method='classical',
            period='1y'
        )
        
        print("\n최적화 결과:")
        print(f"선택된 주식: {result_classical['selected_tickers']}")
        print(f"가중치: {[f'{w:.2%}' for w in result_classical['weights']]}")
        print(f"예상 수익률: {result_classical['expected_return']:.2%}")
        print(f"리스크: {result_classical['risk']:.2%}")
        print(f"샤프 비율: {result_classical['sharpe_ratio']:.2f}")
        
    except Exception as e:
        print(f"[ERROR] 오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()

