'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      // 토큰 확인
      const token = localStorage.getItem('admin_auth_token');
      const authTime = localStorage.getItem('admin_auth_time');

      console.log('🔐 인증 확인:', { hasToken: !!token, hasAuthTime: !!authTime });

      if (!token || !authTime) {
        console.log('❌ 인증 토큰 없음 - 메인 페이지로 리다이렉트');
        router.push('/');
        return;
      }

      const elapsed = Date.now() - parseInt(authTime);
      console.log('⏰ 토큰 경과 시간:', Math.floor(elapsed / 1000 / 60), '분');

      // 24시간 초과 시 만료
      if (elapsed >= 24 * 60 * 60 * 1000) {
        console.log('⚠️ 토큰 만료 - 메인 페이지로 리다이렉트');
        localStorage.removeItem('admin_auth_token');
        localStorage.removeItem('admin_auth_time');
        router.push('/');
        return;
      }

      // 서버에서 토큰 유효성 검증
      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify', token }),
        });

        const data = await response.json();

        if (data.success && data.valid) {
          console.log('✅ 토큰 유효, 대시보드로 이동');
          router.push('/admin/dashboard');
        } else {
          console.log('❌ 토큰 유효성 검증 실패 - 메인 페이지로 리다이렉트');
          localStorage.removeItem('admin_auth_token');
          localStorage.removeItem('admin_auth_time');
          router.push('/');
        }
      } catch (error) {
        console.error('토큰 검증 중 오류:', error);
        // 네트워크 오류 등으로 검증 실패 시에도 메인으로 이동
        router.push('/');
      }
    };

    verifyAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--bg-primary]">
      <div className="w-8 h-8 border-2 border-[--accent-color]/30 border-t-[--accent-color] rounded-full animate-spin" />
    </div>
  );
}
