import { useState } from 'react';
import type { Reminder, AdminRoute } from '../types';
import { peptides, getPeptideById } from '../data/peptides';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const routes: AdminRoute[] = ['SubQ', 'IM', 'Intranasal', 'Oral', 'Topical', 'IV', 'Sublingual'];

const sampleReminders: Reminder[] = [
  { id: '1', peptideId: 'ipamorelin', time: '22:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], dose: '200 mcg', route: 'SubQ', enabled: true, note: 'Pre-sleep with CJC-1295' },
  { id: '2', peptideId: 'semax',      time: '08:00', days: ['Mon','Tue','Wed','Thu','Fri'],            dose: '400 mcg', route: 'Intranasal', enabled: true, note: 'AM cognitive boost' },
  { id: '3', peptideId: 'bpc-157',   time: '07:30', days: ['Mon','Wed','Fri'],                        dose: '250 mcg', route: 'SubQ',      enabled: false, note: 'Knee healing protocol' },
];

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>(sampleReminders);
  const [showAdd, setShowAdd]     = useState(false);

  // form
  const [pid, setPid]       = useState(peptides[0].id);
  const [time, setTime]     = useState('08:00');
  const [days, setDays]     = useState<string[]>(['Mon','Wed','Fri']);
  const [dose, setDose]     = useState('');
  const [route, setRoute]   = useState<AdminRoute>('SubQ');
  const [note, setNote]     = useState('');

  const toggleDay = (d: string) =>
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const toggleEnabled = (id: string) =>
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));

  const deleteReminder = (id: string) =>
    setReminders(prev => prev.filter(r => r.id !== id));

  const saveReminder = () => {
    if (!dose.trim() || days.length === 0) return;
    setReminders(prev => [...prev, {
      id: Date.now().toString(), peptideId: pid, time, days, dose, route, enabled: true, note,
    }]);
    setDose(''); setNote('');
    setShowAdd(false);
  };

  const enabled = reminders.filter(r => r.enabled);
  const disabled = reminders.filter(r => !r.enabled);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>⏰ Reminders</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>Schedule dose reminders for your protocols.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? '✕ Cancel' : '+ Add Reminder'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(59,130,246,0.3)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: 'var(--text-primary)' }}>New Reminder</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Peptide</label>
              <select value={pid} onChange={e => setPid(e.target.value)}>
                {peptides.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Dose</label>
              <input value={dose} onChange={e => setDose(e.target.value)} placeholder="e.g. 200 mcg" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Route</label>
              <select value={route} onChange={e => setRoute(e.target.value as AdminRoute)}>
                {routes.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Days</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  style={{
                    padding: '5px 11px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                    background: days.includes(d) ? 'rgba(59,130,246,0.2)' : 'var(--bg-input)',
                    border: `1px solid ${days.includes(d) ? '#3b82f6' : 'var(--border)'}`,
                    color: days.includes(d) ? '#93c5fd' : 'var(--text-muted)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >{d}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Note (optional)</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Protocol context…" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={saveReminder}>Save Reminder</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Active reminders */}
      {enabled.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
            Active ({enabled.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {enabled.map(r => <ReminderRow key={r.id} reminder={r} onToggle={toggleEnabled} onDelete={deleteReminder} />)}
          </div>
        </div>
      )}

      {/* Inactive */}
      {disabled.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
            Paused ({disabled.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {disabled.map(r => <ReminderRow key={r.id} reminder={r} onToggle={toggleEnabled} onDelete={deleteReminder} />)}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
          No reminders. Add your first reminder above!
        </div>
      )}
    </div>
  );
}

function ReminderRow({ reminder, onToggle, onDelete }: { reminder: Reminder; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const p = getPeptideById(reminder.peptideId);
  return (
    <div className="card" style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 14px',
      opacity: reminder.enabled ? 1 : 0.55,
    }}>
      <div style={{ fontSize: 22, flexShrink: 0 }}>{p?.emoji ?? '💊'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)' }}>{p?.name ?? reminder.peptideId}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>{reminder.time}</span>
          <span className="tag">{reminder.dose}</span>
          <span className="tag">{reminder.route}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: reminder.note ? 3 : 0 }}>
          {reminder.days.map(d => (
            <span key={d} style={{
              fontSize: 10, fontWeight: 600,
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '1px 6px', color: 'var(--text-muted)',
            }}>{d}</span>
          ))}
        </div>
        {reminder.note && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{reminder.note}</div>}
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onToggle(reminder.id)}
          style={{
            padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            background: reminder.enabled ? 'rgba(16,185,129,0.12)' : 'var(--bg-input)',
            border: `1px solid ${reminder.enabled ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
            color: reminder.enabled ? '#34d399' : 'var(--text-muted)',
          }}
        >{reminder.enabled ? '● On' : '○ Off'}</button>
        <button
          onClick={() => onDelete(reminder.id)}
          style={{
            padding: '5px 8px', borderRadius: 7, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171',
          }}
        >✕</button>
      </div>
    </div>
  );
}
