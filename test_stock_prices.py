#!/usr/bin/env python3
"""
Python Test Script for Stock Price Integration
주가 조회 통합 테스트 스크립트
"""

import requests
import json
from typing import Dict, Any

# Base URLs
FLASK_URL = "http://localhost:5000"
SPRING_BOOT_URL = "http://localhost:8080"

def print_test_header(test_name: str):
    """Print test header"""
    print(f"\n{'='*60}")
    print(f"Test: {test_name}")
    print(f"{'='*60}")

def print_response(response: requests.Response):
    """Print formatted response"""
    try:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except:
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")

def test_flask_single_stock(symbol: str):
    """Test Flask single stock price endpoint"""
    print_test_header(f"Flask - Single Stock: {symbol}")
    try:
        url = f"{FLASK_URL}/api/stock/price/{symbol}"
        response = requests.get(url, timeout=10)
        print_response(response)
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_flask_batch_prices(symbols: list):
    """Test Flask batch prices endpoint"""
    print_test_header("Flask - Batch Prices")
    try:
        url = f"{FLASK_URL}/api/stock/prices"
        payload = {"symbols": symbols}
        response = requests.post(url, json=payload, timeout=10)
        print_response(response)
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_spring_boot_search(query: str):
    """Test Spring Boot search endpoint"""
    print_test_header(f"Spring Boot - Search: {query}")
    try:
        url = f"{SPRING_BOOT_URL}/api/stocks/search"
        params = {"q": query}
        response = requests.get(url, params=params, timeout=10)
        print_response(response)
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_spring_boot_stock_info(symbol: str):
    """Test Spring Boot stock info endpoint"""
    print_test_header(f"Spring Boot - Stock Info: {symbol}")
    try:
        url = f"{SPRING_BOOT_URL}/api/stocks/info/{symbol}"
        response = requests.get(url, timeout=10)
        print_response(response)
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("Stock Price Integration Test Suite")
    print("주가 조회 통합 테스트")
    print("="*60)
    
    results = []
    
    # Test 1: US Stock
    results.append(("US Stock (AAPL)", test_flask_single_stock("AAPL")))
    
    # Test 2: Korean Stock
    results.append(("Korean Stock (005930.KS)", test_flask_single_stock("005930.KS")))
    
    # Test 3: Batch prices
    results.append(("Batch Prices", test_flask_batch_prices(["AAPL", "GOOGL", "005930.KS", "000660.KS"])))
    
    # Test 4: Spring Boot search
    results.append(("Spring Boot Search", test_spring_boot_search("apple")))
    
    # Test 5: Spring Boot stock info
    results.append(("Spring Boot Stock Info", test_spring_boot_stock_info("AAPL")))
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {len(results)} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()

