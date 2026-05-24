import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  feature: 'progress' | 'ai';
  children: ReactNode;
}

const CONFIG = {
  progress: {
    icon: '📊',
    title: 'Progress Log',
    subtitle: 'Track every dose, route, and result — permanently.',
    perks: [
      'Unlimited log entries saved to your account',
      'View history across all your devices',
      'Track which peptides and doses work best for you',
      'Data used to improve your personalized AI protocols',
    ],
  },
  ai: {
    icon: '🧠',
    title: 'The Peptide Atlas AI',
    subtitle: 'Evidence-based protocols and dosing math, on demand.',
    perks: [
      'Full access to The Peptide Atlas — our AI research assistant',
      'Generate complete, personalized peptide protocols',
      'Dosing math, reconstitution steps, and safety notes',
      'Conversation history saved to your account',
    ],
  },
};

export default function AuthGate({ feature, children }: Props) {
  const { user, loading, openAuth } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 300 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user) return <>{children}</>;

  const cfg = CONFIG[feature];

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: 480, width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center',
      }}>
        {/* Lock icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
        }}>
          {cfg.icon}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em', fontFamily: "'DM Sans', sans-serif" }}>
          {cfg.title}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.55 }}>
          {cfg.subtitle}
        </p>

        {/* Perks */}
        <div style={{
          background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '16px 18px', marginBottom: 24,
          textAlign: 'left',
        }}>
          {cfg.perks.map((perk, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < cfg.perks.length - 1 ? 10 : 0 }}>
              <svg style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{perk}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <button
          className="btn btn-primary"
          onClick={openAuth}
          style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, marginBottom: 10 }}
        >
          Create free account
        </button>
        <button
          className="btn btn-ghost"
          onClick={openAuth}
          style={{ width: '100%', justifyContent: 'center', fontSize: 13.5 }}
        >
          Sign in
        </button>

        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 16 }}>
          Free forever · No credit card required
        </p>
      </div>
    </div>
  );
}
