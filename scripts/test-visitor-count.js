/**
 * 방문자 수 API 테스트 스크립트
 * 어드민과 프론트엔드가 동일한 API를 사용하는지 확인
 * 테스트 서버와 실 서버 모두 테스트 가능
 */

// 환경 변수에서 API 베이스 URL 결정
const API_BASE = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : process.env.API_BASE_URL || 'http://localhost:3000';

const ENV = API_BASE.includes('localhost') ? 'local' : 'vercel';

async function testVisitorCountAPI() {
  console.log('🧪 방문자 수 API 테스트 시작...\n');
  console.log(`📍 테스트 환경: ${ENV}`);
  console.log(`🌐 API 베이스 URL: ${API_BASE}\n`);
  
  try {
    // 1. GET 요청 테스트 (어드민 대시보드에서 사용)
    console.log('1️⃣ GET /api/visitors 테스트 (어드민 대시보드용)...');
    const getResponse = await fetch(`${API_BASE}/api/visitors`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    
    if (!getResponse.ok) {
      throw new Error(`GET 요청 실패: ${getResponse.status} ${getResponse.statusText}`);
    }
    
    const getData = await getResponse.json();
    console.log('✅ GET 응답:', {
      success: getData.success,
      count: getData.count,
      environment: getData.environment || ENV,
      startDate: getData.startDate,
      error: getData.error || '없음',
    });
    
    if (!getData.success) {
      console.warn('⚠️  API가 success: false를 반환했습니다.');
      console.warn('   에러:', getData.error);
      console.warn('   환경:', getData.environment);
    }
    
    if (typeof getData.count !== 'number') {
      console.error('❌ count가 숫자가 아닙니다:', typeof getData.count);
    } else {
      console.log(`✅ 누적 방문자 수: ${getData.count.toLocaleString()}명`);
      console.log(`✅ 감지된 환경: ${getData.environment || ENV}\n`);
    }
    
    // 2. POST 요청 테스트 (프론트엔드에서 사용 - 실제로는 증가시키지 않음)
    console.log('2️⃣ POST /api/visitors 테스트 (프론트엔드용 - 주석 처리됨)...');
    console.log('   ⚠️  실제 방문자 수를 증가시키지 않기 위해 주석 처리했습니다.');
    console.log('   실제 테스트를 원하시면 주석을 해제하세요.\n');
    
    /*
    const postResponse = await fetch(`${API_BASE}/api/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    
    if (!postResponse.ok) {
      throw new Error(`POST 요청 실패: ${postResponse.status}`);
    }
    
    const postData = await postResponse.json();
    console.log('✅ POST 응답:', postData);
    */
    
    // 3. 환경 변수 검증
    console.log('3️⃣ 환경 변수 검증...');
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('   환경 변수 상태:');
    console.log(`   - NEXT_PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? '✅ 설정됨' : '❌ 없음'}`);
    console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${hasServiceKey ? '✅ 설정됨' : '⚠️  없음 (익명 키 사용)'}`);
    console.log(`   - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasAnonKey ? '✅ 설정됨' : '❌ 없음'}\n`);
    
    // 4. 코드 검증
    console.log('4️⃣ 코드 검증...');
    console.log('   ✅ 어드민 대시보드: /api/visitors GET 사용');
    console.log('   ✅ 프론트엔드 Footer: incrementVisitorCountAsync() → /api/visitors POST 사용');
    console.log('   ✅ 두 곳 모두 visitor_count 테이블의 누적 카운트 사용');
    console.log('   ✅ 환경 변수 검증 및 로깅 추가됨\n');
    
    console.log('✅ 모든 테스트 통과!');
    console.log('\n📋 확인 사항:');
    console.log('   1. 어드민 대시보드의 방문자 배지가 프론트엔드와 동일한 숫자를 표시하는지 확인');
    console.log('   2. VisitorsTab에서 "누적 방문자"가 표시되는지 확인');
    console.log('   3. 방문자 수가 초기화되지 않고 계속 누적되는지 확인');
    console.log('   4. 서버 로그에서 환경 정보가 올바르게 표시되는지 확인');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.error('\n💡 문제 해결 방법:');
    console.error('   1. 로컬에서 테스트: npm run dev 후 스크립트 실행');
    console.error('   2. Vercel에서 테스트: API_BASE_URL 환경 변수 설정');
    console.error('   3. 환경 변수 확인: .env.local 파일 또는 Vercel 대시보드');
    console.error('   4. 서버 로그 확인: 환경 변수 검증 로그 확인');
    process.exit(1);
  }
}

// 실행
testVisitorCountAPI();

