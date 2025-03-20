import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCompareStore } from '@/lib/store';

export function CompareDrawer() {
  const navigate = useNavigate();
  const { agents, clearAgents } = useCompareStore();
  const [isOpen, setIsOpen] = useState(false);

  if (agents.length === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-dark transition-colors ${
          isOpen ? 'hidden' : ''
        }`}
      >
        <Scale className="h-6 w-6" />
      </button>

      {/* Drawer */}
      <div
        className={`fixed bottom-0 right-0 w-full md:w-96 bg-neutral rounded-t-xl shadow-xl transform transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-white">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                Comparar Agentes ({agents.length}/3)
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {agents.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                Selecione agentes para comparar
              </p>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {agents.length < 2
                      ? 'Selecione pelo menos 2 agentes para comparar'
                      : 'Pronto para comparar!'}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      clearAgents();
                      setIsOpen(false);
                    }}
                  >
                    Limpar
                  </Button>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  disabled={agents.length < 2}
                  onClick={() => {
                    navigate(`/compare/${agents.join(',')}`);
                    setIsOpen(false);
                  }}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Comparar Agentes
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}