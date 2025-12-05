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
      
      if (token && authTime) {
        const elapsed = Date.now() - parseInt(authTime);
        // 24시간 내 인증 유효
        if (elapsed < 24 * 60 * 60 * 1000) {
          // 서버에서 토큰 유효성 검증
          try {
            const response = await fetch('/api/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'verify', token }),
            });
            
            const data = await response.json();
            
            if (data.success && data.valid) {
              router.push('/admin/dashboard');
              return;
            }
          } catch {
            // 검증 실패 시 로그아웃 처리
          }
        }
        
        // 만료된 토큰 제거
        localStorage.removeItem('admin_auth_token');
        localStorage.removeItem('admin_auth_time');
      }
      
      // 인증되지 않았으면 메인 페이지로
      router.push('/');
    };

    verifyAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--bg-primary]">
      <div className="w-8 h-8 border-2 border-[--accent-color]/30 border-t-[--accent-color] rounded-full animate-spin" />
    </div>
  );
}
