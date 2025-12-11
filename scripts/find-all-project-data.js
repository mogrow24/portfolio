/**
 * 모든 프로젝트 데이터 찾기 스크립트
 * 브라우저 콘솔에서 실행 (F12 > Console)
 */

(function() {
  console.log('🔍 프로젝트 데이터 완전 검색 시작...\n');
  
  const STORAGE_KEY = 'site_projects';
  const allFoundProjects = [];
  const allSources = [];
  const rawData = [];
  
  // 1. 현재 저장된 데이터
  const current = localStorage.getItem(STORAGE_KEY);
  if (current) {
    try {
      const projects = JSON.parse(current);
      if (Array.isArray(projects)) {
        rawData.push({ source: '현재 저장', data: projects, count: projects.length });
        console.log(`✅ 현재 저장: ${projects.length}개`);
        projects.forEach(p => {
          if (p && (p.id || p.title_ko || p.title_en)) {
            allFoundProjects.push(p);
            allSources.push('현재 저장');
          }
        });
      }
    } catch (e) {
      console.error('현재 데이터 파싱 실패:', e);
    }
  }
  
  // 2. 모든 localStorage 키 확인
  const allKeys = Object.keys(localStorage);
  console.log(`\n📦 총 ${allKeys.length}개 키 발견`);
  
  allKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (!data || data.length < 10) return; // 너무 짧은 데이터는 무시
      
      // JSON 파싱 시도
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch (e) {
        return; // JSON이 아니면 스킵
      }
      
      // 프로젝트 데이터인지 확인
      if (Array.isArray(parsed)) {
        const hasProjectData = parsed.some(item => 
          item && 
          (item.title_ko || item.title_en || item.id || 
           item.project_ko || item.project_en || 
           item.tags || item.gallery)
        );
        
        if (hasProjectData && parsed.length > 0) {
          rawData.push({ source: key, data: parsed, count: parsed.length });
          console.log(`  ✅ ${key}: ${parsed.length}개 항목`);
          
          parsed.forEach(p => {
            if (p && (p.id || p.title_ko || p.title_en || p.title)) {
              // 중복 체크
              const exists = allFoundProjects.find(existing => {
                if (existing.id && p.id && existing.id === p.id) return true;
                if (existing.title_ko && p.title_ko && existing.title_ko === p.title_ko) return true;
                if (existing.title_en && p.title_en && existing.title_en === p.title_en) return true;
                return false;
              });
              
              if (!exists) {
                allFoundProjects.push(p);
                allSources.push(key);
              }
            }
          });
        }
      } else if (parsed && typeof parsed === 'object') {
        // 중첩된 구조 확인
        if (parsed.projects && Array.isArray(parsed.projects)) {
          rawData.push({ source: `${key} (projects 속성)`, data: parsed.projects, count: parsed.projects.length });
          console.log(`  ✅ ${key}: ${parsed.projects.length}개 (중첩)`);
          
          parsed.projects.forEach(p => {
            if (p && (p.id || p.title_ko || p.title_en || p.title)) {
              const exists = allFoundProjects.find(existing => {
                if (existing.id && p.id && existing.id === p.id) return true;
                if (existing.title_ko && p.title_ko && existing.title_ko === p.title_ko) return true;
                return false;
              });
              
              if (!exists) {
                allFoundProjects.push(p);
                allSources.push(`${key} (중첩)`);
              }
            }
          });
        }
      }
    } catch (e) {
      // 무시
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
    설명_있음: (p.project_ko || p.project_en) ? '예' : '아니오',
    갤러리: Array.isArray(p.gallery) ? p.gallery.length : 0,
    소스: allSources[i] || '알 수 없음'
  })));
  
  // 4. 가장 내용이 많은 데이터 찾기
  console.log('\n📋 발견된 모든 소스:');
  rawData.forEach(src => {
    console.log(`  - ${src.source}: ${src.count}개`);
  });
  
  // 5. 가장 완전한 데이터 선택
  const bestSource = rawData.reduce((best, current) => {
    if (!best) return current;
    
    // 더 많은 항목
    if (current.count > best.count) return current;
    
    // 같은 수라면 더 많은 필드가 있는 것
    const currentComplete = current.data.filter(p => 
      p && (p.project_ko || p.project_en) && 
      (p.role_ko || p.role_en) &&
      Array.isArray(p.gallery) && p.gallery.length > 0
    ).length;
    
    const bestComplete = best.data.filter(p => 
      p && (p.project_ko || p.project_en) && 
      (p.role_ko || p.role_en) &&
      Array.isArray(p.gallery) && p.gallery.length > 0
    ).length;
    
    return currentComplete > bestComplete ? current : best;
  }, null);
  
  if (bestSource) {
    console.log(`\n🏆 가장 완전한 데이터: ${bestSource.source} (${bestSource.count}개)`);
    
    // 데이터 상세 확인
    console.log('\n📝 프로젝트별 상세 정보:');
    bestSource.data.forEach((p, i) => {
      console.log(`\n[${i + 1}] ${p.title_ko || p.title_en || '제목 없음'}`);
      console.log(`  - 설명: ${(p.project_ko || p.project_en || '').substring(0, 50)}...`);
      console.log(`  - 역할: ${Array.isArray(p.role_ko || p.role_en) ? (p.role_ko || p.role_en).length : 0}개`);
      console.log(`  - 갤러리: ${Array.isArray(p.gallery) ? p.gallery.length : 0}개`);
      console.log(`  - 태그: ${Array.isArray(p.tags) ? p.tags.join(', ') : '없음'}`);
    });
  }
  
  // 6. 복구 제안
  if (allFoundProjects.length > 0) {
    const recover = confirm(
      `총 ${allFoundProjects.length}개 프로젝트를 찾았습니다.\n\n` +
      `가장 완전한 데이터: ${bestSource ? bestSource.source : '없음'}\n\n` +
      `복구하시겠습니까?`
    );
    
    if (recover) {
      // 가장 완전한 데이터 사용 (없으면 중복 제거한 모든 데이터)
      const dataToRestore = bestSource ? bestSource.data : allFoundProjects;
      
      // 현재 데이터 백업
      if (current) {
        const backupKey = `site_projects_backup_before_recover_${Date.now()}`;
        localStorage.setItem(backupKey, current);
        console.log(`✅ 현재 데이터 백업 완료: ${backupKey}`);
      }
      
      // order_index 정리
      const restored = dataToRestore.map((p, index) => ({
        ...p,
        order_index: typeof p.order_index === 'number' ? p.order_index : index,
        id: p.id || `proj-${Date.now()}-${index}`
      })).sort((a, b) => a.order_index - b.order_index);
      
      // 복구
      localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
      
      // 이벤트 발생
      window.dispatchEvent(new CustomEvent('siteDataUpdated', {
        detail: { key: STORAGE_KEY, data: restored }
      }));
      
      console.log(`✅ ${restored.length}개 프로젝트 복구 완료!`);
      console.log('\n🔄 페이지를 새로고침하세요 (F5)');
      
      alert(
        `✅ 복구 완료!\n\n` +
        `${restored.length}개 프로젝트가 복구되었습니다.\n\n` +
        `페이지를 새로고침하세요.`
      );
      
      return restored;
    }
  } else {
    console.warn('\n⚠️ 복구할 프로젝트를 찾을 수 없습니다.');
    console.log('\n💡 다음을 시도해보세요:');
    console.log('1. 다른 브라우저 확인');
    console.log('2. 다른 탭 확인');
    console.log('3. 이전에 저장한 백업 파일 확인');
    
    alert('❌ 복구할 데이터를 찾을 수 없습니다.\n\n다른 브라우저나 탭을 확인해보세요.');
    
    return null;
  }
  
  // 7. 원본 데이터 출력 (수동 복구용)
  console.log('\n\n📄 원본 데이터 (JSON):');
  console.log('='.repeat(60));
  if (bestSource) {
    console.log(JSON.stringify(bestSource.data, null, 2));
  } else if (allFoundProjects.length > 0) {
    console.log(JSON.stringify(allFoundProjects, null, 2));
  }
  console.log('='.repeat(60));
  
  return allFoundProjects;
})();


