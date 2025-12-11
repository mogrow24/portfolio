const fs = require('fs');
const path = require('path');

/**
 * Canvas를 사용하여 PNG 썸네일 생성
 * node-canvas가 필요합니다: npm install canvas
 */

let canvas;
let ctx;

try {
  const { createCanvas, registerFont } = require('canvas');
  
  // Canvas 생성
  canvas = createCanvas(1200, 630);
  ctx = canvas.getContext('2d');
  
  // 배경
  ctx.fillStyle = '#030308';
  ctx.fillRect(0, 0, 1200, 630);
  
  // 그리드 배경
  ctx.strokeStyle = 'rgba(0, 255, 204, 0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1200; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 630);
    ctx.stroke();
  }
  for (let y = 0; y <= 630; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1200, y);
    ctx.stroke();
  }
  
  // 그라디언트 오브 1
  const gradient1 = ctx.createRadialGradient(900, -50, 0, 900, -50, 400);
  gradient1.addColorStop(0, 'rgba(0, 255, 204, 0.15)');
  gradient1.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient1;
  ctx.filter = 'blur(80px)';
  ctx.fillRect(600, -200, 600, 600);
  ctx.filter = 'none';
  
  // 그라디언트 오브 2
  const gradient2 = ctx.createRadialGradient(-100, 730, 0, -100, 730, 350);
  gradient2.addColorStop(0, 'rgba(255, 0, 170, 0.1)');
  gradient2.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient2;
  ctx.filter = 'blur(80px)';
  ctx.fillRect(-200, 430, 500, 500);
  ctx.filter = 'none';
  
  // 이름 텍스트
  ctx.fillStyle = '#f0f0f5';
  ctx.font = 'bold 96px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 이름 - YUN
  ctx.fillText('YUN', 600, 220);
  
  // 이름 - JIHEE (강조)
  ctx.fillStyle = '#00ffcc';
  ctx.shadowColor = 'rgba(0, 255, 204, 0.5)';
  ctx.shadowBlur = 40;
  ctx.fillText('JIHEE', 600, 300);
  ctx.shadowBlur = 0;
  
  // 포지션
  ctx.fillStyle = '#6b6b80';
  ctx.font = '600 36px Inter, system-ui, sans-serif';
  ctx.letterSpacing = '0.05em';
  ctx.fillText('PM · Service Content Planner', 600, 360);
  
  // 구분선
  const dividerGradient = ctx.createLinearGradient(500, 390, 700, 390);
  dividerGradient.addColorStop(0, 'transparent');
  dividerGradient.addColorStop(0.5, '#00ffcc');
  dividerGradient.addColorStop(1, 'transparent');
  ctx.strokeStyle = dividerGradient;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(500, 390);
  ctx.lineTo(700, 390);
  ctx.stroke();
  
  // 설명
  ctx.fillStyle = '#6b6b80';
  ctx.font = '400 24px Inter, system-ui, sans-serif';
  ctx.letterSpacing = '0';
  ctx.fillText('사용자 경험을 중심으로 생각하고,', 600, 440);
  ctx.fillText('데이터 기반의 의사결정으로 서비스를 성장시키는 기획자', 600, 480);
  
  // 하단 텍스트
  ctx.fillStyle = '#00ffcc';
  ctx.font = '600 14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.letterSpacing = '0.1em';
  ctx.globalAlpha = 0.7;
  ctx.fillText('PORTFOLIO · 2024', 1160, 590);
  ctx.globalAlpha = 1;
  
  // PNG로 저장
  const outputPath = path.join(__dirname, '..', 'portfolio-thumbnail.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log('✅ PNG 썸네일이 생성되었습니다!');
  console.log(`📁 위치: ${outputPath}`);
  console.log(`📏 크기: 1200x630px`);
  
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('⚠️  canvas 모듈이 설치되어 있지 않습니다.');
    console.log('');
    console.log('📦 설치 방법:');
    console.log('   npm install canvas');
    console.log('');
    console.log('💡 또는 HTML 파일을 브라우저에서 열어서 스크린샷을 찍으세요:');
    console.log(`   ${path.join(__dirname, '..', 'thumbnail.html')}`);
    process.exit(1);
  } else {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}


