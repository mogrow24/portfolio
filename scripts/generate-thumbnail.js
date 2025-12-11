const fs = require('fs');
const path = require('path');

/**
 * HTML/CSS를 사용하여 썸네일 이미지 생성 스크립트
 * 브라우저에서 열어서 스크린샷을 찍거나, Puppeteer로 자동화 가능
 */

const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1200, initial-scale=1">
  <title>포트폴리오 썸네일</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: 1200px;
      height: 630px;
      background: #030308;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', system-ui, sans-serif;
      position: relative;
      overflow: hidden;
    }
    
    /* 그리드 배경 */
    body::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(0, 255, 204, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 204, 0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
    }
    
    /* 그라디언트 오브 1 */
    body::after {
      content: '';
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(0, 255, 204, 0.15) 0%, transparent 70%);
      top: -200px;
      right: -150px;
      filter: blur(80px);
      pointer-events: none;
    }
    
    .container {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      padding: 80px;
      text-align: center;
    }
    
    .gradient-orb-2 {
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(255, 0, 170, 0.1) 0%, transparent 70%);
      bottom: -150px;
      left: -100px;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }
    
    .name {
      font-size: 96px;
      font-weight: 900;
      color: #f0f0f5;
      letter-spacing: -0.02em;
      line-height: 1;
      margin: 0;
    }
    
    .name .accent {
      color: #00ffcc;
      text-shadow: 0 0 40px rgba(0, 255, 204, 0.5);
    }
    
    .title {
      font-size: 36px;
      color: #6b6b80;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-top: 8px;
    }
    
    .divider {
      width: 200px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00ffcc, transparent);
      margin: 8px 0;
    }
    
    .description {
      font-size: 24px;
      color: #6b6b80;
      font-weight: 400;
      line-height: 1.6;
      margin-top: 16px;
      max-width: 800px;
    }
    
    .footer {
      position: absolute;
      bottom: 40px;
      right: 40px;
      display: flex;
      gap: 12px;
      font-size: 14px;
      color: #00ffcc;
      font-weight: 600;
      letter-spacing: 0.1em;
      opacity: 0.7;
    }
    
    .footer .separator {
      color: #6b6b80;
    }
  </style>
</head>
<body>
  <div class="gradient-orb-2"></div>
  <div class="container">
    <h1 class="name">
      YUN <span class="accent">JIHEE</span>
    </h1>
    <div class="title">PM · Service Content Planner</div>
    <div class="divider"></div>
    <div class="description">
      사용자 경험을 중심으로 생각하고,<br>
      데이터 기반의 의사결정으로 서비스를 성장시키는 기획자
    </div>
  </div>
  <div class="footer">
    <span>PORTFOLIO</span>
    <span class="separator">·</span>
    <span>2024</span>
  </div>
</body>
</html>`;

// 파일 저장
const outputPath = path.join(__dirname, '..', 'thumbnail.html');
fs.writeFileSync(outputPath, htmlContent, 'utf8');

console.log('✅ 썸네일 HTML 파일이 생성되었습니다!');
console.log(`📁 위치: ${outputPath}`);
console.log('');
console.log('📸 PNG로 저장하는 방법:');
console.log('1. thumbnail.html 파일을 브라우저에서 엽니다');
console.log('2. F12로 개발자 도구를 열고 Ctrl+Shift+P로 명령 팔레트를 엽니다');
console.log('3. "Capture screenshot" 또는 "스크린샷 캡처"를 검색하여 실행합니다');
console.log('4. 또는 브라우저 확장 프로그램(예: Full Page Screen Capture)을 사용합니다');
console.log('');
console.log('💡 자동화 스크립트를 실행하려면: npm run generate-thumbnail:png');


