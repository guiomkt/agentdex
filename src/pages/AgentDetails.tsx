import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ExternalLink, MessageSquare, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { SEO } from '@/components/SEO';
import { generateAgentMetadata } from '@/lib/seo';

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
    avatar_url: string;
  };
}

function formatPrice(price: number | null): string {
  if (price === null) return 'Gratuito';
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function AgentDetails() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    async function fetchAgent() {
      try {
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select(`
            *,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (agentError) throw agentError;
        
        if (!agentData) {
          setError('Agente não encontrado');
          setLoading(false);
          return;
        }

        setAgent(agentData);

        const { data: stats, error: statsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('agent_id', id);

        if (statsError) throw statsError;

        if (stats && stats.length > 0) {
          const avg = stats.reduce((acc, curr) => acc + curr.rating, 0) / stats.length;
          setAverageRating(Number(avg.toFixed(1)));
          setTotalReviews(stats.length);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar o agente');
      } finally {
        setLoading(false);
      }
    }

    fetchAgent();
  }, [id]);

  function handleReviewSuccess() {
    setShowReviewForm(false);
    window.location.reload();
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: agent?.name,
          text: agent?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-neutral rounded w-2/3 mb-8"></div>
            <div className="h-64 bg-neutral rounded mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-secondary text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || 'Agente não encontrado'}
          </h1>
          <p className="text-gray-400 mb-8">
            Não foi possível encontrar o agente solicitado.
          </p>
          <Link to="/marketplace">
            <Button variant="primary">Voltar ao Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary text-white py-12">
      {agent && <SEO {...generateAgentMetadata(agent)} />}
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/marketplace">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-neutral rounded-xl overflow-hidden">
          {/* Cover Image */}
          <div className="relative">
            <img
              src={agent.cover_url || `https://source.unsplash.com/random/1200x400?ai&sig=${agent.id}`}
              alt={`${agent.name} cover`}
              className="w-full h-48 sm:h-64 object-cover"
            />
            
            {/* Desktop Logo and Info Overlay */}
            <div className="hidden md:block absolute left-0 right-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <div className="flex items-end gap-6">
                {/* Logo */}
                <div className="w-24 h-24 bg-black rounded-xl border-4 border-neutral overflow-hidden">
                  <img
                    src={agent.image_url || `https://source.unsplash.com/random/400x400?ai&sig=${agent.id}`}
                    alt={agent.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2 text-white">{agent.name}</h1>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-primary mr-1" />
                      <span className="text-white">{averageRating ?? '---'}</span>
                      <span className="text-gray-300 ml-1">({totalReviews} avaliações)</span>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      agent.price_type === 'free' ? 'bg-green-900/20 text-green-500' :
                      agent.price_type === 'paid' ? 'bg-primary/20 text-primary' :
                      'bg-blue-900/20 text-blue-500'
                    }`}>
                      {agent.price_type === 'free' ? 'Gratuito' :
                       agent.price_type === 'paid' ? 'Pago' : 'Freemium'}
                    </span>
                    
                    {agent.starting_price !== null && (
                      <span className="text-lg font-semibold text-primary">
                        A partir de {formatPrice(agent.starting_price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Info */}
          <div className="md:hidden p-6">
            <h1 className="text-2xl font-bold mb-4">{agent.name}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-primary mr-1" />
                <span>{averageRating ?? '---'}</span>
                <span className="text-gray-300 ml-1">({totalReviews} avaliações)</span>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-sm ${
                agent.price_type === 'free' ? 'bg-green-900/20 text-green-500' :
                agent.price_type === 'paid' ? 'bg-primary/20 text-primary' :
                'bg-blue-900/20 text-blue-500'
              }`}>
                {agent.price_type === 'free' ? 'Gratuito' :
                 agent.price_type === 'paid' ? 'Pago' : 'Freemium'}
              </span>
              
              {agent.starting_price !== null && (
                <span className="text-lg font-semibold text-primary">
                  A partir de {formatPrice(agent.starting_price)}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.open(agent.website_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Acessar Agente
              </Button>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:block p-6">
            <div className="flex flex-wrap gap-2 mb-8">
              <Button variant="secondary" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.open(agent.website_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Acessar Agente
              </Button>
            </div>

            {/* Description */}
            <div className="border-t border-neutral-dark pt-6">
              <h2 className="text-xl font-semibold mb-4">Sobre</h2>
              <p className="text-gray-400 whitespace-pre-wrap">{agent.description}</p>
            </div>
          </div>

          {/* Mobile Description */}
          <div className="md:hidden px-6 pb-6">
            <div className="border-t border-neutral-dark pt-6">
              <h2 className="text-xl font-semibold mb-4">Sobre</h2>
              <p className="text-gray-400 whitespace-pre-wrap">{agent.description}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Reviews Section */}
            <div className="bg-neutral rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Avaliações</h2>
                {user && !showReviewForm && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowReviewForm(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Avaliar
                  </Button>
                )}
              </div>

              {showReviewForm ? (
                <div className="mb-8">
                  <ReviewForm
                    agentId={agent.id}
                    onSuccess={handleReviewSuccess}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              ) : null}

              <ReviewList agentId={agent.id} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-neutral rounded-xl p-4 sm:p-6">
              <h3 className="font-semibold mb-4">Informações</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Categoria</span>
                  <span>{agent.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Criado por</span>
                  <span>{agent.profiles?.username || 'Anônimo'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Adicionado em</span>
                  <span>
                    {new Date(agent.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}