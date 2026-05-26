import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Hamdan Ishfaq — AI Engineer Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: 'linear-gradient(135deg, #0a0e17 0%, #121a2e 50%, #1a2744 100%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: '#89ceff',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '24px',
        }}
      >
        AI Engineer Portfolio
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: '#f0f4ff',
          lineHeight: 1.05,
          marginBottom: '32px',
          letterSpacing: '-0.02em',
        }}
      >
        Hamdan Ishfaq
      </div>
      <div
        style={{
          fontSize: 32,
          color: '#94a3b8',
          lineHeight: 1.4,
          maxWidth: '800px',
        }}
      >
        Production-grade ML systems · LLMs · Computer Vision · High-performance inference
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 64,
          left: 80,
          width: 160,
          height: 4,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #89ceff, #b388ff)',
        }}
      />
    </div>,
    { ...size }
  );
}
