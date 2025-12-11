/**
 * 프로젝트 동기화 테스트 스크립트
 * 브라우저 콘솔에서 실행하여 프로젝트 저장/로드 동기화를 테스트합니다.
 */

// 테스트 함수들을 전역으로 노출
if (typeof window !== 'undefined') {
  window.testProjectSync = {
    // 1. 테스트 프로젝트 추가
    async addTestProject() {
      const STORAGE_KEY = 'site_projects';
      const SITE_DATA_UPDATED_EVENT = 'siteDataUpdated';
      
      console.log('🧪 테스트 프로젝트 추가 시작...');
      
      // 현재 프로젝트 로드
      const current = localStorage.getItem(STORAGE_KEY);
      const projects = current ? JSON.parse(current) : [];
      
      // 테스트 프로젝트 생성
      const testProject = {
        id: `test-${Date.now()}`,
        title_ko: `테스트 프로젝트 ${new Date().toLocaleTimeString()}`,
        title_en: `Test Project ${new Date().toLocaleTimeString()}`,
        tags: ['Test', 'Sync'],
        stat_ko: '테스트 성과',
        stat_en: 'Test Result',
        thumb: 'https://via.placeholder.com/400x300/00ffcc/000000?text=Test',
        period: '2024.01 ~ 2024.12',
        team_ko: '테스트 팀',
        team_en: 'Test Team',
        project_ko: '이것은 동기화 테스트를 위한 프로젝트입니다.',
        project_en: 'This is a test project for sync testing.',
        role_ko: ['테스트 역할'],
        role_en: ['Test Role'],
        problem_ko: '테스트 문제',
        problem_en: 'Test Problem',
        solution_ko: '테스트 해결',
        solution_en: 'Test Solution',
        outcome_ko: ['테스트 성과'],
        outcome_en: ['Test Outcome'],
        gallery: [],
        video: '',
        is_visible: true,
        order_index: 0,
        category: 'exhibition',
      };
      
      // 기존 프로젝트들의 order_index 증가
      const reordered = projects.map(p => ({
        ...p,
        order_index: (p.order_index || 0) + 1,
      }));
      
      // 새 프로젝트를 맨 위에 추가
      const updatedProjects = [testProject, ...reordered].map((p, i) => ({
        ...p,
        order_index: i,
      }));
      
      // 저장
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
      
      // 이벤트 발생
      const event = new CustomEvent(SITE_DATA_UPDATED_EVENT, {
        detail: { key: STORAGE_KEY, data: updatedProjects }
      });
      window.dispatchEvent(event);
      
      console.log('✅ 테스트 프로젝트 추가 완료:', testProject.title_ko);
      console.log('📊 총 프로젝트 수:', updatedProjects.length);
      
      return testProject;
    },
    
    // 2. 프로젝트 목록 확인
    checkProjects() {
      const STORAGE_KEY = 'site_projects';
      const current = localStorage.getItem(STORAGE_KEY);
      const projects = current ? JSON.parse(current) : [];
      
      console.log('📋 현재 프로젝트 목록:');
      console.table(projects.map(p => ({
        id: p.id,
        title: p.title_ko || p.title_en,
        visible: p.is_visible,
        order: p.order_index,
        category: p.category,
      })));
      
      return projects;
    },
    
    // 3. 이벤트 리스너 확인
    checkEventListeners() {
      const SITE_DATA_UPDATED_EVENT = 'siteDataUpdated';
      
      // 이벤트 리스너가 등록되어 있는지 확인
      console.log('🔍 이벤트 리스너 확인:');
      
      // 직접 이벤트 발생시켜서 리스너가 작동하는지 테스트
      const testEvent = new CustomEvent(SITE_DATA_UPDATED_EVENT, {
        detail: { key: 'site_projects', data: [] }
      });
      
      console.log('📤 테스트 이벤트 발생:', SITE_DATA_UPDATED_EVENT);
      window.dispatchEvent(testEvent);
      
      return true;
    },
    
    // 4. 전체 동기화 테스트
    async runFullTest() {
      console.log('🚀 전체 동기화 테스트 시작...\n');
      
      // 1. 현재 상태 확인
      console.log('1️⃣ 현재 프로젝트 상태:');
      const before = this.checkProjects();
      const beforeCount = before.length;
      
      // 2. 테스트 프로젝트 추가
      console.log('\n2️⃣ 테스트 프로젝트 추가:');
      await this.addTestProject();
      
      // 3. 잠시 대기 (동기화 시간)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 4. 변경 확인
      console.log('\n3️⃣ 변경 후 상태 확인:');
      const after = this.checkProjects();
      const afterCount = after.length;
      
      // 5. 결과
      console.log('\n📊 테스트 결과:');
      console.log(`이전: ${beforeCount}개 → 이후: ${afterCount}개`);
      
      if (afterCount === beforeCount + 1) {
        console.log('✅ 테스트 성공! 프로젝트가 정상적으로 추가되었습니다.');
      } else {
        console.error('❌ 테스트 실패! 프로젝트가 추가되지 않았습니다.');
      }
      
      return {
        success: afterCount === beforeCount + 1,
        before: beforeCount,
        after: afterCount,
      };
    },
    
    // 5. 테스트 프로젝트 삭제
    removeTestProjects() {
      const STORAGE_KEY = 'site_projects';
      const current = localStorage.getItem(STORAGE_KEY);
      const projects = current ? JSON.parse(current) : [];
      
      const filtered = projects.filter(p => !p.id?.startsWith('test-'));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      
      const event = new CustomEvent('siteDataUpdated', {
        detail: { key: STORAGE_KEY, data: filtered }
      });
      window.dispatchEvent(event);
      
      console.log('🧹 테스트 프로젝트 삭제 완료');
      console.log(`이전: ${projects.length}개 → 이후: ${filtered.length}개`);
      
      return filtered;
    },
  };
  
  console.log(`
🧪 프로젝트 동기화 테스트 도구가 로드되었습니다!

사용 방법:
1. testProjectSync.addTestProject() - 테스트 프로젝트 추가
2. testProjectSync.checkProjects() - 프로젝트 목록 확인
3. testProjectSync.checkEventListeners() - 이벤트 리스너 확인
4. testProjectSync.runFullTest() - 전체 테스트 실행
5. testProjectSync.removeTestProjects() - 테스트 프로젝트 삭제

예시: testProjectSync.runFullTest()
  `);
}

