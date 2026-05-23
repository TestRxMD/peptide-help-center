import { useState } from 'react';
import type { NavSection } from './types';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import WikiPage from './pages/WikiPage';
import ReconPage from './pages/ReconPage';
import StacksPage from './pages/StacksPage';
import ProgressPage from './pages/ProgressPage';
import RemindersPage from './pages/RemindersPage';
import GuidePage from './pages/GuidePage';
import AIPage from './pages/AIPage';

export default function App() {
  const [section, setSection] = useState<NavSection>('wiki');

  const page = {
    wiki:      <WikiPage />,
    recon:     <ReconPage />,
    stacks:    <StacksPage />,
    progress:  <ProgressPage />,
    reminders: <RemindersPage />,
    guide:     <GuidePage />,
    ai:        <AIPage />,
  }[section];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation active={section} onNav={setSection} />
      <main style={{ flex: 1 }}>{page}</main>
      <Footer />
    </div>
  );
}
