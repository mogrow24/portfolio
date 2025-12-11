/**
 * 긴급 프로젝트 데이터 복구 스크립트
 * 브라우저 콘솔에서 실행 (F12 > Console)
 * 
 * 이 스크립트는 모든 가능한 곳에서 프로젝트 데이터를 찾습니다.
 */

(function() {
  console.log('🔍 프로젝트 데이터 긴급 복구 시작...\n');
  
  const STORAGE_KEY = 'site_projects';
  const allFoundProjects = [];
  const allSources = [];
  
  // 1. 현재 저장된 데이터
  const current = localStorage.getItem(STORAGE_KEY);
  if (current) {
    try {
      const projects = JSON.parse(current);
      if (Array.isArray(projects) && projects.length > 0) {
        allFoundProjects.push(...projects);
        allSources.push(`현재 저장: ${projects.length}개`);
        console.log(`✅ 현재 저장: ${projects.length}개`);
      }
    } catch (e) {
      console.error('현재 데이터 파싱 실패:', e);
    }
  }
  
  // 2. 모든 백업 키 확인
  const allKeys = Object.keys(localStorage);
  const backupKeys = allKeys.filter(key => 
    key.includes('backup') || 
    key.includes('project') ||
    key.includes('site_')
  );
  
  console.log(`\n📦 찾은 키들:`, backupKeys);
  
  backupKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          allSources.push(`${key}: ${parsed.length}개`);
          console.log(`  ✅ ${key}: ${parsed.length}개`);
          // 중복 제거하면서 추가
          parsed.forEach(p => {
            if (p && (p.id || p.title_ko || p.title_en)) {
              const exists = allFoundProjects.find(existing => 
                existing.id === p.id || 
                (existing.title_ko === p.title_ko && existing.title_en === p.title_en)
              );
              if (!exists) {
                allFoundProjects.push(p);
              }
            }
          });
        } else if (parsed.projects && Array.isArray(parsed.projects)) {
          allSources.push(`${key}: ${parsed.projects.length}개 (중첩)`);
          console.log(`  ✅ ${key}: ${parsed.projects.length}개 (중첩된 projects 속성)`);
          parsed.projects.forEach(p => {
            if (p && (p.id || p.title_ko || p.title_en)) {
              const exists = allFoundProjects.find(existing => 
                existing.id === p.id || 
                (existing.title_ko === p.title_ko && existing.title_en === p.title_en)
              );
              if (!exists) {
                allFoundProjects.push(p);
              }
            }
          });
        }
      }
    } catch (e) {
      // 파싱 실패는 무시
    }
  });
  
  // 3. 결과 출력
  console.log(`\n📊 총 ${allFoundProjects.length}개 프로젝트 발견:`);
  console.table(allFoundProjects.map((p, i) => ({
    번호: i + 1,
    ID: p.id || '없음',
    제목_한글: p.title_ko || p.title || '없음',
    제목_영문: p.title_en || '없음',
    카테고리: p.category || '없음',
    공개: p.is_visible !== false ? '예' : '아니오'
  })));
  
  console.log('\n📋 발견된 모든 소스:', allSources);
  
  // 4. 복구 제안
  if (allFoundProjects.length > 0) {
    console.log(`\n💾 복구 가능한 프로젝트: ${allFoundProjects.length}개`);
    
    // order_index 정리
    allFoundProjects.forEach((p, index) => {
      if (!p.order_index && p.order_index !== 0) {
        p.order_index = index;
      }
      // 필수 필드 확인
      if (!p.id) {
        p.id = `proj-${Date.now()}-${index}`;
      }
    });
    
    const recover = confirm(
      `총 ${allFoundProjects.length}개 프로젝트를 찾았습니다.\n\n` +
      `복구하시겠습니까?\n\n` +
      `※ 복구 전에 현재 데이터를 백업합니다.`
    );
    
    if (recover) {
      // 현재 데이터 백업
      const currentBackup = localStorage.getItem(STORAGE_KEY);
      if (currentBackup) {
        const backupKey = `site_projects_backup_before_recover_${Date.now()}`;
        localStorage.setItem(backupKey, currentBackup);
        console.log(`✅ 현재 데이터 백업 완료: ${backupKey}`);
      }
      
      // 복구
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allFoundProjects));
      
      // 이벤트 발생
      window.dispatchEvent(new CustomEvent('siteDataUpdated', {
        detail: { key: STORAGE_KEY, data: allFoundProjects }
      }));
      
      console.log(`✅ ${allFoundProjects.length}개 프로젝트 복구 완료!`);
      console.log('\n🔄 페이지를 새로고침하세요 (F5)');
      
      alert(
        `✅ 복구 완료!\n\n` +
        `${allFoundProjects.length}개 프로젝트가 복구되었습니다.\n\n` +
        `페이지를 새로고침하세요.`
      );
      
      return allFoundProjects;
    }
  } else {
    console.warn('\n⚠️ 복구할 프로젝트를 찾을 수 없습니다.');
    console.log('\n💡 다음을 시도해보세요:');
    console.log('1. 다른 브라우저 확인');
    console.log('2. 다른 탭 확인');
    console.log('3. 이전에 저장한 백업 파일 확인');
    
    return null;
  }
  
  return allFoundProjects;
})();


