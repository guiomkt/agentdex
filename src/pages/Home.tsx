import { useState, useEffect, useRef } from 'react';
import { Search, Zap, Bot, Database, Pencil, Search as SearchIcon, BarChart, Code, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { SEO } from '@/components/SEO';
import { defaultMetadata } from '@/lib/seo';

const categories = [
  { id: 'automation', name: 'Automação', icon: Zap },
  { id: 'chatbots', name: 'Chatbots', icon: Bot },
  { id: 'data_analysis', name: 'Análise de Dados', icon: Database },
  { id: 'content_creation', name: 'Criação de Conteúdo', icon: Pencil },
  { id: 'research', name: 'Pesquisa', icon: SearchIcon },
  { id: 'productivity', name: 'Produtividade', icon: BarChart },
  { id: 'dev_tools', name: 'Ferramentas para Devs', icon: Code },
  { id: 'machine_learning', name: 'Machine Learning', icon: Database },
];

interface FeaturedAgent {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  price_type: string;
  starting_price: number | null;
  category: string;
  premium: boolean;
  rating: number;
  reviews_count: number;
}

interface SearchSuggestion {
  type: 'agent' | 'category';
  id: string;
  name: string;
  icon?: typeof Zap;
}

function formatPrice(price: number | null): string {
  if (price === null) return 'Gratuito';
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function Home() {
  const navigate = useNavigate();
  const [featuredAgents, setFeaturedAgents] = useState<FeaturedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // Fetch all agents for suggestions
    async function fetchAgents() {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('id, name')
          .eq('verification_status', 'approved');

        if (error) throw error;
        setAgents(data || []);
      } catch (err) {
        console.error('Error fetching agents:', err);
      }
    }

    fetchAgents();
  }, []);

  useEffect(() => {
    async function fetchFeaturedAgents() {
      try {
        const { data: agents, error } = await supabase
          .from('agents')
          .select(`
            id,
            name,
            description,
            image_url,
            price_type,
            starting_price,
            category,
            is_premium,
            reviews (rating)
          `)
          .eq('verification_status', 'approved')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;

        const processedAgents = (agents || []).map(agent => ({
          ...agent,
          premium: agent.is_premium,
          rating: agent.reviews?.length 
            ? agent.reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / agent.reviews.length 
            : 0,
          reviews_count: agent.reviews?.length || 0
        }));

        setFeaturedAgents(processedAgents);
      } catch (err) {
        console.error('Error fetching featured agents:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedAgents();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const matchedSuggestions: SearchSuggestion[] = [];

    // Add matching categories
    categories.forEach(category => {
      if (category.name.toLowerCase().includes(query)) {
        matchedSuggestions.push({
          type: 'category',
          id: category.id,
          name: category.name,
          icon: category.icon
        });
      }
    });

    // Add matching agents
    agents.forEach(agent => {
      if (agent.name.toLowerCase().includes(query)) {
        matchedSuggestions.push({
          type: 'agent',
          id: agent.id,
          name: agent.name
        });
      }
    });

    setSuggestions(matchedSuggestions.slice(0, 5)); // Limit to 5 suggestions
  }, [searchQuery, agents]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Check if the search query matches any category name
      const matchedCategory = categories.find(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (matchedCategory) {
        navigate(`/marketplace?category=${matchedCategory.id}&search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  }

  function handleSuggestionClick(suggestion: SearchSuggestion) {
    if (suggestion.type === 'category') {
      navigate(`/marketplace?category=${suggestion.id}`);
    } else {
      navigate(`/agents/${suggestion.id}`);
    }
    setShowSuggestions(false);
  }

  function handleCategoryClick(categoryId: string) {
    navigate(`/marketplace?category=${categoryId}`);
  }

  return (
    <div className="min-h-screen bg-secondary text-white">
      <SEO 
        title={defaultMetadata.title}
        description={defaultMetadata.description}
        image={defaultMetadata.image}
        url={defaultMetadata.url}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: defaultMetadata.siteName,
          description: defaultMetadata.description,
          url: defaultMetadata.url,
        }}
      />
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold mb-6">
              Descubra os Melhores{' '}
              <span className="text-primary">Agentes de IA</span>
            </h1>
            <p className="text-sm md:text-xl lg:text-2xl mb-8 text-gray-400">
              Seu diretório completo para encontrar, comparar e implementar agentes de
              IA para otimizar seu fluxo de trabalho.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Buscar agentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-neutral rounded-lg pl-6 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  size="sm"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </form>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute w-full mt-2 bg-neutral rounded-lg shadow-lg border border-neutral-dark overflow-hidden z-50">
                  {suggestions.map((suggestion) => {
                    const Icon = suggestion.type === 'category' && suggestion.icon;
                    return (
                      <button
                        key={`${suggestion.type}-${suggestion.id}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-dark flex items-center gap-3"
                      >
                        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
                        <div>
                          <span className="text-white">{suggestion.name}</span>
                          <span className="text-gray-400 text-sm ml-2">
                            {suggestion.type === 'category' ? 'Categoria' : 'Agente'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link to="/marketplace">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Explorar Marketplace
                </Button>
              </Link>
              <Link to="/submit">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Enviar Seu Agente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Navegue por Categoria
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="bg-neutral rounded-xl p-4 md:p-6 hover:border-2 hover:border-primary transition-all cursor-pointer group text-left"
                >
                  <Icon className="h-6 w-6 md:h-8 md:w-8 text-gray-400 group-hover:text-primary mb-4" />
                  <h3 className="text-base md:text-lg font-medium">{category.name}</h3>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Agents Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Agentes em Destaque
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-neutral rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : featuredAgents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Nenhum agente em destaque no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {featuredAgents.map((agent) => (
                <Link
                  key={agent.id}
                  to={`/agents/${agent.id}`}
                  className="block bg-neutral rounded-xl p-4 hover:bg-neutral-dark transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <img
                      src={agent.image_url || `https://source.unsplash.com/random/100x100?logo&sig=${agent.id}`}
                      alt={agent.name}
                      className="w-full sm:w-16 h-32 sm:h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
                          <p className="text-sm md:text-base text-gray-400 line-clamp-2 md:max-w-3xl">{agent.description}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleCategoryClick(agent.category);
                              }}
                              className="text-gray-400 hover:text-primary"
                            >
                              {categories.find(c => c.id === agent.category)?.name}
                            </button>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-primary fill-current" />
                              <span>{agent.rating.toFixed(1)}</span>
                              <span className="text-gray-400">
                                ({agent.reviews_count} avaliações)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            agent.price_type === 'free' ? 'bg-green-900/20 text-green-500' :
                            agent.price_type === 'paid' ? 'bg-primary/20 text-primary' :
                            'bg-blue-900/20 text-blue-500'
                          }`}>
                            {agent.price_type === 'free' ? 'Gratuito' :
                             agent.price_type === 'paid' ? 'Pago' : 'Freemium'}
                          </span>
                          {agent.starting_price !== null && (
                            <span className="text-lg font-semibold text-primary md:w-full">
                              A partir de {formatPrice(agent.starting_price)}
                            </span>
                          )}
                          <span className="bg-neutral-dark px-3 py-1 rounded-full text-sm text-gray-400">
                            {agent.premium ? 'Premium' : 'Standard'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-neutral py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Tem um agente de IA?
          </h2>
          <p className="text-base md:text-xl mb-8 text-gray-400">
            Adicione seu agente ao maior diretório de IA do Brasil
          </p>
          <Link to="/submit">
            <Button
              variant="primary"
              size="lg"
              className="font-semibold w-full sm:w-auto"
            >
              Submeter Agente
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}