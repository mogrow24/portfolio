# 프로젝트 데이터 복구 가이드

## 🔍 현재 저장된 데이터 확인하기

### 방법 1: 브라우저 콘솔에서 확인

1. **포트폴리오 사이트 열기** (어드민 페이지든 프론트든 상관없음)
2. **F12** 키를 눌러 개발자 도구 열기
3. **Console** 탭 선택
4. 다음 코드를 붙여넣고 **Enter** 누르기:

```javascript
// 현재 저장된 프로젝트 확인
const stored = localStorage.getItem('site_projects');
if (stored) {
  const projects = JSON.parse(stored);
  console.log('✅ 저장된 프로젝트:', projects.length, '개');
  console.table(projects.map(p => ({
    id: p.id,
    제목: p.title_ko || p.title_en,
    카테고리: p.category,
    공개: p.is_visible
  })));
  
  // 데이터를 화면에 출력
  console.log(JSON.stringify(projects, null, 2));
} else {
  console.warn('⚠️ 저장된 프로젝트 데이터 없음');
}
```

### 방법 2: 전체 로컬 스토리지 확인

```javascript
// 모든 site 관련 키 확인
Object.keys(localStorage)
  .filter(key => key.startsWith('site_'))
  .forEach(key => {
    console.log(key, ':', localStorage.getItem(key));
  });
```

## 💾 데이터 백업하기

```javascript
// 현재 데이터 백업
const stored = localStorage.getItem('site_projects');
if (stored) {
  const backupKey = 'site_projects_backup_' + Date.now();
  localStorage.setItem(backupKey, stored);
  console.log('✅ 백업 완료:', backupKey);
}
```

## 🔄 데이터 복구하기

### 백업에서 복구

```javascript
// 모든 백업 찾기
const backupKeys = Object.keys(localStorage)
  .filter(key => key.startsWith('site_projects_backup_'))
  .sort();

if (backupKeys.length > 0) {
  console.log('백업 찾음:', backupKeys);
  
  // 최신 백업 확인
  const latest = localStorage.getItem(backupKeys[backupKeys.length - 1]);
  const projects = JSON.parse(latest);
  console.log('최신 백업 프로젝트:', projects.length, '개');
  
  // 복구
  if (confirm('이 백업을 복구하시겠습니까?')) {
    localStorage.setItem('site_projects', latest);
    console.log('✅ 복구 완료! 페이지를 새로고침하세요.');
    location.reload();
  }
}
```

## 📝 수동으로 프로젝트 복구하기

만약 콘솔에 출력된 데이터가 있다면, 그 데이터를 복사해서 다음 위치에 붙여넣을 수 있습니다:

1. 어드민 페이지 열기: `/admin`
2. 프로젝트 탭 선택
3. 브라우저 콘솔에서:

```javascript
// 프로젝트 데이터 직접 설정
const projectData = [
  // 여기에 복사한 프로젝트 데이터 붙여넣기
  {
    id: 'proj-1',
    title_ko: '프로젝트 제목',
    title_en: 'Project Title',
    // ... 나머지 필드
  }
];

// 저장
localStorage.setItem('site_projects', JSON.stringify(projectData));
console.log('✅ 프로젝트 저장 완료');
location.reload();
```

## ⚠️ 주의사항

- **데이터 백업**: 중요한 데이터는 먼저 백업하세요
- **브라우저별 저장**: 로컬 스토리지는 브라우저별로 다릅니다
- **시크릿 모드**: 시크릿 모드에서는 저장되지 않습니다

## 🆘 데이터를 찾을 수 없다면

1. **다른 브라우저 확인**: 다른 브라우저나 탭에서 확인
2. **백업 확인**: 이전에 백업한 데이터가 있는지 확인
3. **어드민에서 다시 입력**: 어드민 페이지에서 프로젝트를 다시 추가

## 📞 추가 도움

데이터 복구가 어려우시면, 브라우저 콘솔에 출력된 내용을 캡처해서 보여주시면 도와드리겠습니다.


