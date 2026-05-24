import { useState, useEffect, useCallback } from 'react';
import type { ProgressEntry, AdminRoute } from '../types';
import { peptides, getPeptideById } from '../data/peptides';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AuthGate from '../components/AuthGate';

const routes: AdminRoute[] = ['SubQ', 'IM', 'Intranasal', 'Oral', 'Topical', 'IV', 'Sublingual'];

// ── Supabase row → local ProgressEntry ──────────────────────────
function rowToEntry(row: Record<string, unknown>): ProgressEntry {
  return {
    id:        String(row.id),
    date:      String(row.logged_date),
    peptideId: String(row.peptide_id),
    dose:      String(row.dose ?? ''),
    route:     (row.route as AdminRoute) ?? 'SubQ',
    notes:     String(row.notes ?? ''),
    rating:    Number(row.rating ?? 3),
  };
}

function ProgressContent() {
  const { user } = useAuth();
  const [entries,  setEntries]  = useState<ProgressEntry[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [saving,   setSaving]   = useState(false);

  // form
  const [date,   setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [pid,    setPid]    = useState(peptides[0].id);
  const [dose,   setDose]   = useState('');
  const [route,  setRoute]  = useState<AdminRoute>('SubQ');
  const [notes,  setNotes]  = useState('');
  const [rating, setRating] = useState(3);

  // ── Load entries from Supabase ─────────────────────────────────
  const loadEntries = useCallback(async () => {
    if (!supabase || !user) return;
    setDbLoading(true);
    const { data } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (data) setEntries(data.map(rowToEntry));
    setDbLoading(false);
  }, [user]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  // ── Add entry ──────────────────────────────────────────────────
  const addEntry = async () => {
    if (!dose.trim() || !supabase || !user) return;
    setSaving(true);
    const peptide = getPeptideById(pid);
    const { data, error } = await supabase
      .from('progress_entries')
      .insert({
        user_id:      user.id,
        logged_date:  date,
        peptide_id:   pid,
        peptide_name: peptide?.name,
        dose, route, notes,
        rating,
      })
      .select()
      .single();

    if (!error && data) {
      setEntries(prev => [rowToEntry(data as Record<string, unknown>), ...prev]);
    }
    setDose(''); setNotes(''); setRating(3);
    setShowAdd(false);
    setSaving(false);
  };

  // ── Delete entry ───────────────────────────────────────────────
  const deleteEntry = async (id: string) => {
    if (!supabase) return;
    setEntries(prev => prev.filter(e => e.id !== id)); // optimistic
    await supabase.from('progress_entries').delete().eq('id', id);
  };

  // ── Stats ──────────────────────────────────────────────────────
  const uniqueDays     = new Set(entries.map(e => e.date)).size;
  const uniquePeptides = new Set(entries.map(e => e.peptideId)).size;
  const avgRating      = entries.length
    ? (entries.reduce((s, e) => s + e.rating, 0) / entries.length).toFixed(1)
    : '—';

  // ── Group by date ──────────────────────────────────────────────
  const byDate: Record<string, ProgressEntry[]> = {};
  entries.forEach(e => { if (!byDate[e.date]) byDate[e.date] = []; byDate[e.date].push(e); });
  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Progress Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>Track your peptide protocol — doses, routes, and observations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? '✕ Cancel' : '+ Log Entry'}
        </button>
      </div>

      {/* Stats */}
      <div className="recon-subgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Entries',  value: entries.length },
          { label: 'Days Logged',    value: uniqueDays },
          { label: 'Peptides Used',  value: uniquePeptides },
          { label: 'Avg. Rating',    value: `${avgRating} / 5` },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', marginBottom: 3 }}>
              {dbLoading ? '…' : s.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add entry form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(59,130,246,0.3)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text-primary)' }}>New Log Entry</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Peptide</label>
              <select value={pid} onChange={e => setPid(e.target.value)}>
                {peptides.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Dose</label>
              <input value={dose} onChange={e => setDose(e.target.value)} placeholder="e.g. 250 mcg" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Route</label>
              <select value={route} onChange={e => setRoute(e.target.value as AdminRoute)}>
                {routes.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Rating (1–5)</label>
              <input type="number" value={rating} onChange={e => setRating(Number(e.target.value))} min={1} max={5} />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="How did you feel? Any observations…" style={{ resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={addEntry} disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save Entry'}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Log */}
      {dbLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading your log…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedDates.map(d => (
            <div key={d}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, paddingLeft: 4 }}>{d}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {byDate[d].map(entry => {
                  const p = getPeptideById(entry.peptideId);
                  return (
                    <div key={entry.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 14px' }}>
                      <div style={{ fontSize: 22, flexShrink: 0 }}>{p?.emoji ?? '💊'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>{p?.name ?? entry.peptideId}</span>
                          <span className="tag">{entry.dose}</span>
                          <span className="tag">{entry.route}</span>
                          <span style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} style={{ color: i < entry.rating ? '#f59e0b' : 'var(--border-light)', fontSize: 12 }}>★</span>
                            ))}
                          </span>
                        </div>
                        {entry.notes && (
                          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>{entry.notes}</div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', padding: '0 4px' }}
                      >✕</button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 14 }}>
              No entries yet. Click <strong style={{ color: 'var(--text-secondary)' }}>+ Log Entry</strong> to start tracking your protocol.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProgressPage() {
  return (
    <AuthGate feature="progress">
      <ProgressContent />
    </AuthGate>
  );
}
