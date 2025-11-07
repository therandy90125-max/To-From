# QuantaFolio Navigator 🚀

> Quantum-Powered Portfolio Optimization Platform

## 팀원 가이드

### 1. 프로젝트 클론하기 (처음 한 번만)

처음 프로젝트에 참여할 때는 다음 명령어로 저장소를 클론합니다:

```bash
git clone https://github.com/therandy90125-max/To-From.git
cd To-From
```

### 2. 최신 코드 받아오기 (Pull)

매일 작업 시작 전에 최신 코드를 받아옵니다:

```bash
# 현재 브랜치에서 최신 코드 받아오기
git pull origin main
```

또는 다른 브랜치에서 작업 중이라면:

```bash
# main 브랜치로 전환
git checkout main

# 최신 코드 받아오기
git pull origin main
```

### 3. 작업 브랜치 만들기

새로운 기능을 개발하거나 버그를 수정할 때는 별도의 브랜치를 만들어 작업합니다.

#### 방법 1: 로컬에서 브랜치 만들기

```bash
# 1. main 브랜치로 이동
git checkout main

# 2. main 브랜치를 최신 상태로 업데이트
git pull origin main

# 3. 새 브랜치 생성 및 전환
git checkout -b feature/기능명
# 또는
git checkout -b fix/버그수정명

# 예시:
# git checkout -b feature/user-login
# git checkout -b fix/login-error
```

#### 방법 2: 원격 브랜치에서 로컬 브랜치 만들기

다른 팀원이 만든 브랜치를 가져올 때:

```bash
# 원격 브랜치 목록 확인
git fetch origin
git branch -r

# 원격 브랜치를 로컬로 가져오기
git checkout -b feature/기능명 origin/feature/기능명
```

### 4. 브랜치 작업 흐름

```bash
# 1. 브랜치 생성 및 전환
git checkout -b feature/my-feature

# 2. 파일 수정 및 작업

# 3. 변경사항 확인
git status
git diff

# 4. 변경사항 스테이징
git add .

# 5. 커밋
git commit -m "커밋 메시지 작성"

# 6. 원격 저장소에 브랜치 푸시 (처음 푸시할 때)
git push -u origin feature/my-feature

# 7. 이후 변경사항 푸시
git push
```

### 5. 브랜치 목록 확인하기

```bash
# 로컬 브랜치 목록
git branch

# 원격 브랜치 목록
git branch -r

# 모든 브랜치 목록 (로컬 + 원격)
git branch -a
```

### 6. 브랜치 전환하기

```bash
# 다른 브랜치로 전환
git checkout 브랜치명

# 또는 (Git 2.23+)
git switch 브랜치명
```

### 7. 브랜치 삭제하기

```bash
# 로컬 브랜치 삭제
git branch -d 브랜치명

# 강제 삭제 (병합되지 않은 경우)
git branch -D 브랜치명

# 원격 브랜치 삭제
git push origin --delete 브랜치명
```

### 8. 브랜치 네이밍 규칙

브랜치 이름은 기능을 명확하게 표현하는 것이 좋습니다:

- `feature/기능명` - 새 기능 개발
  - 예: `feature/user-authentication`, `feature/payment-system`
- `fix/버그명` - 버그 수정
  - 예: `fix/login-error`, `fix/database-connection`
- `hotfix/긴급수정명` - 긴급 버그 수정
  - 예: `hotfix/security-patch`
- `refactor/리팩토링명` - 코드 리팩토링
  - 예: `refactor/api-structure`

### 9. 작업 흐름 예시

```bash
# 아침에 작업 시작
git checkout main
git pull origin main
git checkout -b feature/add-user-profile

# 작업 후...
git add .
git commit -m "사용자 프로필 기능 추가"
git push -u origin feature/add-user-profile

# 다른 팀원의 변경사항 확인
git checkout main
git pull origin main

# 내 브랜치에 main의 최신 변경사항 반영
git checkout feature/add-user-profile
git merge main
# 또는
git rebase main
```

### 10. 자주 사용하는 Git 명령어

```bash
# 현재 상태 확인
git status

# 변경사항 확인
git diff

# 커밋 히스토리 확인
git log

# 원격 저장소 정보 확인
git remote -v

# 브랜치 이름 변경
git branch -m 이전이름 새로운이름

# 원격 저장소 최신 정보 가져오기 (병합하지 않음)
git fetch origin
```

## 문제 해결

### Pull 충돌이 발생한 경우

```bash
# 1. 현재 변경사항 커밋 또는 스태시
git add .
git commit -m "작업 중인 내용 임시 저장"
# 또는
git stash

# 2. 최신 코드 받아오기
git pull origin main

# 3. 충돌 해결 후
git add .
git commit -m "충돌 해결"
```

### 실수로 잘못된 브랜치에 커밋한 경우

```bash
# 커밋 취소 (변경사항은 유지)
git reset --soft HEAD~1

# 올바른 브랜치로 이동 후 커밋
git checkout 올바른브랜치
git add .
git commit -m "커밋 메시지"
```

## 참고사항

- 작업 전에 항상 `git pull`로 최신 코드를 받아옵니다
- 한 번에 하나의 작업만 하는 브랜치를 만듭니다
- 커밋 메시지는 명확하게 작성합니다
- 작업이 완료되면 Pull Request를 만들어 코드 리뷰를 받습니다

