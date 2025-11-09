# 중복 파일 정리 완료 보고서

**Date:** 2025-11-09  
**Status:** ✅ 완료

---

## 정리된 파일

다음 파일들이 `archive/` 디렉토리로 이동되었습니다:

### 1. start-all.ps1
- **이유**: `start-dev.ps1`로 대체됨
- **차이점**: 
  - 구버전: 이모지 사용, 경로 처리 미흡
  - 신버전: 이모지 제거, 경로 자동 감지, 더 나은 에러 처리

### 2. stop-all.ps1
- **이유**: `stop-dev.ps1`로 대체됨
- **차이점**:
  - 구버전: 기본적인 포트 종료 기능
  - 신버전: 프로세스 이름 표시, 더 상세한 정보 제공

### 3. check-health.ps1
- **이유**: `check-services.ps1`로 대체됨
- **차이점**:
  - 구버전: 기본적인 health check만 수행
  - 신버전: 포트 확인, HTTP health check, JSON 파싱, 더 많은 정보 제공

### 4. start-spring-boot.ps1 (루트)
- **이유**: `backend/start-spring-boot.ps1`로 대체됨
- **차이점**:
  - 구버전: 루트 디렉토리에 위치
  - 신버전: backend 디렉토리에 전용 스크립트로 위치

---

## 현재 표준 스크립트

다음 스크립트들이 표준으로 사용됩니다:

### 서비스 관리
- ✅ `start-dev.ps1` - 모든 서비스 시작
- ✅ `stop-dev.ps1` - 모든 서비스 중지
- ✅ `restart-dev.ps1` - 모든 서비스 재시작

### 상태 확인
- ✅ `check-services.ps1` - 서비스 상태 및 health check
- ✅ `check-ports.ps1` - 포트 사용 확인
- ✅ `diagnose-connections.ps1` - 연결 진단 도구

### 개별 서비스
- ✅ `backend/start-spring-boot.ps1` - Spring Boot 전용 시작

---

## 선택적 유지 파일

다음 파일은 선택적으로 유지됩니다:

- `start-dev-simple.ps1` - 간단 버전 (이모지 포함, 선택적 사용)

---

## 사용 권장 사항

1. **표준 스크립트 사용**: `start-dev.ps1`, `stop-dev.ps1`, `check-services.ps1`
2. **문서 참조**: `QUICK_COMMANDS.md`에서 최신 명령어 확인
3. **구버전 파일**: `archive/` 디렉토리에서 필요시 참조 가능

---

## Archive 디렉토리 구조

```
archive/
├── README.md              # Archive 설명
├── start-all.ps1         # 구버전 (이동됨)
├── stop-all.ps1          # 구버전 (이동됨)
├── check-health.ps1      # 구버전 (이동됨)
└── start-spring-boot.ps1  # 구버전 (이동됨)
```

---

**정리 완료일:** 2025-11-09

