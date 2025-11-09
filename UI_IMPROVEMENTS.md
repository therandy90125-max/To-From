# UI 개선 아이디어 (Lovable AI 참고)

## 📊 Lovable AI Portfolio Optimizer 특징

### 현재 구조
- **왼쪽**: 입력 폼 (Stock Tickers, Investment Amount, Risk Tolerance)
- **오른쪽**: 결과 표시 영역 (Get Started 플레이스홀더)
- **디자인**: 다크 테마, 그린 악센트, 깔끔한 레이아웃

### 주요 입력 필드
1. **Stock Tickers**: 쉼표로 구분된 티커 입력
   - 예: "AAPL, GOOGL, MSFT, BTC-USD, 005930.KS"
   - 도움말: "Enter stock tickers separated by commas..."
2. **Investment Amount ($)**: 투자 금액
   - 예: 10000
3. **Risk Tolerance**: 드롭다운 선택
   - Medium - Balanced (선택됨)
4. **Optimize Portfolio**: 그린 버튼

## 🔄 현재 프로젝트와 비교

### 현재 프로젝트의 장점
- ✅ Dashboard에서 포트폴리오 불러오기
- ✅ 실시간 주가 위젯
- ✅ 양자/클래식 비교 기능
- ✅ 상세한 차트 및 시각화
- ✅ 환율 변환 기능

### 개선 가능한 부분 (Lovable 참고)
1. **더 간단한 초기 UI**
   - 처음 접하는 사용자를 위한 간단한 입력 폼
   - "Get Started" 플레이스홀더 대신 안내 메시지

2. **Investment Amount 필드 추가**
   - 현재는 포트폴리오 가치를 Dashboard에서 가져옴
   - 직접 투자 금액 입력 옵션 추가

3. **Risk Tolerance 드롭다운**
   - 현재는 슬라이더 (0.0 ~ 1.0)
   - 사용자 친화적인 드롭다운 옵션:
     - Conservative (0.0-0.3)
     - Medium - Balanced (0.4-0.6)
     - Aggressive (0.7-1.0)

4. **티커 입력 개선**
   - 현재: Dashboard에서 선택
   - 개선: 직접 입력 + 검색 기능 결합
   - 직접 입력 가능
   - 검색으로 자동완성 지원

## 💡 구현 제안

### 새로운 컴포넌트: `PortfolioOptimizerLovable.jsx`

```jsx
// 주요 특징:
- 왼쪽: 간단한 입력 폼
- 오른쪽: 결과 표시 (초기에는 안내 메시지)
- Investment Amount 필드 추가
- Risk Tolerance 드롭다운
- 티커 직접 입력 + 검색 기능
```

### UI 레이아웃
```
┌─────────────────────────────────────────┐
│  Portfolio Optimizer                    │
│  AI-powered stock portfolio optimization│
├──────────────┬──────────────────────────┤
│  입력 폼      │  결과 영역               │
│              │                          │
│  Stock       │  [초기: Get Started]     │
│  Tickers     │  또는                    │
│              │  [결과: 차트/표]         │
│  Investment  │                          │
│  Amount      │                          │
│              │                          │
│  Risk        │                          │
│  Tolerance   │                          │
│              │                          │
│  [Optimize]  │                          │
└──────────────┴──────────────────────────┘
```

## 🎨 디자인 개선

### 색상 팔레트
- 다크 테마 유지
- 그린 악센트 (#00B894 또는 #00D4AA)
- 깔끔한 흰색 텍스트

### 레이아웃
- 2컬럼 레이아웃 (입력/결과)
- 반응형 디자인
- 모바일에서는 스택 레이아웃

## 📝 다음 단계

1. **간단한 입력 폼 버전 추가**
   - `PortfolioOptimizerSimple` 개선
   - Investment Amount 필드 추가
   - Risk Tolerance 드롭다운 추가

2. **결과 표시 영역 개선**
   - 초기 상태: 안내 메시지
   - 로딩 상태: 진행 표시
   - 결과 상태: 차트 및 통계

3. **사용자 경험 개선**
   - 입력 검증
   - 에러 메시지 개선
   - 성공 피드백

