/**
 * [MARKETING-PANEL] Sub-tab Google
 * Configura GTM, GA4, Google Ads Conversions y Search Console.
 */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, BarChart3, Tag, Target, ShieldCheck, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useConfig } from '@/hooks/useConfig';
import { CustomScriptsCard } from './CustomScriptsCard';

const GTM_RX = /^GTM-[A-Z0-9]+$/i;
const GA4_RX = /^G-[A-Z0-9]+$/i;
const GADS_RX = /^AW-[A-Z0-9]+$/i;

export const GoogleTab = () => {
  const { config, loading, updateConfig } = useConfig();

  // GTM
  const [gtmId, setGtmId] = useState('');
  const [gtmEnabled, setGtmEnabled] = useState(false);
  // GA4
  const [ga4Id, setGa4Id] = useState('');
  const [ga4Enabled, setGa4Enabled] = useState(false);
  // Google Ads
  const [gadsId, setGadsId] = useState('');
  const [gadsLabel, setGadsLabel] = useState('');
  const [gadsEnabled, setGadsEnabled] = useState(false);
  // Search Console
  const [gsc, setGsc] = useState('');

  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    setGtmId(config.gtm_id || '');
    setGtmEnabled(config.gtm_enabled || false);
    setGa4Id(config.ga4_id || '');
    setGa4Enabled(config.ga4_enabled || false);
    setGadsId(config.gads_conversion_id || '');
    setGadsLabel(config.gads_conversion_label || '');
    setGadsEnabled(config.gads_enabled || false);
    setGsc(config.google_site_verification || '');
  }, [loading, config]);

  const save = async (section: string, entries: Array<[string, string]>) => {
    setSaving(section);
    try {
      for (const [k, v] of entries) {
        await updateConfig(k, v);
      }
      toast.success('Guardado correctamente');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(null);
    }
  };

  const toggleAndSave = async (key: string, checked: boolean, setter: (v: boolean) => void) => {
    setter(checked);
    try {
      await updateConfig(key, checked ? 'true' : 'false');
    } catch {
      toast.error('Error al actualizar');
      setter(!checked);
    }
  };

  const gtmValid = !gtmId || GTM_RX.test(gtmId);
  const ga4Valid = !ga4Id || GA4_RX.test(ga4Id);
  const gadsValid = !gadsId || GADS_RX.test(gadsId);

  return (
    <div className="space-y-6">
      {/* GTM */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-500" />
            Google Tag Manager
          </CardTitle>
          <CardDescription>
            Inyecta el contenedor GTM en el sitio. El snippet del container
            <code className="mx-1 text-xs">GTM-K8BSZWCM</code> ya está hardcodeado
            en <code className="text-xs">index.html</code> para máxima prioridad —
            cambiar el ID aquí solo afecta la inyección dinámica. Si activas GTM,
            GA4 directo se desactiva para evitar doble conteo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Tracking activo</span>
                {gtmEnabled && gtmId && <Badge className="bg-green-500/20 text-green-500">Activo</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">Carga el snippet GTM en todas las páginas</p>
            </div>
            <Switch
              checked={gtmEnabled}
              onCheckedChange={(c) => toggleAndSave('gtm_enabled', c, setGtmEnabled)}
              disabled={!gtmId || !gtmValid}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gtm_id">Container ID</Label>
            <div className="flex gap-2">
              <Input
                id="gtm_id"
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value.trim().toUpperCase())}
                placeholder="GTM-XXXXXXX"
                className="font-mono"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => save('gtm', [['gtm_id', gtmId]])}
                disabled={saving === 'gtm' || !gtmValid}
              >
                {saving === 'gtm' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
            {!gtmValid && <p className="text-xs text-destructive">Formato inválido. Debe ser GTM-XXXXXXX</p>}
          </div>
          <a
            href="https://tagmanager.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> Abrir Google Tag Manager
          </a>
        </CardContent>
      </Card>

      {/* GA4 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            Google Analytics 4
          </CardTitle>
          <CardDescription>
            Mide tráfico y comportamiento. Si GTM está activo, este script no se inyecta — administra GA4 desde GTM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gtmEnabled && gtmId && (
            <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-sm">
              ⚠️ GTM está activo. GA4 directo se omite para evitar doble medición.
            </div>
          )}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Tracking activo</span>
                {ga4Enabled && ga4Id && <Badge className="bg-green-500/20 text-green-500">Activo</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">Carga gtag.js con el Measurement ID</p>
            </div>
            <Switch
              checked={ga4Enabled}
              onCheckedChange={(c) => toggleAndSave('ga4_enabled', c, setGa4Enabled)}
              disabled={!ga4Id || !ga4Valid}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ga4_id">Measurement ID</Label>
            <div className="flex gap-2">
              <Input
                id="ga4_id"
                value={ga4Id}
                onChange={(e) => setGa4Id(e.target.value.trim().toUpperCase())}
                placeholder="G-XXXXXXXXXX"
                className="font-mono"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => save('ga4', [['ga4_id', ga4Id]])}
                disabled={saving === 'ga4' || !ga4Valid}
              >
                {saving === 'ga4' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
            {!ga4Valid && <p className="text-xs text-destructive">Formato inválido. Debe ser G-XXXXXXXXXX</p>}
          </div>
        </CardContent>
      </Card>

      {/* Google Ads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Google Ads — Conversiones
          </CardTitle>
          <CardDescription>
            Reporta a Google Ads cada vez que un cliente confirma un pedido. Pega el Conversion ID y opcionalmente el Conversion Label.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Tracking activo</span>
                {gadsEnabled && gadsId && <Badge className="bg-green-500/20 text-green-500">Activo</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">Dispara evento de conversión al confirmar pedido</p>
            </div>
            <Switch
              checked={gadsEnabled}
              onCheckedChange={(c) => toggleAndSave('gads_enabled', c, setGadsEnabled)}
              disabled={!gadsId || !gadsValid}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gads_id">Conversion ID</Label>
            <Input
              id="gads_id"
              value={gadsId}
              onChange={(e) => setGadsId(e.target.value.trim().toUpperCase())}
              placeholder="AW-XXXXXXXXX"
              className="font-mono"
            />
            {!gadsValid && <p className="text-xs text-destructive">Formato inválido. Debe ser AW-XXXXXXXXX</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gads_label">Conversion Label (opcional)</Label>
            <Input
              id="gads_label"
              value={gadsLabel}
              onChange={(e) => setGadsLabel(e.target.value.trim())}
              placeholder="AbC-D_efG12345"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Si lo configuras, se enviará `send_to: AW-ID/LABEL`.
            </p>
          </div>
          <Button
            onClick={() =>
              save('gads', [
                ['gads_conversion_id', gadsId],
                ['gads_conversion_label', gadsLabel],
              ])
            }
            disabled={saving === 'gads' || !gadsValid}
            className="gap-2"
          >
            {saving === 'gads' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar Google Ads
          </Button>
        </CardContent>
      </Card>

      {/* Search Console */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Verificación de Google Search Console
          </CardTitle>
          <CardDescription>
            Pega aquí el valor del meta tag <code className="text-xs">google-site-verification</code> y se inyectará en el head.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gsc">Verification token</Label>
            <div className="flex gap-2">
              <Input
                id="gsc"
                value={gsc}
                onChange={(e) => setGsc(e.target.value.trim())}
                placeholder="abcDEF123..."
                className="font-mono"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => save('gsc', [['google_site_verification', gsc]])}
                disabled={saving === 'gsc'}
              >
                {saving === 'gsc' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Solo el valor de `content`, sin la etiqueta HTML completa.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scripts personalizados (head/body) */}
      <CustomScriptsCard />
    </div>
  );
};
