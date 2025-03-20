import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  type?: string;
  image?: string;
  url?: string;
  structuredData?: Record<string, any>;
}

export function SEO({ 
  title, 
  description, 
  type = 'website',
  image,
  url,
  structuredData 
}: SEOProps) {
  useEffect(() => {
    // Update meta tags
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:type"]')?.setAttribute('content', type);
    
    if (image) {
      document.querySelector('meta[property="og:image"]')?.setAttribute('content', image);
      document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', image);
    }
    
    if (url) {
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
    }

    // Update structured data
    if (structuredData) {
      let script = document.querySelector('#structured-data');
      if (!script) {
        script = document.createElement('script');
        script.id = 'structured-data';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    return () => {
      // Clean up structured data when component unmounts
      document.querySelector('#structured-data')?.remove();
    };
  }, [title, description, type, image, url, structuredData]);

  return null;
}