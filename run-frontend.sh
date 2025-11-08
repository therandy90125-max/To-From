#!/bin/bash

# Run Frontend from project root
# 프로젝트 루트에서 프론트엔드 실행

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "Starting React Frontend..."
echo ""

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ frontend 폴더를 찾을 수 없습니다!"
    exit 1
fi

cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules가 없습니다. npm install 실행 중..."
    npm install
fi

echo "✅ Frontend 시작 중..."
echo "   URL: http://localhost:5173"
echo ""

npm run dev

