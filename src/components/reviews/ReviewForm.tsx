import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

interface ReviewFormProps {
  agentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewForm({ agentId, onSuccess, onCancel }: ReviewFormProps) {
  const user = useAuthStore((state) => state.user);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError('Você precisa estar logado para enviar uma avaliação');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await supabase.from('reviews').insert([
        {
          agent_id: agentId,
          user_id: user.id,
          rating,
          comment,
        },
      ]);

      if (submitError) throw submitError;
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar avaliação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-900 text-red-500 rounded-lg p-3">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Sua avaliação</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoverRating || rating)
                    ? 'text-primary fill-current'
                    : 'text-gray-400'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Comentário
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full bg-neutral-dark rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary h-32"
          placeholder="Compartilhe sua experiência com este agente..."
          required
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading || rating === 0}>
          {loading ? 'Enviando...' : 'Enviar Avaliação'}
        </Button>
      </div>
    </form>
  );
}