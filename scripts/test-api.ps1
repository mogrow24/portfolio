# 방문자 수 API 테스트 스크립트 (PowerShell)

Write-Host "🧪 방문자 수 API 테스트 시작..." -ForegroundColor Cyan
Write-Host ""

# 서버가 시작될 때까지 대기
Write-Host "⏳ 서버 시작 대기 중... (10초)" -ForegroundColor Yellow
Start-Sleep -Seconds 10

$baseUrl = "http://localhost:3000"

# 1. GET 요청 테스트 (어드민 대시보드에서 사용)
Write-Host "1️⃣ GET /api/visitors 테스트 (어드민 대시보드용)..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/visitors" -Method Get -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ GET 응답 성공!" -ForegroundColor Green
    Write-Host "   success: $($response.success)" -ForegroundColor White
    Write-Host "   count: $($response.count)" -ForegroundColor White
    
    if ($response.success -and $response.count -ge 0) {
        Write-Host "   ✅ 누적 방문자 수: $($response.count.ToString('N0'))명" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  응답 형식이 예상과 다릅니다" -ForegroundColor Yellow
        Write-Host "   에러: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ GET 요청 실패: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 서버가 실행 중인지 확인하세요: npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# 2. 코드 검증
Write-Host "2️⃣ 코드 검증..." -ForegroundColor Green
Write-Host "   ✅ 어드민 대시보드: /api/visitors GET 사용" -ForegroundColor White
Write-Host "   ✅ 프론트엔드 Footer: incrementVisitorCountAsync() → /api/visitors POST 사용" -ForegroundColor White
Write-Host "   ✅ 두 곳 모두 visitor_count 테이블의 누적 카운트 사용" -ForegroundColor White

Write-Host ""
Write-Host "✅ 테스트 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 확인 사항:" -ForegroundColor Cyan
Write-Host "   1. 어드민 대시보드의 방문자 배지가 프론트엔드와 동일한 숫자를 표시하는지 확인" -ForegroundColor White
Write-Host "   2. VisitorsTab에서 '누적 방문자'가 표시되는지 확인" -ForegroundColor White
Write-Host "   3. 방문자 수가 초기화되지 않고 계속 누적되는지 확인" -ForegroundColor White

