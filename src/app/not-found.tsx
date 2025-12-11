'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>404</h2>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
          페이지를 찾을 수 없습니다
        </h3>
        <p style={{ color: '#888', marginBottom: '24px' }}>
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            borderRadius: '8px',
            backgroundColor: '#00ff88',
            color: '#000',
            fontWeight: '600',
            textDecoration: 'none'
          }}
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

