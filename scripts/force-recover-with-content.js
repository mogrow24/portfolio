/**
 * 내용이 있는 프로젝트 데이터 강제 복구 스크립트
 * 브라우저 콘솔에서 실행 (F12 > Console)
 * 
 * 이 스크립트는 localStorage의 모든 키를 검색하여
 * 내용이 있는 프로젝트 데이터만 찾아서 복구합니다.
 */

(function() {
  console.log('🔍 내용이 있는 프로젝트 데이터 강제 검색 시작...\n');
  
  const STORAGE_KEY = 'site_projects';
  const allData = [];
  
  // 1. 모든 localStorage 키 검색
  const allKeys = Object.keys(localStorage);
  console.log(`📦 총 ${allKeys.length}개 키 검색 중...\n`);
  
  allKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (!data || data.length < 20) return; // 너무 짧은 데이터는 무시
      
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch (e) {
        return;
      }
      
      let projects = [];
      
      // 배열인 경우
      if (Array.isArray(parsed)) {
        projects = parsed;
      }
      // 중첩된 projects 속성
      else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.projects)) {
        projects = parsed.projects;
      }
      // 단일 프로젝트 객체인 경우
      else if (parsed && typeof parsed === 'object' && (parsed.title_ko || parsed.title_en || parsed.id)) {
        projects = [parsed];
      }
      
      if (projects.length > 0) {
        // 내용이 있는 프로젝트만 필터링
        const withContent = projects.filter(p => {
          if (!p || typeof p !== 'object') return false;
          
          // 최소한 하나의 내용 필드가 있어야 함
          return (
            (p.project_ko && p.project_ko.trim().length > 0) ||
            (p.project_en && p.project_en.trim().length > 0) ||
            (Array.isArray(p.role_ko) && p.role_ko.length > 0) ||
            (Array.isArray(p.role_en) && p.role_en.length > 0) ||
            (Array.isArray(p.gallery) && p.gallery.length > 0) ||
            (p.problem_ko && p.problem_ko.trim().length > 0) ||
            (p.solution_ko && p.solution_ko.trim().length > 0)
          );
        });
        
        if (withContent.length > 0) {
          console.log(`✅ ${key}: ${withContent.length}개 (내용 있음) / ${projects.length}개 (전체)`);
          allData.push({
            key,
            projects: withContent,
            count: withContent.length,
            totalCount: projects.length
          });
        }
      }
    } catch (e) {
      // 무시
    }
  });
  
  if (allData.length === 0) {
    console.warn('\n⚠️ 내용이 있는 프로젝트 데이터를 찾을 수 없습니다.');
    alert('❌ 내용이 있는 프로젝트 데이터를 찾을 수 없습니다.');
    return null;
  }
  
  // 2. 가장 많은 내용을 가진 데이터 소스 찾기
  console.log(`\n📊 발견된 데이터 소스: ${allData.length}개\n`);
  
  allData.forEach(item => {
    console.log(`  - ${item.key}: ${item.count}개 (내용 있음)`);
  });
  
  // 3. 모든 프로젝트를 합치고 중복 제거 (내용이 많은 것을 우선)
  const projectMap = new Map();
  
  allData.forEach(item => {
    item.projects.forEach(p => {
      const id = p.id || '';
      const title = p.title_ko || p.title_en || '';
      const key = id || title;
      
      if (!key) return;
      
      // 내용 점수 계산
      const getContentScore = (proj) => {
        return (
          (proj.project_ko ? 2 : 0) +
          (proj.project_en ? 2 : 0) +
          (Array.isArray(proj.role_ko) ? proj.role_ko.length : 0) +
          (Array.isArray(proj.role_en) ? proj.role_en.length : 0) +
          (Array.isArray(proj.outcome_ko) ? proj.outcome_ko.length : 0) +
          (Array.isArray(proj.outcome_en) ? proj.outcome_en.length : 0) +
          (Array.isArray(proj.gallery) ? proj.gallery.length * 2 : 0) +
          (proj.problem_ko ? 1 : 0) +
          (proj.problem_en ? 1 : 0) +
          (proj.solution_ko ? 1 : 0) +
          (proj.solution_en ? 1 : 0)
        );
      };
      
      const existing = projectMap.get(key);
      const newScore = getContentScore(p);
      
      if (!existing || getContentScore(existing) < newScore) {
        projectMap.set(key, p);
      }
    });
  });
  
  const recoveredProjects = Array.from(projectMap.values());
  
  console.log(`\n✅ 최종 복구 가능한 프로젝트: ${recoveredProjects.length}개\n`);
  
  // 4. 각 프로젝트 상세 정보 출력
  recoveredProjects.forEach((p, i) => {
    const hasDesc = !!(p.project_ko || p.project_en);
    const hasRole = Array.isArray(p.role_ko) && p.role_ko.length > 0 || Array.isArray(p.role_en) && p.role_en.length > 0;
    const hasGallery = Array.isArray(p.gallery) && p.gallery.length > 0;
    
    console.log(`[${i + 1}] ${p.title_ko || p.title_en || '제목 없음'}`);
    console.log(`   설명: ${hasDesc ? '✅' : '❌'} | 역할: ${hasRole ? '✅' : '❌'} | 갤러리: ${hasGallery ? `✅ ${p.gallery.length}개` : '❌'}`);
  });
  
  // 5. 복구
  const recover = confirm(
    `총 ${recoveredProjects.length}개 프로젝트를 찾았습니다.\n\n` +
    `모두 내용이 있는 프로젝트입니다.\n\n` +
    `복구하시겠습니까?`
  );
  
  if (!recover) {
    console.log('❌ 복구가 취소되었습니다.');
    return null;
  }
  
  // 현재 데이터 백업
  const current = localStorage.getItem(STORAGE_KEY);
  if (current) {
    const backupKey = `site_projects_backup_before_force_recover_${Date.now()}`;
    localStorage.setItem(backupKey, current);
    console.log(`✅ 현재 데이터 백업: ${backupKey}`);
  }
  
  // order_index 정리
  const finalProjects = recoveredProjects.map((p, index) => ({
    ...p,
    order_index: typeof p.order_index === 'number' ? p.order_index : index,
    id: p.id || `proj-${Date.now()}-${index}`
  })).sort((a, b) => a.order_index - b.order_index);
  
  // 복구
  localStorage.setItem(STORAGE_KEY, JSON.stringify(finalProjects));
  
  // 이벤트 발생
  window.dispatchEvent(new CustomEvent('siteDataUpdated', {
    detail: { key: STORAGE_KEY, data: finalProjects }
  }));
  
  console.log(`\n✅ ${finalProjects.length}개 프로젝트 복구 완료!`);
  console.log('\n🔄 페이지를 새로고침하세요 (F5)');
  
  alert(
    `✅ 복구 완료!\n\n` +
    `${finalProjects.length}개 프로젝트가 복구되었습니다.\n\n` +
    `모두 내용이 있는 프로젝트입니다.\n\n` +
    `페이지를 새로고침하세요.`
  );
  
  return finalProjects;
})();


