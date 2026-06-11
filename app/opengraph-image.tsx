import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '21 Dares — Free Online Party Game';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  const cards = ['🤔 Truth', '🔥 Dare', '⚡ Double Dare', '🎭 Situation', '🏠 Burning House'];

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f0f13',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Purple glow top-left */}
        <div style={{ position: 'absolute', top: -120, left: -120, width: 500, height: 500, borderRadius: '50%', background: 'rgba(124,58,237,0.35)', filter: 'blur(100px)' }} />
        {/* Pink glow bottom-right */}
        <div style={{ position: 'absolute', bottom: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'rgba(190,24,93,0.25)', filter: 'blur(100px)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, position: 'relative' }}>
          {/* Title */}
          <div style={{ fontSize: 108, fontWeight: 900, color: 'white', letterSpacing: '-3px', lineHeight: 1 }}>
            21 Dares
          </div>

          {/* Tagline */}
          <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.02em' }}>
            The free online party game with a twist
          </div>

          {/* Card type pills */}
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            {cards.map((label) => (
              <div
                key={label}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 100,
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 20,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* URL */}
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
            21dares.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
