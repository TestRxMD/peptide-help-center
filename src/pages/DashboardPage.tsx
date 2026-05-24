import { useState, useEffect, useCallback } from 'react';
import type { LabDraw } from '../types';
import { useAuth } from '../contexts/AuthContext';
import AuthGate from '../components/AuthGate';
import {
  supabase,
  fetchLabDraws,
  addLabDraw,
  deleteLabDraw,
  fetchProtocolHistory,
  fetchRecentActivity,
  fetchTopPeptideViews,
} from '../lib/supabase';
import { getPeptideById } from '../data/peptides';

// ── Lab marker presets ────────────────────────────────────────────

const LAB_CATEGORIES = [
  'GH Axis', 'Hormones', 'Thyroid', 'Metabolic', 'Inflammation', 'Vitamins', 'Other',
];

const MARKER_PRESETS: Record<string, { unit: string; ref_low?: number; ref_high?: number }> = {
  'IGF-1':                   { unit: 'ng/mL', ref_low: 115, ref_high: 307 },
  'Total Testosterone':      { unit: 'ng/dL', ref_low: 300, ref_high: 1000 },
  'Free Testosterone':       { unit: 'pg/mL', ref_low: 50,  ref_high: 210 },
  'SHBG':                    { unit: 'nmol/L', ref_low: 16, ref_high: 55 },
  'Estradiol (E2)':          { unit: 'pg/mL', ref_low: 10, ref_high: 40 },
  'LH':                      { unit: 'mIU/mL', ref_low: 1.7, ref_high: 8.6 },
  'FSH':                     { unit: 'mIU/mL', ref_low: 1.5, ref_high: 12.4 },
  'DHEA-S':                  { unit: 'μg/dL', ref_low: 80, ref_high: 560 },
  'Cortisol (AM)':           { unit: 'μg/dL', ref_low: 6,  ref_high: 23 },
  'TSH':                     { unit: 'mIU/L', ref_low: 0.4, ref_high: 4.0 },
  'Free T3':                 { unit: 'pg/mL', ref_low: 2.3, ref_high: 4.2 },
  'Free T4':                 { unit: 'ng/dL', ref_low: 0.8, ref_high: 1.8 },
  'CRP (hs)':                { unit: 'mg/L',  ref_low: 0,  ref_high: 1.0 },
  'Homocysteine':            { unit: 'μmol/L', ref_low: 0, ref_high: 15 },
  'Fasting Glucose':         { unit: 'mg/dL', ref_low: 70, ref_high: 99 },
  'HbA1c':                   { unit: '%',     ref_low: 0,  ref_high: 5.6 },
  'Insulin (fasting)':       { unit: 'μIU/mL', ref_low: 2, ref_high: 19 },
  'Vitamin D (25-OH)':       { unit: 'ng/mL', ref_low: 40, ref_high: 80 },
  'Vitamin B12':             { unit: 'pg/mL', ref_low: 200, ref_high: 900 },
  'Ferritin':                { unit: 'ng/mL', ref_low: 30, ref_high: 300 },
  'CBC - Hemoglobin':        { unit: 'g/dL',  ref_low: 13.5, ref_high: 17.5 },
  'CBC - Hematocrit':        { unit: '%',     ref_low: 38, ref_high: 52 },
  'PSA Total':               { unit: 'ng/mL', ref_low: 0, ref_high: 4.0 },
  'ALT':                     { unit: 'U/L',   ref_low: 7, ref_high: 56 },
  'AST':                     { unit: 'U/L',   ref_low: 10, ref_high: 40 },
  'Creatinine':              { unit: 'mg/dL', ref_low: 0.6, ref_high: 1.2 },
  'eGFR':                    { unit: 'mL/min/1.73m²', ref_low: 60, ref_high: 999 },
};

// ── Helpers ───────────────────────────────────────────────────────

function inRange(draw: LabDraw): boolean | null {
  if (draw.ref_low == null && draw.ref_high == null) return null;
  const lo = draw.ref_low ?? -Infinity;
  const hi = draw.ref_high ?? Infinity;
  return draw.value >= lo && draw.value <= hi;
}

function RangeChip({ draw }: { draw: LabDraw }) {
  const ok = inRange(draw);
  if (ok === null) return null;
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
      background: ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
      color: ok ? '#22c55e' : '#f87171',
      border: `1px solid ${ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
    }}>
      {ok ? 'In Range' : 'Out of Range'}
    </span>
  );
}

// ── Sub-pages ─────────────────────────────────────────────────────

function OverviewTab({ userId }: { userId: string }) {
  const { profile } = useAuth();
  const [stats, setStats]     = useState({ entries: 0, daysLogged: 0, protocols: 0, labDraws: 0 });
  const [topPeps, setTopPeps] = useState<{ name: string; count: number }[]>([]);
  const [recent, setRecent]   = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    Promise.all([
      supabase.from('progress_entries').select('logged_date', { count: 'exact' }).eq('user_id', userId),
      supabase.from('protocol_requests').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('lab_draws').select('id', { count: 'exact' }).eq('user_id', userId),
      fetchTopPeptideViews(userId),
      fetchRecentActivity(userId),
    ]).then(([prog, prot, labs, tops, act]) => {
      const dates = new Set((prog.data ?? []).map((r: Record<string, unknown>) => r.logged_date as string));
      setStats({
        entries:    prog.count ?? 0,
        daysLogged: dates.size,
        protocols:  prot.count ?? 0,
        labDraws:   labs.count ?? 0,
      });
      setTopPeps(tops as { name: string; count: number }[]);
      setRecent(act as Record<string, unknown>[]);
      setLoading(false);
    });
  }, [userId]);

  const statCards = [
    { label: 'Log Entries',    value: stats.entries    },
    { label: 'Days Active',    value: stats.daysLogged },
    { label: 'AI Protocols',   value: stats.protocols  },
    { label: 'Lab Draws',      value: stats.labDraws   },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Profile card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 20px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: '#fff',
        }}>
          {profile?.id?.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
            Your Health Dashboard
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {profile?.primary_goal && <span className="tag">{profile.primary_goal}</span>}
            {profile?.experience    && <span className="tag">{profile.experience}</span>}
            {profile?.age_range     && <span className="tag">{profile.age_range}</span>}
            {profile?.sex           && <span className="tag">{profile.sex}</span>}
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '16px 10px' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>
              {loading ? '…' : s.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Top peptides */}
      {topPeps.length > 0 && (
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 12 }}>
            Most Viewed Peptides
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {topPeps.map(p => (
              <div key={p.name} style={{
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: 8, padding: '6px 12px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{p.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(59,130,246,0.15)', padding: '1px 6px', borderRadius: 4 }}>{p.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {recent.length > 0 && (
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 12 }}>
            Recent Progress Entries
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.slice(0, 5).map((r, i) => {
              const p = getPeptideById(String(r.peptide_id));
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < Math.min(recent.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 20 }}>{p?.emoji ?? '💊'}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>{p?.name ?? String(r.peptide_id)}</span>
                    {!!r.dose && <span className="tag" style={{ marginLeft: 8 }}>{String(r.dose)}</span>}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{String(r.logged_date)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats.entries === 0 && stats.labDraws === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🧬</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Your dashboard is empty</div>
          <div style={{ fontSize: 13 }}>Start logging progress or lab draws to see your health data here.</div>
        </div>
      )}
    </div>
  );
}

// ── Lab Draws Tab ─────────────────────────────────────────────────

function LabDrawsTab({ userId }: { userId: string }) {
  const [draws, setDraws]         = useState<LabDraw[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [filterCat, setFilterCat] = useState('All');

  // form state
  const [fDate,    setFDate]    = useState(new Date().toISOString().slice(0, 10));
  const [fMarker,  setFMarker]  = useState('');
  const [fCustom,  setFCustom]  = useState('');
  const [fCat,     setFCat]     = useState('');
  const [fValue,   setFValue]   = useState('');
  const [fUnit,    setFUnit]    = useState('');
  const [fRefLow,  setFRefLow]  = useState('');
  const [fRefHigh, setFRefHigh] = useState('');
  const [fNotes,   setFNotes]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchLabDraws(userId);
    setDraws(data as LabDraw[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // Auto-fill unit + ref range when a known marker is selected
  useEffect(() => {
    if (fMarker && fMarker !== '_custom') {
      const preset = MARKER_PRESETS[fMarker];
      if (preset) {
        setFUnit(preset.unit);
        setFRefLow(preset.ref_low != null ? String(preset.ref_low) : '');
        setFRefHigh(preset.ref_high != null ? String(preset.ref_high) : '');
      }
    }
  }, [fMarker]);

  const save = async () => {
    const marker = fMarker === '_custom' ? fCustom.trim() : fMarker;
    if (!marker || !fValue || !fUnit) return;
    setSaving(true);
    const row = await addLabDraw(userId, {
      drawn_date: fDate,
      marker,
      category:  fCat || undefined,
      value:     parseFloat(fValue),
      unit:      fUnit,
      ref_low:   fRefLow  ? parseFloat(fRefLow)  : null,
      ref_high:  fRefHigh ? parseFloat(fRefHigh) : null,
      notes:     fNotes || undefined,
    });
    if (row) setDraws(prev => [row as LabDraw, ...prev]);
    // reset form
    setFMarker(''); setFCustom(''); setFValue(''); setFUnit('');
    setFRefLow(''); setFRefHigh(''); setFNotes(''); setFCat('');
    setShowForm(false);
    setSaving(false);
  };

  const remove = async (id: string) => {
    setDraws(prev => prev.filter(d => d.id !== id));
    await deleteLabDraw(id);
  };

  // group by category
  const grouped: Record<string, LabDraw[]> = {};
  draws.filter(d => filterCat === 'All' || d.category === filterCat)
    .forEach(d => {
      const cat = d.category ?? 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(d);
    });

  const categories = ['All', ...Array.from(new Set(draws.map(d => d.category ?? 'Other')))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={filterCat === c ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ padding: '4px 12px', fontSize: 12 }}
            >{c}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Add Draw'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card" style={{ borderColor: 'rgba(59,130,246,0.3)', padding: '18px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 14, color: 'var(--text-primary)' }}>Log Lab Result</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Date</label>
              <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Marker</label>
              <select value={fMarker} onChange={e => setFMarker(e.target.value)}>
                <option value="">— select or type below —</option>
                {Object.keys(MARKER_PRESETS).map(m => <option key={m} value={m}>{m}</option>)}
                <option value="_custom">Other (type below)</option>
              </select>
            </div>
            {fMarker === '_custom' && (
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Custom Marker Name</label>
                <input value={fCustom} onChange={e => setFCustom(e.target.value)} placeholder="e.g. IGFBP-3" />
              </div>
            )}
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Category</label>
              <select value={fCat} onChange={e => setFCat(e.target.value)}>
                <option value="">Auto</option>
                {LAB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Value</label>
              <input type="number" value={fValue} onChange={e => setFValue(e.target.value)} placeholder="e.g. 215" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Unit</label>
              <input value={fUnit} onChange={e => setFUnit(e.target.value)} placeholder="ng/mL" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Ref Low</label>
              <input type="number" value={fRefLow} onChange={e => setFRefLow(e.target.value)} placeholder="optional" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Ref High</label>
              <input type="number" value={fRefHigh} onChange={e => setFRefHigh(e.target.value)} placeholder="optional" />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Notes</label>
            <textarea value={fNotes} onChange={e => setFNotes(e.target.value)} rows={2} placeholder="Fasted? Time of draw? Any context…" style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save Result'}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading lab draws…</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🧪</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>No lab draws yet</div>
          <div style={{ fontSize: 13 }}>Click <strong style={{ color: 'var(--text-secondary)' }}>+ Add Draw</strong> to log your first result.</div>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, paddingLeft: 2 }}>{cat}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(draw => {
                const ok = inRange(draw);
                return (
                  <div key={draw.id} className="card" style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                    borderLeft: ok === false ? '3px solid rgba(239,68,68,0.5)' : ok === true ? '3px solid rgba(34,197,94,0.4)' : '3px solid var(--border)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>{draw.marker}</span>
                        <span style={{
                          fontSize: 15, fontWeight: 800,
                          color: ok === false ? '#f87171' : ok === true ? '#4ade80' : 'var(--text-secondary)',
                        }}>
                          {draw.value} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>{draw.unit}</span>
                        </span>
                        <RangeChip draw={draw} />
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: 'var(--text-muted)' }}>
                        <span>{draw.drawn_date}</span>
                        {draw.ref_low != null && draw.ref_high != null && (
                          <span>Ref: {draw.ref_low}–{draw.ref_high} {draw.unit}</span>
                        )}
                        {draw.notes && <span style={{ color: 'var(--text-muted)' }}>"{draw.notes}"</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(draw.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', padding: '0 4px', flexShrink: 0 }}
                    >✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Protocol History Tab ──────────────────────────────────────────

function ProtocolsTab({ userId }: { userId: string }) {
  const [protocols, setProtocols] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProtocolHistory(userId).then(data => {
      setProtocols(data as Record<string, unknown>[]);
      setLoading(false);
    });
  }, [userId]);

  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading protocols…</div>;

  if (protocols.length === 0) return (
    <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>🤖</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>No protocols yet</div>
      <div style={{ fontSize: 13 }}>Use the AI tab to generate your first personalized protocol.</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {protocols.map(p => {
        const id = String(p.id);
        const isOpen = expanded.has(id);
        const date = new Date(String(p.created_at)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return (
          <div key={id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <button
              onClick={() => toggle(id)}
              style={{
                width: '100%', textAlign: 'left', background: 'none', border: 'none',
                padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>
                    {String(p.goal || 'Custom Protocol')}
                  </span>
                  {!!p.experience && <span className="tag">{String(p.experience)}</span>}
                  {!!p.budget && <span className="tag">{String(p.budget)}</span>}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>{date}</div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 12, transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: '150ms', flexShrink: 0 }}>▼</span>
            </button>
            {isOpen && !!p.protocol_generated && (
              <div style={{
                borderTop: '1px solid var(--border)',
                padding: '14px 16px',
                fontSize: 12.5,
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                background: 'rgba(0,0,0,0.15)',
                maxHeight: 400,
                overflowY: 'auto',
              }}>
                {String(p.protocol_generated)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Activity Tab ──────────────────────────────────────────────────

function ActivityTab({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const PER_PAGE = 20;

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase
      .from('progress_entries')
      .select('*')
      .eq('user_id', userId)
      .order('logged_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1)
      .then(({ data }) => {
        if (page === 0) setEntries(data ?? []);
        else setEntries(prev => [...prev, ...(data ?? [])]);
        setLoading(false);
      });
  }, [userId, page]);

  // group by date
  const byDate: Record<string, Record<string, unknown>[]> = {};
  entries.forEach(e => {
    const d = String(e.logged_date);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(e);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {loading && page === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading activity…</div>
      ) : Object.keys(byDate).length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📅</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>No activity yet</div>
          <div style={{ fontSize: 13 }}>Log your first dose in the Progress tab to see your history here.</div>
        </div>
      ) : (
        <>
          {Object.entries(byDate).map(([date, dayEntries]) => (
            <div key={date}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, paddingLeft: 2 }}>{date}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dayEntries.map((entry, i) => {
                  const p = getPeptideById(String(entry.peptide_id));
                  return (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 14px' }}>
                      <div style={{ fontSize: 20, flexShrink: 0 }}>{p?.emoji ?? '💊'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{p?.name ?? String(entry.peptide_id)}</span>
                          {!!entry.dose  && <span className="tag">{String(entry.dose)}</span>}
                          {!!entry.route && <span className="tag">{String(entry.route)}</span>}
                          <span style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                            {Array.from({ length: 5 }, (_, idx) => (
                              <span key={idx} style={{ color: idx < Number(entry.rating ?? 0) ? '#f59e0b' : 'var(--border-light)', fontSize: 11 }}>★</span>
                            ))}
                          </span>
                        </div>
                        {!!entry.notes && (
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{String(entry.notes)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {entries.length > 0 && entries.length % PER_PAGE === 0 && (
            <button className="btn btn-ghost" onClick={() => setPage(p => p + 1)} style={{ alignSelf: 'center', fontSize: 13 }}>
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────

type DashTab = 'overview' | 'labs' | 'protocols' | 'activity';

function DashboardContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<DashTab>('overview');

  const tabs: { id: DashTab; label: string; emoji: string }[] = [
    { id: 'overview',  label: 'Overview',         emoji: '🏠' },
    { id: 'labs',      label: 'Lab Draws',         emoji: '🧪' },
    { id: 'protocols', label: 'Protocol History',  emoji: '🤖' },
    { id: 'activity',  label: 'Activity Log',      emoji: '📅' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.02em', fontFamily: "'DM Sans', sans-serif" }}>
          Client Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
          Your personal health hub — lab draws, protocols, and progress all in one place.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        borderBottom: '1px solid var(--border)', paddingBottom: 0,
        overflowX: 'auto',
      }}>
        {tabs.map(t => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '9px 16px', background: 'none', border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                marginBottom: -1, fontFamily: 'inherit',
                transition: 'color 150ms, border-color 150ms',
              }}
              onMouseOver={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseOut={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              {t.emoji} {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'overview'  && <OverviewTab  userId={user!.id} />}
      {tab === 'labs'      && <LabDrawsTab  userId={user!.id} />}
      {tab === 'protocols' && <ProtocolsTab userId={user!.id} />}
      {tab === 'activity'  && <ActivityTab  userId={user!.id} />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGate feature="dashboard">
      <DashboardContent />
    </AuthGate>
  );
}
