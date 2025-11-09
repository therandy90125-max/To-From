# Archive Directory

이 디렉토리는 구버전 또는 중복된 스크립트 파일들을 보관합니다.

## Archived Files

### 구버전 스크립트 (최신 버전으로 대체됨)

1. **start-all.ps1** → `start-dev.ps1`로 대체
   - 이유: 최신 버전이 더 개선되고 경로 수정됨

2. **stop-all.ps1** → `stop-dev.ps1`로 대체
   - 이유: 최신 버전이 더 상세한 정보 제공

3. **check-health.ps1** → `check-services.ps1`로 대체
   - 이유: 최신 버전이 더 많은 기능 제공

4. **start-spring-boot.ps1** (루트) → `backend/start-spring-boot.ps1`로 대체
   - 이유: backend 디렉토리에 전용 스크립트가 있음

## 사용 권장 사항

- **표준 스크립트 사용**: `start-dev.ps1`, `stop-dev.ps1`, `check-services.ps1`
- **문서 참조**: `QUICK_COMMANDS.md`에서 최신 명령어 확인

## Archived Date

2025-11-09

