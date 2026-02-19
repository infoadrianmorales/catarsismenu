import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['meta-feed-status'],
    queryFn: fetchFeedStatus,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(FEED_URL);
    setCopied(true);
    toast.success('URL copiada al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
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
