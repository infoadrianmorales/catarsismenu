import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Megaphone } from 'lucide-react';

interface Promotion {
  id: string;
  titulo: string;
  subtitulo: string | null;
  descripcion: string | null;
  imagen_url: string | null;
  vigencia_inicio: string | null;
  vigencia_fin: string | null;
  activo: boolean;
  orden: number;
}

export const PromotionsPanel = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error fetching promotions:', error);
    } else {
      setPromotions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Promociones</h2>
          <p className="text-sm text-muted-foreground">
            {promotions.length} promociones configuradas
          </p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nueva Promoción
        </Button>
      </div>

      {promotions.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No hay promociones todavía.
              <br />
              Crea tu primera promoción para atraer clientes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {promotions.map((promo) => (
            <Card key={promo.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{promo.titulo}</CardTitle>
                    {promo.subtitulo && (
                      <p className="text-sm text-muted-foreground">{promo.subtitulo}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    promo.activo 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {promo.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {promo.descripcion || 'Sin descripción'}
                </p>
                {promo.vigencia_fin && (
                  <p className="text-xs text-muted-foreground">
                    Válida hasta: {new Date(promo.vigencia_fin).toLocaleDateString('es-VE')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
