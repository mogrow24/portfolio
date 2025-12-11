'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import IntroAnimation from '@/components/ui/IntroAnimation';
import { syncFromCloud, subscribeToChanges, isCloudSyncEnabled } from '@/lib/siteData';
import { createVisitorRecord, saveVisitorData, sendVisitorRecord, updateSessionDuration, loadVisitorData, type VisitorData } from '@/lib/visitorTracker';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  // 페이지 로드 시 스크롤을 맨 위로 (강제)
  useEffect(() => {
    // 브라우저 스크롤 복원 비활성화
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // 즉시 스크롤을 맨 위로
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Supabase 실시간 구독 및 초기 동기화
  useEffect(() => {
    // 클라우드 동기화 활성화 시 초기 데이터 동기화
    if (isCloudSyncEnabled()) {
      syncFromCloud().catch(console.error);
    }

    // 실시간 구독 설정
    const unsubscribe = subscribeToChanges((key) => {
      // 데이터 변경 시 storage 이벤트 발생시켜 컴포넌트들이 업데이트되도록 함
      window.dispatchEvent(new StorageEvent('storage', { key }));
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // 방문자 추적 (관리자 제외)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 관리자 접속 체크: 어드민 페이지 또는 관리자 토큰이 있으면 추적하지 않음
    const isAdminPath = window.location.pathname.startsWith('/admin');
    const hasAdminToken = localStorage.getItem('admin_auth_token');
    
    if (isAdminPath || hasAdminToken) {
      // 관리자는 방문자 추적 제외
      return;
    }

    // 페이지 로드 시 방문 기록 생성 (한 번만 실행되도록 체크)
    const record = createVisitorRecord();
    saveVisitorData(record);
    
    // 서버에 방문 기록 전송
    sendVisitorRecord(record).catch(console.error);

    const sessionStartTime = new Date(record.currentSessionStart).getTime();

    // 페이지 언로드 시 체류 시간 업데이트
    const handleBeforeUnload = () => {
      // 관리자 체크 (언로드 시에도 확인)
      const isAdminPath = window.location.pathname.startsWith('/admin');
      const hasAdminToken = localStorage.getItem('admin_auth_token');
      if (isAdminPath || hasAdminToken) return;

      const currentData = loadVisitorData();
      if (currentData) {
        const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
        const updated: VisitorData = {
          ...currentData,
          totalDuration: currentData.totalDuration + sessionDuration,
        };
        saveVisitorData(updated);
        
        // sendBeacon을 사용하여 페이지 언로드 시에도 데이터 전송
        const blob = new Blob([JSON.stringify(updated)], { type: 'application/json' });
        navigator.sendBeacon('/api/visitors/track', blob);
      }
    };

    // 주기적으로 체류 시간 업데이트 및 전송 (30초마다)
    const intervalId = setInterval(() => {
      // 관리자 체크
      const isAdminPath = window.location.pathname.startsWith('/admin');
      const hasAdminToken = localStorage.getItem('admin_auth_token');
      if (isAdminPath || hasAdminToken) return;

      updateSessionDuration();
      const updated = loadVisitorData();
      if (updated) {
        sendVisitorRecord(updated).catch(console.error);
      }
    }, 30000);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      
      // 관리자 체크
      const isAdminPath = window.location.pathname.startsWith('/admin');
      const hasAdminToken = localStorage.getItem('admin_auth_token');
      if (!isAdminPath && !hasAdminToken) {
        updateSessionDuration();
        const finalData = loadVisitorData();
        if (finalData) {
          sendVisitorRecord(finalData).catch(console.error);
        }
      }
      
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, []);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    // 인트로가 완전히 사라진 후 콘텐츠 표시
    setTimeout(() => {
      setContentReady(true);
      // 콘텐츠 표시 후에도 한번 더 스크롤 리셋
      window.scrollTo(0, 0);
    }, 100);
  }, []);

  return (
    <>
      {/* 인트로 애니메이션 */}
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* 메인 콘텐츠 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: contentReady ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </>
  );
}

