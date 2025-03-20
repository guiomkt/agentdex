import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Save, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import imageCompression from 'browser-image-compression';

const specialties = [
  'Assistentes Virtuais',
  'Atendimento ao Cliente',
  'Automação de Tarefas',
  'Criação de Conteúdo',
  'Análise de Dados',
  'Tradução e Idiomas',
  'Edição de Imagens',
  'Transcrição de Áudio',
  'Pesquisa e Relatórios',
  'Suporte Empresarial',
  'Marketing Digital',
  'Educação e Treinamento',
  'Outros'
];

interface Agency {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  cover_url: string | null;
  website_url: string;
  location: string;
  specialties: string[];
  user_id: string;
  cnpj: string;
}

export function EditAgency() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    async function fetchAgency() {
      try {
        const { data, error } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Verify ownership
        if (data.user_id !== user.id) {
          navigate('/profile');
          return;
        }

        setAgency(data);
        if (data.logo_url) setLogoPreview(data.logo_url);
        if (data.cover_url) setCoverPreview(data.cover_url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar agência');
      } finally {
        setLoading(false);
      }
    }

    fetchAgency();
  }, [id, user, navigate]);

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
    if (!agency) return;

    setSaving(true);
    setError(null);

    try {
      let logoUrl = agency.logo_url;
      let coverUrl = agency.cover_url;

      // Process logo if changed
      if (logoInputRef.current?.files?.length) {
        const file = logoInputRef.current.files[0];

        // Compress logo
        const compressedLogo = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 400,
          useWebWorker: true,
        });

        // Upload logo
        const logoFileName = `agency-logos/${user.id}/${Date.now()}-logo.webp`;
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

      // Process cover if changed
      if (coverInputRef.current?.files?.length) {
        const file = coverInputRef.current.files[0];

        // Compress cover
        const compressedCover = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });

        // Upload cover
        const coverFileName = `agency-covers/${user.id}/${Date.now()}-cover.webp`;
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

      const { error: updateError } = await supabase
        .from('agencies')
        .update({
          name: agency.name,
          description: agency.description,
          logo_url: logoUrl,
          cover_url: coverUrl,
          website_url: agency.website_url,
          location: agency.location,
          specialties: agency.specialties,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar agência');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary text-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-neutral rounded"></div>
              <div className="h-32 bg-neutral rounded"></div>
              <div className="h-10 bg-neutral rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agency) return null;

  return (
    <div className="min-h-screen bg-secondary text-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="secondary" size="sm" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Editar Agência</h1>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nome da Agência</label>
            <input
              type="text"
              value={agency.name}
              onChange={(e) => setAgency({ ...agency, name: e.target.value })}
              className="w-full bg-neutral rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">CNPJ</label>
            <input
              type="text"
              value={agency.cnpj}
              disabled
              className="w-full bg-neutral-dark rounded-lg px-4 py-2 text-gray-400"
            />
            <p className="text-sm text-gray-400 mt-1">O CNPJ não pode ser alterado</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              value={agency.description}
              onChange={(e) => setAgency({ ...agency, description: e.target.value })}
              className="w-full bg-neutral rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary h-32"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Logo da Agência
                <span className="block text-sm font-normal text-gray-400 mt-1">
                  Recomendado: 400x400px, PNG ou JPG
                </span>
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div
                    className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-black ${
                      logoPreview ? 'border-primary' : 'border-neutral-dark'
                    }`}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-auto h-auto max-w-full max-h-full object-contain p-2"
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
                    className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-black ${
                      coverPreview ? 'border-primary' : 'border-neutral-dark'
                    }`}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-auto h-auto max-w-full max-h-full object-contain p-2"
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
              value={agency.website_url}
              onChange={(e) => setAgency({ ...agency, website_url: e.target.value })}
              className="w-full bg-neutral rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Localização</label>
            <input
              type="text"
              value={agency.location}
              onChange={(e) => setAgency({ ...agency, location: e.target.value })}
              className="w-full bg-neutral rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Cidade, Estado"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Áreas de Atuação</label>
            <p className="text-sm text-gray-400 mb-4">
              Selecione as áreas em que sua agência oferece soluções de IA
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {specialties.map((specialty) => (
                <label
                  key={specialty}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    agency.specialties.includes(specialty)
                      ? 'bg-primary text-white'
                      : 'bg-neutral-dark hover:bg-neutral text-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={agency.specialties.includes(specialty)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAgency({
                          ...agency,
                          specialties: [...agency.specialties, specialty]
                        });
                      } else {
                        setAgency({
                          ...agency,
                          specialties: agency.specialties.filter((s) => s !== specialty)
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{specialty}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/profile')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving || agency.specialties.length === 0}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}