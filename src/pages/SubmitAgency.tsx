import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Upload, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
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

function validateCNPJ(cnpj: string) {
  // Remove non-digits
  cnpj = cnpj.replace(/[^\d]/g, '');

  // Check length
  if (cnpj.length !== 14) return false;

  // Check for repeated numbers
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Validate check digits
  let sum = 0;
  let pos = 5;

  // First check digit
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(cnpj.charAt(12))) return false;

  // Second check digit
  sum = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(cnpj.charAt(13));
}

export function SubmitAgency() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    description: '',
    websiteUrl: '',
    location: '',
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary text-white py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Faça login para continuar</h1>
            <p className="text-gray-400 mb-8">
              Você precisa estar logado para cadastrar uma agência.
            </p>
            <Button variant="primary" onClick={() => navigate('/login')}>
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

    // Validate CNPJ
    const cnpj = formData.cnpj.replace(/[^\d]/g, '');
    if (!validateCNPJ(cnpj)) {
      setError('CNPJ inválido');
      setLoading(false);
      return;
    }

    try {
      // Check if CNPJ already exists
      const { data: existingAgency } = await supabase
        .from('agencies')
        .select('id')
        .eq('cnpj', cnpj)
        .single();

      if (existingAgency) {
        setError('Já existe uma agência cadastrada com este CNPJ');
        return;
      }

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

      const { error: submitError } = await supabase.from('agencies').insert([
        {
          name: formData.name,
          cnpj: cnpj,
          description: formData.description,
          logo_url: logoUrl,
          cover_url: coverUrl,
          website_url: formData.websiteUrl,
          location: formData.location,
          specialties: selectedSpecialties,
          user_id: user.id,
          verification_status: 'pending'
        },
      ]);

      if (submitError) throw submitError;

      alert('Agência cadastrada com sucesso! Ela aparecerá no diretório assim que for aprovada pela nossa equipe.');
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar agência');
    } finally {
      setLoading(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  return (
    <div className="min-h-screen bg-secondary text-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="secondary" size="sm" onClick={() => navigate('/agencies')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">Cadastrar Agência</h1>
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-neutral rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">CNPJ</label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className="w-full bg-neutral rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="w-full bg-neutral rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Localização</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-neutral rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Cidade, Estado"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Áreas de Atuação</label>
            <p className="text-xs md:text-sm text-gray-400 mb-4">
              Selecione as áreas em que sua agência oferece soluções de IA
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {specialties.map((specialty) => (
                <label
                  key={specialty}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSpecialties.includes(specialty)
                      ? 'bg-primary text-white'
                      : 'bg-neutral-dark hover:bg-neutral text-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedSpecialties.includes(specialty)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSpecialties([...selectedSpecialties, specialty]);
                      } else {
                        setSelectedSpecialties(
                          selectedSpecialties.filter((s) => s !== specialty)
                        );
                      }
                    }}
                  />
                  <span className="text-xs md:text-sm">{specialty}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/agencies')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || selectedSpecialties.length === 0}
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
                  Cadastrar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}