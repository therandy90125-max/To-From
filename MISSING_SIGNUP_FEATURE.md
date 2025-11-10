# ⚠️ 회원가입 기능 누락 확인

**Date:** 2025-11-10  
**Issue:** Stock-Portfolio-Optimizer에서 회원가입 기능을 찾을 수 없음

---

## 🔍 검색 결과

### Stock-Portfolio-Optimizer 프로젝트 검색
- ❌ `*Signup*.java` - 없음
- ❌ `*Register*.java` - 없음
- ❌ `*Auth*.java` - 없음
- ❌ `*User*.java` - 없음
- ❌ `*Signup*.jsx` - 없음
- ❌ `*Register*.jsx` - 없음

### 확인된 파일들
```
controller/
  - ChatbotController.java
  - PortfolioController.java
  - VisualizationController.java

service/
  - ChatbotService.java
  - PortfolioService.java
  - PythonIntegrationService.java

model/
  - OptimizationResult.java
  - Stock.java

repository/
  - StockRepository.java
```

### 발견된 기능
- ✅ 세션 기반 포트폴리오 관리 (`userSession` 필드)
- ✅ H2 인메모리 데이터베이스
- ❌ 회원가입/로그인 기능 없음

---

## 💡 해석

Stock-Portfolio-Optimizer는 **세션 기반**으로 작동하며, 별도의 회원가입/로그인 기능이 없습니다.

- `Stock` 엔티티에 `userSession` 필드가 있음
- UUID 기반 세션 ID로 사용자 구분
- 영구 저장 없음 (H2 인메모리)

---

## 🎯 권장 사항

To-From 프로젝트에 회원가입 기능을 추가하려면:

1. **User 엔티티 생성**
2. **UserController 생성** (회원가입/로그인 API)
3. **UserService 생성** (비즈니스 로직)
4. **UserRepository 생성** (JPA Repository)
5. **프론트엔드 Signup/Login 컴포넌트 생성**
6. **Spring Security 통합** (JWT 또는 Session)

---

**Status:** 회원가입 기능이 Stock-Portfolio-Optimizer에 없음  
**Action:** To-From에 새로 구현 필요

