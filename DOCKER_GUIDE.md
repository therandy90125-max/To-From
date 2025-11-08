# 🐳 Docker Compose 가이드

**QuantaFolio Navigator - Docker 컨테이너화**

---

## 📋 개요

이 Docker Compose 설정은 다음 서비스들을 포함합니다:

1. **H2 Database** (포트 8082, 9092)
2. **Flask Quantum Service** (포트 5000)
3. **Spring Boot Backend** (포트 8080)
4. **React Frontend** (포트 5173)

---

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# Alpha Vantage API Key 설정
# .env 파일을 열어서 ALPHA_VANTAGE_API_KEY를 설정하세요
```

### 2. 모든 서비스 시작

```bash
docker-compose up -d
```

### 3. 서비스 상태 확인

```bash
docker-compose ps
```

### 4. 로그 확인

```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f quantum-service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. 서비스 중지

```bash
docker-compose down
```

---

## 🔧 개별 서비스 관리

### 특정 서비스만 시작

```bash
# Flask만 시작
docker-compose up -d quantum-service

# Spring Boot만 시작
docker-compose up -d backend

# Frontend만 시작
docker-compose up -d frontend
```

### 서비스 재시작

```bash
# 모든 서비스 재시작
docker-compose restart

# 특정 서비스 재시작
docker-compose restart backend
```

### 서비스 재빌드

```bash
# 모든 서비스 재빌드
docker-compose build

# 특정 서비스 재빌드
docker-compose build quantum-service
```

---

## 🌐 서비스 접속

| 서비스 | URL | 설명 |
|--------|-----|------|
| Frontend | http://localhost:5173 | React 앱 |
| Spring Boot | http://localhost:8080 | API Gateway |
| Flask | http://localhost:5000 | Quantum Service |
| H2 Console | http://localhost:8082 | 데이터베이스 관리 |

---

## 🔍 문제 해결

### 포트 충돌

포트가 이미 사용 중인 경우:

```bash
# 포트 사용 확인
netstat -an | findstr "5000 8080 5173 8082"

# docker-compose.yml에서 포트 변경
ports:
  - "5001:5000"  # Flask 포트 변경
```

### 컨테이너 재빌드

코드 변경 후 재빌드:

```bash
# 캐시 없이 재빌드
docker-compose build --no-cache

# 재시작
docker-compose up -d
```

### 로그 확인

```bash
# 실시간 로그
docker-compose logs -f

# 특정 서비스 에러만
docker-compose logs backend | grep ERROR
```

### 컨테이너 내부 접속

```bash
# Flask 컨테이너 접속
docker exec -it quantafolio-quantum bash

# Spring Boot 컨테이너 접속
docker exec -it quantafolio-backend sh
```

---

## 📊 Health Check

모든 서비스는 health check를 포함합니다:

```bash
# Health 상태 확인
docker-compose ps

# 수동 Health Check
curl http://localhost:5000/api/health  # Flask
curl http://localhost:8080/actuator/health  # Spring Boot
curl http://localhost:5173  # Frontend
```

---

## 🔐 환경 변수

`.env` 파일에 다음 변수를 설정하세요:

```env
# 필수
ALPHA_VANTAGE_API_KEY=your_api_key_here

# 선택사항
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
```

---

## 📦 볼륨 마운트

개발 중 코드 변경을 즉시 반영하려면:

```yaml
volumes:
  - ./python-backend:/app  # Flask
  - ./backend:/app         # Spring Boot
  - ./frontend:/app        # React
```

**주의:** `node_modules`는 볼륨에서 제외되어야 합니다.

---

## 🚀 프로덕션 배포

프로덕션 환경에서는:

1. **환경 변수**: `.env` 파일을 안전하게 관리
2. **볼륨 제거**: 코드를 이미지에 포함
3. **Health Check**: 모든 서비스에 health check 활성화
4. **리소스 제한**: `deploy.resources` 설정 추가

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

---

## 📝 유용한 명령어

```bash
# 모든 컨테이너 중지 및 제거
docker-compose down

# 볼륨까지 제거
docker-compose down -v

# 이미지까지 제거
docker-compose down --rmi all

# 네트워크 확인
docker network ls
docker network inspect quantafolio-network

# 리소스 사용량 확인
docker stats
```

---

## ✅ 체크리스트

- [ ] `.env` 파일 생성 및 API 키 설정
- [ ] Docker 및 Docker Compose 설치 확인
- [ ] 포트 충돌 확인 (5000, 8080, 5173, 8082)
- [ ] `docker-compose up -d` 실행
- [ ] 모든 서비스 health check 통과 확인
- [ ] 브라우저에서 http://localhost:5173 접속 확인

---

**준비 완료!** 🎉

