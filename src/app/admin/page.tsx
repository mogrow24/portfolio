'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // 인증 확인
    const isAuth = localStorage.getItem('admin_auth');
    const authTime = localStorage.getItem('admin_auth_time');
    
    if (isAuth && authTime) {
      const elapsed = Date.now() - parseInt(authTime);
      // 24시간 내 인증 유효
      if (elapsed < 24 * 60 * 60 * 1000) {
        router.push('/admin/dashboard');
        return;
      }
    }
    
    // 인증되지 않았으면 메인 페이지로
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--bg-primary]">
      <div className="w-8 h-8 border-2 border-[--accent-color]/30 border-t-[--accent-color] rounded-full animate-spin" />
    </div>
  );
}
