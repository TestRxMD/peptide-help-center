import { useState } from 'react';
import type { NavSection } from './types';
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

function AppInner() {
  const [section, setSection] = useState<NavSection>('wiki');
  const { showAuthModal } = useAuth();

  const page = {
    wiki:      <WikiPage />,
    recon:     <ReconPage />,
    stacks:    <StacksPage />,
    progress:  <ProgressPage />,
    reminders: <RemindersPage />,
    guide:     <GuidePage />,
    ai:        <AIPage />,
    dashboard: <DashboardPage />,
  }[section];

  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <Navigation active={section} onNav={setSection} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>{page}</main>
      <Footer />
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
