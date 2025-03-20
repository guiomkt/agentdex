import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Users, ArrowRight, Verified, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

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

const specialties = [
  { id: 'assistentes_virtuais', name: 'Assistentes Virtuais', icon: '🤖' },
  { id: 'atendimento', name: 'Atendimento ao Cliente', icon: '💬' },
  { id: 'automacao', name: 'Automação de Tarefas', icon: '⚡' },
  { id: 'conteudo', name: 'Criação de Conteúdo', icon: '✍️' },
  { id: 'dados', name: 'Análise de Dados', icon: '📊' },
  { id: 'traducao', name: 'Tradução e Idiomas', icon: '🌎' },
  { id: 'imagens', name: 'Edição de Imagens', icon: '🖼️' },
  { id: 'audio', name: 'Transcrição de Áudio', icon: '🎙️' },
  { id: 'pesquisa', name: 'Pesquisa e Relatórios', icon: '📑' },
  { id: 'suporte', name: 'Suporte Empresarial', icon: '🏢' },
  { id: 'marketing', name: 'Marketing Digital', icon: '📱' },
  { id: 'educacao', name: 'Educação e Treinamento', icon: '📚' },
];

const clientRanges = [
  { min: 100, label: '100+ clientes' },
  { min: 50, label: '50+ clientes' },
  { min: 20, label: '20+ clientes' },
];

export function Agencies() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialties: [] as string[],
    minClients: null as number | null,
    verifiedOnly: false,
  });

  useEffect(() => {
    async function fetchAgencies() {
      try {
        const { data, error } = await supabase
          .from('agencies')
          .select('*')
          .eq('verification_status', 'approved')
          .order('total_clients', { ascending: false });

        if (error) throw error;
        setAgencies(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar agências');
      } finally {
        setLoading(false);
      }
    }

    fetchAgencies();
  }, []);

  const filteredAgencies = agencies.filter((agency) => {
    // Text search
    const matchesSearch =
      agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.specialties.some((specialty) =>
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Specialties filter
    const matchesSpecialties =
      filters.specialties.length === 0 ||
      filters.specialties.some((specialty) =>
        agency.specialties.includes(specialty)
      );

    // Minimum clients filter
    const matchesClients =
      !filters.minClients || agency.total_clients >= filters.minClients;

    // Verified filter
    const matchesVerified = !filters.verifiedOnly || agency.verification_status === 'approved';

    return matchesSearch && matchesSpecialties && matchesClients && matchesVerified;
  });

  const hasActiveFilters =
    filters.specialties.length > 0 ||
    filters.minClients !== null ||
    filters.verifiedOnly;

  function clearFilters() {
    setFilters({
      specialties: [],
      minClients: null,
      verifiedOnly: false,
    });
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
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar agências</h1>
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
            <h1 className="text-3xl font-bold mb-2">Agências</h1>
            <p className="text-gray-400">
              Encontre as melhores agências especializadas em IA
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Buscar por nome, local ou especialidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 bg-neutral rounded-lg pl-4 pr-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
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
                  {filters.specialties.length +
                    (filters.minClients ? 1 : 0) +
                    (filters.verifiedOnly ? 1 : 0)}
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
              {/* Specialties */}
              <div className="lg:col-span-2">
                <h3 className="text-sm font-medium mb-3">Especialidades</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specialties.map((specialty) => (
                    <button
                      key={specialty.id}
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          specialties: prev.specialties.includes(specialty.id)
                            ? prev.specialties.filter((id) => id !== specialty.id)
                            : [...prev.specialties, specialty.id],
                        }));
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        filters.specialties.includes(specialty.id)
                          ? 'bg-primary text-white'
                          : 'bg-neutral-dark hover:bg-neutral-dark/80 text-gray-400'
                      }`}
                    >
                      <span className="text-xl">{specialty.icon}</span>
                      <span className="text-sm truncate">{specialty.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div>
                <h3 className="text-sm font-medium mb-3">Outros Filtros</h3>
                <div className="space-y-2">
                  {/* Client Range */}
                  {clientRanges.map((range) => (
                    <button
                      key={range.min}
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          minClients:
                            prev.minClients === range.min ? null : range.min,
                        }));
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        filters.minClients === range.min
                          ? 'bg-primary text-white'
                          : 'bg-neutral-dark hover:bg-neutral-dark/80 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{range.label}</span>
                      </div>
                      {filters.minClients === range.min && (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  ))}

                  {/* Verified Only */}
                  <button
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        verifiedOnly: !prev.verifiedOnly,
                      }));
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      filters.verifiedOnly
                        ? 'bg-primary text-white'
                        : 'bg-neutral-dark hover:bg-neutral-dark/80 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Verified className="h-4 w-4" />
                      <span>Apenas Verificadas</span>
                    </div>
                    {filters.verifiedOnly && <X className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Agências */}
        <div className="space-y-4">
          {filteredAgencies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Nenhuma agência encontrada</p>
            </div>
          ) : (
            filteredAgencies.map((agency) => (
              <div
                key={agency.id}
                className="bg-neutral rounded-xl overflow-hidden border border-neutral-dark hover:border-primary transition-colors"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Show cover on mobile, logo on desktop */}
                    <div className="block sm:hidden w-full h-32 rounded-lg overflow-hidden">
                      <img
                        src={agency.cover_url || agency.logo_url || `https://source.unsplash.com/random/800x400?company&sig=${agency.id}`}
                        alt={agency.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="hidden sm:block w-24 h-24 flex-shrink-0">
                      <img
                        src={agency.logo_url || `https://source.unsplash.com/random/400x400?company&sig=${agency.id}`}
                        alt={`${agency.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{agency.name}</h3>
                            {agency.verification_status === 'approved' && (
                              <Verified className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{agency.location}</span>
                          </div>
                          <p className="text-gray-400 mt-2 line-clamp-2">{agency.description}</p>
                          <div className="flex flex-wrap gap-2 mt-4">
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
                        <div className="flex flex-col items-start sm:items-end gap-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <span className="font-semibold">
                              {agency.total_clients}+ clientes
                            </span>
                          </div>
                          <Link to={`/agencies/${agency.id}`}>
                            <Button variant="primary" size="sm">
                              Ver Perfil
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
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