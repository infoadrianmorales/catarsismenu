import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, RefreshCw, Copy, CheckCircle2, AlertCircle, Loader2, Save, Facebook, Link2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useConfig } from '@/hooks/useConfig';

const BASE_URL = 'https://www.catarsiszone.com';
const FEED_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-catalog-feed`;

interface FeedStatus {
  ok: boolean;
  productCount: number;
  fetchedAt: string;
  error?: string;
}

const fetchFeedStatus = async (): Promise<FeedStatus> => {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const count = (xml.match(/<entry>/g) || []).length;
  return { ok: true, productCount: count, fetchedAt: new Date().toISOString() };
};

const DEEP_LINK_URLS = [
  { label: 'Página principal', path: '/' },
  { label: 'Hamburguesas', path: '/hamburguesas' },
  { label: 'Pizzas', path: '/pizzas' },
  { label: 'Coctelería', path: '/cocteleria' },
  { label: 'Alitas', path: '/alitas' },
  { label: 'Entradas', path: '/entradas' },
  { label: 'Ensaladas', path: '/ensaladas' },
  { label: 'Emparedados', path: '/emparedados' },
  { label: 'Parrilla', path: '/parrilla' },
  { label: 'Best Sellers', path: '/best-seller' },
];

const UTM_EXAMPLE = '?utm_source=facebook&utm_medium=cpc&utm_campaign=nombre_campaña';

export const MetaCatalogPanel = () => {
  const [copied, setCopied] = useState(false);
  const { config, loading: configLoading, updateConfig } = useConfig();
  const [metaPixelId, setMetaPixelId] = useState('');
  const [metaPixelEnabled, setMetaPixelEnabled] = useState(false);
  const [savingPixel, setSavingPixel] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['meta-feed-status'],
    queryFn: fetchFeedStatus,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!configLoading) {
      setMetaPixelId(config.meta_pixel_id || '');
      setMetaPixelEnabled(config.meta_pixel_enabled || false);
    }
  }, [configLoading, config]);

  const handleCopy = (text?: string) => {
    navigator.clipboard.writeText(text || FEED_URL);
    setCopied(true);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePixelId = async () => {
    setSavingPixel(true);
    try {
      await updateConfig('meta_pixel_id', metaPixelId);
      toast.success('Pixel ID guardado');
    } catch {
      toast.error('Error al guardar');
    }
    setSavingPixel(false);
  };

  const handleTogglePixel = async (checked: boolean) => {
    setMetaPixelEnabled(checked);
    try {
      await updateConfig('meta_pixel_enabled', checked ? 'true' : 'false');
    } catch {
      toast.error('Error al actualizar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Meta Pixel Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-500" />
            Meta Pixel (Facebook)
          </CardTitle>
          <CardDescription>
            Configura el seguimiento de conversiones para Meta Ads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Tracking Activo</span>
                {metaPixelEnabled && metaPixelId && (
                  <Badge variant="default" className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                    Activo
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Habilita o deshabilita el seguimiento de eventos
              </p>
            </div>
            <Switch
              checked={metaPixelEnabled}
              onCheckedChange={handleTogglePixel}
              disabled={!metaPixelId}
            />
          </div>

          {/* Pixel ID Input */}
          <div className="space-y-2">
            <Label htmlFor="meta_pixel_id">Pixel ID</Label>
            <div className="flex gap-2">
              <Input
                id="meta_pixel_id"
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value.replace(/\D/g, ''))}
                className="bg-input border-border font-mono"
                placeholder="123456789012345"
                maxLength={16}
              />
              <Button
                onClick={handleSavePixelId}
                disabled={savingPixel}
                size="icon"
                variant="outline"
              >
                {savingPixel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ID de 15-16 dígitos. Encuéntralo en Meta Events Manager.
            </p>
            {metaPixelId && metaPixelId.length < 15 && (
              <p className="text-xs text-destructive">
                El Pixel ID debe tener al menos 15 dígitos
              </p>
            )}
          </div>

          {/* Help Link */}
          <a
            href="https://www.facebook.com/business/help/952192354843755"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            ¿Cómo encuentro mi Pixel ID?
          </a>

          {/* Events Info */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm font-medium mb-2">Eventos que se rastrean:</p>
            <div className="flex flex-wrap gap-2">
              {['PageView', 'ViewContent', 'AddToCart', 'RemoveFromCart', 'InitiateCheckout', 'Purchase', 'Contact', 'Search', 'AddPaymentInfo', 'ViewCategory'].map((event) => (
                <Badge key={event} variant="secondary" className="text-xs">
                  {event}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog Feed Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Catálogo Meta (Facebook / Instagram)
          </CardTitle>
          <CardDescription>
            Feed XML público que Meta lee periódicamente para sincronizar tu catálogo de productos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feed URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">URL del Feed</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded-md text-xs break-all font-mono">
                {FEED_URL}
              </code>
              <Button variant="outline" size="icon" onClick={() => handleCopy()}>
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={FEED_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Pega esta URL en Meta Commerce Manager → Catálogo → Feed de datos
            </p>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Estado</p>
                {isLoading || isFetching ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                ) : error ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" /> Error
                  </Badge>
                ) : (
                  <Badge variant="default" className="gap-1 bg-green-600">
                    <CheckCircle2 className="h-3 w-3" /> Activo
                  </Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Productos en feed</p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '—' : data?.productCount ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Última verificación</p>
                <p className="text-sm font-medium text-foreground">
                  {data?.fetchedAt
                    ? new Date(data.fetchedAt).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })
                    : '—'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Verificar feed ahora
          </Button>

          {error && (
            <p className="text-sm text-destructive">
              Error al verificar: {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          )}

          {/* Instructions */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="text-sm font-medium text-foreground">Cómo conectar en Meta</h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Ir a <strong>Meta Commerce Manager</strong> (business.facebook.com/commerce)</li>
              <li>Crear catálogo tipo "E-commerce"</li>
              <li>Seleccionar "Feed de datos" como fuente</li>
              <li>Pegar la URL del feed de arriba</li>
              <li>Configurar actualización diaria</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Deep Links Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Enlaces Profundos (Deep Links)
          </CardTitle>
          <CardDescription>
            URLs directas para usar en anuncios de Meta. Llevan al usuario a una página específica en lugar de la página principal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Domain Verification Status */}
          <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <span className="text-sm font-medium">Verificación de dominio</span>
              <p className="text-xs text-muted-foreground">Meta tag configurada en index.html</p>
            </div>
            <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30">
              Configurada
            </Badge>
          </div>

          {/* URL Table */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">URLs disponibles</h4>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {DEEP_LINK_URLS.map((item) => (
                  <div key={item.path} className="flex items-center justify-between px-3 py-2 hover:bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <p className="text-xs text-muted-foreground font-mono truncate">{BASE_URL}{item.path}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleCopy(`${BASE_URL}${item.path}`)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                {/* Product pattern */}
                <div className="flex items-center justify-between px-3 py-2 bg-muted/20">
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-foreground">Producto individual</span>
                    <p className="text-xs text-muted-foreground font-mono">{BASE_URL}/producto/<span className="italic text-primary">{'{slug}'}</span></p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 El catálogo XML ya incluye los deep links de cada producto automáticamente para anuncios dinámicos.
            </p>
          </div>

          {/* UTM Parameters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Parámetros UTM (recomendado)</h4>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded-md text-xs break-all font-mono">
                {UTM_EXAMPLE}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(UTM_EXAMPLE)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Agrega estos parámetros al final de cualquier URL para rastrear el origen de las visitas en tu analítica.
            </p>
          </div>

          {/* Instructions */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="text-sm font-medium text-foreground">Cómo usar en Meta Ads Manager</h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Al crear un anuncio, pega la URL directa en el campo <strong>"Website URL"</strong></li>
              <li>Para <strong>anuncios dinámicos</strong> con catálogo, el feed ya incluye los enlaces — no necesitas configurarlos</li>
              <li>Agrega parámetros UTM para diferenciar campañas en tu analítica</li>
              <li>Ejemplo completo: <code className="bg-muted px-1 rounded text-xs">{BASE_URL}/hamburguesas{UTM_EXAMPLE}</code></li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
