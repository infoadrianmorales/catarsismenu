/**
 * [2026-06-10] Validador de Eventos Meta Pixel
 *
 * Compara el manifest interno de eventos que la app dispara realmente
 * (APP_PIXEL_EVENTS) contra la lista que el usuario tiene configurada en
 * Meta Events Manager (persistida en `config.meta_pixel_configured_events`),
 * y muestra los desajustes para que el admin pueda limpiar.
 *
 * Telemetría runtime: `safeFbq` escribe en `localStorage.__fb_event_log`
 * cada vez que dispara un evento → este panel lee ese log para mostrar
 * "última vez disparado" en la sesión actual.
 */
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Activity,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Copy,
  Plus,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfig } from '@/hooks/useConfig';
import {
  APP_PIXEL_EVENTS,
  META_STANDARD_EVENTS,
  PIXEL_EVENT_LOG_KEY,
  CAPI_FAIL_LOG_KEY,
  type PixelEventLog,
  type CapiFailLog,
} from '@/lib/metaPixelManifest';

const formatRelative = (ts: number): string => {
  if (!ts) return 'Nunca';
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `hace ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return new Date(ts).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' });
};

const readLog = (): PixelEventLog => {
  try {
    const raw = localStorage.getItem(PIXEL_EVENT_LOG_KEY);
    return raw ? (JSON.parse(raw) as PixelEventLog) : {};
  } catch {
    return {};
  }
};

export const MetaPixelValidatorCard = () => {
  const { config, updateConfig } = useConfig();

  // Lista declarada por el usuario (lo que ve en Meta Events Manager)
  const [configuredSet, setConfiguredSet] = useState<Set<string>>(new Set());
  const [customInput, setCustomInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [log, setLog] = useState<PixelEventLog>({});
  const [tick, setTick] = useState(0); // fuerza refresco del log cada 5s

  // Hidrata desde config
  useEffect(() => {
    setConfiguredSet(new Set(config.meta_pixel_configured_events || []));
  }, [config.meta_pixel_configured_events]);

  // Refresca log de la sesión
  useEffect(() => {
    setLog(readLog());
    const i = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(i);
  }, [tick]);

  const appEventNames = useMemo(() => new Set(APP_PIXEL_EVENTS.map((e) => e.name)), []);

  // Diff
  const diff = useMemo(() => {
    const matched: string[] = [];
    const unusedInApp: string[] = []; // configurado en Meta pero la app no dispara → BORRAR
    const missingInMeta: string[] = []; // app dispara pero no configurado → AGREGAR

    configuredSet.forEach((name) => {
      if (appEventNames.has(name)) matched.push(name);
      else unusedInApp.push(name);
    });
    APP_PIXEL_EVENTS.forEach((e) => {
      if (!configuredSet.has(e.name)) missingInMeta.push(e.name);
    });

    return { matched, unusedInApp, missingInMeta };
  }, [configuredSet, appEventNames]);

  const toggleConfigured = (name: string) => {
    setConfiguredSet((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const addCustom = () => {
    const n = customInput.trim();
    if (!n) return;
    if (configuredSet.has(n)) {
      toast.info(`"${n}" ya está en la lista`);
      return;
    }
    setConfiguredSet((prev) => new Set(prev).add(n));
    setCustomInput('');
  };

  const removeCustom = (name: string) => {
    setConfiguredSet((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig('meta_pixel_configured_events', JSON.stringify(Array.from(configuredSet)));
      toast.success('Lista de eventos de Meta guardada');
    } catch {
      toast.error('Error al guardar');
    }
    setSaving(false);
  };

  const handleClearLog = () => {
    try {
      localStorage.removeItem(PIXEL_EVENT_LOG_KEY);
      setLog({});
      toast.success('Log de la sesión limpiado');
    } catch {
      /* noop */
    }
  };

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success(`"${txt}" copiado`);
  };

  // Custom events ya marcados (no en la lista estándar)
  const customConfigured = Array.from(configuredSet).filter(
    (n) => !META_STANDARD_EVENTS.includes(n)
  );

  const eventsManagerUrl = config.meta_pixel_id
    ? `https://business.facebook.com/events_manager2/list/pixel/${config.meta_pixel_id}/test_events`
    : 'https://business.facebook.com/events_manager2/';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Validador de Eventos del Pixel
        </CardTitle>
        <CardDescription>
          Compara los eventos que la app realmente dispara contra los que tienes configurados en Meta
          Events Manager. Marca aquí lo que veas allá y la herramienta te dirá qué borrar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* ============================================================ */}
        {/* a) INVENTARIO REAL DE LA APP                                 */}
        {/* ============================================================ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              Eventos que dispara esta app ({APP_PIXEL_EVENTS.length})
            </h4>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setTick((t) => t + 1)}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Refrescar log
              </Button>
              <Button size="sm" variant="ghost" onClick={handleClearLog}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Limpiar log
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Recorre el sitio en otra pestaña (carrito, checkout, WhatsApp…) y vuelve aquí para ver
            cuáles realmente se dispararon en esta sesión.
          </p>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Evento</th>
                  <th className="text-left px-3 py-2 font-medium">Tipo</th>
                  <th className="text-left px-3 py-2 font-medium">Disparado al</th>
                  <th className="text-right px-3 py-2 font-medium">Sesión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {APP_PIXEL_EVENTS.map((ev) => {
                  const seen = log[ev.name];
                  return (
                    <tr key={ev.name} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs">{ev.name}</td>
                      <td className="px-3 py-2">
                        <Badge variant={ev.standard ? 'default' : 'secondary'} className="text-[10px]">
                          {ev.standard ? 'Estándar' : 'Custom'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{ev.surface}</td>
                      <td className="px-3 py-2 text-right text-xs">
                        {seen ? (
                          <span className="text-green-600 dark:text-green-400">
                            {formatRelative(seen.lastFiredAt)} · ×{seen.count}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Sin disparar</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============================================================ */}
        {/* b) LISTA DECLARADA EN META                                   */}
        {/* ============================================================ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">
              Eventos que tienes configurados en Meta Events Manager
            </h4>
            <Button size="sm" variant="outline" asChild>
              <a href={eventsManagerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Abrir Events Manager
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Marca cada evento que veas en la columna "Eventos" de tu pixel en Meta. La herramienta
            usará esta lista para detectar configuraciones huérfanas.
          </p>

          {/* Grid de eventos estándar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg border border-border bg-muted/20">
            {META_STANDARD_EVENTS.map((name) => {
              const checked = configuredSet.has(name);
              const inApp = appEventNames.has(name);
              return (
                <label
                  key={name}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/40 rounded px-2 py-1.5 transition-colors"
                >
                  <Checkbox checked={checked} onCheckedChange={() => toggleConfigured(name)} />
                  <span className="text-xs font-mono flex-1">{name}</span>
                  {inApp && (
                    <span title="La app lo dispara">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Eventos custom configurados */}
          <div className="space-y-2">
            <Label className="text-xs">Eventos custom configurados en Meta</Label>
            <div className="flex gap-2">
              <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="Ej: ViewCart, MyCustomEvent…"
                className="font-mono text-sm"
              />
              <Button size="sm" variant="outline" onClick={addCustom} disabled={!customInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {customConfigured.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {customConfigured.map((name) => (
                  <Badge key={name} variant="secondary" className="gap-1 font-mono text-[11px]">
                    {name}
                    <button
                      onClick={() => removeCustom(name)}
                      className="hover:text-destructive"
                      aria-label={`Quitar ${name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar lista de Meta
          </Button>
        </section>

        {/* ============================================================ */}
        {/* c) DIFF                                                       */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Resultado de la validación</h4>

          {/* OK */}
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Configurado y disparado · {diff.matched.length}</span>
            </div>
            {diff.matched.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Aún no hay coincidencias. Marca los eventos de Meta arriba.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {diff.matched.map((n) => (
                  <Badge
                    key={n}
                    variant="outline"
                    className="border-green-500/40 text-green-600 dark:text-green-400 font-mono text-[11px]"
                  >
                    {n}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* NO USADOS — borrar en Meta */}
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">
                Configurado en Meta pero NO usado por la app · {diff.unusedInApp.length}
              </span>
            </div>
            {diff.unusedInApp.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin huérfanos. Limpio.</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-2">
                  Estos eventos están en tu Events Manager pero la app nunca los dispara. Bórralos en
                  Meta para que no contaminen tus dashboards ni la optimización.
                </p>
                <div className="space-y-1.5">
                  {diff.unusedInApp.map((n) => (
                    <div
                      key={n}
                      className="flex items-center justify-between gap-2 rounded bg-background/60 px-2 py-1.5"
                    >
                      <span className="font-mono text-xs">{n}</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => handleCopy(n)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* FALTAN EN META */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">
                Disparado por la app pero NO configurado en Meta · {diff.missingInMeta.length}
              </span>
            </div>
            {diff.missingInMeta.length === 0 ? (
              <p className="text-xs text-muted-foreground">Todos los eventos de la app están declarados.</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-2">
                  Estos eventos sí los está enviando la app. Si no aparecen en Events Manager puedes
                  estar perdiendo señal de optimización.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {diff.missingInMeta.map((n) => (
                    <Badge
                      key={n}
                      variant="outline"
                      className="border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono text-[11px]"
                    >
                      {n}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  );
};
