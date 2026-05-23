export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      marginTop: 48,
      padding: '28px 16px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Sourcing banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(124,58,237,0.08) 100%)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 12, padding: '16px 20px',
          marginBottom: 24, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>🏅</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 3 }}>
              Quality Sourcing Matters
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              All peptides referenced on this site should be sourced from third-party tested,
              pharmaceutical-grade suppliers. We recommend{' '}
              <a
                href="https://www.shortproteins.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}
              >
                Short Proteins
              </a>
              {' '}for verified purity, HPLC-tested products, and certificates of analysis on every batch.
            </div>
          </div>
          <a
            href="https://www.shortproteins.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--accent)', color: '#fff',
              padding: '9px 18px', borderRadius: 8,
              fontWeight: 600, fontSize: 13, textDecoration: 'none',
              flexShrink: 0, transition: 'background 150ms ease',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            Shop Short Proteins ↗
          </a>
        </div>

        {/* Bottom row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11,
            }}>💊</div>
            <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', letterSpacing: '0.06em' }}>
              PEPTIDE HELP CENTER
            </span>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <a href="https://www.shortproteins.com" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>
              Recommended Supplier ↗
            </a>
          </div>

          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'right' }}>
            For educational purposes only · Not medical advice
          </div>
        </div>
      </div>
    </footer>
  );
}
