import type { NavSection } from '../types';

interface Props {
  onNav: (s: NavSection) => void;
}

export default function Footer({ onNav }: Props) {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      marginTop: 64, padding: '32px 20px 28px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Sourcing callout */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent)',
          borderRadius: 'var(--radius)',
          padding: '16px 20px', marginBottom: 28,
          flexWrap: 'wrap', background: 'rgba(31,64,204,0.04)',
        }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{
              fontWeight: 600, fontSize: 13.5,
              color: 'var(--text-primary)',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '-0.01em', marginBottom: 4,
            }}>
              Quality sourcing is non-negotiable
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Only use pharmaceutical-grade, HPLC-tested peptides with third-party certificates of analysis.
              We recommend{' '}
              <a href="https://www.shortproteins.com" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--accent)', fontWeight: 600 }}>
                Short Proteins
              </a>
              {' '}for verified purity on every batch.
            </div>
          </div>
          <a
            href="https://www.shortproteins.com"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--accent)', color: '#fff',
              padding: '9px 18px', borderRadius: 'var(--radius)',
              fontWeight: 600, fontSize: 13, textDecoration: 'none',
              flexShrink: 0, letterSpacing: '-0.01em',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            Shop Short Proteins
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
          </a>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <button
            onClick={() => onNav('wiki')}
            title="Go to homepage"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, lineHeight: 0, display: 'flex', alignItems: 'center',
            }}
          >
            {/* Crop to icon-only: show left ~50% of the square image */}
            <div style={{
              width: 90, height: 88,
              overflow: 'hidden', position: 'relative', flexShrink: 0,
            }}>
              <img
                src="/logo.jpg"
                alt="Peptide Help Center"
                style={{
                  height: 178, width: 'auto',
                  position: 'absolute', left: 0, top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            </div>
          </button>

          <div style={{ display: 'flex', gap: 20 }}>
            <a href="https://www.shortproteins.com" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Recommended Supplier
            </a>
          </div>

          <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            Educational use only · Not medical advice
          </p>
        </div>
      </div>
    </footer>
  );
}
