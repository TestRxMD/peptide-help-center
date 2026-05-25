import { useState, useEffect, useCallback } from 'react';
import type { NavSection } from './types';

// ── URL ↔ section helpers ─────────────────────────────────────────
const SECTIONS: NavSection[] = ['recon', 'stacks', 'progress', 'reminders', 'guide', 'ai', 'dashboard', 'community', 'interaction-checker'];

function pathToSection(path: string): NavSection {
  const seg = path.replace(/^\//, '').toLowerCase() as NavSection;
  return SECTIONS.includes(seg) ? seg : 'wiki';
}

function sectionToPath(section: NavSection): string {
  return section === 'wiki' ? '/' : `/${section}`;
}
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import WikiPage from './pages/WikiPage';
import ReconPage from './pages/ReconPage';
import StacksPage from './pages/StacksPage';
import ProgressPage from './pages/ProgressPage';
import RemindersPage from './pages/RemindersPage';
import GuidePage from './pages/GuidePage';
import AIPage from './pages/AIPage';
import DashboardPage from './pages/DashboardPage';
import CommunityPage from './pages/CommunityPage';
import InteractionCheckerPage from './pages/InteractionCheckerPage';

function AppInner() {
  // Initialise from the current URL so direct links and refreshes work
  const [section, setSection] = useState<NavSection>(() =>
    pathToSection(window.location.pathname)
  );
  const { showAuthModal } = useAuth();

  // Update URL whenever the user clicks a nav link
  const handleNav = useCallback((s: NavSection) => {
    setSection(s);
    const path = sectionToPath(s);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, []);

  // Keep state in sync with browser back / forward buttons
  useEffect(() => {
    const onPop = () => setSection(pathToSection(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const page = {
    wiki:      <WikiPage onNav={handleNav} />,
    recon:     <ReconPage />,
    stacks:    <StacksPage />,
    progress:  <ProgressPage />,
    reminders: <RemindersPage />,
    guide:     <GuidePage />,
    ai:        <AIPage />,
    dashboard:           <DashboardPage />,
    community:           <CommunityPage />,
    'interaction-checker': <InteractionCheckerPage />,
  }[section];

  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <Navigation active={section} onNav={handleNav} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>{page}</main>
      <Footer onNav={handleNav} />
      {showAuthModal && <AuthModal />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
