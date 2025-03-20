import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { X, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  async function createProfile(userId: string) {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            username: email.split('@')[0],
            is_premium_user: false
          }
        ]);

      if (profileError) throw profileError;
    } catch (err) {
      console.error('Error creating profile:', err);
      // Don't show this error to the user since they're already signed up
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        
        if (error) throw error;

        // Create profile after successful signup
        if (data.user) {
          await createProfile(data.user.id);
        }

        setSuccess(
          'Um link de confirmação foi enviado para seu email. Por favor, verifique sua caixa de entrada e spam.'
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        // Customize error messages
        switch (err.message) {
          case 'Email not confirmed':
            setError('Por favor, confirme seu email antes de fazer login.');
            break;
          case 'Invalid login credentials':
            setError('Email ou senha incorretos.');
            break;
          case 'User already registered':
            setError('Este email já está cadastrado.');
            break;
          default:
            setError(err.message);
        }
      } else {
        setError('Ocorreu um erro. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">
          {isLogin ? 'Entrar' : 'Criar conta'}
        </h2>

        {error && (
          <div className="bg-red-900/20 border border-red-900 text-red-500 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-900 text-green-500 rounded-lg p-3 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-dark rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary border border-neutral-dark"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-white">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-dark rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary border border-neutral-dark"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              'Carregando...'
            ) : isLogin ? (
              'Entrar'
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Criar conta e verificar email
              </>
            )}
          </Button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setSuccess(null);
          }}
          className="text-primary hover:text-primary-dark mt-4 text-sm font-medium"
        >
          {isLogin
            ? 'Não tem uma conta? Criar conta'
            : 'Já tem uma conta? Fazer login'}
        </button>
      </div>
    </div>
  );
}