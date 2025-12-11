# PowerShell 배포 스크립트

Write-Host "🚀 배포를 시작합니다..." -ForegroundColor Green

# 빌드 확인
Write-Host "📦 빌드 확인 중..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 빌드 실패" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 빌드 성공" -ForegroundColor Green

# Vercel 배포
Write-Host "🌐 Vercel에 배포 중..." -ForegroundColor Yellow
npx vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 배포 완료!" -ForegroundColor Green
} else {
    Write-Host "❌ 배포 실패" -ForegroundColor Red
    exit 1
}



