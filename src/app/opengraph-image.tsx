import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = '윤지희 | PM · 서비스 콘텐츠 기획자 포트폴리오';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#030308',
          backgroundImage: `
            linear-gradient(rgba(0, 255, 204, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 204, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          position: 'relative',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* 그라디언트 오브 효과 */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(0, 255, 204, 0.15) 0%, transparent 70%)',
            top: '-200px',
            right: '-150px',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(255, 0, 170, 0.1) 0%, transparent 70%)',
            bottom: '-150px',
            left: '-100px',
            filter: 'blur(80px)',
          }}
        />

        {/* 메인 컨텐츠 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            zIndex: 1,
            padding: '80px',
          }}
        >
          {/* 이름 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <h1
              style={{
                fontSize: '96px',
                fontWeight: 900,
                color: '#f0f0f5',
                letterSpacing: '-0.02em',
                margin: 0,
                lineHeight: 1,
                textAlign: 'center',
              }}
            >
              YUN{' '}
              <span
                style={{
                  color: '#00ffcc',
                  textShadow: '0 0 40px rgba(0, 255, 204, 0.5)',
                }}
              >
                JIHEE
              </span>
            </h1>
          </div>

          {/* 포지션 */}
          <div
            style={{
              fontSize: '36px',
              color: '#6b6b80',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            PM · Service Content Planner
          </div>

          {/* 구분선 */}
          <div
            style={{
              width: '200px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #00ffcc, transparent)',
              marginTop: '8px',
            }}
          />

          {/* 설명 */}
          <div
            style={{
              fontSize: '24px',
              color: '#6b6b80',
              fontWeight: 400,
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.6,
              marginTop: '16px',
            }}
          >
            사용자 경험을 중심으로 생각하고,
            <br />
            데이터 기반의 의사결정으로 서비스를 성장시키는 기획자
          </div>
        </div>

        {/* 하단 장식 요소 */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            display: 'flex',
            gap: '12px',
            fontSize: '14px',
            color: '#00ffcc',
            fontWeight: 600,
            letterSpacing: '0.1em',
            opacity: 0.7,
          }}
        >
          <span>PORTFOLIO</span>
          <span style={{ color: '#6b6b80' }}>·</span>
          <span>2024</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}


