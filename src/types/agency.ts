export interface Agency {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  website_url: string;
  location: string;
  specialties: string[];
  user_id: string;
  is_verified: boolean;
  total_clients: number;
  created_at: string;
  cnpj: string;
  average_rating?: number;
  total_reviews?: number;
}