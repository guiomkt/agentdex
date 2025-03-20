import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface Agent {
  id: string;
  name: string;
  description: string;
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
  average_rating: number;
  total_reviews: number;
}

function formatPrice(price: number | null): string {
  if (price === null) return 'Gratuito';
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function Compare() {
  const { ids } = useParams();
  const agentIds = ids?.split(',') || [];
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const { data, error } = await supabase
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
          .in('id', agentIds);

        if (error) throw error;

        // Calculate average rating and total reviews for each agent
        const agentsWithStats = (data || []).map((agent) => ({
          ...agent,
          average_rating:
            agent.reviews && agent.reviews.length > 0
              ? agent.reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) /
                agent.reviews.length
              : 0,
          total_reviews: agent.reviews?.length || 0,
        }));

        setAgents(agentsWithStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading agents');
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();
  }, [ids]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-96 bg-neutral rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || agents.length === 0) {
    return (
      <div className="min-h-screen bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || 'Nenhum agente encontrado para comparação'}
          </h1>
          <Link to="/marketplace">
            <Button variant="primary">Voltar ao Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/marketplace">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Comparação de Agentes</h1>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-neutral rounded-xl overflow-hidden border border-neutral-dark"
            >
              <img
                src={
                  agent.image_url ||
                  `https://source.unsplash.com/random/400x400?ai&sig=${agent.id}`
                }
                alt={agent.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{agent.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-4 w-4 text-primary" />
                  <span>
                    {agent.average_rating.toFixed(1)} ({agent.total_reviews}{' '}
                    avaliações)
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">
                      Descrição
                    </h3>
                    <p className="text-sm">{agent.description}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">
                      Categoria
                    </h3>
                    <p className="text-sm">{agent.category}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">
                      Preço
                    </h3>
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm w-fit ${
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

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">
                      Criado por
                    </h3>
                    <p className="text-sm">{agent.profiles?.username}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => window.open(agent.website_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar
                  </Button>
                  <Link to={`/agents/${agent.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}