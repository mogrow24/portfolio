/**
 * 프로젝트 데이터 복구 스크립트
 * 브라우저 콘솔에서 실행하여 저장된 프로젝트 데이터를 확인하고 복구합니다.
 */

// 브라우저 콘솔에서 실행할 복구 코드
const recoverProjectsScript = `
// 1. 현재 저장된 프로젝트 데이터 확인
console.log('=== 프로젝트 데이터 복구 ===');
const stored = localStorage.getItem('site_projects');
if (stored) {
  try {
    const projects = JSON.parse(stored);
    console.log('✅ 저장된 프로젝트 찾음:', projects.length, '개');
    console.table(projects.map(p => ({
      id: p.id,
      제목: p.title_ko || p.title_en,
      카테고리: p.category,
      공개: p.is_visible,
      순서: p.order_index
    })));
    
    // 데이터 백업
    const backup = {
      timestamp: new Date().toISOString(),
      projects: projects,
      count: projects.length
    };
    localStorage.setItem('site_projects_backup_' + Date.now(), JSON.stringify(backup));
    console.log('✅ 백업 완료');
    
    return projects;
  } catch (e) {
    console.error('❌ 데이터 파싱 실패:', e);
    return null;
  }
} else {
  console.warn('⚠️ 저장된 프로젝트 데이터 없음');
  
  // 백업된 데이터 확인
  const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('site_projects_backup_'));
  if (backupKeys.length > 0) {
    console.log('📦 백업 데이터 찾음:', backupKeys.length, '개');
    const latestBackup = backupKeys.sort().pop();
    const backupData = JSON.parse(localStorage.getItem(latestBackup));
    console.log('최신 백업:', new Date(backupData.timestamp));
    console.table(backupData.projects.map(p => ({
      id: p.id,
      제목: p.title_ko || p.title_en,
      카테고리: p.category
    })));
    
    // 복구 제안
    if (confirm('백업된 데이터를 복구하시겠습니까?')) {
      localStorage.setItem('site_projects', JSON.stringify(backupData.projects));
      console.log('✅ 복구 완료');
      location.reload();
    }
    return backupData.projects;
  }
  
  return null;
}
`;

// Node.js에서 실행 가능한 복구 함수
function recoverProjects() {
  console.log('=== 프로젝트 데이터 복구 ===');
  
  // 브라우저 환경이 아니면 안내
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.log(`
브라우저 콘솔에서 다음 코드를 실행하세요:

${recoverProjectsScript}

또는 간단히:
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 선택
3. 다음 코드 붙여넣기:

const stored = localStorage.getItem('site_projects');
if (stored) {
  const projects = JSON.parse(stored);
  console.log('저장된 프로젝트:', projects.length, '개');
  console.log(projects);
  
  // 백업
  localStorage.setItem('site_projects_backup_' + Date.now(), stored);
  console.log('백업 완료!');
} else {
  console.warn('저장된 데이터 없음');
}
    `);
    return;
  }
  
  // 브라우저 환경에서 실행
  eval(recoverProjectsScript);
}

// 브라우저에서 직접 사용할 수 있도록 export
if (typeof window !== 'undefined') {
  window.recoverProjects = recoverProjects;
}

module.exports = { recoverProjects, recoverProjectsScript };


