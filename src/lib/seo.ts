import { Agent } from '@/types/agent';
import { Agency } from '@/types/agency';

// Base metadata for the site
export const defaultMetadata = {
  siteName: 'AgentDex',
  title: 'AgentDex - O Maior Diretório de Agentes de IA do Brasil',
  description: 'Encontre, compare e implemente os melhores agentes de IA para otimizar seu fluxo de trabalho. O maior diretório de agentes de inteligência artificial do Brasil.',
  url: 'https://agentdex.com.br',
  image: 'https://agentdex.com.br/og-image.jpg',
  twitterHandle: '@agentdex',
  locale: 'pt_BR',
};

// Helper to format price for SEO
function formatPrice(price: number | null): string {
  if (price === null) return 'Gratuito';
  return `R$ ${price.toFixed(2)}`;
}

// Generate metadata for an agent
export function generateAgentMetadata(agent: Agent) {
  const priceText = agent.price_type === 'free' 
    ? 'Gratuito'
    : agent.starting_price 
      ? `A partir de ${formatPrice(agent.starting_price)}`
      : agent.price_type === 'paid' 
        ? 'Pago' 
        : 'Freemium';

  return {
    title: `${agent.name} - ${priceText} | AgentDex`,
    description: agent.description,
    type: 'product',
    url: `${defaultMetadata.url}/agents/${agent.id}`,
    image: agent.image_url || `${defaultMetadata.url}/default-agent.jpg`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: agent.name,
      description: agent.description,
      image: agent.image_url || `${defaultMetadata.url}/default-agent.jpg`,
      offers: {
        '@type': 'Offer',
        price: agent.starting_price || 0,
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: agent.average_rating ? {
        '@type': 'AggregateRating',
        ratingValue: agent.average_rating,
        reviewCount: agent.total_reviews,
      } : undefined,
    },
  };
}

// Generate metadata for an agency
export function generateAgencyMetadata(agency: Agency) {
  return {
    title: `${agency.name} - Agência de IA${agency.verification_status === 'approved' ? ' ✓' : ''} | AgentDex`,
    description: agency.description,
    type: 'organization',
    url: `${defaultMetadata.url}/agencies/${agency.id}`,
    image: agency.logo_url || `${defaultMetadata.url}/default-agency.jpg`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: agency.name,
      description: agency.description,
      logo: agency.logo_url || `${defaultMetadata.url}/default-agency.jpg`,
      url: agency.website_url,
      address: {
        '@type': 'PostalAddress',
        addressLocality: agency.location,
        addressCountry: 'BR',
      },
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        value: agency.total_clients,
      },
    },
  };
}

// Generate metadata for marketplace page
export function generateMarketplaceMetadata(totalAgents: number) {
  return {
    title: `Marketplace de Agentes de IA | AgentDex`,
    description: `Explore ${totalAgents}+ agentes de IA para automatizar seus processos. Compare preços, avaliações e funcionalidades para encontrar a solução perfeita.`,
    type: 'website',
    url: `${defaultMetadata.url}/marketplace`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Marketplace de Agentes de IA',
      description: `Diretório com ${totalAgents}+ agentes de IA`,
      url: `${defaultMetadata.url}/marketplace`,
    },
  };
}

// Generate metadata for agencies page
export function generateAgenciesMetadata(totalAgencies: number) {
  return {
    title: `Agências Especializadas em IA | AgentDex`,
    description: `Encontre as melhores agências de IA do Brasil. ${totalAgencies}+ agências verificadas prontas para transformar seu negócio com inteligência artificial.`,
    type: 'website',
    url: `${defaultMetadata.url}/agencies`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Agências Especializadas em IA',
      description: `Diretório com ${totalAgencies}+ agências de IA`,
      url: `${defaultMetadata.url}/agencies`,
    },
  };
}

// Generate metadata for ranking page
export function generateRankingMetadata() {
  return {
    title: 'Ranking dos Melhores Agentes de IA | AgentDex',
    description: 'Descubra os agentes de IA mais bem avaliados do Brasil. Ranking atualizado com base em avaliações reais de usuários.',
    type: 'website',
    url: `${defaultMetadata.url}/ranking`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Ranking de Agentes de IA',
      description: 'Os agentes de IA mais bem avaliados',
      url: `${defaultMetadata.url}/ranking`,
    },
  };
}