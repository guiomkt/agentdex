import { useState, useEffect } from 'react';
import { Search, Trophy, TrendingUp, Star, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Agent {
  id: string;
  name: string;
  description: string;
  cover_url: string;
  image_url: string;
  website_url: string;
  price_type: string;
  starting_price: number | null;
  category: string;
  is_premium: boolean;
  created_at: string;
  profiles: {
    username: string;
  };
  average_rating?: number;
  total_reviews?: number;
}

const filters = {
  period: [
    { id: 'week', name: 'Esta Semana' },
    { id: 'month', name: 'Este Mês' },
    { id: 'year', name: 'Este Ano' },
    { id: 'all', name: 'Todo Período' }
  ],
  category: [
    { id: 'automation', name: 'Automação', icon: '🤖' },
    { id: 'chatbots', name: 'Chatbots', icon: '💬' },
    { id: 'data_analysis', name: 'Análise de Dados', icon: '📊' },
    { id: 'content_creation', name: 'Criação de Conteúdo', icon: '✍️' },
    { id: 'research', name: 'Pesquisa', icon: '🔍' },
    { id: 'productivity', name: 'Produtividade', icon: '⚡' }
  ]
};

function formatPrice(price: number | null): string {
  if (price === null) return 'Gratuito';
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

export function Ranking() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    period: 'month',
    categories: [] as string[]
  });

  useEffect(() => {
    async function fetchAgents() {
      try {
        const { data: agentsData, error: agentsError } = await supabase
          .from('agents')
          .select(`
            *,
            profiles (
              username
            ),
            reviews (
              rating
            )
          `);

        if (agentsError) throw agentsError;

        // Calculate average rating and total reviews for each agent
        const agentsWithStats = (agentsData || []).map((agent) => ({
          ...agent,
          average_rating:
            agent.reviews && agent.reviews.length > 0
              ? agent.reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) /
                agent.reviews.length
              : null,
          total_reviews: agent.reviews?.length || 0,
        }));

        // Sort by rating and number of reviews
        const sortedAgents = agentsWithStats.sort((a, b) => {
          if (a.average_rating === b.average_rating) {
            return (b.total_reviews || 0) - (a.total_reviews || 0);
          }
          return (b.average_rating || 0) - (a.average_rating || 0);
        });

        setAgents(sortedAgents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar agentes');
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(agent => {
    if (activeFilters.categories.length === 0) return true;
    return activeFilters.categories.includes(agent.category.toLowerCase());
  });

  const hasActiveFilters = activeFilters.categories.length > 0;

  function clearFilters() {
    setActiveFilters({
      period: 'month',
      categories: []
    });
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

  if (error) {
    return (
      <div className="min-h-screen bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar ranking</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ranking de Agentes</h1>
            <p className="text-gray-400">Os agentes mais populares e bem avaliados da plataforma</p>
          </div>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-2 bg-primary/20 px-2 py-0.5 rounded-full text-xs">
                  {activeFilters.categories.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-neutral rounded-xl p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-lg font-semibold">Filtros</h2>
              {hasActiveFilters && (
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Time Period */}
              <div>
                <h3 className="text-sm font-medium mb-3">Período</h3>
                <div className="space-y-2">
                  {filters.period.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => {
                        setActiveFilters((prev) => ({
                          ...prev,
                          period: period.id
                        }));
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        activeFilters.period === period.id
                          ? 'bg-primary text-white'
                          : 'bg-neutral-dark hover:bg-neutral-dark/80 text-gray-400'
                      }`}
                    >
                      <span>{period.name}</span>
                      {activeFilters.period === period.id && (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium mb-3">Categorias</h3>
                <div className="grid grid-cols-2 gap-2">
                  {filters.category.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveFilters((prev) => ({
                          ...prev,
                          categories: prev.categories.includes(category.id)
                            ? prev.categories.filter((id) => id !== category.id)
                            : [...prev.categories, category.id]
                        }));
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        activeFilters.categories.includes(category.id)
                          ? 'bg-primary text-white'
                          : 'bg-neutral-dark hover:bg-neutral-dark/80 text-gray-400'
                      }`}
                    >
                      <span className="text-xl">{category.icon}</span>
                      <span className="text-sm truncate">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ranking List */}
        <div className="space-y-4">
          {filteredAgents.map((agent, i) => (
            <div
              key={agent.id}
              className="bg-neutral rounded-xl overflow-hidden border border-neutral-dark hover:border-primary transition-colors"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0 ${
                    i < 3 ? 'bg-primary/10' : 'bg-neutral-dark'
                  }`}>
                    <Trophy className={`h-6 w-6 ${i < 3 ? 'text-primary' : 'text-gray-400'}`} />
                  </div>
                  <img
                    src={agent.image_url || `https://source.unsplash.com/random/800x600?ai&sig=${agent.id}`}
                    alt={agent.name}
                    className="w-full hidden sm:block sm:w-24 h-32 sm:h-24 rounded-lg object-cover"
                  />
                  <img
                    src={agent.cover_url || `https://source.unsplash.com/random/800x600?ai&sig=${agent.id}`}
                    alt={agent.name}
                    className="w-full block sm:hidden sm:w-24 h-32 sm:h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
                        <p className="text-gray-400 mb-2">por {agent.profiles.username}</p>
                        <p className="text-gray-400 line-clamp-2">{agent.description}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-4">
                          <span className="text-gray-400">{agent.category}</span>
                          {agent.average_rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-primary fill-current" />
                              <span>{agent.average_rating.toFixed(1)}</span>
                              <span className="text-gray-400">
                                ({agent.total_reviews})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
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
                          <span className="text-lg font-semibold text-primary">
                            A partir de {formatPrice(agent.starting_price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
                      <Link to={`/agents/${agent.id}`} className="flex-1 sm:flex-none">
                        <Button variant="secondary" className="w-full">
                          Ver Detalhes
                        </Button>
                      </Link>
                      <Button
                        variant="primary"
                        className="flex-1 sm:flex-none"
                        onClick={() => window.open(agent.website_url, '_blank')}
                      >
                        Acessar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}