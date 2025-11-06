"""
Simple RAG-based Chatbot for Portfolio Optimization
포트폴리오 최적화를 위한 간단한 RAG 기반 챗봇
"""

import re
from typing import List, Dict

# 지식 베이스 (간단한 FAQ)
KNOWLEDGE_BASE = {
    "sharpe ratio": {
        "ko": "샤프 비율(Sharpe Ratio)은 투자 수익률을 위험으로 조정한 지표입니다. 공식은 (포트폴리오 수익률 - 무위험 수익률) / 포트폴리오 표준편차입니다. 높을수록 위험 대비 수익이 좋은 포트폴리오를 의미합니다.",
        "en": "The Sharpe Ratio is a measure of risk-adjusted return. Formula: (Portfolio Return - Risk-free Rate) / Portfolio Standard Deviation. Higher values indicate better risk-adjusted returns."
    },
    "portfolio optimization": {
        "ko": "포트폴리오 최적화는 주어진 리스크 수준에서 최대 수익을 얻거나, 목표 수익률에서 최소 리스크를 달성하는 자산 배분을 찾는 과정입니다. 마코위츠의 현대 포트폴리오 이론을 기반으로 합니다.",
        "en": "Portfolio optimization is the process of finding the best asset allocation that maximizes returns for a given risk level, or minimizes risk for a target return. It's based on Markowitz's Modern Portfolio Theory."
    },
    "quantum optimization": {
        "ko": "양자 최적화는 양자 컴퓨팅 알고리즘(QAOA)을 사용하여 최적화 문제를 해결하는 방법입니다. 전통적인 방법보다 복잡한 문제에서 더 나은 성능을 보일 수 있습니다.",
        "en": "Quantum optimization uses quantum computing algorithms (QAOA) to solve optimization problems. It can potentially outperform traditional methods for complex problems."
    },
    "optimizer": {
        "ko": "최적화 도구를 사용하려면: 1) 주식 티커를 입력하세요 (예: AAPL, GOOGL, MSFT), 2) 기존 비중을 입력하세요 (합이 1.0이어야 함), 3) 리스크 팩터를 조정하세요, 4) 최적화 방법을 선택하세요 (양자/고전적), 5) 최적화 실행 버튼을 클릭하세요.",
        "en": "To use the optimizer: 1) Enter stock tickers (e.g., AAPL, GOOGL, MSFT), 2) Enter existing weights (sum must be 1.0), 3) Adjust risk factor, 4) Select optimization method (quantum/classical), 5) Click optimize button."
    }
}

def find_relevant_knowledge(query: str, language: str = "ko") -> str:
    """질문에서 관련 지식을 찾기"""
    query_lower = query.lower()
    
    # 키워드 매칭
    for keyword, knowledge in KNOWLEDGE_BASE.items():
        if keyword in query_lower:
            return knowledge.get(language, knowledge.get("en", ""))
    
    return ""

def generate_response(user_message: str, history: List[Dict] = None, language: str = "ko") -> str:
    """챗봇 응답 생성"""
    if history is None:
        history = []
    
    # 관련 지식 찾기
    knowledge = find_relevant_knowledge(user_message, language)
    
    if knowledge:
        return knowledge
    
    # 기본 응답
    if language == "ko":
        return "죄송합니다. 해당 질문에 대한 답변을 찾을 수 없습니다. 포트폴리오 최적화, 샤프 비율, 양자 최적화 등에 대해 질문해주세요."
    else:
        return "Sorry, I couldn't find an answer to that question. Please ask about portfolio optimization, Sharpe ratio, quantum optimization, etc."

def chat(message: str, history: List[Dict] = None, language: str = "ko") -> Dict:
    """챗봇 메인 함수"""
    try:
        response = generate_response(message, history, language)
        return {
            "success": True,
            "response": response,
            "language": language
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

