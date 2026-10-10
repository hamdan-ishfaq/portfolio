import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Muhammad Hamdan Ishfaq — Supply Chain Analytics & AI Engineering';
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
        padding: '72px 80px',
        background: 'linear-gradient(145deg, #0b1220 0%, #111827 55%, #1a2f4a 100%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: '#3b82a8',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: '20px',
        }}
      >
        SAP S/4HANA MM · Supply Chain
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: '#f1f5f9',
          lineHeight: 1.05,
          marginBottom: '24px',
          letterSpacing: '-0.03em',
        }}
      >
        Muhammad Hamdan Ishfaq
      </div>
      <div
        style={{
          fontSize: 28,
          color: '#94a3b8',
          lineHeight: 1.45,
          maxWidth: '860px',
        }}
      >
        Ex-SAP Intern @ FFC · AI Intern @ Nexpred · BS Data Science NUST
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 64,
          left: 80,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          color: '#64748b',
          fontSize: 18,
          letterSpacing: '0.08em',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        <span>PR</span>
        <span style={{ color: '#3b82a8' }}>—</span>
        <span>PO</span>
        <span style={{ color: '#3b82a8' }}>—</span>
        <span>GR</span>
        <span style={{ color: '#3b82a8' }}>—</span>
        <span>IV</span>
        <span style={{ color: '#3b82a8' }}>—</span>
        <span>PAY</span>
      </div>
    </div>,
    { ...size }
  );
}
