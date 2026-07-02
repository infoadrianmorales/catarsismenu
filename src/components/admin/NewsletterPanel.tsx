/**
 * NewsletterPanel
 * Panel de administración de suscriptores al newsletter.
 * Lista, busca, exporta CSV y permite eliminar suscriptores.
 * RLS: SELECT/DELETE restringido a admins.
 */
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Download, Trash2, Search, Mail, Loader2 } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
}

export const NewsletterPanel = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSubscribers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, source, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[NewsletterPanel] Error:', error);
      toast.error('No se pudieron cargar los suscriptores');
    } else {
      setSubscribers((data as Subscriber[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, search]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`¿Eliminar la suscripción de ${email}?`)) return;
    setDeletingId(id);
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);
    setDeletingId(null);

    if (error) {
      toast.error('Error al eliminar');
    } else {
      toast.success('Suscriptor eliminado');
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.info('No hay suscriptores para exportar');
      return;
    }
    const header = 'email,fuente,fecha_suscripcion\n';
    const rows = subscribers
      .map(
        (s) =>
          `"${s.email}","${s.source || 'homepage'}","${new Date(s.created_at).toISOString()}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `suscriptores-newsletter-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exportados ${subscribers.length} suscriptores`);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold">Suscriptores del Newsletter</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Cargando...' : `${subscribers.length} suscriptor${subscribers.length === 1 ? '' : 'es'} en total`}
            </p>
          </div>
        </div>
        <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">
              {search ? 'No hay coincidencias' : 'Aún no hay suscriptores'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {/* Table header - desktop */}
            <div className="hidden md:grid grid-cols-[1fr_150px_200px_80px] gap-4 px-4 py-3 bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Correo</span>
              <span>Fuente</span>
              <span>Fecha</span>
              <span className="text-right">Acción</span>
            </div>
            {filtered.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_150px_200px_80px] gap-2 md:gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
              >
                <span className="font-medium text-sm truncate">{sub.email}</span>
                <span className="text-xs text-muted-foreground">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-muted">
                    {sub.source || 'homepage'}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(sub.created_at)}</span>
                <div className="flex md:justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(sub.id, sub.email)}
                    disabled={deletingId === sub.id}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {deletingId === sub.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NewsletterPanel;
