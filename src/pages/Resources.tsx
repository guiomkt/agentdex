import { useState } from 'react';
import { Search, Book, Video, FileText, ArrowRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const categories = [
  { id: 'all', name: 'Todos' },
  { id: 'tutorials', name: 'Tutoriais' },
  { id: 'guides', name: 'Guias' },
  { id: 'case-studies', name: 'Cases' },
  { id: 'best-practices', name: 'Boas Práticas' },
];

const resources = [
  {
    id: 1,
    title: 'Introdução aos Agentes de IA',
    description: 'Um guia completo para iniciantes sobre como começar com agentes de IA.',
    type: 'guide',
    readTime: '10 min',
    level: 'Iniciante',
    author: 'Maria Silva',
    thumbnail: 'https://source.unsplash.com/random/800x600?ai&sig=1',
  },
  {
    id: 2,
    title: 'Como Escolher o Melhor Agente para seu Negócio',
    description: 'Aprenda os critérios essenciais para selecionar o agente ideal.',
    type: 'tutorial',
    readTime: '15 min',
    level: 'Intermediário',
    author: 'João Santos',
    thumbnail: 'https://source.unsplash.com/random/800x600?business&sig=2',
  },
  {
    id: 3,
    title: 'Case Study: Automação de Atendimento com IA',
    description: 'Como uma empresa aumentou sua eficiência em 300% usando agentes.',
    type: 'case-study',
    readTime: '20 min',
    level: 'Avançado',
    author: 'Ana Costa',
    thumbnail: 'https://source.unsplash.com/random/800x600?automation&sig=3',
  },
  {
    id: 4,
    title: 'Melhores Práticas de Segurança com Agentes de IA',
    description: 'Guia essencial para manter seus agentes seguros e confiáveis.',
    type: 'best-practices',
    readTime: '12 min',
    level: 'Intermediário',
    author: 'Pedro Oliveira',
    thumbnail: 'https://source.unsplash.com/random/800x600?security&sig=4',
  },
  {
    id: 5,
    title: 'Integrando Agentes em seu Workflow',
    description: 'Tutorial passo a passo para integrar agentes em seu fluxo de trabalho.',
    type: 'tutorial',
    readTime: '25 min',
    level: 'Avançado',
    author: 'Carla Mendes',
    thumbnail: 'https://source.unsplash.com/random/800x600?workflow&sig=5',
  },
  {
    id: 6,
    title: 'Métricas de Sucesso para Agentes de IA',
    description: 'Como medir e otimizar o desempenho dos seus agentes.',
    type: 'guide',
    readTime: '18 min',
    level: 'Intermediário',
    author: 'Lucas Ferreira',
    thumbnail: 'https://source.unsplash.com/random/800x600?metrics&sig=6',
  },
];

export function Resources() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = selectedCategory === 'all' || resource.type === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tutorial':
        return <Video className="h-5 w-5" />;
      case 'guide':
        return <Book className="h-5 w-5" />;
      case 'case-study':
        return <FileText className="h-5 w-5" />;
      default:
        return <Book className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Recursos Educacionais</h1>
          <p className="text-xl text-gray-400">
            Aprenda a maximizar o potencial dos agentes de IA com nossos guias e tutoriais
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Buscar recursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral rounded-lg pl-4 pr-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-neutral rounded-xl overflow-hidden border border-neutral-dark hover:border-primary transition-colors"
            >
              <img
                src={resource.thumbnail}
                alt={resource.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  {getTypeIcon(resource.type)}
                  <span className="text-sm text-gray-400">{resource.type}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-400">{resource.readTime}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                <p className="text-gray-400 mb-4">{resource.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Por {resource.author}</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    resource.level === 'Iniciante'
                      ? 'bg-green-900/20 text-green-500'
                      : resource.level === 'Intermediário'
                      ? 'bg-blue-900/20 text-blue-500'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {resource.level}
                  </span>
                </div>
                <Button variant="primary" className="w-full">
                  Ler Mais
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-neutral rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Receba as Últimas Atualizações
          </h2>
          <p className="text-gray-400 mb-6">
            Inscreva-se para receber novos recursos, tutoriais e atualizações sobre IA
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Seu email"
              className="flex-1 bg-neutral-dark rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button variant="primary">Inscrever-se</Button>
          </div>
        </div>
      </div>
    </div>
  );
}