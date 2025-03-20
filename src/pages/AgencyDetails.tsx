import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Users, Globe, Calendar, Verified, ArrowLeft, Mail, Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AgencyReviewForm } from '@/components/reviews/AgencyReviewForm';
import { AgencyReviewList } from '@/components/reviews/AgencyReviewList';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { SEO } from '@/components/SEO';
import { generateAgencyMetadata } from '@/lib/seo';

interface Agency {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  cover_url: string;
  website_url: string;
  location: string;
  specialties: string[];
  verification_status: 'pending' | 'approved' | 'rejected';
  total_clients: number;
  created_at: string;
}

export function AgencyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    // Redirect if no ID is provided
    if (!id) {
      navigate('/agencies');
      return;
    }

    async function fetchAgency() {
      try {
        const { data, error } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          setError('Agência não encontrada');
          return;
        }

        // Only allow viewing if agency is approved or if user is the owner
        if (data.verification_status !== 'approved' && (!user || user.id !== data.user_id)) {
          setError('Esta agência não está disponível para visualização');
          return;
        }

        setAgency(data);

        // Fetch reviews stats
        const { data: stats, error: statsError } = await supabase
          .from('agency_reviews')
          .select('rating')
          .eq('agency_id', id);

        if (statsError) throw statsError;

        if (stats && stats.length > 0) {
          const avg = stats.reduce((acc, curr) => acc + curr.rating, 0) / stats.length;
          setAverageRating(Number(avg.toFixed(1)));
          setTotalReviews(stats.length);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar agência');
      } finally {
        setLoading(false);
      }
    }

    fetchAgency();
  }, [id, navigate, user]);

  function handleReviewSuccess() {
    setShowReviewForm(false);
    // Refresh the agency data to update ratings
    window.location.reload();
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

  if (error || !agency) {
    return (
      <div className="min-h-screen bg-secondary text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || 'Agência não encontrada'}
          </h1>
          <p className="text-gray-400 mb-8">
            Não foi possível encontrar a agência solicitada.
          </p>
          <Link to="/agencies">
            <Button variant="primary">Voltar para Agências</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary text-white py-12">
      {agency && <SEO {...generateAgencyMetadata(agency)} />}
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/agencies">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Agency Profile */}
        <div className="bg-neutral rounded-xl overflow-hidden">
          {/* Cover Image */}
          <div className="h-40 md:h-48 overflow-hidden">
            <img
              src={agency.cover_url || agency.logo_url || `https://source.unsplash.com/random/1200x400?company&sig=${agency.id}`}
              alt={`${agency.name} cover`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8">
            {/* Basic Info */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                <img
                  src={agency.logo_url || `https://source.unsplash.com/random/400x400?company&sig=${agency.id}`}
                  alt={agency.name}
                  className="hidden md:block w-24 h-24 rounded-xl object-contain -mt-16 border-4 border-neutral"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold">{agency.name}</h1>
                    {agency.verification_status === 'approved' && (
                      <Verified className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-column md:flex items-center gap-4 mt-2 text-gray-400">
                    <div className="text-sm md:text-base flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{agency.location}</span>
                    </div>
                    <div className="text-sm md:text-base flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{agency.total_clients}+ clientes</span>
                    </div>
                    {averageRating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-primary fill-current" />
                        <span>{averageRating}</span>
                        <span className="text-gray-400">({totalReviews})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button
                  variant="secondary"
                  className="flex-1 md:flex-none"
                  onClick={() => window.open(`mailto:contato@${agency.website_url.split('//')[1]}`)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contato
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 md:flex-none"
                  onClick={() => window.open(agency.website_url, '_blank')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Sobre</h2>
              <p className="text-xs md:text-base text-gray-400">{agency.description}</p>
            </div>

            {/* Specialties */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Especialidades</h2>
              <div className="flex flex-wrap gap-2">
                {agency.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-neutral-dark px-4 py-2 rounded-lg text-xs md:text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-8 pt-8 border-t border-neutral-dark">
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
                  <AgencyReviewForm
                    agencyId={agency.id}
                    onSuccess={handleReviewSuccess}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              ) : null}

              <AgencyReviewList agencyId={agency.id} />
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-neutral-dark">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  Membro desde{' '}
                  {new Date(agency.created_at).toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}