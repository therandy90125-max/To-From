#!/bin/bash

echo "=== Testing Stock Price Integration ==="
echo ""

# Test 1: US Stock (Apple)
echo "Test 1: US Stock - AAPL"
curl -X GET http://localhost:5000/api/stock/price/AAPL
echo -e "\n"

# Test 2: Korean Stock (Samsung)
echo "Test 2: Korean Stock - 005930.KS"
curl -X GET http://localhost:5000/api/stock/price/005930.KS
echo -e "\n"

# Test 3: Batch request
echo "Test 3: Batch prices"
curl -X POST http://localhost:5000/api/stock/prices \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["AAPL", "GOOGL", "005930.KS", "000660.KS"]}'
echo -e "\n"

# Test 4: Spring Boot integration
echo "Test 4: Spring Boot search endpoint"
curl -X GET "http://localhost:8080/api/stocks/search?q=apple"
echo -e "\n"

# Test 5: Spring Boot stock info
echo "Test 5: Spring Boot stock info endpoint"
curl -X GET "http://localhost:8080/api/stocks/info/AAPL"
echo -e "\n"

echo "=== Tests Complete ==="

