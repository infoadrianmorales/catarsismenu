/**
 * [MARKETING-PANEL] Editor de snippets GTM
 * Permite reemplazar el código completo de Google Tag Manager
 * (bloque <head> + bloque noscript del <body>) que antes vivía
 * hardcodeado en index.html. Los snippets se cachean en localStorage
 * para que el bootstrap de index.html los inyecte temprano en visitas
 * recurrentes.
 */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, RotateCcw, Code2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useConfig } from '@/hooks/useConfig';

const DEFAULT_HEAD = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K8BSZWCM');</script>
<!-- End Google Tag Manager -->`;

const DEFAULT_BODY = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K8BSZWCM"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

export const GtmSnippetsCard = () => {
  const { config, loading, updateConfig } = useConfig();

  const [enabled, setEnabled] = useState(false);
  const [headSnip, setHeadSnip] = useState('');
  const [bodySnip, setBodySnip] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    setEnabled(config.gtm_custom_enabled || false);
    setHeadSnip(config.gtm_head_snippet || '');
    setBodySnip(config.gtm_body_snippet || '');
  }, [loading, config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig('gtm_head_snippet', headSnip);
      await updateConfig('gtm_body_snippet', bodySnip);
      // Refrescar cache para el bootstrap de index.html
      try {
        if (enabled && headSnip) localStorage.setItem('__gtm_head_cache', headSnip);
        else localStorage.removeItem('__gtm_head_cache');
        if (enabled && bodySnip) localStorage.setItem('__gtm_body_cache', bodySnip);
        else localStorage.removeItem('__gtm_body_cache');
      } catch {
        /* noop */
      }
      toast.success('Snippets GTM guardados. Recarga para ver el efecto.');
    } catch {
      toast.error('Error al guardar los snippets');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    try {
      await updateConfig('gtm_custom_enabled', checked ? 'true' : 'false');
      try {
        if (!checked) {
          localStorage.removeItem('__gtm_head_cache');
          localStorage.removeItem('__gtm_body_cache');
        } else {
          if (headSnip) localStorage.setItem('__gtm_head_cache', headSnip);
          if (bodySnip) localStorage.setItem('__gtm_body_cache', bodySnip);
        }
      } catch {
        /* noop */
      }
    } catch {
      toast.error('Error al actualizar');
      setEnabled(!checked);
    }
  };

  const handleRestore = () => {
    setHeadSnip(DEFAULT_HEAD);
    setBodySnip(DEFAULT_BODY);
    toast.info('Snippets por defecto restaurados. Recuerda guardar.');
  };

  return (
    <Card className="border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-blue-500" />
          Snippets GTM (código completo)
          {enabled && <Badge className="bg-green-500/20 text-green-500">Activo</Badge>}
        </CardTitle>
        <CardDescription>
          Reemplaza el código completo de Google Tag Manager que se inyecta en el
          sitio. Pega aquí los bloques exactos que te entrega GTM. Se cachean en
          el navegador para cargarse antes que React en visitas recurrentes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
          <div>
            Solo pega código que confíes — se ejecuta tal cual en todos los visitantes.
            Si activas este modo, el "Container ID" simple de la sección de abajo se ignora.
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
          <div>
            <span className="font-medium">Usar snippets personalizados</span>
            <p className="text-xs text-muted-foreground">
              Si está apagado, GTM se inyecta solo si configuras el Container ID abajo.
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={handleToggle} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gtm_head_snippet">Snippet del &lt;head&gt;</Label>
          <Textarea
            id="gtm_head_snippet"
            value={headSnip}
            onChange={(e) => setHeadSnip(e.target.value)}
            placeholder="<!-- Google Tag Manager -->&#10;<script>...</script>&#10;<!-- End Google Tag Manager -->"
            className="font-mono text-xs min-h-[180px]"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gtm_body_snippet">Snippet del &lt;body&gt; (noscript)</Label>
          <Textarea
            id="gtm_body_snippet"
            value={bodySnip}
            onChange={(e) => setBodySnip(e.target.value)}
            placeholder="<!-- Google Tag Manager (noscript) -->&#10;<noscript>...</noscript>"
            className="font-mono text-xs min-h-[120px]"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar snippets
          </Button>
          <Button variant="outline" onClick={handleRestore} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Restaurar default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
