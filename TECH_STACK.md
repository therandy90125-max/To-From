# 🛠️ QuantaFolio Navigator - Tech Stack 명세서

**프로젝트:** QuantaFolio Navigator (To-From)  
**아키텍처:** 3-Tier Microservices  
**최종 업데이트:** 2025-11-10  
**버전:** 1.0.0

---

## 📊 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Layer (Port 5173)                     │
│                    React 18.2.0 + Vite 5.0.0                    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API Gateway Layer (Port 8080)                  │
│              Spring Boot 3.2.3 + Java 17                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ RestTemplate
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                Processing Engine Layer (Port 5000)               │
│                  Flask 3.0.0 + Python 3.11                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ JDBC
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer (Port 3306)                        │
│                    MariaDB 10.11+ / H2 2.2.224                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Stack

### **Core Framework**
| 기술 | 버전 | 용도 | 라이센스 |
|-----|------|------|---------|
| **React** | 18.2.0 | UI 라이브러리 | MIT |
| **React DOM** | 18.2.0 | DOM 렌더링 | MIT |
| **Vite** | 5.0.0 | 빌드 도구 & 개발 서버 | MIT |

### **Routing & State**
| 기술 | 버전 | 용도 |
|-----|------|------|
| **React Router DOM** | 7.9.5 | SPA 라우팅 |

### **HTTP Client**
| 기술 | 버전 | 용도 |
|-----|------|------|
| **Axios** | 1.6.0 | REST API 클라이언트 |

### **UI & Visualization**
| 기술 | 버전 | 용도 |
|-----|------|------|
| **Recharts** | 2.15.4 | 차트 라이브러리 (포트폴리오 분석) |
| **ReactFlow** | 11.11.4 | 워크플로우 시각화 (AI Agent) |
| **Framer Motion** | 12.23.24 | 애니메이션 |
| **Lucide React** | (Icon Library) | 아이콘 세트 |

### **Styling**
| 기술 | 버전 | 용도 |
|-----|------|------|
| **Tailwind CSS** | 3.4.0 | 유틸리티 CSS 프레임워크 |
| **PostCSS** | 8.4.32 | CSS 후처리 |
| **Autoprefixer** | 10.4.17 | 브라우저 호환성 |

### **Development Tools**
| 기술 | 버전 | 용도 |
|-----|------|------|
| **ESLint** | 9.36.0 | 코드 린터 |
| **@vitejs/plugin-react** | 4.2.0 | Vite React 플러그인 |
| **TypeScript Definitions** | React 19.1.16, React-DOM 19.1.9 | 타입 정의 |

### **Environment**
```bash
Node.js: 18+ (권장: 20.x LTS)
npm: 9+
Package Manager: npm
```

---

## ⚙️ Backend Stack (Spring Boot)

### **Core Framework**
| 기술 | 버전 | 용도 | 라이센스 |
|-----|------|------|---------|
| **Spring Boot** | 3.2.3 | Java 백엔드 프레임워크 | Apache 2.0 |
| **Java** | 17 (LTS) | 프로그래밍 언어 | GPL v2 + Classpath |
| **Maven** | 3.8+ | 빌드 도구 | Apache 2.0 |

### **Spring Boot Starters**
| 의존성 | 버전 | 용도 |
|-------|------|------|
| **spring-boot-starter-web** | 3.2.3 | REST API 개발 (Tomcat 내장) |
| **spring-boot-starter-data-jpa** | 3.2.3 | JPA & Hibernate |
| **spring-boot-starter-actuator** | 3.2.3 | 헬스 체크 & 모니터링 |
| **spring-boot-starter-validation** | 3.2.3 | 입력 검증 |

### **Database Drivers**
| 드라이버 | 버전 | 용도 | 환경 |
|---------|------|------|------|
| **H2 Database** | 2.2.224 (runtime) | In-memory 개발 DB | Development |
| **MariaDB Connector/J** | 3.3.2 (runtime) | Production DB 드라이버 | Production |

**설정:**
```properties
# Development (H2)
spring.datasource.url=jdbc:h2:mem:toandfrom
spring.datasource.driver-class-name=org.h2.Driver

# Production (MariaDB)
spring.datasource.url=jdbc:mariadb://localhost:3306/toandfrom
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
```

### **Utilities**
| 라이브러리 | 버전 | 용도 |
|----------|------|------|
| **Lombok** | Provided | 보일러플레이트 코드 제거 |
| **Spring Web (RestTemplate)** | Built-in | HTTP 클라이언트 (Flask 통신) |

### **Testing**
| 라이브러리 | 버전 | 용도 |
|----------|------|------|
| **spring-boot-starter-test** | 3.2.3 | 테스트 프레임워크 |
| **JUnit** | 5 (Jupiter) | 단위 테스트 |

### **Environment**
```bash
Java: OpenJDK 17+ (권장: Amazon Corretto 17)
Maven: 3.8+
Spring Boot: 3.2.3
Tomcat: 10.1.x (내장)
```

---

## 🐍 Python Backend Stack (Flask)

### **Core Framework**
| 기술 | 버전 | 용도 | 라이센스 |
|-----|------|------|---------|
| **Python** | 3.11+ | 프로그래밍 언어 | PSF |
| **Flask** | 3.0.0+ | 마이크로 웹 프레임워크 | BSD-3 |
| **Flask-CORS** | 4.0.0+ | CORS 지원 | MIT |
| **Flask-SocketIO** | 5.3.0+ | 웹소켓 지원 | MIT |
| **python-socketio** | 5.9.0+ | Socket.IO 클라이언트 | MIT |

### **Quantum Computing**
| 라이브러리 | 버전 | 용도 |
|----------|------|------|
| **Qiskit** | 0.45.0+ | 양자 컴퓨팅 프레임워크 (IBM) |
| **qiskit-algorithms** | 0.2.0+ | QAOA, VQE 알고리즘 |
| **qiskit-finance** | 0.4.0+ | 금융 최적화 |
| **qiskit-optimization** | 0.6.0+ | 포트폴리오 최적화 |

### **Data & Analysis**
| 라이브러리 | 버전 | 용도 |
|----------|------|------|
| **yfinance** | 0.2.28+ | 실시간 주가 조회 (Yahoo Finance) |
| **NumPy** | 1.24.0+ | 수치 계산 |
| **Pandas** | 2.0.0+ | 데이터 분석 & 조작 |

### **Visualization**
| 라이브러리 | 버전 | 용도 |
|----------|------|------|
| **Matplotlib** | 3.7.0+ | 그래프 생성 |

### **Utilities**
| 라이브러리 | 버전 | 용도 |
|----------|------|------|
| **python-dateutil** | 2.8.2+ | 날짜 처리 |
| **requests** | 2.31.0+ | HTTP 클라이언트 (환율 API) |

### **Environment**
```bash
Python: 3.11+ (권장: 3.11.x)
pip: 23+
Virtual Environment: venv
```

---

## 💾 Database Stack

### **Development Database**
| 기술 | 버전 | 용도 | 포트 |
|-----|------|------|------|
| **H2 Database** | 2.2.224 | In-memory 개발용 DB | - |

**특징:**
- ✅ 메모리 기반 (빠른 테스트)
- ✅ 웹 콘솔 제공 (`/h2-console`)
- ⚠️ 재시작 시 데이터 초기화

**접속 정보:**
```
URL: jdbc:h2:mem:toandfrom
Username: sa
Password: (empty)
Console: http://localhost:8080/h2-console
```

---

### **Production Database**
| 기술 | 버전 | 용도 | 포트 |
|-----|------|------|------|
| **MariaDB** | 10.11+ (LTS) | 프로덕션 RDBMS | 3306 |

**특징:**
- ✅ MySQL 호환
- ✅ 오픈소스 (GPL v2)
- ✅ 높은 성능 & 안정성
- ✅ 데이터 영구 저장

**접속 정보:**
```
Host: localhost
Port: 3306
Database: toandfrom
Username: root
Password: 0000 (기본값, 변경 권장)
```

**엔진:**
```sql
Storage Engine: InnoDB (기본값)
Character Set: utf8mb4
Collation: utf8mb4_unicode_ci
```

**JPA 설정:**
```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MariaDBDialect
spring.jpa.properties.hibernate.format_sql=true
```

---

## 🔧 Build & Deployment Tools

### **Build Tools**
| 도구 | 버전 | 용도 |
|-----|------|------|
| **Maven** | 3.8+ | Java 빌드 (Spring Boot) |
| **npm** | 9+ | Node.js 패키지 관리 (Frontend) |
| **pip** | 23+ | Python 패키지 관리 |

### **Version Control**
| 도구 | 버전 | 용도 |
|-----|------|------|
| **Git** | 2.40+ | 버전 관리 |
| **GitHub** | - | 원격 저장소 |

### **IDE & Editors**
| 도구 | 권장 버전 | 용도 |
|-----|---------|------|
| **IntelliJ IDEA** | 2024.x | Java 개발 |
| **VS Code** | 1.85+ | Frontend & Python 개발 |
| **Cursor** | Latest | AI 코딩 어시스턴트 |

---

## 🌐 External APIs

### **Stock Data**
| API | 용도 | 인증 |
|-----|------|------|
| **Yahoo Finance (yfinance)** | 주가 데이터 | 불필요 |
| **Alpha Vantage** | 글로벌 주식 검색 | API Key: `AKD5ALSCZK8YSJNJ` |

### **Exchange Rate**
| API | 용도 | 인증 |
|-----|------|------|
| **ExchangeRate-API.com** | 실시간 환율 (USD ↔ KRW) | 불필요 (Free tier) |

**Endpoint:**
```
GET https://api.exchangerate-api.com/v4/latest/USD
Response: { "rates": { "KRW": 1320.50, ... } }
```

---

## 📦 Package Structure

### **Backend (Spring Boot)**
```
com.toandfrom.toandfrom/
├── controller/           # REST API 컨트롤러
│   ├── PortfolioController.java
│   ├── ChatbotController.java
│   ├── StockSearchController.java
│   ├── WorkflowController.java
│   └── CurrencyController.java  ← NEW (환율 API)
├── service/              # 비즈니스 로직
│   ├── PortfolioOptimizationService.java
│   ├── PortfolioDataService.java
│   ├── StockCacheService.java
│   ├── ChatbotService.java
│   └── WorkflowOrchestrator.java
├── entity/               # JPA 엔티티
│   ├── PortfolioResult.java
│   └── StockWeight.java
├── repository/           # JPA Repository
│   ├── PortfolioResultRepository.java
│   └── StockWeightRepository.java
└── ToandfromApplication.java  # Main 클래스
```

### **Frontend (React)**
```
src/
├── components/
│   ├── Dashboard.jsx
│   ├── PortfolioOptimizer.jsx
│   ├── PortfolioOptimizerWithWeights.jsx
│   ├── Chatbot.jsx
│   ├── StockSearchInput.jsx
│   ├── ExchangeRateWidget.jsx  ← NEW (환율 위젯)
│   ├── CurrencyDisplay.jsx
│   ├── EnhancedCharts.jsx
│   └── WorkflowVisualizer.jsx
├── contexts/
│   └── LanguageContext.jsx
├── utils/
│   ├── i18n.js
│   └── currencyUtils.js
├── api/
│   └── portfolioApi.js
├── App.jsx
└── main.jsx
```

### **Python Backend (Flask)**
```
python-backend/
├── app.py                    # Flask 메인
├── optimizer.py              # QAOA 양자 최적화
├── chatbot.py                # 챗봇 엔진
├── stock_data.py             # yfinance 통합
├── stock_price_service.py    # 실시간 주가
├── workflow_engine.py        # AI Agent 워크플로우
└── data/
    └── korean_stocks.json    # 한국 주식 DB
```

---

## 🔐 Security

### **인증 & 인가**
- ⚠️ 현재 인증 미구현 (개발 단계)
- 🔜 향후 Spring Security + JWT 추가 예정

### **CORS 설정**
```java
// Spring Boot
@CrossOrigin(origins = "http://localhost:5173")

// Flask
CORS(app, origins=["http://localhost:5173"])
```

### **API Keys**
```bash
# Alpha Vantage (주식 검색)
ALPHA_VANTAGE_KEY=AKD5ALSCZK8YSJNJ

# 환율 API (인증 불필요)
# 무료 tier: 250 requests/day
```

---

## 📊 Performance

### **응답 시간 (목표)**
| 작업 | 목표 시간 | 현재 |
|-----|----------|------|
| 포트폴리오 최적화 (QAOA) | < 60초 | ~60초 ✅ |
| 실시간 주가 조회 | < 2초 | ~1초 ✅ |
| 주식 검색 | < 1초 | ~0.5초 ✅ |
| 환율 조회 | < 1초 | ~0.3초 ✅ |

### **동시 사용자**
- 개발 환경: 1-5명
- 프로덕션 목표: 100명 (동시 접속)

---

## 🚀 Deployment

### **Development**
```bash
# Backend (Spring Boot)
./mvnw spring-boot:run

# Python (Flask)
python python-backend/app.py

# Frontend (Vite)
npm run dev
```

### **Production (예정)**
| 컴포넌트 | 플랫폼 | 예상 비용 |
|---------|-------|----------|
| Frontend | Netlify/Vercel | 무료 |
| Spring Boot | AWS EC2 t3.medium | $30/월 |
| Flask | AWS EC2 t3.small | $15/월 |
| MariaDB | AWS RDS t3.micro | $15/월 |
| **Total** | | **$60/월** |

---

## 📝 License

### **오픈소스 라이선스**
- React, Vite, Axios: MIT License
- Spring Boot: Apache License 2.0
- Flask: BSD-3-Clause License
- Qiskit: Apache License 2.0
- MariaDB: GPL v2

### **프로젝트 라이선스**
- QuantaFolio Navigator: Private (비공개)

---

## 📞 Support

### **개발 환경 문제**
1. **Java 버전 확인:** `java -version` (17+ 필요)
2. **Node 버전 확인:** `node -v` (18+ 필요)
3. **Python 버전 확인:** `python --version` (3.11+ 필요)

### **의존성 설치**
```bash
# Backend
cd backend && ./mvnw clean install

# Frontend
cd frontend && npm install

# Python
cd python-backend && pip install -r requirements.txt
```

---

**마지막 업데이트:** 2025-11-10  
**문서 버전:** 1.0.0  
**담당자:** QuantaFolio Team

