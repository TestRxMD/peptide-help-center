import type { NavSection } from '../types';

interface Props {
  active: NavSection;
  onNav: (s: NavSection) => void;
}

const items: { id: NavSection; label: string }[] = [
  { id: 'wiki',      label: 'Wiki'      },
  { id: 'recon',     label: 'Recon'     },
  { id: 'stacks',    label: 'Stacks'    },
  { id: 'progress',  label: 'Progress'  },
  { id: 'reminders', label: 'Reminders' },
  { id: 'guide',     label: 'Guide'     },
  { id: 'ai',        label: 'AI'        },
];

export default function Navigation({ active, onNav }: Props) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(7,9,15,0.85)',
      backdropFilter: 'blur(24px) saturate(1.6)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', height: 52,
        gap: 0,
      }}>

        {/* Wordmark / Logo area */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          paddingRight: 24, marginRight: 4,
          borderRight: '1px solid var(--border)',
          flexShrink: 0, height: '100%',
        }}>
          {/* Placeholder — swap this div for <img> when logo is ready */}
          <div style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          }} />
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Peptide Help Center
          </span>
        </div>

        {/* Nav items */}
        <div style={{
          display: 'flex', flex: 1,
          overflowX: 'auto', height: '100%',
          msOverflowStyle: 'none', scrollbarWidth: 'none',
        }}>
          {items.map(item => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 16px', height: '100%',
                  background: 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13, letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  position: 'relative',
                  transition: 'color var(--t)',
                  fontFamily: "'Inter', sans-serif",
                  borderBottom: isActive
                    ? '1.5px solid var(--accent)'
                    : '1.5px solid transparent',
                }}
                onMouseOver={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                onMouseOut={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* EDU badge */}
        <div style={{
          marginLeft: 16, flexShrink: 0,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          fontFamily: "'DM Sans', sans-serif",
          border: '1px solid var(--border)',
          padding: '3px 8px', borderRadius: 4,
        }}>
          EDU ONLY
        </div>
      </div>
    </nav>
  );
}
