import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { Button } from './ui/Button';
import { AuthModal } from './auth/AuthModal';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, setUser } = useAuthStore();
  const [isPremium, setIsPremium] = useState(false);

  // Check if user is premium
  useEffect(() => {
    async function checkPremiumStatus() {
      if (!user) return;

      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('is_premium_user')
          .eq('id', user.id);

        if (error) {
          console.error('Error fetching premium status:', error);
          return;
        }

        setIsPremium(profiles?.[0]?.is_premium_user || false);
      } catch (err) {
        console.error('Error checking premium status:', err);
      }
    }

    checkPremiumStatus();
  }, [user]);

  // Check if we should open the auth modal based on navigation state
  useEffect(() => {
    const state = location.state as { openAuthModal?: boolean } | null;
    if (state?.openAuthModal) {
      setIsAuthModalOpen(true);
      // Clean up the state
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setIsMenuOpen(false);
  }

  function handleNavigate(to: string) {
    navigate(to);
    setIsMenuOpen(false);
  }

  return (
    <nav className="bg-secondary border-b border-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
              <span className="text-xl font-bold">
                <span className="text-white">Agent</span>
                <span className="text-primary">Dex</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/marketplace" className="text-gray-300 hover:text-white px-3 py-2">
              Marketplace
            </Link>
            <Link to="/agencies" className="text-gray-300 hover:text-white px-3 py-2">
              Agências
            </Link>
            <Link to="/ranking" className="text-gray-300 hover:text-white px-3 py-2">
              Ranking
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                {isPremium && (
                  <Link to="/verifications">
                    <Button variant="secondary" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Verificações
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="secondary" size="sm">
                    Meu Perfil
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sair
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-secondary">
          <div className="px-2 pt-2 pb-3 space-y-1">            
            <button
              onClick={() => handleNavigate('/marketplace')}
              className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white"
            >
              Marketplace
            </button>
            <button
              onClick={() => handleNavigate('/agencies')}
              className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white"
            >
              Agências
            </button>
            <button
              onClick={() => handleNavigate('/ranking')}
              className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white"
            >
              Ranking
            </button>
            {user ? (
              <>
                {isPremium && (
                  <button
                    onClick={() => handleNavigate('/verifications')}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white"
                  >
                    Verificações
                  </button>
                )}
                <button
                  onClick={() => handleNavigate('/profile')}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white"
                >
                  Meu Perfil
                </button>
                <Button variant="outline" className="w-full mt-4" onClick={handleLogout}>
                  Sair
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                className="w-full mt-4"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
}