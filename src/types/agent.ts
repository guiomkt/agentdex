export interface Agent {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  website_url: string;
  price_type: 'free' | 'paid' | 'freemium';
  starting_price: number | null;
  category: string;
  is_premium: boolean;
  created_at: string;
  user_id: string;
  average_rating?: number;
  total_reviews?: number;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}