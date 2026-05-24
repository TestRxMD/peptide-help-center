import { useEffect, useState } from 'react';
import type { Peptide, PeptideStatus, CommunityPost } from '../types';
import { getCategoryById } from '../data/peptides';
import { trackPeptideView, fetchRelatedPosts } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

export default function PeptideModal({ peptide, onClose, onNavCommunity }: Props & { onNavCommunity?: () => void }) {
  const category = getCategoryById(peptide.categoryId);
  const { user } = useAuth();
  const [relatedPosts, setRelatedPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Track view (fire-and-forget — works for logged-in and anonymous)
  useEffect(() => {
    trackPeptideView(peptide.id, peptide.name, 'wiki', user?.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peptide.id]);

  // Load related community posts
  useEffect(() => {
    fetchRelatedPosts(peptide.id, 3).then(setRelatedPosts);
  }, [peptide.id]);

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

          {/* Sourcing callout */}
          <div style={{
            marginTop: 20, padding: '12px 14px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(59,130,246,0.06) 100%)',
            border: '1px solid rgba(16,185,129,0.22)',
            borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🏅</span>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Quality sourcing is critical.</span>
              {' '}Only use pharmaceutical-grade, third-party tested peptides with a certificate of analysis.
              {' '}We recommend{' '}
              <a
                href="https://www.shortproteins.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#34d399', fontWeight: 600, textDecoration: 'none' }}
              >
                Short Proteins ↗
              </a>
              {' '}for HPLC-verified, batch-tested products.
            </div>
          </div>

          {/* Related community discussions */}
          {relatedPosts.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-title">💬 Community Discussions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {relatedPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => { onClose(); onNavCommunity?.(); }}
                    style={{
                      padding: '10px 12px', borderRadius: 8,
                      background: 'var(--bg-input)', border: '1px solid var(--border)',
                      cursor: onNavCommunity ? 'pointer' : 'default',
                      transition: 'border-color 150ms',
                    }}
                    onMouseOver={e => { if (onNavCommunity) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(31,64,204,0.3)'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 3 }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', gap: 10 }}>
                      <span>▲ {post.score}</span>
                      <span>💬 {post.comment_count}</span>
                      <span>by {post.author_display}</span>
                    </div>
                  </div>
                ))}
                {onNavCommunity && (
                  <button
                    onClick={() => { onClose(); onNavCommunity(); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12.5, color: 'var(--accent)', fontFamily: 'inherit',
                      textAlign: 'left', padding: '4px 0', fontWeight: 600,
                    }}
                  >View all {peptide.name} discussions →</button>
                )}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{
            marginTop: 10, padding: '10px 14px',
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
