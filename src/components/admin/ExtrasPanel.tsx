// FEATURE [EXTRAS-ADMIN]: Panel CRUD de extras/add-ons en el admin.
// Permite crear, editar, eliminar y activar/desactivar extras.
// Los extras se asignan a una categoría del enum product_category
// y opcionalmente a un producto específico.

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Constants } from '@/integrations/supabase/types';

const CATEGORIES = Constants.public.Enums.product_category;

interface ExtraForm {
  nombre: string;
  precio_usd: string;
  categoria: string;
  product_id: string;
  activo: boolean;
  orden: string;
}

const defaultForm: ExtraForm = {
  nombre: '',
  precio_usd: '',
  categoria: '',
  product_id: '',
  activo: true,
  orden: '0',
};

export const ExtrasPanel = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExtraForm>(defaultForm);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Fetch all extras (admin sees all including inactive)
  const { data: extras = [], isLoading } = useQuery({
    queryKey: ['admin-product-extras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_extras')
        .select('*')
        .order('categoria')
        .order('orden', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch products for the product selector
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, nombre, categoria')
        .eq('activo', true)
        .order('nombre');
      if (error) throw error;
      return data;
    },
  });

  // Productos filtrados por la categoría seleccionada en el form
  const filteredProducts = products.filter(p => p.categoria === form.categoria);

  const saveMutation = useMutation({
    mutationFn: async (data: ExtraForm) => {
      const payload = {
        nombre: data.nombre.trim(),
        precio_usd: parseFloat(data.precio_usd),
        categoria: data.categoria as any,
        product_id: data.product_id || null,
        activo: data.activo,
        orden: parseInt(data.orden) || 0,
      };

      if (editingId) {
        const { error } = await supabase
          .from('product_extras')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('product_extras')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-extras'] });
      queryClient.invalidateQueries({ queryKey: ['product-extras'] });
      toast.success(editingId ? 'Extra actualizado' : 'Extra creado');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_extras')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-extras'] });
      queryClient.invalidateQueries({ queryKey: ['product-extras'] });
      toast.success('Extra eliminado');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, activo }: { id: string; activo: boolean }) => {
      const { error } = await supabase
        .from('product_extras')
        .update({ activo })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-extras'] });
      queryClient.invalidateQueries({ queryKey: ['product-extras'] });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleEdit = (extra: any) => {
    setForm({
      nombre: extra.nombre,
      precio_usd: String(extra.precio_usd),
      categoria: extra.categoria,
      product_id: extra.product_id || '',
      activo: extra.activo,
      orden: String(extra.orden),
    });
    setEditingId(extra.id);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.nombre.trim() || !form.categoria || !form.precio_usd) {
      toast.error('Nombre, categoría y precio son requeridos');
      return;
    }
    saveMutation.mutate(form);
  };

  const filteredExtras = filterCategory === 'all'
    ? extras
    : extras.filter(e => e.categoria === filterCategory);

  if (isLoading) {
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
          <h2 className="text-xl font-display font-bold">Extras / Add-ons</h2>
          <p className="text-sm text-muted-foreground">
            Configura extras que los clientes pueden agregar a sus productos en el carrito
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Extra
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Extra' : 'Crear Extra'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre *</Label>
                <Input
                  value={form.nombre}
                  onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Extra de carne"
                />
              </div>
              <div>
                <Label>Precio (USD) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.precio_usd}
                  onChange={e => setForm(prev => ({ ...prev, precio_usd: e.target.value }))}
                  placeholder="1.50"
                />
              </div>
              <div>
                <Label>Categoría *</Label>
                <Select
                  value={form.categoria}
                  onValueChange={val => setForm(prev => ({ ...prev, categoria: val, product_id: '' }))}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Producto específico (opcional)</Label>
                <Select
                  value={form.product_id}
                  onValueChange={val => setForm(prev => ({ ...prev, product_id: val === '_none' ? '' : val }))}
                >
                  <SelectTrigger><SelectValue placeholder="Aplica a toda la categoría" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Toda la categoría</SelectItem>
                    {filteredProducts.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Orden</Label>
                <Input
                  type="number"
                  value={form.orden}
                  onChange={e => setForm(prev => ({ ...prev, orden: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.activo}
                  onCheckedChange={val => setForm(prev => ({ ...prev, activo: val }))}
                />
                <Label>Activo</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingId ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtro por categoría */}
      <div className="flex items-center gap-2">
        <Label className="text-sm">Filtrar:</Label>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de extras */}
      {filteredExtras.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay extras configurados{filterCategory !== 'all' ? ` para ${filterCategory}` : ''}. Crea uno para empezar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredExtras.map(extra => (
            <Card key={extra.id} className={!extra.activo ? 'opacity-60' : ''}>
              <CardContent className="p-4 flex items-center gap-4">
                <Switch
                  checked={extra.activo}
                  onCheckedChange={activo => toggleActiveMutation.mutate({ id: extra.id, activo })}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{extra.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {extra.categoria} {extra.product_id ? '• Producto específico' : '• Toda la categoría'} • Orden: {extra.orden}
                  </p>
                </div>
                <span className="font-bold text-secondary text-sm">
                  +${Number(extra.precio_usd).toFixed(2)}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(extra)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm('¿Eliminar este extra?')) deleteMutation.mutate(extra.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
