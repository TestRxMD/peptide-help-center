import type { Peptide, PeptideStatus } from '../types';

interface Props {
  peptide: Peptide;
  accentColor?: string;
  onOpen: (p: Peptide) => void;
  compareActive?: boolean;
  onToggleCompare?: (id: string) => void;
}

function statusClass(s: PeptideStatus) {
  if (s === 'Research')     return 'badge-research';
  if (s === 'Approved (RU)') return 'badge-approved-ru';
  if (s === 'FDA Approved') return 'badge-fda';
  if (s === 'Veterinary')   return 'badge-vet';
  if (s === 'Approved (EU)') return 'badge-approved-eu';
  return 'badge-research';
}

export default function PeptideCard({ peptide, accentColor = '#3b82f6', onOpen, compareActive, onToggleCompare }: Props) {
  return (
    <div
      className="card"
      style={{
        cursor: 'pointer',
        borderTop: `2px solid ${accentColor}22`,
        display: 'flex', flexDirection: 'column', gap: 8,
        padding: '14px',
        position: 'relative',
      }}
      onClick={() => onOpen(peptide)}
    >
      {/* Compare checkbox */}
      {onToggleCompare && (
        <button
          className={`btn-compare${compareActive ? ' active' : ''}`}
          style={{ position: 'absolute', top: 10, right: 10, padding: '2px 8px', fontSize: 10 }}
          onClick={e => { e.stopPropagation(); onToggleCompare(peptide.id); }}
        >
          {compareActive ? '✓ Added' : '+ Compare'}
        </button>
      )}

      <div style={{ fontSize: 26, lineHeight: 1 }}>{peptide.emoji}</div>

      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 5 }}>
          {peptide.name}
        </div>
        <span className={`badge ${statusClass(peptide.status)}`}>{peptide.status}</span>
      </div>

      <p style={{
        fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
        display: '-webkit-box', WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {peptide.shortDescription}
      </p>

      {peptide.tags && peptide.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'auto' }}>
          {peptide.tags.slice(0, 3).map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
