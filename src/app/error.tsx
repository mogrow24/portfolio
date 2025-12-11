'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('에러 발생:', error);
  }, [error]);

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
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          오류가 발생했습니다
        </h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>
          예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              backgroundColor: '#00ff88',
              color: '#000',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

