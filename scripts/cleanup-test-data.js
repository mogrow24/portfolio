// 테스트 데이터 삭제 스크립트
// node scripts/cleanup-test-data.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Supabase 환경 변수가 없습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function cleanupTestData() {
  console.log('🧹 테스트 데이터 삭제 시작...\n');

  try {
    // 1. visitors 테이블에서 테스트 데이터 삭제
    console.log('1. visitors 테이블 정리 중...');
    const { data: allVisitors, error: fetchError } = await supabase
      .from('visitors')
      .select('visitor_id');

    if (fetchError) {
      console.error('❌ 방문자 목록 조회 실패:', fetchError);
      return;
    }

    // 테스트 패턴 필터링
    const testPatterns = [
      /localhost/i,
      /127\.0\.0\.1/i,
      /test/i,
      /admin/i,
      /dev/i,
      /local/i,
    ];

    const testVisitorIds = allVisitors
      .filter(v => {
        const id = v.visitor_id?.toLowerCase() || '';
        // 테스트 패턴 매칭
        if (testPatterns.some(pattern => pattern.test(id))) {
          return true;
        }
        // 사용자 기기 ID 매칭
        if (userDeviceId && v.visitor_id === userDeviceId) {
          return true;
        }
        return false;
      })
      .map(v => v.visitor_id);

    if (testVisitorIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('visitors')
        .delete()
        .in('visitor_id', testVisitorIds);

      if (deleteError) {
        console.error('❌ 테스트 방문자 삭제 실패:', deleteError);
      } else {
        console.log(`✅ ${testVisitorIds.length}개의 테스트 방문자 삭제 완료`);
      }
    } else {
      console.log('✅ 삭제할 테스트 방문자 없음');
    }

    // 2. visitor_count 테이블 초기화 (0으로 리셋)
    console.log('\n2. visitor_count 테이블 초기화 중...');
    const { error: resetError } = await supabase
      .from('visitor_count')
      .update({ count: 0, updated_at: new Date().toISOString() })
      .eq('id', 'global');

    if (resetError) {
      console.error('❌ visitor_count 초기화 실패:', resetError);
    } else {
      console.log('✅ visitor_count 초기화 완료 (0으로 리셋)');
    }

    console.log('\n✅ 테스트 데이터 삭제 완료!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

cleanupTestData();
