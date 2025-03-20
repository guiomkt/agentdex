import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { Agencies } from './pages/Agencies';
import { AgencyDetails } from './pages/AgencyDetails';
import { EditAgency } from './pages/EditAgency';
import { Ranking } from './pages/Ranking';
import { SubmitAgent } from './pages/SubmitAgent';
import { SubmitAgency } from './pages/SubmitAgency';
import { AgentDetails } from './pages/AgentDetails';
import { Compare } from './pages/Compare';
import { Profile } from './pages/Profile';
import { EditAgent } from './pages/EditAgent';
import { Verifications } from './pages/Verifications';
import { CompareDrawer } from './components/comparison/CompareDrawer';
import { supabase } from './lib/supabase';
import { useAuthStore } from './lib/store';

// Scroll restoration component
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function App() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Set initial user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-secondary">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/agencies" element={<Agencies />} />
            <Route path="/agencies/:id" element={<AgencyDetails />} />
            <Route path="/agencies/:id/edit" element={<EditAgency />} />
            <Route path="/submit-agency" element={<SubmitAgency />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/submit" element={<SubmitAgent />} />
            <Route path="/agents/:id" element={<AgentDetails />} />
            <Route path="/agents/:id/edit" element={<EditAgent />} />
            <Route path="/compare/:ids" element={<Compare />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/verifications" element={<Verifications />} />
          </Routes>
        </main>
        <CompareDrawer />
        <Footer />
      </div>
    </Router>
  );
}

export default App