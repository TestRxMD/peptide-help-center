import type { CSSProperties } from 'react';
import type { NavSection } from '../types';

interface Props {
  onNav: (s: NavSection) => void;
}

type Tool = { icon: string; title: string; desc: string; cta: string; href?: string; section?: NavSection };

const TOOLS: Tool[] = [
  { icon: '📚', title: 'The Peptide Atlas (Library)', desc: '83 evidence-rated compound guides — search, filter, sort, and open the full guide in one place.', cta: 'Open the Library', href: '/library' },
  { icon: '⚗️', title: 'Reconstitution Calculator', desc: 'Vial mg + bacteriostatic water → exact syringe units, concentration, and doses per vial.', cta: 'Calculate a dose', section: 'recon' },
  { icon: '🤖', title: 'AI Protocol Builder', desc: 'Describe your goal and get a conservative, structured starting protocol to review with a clinician.', cta: 'Build a protocol', section: 'ai' },
  { icon: '📖', title: 'Guide', desc: 'How to source, reconstitute, store, and inject peptides safely — the practical fundamentals.', cta: 'Read the guide', section: 'guide' },
  { icon: '💬', title: 'Community', desc: 'Questions, experiences, and protocols shared by others in the community.', cta: 'Join the discussion', section: 'community' },
  { icon: '📊', title: 'Track & Remind', desc: 'Log doses, follow progress and labs, and set reminders so nothing slips.', cta: 'Open dashboard', section: 'dashboard' },
];

const STATS: [string, string][] = [
  ['83', 'compound guides'],
  ['8', 'categories'],
  ['●●●●●', 'evidence ratings'],
  ['FDA · WADA', 'status flags'],
];

const STEPS: [string, string, string][] = [
  ['1', 'Look it up', 'Find the compound in the Library — mechanism, what the evidence actually supports, dosing math, and cautions.'],
  ['2', 'Do the math', 'Use the Reconstitution Calculator to turn vial size + water into exact syringe units.'],
  ['3', 'Plan conservatively', 'Build a start-low, go-slow protocol with the AI Builder and Guide — then track it.'],
];

export default function HomePage({ onNav }: Props) {
  const wrap: CSSProperties = { maxWidth: 1100, margin: '0 auto', padding: '0 20px', width: '100%' };
  const cardBase: CSSProperties = {
    display: 'block', textAlign: 'left', cursor: 'pointer',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: 20, width: '100%',
    transition: 'border-color var(--t), background var(--t)',
  };
  const hover = (el: HTMLElement, on: boolean) => {
    el.style.borderColor = on ? 'var(--border-light)' : 'var(--border)';
    el.style.background = on ? 'var(--bg-card-hover)' : 'var(--bg-card)';
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Hero */}
      <section style={{ ...wrap, paddingTop: 48, paddingBottom: 26, textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase',
          color: 'var(--accent)', background: 'var(--accent-dim)',
          border: '1px solid rgba(31,64,204,0.22)', padding: '5px 12px', borderRadius: 20,
        }}>Educational peptide reference &amp; tools</div>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 46px)', margin: '18px auto 12px', maxWidth: 760 }}>The Peptide Help Center</h1>
        <p style={{ fontSize: 'clamp(15px, 2.2vw, 18px)', color: 'var(--text-secondary)', maxWidth: 680, margin: '0 auto 22px', lineHeight: 1.55 }}>
          Evidence-rated guides, exact dosing math, and conservative protocol guidance — in clear, intermediate-level medical language. <strong>For education, not medical advice.</strong>
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/library" className="btn btn-primary" style={{ fontSize: 14, padding: '11px 20px' }}>Browse the Library →</a>
          <button onClick={() => onNav('recon')} className="btn btn-ghost" style={{ fontSize: 14, padding: '11px 20px' }}>Reconstitution Calculator</button>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 30 }}>
          {STATS.map(([n, l]) => (
            <div key={l} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 16px', minWidth: 118 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>{n}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section style={{ ...wrap, paddingBottom: 10 }}>
        <h2 style={{ fontSize: 20, marginBottom: 14 }}>Start here</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {TOOLS.map(t => {
            const body = (
              <>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{t.icon}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15.5, color: 'var(--text-primary)', marginBottom: 5 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>{t.desc}</div>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--accent)' }}>{t.cta} →</span>
              </>
            );
            return t.href
              ? <a key={t.title} href={t.href} style={{ ...cardBase, color: 'inherit', textDecoration: 'none' }}
                   onMouseOver={e => hover(e.currentTarget, true)} onMouseOut={e => hover(e.currentTarget, false)}>{body}</a>
              : <button key={t.title} onClick={() => { if (t.section) onNav(t.section); }} style={cardBase}
                   onMouseOver={e => hover(e.currentTarget, true)} onMouseOut={e => hover(e.currentTarget, false)}>{body}</button>;
          })}
        </div>
      </section>

      {/* How to use */}
      <section style={{ ...wrap, paddingTop: 34 }}>
        <h2 style={{ fontSize: 20, marginBottom: 14 }}>How to use this site</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {STEPS.map(([n, title, desc]) => (
            <div key={n} className="card">
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent-dim)', color: 'var(--accent)', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>{n}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14.5, marginBottom: 5 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety */}
      <section style={{ ...wrap, paddingTop: 30, paddingBottom: 52 }}>
        <div style={{ background: 'var(--amber-dim)', border: '1px solid rgba(180,83,9,0.22)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', display: 'flex', gap: 12 }}>
          <div style={{ fontSize: 20, flexShrink: 0 }}>⚠️</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--amber)' }}>Educational use only.</strong> The Peptide Help Center is not a clinician and does not diagnose, treat, or prescribe. Many compounds described are research peptides without FDA approval or validated human dosing. Dosing math is illustrative arithmetic, not a recommendation — start low, go slow, verify against a current Certificate of Analysis, and involve a licensed clinician before any use.
          </div>
        </div>
      </section>
    </div>
  );
}
