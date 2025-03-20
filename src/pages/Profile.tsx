import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Settings, LogOut, Building2, Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
}

interface UserAgent {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price_type: string;
  category: string;
  is_premium: boolean;
  created_at: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejected_reason?: string;
  total_reviews: number;
  average_rating: number;
}

interface UserAgency {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website_url: string;
  location: string;
  specialties: string[];
  verification_status: 'pending' | 'approved' | 'rejected';
  rejected_reason?: string;
  total_clients: number;
  created_at: string;
}

interface UserReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  agent?: {
    id: string;
    name: string;
    image_url: string;
  };
  agency?: {
    id: string;
    name: string;
    logo_url: string;
  };
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-green-900/20 text-green-500';
    case 'rejected':
      return 'bg-red-900/20 text-red-500';
    default:
      return 'bg-yellow-900/20 text-yellow-500';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'approved':
      return 'Aprovado';
    case 'rejected':
      return 'Recusado';
    default:
      return 'Pendente';
  }
}

export function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [agents, setAgents] = useState<UserAgent[]>([]);
  const [agencies, setAgencies] = useState<UserAgency[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'agents' | 'agencies' | 'reviews'>('agents');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    async function fetchUserData() {
      try {
        // First, check if profile exists
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id);

        if (profileError) throw profileError;

        // If profile doesn't exist, create it
        if (!profiles || profiles.length === 0) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                username: user.email?.split('@')[0],
                full_name: user.user_metadata?.full_name || null,
                avatar_url: null,
                is_premium_user: false
              }
            ])
            .select();

          if (createError) throw createError;
          setProfile(newProfile[0]);
        } else {
          setProfile(profiles[0]);
        }

        // Fetch user's agents with reviews stats
        const { data: agentsData, error: agentsError } = await supabase
          .from('agents')
          .select(`
            *,
            reviews (
              rating
            )
          `)
          .eq('user_id', user.id);

        if (agentsError) throw agentsError;

        // Calculate average rating and total reviews for each agent
        const agentsWithStats = (agentsData || []).map((agent) => ({
          ...agent,
          total_reviews: agent.reviews?.length || 0,
          average_rating:
            agent.reviews && agent.reviews.length > 0
              ? agent.reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) /
                agent.reviews.length
              : 0,
        }));

        setAgents(agentsWithStats);

        // Fetch user's agencies
        const { data: agenciesData, error: agenciesError } = await supabase
          .from('agencies')
          .select('*')
          .eq('user_id', user.id);

        if (agenciesError) throw agenciesError;
        setAgencies(agenciesData || []);

        // Fetch user's reviews (both agent and agency reviews)
        const [agentReviews, agencyReviews] = await Promise.all([
          supabase
            .from('reviews')
            .select(`
              id,
              rating,
              comment,
              created_at,
              agent:agents (
                id,
                name,
                image_url
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          
          supabase
            .from('agency_reviews')
            .select(`
              id,
              rating,
              comment,
              created_at,
              agency:agencies (
                id,
                name,
                logo_url
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        ]);

        if (agentReviews.error) throw agentReviews.error;
        if (agencyReviews.error) throw agencyReviews.error;

        // Combine and sort reviews by date
        const allReviews = [
          ...(agentReviews.data || []),
          ...(agencyReviews.data || [])
        ].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setReviews(allReviews);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading profile data');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [user, navigate]);

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error signing out');
    }
  }

  async function handleDeleteAgent(agentId: string) {
    if (!confirm('Tem certeza que deseja excluir este agente?')) return;

    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;
      setAgents(agents.filter((agent) => agent.id !== agentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting agent');
    }
  }

  async function handleDeleteAgency(agencyId: string) {
    if (!confirm('Tem certeza que deseja excluir esta agência?')) return;

    try {
      const { error } = await supabase
        .from('agencies')
        .delete()
        .eq('id', agencyId);

      if (error) throw error;
      setAgencies(agencies.filter((agency) => agency.id !== agencyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting agency');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-32 bg-neutral rounded-xl mb-8"></div>
            <div className="h-64 bg-neutral rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-secondary text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {error && (
          <div className="bg-red-900/20 border border-red-900 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-neutral rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* <img
                src={profile.avatar_url || `https://source.unsplash.com/random/100x100?avatar`}
                alt={profile.username}
                className="w-20 h-20 rounded-full"
              /> */}
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-gray-400">@{profile.username}</p>
                <p className="text-gray-400 text-sm mt-2">
                  Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-neutral">
            <button
              className={`pb-4 px-2 text-lg font-medium ${
                activeTab === 'agents'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400'
              }`}
              onClick={() => setActiveTab('agents')}
            >
              Meus Agentes
            </button>
            <button
              className={`pb-4 px-2 text-lg font-medium ${
                activeTab === 'agencies'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400'
              }`}
              onClick={() => setActiveTab('agencies')}
            >
              Minhas Agências
            </button>
            <button
              className={`pb-4 px-2 text-lg font-medium ${
                activeTab === 'reviews'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              Minhas Avaliações
            </button>
          </div>
        </div>

        {/* Agents List */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Meus Agentes ({agents.length})</h2>
              <Button variant="primary" onClick={() => navigate('/submit')}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agente
              </Button>
            </div>
            
            {agents.length === 0 ? (
              <div className="text-center py-12 bg-neutral rounded-xl">
                <p className="text-gray-400 mb-4">
                  Você ainda não tem nenhum agente cadastrado
                </p>
                <Button variant="primary" onClick={() => navigate('/submit')}>
                  Cadastrar Agente
                </Button>
              </div>
            ) : (
              agents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-neutral rounded-xl overflow-hidden border border-neutral-dark"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <img
                          src={
                            agent.image_url ||
                            `https://source.unsplash.com/random/100x100?ai&sig=${agent.id}`
                          }
                          alt={agent.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
                          <p className="text-gray-400 mb-2">{agent.description}</p>
                          <div className="flex items-center gap-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${
                                agent.price_type === 'free'
                                  ? 'bg-green-900/20 text-green-500'
                                  : agent.price_type === 'paid'
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-blue-900/20 text-blue-500'
                              }`}
                            >
                              {agent.price_type === 'free'
                                ? 'Gratuito'
                                : agent.price_type === 'paid'
                                ? 'Pago'
                                : 'Freemium'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(agent.verification_status)}`}>
                              {getStatusText(agent.verification_status)}
                            </span>
                            <span className="text-gray-400">
                              {agent.total_reviews} avaliações
                            </span>
                            {agent.average_rating > 0 && (
                              <span className="text-gray-400">
                                {agent.average_rating.toFixed(1)} estrelas
                              </span>
                            )}
                          </div>
                          {agent.verification_status === 'rejected' && agent.rejected_reason && (
                            <p className="mt-2 text-red-500 text-sm">
                              Motivo da recusa: {agent.rejected_reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/agents/${agent.id}/edit`)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteAgent(agent.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Agencies List */}
        {activeTab === 'agencies' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Minhas Agências ({agencies.length})</h2>
              <Button variant="primary" onClick={() => navigate('/submit-agency')}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Agência
              </Button>
            </div>

            {agencies.length === 0 ? (
              <div className="text-center py-12 bg-neutral rounded-xl">
                <p className="text-gray-400 mb-4">
                  Você ainda não tem nenhuma agência cadastrada
                </p>
                <Button variant="primary" onClick={() => navigate('/submit-agency')}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Cadastrar Agência
                </Button>
              </div>
            ) : (
              agencies.map((agency) => (
                <div
                  key={agency.id}
                  className="bg-neutral rounded-xl overflow-hidden border border-neutral-dark"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 flex items-center justify-center flex-shrink-0">
                          <img
                            src={
                              agency.logo_url ||
                              `https://source.unsplash.com/random/400x400?company&sig=${agency.id}`
                            }
                            alt={agency.name}
                            className="w-auto h-auto max-w-[90%] max-h-[90%] object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold mb-2">{agency.name}</h3>
                          <p className="text-gray-400 mb-2">{agency.description}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400">{agency.location}</span>
                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(agency.verification_status)}`}>
                              {getStatusText(agency.verification_status)}
                            </span>
                            <span className="text-gray-400">
                              {agency.total_clients} clientes
                            </span>
                          </div>
                          {agency.verification_status === 'rejected' && agency.rejected_reason && (
                            <p className="mt-2 text-red-500 text-sm">
                              Motivo da recusa: {agency.rejected_reason}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
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
                          onClick={() => navigate(`/agencies/${agency.id}/edit`)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteAgency(agency.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reviews List */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  Você ainda não fez nenhuma avaliação
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-neutral rounded-xl overflow-hidden border border-neutral-dark p-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        review.agent?.image_url ||
                        review.agency?.logo_url ||
                        `https://source.unsplash.com/random/100x100?${review.agent ? 'ai' : 'company'}&sig=${review.id}`
                      }
                      alt={review.agent?.name || review.agency?.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium mb-1">
                            {review.agent?.name || review.agency?.name}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-primary fill-current'
                                      : 'text-gray-400'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-400">
                              {new Date(review.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-gray-400">{review.comment}</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            navigate(
                              review.agent
                                ? `/agents/${review.agent.id}`
                                : `/agencies/${review.agency?.id}`
                            )
                          }
                        >
                          Ver {review.agent ? 'Agente' : 'Agência'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}