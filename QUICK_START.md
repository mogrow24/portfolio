# 🚀 빠른 시작 가이드

## ⚠️ 중요: 올바른 디렉토리에서 실행하세요!

### ❌ 잘못된 방법
```powershell
# 상위 디렉토리에서 실행 (에러 발생!)
PS C:\Users\dbslg\Desktop\개인\커리어 및 프로필\포트폴리오 사이트> npm run dev
```

### ✅ 올바른 방법
```powershell
# portfolio 디렉토리로 이동 후 실행
PS C:\Users\dbslg\Desktop\개인\커리어 및 프로필\포트폴리오 사이트> cd portfolio
PS C:\Users\dbslg\Desktop\개인\커리어 및 프로필\포트폴리오 사이트\portfolio> npm run dev
```

## 📋 단계별 실행 방법

### 1. 터미널 열기
- VS Code: `Ctrl + `` (백틱) 또는 Terminal → New Terminal

### 2. portfolio 디렉토리로 이동
```powershell
cd portfolio
```

### 3. 개발 서버 실행
```powershell
npm run dev
```

### 4. 브라우저에서 확인
- `http://localhost:3000` 접속

## 🔧 문제 해결

### 문제: "Could not read package.json"
**원인**: 상위 디렉토리에서 실행함

**해결**:
```powershell
# 현재 위치 확인
Get-Location

# portfolio 디렉토리로 이동
cd portfolio

# 다시 실행
npm run dev
```

### 문제: 포트가 이미 사용 중
**해결**:
```powershell
# 다른 포트로 실행
$env:PORT=3001; npm run dev
```

### 문제: node_modules 없음
**해결**:
```powershell
cd portfolio
npm install
npm run dev
```

## ✅ 정상 작동 확인

개발 서버가 정상적으로 시작되면:
```
  ▲ Next.js 14.2.33
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.3s
```

이 메시지가 보이면 성공입니다!

## 📝 참고

- **작업 디렉토리**: 항상 `portfolio` 폴더 안에서 실행
- **환경 변수**: `.env.local` 파일이 `portfolio` 폴더에 있어야 함
- **포트**: 기본값은 3000번 포트

