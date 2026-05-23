import { useEffect } from 'react';
import type { Peptide } from '../types';

interface Props {
  peptides: Peptide[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

const rows: { label: string; key: keyof Peptide }[] = [
  { label: 'Status',        key: 'status' },
  { label: 'Half-Life',     key: 'halfLife' },
  { label: 'Dosage',        key: 'dosageRange' },
  { label: 'Frequency',     key: 'frequency' },
  { label: 'Routes',        key: 'routes' },
];

export default function CompareModal({ peptides, onClose, onRemove }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const colWidth = `${100 / peptides.length}%`;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 860 }}>
        <div className="modal-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>
              Compare Peptides
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {peptides.length} peptides selected
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: '14px 18px 22px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="compare-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: 110 }} />
                {peptides.map(p => <col key={p.id} style={{ width: colWidth }} />)}
              </colgroup>
              <thead>
                <tr>
                  <th></th>
                  {peptides.map(p => (
                    <th key={p.id} style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 24 }}>{p.emoji}</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 12, textTransform: 'none', letterSpacing: 0 }}>
                          {p.name}
                        </span>
                        <button
                          onClick={() => onRemove(p.id)}
                          style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#f87171', fontSize: 10, padding: '1px 7px', borderRadius: 4,
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >remove</button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Description</td>
                  {peptides.map(p => (
                    <td key={p.id} style={{ fontSize: 12, verticalAlign: 'top', lineHeight: 1.5 }}>
                      {p.shortDescription}
                    </td>
                  ))}
                </tr>
                {rows.map(row => (
                  <tr key={row.key}>
                    <td>{row.label}</td>
                    {peptides.map(p => {
                      const val = p[row.key];
                      const display = Array.isArray(val) ? val.join(', ') : (val as string | undefined) ?? '—';
                      return <td key={p.id}>{display}</td>;
                    })}
                  </tr>
                ))}
                <tr>
                  <td>Benefits</td>
                  {peptides.map(p => (
                    <td key={p.id} style={{ verticalAlign: 'top' }}>
                      {p.benefits ? (
                        <ul style={{ paddingLeft: 14, margin: 0 }}>
                          {p.benefits.map((b, i) => (
                            <li key={i} style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 2 }}>{b}</li>
                          ))}
                        </ul>
                      ) : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Side Effects</td>
                  {peptides.map(p => (
                    <td key={p.id} style={{ verticalAlign: 'top' }}>
                      {p.sideEffects ? (
                        <ul style={{ paddingLeft: 14, margin: 0 }}>
                          {p.sideEffects.map((s, i) => (
                            <li key={i} style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 2 }}>{s}</li>
                          ))}
                        </ul>
                      ) : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Synergies</td>
                  {peptides.map(p => (
                    <td key={p.id}>
                      {p.synergies ? p.synergies.join(', ') : '—'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
