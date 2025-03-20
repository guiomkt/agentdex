import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Building2, Bot, AlertTriangle, Star, MapPin, Users, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

interface PendingAgent {
  id: string;
  name: string;
  description: string;
  image_url: string;
  cover_url: string;
  website_url: string;
  price_type: string;
  starting_price: number | null;
  category: string;
  created_at: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface PendingAgency {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  cover_url: string;
  website_url: string;
  location: string;
  specialties: string[];
  created_at: string;
  cnpj: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  total_clients: number;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

function formatPrice(price: number | null): string {
  if (price === null) return 'Gratuito';
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function Verifications() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAgents, setPendingAgents] = useState<PendingAgent[]>([]);
  const [pendingAgencies, setPendingAgencies] = useState<PendingAgency[]>([]);
  const [activeTab, setActiveTab] = useState<'agents' | 'agencies'>('agents');
  const [verifying, setVerifying] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [itemToReject, setItemToReject] = useState<{ type: 'agent' | 'agency'; id: string } | null>(null);

  useEffect(() => {
    async function checkPermissionAndLoadData() {
      try {
        if (!user) {
          navigate('/');
          return;
        }

        // Check if user is premium
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('is_premium_user')
          .eq('id', user.id);

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          navigate('/');
          return;
        }

        // If no profile or not premium, redirect
        if (!profiles || profiles.length === 0 || !profiles[0].is_premium_user) {
          navigate('/');
          return;
        }

        // Load pending verifications
        const [agentsResponse, agenciesResponse] = await Promise.all([
          supabase
            .from('agents')
            .select(`
              *,
              profiles (
                username,
                avatar_url
              )
            `)
            .eq('verification_status', 'pending')
            .order('created_at', { ascending: false }),

          supabase
            .from('agencies')
            .select(`
              *,
              profiles (
                username,
                avatar_url
              )
            `)
            .eq('verification_status', 'pending')
            .order('created_at', { ascending: false })
        ]);

        if (agentsResponse.error) throw agentsResponse.error;
        if (agenciesResponse.error) throw agenciesResponse.error;

        setPendingAgents(agentsResponse.data || []);
        setPendingAgencies(agenciesResponse.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }

    checkPermissionAndLoadData();
  }, [user, navigate]);

  async function handleVerification(
    type: 'agent' | 'agency',
    id: string,
    action: 'approve' | 'reject'
  ) {
    if (action === 'reject' && !rejectionReason) {
      setItemToReject({ type, id });
      setShowRejectionDialog(true);
      return;
    }

    try {
      setVerifying(id);
      const table = type === 'agent' ? 'agents' : 'agencies';
      
      const { error: updateError } = await supabase
        .from(table)
        .update({ 
          verification_status: action === 'approve' ? 'approved' : 'rejected',
          rejected_at: action === 'reject' ? new Date().toISOString() : null,
          rejected_reason: action === 'reject' ? rejectionReason : null
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state
      if (type === 'agent') {
        setPendingAgents((prev) => prev.filter((item) => item.id !== id));
      } else {
        setPendingAgencies((prev) => prev.filter((item) => item.id !== id));
      }

      // Clear rejection state
      setRejectionReason('');
      setShowRejectionDialog(false);
      setItemToReject(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar');
    } finally {
      setVerifying(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-neutral rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Verificações Pendentes</h1>
            <p className="text-gray-400">
              Gerencie as solicitações de verificação de agentes e agências
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900 text-red-500 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-neutral mb-8">
          <button
            className={`pb-4 px-2 text-lg font-medium flex items-center gap-2 ${
              activeTab === 'agents'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('agents')}
          >
            <Bot className="h-5 w-5" />
            Agentes ({pendingAgents.length})
          </button>
          <button
            className={`pb-4 px-2 text-lg font-medium flex items-center gap-2 ${
              activeTab === 'agencies'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('agencies')}
          >
            <Building2 className="h-5 w-5" />
            Agências ({pendingAgencies.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            {pendingAgents.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum agente pendente de verificação</p>
              </div>
            ) : (
              pendingAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-neutral rounded-xl overflow-hidden border border-neutral-dark"
                >
                  <div className="p-6">
                    <div className="flex flex-col gap-6">
                      {/* Cover Image */}
                      {agent.cover_url && (
                        <div className="w-full h-48 rounded-lg overflow-hidden">
                          <img
                            src={agent.cover_url}
                            alt={`${agent.name} cover`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-start gap-6">
                        {/* Logo */}
                        <img
                          src={agent.image_url || `https://source.unsplash.com/random/800x600?ai&sig=${agent.id}`}
                          alt={agent.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
                              <p className="text-gray-400 mb-2">por {agent.profiles.username}</p>
                              <p className="text-gray-400 mb-4">{agent.description}</p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <h4 className="font-medium mb-2">Informações Básicas</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                      <Globe className="h-4 w-4" />
                                      <a href={agent.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                        {agent.website_url}
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                      <Star className="h-4 w-4" />
                                      <span>Categoria: {agent.category}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">Preço</h4>
                                  <div className="space-y-2">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                                      agent.price_type === 'free'
                                        ? 'bg-green-900/20 text-green-500'
                                        : agent.price_type === 'paid'
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-blue-900/20 text-blue-500'
                                    }`}>
                                      {agent.price_type === 'free'
                                        ? 'Gratuito'
                                        : agent.price_type === 'paid'
                                        ? 'Pago'
                                        : 'Freemium'}
                                    </span>
                                    {agent.starting_price !== null && (
                                      <div className="text-gray-400">
                                        Preço inicial: {formatPrice(agent.starting_price)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleVerification('agent', agent.id, 'reject')}
                                disabled={verifying === agent.id}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Recusar
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleVerification('agent', agent.id, 'approve')}
                                disabled={verifying === agent.id}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Aprovar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'agencies' && (
          <div className="space-y-6">
            {pendingAgencies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma agência pendente de verificação</p>
              </div>
            ) : (
              pendingAgencies.map((agency) => (
                <div
                  key={agency.id}
                  className="bg-neutral rounded-xl overflow-hidden border border-neutral-dark"
                >
                  <div className="p-6">
                    <div className="flex flex-col gap-6">
                      {/* Cover Image */}
                      {agency.cover_url && (
                        <div className="w-full h-48 rounded-lg overflow-hidden">
                          <img
                            src={agency.cover_url}
                            alt={`${agency.name} cover`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-start gap-6">
                        {/* Logo */}
                        <div className="w-24 h-24 flex items-center justify-center flex-shrink-0">
                          <img
                            src={agency.logo_url || `https://source.unsplash.com/random/400x400?company&sig=${agency.id}`}
                            alt={agency.name}
                            className="w-auto h-auto max-w-[90%] max-h-[90%] object-contain"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{agency.name}</h3>
                              <p className="text-gray-400 mb-2">por {agency.profiles.username}</p>
                              <p className="text-gray-400 mb-4">{agency.description}</p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <h4 className="font-medium mb-2">Informações Básicas</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                      <MapPin className="h-4 w-4" />
                                      <span>{agency.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                      <Users className="h-4 w-4" />
                                      <span>{agency.total_clients} clientes</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                      <Globe className="h-4 w-4" />
                                      <a href={agency.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                        {agency.website_url}
                                      </a>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">CNPJ</h4>
                                  <p className="text-gray-400">{agency.cnpj}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Especialidades</h4>
                                <div className="flex flex-wrap gap-2">
                                  {agency.specialties.map((specialty, index) => (
                                    <span
                                      key={index}
                                      className="bg-neutral-dark px-3 py-1 rounded-full text-sm text-gray-400"
                                    >
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleVerification('agency', agency.id, 'reject')}
                                disabled={verifying === agency.id}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Recusar
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleVerification('agency', agency.id, 'approve')}
                                disabled={verifying === agency.id}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Aprovar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rejection Dialog */}
        {showRejectionDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-neutral rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Motivo da Recusa</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-neutral-dark rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary h-32 mb-4"
                placeholder="Descreva o motivo da recusa..."
                required
              />
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectionDialog(false);
                    setRejectionReason('');
                    setItemToReject(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (itemToReject) {
                      handleVerification(itemToReject.type, itemToReject.id, 'reject');
                    }
                  }}
                  disabled={!rejectionReason.trim()}
                >
                  Confirmar Recusa
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}