import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface ReviewListProps {
  agentId: string;
}

export function ReviewList({ agentId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq('agent_id', agentId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar avaliações');
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [agentId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-neutral-dark rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-neutral-dark rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-neutral-dark rounded w-1/3"></div>
              </div>
            </div>
            <div className="h-4 bg-neutral-dark rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 bg-red-900/20 border border-red-900 rounded-lg p-4">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Nenhuma avaliação ainda. Seja o primeiro a avaliar!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="border-b border-neutral-dark pb-6 last:border-0"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <img
                src={
                  review.profiles.avatar_url ||
                  `https://source.unsplash.com/random/40x40?avatar&sig=${review.id}`
                }
                alt={`${review.profiles.username}'s avatar`}
                className="w-10 h-10 rounded-full md:block hidden"
              />
              <div>
                <h4 className="font-medium">{review.profiles.username}</h4>
                <div className="flex items-center text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? 'fill-current' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-400">
              {formatDistanceToNow(new Date(review.created_at))}
            </span>
          </div>
          <p className="text-gray-400">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}