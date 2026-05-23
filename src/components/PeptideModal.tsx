import { useEffect } from 'react';
import type { Peptide, PeptideStatus } from '../types';
import { getCategoryById } from '../data/peptides';

interface Props {
  peptide: Peptide;
  onClose: () => void;
}

function statusClass(s: PeptideStatus) {
  if (s === 'Research')      return 'badge-research';
  if (s === 'Approved (RU)') return 'badge-approved-ru';
  if (s === 'FDA Approved')  return 'badge-fda';
  if (s === 'Veterinary')    return 'badge-vet';
  if (s === 'Approved (EU)') return 'badge-approved-eu';
  return 'badge-research';
}

export default function PeptideModal({ peptide, onClose }: Props) {
  const category = getCategoryById(peptide.categoryId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <div style={{ fontSize: 36, marginRight: 14 }}>{peptide.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {peptide.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span className={`badge ${statusClass(peptide.status)}`}>{peptide.status}</span>
              {category && (
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  {category.emoji} {category.name}
                </span>
              )}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            {peptide.description}
          </p>

          {/* Quick stats */}
          {(peptide.halfLife || peptide.dosageRange || peptide.frequency || peptide.routes) && (
            <div className="detail-section">
              <div className="detail-section-title">Dosing & Pharmacokinetics</div>
              <div className="detail-grid">
                {peptide.halfLife && (
                  <div className="detail-item">
                    <div className="detail-item-label">Half-Life</div>
                    <div className="detail-item-value">{peptide.halfLife}</div>
                  </div>
                )}
                {peptide.dosageRange && (
                  <div className="detail-item">
                    <div className="detail-item-label">Dosage Range</div>
                    <div className="detail-item-value">{peptide.dosageRange}</div>
                  </div>
                )}
                {peptide.frequency && (
                  <div className="detail-item">
                    <div className="detail-item-label">Frequency</div>
                    <div className="detail-item-value">{peptide.frequency}</div>
                  </div>
                )}
                {peptide.routes && peptide.routes.length > 0 && (
                  <div className="detail-item">
                    <div className="detail-item-label">Administration</div>
                    <div className="detail-item-value">{peptide.routes.join(', ')}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Components (blends) */}
          {peptide.components && peptide.components.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">Components</div>
              <ul className="bullet-list">
                {peptide.components.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {peptide.benefits && peptide.benefits.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">Benefits & Mechanisms</div>
              <ul className="bullet-list">
                {peptide.benefits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}

          {/* Side effects */}
          {peptide.sideEffects && peptide.sideEffects.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">Side Effects</div>
              <ul className="bullet-list" style={{ '--bullet-color': 'var(--warning)' } as React.CSSProperties}>
                {peptide.sideEffects.map((s, i) => (
                  <li key={i} style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--warning)', flexShrink: 0 }}>▸</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contraindications */}
          {peptide.contraindications && peptide.contraindications.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">⚠️ Contraindications</div>
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, padding: '10px 14px',
              }}>
                <ul className="bullet-list">
                  {peptide.contraindications.map((c, i) => (
                    <li key={i} style={{ color: '#fca5a5' }}>
                      <span style={{ color: '#ef4444', flexShrink: 0 }}>▸</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Synergies */}
          {peptide.synergies && peptide.synergies.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">Synergistic Peptides</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {peptide.synergies.map(s => (
                  <span key={s} style={{
                    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
                    color: '#93c5fd', fontSize: 12, padding: '3px 10px', borderRadius: 6, fontWeight: 500,
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {peptide.tags && peptide.tags.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {peptide.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{
            marginTop: 20, padding: '10px 14px',
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)',
            borderRadius: 8, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5,
          }}>
            📚 For educational purposes only. This information does not constitute medical advice. Consult a qualified healthcare provider before use.
          </div>
        </div>
      </div>
    </div>
  );
}
