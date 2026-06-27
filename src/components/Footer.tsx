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
            <img
              src="/logo.jpg"
              alt="Peptide Help Center"
              className="footer-logo"
            />
          </button>

          <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            Educational use only · Not medical advice
          </p>
        </div>
      </div>
    </footer>
  );
}
