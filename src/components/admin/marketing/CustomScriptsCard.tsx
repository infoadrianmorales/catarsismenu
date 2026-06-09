/**
 * [MARKETING-PANEL] Editor de scripts personalizados
 * Permite pegar HTML/JS arbitrario para inyectar en <head> o al final de <body>
 * en runtime, sin modificar index.html. Los snippets se guardan en la tabla
 * `config` y los consume GoogleTagsProvider.
 */
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Code2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useConfig } from '@/hooks/useConfig';

export const CustomScriptsCard = () => {
  const { config, loading, updateConfig } = useConfig();

  const [headScripts, setHeadScripts] = useState('');
  const [bodyScripts, setBodyScripts] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    setHeadScripts(config.custom_head_scripts || '');
    setBodyScripts(config.custom_body_scripts || '');
    setEnabled(config.custom_scripts_enabled || false);
  }, [loading, config]);

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    try {
      await updateConfig('custom_scripts_enabled', checked ? 'true' : 'false');
      toast.success(checked ? 'Inyección activada' : 'Inyección desactivada');
    } catch {
      setEnabled(!checked);
      toast.error('Error al actualizar');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig('custom_head_scripts', headScripts);
      await updateConfig('custom_body_scripts', bodyScripts);
      toast.success('Scripts guardados. Recarga para ver cambios.');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-purple-500" />
          Scripts personalizados (head / body)
        </CardTitle>
        <CardDescription>
          Pega aquí cualquier script de terceros (GTM secundarios, Hotjar,
          Clarity, píxeles custom, etc.) y se inyectarán dinámicamente al cargar
          la página. El GTM principal{' '}
          <code className="text-xs">GTM-K8BSZWCM</code> sigue hardcodeado en{' '}
          <code className="text-xs">index.html</code> y no se ve afectado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-sm">
          <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-foreground/90">
            <strong>Advertencia:</strong> los scripts se ejecutan tal cual los
            pegues. Solo pega código de proveedores confiables. Pega el snippet
            completo con etiquetas <code className="text-xs">&lt;script&gt;</code>{' '}
            o <code className="text-xs">&lt;noscript&gt;</code> incluidas.
          </p>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Inyección activa</span>
              {enabled && (
                <Badge className="bg-green-500/20 text-green-500">Activo</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Habilita la carga de los scripts personalizados en todas las
              páginas
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={handleToggle} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom_head">
            Scripts del <code className="text-xs">&lt;head&gt;</code>
          </Label>
          <Textarea
            id="custom_head"
            value={headScripts}
            onChange={(e) => setHeadScripts(e.target.value)}
            placeholder={`<!-- Ejemplo -->\n<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXX');</script>`}
            className="font-mono text-xs min-h-[180px]"
            spellCheck={false}
          />
          <p className="text-xs text-muted-foreground">
            Se inserta al final del <code>&lt;head&gt;</code>.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom_body">
            Scripts del <code className="text-xs">&lt;body&gt;</code>
          </Label>
          <Textarea
            id="custom_body"
            value={bodyScripts}
            onChange={(e) => setBodyScripts(e.target.value)}
            placeholder={`<!-- Ejemplo -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`}
            className="font-mono text-xs min-h-[140px]"
            spellCheck={false}
          />
          <p className="text-xs text-muted-foreground">
            Se inserta al inicio del <code>&lt;body&gt;</code> (útil para los{' '}
            <code>&lt;noscript&gt;</code> de GTM).
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar scripts
        </Button>
      </CardContent>
    </Card>
  );
};
