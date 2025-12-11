'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Users, Sparkles } from 'lucide-react';
import SecretAccess from '@/components/ui/SecretAccess';
import { incrementVisitorCountAsync, getVisitorCount, getVisitorId } from '@/lib/visitors';
import { useLocale } from '@/context/LocaleContext';

const content = {
  ko: {
    visitors: '명이 방문했습니다',
    copyright: '© 2025 윤지희. All rights reserved.',
    aiNote: 'AI를 활용하여 만든 포트폴리오 사이트입니다.',
  },
  en: {
    visitors: 'visitors',
    copyright: '© 2025 YUN JIHEE. All Rights Reserved.',
    aiNote: 'This portfolio site was created using AI.',
  },
};

export default function Footer() {
  const { locale } = useLocale();
  const t = content[locale as keyof typeof content] ?? content.ko;
  const [clickCount, setClickCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // 방문자 ID 먼저 생성 (없으면 생성)
    try {
      getVisitorId();
    } catch (idError) {
      console.warn('방문자 ID 생성 실패:', idError);
    }
    
    // 방문자 수 증가 및 가져오기 (비동기)
    const loadVisitorCount = async () => {
      let cachedCount = 0;
      
      try {
        // 먼저 로컬 스토리지에서 확인 (새로고침 시에도 유지)
        cachedCount = getVisitorCount();
        if (cachedCount > 0) {
          setVisitorCount(cachedCount);
          console.log('📦 캐시된 방문자 수 표시:', cachedCount);
        }
      } catch (cacheError) {
        console.warn('로컬 캐시 읽기 실패:', cacheError);
      }
      
      // 서버에서 최신 값 가져오기 (재시도 로직 포함)
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`🔄 방문자 수 로드 시도 ${retryCount + 1}/${maxRetries}...`);
          
          const count = await Promise.race([
            incrementVisitorCountAsync(),
            new Promise<number>((resolve) => {
              setTimeout(() => {
                console.warn('⏱️ 방문자 수 로드 타임아웃');
                resolve(cachedCount);
              }, 8000); // 8초 타임아웃
            })
          ]);
          
          // 서버에서 가져온 값이 유효한지 확인
          if (typeof count === 'number' && count >= 0) {
            // 값이 있으면 무조건 표시 (0도 유효한 값이지만, 캐시가 있으면 캐시 우선)
            if (count > 0 || cachedCount === 0) {
              setVisitorCount(count);
              console.log('✅ 방문자 수 로드 완료:', count);
              return; // 성공하면 종료
            } else {
              // 서버가 0을 반환했지만 캐시가 있으면 캐시 사용
              setVisitorCount(cachedCount);
              console.log('✅ 캐시된 방문자 수 사용:', cachedCount);
              return;
            }
          } else {
            console.warn('⚠️ 유효하지 않은 방문자 수:', count);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // 지수 백오프
              continue;
            }
          }
        } catch (apiError) {
          console.warn(`⚠️ 방문자 수 API 호출 실패 (시도 ${retryCount + 1}/${maxRetries}):`, apiError);
          retryCount++;
          
          if (retryCount < maxRetries) {
            // 재시도 전 대기
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            continue;
          } else {
            // 모든 재시도 실패 시 캐시 사용
            console.warn('❌ 모든 재시도 실패, 캐시된 값 사용');
            if (cachedCount > 0) {
              setVisitorCount(cachedCount);
              console.log('📦 캐시된 방문자 수 표시:', cachedCount);
            } else {
              // 캐시도 없으면 최소한 1명 표시 (현재 방문자 포함)
              setVisitorCount(1);
              console.log('🆕 첫 방문자로 표시: 1');
            }
            return;
          }
        }
      }
      
      // 모든 재시도 실패 시 최종 폴백
      if (cachedCount > 0) {
        setVisitorCount(cachedCount);
      } else {
        setVisitorCount(1); // 최소한 1명 표시
      }
    };
    
    // 약간의 지연 후 실행 (다른 초기화 완료 대기)
    const timeoutId = setTimeout(() => {
      loadVisitorCount();
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 로고를 5번 클릭하면 비밀 코드 입력창 열기
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      setShowSecret(true);
      setClickCount(0);
    }
    
    // 2초 후 카운트 리셋
    setTimeout(() => setClickCount(0), 2000);
  };

  return (
    <>
      <footer className="py-8 md:py-10 text-center relative">
        <div className="max-w-6xl mx-auto px-4">
          {/* 맨 위로 버튼 */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-5">
            <motion.button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full bg-[--bg-secondary] border border-[--border-color] flex items-center justify-center hover:border-[--accent-color] hover:text-[--accent-color] transition-all"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>

          {/* 방문자 수 */}
          {isClient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[--bg-tertiary] border border-[--border-color]">
                <Users className="w-3.5 h-3.5 text-[--accent-color]" />
                <span className="text-xs text-[--text-secondary]">
                  <span className="text-[--accent-color] font-bold">{visitorCount.toLocaleString()}</span>
                  {' '}{t.visitors}
                </span>
              </div>
            </motion.div>
          )}

          {/* 로고 - 5번 클릭 시 관리자 접근 */}
          <motion.button
            onClick={handleLogoClick}
            className={`text-lg md:text-xl font-extrabold inline-block mb-3 tracking-tight transition-colors ${
              clickCount > 0 ? 'text-[--accent-color]' : 'text-[--accent-color]'
            }`}
            whileHover={{ scale: 1.05 }}
            style={{
              opacity: clickCount > 0 ? 0.5 + (clickCount * 0.1) : 1
            }}
          >
            YUN JIHEE
          </motion.button>
          
          <p className="text-[#444] text-xs md:text-sm mb-4">
            {t.copyright}
          </p>

          {/* AI 활용 문구 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-1.5 text-[10px] md:text-[11px] text-[--text-secondary]/50"
          >
            <Sparkles className="w-3 h-3" />
            {t.aiNote}
          </motion.p>
        </div>
      </footer>

      {/* 비밀 코드 입력 모달 */}
      <SecretAccess
        isOpen={showSecret}
        onClose={() => setShowSecret(false)}
      />
    </>
  );
}
