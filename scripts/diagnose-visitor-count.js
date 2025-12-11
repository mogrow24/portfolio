/**
 * 방문자 수 문제 진단 스크립트
 * 실제 문제를 파악하기 위한 상세 진단
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

async function diagnose() {
  console.log('🔍 방문자 수 문제 진단 시작...\n');
  console.log(`📍 API 베이스 URL: ${API_BASE}\n`);

  // 1. GET 요청 테스트
  console.log('1️⃣ GET /api/visitors 테스트...');
  try {
    const response = await fetch(`${API_BASE}/api/visitors`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    console.log(`   HTTP 상태: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('   응답 데이터:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`   ✅ 성공: 방문자 수 = ${data.count}`);
    } else {
      console.log(`   ❌ 실패: ${data.error || '알 수 없는 오류'}`);
    }
  } catch (error) {
    console.error('   ❌ 요청 실패:', error.message);
  }

  console.log('\n2️⃣ POST /api/visitors 테스트 (실제로 증가시킴)...');
  try {
    const response = await fetch(`${API_BASE}/api/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    console.log(`   HTTP 상태: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('   응답 데이터:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`   ✅ 성공: 방문자 수 = ${data.count} (증가됨)`);
    } else {
      console.log(`   ❌ 실패: ${data.error || '알 수 없는 오류'}`);
    }
  } catch (error) {
    console.error('   ❌ 요청 실패:', error.message);
  }

  console.log('\n3️⃣ 다시 GET으로 확인...');
  try {
    const response = await fetch(`${API_BASE}/api/visitors`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data = await response.json();
    if (data.success) {
      console.log(`   ✅ 최종 방문자 수: ${data.count}`);
    }
  } catch (error) {
    console.error('   ❌ 요청 실패:', error.message);
  }

  console.log('\n📋 진단 완료');
  console.log('\n💡 다음을 확인하세요:');
  console.log('   1. 서버 로그에서 환경 변수 검증 결과 확인');
  console.log('   2. Supabase 연결 상태 확인');
  console.log('   3. visitor_count 테이블에 데이터가 있는지 확인');
  console.log('   4. RPC 함수 increment_visitor_count가 존재하는지 확인');
}

diagnose().catch(console.error);

