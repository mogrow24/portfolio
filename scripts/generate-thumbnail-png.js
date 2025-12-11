const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * HTML을 PNG로 변환하는 스크립트
 * Playwright 또는 Puppeteer를 사용하여 스크린샷 생성
 */

const htmlPath = path.join(__dirname, '..', 'thumbnail.html');
const outputPath = path.join(__dirname, '..', 'portfolio-thumbnail.png');

// HTML 파일이 없으면 먼저 생성
if (!fs.existsSync(htmlPath)) {
  console.log('📄 HTML 파일을 먼저 생성합니다...');
  execSync('npm run generate-thumbnail', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}

// Playwright가 설치되어 있는지 확인
try {
  execSync('npx playwright --version', { stdio: 'ignore' });
  console.log('🎭 Playwright를 사용하여 스크린샷을 생성합니다...');
  
  const playwrightScript = `
    const { chromium } = require('playwright');
    const path = require('path');
    
    (async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage({
        viewport: { width: 1200, height: 630 }
      });
      
      const htmlPath = '${htmlPath.replace(/\\/g, '/')}';
      await page.goto('file:///' + htmlPath);
      
      // 폰트 로딩 대기
      await page.waitForTimeout(1000);
      
      await page.screenshot({
        path: '${outputPath.replace(/\\/g, '/')}',
        width: 1200,
        height: 630
      });
      
      await browser.close();
      console.log('✅ PNG 파일이 생성되었습니다!');
      console.log('📁 위치: ${outputPath}');
    })();
  `;
  
  fs.writeFileSync(path.join(__dirname, 'temp-screenshot.js'), playwrightScript);
  execSync('node scripts/temp-screenshot.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  fs.unlinkSync(path.join(__dirname, 'temp-screenshot.js'));
  
} catch (error) {
  console.log('⚠️  Playwright가 설치되어 있지 않습니다.');
  console.log('📸 수동으로 PNG를 생성하는 방법:');
  console.log('');
  console.log('1. 다음 명령어로 Playwright 설치:');
  console.log('   npm install -D playwright');
  console.log('   npx playwright install chromium');
  console.log('');
  console.log('2. 또는 브라우저에서 수동으로:');
  console.log(`   - ${htmlPath} 파일을 브라우저에서 엽니다`);
  console.log('   - F12로 개발자 도구를 엽니다');
  console.log('   - Ctrl+Shift+P (또는 Cmd+Shift+P)로 명령 팔레트를 엽니다');
  console.log('   - "Capture screenshot" 또는 "스크린샷 캡처"를 검색하여 실행합니다');
  console.log('   - 또는 브라우저 확장 프로그램을 사용합니다');
  console.log('');
  console.log('💡 추천 확장 프로그램:');
  console.log('   - Chrome: "Full Page Screen Capture"');
  console.log('   - Firefox: "FireShot"');
  process.exit(1);
}


