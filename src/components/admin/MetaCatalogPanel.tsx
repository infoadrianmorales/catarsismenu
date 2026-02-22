import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, RefreshCw, Copy, CheckCircle2, AlertCircle, Loader2, Save, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useConfig } from '@/hooks/useConfig';

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

  const handleCopy = () => {
    navigator.clipboard.writeText(FEED_URL);
    setCopied(true);
    toast.success('URL copiada al portapapeles');
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
              <Button variant="outline" size="icon" onClick={handleCopy}>
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
    </div>
  );
};
