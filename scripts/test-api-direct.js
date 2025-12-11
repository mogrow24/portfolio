/**
 * 방문자 수 API 직접 테스트 스크립트
 * 개발 서버가 실행 중일 때 사용
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';

function testAPI() {
  console.log('🧪 방문자 수 API 테스트 시작...\n');
  console.log('⏳ 서버 연결 확인 중...\n');

  // 1. GET 요청 테스트 (어드민 대시보드에서 사용)
  console.log('1️⃣ GET /api/visitors 테스트 (어드민 대시보드용)...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/visitors',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('✅ GET 응답 성공!');
          console.log('   Status:', res.statusCode);
          console.log('   Response:', JSON.stringify(result, null, 2));
          
          if (result.success && typeof result.count === 'number') {
            console.log(`\n✅ 누적 방문자 수: ${result.count.toLocaleString()}명`);
            console.log('\n✅ 테스트 통과!');
            console.log('\n📋 확인 사항:');
            console.log('   1. 어드민 대시보드의 방문자 배지가 이 숫자와 동일한지 확인');
            console.log('   2. 프론트엔드 Footer의 방문자 수와 동일한지 확인');
            console.log('   3. VisitorsTab에서 "누적 방문자"가 표시되는지 확인');
            process.exit(0);
          } else {
            console.log('⚠️  응답 형식이 예상과 다릅니다');
            if (result.error) {
              console.log('   에러:', result.error);
            }
            process.exit(1);
          }
        } else {
          console.log(`❌ HTTP ${res.statusCode}`);
          console.log('   Response:', data);
          process.exit(1);
        }
      } catch (error) {
        console.log('❌ JSON 파싱 실패:', error.message);
        console.log('   Raw response:', data);
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ 요청 실패:', error.message);
    console.log('\n💡 서버가 실행 중인지 확인하세요:');
    console.log('   cd portfolio');
    console.log('   npm run dev');
    process.exit(1);
  });

  req.end();
}

// 실행
testAPI();

