import { useState, useEffect, useCallback } from 'react';
import type { Reminder, AdminRoute } from '../types';
import { peptides, getPeptideById } from '../data/peptides';
import { useAuth } from '../contexts/AuthContext';
import { fetchReminders, upsertReminder, deleteReminderRow } from '../lib/supabase';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ROUTES: AdminRoute[] = ['SubQ', 'IM', 'Intranasal', 'Oral', 'Topical', 'IV', 'Sublingual'];

const SAMPLE_REMINDERS: Reminder[] = [
  { id: '1', peptideId: 'ipamorelin', time: '22:00', days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], dose: '200 mcg', route: 'SubQ',       enabled: true,  notify: true,  note: 'Pre-sleep with CJC-1295' },
  { id: '2', peptideId: 'semax',      time: '08:00', days: ['Mon','Tue','Wed','Thu','Fri'],             dose: '400 mcg', route: 'Intranasal', enabled: true,  notify: true,  note: 'AM cognitive boost' },
  { id: '3', peptideId: 'bpc-157',   time: '07:30', days: ['Mon','Wed','Fri'],                         dose: '250 mcg', route: 'SubQ',       enabled: false, notify: false, note: 'Knee healing protocol' },
];

// ── Notification Settings Card ────────────────────────────────────

interface NotifSettingsProps {
  userEmail: string | undefined;
  currentChannel: 'email' | 'sms' | null | undefined;
  currentPhone: string | null | undefined;
  onSave: (channel: 'email' | 'sms', phone: string) => Promise<void>;
  onDisable: () => Promise<void>;
}

function NotificationSettings({ userEmail, currentChannel, currentPhone, onSave, onDisable }: NotifSettingsProps) {
  const [open,    setOpen]    = useState(false);
  const [channel, setChannel] = useState<'email' | 'sms'>(currentChannel ?? 'email');
  const [phone,   setPhone]   = useState(currentPhone ?? '');
  const [saving,  setSaving]  = useState(false);
  const [disabling, setDisabling] = useState(false);

  // Sync if profile loads after mount
  useEffect(() => {
    setChannel(currentChannel ?? 'email');
    setPhone(currentPhone ?? '');
  }, [currentChannel, currentPhone]);

  const handleSave = async () => {
    if (channel === 'sms' && !phone.trim()) return;
    setSaving(true);
    await onSave(channel, phone.trim());
    setSaving(false);
    setOpen(false);
  };

  const handleDisable = async () => {
    setDisabling(true);
    await onDisable();
    setDisabling(false);
    setOpen(false);
  };

  const channelLabel =
    currentChannel === 'email' ? `📧 Email — ${userEmail ?? ''}` :
    currentChannel === 'sms'   ? `📱 SMS — ${currentPhone ?? ''}` :
    'Off';

  return (
    <div className="card" style={{ marginBottom: 20, borderColor: currentChannel ? 'rgba(31,64,204,0.25)' : 'var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
            🔔 Notification Settings
          </div>
          <div style={{ fontSize: 12.5, color: currentChannel ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
            {currentChannel
              ? <><span style={{ color: 'var(--green)', fontWeight: 600 }}>Active</span> · {channelLabel}</>
              : 'Notifications are off — set up to receive dose reminders via email or SMS'}
          </div>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => setOpen(v => !v)}
          style={{ flexShrink: 0, fontSize: 12.5 }}
        >
          {open ? '✕ Cancel' : currentChannel ? 'Edit' : '+ Set up'}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>

          {/* Channel selector */}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
            Notify me via
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {/* Email option */}
            <button
              onClick={() => setChannel('email')}
              style={{
                flex: 1, padding: '14px 12px', borderRadius: 10, cursor: 'pointer',
                border: `2px solid ${channel === 'email' ? 'var(--accent)' : 'var(--border)'}`,
                background: channel === 'email' ? 'var(--accent-dim)' : 'var(--bg-input)',
                fontFamily: 'inherit', textAlign: 'center', transition: 'all 150ms',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>📧</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: channel === 'email' ? 'var(--accent)' : 'var(--text-primary)', marginBottom: 2 }}>Email</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{userEmail}</div>
            </button>

            {/* SMS option */}
            <button
              onClick={() => setChannel('sms')}
              style={{
                flex: 1, padding: '14px 12px', borderRadius: 10, cursor: 'pointer',
                border: `2px solid ${channel === 'sms' ? 'var(--accent)' : 'var(--border)'}`,
                background: channel === 'sms' ? 'var(--accent-dim)' : 'var(--bg-input)',
                fontFamily: 'inherit', textAlign: 'center', transition: 'all 150ms',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>📱</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: channel === 'sms' ? 'var(--accent)' : 'var(--text-primary)', marginBottom: 2 }}>Text Message</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Enter number below</div>
            </button>
          </div>

          {/* Phone number — only shown when SMS selected */}
          {channel === 'sms' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Mobile number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                autoComplete="tel"
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.4 }}>
                Include country code (e.g. +1 for US). Standard message rates may apply.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || (channel === 'sms' && !phone.trim())}
              style={{ opacity: (saving || (channel === 'sms' && !phone.trim())) ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : 'Save notifications'}
            </button>
            {currentChannel && (
              <button
                className="btn btn-ghost"
                onClick={handleDisable}
                disabled={disabling}
                style={{ color: 'var(--red)', borderColor: 'rgba(220,38,38,0.2)', opacity: disabling ? 0.6 : 1 }}
              >
                {disabling ? '…' : 'Turn off'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function RemindersPage() {
  const { user, profile, saveProfile } = useAuth();

  const [reminders, setReminders] = useState<Reminder[]>(user ? [] : SAMPLE_REMINDERS);
  const [loading,   setLoading]   = useState(!!user);
  const [showAdd,   setShowAdd]   = useState(false);

  // Add-form state
  const [pid,   setPid]   = useState(peptides[0].id);
  const [time,  setTime]  = useState('08:00');
  const [days,  setDays]  = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [dose,  setDose]  = useState('');
  const [route, setRoute] = useState<AdminRoute>('SubQ');
  const [note,  setNote]  = useState('');
  const [notifyNew, setNotifyNew] = useState(true);

  // Load from Supabase when logged in
  useEffect(() => {
    if (!user) {
      setReminders(SAMPLE_REMINDERS);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchReminders(user.id).then(data => {
      setReminders(data);
      setLoading(false);
    });
  }, [user]);

  const toggleDay = (d: string) =>
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const toggleEnabled = useCallback(async (id: string) => {
    setReminders(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, enabled: !r.enabled };
      if (user) upsertReminder(user.id, updated);
      return updated;
    }));
  }, [user]);

  const toggleNotify = useCallback(async (id: string) => {
    setReminders(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, notify: !r.notify };
      if (user) upsertReminder(user.id, updated);
      return updated;
    }));
  }, [user]);

  const deleteReminder = useCallback(async (id: string) => {
    if (user) await deleteReminderRow(user.id, id);
    setReminders(prev => prev.filter(r => r.id !== id));
  }, [user]);

  const saveNewReminder = async () => {
    if (!dose.trim() || days.length === 0) return;
    const draft: Reminder = {
      id: Date.now().toString(),
      peptideId: pid, time, days, dose, route,
      enabled: true, notify: notifyNew, note,
    };
    if (user) {
      const newId = await upsertReminder(user.id, draft);
      if (newId) draft.id = newId;
    }
    setReminders(prev => [...prev, draft]);
    setDose(''); setNote(''); setNotifyNew(true);
    setShowAdd(false);
  };

  // Notification preference handlers
  const saveNotifPrefs = async (channel: 'email' | 'sms', phone: string) => {
    await saveProfile({
      notification_channel: channel,
      notification_phone:   channel === 'sms' ? phone : null,
    });
  };

  const disableNotifs = async () => {
    await saveProfile({ notification_channel: null });
  };

  const enabled  = reminders.filter(r => r.enabled);
  const disabled = reminders.filter(r => !r.enabled);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>⏰ Reminders</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>Schedule dose reminders for your protocols.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? '✕ Cancel' : '+ Add Reminder'}
        </button>
      </div>

      {/* Notification Settings — signed-in users only */}
      {user ? (
        <NotificationSettings
          userEmail={user.email}
          currentChannel={profile?.notification_channel}
          currentPhone={profile?.notification_phone}
          onSave={saveNotifPrefs}
          onDisable={disableNotifs}
        />
      ) : (
        <div style={{
          padding: '12px 16px', marginBottom: 20,
          background: 'var(--bg-input)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>🔔</span>
          <span>
            <strong style={{ color: 'var(--text-secondary)' }}>Sign in</strong> to enable email or SMS reminders and sync across devices. Reminders below are examples.
          </span>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(31,64,204,0.3)' }}>
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
                {ROUTES.map(r => <option key={r}>{r}</option>)}
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
                    background: days.includes(d) ? 'var(--accent-dim)' : 'var(--bg-input)',
                    border: `1px solid ${days.includes(d) ? 'var(--accent)' : 'var(--border)'}`,
                    color: days.includes(d) ? 'var(--accent)' : 'var(--text-muted)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >{d}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Note (optional)</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Protocol context…" />
          </div>

          {/* Notify toggle on new reminder */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            padding: '10px 12px', borderRadius: 8,
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            marginBottom: 12,
          }}>
            <input
              type="checkbox"
              checked={notifyNew}
              onChange={e => setNotifyNew(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                🔔 Send notification for this reminder
              </div>
              {!profile?.notification_channel && user && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  Set up notifications above to receive alerts
                </div>
              )}
            </div>
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={saveNewReminder}>Save Reminder</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>
          Loading reminders…
        </div>
      )}

      {/* Active reminders */}
      {!loading && enabled.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
            Active ({enabled.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {enabled.map(r => (
              <ReminderRow
                key={r.id} reminder={r}
                notificationsConfigured={!!profile?.notification_channel}
                onToggle={toggleEnabled}
                onToggleNotify={toggleNotify}
                onDelete={deleteReminder}
              />
            ))}
          </div>
        </div>
      )}

      {/* Paused reminders */}
      {!loading && disabled.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
            Paused ({disabled.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {disabled.map(r => (
              <ReminderRow
                key={r.id} reminder={r}
                notificationsConfigured={!!profile?.notification_channel}
                onToggle={toggleEnabled}
                onToggleNotify={toggleNotify}
                onDelete={deleteReminder}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && reminders.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
          No reminders yet. Add your first one above!
        </div>
      )}
    </div>
  );
}

// ── Reminder Row ──────────────────────────────────────────────────

function ReminderRow({
  reminder, notificationsConfigured,
  onToggle, onToggleNotify, onDelete,
}: {
  reminder: Reminder;
  notificationsConfigured: boolean;
  onToggle: (id: string) => void;
  onToggleNotify: (id: string) => void;
  onDelete: (id: string) => void;
}) {
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
          {/* Notification badge */}
          {reminder.notify && notificationsConfigured && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
              background: 'rgba(21,128,61,0.1)', border: '1px solid rgba(21,128,61,0.25)',
              color: 'var(--green)',
            }}>🔔 Notifying</span>
          )}
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

      <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {/* Notify toggle */}
        <button
          onClick={() => onToggleNotify(reminder.id)}
          title={reminder.notify ? 'Turn off notification for this reminder' : 'Turn on notification for this reminder'}
          style={{
            padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            background: reminder.notify ? 'rgba(31,64,204,0.1)' : 'var(--bg-input)',
            border: `1px solid ${reminder.notify ? 'rgba(31,64,204,0.3)' : 'var(--border)'}`,
            color: reminder.notify ? 'var(--accent)' : 'var(--text-muted)',
          }}
        >{reminder.notify ? '🔔' : '🔕'}</button>

        {/* On/Off toggle */}
        <button
          onClick={() => onToggle(reminder.id)}
          style={{
            padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            background: reminder.enabled ? 'rgba(16,185,129,0.12)' : 'var(--bg-input)',
            border: `1px solid ${reminder.enabled ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
            color: reminder.enabled ? '#34d399' : 'var(--text-muted)',
          }}
        >{reminder.enabled ? '● On' : '○ Off'}</button>

        {/* Delete */}
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
