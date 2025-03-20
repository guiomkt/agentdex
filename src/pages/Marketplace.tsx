import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CompareButton } from '@/components/comparison/CompareButton';
import { supabase } from '@/lib/supabase';

interface Agent {
  id: string;
  name: string;
  description: string;
  image_url: string;
  cover_url: string;
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

const categories = [
  { id: 'automation', name: 'Automação', icon: '🤖' },
  { id: 'chatbots', name: 'Chatbots', icon: '💬' },
  { id: 'data_analysis', name: 'Análise de Dados', icon: '📊' },
  { id: 'content_creation', name: 'Criação de Conteúdo', icon: '✍️' },
  { id: 'research', name: 'Pesquisa', icon: '🔍' },
  { id: 'productivity', name: 'Produtividade', icon: '⚡' },
  { id: 'dev_tools', name: 'Ferramentas para Devs', icon: '🛠️' },
  { id: 'machine_learning', name: 'Machine Learning', icon: '🧠' },
];

const priceTypes = [
  { id: 'free', name: 'Gratuito', color: 'bg-green-900/20 text-green-500' },
  { id: 'paid', name: 'Pago', color: 'bg-primary/20 text-primary' },
  { id: 'freemium', name: 'Freemium', color: 'bg-blue-900/20 text-blue-500' },
];

const ratingOptions = [
  { value: 4.5, label: '4.5+', stars: 5 },
  { value: 4.0, label: '4.0+', stars: 4 },
  { value: 3.5, label: '3.5+', stars: 3 },
];

function formatPrice(price: number | null): string {
  if (price === null) return 'Gratuito';
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function Marketplace() {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const searchFromUrl = searchParams.get('search');

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categories: categoryFromUrl ? [categoryFromUrl] : [] as string[],
    priceTypes: [] as string[],
    minRating: null as number | null,
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
          `)
          .eq('verification_status', 'approved');

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

        setAgents(agentsWithStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar agentes');
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();
  }, []);

  useEffect(() => {
    // Update filters when category changes in URL
    if (categoryFromUrl) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryFromUrl]
      }));
    }
    
    // Update search query when it changes in URL
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [categoryFromUrl, searchFromUrl]);

  const filteredAgents = agents.filter((agent) => {
    // Text search
    const matchesSearch =
      !searchQuery ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categories.find(c => c.id === agent.category)?.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      filters.categories.length === 0 || filters.categories.includes(agent.category);

    // Price type filter
    const matchesPriceType =
      filters.priceTypes.length === 0 || filters.priceTypes.includes(agent.price_type);

    // Rating filter
    const matchesRating =
      !filters.minRating ||
      (agent.average_rating && agent.average_rating >= filters.minRating);

    return matchesSearch && matchesCategory && matchesPriceType && matchesRating;
  });

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceTypes.length > 0 ||
    filters.minRating !== null;

  function clearFilters() {
    setFilters({
      categories: [],
      priceTypes: [],
      minRating: null,
    });
    setSearchQuery('');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar agentes</h1>
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
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Buscar agentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-neutral rounded-lg pl-4 pr-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
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
                  {filters.categories.length +
                    filters.priceTypes.length +
                    (filters.minRating ? 1 : 0)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium mb-3">Categorias</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          categories: prev.categories.includes(category.id)
                            ? prev.categories.filter((id) => id !== category.id)
                            : [...prev.categories, category.id],
                        }));
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        filters.categories.includes(category.id)
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

              {/* Price Types */}
              <div>
                <h3 className="text-sm font-medium mb-3">Tipo de Preço</h3>
                <div className="space-y-2">
                  {priceTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          priceTypes: prev.priceTypes.includes(type.id)
                            ? prev.priceTypes.filter((id) => id !== type.id)
                            : [...prev.priceTypes, type.id],
                        }));
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        filters.priceTypes.includes(type.id)
                          ? type.color
                          : 'bg-neutral-dark hover:bg-neutral-dark/80 text-gray-400'
                      }`}
                    >
                      <span>{type.name}</span>
                      {filters.priceTypes.includes(type.id) && (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-sm font-medium mb-3">Avaliação Mínima</h3>
                <div className="space-y-2">
                  {ratingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          minRating:
                            prev.minRating === option.value ? null : option.value,
                        }));
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        filters.minRating === option.value
                          ? 'bg-primary text-white'
                          : 'bg-neutral-dark hover:bg-neutral-dark/80 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: option.stars }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                filters.minRating === option.value
                                  ? 'text-white fill-current'
                                  : 'text-primary fill-current'
                              }`}
                            />
                          ))}
                        </div>
                        <span>{option.label}</span>
                      </div>
                      {filters.minRating === option.value && (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Agentes */}
        <div className="space-y-6">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Nenhum agente encontrado</p>
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-neutral rounded-xl overflow-hidden border border-neutral-dark hover:border-primary transition-colors"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Show cover on mobile, logo on desktop */}
                    <div className="block sm:hidden w-full h-32 rounded-lg overflow-hidden">
                      <img
                        src={agent.cover_url || agent.image_url || `https://source.unsplash.com/random/800x400?ai&sig=${agent.id}`}
                        alt={agent.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="hidden sm:block w-24 h-24 flex-shrink-0">
                      <img
                        src={agent.image_url || `https://source.unsplash.com/random/400x400?ai&sig=${agent.id}`}
                        alt={agent.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
                          <p className="text-gray-400 mb-2 capitalize">Por {agent.profiles.username}</p>
                          <p className="text-sm md:text-base text-gray-400 line-clamp-2">{agent.description}</p>
                          {/* <p className="text-gray-400 line-clamp-2 hidden md:block">{agent.description}</p> */}
                          <div className="hidden md:block flex flex-wrap items-center gap-4 mt-4">
                            <span className="text-gray-400">{categories.find(c => c.id === agent.category)?.name}</span>
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
                        <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                          <span
                            className={`hidden md:block px-3 py-1 rounded-full text-sm ${
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
                          {agent.starting_price !== null && (
                            <span className="text-lg font-semibold text-primary">
                              A partir de {formatPrice(agent.starting_price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 md:gap-3 mt-4">
                        <CompareButton agentId={agent.id} />
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
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Acessar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}