import { ImageResponse } from 'next/og';
import { adminSupabase } from '@/lib/supabase/admin';

export const runtime = 'edge';
export const alt = 'Project preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type ImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;

  const { data: project } = await adminSupabase
    .from('projects')
    .select('title, short_description')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  const title = project?.title ?? 'Project';
  const description =
    project?.short_description ??
    'AI Engineer portfolio — production-grade machine learning systems.';

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px',
        background: 'linear-gradient(135deg, #0a0e17 0%, #121a2e 45%, #1a2744 100%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#89ceff',
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #89ceff, #b388ff)',
          }}
        />
        Hamdan Ishfaq · AI Engineer
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#f0f4ff',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            lineHeight: 1.4,
          }}
        >
          {description.length > 140 ? `${description.slice(0, 137)}…` : description}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#64748b',
          fontSize: 20,
        }}
      >
        <span>portfolio · /projects/{slug}</span>
        <div
          style={{
            width: 120,
            height: 4,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #89ceff, #b388ff)',
          }}
        />
      </div>
    </div>,
    { ...size }
  );
}
