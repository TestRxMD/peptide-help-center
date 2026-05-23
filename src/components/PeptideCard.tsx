import type { Peptide, PeptideStatus } from '../types';

interface Props {
  peptide: Peptide;
  accentColor?: string;
  onOpen: (p: Peptide) => void;
  compareActive?: boolean;
  onToggleCompare?: (id: string) => void;
}

function statusClass(s: PeptideStatus) {
  if (s === 'Research')      return 'badge-research';
  if (s === 'Approved (RU)') return 'badge-approved-ru';
  if (s === 'FDA Approved')  return 'badge-fda';
  if (s === 'Veterinary')    return 'badge-vet';
  if (s === 'Approved (EU)') return 'badge-approved-eu';
  return 'badge-research';
}

export default function PeptideCard({ peptide, accentColor = '#3b82f6', onOpen, compareActive, onToggleCompare }: Props) {
  return (
    <div
      onClick={() => onOpen(peptide)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 10,
        position: 'relative',
        transition: 'border-color var(--t), background var(--t), box-shadow var(--t)',
        userSelect: 'none',
      }}
      onMouseOver={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--border-light)';
        el.style.background = 'var(--bg-card-hover)';
        el.style.boxShadow = `0 0 0 1px ${accentColor}18, 0 4px 16px rgba(0,0,0,0.3)`;
      }}
      onMouseOut={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--border)';
        el.style.background = 'var(--bg-card)';
        el.style.boxShadow = 'none';
      }}
    >
      {/* Compare toggle */}
      {onToggleCompare && (
        <button
          className={`btn-compare${compareActive ? ' active' : ''}`}
          style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, padding: '2px 7px' }}
          onClick={e => { e.stopPropagation(); onToggleCompare(peptide.id); }}
        >
          {compareActive ? '✓' : '+'}
        </button>
      )}

      {/* Icon + status row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: `${accentColor}14`,
          border: `1px solid ${accentColor}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, lineHeight: 1,
        }}>
          {peptide.emoji}
        </div>
        <span className={`badge ${statusClass(peptide.status)}`}>
          {peptide.status}
        </span>
      </div>

      {/* Name */}
      <div style={{
        fontWeight: 600, fontSize: 13.5,
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {peptide.name}
      </div>

      {/* Description */}
      <p style={{
        fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55,
        display: '-webkit-box', WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
        flex: 1,
      }}>
        {peptide.shortDescription}
      </p>

      {/* Tags */}
      {peptide.tags && peptide.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
          {peptide.tags.slice(0, 3).map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      )}

      {/* View arrow */}
      <div style={{
        fontSize: 11, color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: 4,
        marginTop: 'auto',
      }}>
        View details
        <span style={{ fontSize: 10 }}>→</span>
      </div>
    </div>
  );
}
