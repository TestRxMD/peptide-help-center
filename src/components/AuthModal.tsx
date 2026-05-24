import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

type ModalTab  = 'signup' | 'signin';
type ModalStep = 'credentials' | 'profile' | 'done';

const GOALS = [
  { value: 'healing',   label: 'Tissue Healing & Recovery' },
  { value: 'gh',        label: 'GH Optimization / Anti-Aging' },
  { value: 'cognitive', label: 'Cognitive Enhancement' },
  { value: 'longevity', label: 'Longevity' },
  { value: 'fatloss',   label: 'Fat Loss' },
  { value: 'sexual',    label: 'Sexual Health' },
  { value: 'skin',      label: 'Skin & Collagen' },
  { value: 'immune',    label: 'Immune Support' },
];

export default function AuthModal() {
  const { signUp, signIn, saveProfile, closeAuth, user } = useAuth();

  const [tab,      setTab]      = useState<ModalTab>('signup');
  const [step,     setStep]     = useState<ModalStep>('credentials');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  // Profile fields
  const [goal,       setGoal]       = useState('');
  const [experience, setExperience] = useState('');
  const [ageRange,   setAgeRange]   = useState('');
  const [sex,        setSex]        = useState('');

  // Close if user just signed in externally
  useEffect(() => {
    if (user && step === 'credentials') closeAuth();
  }, [user, step, closeAuth]);

  // Trap focus and close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuth(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeAuth]);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) { setError('Email and password are required.'); return; }
    if (tab === 'signup' && password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    const err = tab === 'signup'
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);
    setLoading(false);

    if (err) { setError(err); return; }
    if (tab === 'signup') setStep('profile');
    else closeAuth();
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    await saveProfile({
      primary_goal: goal || undefined,
      experience:   experience || undefined,
      age_range:    ageRange || undefined,
      sex:          sex || undefined,
    });
    setLoading(false);
    closeAuth();
  };

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) closeAuth(); }}
      style={{ alignItems: 'center' }}
    >
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)',
        animation: 'slideUp 180ms cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
      }}>

        {/* ── Step 1: Credentials ── */}
        {step === 'credentials' && (
          <>
            {/* Header */}
            <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif" }}>
                    Peptide Help Center
                  </span>
                </div>
                <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, fontFamily: "'DM Sans', sans-serif" }}>
                  {tab === 'signup' ? 'Create your free account' : 'Welcome back'}
                </h2>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>
                  {tab === 'signup' ? 'Save your progress log and access The Peptide Atlas AI.' : 'Sign in to access your account.'}
                </p>
              </div>
              <button
                onClick={closeAuth}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', width: 28, height: 28, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}
              >✕</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, padding: '16px 24px 0', borderBottom: '1px solid var(--border)' }}>
              {(['signup', 'signin'] as ModalTab[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(null); }}
                  style={{
                    padding: '8px 16px', background: 'transparent', border: 'none',
                    borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                    color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: tab === t ? 600 : 400, fontSize: 13.5,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all var(--t-fast)',
                    marginBottom: -1,
                  }}
                >
                  {t === 'signup' ? 'Create account' : 'Sign in'}
                </button>
              ))}
            </div>

            {/* Form */}
            <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Min. 8 characters"
                  autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  style={{ width: '100%' }}
                />
              </div>
              {tab === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: '#f87171' }}>
                  {error}
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14, marginTop: 4, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Please wait…' : tab === 'signup' ? 'Create free account' : 'Sign in'}
              </button>

              {tab === 'signup' && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                  Free forever · No credit card required
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Step 2: Profile (shown after signup) ── */}
        {step === 'profile' && (
          <div style={{ padding: '28px 24px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✓</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>Account created!</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quick profile — personalizes your experience</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Primary Goal</label>
                <select value={goal} onChange={e => setGoal(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select a goal…</option>
                  {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Experience with Peptides</label>
                <select value={experience} onChange={e => setExperience(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select…</option>
                  <option>First time</option>
                  <option>Some experience</option>
                  <option>Experienced</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Age Range</label>
                  <select value={ageRange} onChange={e => setAgeRange(e.target.value)} style={{ width: '100%' }}>
                    <option value="">Select…</option>
                    <option>18–24</option><option>25–34</option><option>35–44</option>
                    <option>45–54</option><option>55+</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Biological Sex</label>
                  <select value={sex} onChange={e => setSex(e.target.value)} style={{ width: '100%' }}>
                    <option value="">Select…</option>
                    <option>Male</option><option>Female</option>
                    <option>Other</option><option>Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button
                className="btn btn-primary"
                onClick={handleSaveProfile}
                disabled={loading}
                style={{ flex: 1, justifyContent: 'center', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Saving…' : 'Save & continue →'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={closeAuth}
                style={{ flexShrink: 0 }}
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
