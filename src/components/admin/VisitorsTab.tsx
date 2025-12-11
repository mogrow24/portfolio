'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, RefreshCw, Clock, MousePointerClick, Globe, Monitor, Smartphone, Tablet, Loader2, TrendingUp, MessageSquare, Award, Trash2 } from 'lucide-react';
import { isSupabaseAvailable, api } from '@/lib/supabase';
import { getVisitorId } from '@/lib/visitors';

interface VisitorRecord {
  visitor_id: string;
  referrer: string | null;
  user_agent: string;
  visit_count: number;
  first_visit: string;
  last_visit: string;
  total_duration: number;
  device_type: string;
  browser: string;
}

export default function VisitorsTab() {
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false);
  const [guestbookEmails, setGuestbookEmails] = useState<Set<string>>(new Set()); // 질문 남긴 visitor_id 목록
  const [totalVisitorCount, setTotalVisitorCount] = useState<number | null>(null); // 누적 방문자 수 (프론트엔드와 동일)
  const [serviceStartDate, setServiceStartDate] = useState<string | null>(null); // 서비스 시작일
  const [cleaningUp, setCleaningUp] = useState(false); // 정리 중 상태

  // 테스트 데이터 정리
  const handleCleanupTestData = useCallback(async () => {
    if (!confirm('테스트 데이터를 정리하시겠습니까?\n\n- 사용자의 방문 기록 삭제\n- localhost/test/admin 관련 방문 기록 삭제\n- visitor_count 재계산')) {
      return;
    }

    setCleaningUp(true);
    try {
      const userVisitorId = getVisitorId();
      console.log('🧹 테스트 데이터 정리 시작...', userVisitorId.substring(0, 20));

      const response = await fetch('/api/admin/cleanup-visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userVisitorId }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ 테스트 데이터 정리 완료!\n\n새로운 누적 방문자 수: ${result.newCount}명\n시작일: ${result.startDate}`);
        // 데이터 새로고침
        await loadVisitors();
      } else {
        alert(`❌ 정리 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ 테스트 데이터 정리 실패:', error);
      alert('테스트 데이터 정리 중 오류가 발생했습니다.');
    } finally {
      setCleaningUp(false);
    }
  }, []);

  // 질문 남긴 방문자 ID 목록 로드
  const loadGuestbookVisitorIds = useCallback(async () => {
    try {
      if (isSupabaseAvailable()) {
        const messages = await api.getGuestbook();
        const visitorIds = new Set(
          messages
            .map(m => m.visitor_id)
            .filter((id): id is string => !!id && id.trim() !== '')
        );
        setGuestbookEmails(visitorIds); // Set에 visitor_id 저장 (변수명은 그대로 유지)
      }
    } catch (error) {
      console.warn('게스트북 방문자 ID 로드 실패:', error);
    }
  }, []);

  const loadVisitors = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupabaseAvailable()) {
        // 방문자 목록 로드
        const response = await fetch(`/api/visitors/list?t=${Date.now()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // API에서 이미 필터링된 데이터 사용
            setVisitors(result.data || []);
            setUseSupabase(true);
          }
        }

        // 누적 방문자 수 로드 (프론트엔드와 동일)
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
          
          const countResponse = await fetch('/api/visitors', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (countResponse.ok) {
            try {
              const countResult = await countResponse.json();
              if (countResult && countResult.success && typeof countResult.count === 'number' && countResult.count >= 0) {
                setTotalVisitorCount(countResult.count);
                // 서비스 시작일 설정
                if (countResult.startDate && typeof countResult.startDate === 'string') {
                  setServiceStartDate(countResult.startDate);
                } else {
                  // startDate가 없으면 null로 설정
                  setServiceStartDate(null);
                }
              } else {
                // API 응답 형식이 올바르지 않음
                console.warn('누적 방문자 수 응답 형식 오류:', countResult);
                // 기존 값 유지 (0으로 리셋하지 않음)
                if (totalVisitorCount === null || totalVisitorCount === undefined) {
                  setTotalVisitorCount(0);
                  setServiceStartDate(null);
                }
              }
            } catch (parseError) {
              // JSON 파싱 실패
              console.warn('누적 방문자 수 JSON 파싱 실패:', parseError);
              // 기존 값 유지
              if (totalVisitorCount === null || totalVisitorCount === undefined) {
                setTotalVisitorCount(0);
                setServiceStartDate(null);
              }
            }
          } else {
            // HTTP 응답이 실패
            console.warn(`누적 방문자 수 HTTP 오류: ${countResponse.status} ${countResponse.statusText}`);
            // 기존 값 유지 (0으로 리셋하지 않음)
            if (totalVisitorCount === null || totalVisitorCount === undefined) {
              setTotalVisitorCount(0);
              setServiceStartDate(null);
            }
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            console.warn('누적 방문자 수 로드 타임아웃');
          } else {
            console.warn('누적 방문자 수 로드 실패:', error);
          }
          // 기존 값 유지 (0으로 리셋하지 않음)
          if (totalVisitorCount === null || totalVisitorCount === undefined) {
            setTotalVisitorCount(0);
            setServiceStartDate(null);
          }
        }
      }
    } catch (error) {
      console.warn('방문자 데이터 로드 실패:', error);
    }
    
    if (!isSupabaseAvailable()) {
      setVisitors([]);
      setUseSupabase(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadGuestbookVisitorIds();
    loadVisitors();
    
    // 주기적 자동 새로고침 비활성화 (사용자가 새로고침 버튼을 눌러야만 업데이트)
    // 오늘 방문자수가 자꾸 바뀌는 문제 방지
    // const interval = setInterval(() => {
    //   if (useSupabase || isSupabaseAvailable()) {
    //     loadGuestbookVisitorIds();
    //     loadVisitors();
    //   }
    // }, 30000);

    // return () => clearInterval(interval);
  }, [loadVisitors, loadGuestbookVisitorIds, useSupabase]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}시간 ${remainingMinutes}분`;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getReferrerLabel = (referrer: string | null) => {
    if (!referrer) return '직접 접속';
    try {
      const url = new URL(referrer);
      const hostname = url.hostname.toLowerCase();
      
      // 검색 엔진
      if (hostname.includes('google')) {
        const query = url.searchParams.get('q');
        return query ? `Google 검색: "${query.substring(0, 30)}${query.length > 30 ? '...' : ''}"` : 'Google 검색';
      }
      if (hostname.includes('naver')) {
        const query = url.searchParams.get('query') || url.searchParams.get('q');
        return query ? `Naver 검색: "${query.substring(0, 30)}${query.length > 30 ? '...' : ''}"` : 'Naver 검색';
      }
      if (hostname.includes('daum')) return 'Daum 검색';
      if (hostname.includes('bing')) return 'Bing 검색';
      if (hostname.includes('yahoo')) return 'Yahoo 검색';
      
      // 소셜 미디어
      if (hostname.includes('linkedin')) return 'LinkedIn';
      if (hostname.includes('saramin') || hostname.includes('사람인')) return '사람인';
      if (hostname.includes('jobkorea') || hostname.includes('잡코리아')) return '잡코리아';
      if (hostname.includes('instagram')) return 'Instagram';
      if (hostname.includes('facebook')) return 'Facebook';
      if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter/X';
      if (hostname.includes('youtube')) return 'YouTube';
      if (hostname.includes('tiktok')) return 'TikTok';
      
      // 개발/기술 커뮤니티
      if (hostname.includes('github')) return 'GitHub';
      if (hostname.includes('notion')) return 'Notion';
      
      // 이메일
      if (hostname.includes('mail') || hostname.includes('gmail') || hostname.includes('naver.com')) {
        if (url.pathname.includes('mail') || url.searchParams.has('mail')) return '이메일';
      }
      
      // 같은 도메인 (내부 링크)
      if (typeof window !== 'undefined') {
        if (hostname.includes(window.location.hostname) || hostname.includes('vercel.app')) {
          return '내부 링크';
        }
      } else if (hostname.includes('vercel.app') || hostname.includes('localhost')) {
        return '내부 링크';
      }
      
      // 호스트명에서 www 제거하고 표시
      return hostname.replace('www.', '');
    } catch {
      return referrer || '직접 접속';
    }
  };

  // 통계 계산
  const uniqueVisitors = visitors.length; // 고유 방문자 수
  const totalVisits = visitors.reduce((sum, v) => sum + v.visit_count, 0); // 총 방문 횟수 (각 방문자의 visit_count 합계)
  const avgDuration = visitors.length > 0
    ? Math.round(visitors.reduce((sum, v) => sum + v.total_duration, 0) / visitors.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            방문자 통계
            {useSupabase && (
              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 font-normal">
                Supabase 연동
              </span>
            )}
          </h2>
          <p className="text-sm text-[--text-secondary]">
            {totalVisitorCount !== null && (
              <span className="text-[--accent-color] font-bold">
                누적 방문자 {totalVisitorCount.toLocaleString()}명
                {serviceStartDate && ` (${serviceStartDate.split('-').join('.')}~)`}
              </span>
            )}
            {totalVisitorCount !== null && ' | '}
            오늘 방문자 {uniqueVisitors}명 | 총 방문 횟수 {totalVisits}회 | 평균 체류 시간 {formatDuration(avgDuration)}
          </p>
          <div className="text-xs text-[--text-secondary] mt-1 space-y-0.5">
            <p>• <strong>누적 방문자</strong>: 프론트엔드 Footer에 표시되는 누적 방문자 수 {serviceStartDate && `(${serviceStartDate.split('-').join('.')}부터 현재까지 모든 기간 누적)`} {serviceStartDate && `[시작일: ${serviceStartDate.split('-').join('.')}]`}</p>
            <p>• <strong>오늘 방문자</strong>: 오늘 오전 7시 이후 첫 방문한 고유 방문자 수 (브라우저/기기별 고유 ID 기준)</p>
            <p>• <strong>총 방문 횟수</strong>: 오늘 방문자들의 총 방문 횟수 합계</p>
            <p>• <strong>Unknown</strong>: 브라우저 정보를 감지하지 못한 경우 (드문 경우)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCleanupTestData}
            disabled={isLoading || cleaningUp}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
            title="테스트 데이터 정리"
          >
            {cleaningUp ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadVisitors}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[--bg-tertiary] text-[--text-secondary] hover:text-white transition-colors"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-[--text-secondary]">오늘 방문자</p>
              <p className="text-2xl font-bold text-white">{uniqueVisitors}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-[--text-secondary]">총 방문 횟수</p>
              <p className="text-2xl font-bold text-white">{totalVisits}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-[--text-secondary]">평균 체류 시간</p>
              <p className="text-2xl font-bold text-white">{formatDuration(avgDuration)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 방문자 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-[--text-secondary]">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-[--accent-color]" />
            <p>방문자 데이터 불러오는 중...</p>
          </div>
        ) : visitors.length === 0 ? (
          <div className="text-center py-12 text-[--text-secondary]">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>방문자 데이터가 없습니다.</p>
            {!useSupabase && (
              <p className="text-xs mt-2 text-yellow-400">⚠️ Supabase 설정이 필요합니다.</p>
            )}
          </div>
        ) : (
          visitors.map((visitor, index) => (
            <motion.div
              key={visitor.visitor_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[--bg-tertiary] flex items-center justify-center">
                    {getDeviceIcon(visitor.device_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-white text-sm">
                        {visitor.visitor_id.substring(0, 12)}...
                      </span>
                      {guestbookEmails.has(visitor.visitor_id) && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-2 py-0.5 rounded text-[10px] bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-400 font-bold flex items-center gap-1 border border-yellow-500/50"
                          title="질문을 남긴 방문자"
                        >
                          <Award className="w-3 h-3" />
                          질문 작성
                        </motion.span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[--accent-color]/20 text-[--accent-color] font-bold">
                        {visitor.browser}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 font-bold capitalize">
                        {visitor.device_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[--text-secondary]">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {visitor.visit_count}회 방문
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(visitor.total_duration)} 체류
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-[--text-secondary]">
                  <p>최근 방문</p>
                  <p className="text-white font-medium">{formatDate(visitor.last_visit)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[--border-color] space-y-2">
                <div className="flex items-center gap-2 text-xs text-[--text-secondary]">
                  <Globe className="w-3 h-3" />
                  <span>유입 경로: <span className="text-white">{getReferrerLabel(visitor.referrer)}</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[--text-secondary]">
                  <Clock className="w-3 h-3" />
                  <span>첫 방문: <span className="text-white">{formatDate(visitor.first_visit)}</span></span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

