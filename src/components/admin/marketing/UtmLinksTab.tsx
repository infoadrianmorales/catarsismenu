/**
 * [MARKETING-PANEL] Sub-tab UTM Links
 * Builder + historial guardado + métricas de clics (via RPC).
 */
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, ExternalLink, Trash2, Loader2, Plus, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const BASE_URL = 'https://www.catarsiszone.com';

const DEEP_LINKS = [
  { label: 'Página principal', path: '/' },
  { label: 'Menú', path: '/menu' },
  { label: 'Hamburguesas', path: '/hamburguesas' },
  { label: 'Pizzas', path: '/pizzas' },
  { label: 'Coctelería', path: '/cocteleria' },
  { label: 'Alitas', path: '/categoria/alitas' },
  { label: 'Entradas', path: '/entradas' },
  { label: 'Ensaladas', path: '/ensaladas' },
  { label: 'Emparedados', path: '/emparedados' },
  { label: 'Parrilla', path: '/parrilla' },
  { label: 'Best Sellers', path: '/best-seller' },
];

const SOURCES = ['facebook', 'instagram', 'google', 'tiktok', 'whatsapp', 'email', 'qr'];
const MEDIUMS = ['cpc', 'social', 'organic', 'email', 'referral', 'qr', 'paid'];

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-.]/g, '');

interface UtmLink {
  id: string;
  label: string;
  base_path: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string | null;
  utm_content: string | null;
  full_url: string;
  created_at: string;
}

const buildUrl = (basePath: string, params: Record<string, string>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const sep = basePath.includes('?') ? '&' : '?';
  return `${BASE_URL}${basePath}${sep}${sp.toString()}`;
};

const LinkRow = ({ link, onDelete }: { link: UtmLink; onDelete: (id: string) => void }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['utm-stats', link.utm_source, link.utm_medium, link.utm_campaign],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_utm_link_stats', {
        p_utm_source: link.utm_source,
        p_utm_medium: link.utm_medium,
        p_utm_campaign: link.utm_campaign,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row as { total_visits: number; unique_visitors: number; visits_7d: number } | null;
    },
    staleTime: 60_000,
  });

  return (
    <div className="p-3 border border-border rounded-lg space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{link.label}</p>
          <p className="text-[11px] text-muted-foreground font-mono truncate">{link.full_url}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            <Badge variant="secondary" className="text-[10px]">{link.utm_source}</Badge>
            <Badge variant="secondary" className="text-[10px]">{link.utm_medium}</Badge>
            <Badge variant="outline" className="text-[10px]">{link.utm_campaign}</Badge>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(link.full_url); toast.success('Copiado'); }}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
            <a href={link.full_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(link.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Total</p>
          <p className="text-base font-bold">{isLoading ? '—' : stats?.total_visits ?? 0}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Únicos</p>
          <p className="text-base font-bold">{isLoading ? '—' : stats?.unique_visitors ?? 0}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase">7 días</p>
          <p className="text-base font-bold">{isLoading ? '—' : stats?.visits_7d ?? 0}</p>
        </div>
      </div>
    </div>
  );
};

export const UtmLinksTab = () => {
  const qc = useQueryClient();
  const [label, setLabel] = useState('');
  const [basePath, setBasePath] = useState('/');
  const [src, setSrc] = useState('facebook');
  const [med, setMed] = useState('cpc');
  const [camp, setCamp] = useState('');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => {
    if (!camp.trim()) return '';
    return buildUrl(basePath, {
      utm_source: norm(src),
      utm_medium: norm(med),
      utm_campaign: norm(camp),
      utm_term: norm(term),
      utm_content: norm(content),
    });
  }, [basePath, src, med, camp, term, content]);

  const { data: links, isLoading } = useQuery({
    queryKey: ['utm-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utm_links')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UtmLink[];
    },
  });

  const save = async () => {
    if (!label.trim() || !camp.trim()) {
      toast.error('Label y campaign son obligatorios');
      return;
    }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('utm_links').insert({
      label: label.trim(),
      base_path: basePath,
      utm_source: norm(src),
      utm_medium: norm(med),
      utm_campaign: norm(camp),
      utm_term: term ? norm(term) : null,
      utm_content: content ? norm(content) : null,
      full_url: preview,
      created_by: userData.user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      toast.error('Error al guardar: ' + error.message);
      return;
    }
    toast.success('Link guardado');
    setLabel('');
    setCamp('');
    setTerm('');
    setContent('');
    qc.invalidateQueries({ queryKey: ['utm-links'] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('utm_links').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar');
      return;
    }
    toast.success('Eliminado');
    qc.invalidateQueries({ queryKey: ['utm-links'] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Constructor de links UTM
          </CardTitle>
          <CardDescription>
            Genera URLs trackeables para campañas. Los valores se normalizan (lowercase, sin espacios).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Etiqueta interna *</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Promo San Valentín 2026" />
            </div>
            <div className="space-y-2">
              <Label>Destino</Label>
              <Select value={basePath} onValueChange={setBasePath}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEEP_LINKS.map((l) => (
                    <SelectItem key={l.path} value={l.path}>{l.label} <span className="text-muted-foreground font-mono text-xs">({l.path})</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>utm_source *</Label>
              <Input value={src} onChange={(e) => setSrc(e.target.value)} list="utm-sources" />
              <datalist id="utm-sources">{SOURCES.map((s) => <option key={s} value={s} />)}</datalist>
            </div>
            <div className="space-y-2">
              <Label>utm_medium *</Label>
              <Input value={med} onChange={(e) => setMed(e.target.value)} list="utm-mediums" />
              <datalist id="utm-mediums">{MEDIUMS.map((m) => <option key={m} value={m} />)}</datalist>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>utm_campaign *</Label>
              <Input value={camp} onChange={(e) => setCamp(e.target.value)} placeholder="san_valentin_2026" />
            </div>
            <div className="space-y-2">
              <Label>utm_term (opcional)</Label>
              <Input value={term} onChange={(e) => setTerm(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>utm_content (opcional)</Label>
              <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="banner_a" />
            </div>
          </div>

          {preview && (
            <div className="space-y-2">
              <Label>Vista previa</Label>
              <div className="flex gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded-md text-xs break-all font-mono">{preview}</code>
                <Button size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(preview); toast.success('Copiado'); }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <Button onClick={save} disabled={saving || !label.trim() || !camp.trim()} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Guardar link
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial y métricas</CardTitle>
          <CardDescription>
            Clics medidos cruzando los parámetros UTM con las visitas registradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !links || links.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aún no hay links guardados.</p>
          ) : (
            <div className="space-y-2">
              {links.map((l) => <LinkRow key={l.id} link={l} onDelete={remove} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
