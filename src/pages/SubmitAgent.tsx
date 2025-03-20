import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Upload, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import imageCompression from 'browser-image-compression';

const categories = [
  { id: 'automation', name: 'Automação' },
  { id: 'chatbots', name: 'Chatbots' },
  { id: 'data_analysis', name: 'Análise de Dados' },
  { id: 'content_creation', name: 'Criação de Conteúdo' },
  { id: 'research', name: 'Pesquisa' },
  { id: 'productivity', name: 'Produtividade' },
  { id: 'dev_tools', name: 'Ferramentas para Devs' },
  { id: 'machine_learning', name: 'Machine Learning' },
];

const priceTypes = [
  { id: 'free', name: 'Gratuito' },
  { id: 'paid', name: 'Pago' },
  { id: 'freemium', name: 'Freemium' },
];

export function SubmitAgent() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    websiteUrl: '',
    priceType: '',
    startingPrice: '',
    category: '',
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary text-white py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <Bot className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Faça login para continuar</h1>
            <p className="text-gray-400 mb-8">
              Você precisa estar logado para submeter um agente.
            </p>
            <Button variant="primary" onClick={() => navigate('/', { state: { openAuthModal: true } })}>
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'cover'
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setLogoPreview(reader.result as string);
        } else {
          setCoverPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Erro ao processar a imagem');
      console.error(err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let logoUrl = null;
      let coverUrl = null;

      // Process logo if selected
      if (logoInputRef.current?.files?.length) {
        const file = logoInputRef.current.files[0];

        // Compress logo
        const compressedLogo = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 400,
          useWebWorker: true,
        });

        // Upload logo
        const logoFileName = `agent-logos/${user.id}/${Date.now()}-logo.webp`;
        const { data: logoData, error: logoError } = await supabase.storage
          .from('public')
          .upload(logoFileName, compressedLogo, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (logoError) throw logoError;

        const { data: { publicUrl: logoPublicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(logoFileName);

        logoUrl = logoPublicUrl;
      }

      // Process cover if selected
      if (coverInputRef.current?.files?.length) {
        const file = coverInputRef.current.files[0];

        // Compress cover
        const compressedCover = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });

        // Upload cover
        const coverFileName = `agent-covers/${user.id}/${Date.now()}-cover.webp`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from('public')
          .upload(coverFileName, compressedCover, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (coverError) throw coverError;

        const { data: { publicUrl: coverPublicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(coverFileName);

        coverUrl = coverPublicUrl;
      }

      // Parse starting price
      const startingPrice = formData.priceType === 'free' 
        ? null 
        : formData.startingPrice 
          ? parseFloat(formData.startingPrice.replace(',', '.'))
          : null;

      const { error: submitError } = await supabase.from('agents').insert([
        {
          name: formData.name,
          description: formData.description,
          image_url: logoUrl,
          cover_url: coverUrl,
          website_url: formData.websiteUrl,
          price_type: formData.priceType,
          starting_price: startingPrice,
          category: formData.category,
          user_id: user.id,
          verification_status: 'pending'
        },
      ]);

      if (submitError) throw submitError;

      alert('Agente cadastrado com sucesso! Ele aparecerá no marketplace assim que for aprovado pela nossa equipe.');
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao submeter o agente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Submeter Novo Agente</h1>
          <p className="text-gray-400">
            Compartilhe seu agente de IA com a comunidade
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nome do Agente</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-neutral rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-neutral rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary h-32"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Logo do Agente
                <span className="block text-sm font-normal text-gray-400 mt-1">
                  Recomendado: 400x400px, PNG ou JPG
                </span>
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div
                    className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors ${
                      logoPreview ? 'border-primary' : 'border-neutral-dark'
                    }`}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-auto h-auto max-w-[80%] max-h-[80%] object-contain"
                      />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400 text-center px-4">
                          Clique para selecionar o logo
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Será redimensionado automaticamente
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'logo')}
                    className="hidden"
                  />
                </div>
                {logoPreview && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setLogoPreview(null);
                      if (logoInputRef.current) {
                        logoInputRef.current.value = '';
                      }
                    }}
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>

            {/* Cover Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Imagem de Capa
                <span className="block text-sm font-normal text-gray-400 mt-1">
                  Recomendado: 1200x400px, PNG ou JPG
                </span>
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div
                    className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors ${
                      coverPreview ? 'border-primary' : 'border-neutral-dark'
                    }`}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400 text-center px-4">
                          Clique para selecionar a capa
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Será redimensionado automaticamente
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'cover')}
                    className="hidden"
                  />
                </div>
                {coverPreview && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setCoverPreview(null);
                      if (coverInputRef.current) {
                        coverInputRef.current.value = '';
                      }
                    }}
                  >
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) =>
                setFormData({ ...formData, websiteUrl: e.target.value })
              }
              className="w-full bg-neutral rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-neutral rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Preço</label>
              <select
                value={formData.priceType}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    priceType: e.target.value,
                    startingPrice: e.target.value === 'free' ? '' : formData.startingPrice
                  });
                }}
                className="w-full bg-neutral rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Selecione o tipo de preço</option>
                {priceTypes.map((price) => (
                  <option key={price.id} value={price.id}>
                    {price.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.priceType !== 'free' && (
            <div>
              <label className="block text-sm font-medium mb-2">Preço inicial</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  R$
                </span>
                <input
                  type="text"
                  value={formData.startingPrice}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d,]/g, '');
                    setFormData({ ...formData, startingPrice: value });
                  }}
                  className="w-full bg-neutral rounded-lg pl-12 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0,00"
                  required={formData.priceType !== 'free'}
                />
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Digite o preço inicial do seu agente (ex: 29,90)
              </p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submeter
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}