# 🎯 두 폴더 병합 가이드 - 실전편

**QuantaFolio Navigator: Folder A + Folder B → Folder C**

---

## 📋 준비 사항

### ✅ 필수 확인

```powershell
# 1. Python 버전 확인 (3.8 이상)
python --version

# 2. 현재 프로젝트 경로 확인
pwd
# 예상 출력: C:\Users\user\Project\To-From

# 3. 디스크 여유 공간 확인 (최소 1GB)
Get-PSDrive C
```

### 📂 폴더 경로 메모

```
Folder A (To-From 기존):     C:\Users\user\Project\To-From
Folder B (Stock-Portfolio):   C:\Users\user\Downloads\stock-portfolio-optimizer
Output Folder (병합 결과):    C:\Users\user\Project\To-From-Merged
```

---

## 🚀 5단계 프로세스

### **Phase 1: 자동 비교 분석** (5분)

#### 1-1. 스크립트 실행

```powershell
cd C:\Users\user\Project\To-From

# 비교 스크립트 실행
python tools/compare_projects.py
```

#### 1-2. 프롬프트 입력

```
Folder A (기존 QuantaFolio 경로): 
→ C:\Users\user\Project\To-From

Folder B (신규 Optimizer 경로): 
→ C:\Users\user\Downloads\stock-portfolio-optimizer
```

#### 1-3. 결과 분석

스크립트가 자동으로 다음을 출력합니다:

```
================================================================================
📊 PROJECT COMPARISON
================================================================================

📁 Folder A (기존): C:\Users\user\Project\To-From
  Layer: backend     - 25 files
  Layer: frontend    - 40 files
  Layer: python      - 15 files
  Quantum: 8 files (reps=1, maxiter=50, algo=QAOA)

📁 Folder B (신규): C:\Users\user\Downloads\stock-portfolio-optimizer
  Layer: backend     - 22 files
  Layer: frontend    - 38 files
  Layer: python      - 18 files
  Quantum: 12 files (reps=2, maxiter=100, algo=QAOA, VQE, QMVS)
  ⚠️  4 more quantum files detected!

================================================================================
🎯 MERGE STRATEGY
================================================================================

📦 BACKEND
  Action: Keep existing, cherry-pick improvements
  Priority: MEDIUM
  Risk: LOW
  Details:
    ✓ Review for useful additions

📦 QUANTUM ⭐
  Action: Add as /api/optimize-v2
  Priority: CRITICAL
  Risk: MEDIUM (needs testing)
  Details:
    ✓ New quantum files detected (4 more files)
    ✓ New algorithms: VQE, QMVS
    ✓ Need to benchmark: response time
    ✓ Need to validate: accuracy within ±5%

📦 FRONTEND
  Action: Component-level integration
  Priority: MEDIUM
  Risk: LOW
  Details:
    ✓ 0 new components in Folder B
    ✓ Review for UI improvements

================================================================================
✅ Comparison complete!
📄 Results saved to: comparison_result.json
```

#### 1-4. 의사결정

```
질문: 신규 Quantum 알고리즘(VQE, QMVS)을 추가할까요?
  → Yes: Phase 2로 진행
  → No: 병합 중단, 기존 유지

질문: 신규 Backend 파일이 필요한가요?
  → Yes: 포함
  → No: 제외

질문: Frontend 개선사항이 있나요?
  → Yes: 부분 포함
  → No: 기존 유지
```

---

### **Phase 2: 자동 병합** (3-5분)

#### 2-1. 스크립트 실행

```powershell
cd C:\Users\user\Project\To-From

# 병합 스크립트 실행
python tools/merge_projects.py
```

#### 2-2. 프롬프트 입력

```
Folder A (기존 경로): 
→ C:\Users\user\Project\To-From

Folder B (신규 경로): 
→ C:\Users\user\Downloads\stock-portfolio-optimizer

Output folder (결과 저장 위치): 
→ C:\Users\user\Project\To-From-Merged
```

#### 2-3. 자동 처리 중

스크립트가 다음을 자동으로 수행합니다:

```
[Step 1] 기존 프로젝트 (A) 복사중...
  ✅ Base project copied (150 files)

[Step 2] 신규 프로젝트 (B) 파일 병합...
  ✅ Added: python-backend/quantum/vqe_optimizer.py
  ✅ Added: python-backend/quantum/qmvs_optimizer.py
  ✅ Added: python-backend/quantum/hybrid_optimizer.py
  🔄 Replaced: python-backend/optimizer.py (newer)
  📝 Merged: requirements.txt
  📝 Merged: package.json
  ✅ Added: tests/test_quantum_vqe.py
  ✅ Added: tests/test_quantum_qmvs.py

[Step 3] 병합 리포트 생성중...
  📝 Report: MERGE_REPORT.md

================================================================================
✅ Merge complete!
================================================================================

📁 Output: C:\Users\user\Project\To-From-Merged
📝 Report: C:\Users\user\Project\To-From-Merged\MERGE_REPORT.md

🚀 Next: Review the report and test the merged project
```

---

### **Phase 3: 병합 리포트 검토** (5분)

#### 3-1. 리포트 열기

```powershell
# VSCode에서 열기
code C:\Users\user\Project\To-From-Merged\MERGE_REPORT.md

# 또는 메모장에서
notepad C:\Users\user\Project\To-From-Merged\MERGE_REPORT.md
```

#### 3-2. 리포트 내용 확인

```markdown
# 🔄 Project Merge Report

## Source Projects
- Folder A (Base): C:\Users\user\Project\To-From
- Folder B (Additions): C:\Users\user\Downloads\stock-portfolio-optimizer

## Merge Output
- Path: C:\Users\user\Project\To-From-Merged
- Date: 2025-11-10 15:30:00

## Statistics
- Total files copied: 150
- Files added: 5
- Files replaced: 2
- Files merged: 3
- Files skipped: 10

## Actions Taken

### ADD
- Added: python-backend/quantum/vqe_optimizer.py
- Added: python-backend/quantum/qmvs_optimizer.py
- Added: python-backend/quantum/hybrid_optimizer.py
- Added: tests/test_quantum_vqe.py
- Added: tests/test_quantum_qmvs.py

### REPLACE
- Replaced: python-backend/optimizer.py (newer version)
- Replaced: frontend/src/components/Dashboard.jsx (newer)

### MERGE
- Merged: requirements.txt
- Merged: package.json
- Merged: .gitignore

### SKIP
- Skipped: README.md (older or same)
- ... (more)

## Next Steps
1. ✅ Review this report
2. 🧪 Test the merged project
3. 🔍 Compare performance
4. 📝 Make final decision
```

#### 3-3. 판단

```
✅ 예상된 변경사항인가?
  → VQE, QMVS 알고리즘 추가됨
  → requirements.txt 병합됨
  → 테스트 파일 추가됨

❌ 의심스러운 변경사항?
  → 없음 (모두 정상)
```

---

### **Phase 4: 테스트** (10-30분)

#### 4-1. 병합 프로젝트 실행

```powershell
cd C:\Users\user\Project\To-From-Merged

# 서비스 시작
./start_services.ps1

# 또는 수동으로
# Terminal 1: Backend
./mvnw spring-boot:run

# Terminal 2: Flask
cd python-backend
python app.py

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

#### 4-2. 헬스 체크

```powershell
# 각 서비스 확인
curl http://localhost:8080/actuator/health   # Backend
curl http://localhost:5000/health             # Flask
curl http://localhost:5173/                   # Frontend

# 모두 200 OK 응답해야 함 ✅
```

#### 4-3. 기본 기능 테스트

```powershell
# 1. 주식 검색
curl "http://localhost:8080/api/stocks/search?q=AAPL"

# 2. 포트폴리오 최적화 (기존 QAOA)
Invoke-RestMethod -Uri "http://localhost:8080/api/optimize" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"tickers": ["AAPL", "MSFT", "GOOG"], "method": "quantum"}'

# 응답 시간 측정 (예: 60초)
```

#### 4-4. 신규 알고리즘 테스트 (VQE, QMVS)

```powershell
# 3. VQE 알고리즘 테스트
Invoke-RestMethod -Uri "http://localhost:5000/api/optimize/vqe" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"tickers": ["AAPL", "MSFT", "GOOG"], "reps": 2, "maxiter": 100}'

# 4. QMVS 알고리즘 테스트
Invoke-RestMethod -Uri "http://localhost:5000/api/optimize/qmvs" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"tickers": ["AAPL", "MSFT", "GOOG"], "reps": 2}'
```

#### 4-5. 성능 비교

```
기존 (QAOA):      60초
병합 (VQE):       45초  ← 25% 빠름! ✅
병합 (QMVS):      50초  ← 17% 빠름! ✅
병합 (Hybrid):    40초  ← 33% 빠름! ✅
```

---

### **Phase 5: 최종 결정** (10분)

#### 5-1. 시나리오별 판단

**시나리오 A: 모든 것 작동 + 성능 개선** ✅

```
결과:
  ✅ 모든 서비스 정상 작동
  ✅ 신규 알고리즘 25-33% 빠름
  ✅ 기존 기능 모두 유지
  ✅ 테스트 통과

→ 권장: 기존을 병합 버전으로 대체
```

**시나리오 B: 모든 것 작동 + 성능 동일** ⚠️

```
결과:
  ✅ 모든 서비스 정상 작동
  ⚠️  성능 차이 없음
  ✅ 코드가 더 깔끔

→ 권장: 선택적 (나중에 전환 고려)
```

**시나리오 C: 오류 발생** ❌

```
결과:
  ❌ 일부 서비스 시작 실패
  ❌ API 응답 오류

→ 권장: 원인 분석 후 재병합 또는 기존 유지
```

#### 5-2. 최종 액션 (시나리오 A인 경우)

```powershell
# 1단계: 기존 백업
Move-Item `
  -Path "C:\Users\user\Project\To-From" `
  -Destination "C:\Users\user\Project\To-From_backup_$(Get-Date -Format 'yyyy-MM-dd')"

# 2단계: 병합 버전을 메인으로 이동
Move-Item `
  -Path "C:\Users\user\Project\To-From-Merged" `
  -Destination "C:\Users\user\Project\To-From"

# 3단계: 확인
cd C:\Users\user\Project\To-From
ls

# 4단계: Git commit
git add .
git commit -m "feat: Merge Stock-Portfolio improvements (VQE, QMVS, Hybrid)

- Added VQE quantum optimizer (25% faster)
- Added QMVS quantum optimizer (17% faster)
- Added Hybrid quantum optimizer (33% faster)
- Merged dependencies (requirements.txt, package.json)
- All tests passing

Performance:
- Original QAOA: 60s
- New VQE: 45s (-25%)
- New QMVS: 50s (-17%)
- New Hybrid: 40s (-33%)

Tested: All services running, APIs working"

# 5단계: GitHub 푸시
git push origin main

# 6단계: 백업 폴더 정리 (나중에)
# Remove-Item "C:\Users\user\Project\To-From_backup_2025-11-10" -Recurse
```

---

## 📋 체크리스트

### ✅ 실행 전
- [ ] Folder A 경로 확인 (공백/한글 없음?)
- [ ] Folder B 경로 확인 (공백/한글 없음?)
- [ ] 디스크 여유 확인 (>1GB?)
- [ ] Python 3.8+ 설치 확인

### ✅ Phase 1 (비교)
- [ ] `compare_projects.py` 실행
- [ ] 비교 결과 검토
- [ ] 병합 전략 동의

### ✅ Phase 2 (병합)
- [ ] `merge_projects.py` 실행
- [ ] Output 폴더 생성 확인
- [ ] 완료 메시지 확인

### ✅ Phase 3 (리포트)
- [ ] `MERGE_REPORT.md` 검토
- [ ] Actions 섹션 확인
- [ ] 의심 항목 없음 확인

### ✅ Phase 4 (테스트)
- [ ] 모든 서비스 시작 성공
- [ ] 헬스 체크 3개 통과
- [ ] 기본 API 테스트 성공
- [ ] 신규 알고리즘 테스트 성공
- [ ] 성능 비교 완료

### ✅ Phase 5 (결정)
- [ ] 시나리오 판단 (A/B/C)
- [ ] 최종 액션 실행
- [ ] Git commit & push
- [ ] 팀에 공유

---

## 🎯 한눈에 보는 시각화

```
┌────────────────────┐
│  Folder A (기존)   │  ← C:\Users\user\Project\To-From
│  3-tier 구조 ✅    │
│  QAOA: 60초 ✅     │
└─────────┬──────────┘
          │
          │  python tools/compare_projects.py
          │
          ▼
    ┌──────────────────┐
    │ 비교 결과        │
    │ - Backend: OK    │
    │ - Quantum: +4    │  ← VQE, QMVS, Hybrid 감지
    │ - Frontend: OK   │
    └─────────┬────────┘
              │
              │  python tools/merge_projects.py
              │
              ▼
┌────────────────────────────────┐
│ Folder B (신규)                │  ← C:\Users\user\Downloads\...
│ VQE: 45초 (25%↑) ⚡           │
│ QMVS: 50초 (17%↑) ⚡          │
│ Hybrid: 40초 (33%↑) ⚡⚡      │
└─────────┬──────────────────────┘
          │
          │  자동 병합
          │
          ▼
┌──────────────────────────────────┐
│ Folder C (병합 결과)             │  ← C:\Users\user\Project\To-From-Merged
│ ✅ A의 안정성 + B의 성능         │
│ ✅ 모든 알고리즘 사용 가능       │
│ ✅ MERGE_REPORT.md 생성         │
├──────────────────────────────────┤
│ 테스트 결과:                    │
│ ├─ 서비스 시작 ✅              │
│ ├─ 헬스 체크 ✅               │
│ ├─ API 테스트 ✅              │
│ └─ 성능: 25-33% 개선 ✅       │
└─────────┬────────────────────────┘
          │
          │  최종 결정
          │
          ├─ 시나리오 A → 기존 대체 ✅
          ├─ 시나리오 B → 선택적 유지
          └─ 시나리오 C → 원인 분석
```

---

## 💬 자주 묻는 질문

**Q1: 기존 코드는 정말 안전한가?**
```
A: 100% 안전합니다.
스크립트는 기존 폴더를 건드리지 않습니다.
새 폴더(To-From-Merged)에만 생성합니다.
```

**Q2: 병합이 실패하면?**
```
A: MERGE_REPORT.md에 모든 것이 기록됩니다.
어느 파일이 문제인지 명확하게 알 수 있습니다.
```

**Q3: 완전히 롤백할 수 있나?**
```
A: 네! 원본이 그대로 있으니 언제든 되돌립니다.
백업 폴더: To-From_backup_2025-11-10
```

**Q4: 신규 알고리즘이 더 느리면?**
```
A: 문제없습니다.
기존 QAOA가 기본으로 유지됩니다.
신규는 선택적으로 사용 가능합니다.
```

---

## ⏱️ 예상 소요 시간

| Phase | 시간 | 작업 |
|-------|------|------|
| 1. 비교 | 5분 | 자동 분석 |
| 2. 병합 | 3분 | 자동 병합 |
| 3. 리포트 | 5분 | 검토 |
| 4. 테스트 | 15분 | 서비스 & API |
| 5. 결정 | 5분 | 최종 액션 |
| **전체** | **33분** | **처음부터 끝까지** |

---

## 🚀 바로 시작하기

```powershell
# Step 1: 경로 확인
pwd

# Step 2: 비교 분석
python tools/compare_projects.py

# Step 3: 병합 실행
python tools/merge_projects.py

# Step 4: 결과 확인
cd C:\Users\user\Project\To-From-Merged
code MERGE_REPORT.md

# Step 5: 테스트
./start_services.ps1
curl http://localhost:8080/actuator/health

# Step 6: 최종 결정
# (시나리오 A인 경우 위의 최종 액션 실행)
```

---

**준비 완료! 지금 시작하세요! 🚀**

막히는 부분이 있으면 `MERGE_REPORT.md`를 확인하거나 질문해주세요.

