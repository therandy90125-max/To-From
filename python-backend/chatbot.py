"""
Simple RAG-based Chatbot for Portfolio Optimization
[EMOJI] [EMOJI] [EMOJI] [EMOJI] RAG [EMOJI] [EMOJI]
"""

import re
from typing import List, Dict

# [EMOJI] [EMOJI] ([EMOJI] FAQ)
KNOWLEDGE_BASE = {
    "sharpe ratio": {
        "ko": "[EMOJI] [EMOJI](Sharpe Ratio)[EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI]. [EMOJI] ([EMOJI] [EMOJI] - [EMOJI] [EMOJI]) / [EMOJI] [EMOJI]. [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI].",
        "en": "The Sharpe Ratio is a measure of risk-adjusted return. Formula: (Portfolio Return - Risk-free Rate) / Portfolio Standard Deviation. Higher values indicate better risk-adjusted returns."
    },
    "portfolio optimization": {
        "ko": "[EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI], [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI]. [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI].",
        "en": "Portfolio optimization is the process of finding the best asset allocation that maximizes returns for a given risk level, or minimizes risk for a target return. It's based on Markowitz's Modern Portfolio Theory."
    },
    "quantum optimization": {
        "ko": "[EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI](QAOA)[EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI]. [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI].",
        "en": "Quantum optimization uses quantum computing algorithms (QAOA) to solve optimization problems. It can potentially outperform traditional methods for complex problems."
    },
    "optimizer": {
        "ko": "[EMOJI] [EMOJI] [EMOJI]: 1) [EMOJI] [EMOJI] [EMOJI] ([EMOJI]: AAPL, GOOGL, MSFT), 2) [EMOJI] [EMOJI] [EMOJI] ([EMOJI] 1.0[EMOJI] [EMOJI]), 3) [EMOJI] [EMOJI] [EMOJI], 4) [EMOJI] [EMOJI] [EMOJI] ([EMOJI]/[EMOJI]), 5) [EMOJI] [EMOJI] [EMOJI] [EMOJI].",
        "en": "To use the optimizer: 1) Enter stock tickers (e.g., AAPL, GOOGL, MSFT), 2) Enter existing weights (sum must be 1.0), 3) Adjust risk factor, 4) Select optimization method (quantum/classical), 5) Click optimize button."
    }
}

def find_relevant_knowledge(query: str, language: str = "ko") -> str:
    """[EMOJI] [EMOJI] [EMOJI] [EMOJI]"""
    query_lower = query.lower()
    
    # [EMOJI] [EMOJI]
    for keyword, knowledge in KNOWLEDGE_BASE.items():
        if keyword in query_lower:
            return knowledge.get(language, knowledge.get("en", ""))
    
    return ""

def generate_response(user_message: str, history: List[Dict] = None, language: str = "ko") -> str:
    """[EMOJI] [EMOJI] [EMOJI]"""
    if history is None:
        history = []
    
    # [EMOJI] [EMOJI] [EMOJI]
    knowledge = find_relevant_knowledge(user_message, language)
    
    if knowledge:
        return knowledge
    
    # [EMOJI] [EMOJI]
    if language == "ko":
        return "[EMOJI]. [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI]. [EMOJI] [EMOJI], [EMOJI] [EMOJI], [EMOJI] [EMOJI] [EMOJI] [EMOJI] [EMOJI]."
    else:
        return "Sorry, I couldn't find an answer to that question. Please ask about portfolio optimization, Sharpe ratio, quantum optimization, etc."

def chat(message: str, history: List[Dict] = None, language: str = "ko") -> Dict:
    """[EMOJI] [EMOJI] [EMOJI]"""
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

