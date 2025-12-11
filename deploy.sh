#!/bin/bash
# 배포 스크립트

echo "🚀 배포를 시작합니다..."

# 빌드 확인
echo "📦 빌드 확인 중..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 빌드 실패"
  exit 1
fi

echo "✅ 빌드 성공"

# Vercel 배포
echo "🌐 Vercel에 배포 중..."
npx vercel --prod --yes

if [ $? -eq 0 ]; then
  echo "✅ 배포 완료!"
else
  echo "❌ 배포 실패"
  exit 1
fi



