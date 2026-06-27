import { useState } from 'react';
import type { NavSection } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  active: NavSection;
  onNav: (s: NavSection) => void;
}

const BASE_ITEMS: { id: NavSection; label: string }[] = [
  { id: 'wiki',                label: 'Wiki'           },
  { id: 'recon',               label: 'Recon'          },
  { id: 'stacks',              label: 'Stacks'         },
  { id: 'progress',            label: 'Progress'       },
  { id: 'reminders',           label: 'Reminders'      },
  { id: 'guide',               label: 'Guide'          },
  { id: 'ai',                  label: 'AI'             },
  { id: 'community',           label: '💬 Community'   },
];

export default function Navigation({ active, onNav }: Props) {
  const { user, signOut, openAuth } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user?.email?.charAt(0).toUpperCase() ?? '';

  const items = user
    ? [...BASE_ITEMS, { id: 'dashboard' as NavSection, label: '⬡ Dashboard' }]
    : BASE_ITEMS;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(243,246,253,0.97)',
      backdropFilter: 'blur(24px) saturate(1.6)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 0 rgba(31,64,204,0.08)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', height: 52,
        gap: 0,
      }}>

        {/* Logo — click to go home */}
        <div style={{
          paddingRight: 20, marginRight: 4,
          borderRight: '1px solid var(--border)',
          flexShrink: 0, height: '100%',
          display: 'flex', alignItems: 'center',
        }}>
          <button
            onClick={() => onNav('wiki')}
            title="Go to homepage"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, lineHeight: 0, display: 'flex', alignItems: 'center',
            }}
          >
            <img
              src="/logo.jpg"
              alt="Peptide Help Center"
              className="nav-logo"
            />
          </button>
        </div>

        {/* Nav items */}
        <div className="nav-scroll" style={{
          display: 'flex', flex: 1,
          overflowX: 'auto', height: '100%',
        }}>
          {items.map(item => {
            const isActive = active === item.id;
            const isDash = item.id === 'dashboard';
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: isDash ? '0 14px' : '0 16px', height: '100%',
                  background: 'transparent',
                  color: isActive
                    ? (isDash ? '#a78bfa' : 'var(--text-primary)')
                    : (isDash ? '#7c3aed' : 'var(--text-muted)'),
                  fontWeight: isActive ? 600 : (isDash ? 500 : 400),
                  fontSize: isDash ? 12.5 : 13, letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  position: 'relative',
                  transition: 'color var(--t)',
                  fontFamily: "'Inter', sans-serif",
                  borderBottom: isActive
                    ? `1.5px solid ${isDash ? '#a78bfa' : 'var(--accent)'}`
                    : '1.5px solid transparent',
                  marginLeft: isDash ? 4 : 0,
                }}
                onMouseOver={e => { if (!isActive) e.currentTarget.style.color = isDash ? '#a78bfa' : 'var(--text-secondary)'; }}
                onMouseOut={e => { if (!isActive) e.currentTarget.style.color = isDash ? '#7c3aed' : 'var(--text-muted)'; }}
              >
                {item.label}
              </button>
            );
          })}
          <a
            href="/library"
            title="The Peptide Atlas — full compound library"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 16px', height: '100%',
              background: 'transparent', color: 'var(--text-muted)',
              fontWeight: 400, fontSize: 13, letterSpacing: '-0.01em',
              whiteSpace: 'nowrap', flexShrink: 0, textDecoration: 'none',
              borderBottom: '1.5px solid transparent',
              transition: 'color var(--t)', fontFamily: "'Inter', sans-serif",
            }}
            onMouseOver={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            Library
          </a>
        </div>

        {/* EDU badge */}
        <div className="nav-edu-badge" style={{
          marginLeft: 16, flexShrink: 0,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          fontFamily: "'DM Sans', sans-serif",
          border: '1px solid var(--border)',
          padding: '3px 8px', borderRadius: 4,
        }}>
          EDU ONLY
        </div>

        {/* Auth area */}
        <div style={{ marginLeft: 12, flexShrink: 0, position: 'relative' }}>
          {user ? (
            <>
              <button
                onClick={() => setMenuOpen(v => !v)}
                title={user.email}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                  color: '#fff', fontWeight: 700, fontSize: 12,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'inherit',
                }}
              >{initials}</button>

              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                    onClick={() => setMenuOpen(false)}
                  />
                  {/* Dropdown */}
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 10, padding: '6px',
                    minWidth: 200, zIndex: 200,
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'fadeIn 120ms ease',
                  }}>
                    <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Signed in as</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                    </div>
                    <button
                      onClick={() => { onNav('dashboard'); setMenuOpen(false); }}
                      style={{
                        width: '100%', textAlign: 'left', padding: '8px 10px',
                        background: 'none', border: 'none', borderRadius: 6,
                        fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background var(--t-fast)',
                        marginBottom: 2,
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={e => e.currentTarget.style.background = 'none'}
                    >
                      ⬡ Client Dashboard
                    </button>
                    <button
                      onClick={() => { signOut(); setMenuOpen(false); }}
                      style={{
                        width: '100%', textAlign: 'left', padding: '8px 10px',
                        background: 'none', border: 'none', borderRadius: 6,
                        fontSize: 13, color: '#f87171', cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background var(--t-fast)',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseOut={e => e.currentTarget.style.background = 'none'}
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <button
              onClick={openAuth}
              style={{
                padding: '5px 13px', borderRadius: 7,
                background: 'var(--accent)', color: '#fff',
                fontSize: 12, fontWeight: 600, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
