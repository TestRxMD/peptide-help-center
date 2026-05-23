import type { NavSection } from '../types';

interface Props {
  active: NavSection;
  onNav: (s: NavSection) => void;
}

const items: { id: NavSection; label: string; emoji: string }[] = [
  { id: 'wiki',      label: 'Wiki',      emoji: '📖' },
  { id: 'recon',     label: 'Recon',     emoji: '🧮' },
  { id: 'stacks',    label: 'Stacks',    emoji: '🔗' },
  { id: 'progress',  label: 'Progress',  emoji: '📊' },
  { id: 'reminders', label: 'Reminders', emoji: '⏰' },
  { id: 'guide',     label: 'Guide',     emoji: '💉' },
  { id: 'ai',        label: 'AI',        emoji: '🤖' },
];

export default function Navigation({ active, onNav }: Props) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8,13,26,0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        padding: '0 16px',
        gap: 0,
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px 14px 0',
          marginRight: 8,
          borderRight: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>💊</div>
          {/* Logo image placeholder — swap src when ready */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-primary)', lineHeight: 1 }}>
              PEPTIDE HELP CENTER
            </div>
            <div style={{ fontSize: 9.5, color: 'var(--text-muted)', letterSpacing: '0.06em', marginTop: 2 }}>
              YOUR PEPTIDE RESOURCE
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ display: 'flex', flex: 1, overflowX: 'auto' }}>
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, padding: '12px 18px',
                background: 'transparent',
                borderBottom: active === item.id
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                color: active === item.id ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: active === item.id ? 600 : 400,
                fontSize: 11, transition: 'all 150ms ease',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 18 }}>{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* EDU badge */}
        <div style={{
          marginLeft: 12, flexShrink: 0,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          padding: '4px 10px', borderRadius: 20,
        }}>
          EDU ONLY
        </div>
      </div>
    </nav>
  );
}
