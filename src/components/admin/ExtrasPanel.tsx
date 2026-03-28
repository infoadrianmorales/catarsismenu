// FEATURE [EXTRAS-ADMIN]: Panel CRUD de extras/add-ons en el admin.
// Permite crear, editar, eliminar y activar/desactivar extras.
// Los extras se asignan a una categoría del enum product_category
// y opcionalmente a uno o varios productos específicos.
// Al crear con múltiples productos, se insertan N filas (una por producto).

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
  // CAMBIO: array de IDs para multi-select de productos
  product_ids: string[];
  // Flag: true = aplica a toda la categoría (product_id = null)
  allCategory: boolean;
  activo: boolean;
  orden: string;
}

const defaultForm: ExtraForm = {
  nombre: '',
  precio_usd: '',
  categoria: '',
  product_ids: [],
  allCategory: true,
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
      const basePayload = {
        nombre: data.nombre.trim(),
        precio_usd: parseFloat(data.precio_usd),
        categoria: data.categoria as any,
        activo: data.activo,
        orden: parseInt(data.orden) || 0,
      };

      if (editingId) {
        // EDICIÓN: solo edita la fila individual, mantiene su product_id
        const { error } = await supabase
          .from('product_extras')
          .update(basePayload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        // CREACIÓN: si allCategory o no hay IDs → 1 fila con product_id null
        // Si hay IDs seleccionados → N filas (una por producto)
        if (data.allCategory || data.product_ids.length === 0) {
          const { error } = await supabase
            .from('product_extras')
            .insert({ ...basePayload, product_id: null });
          if (error) throw error;
        } else {
          // Insertar una fila por cada producto seleccionado
          const rows = data.product_ids.map(pid => ({
            ...basePayload,
            product_id: pid,
          }));
          const { error } = await supabase
            .from('product_extras')
            .insert(rows);
          if (error) throw error;
        }
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
      // En edición, mostramos el product_id actual (si existe)
      product_ids: extra.product_id ? [extra.product_id] : [],
      allCategory: !extra.product_id,
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

  // Toggle un producto en la selección múltiple
  const toggleProduct = (productId: string) => {
    setForm(prev => {
      const isSelected = prev.product_ids.includes(productId);
      return {
        ...prev,
        product_ids: isSelected
          ? prev.product_ids.filter(id => id !== productId)
          : [...prev.product_ids, productId],
        // Si seleccionan un producto, desactivar "toda la categoría"
        allCategory: false,
      };
    });
  };

  // Toggle "toda la categoría" — desselecciona productos individuales
  const toggleAllCategory = (checked: boolean) => {
    setForm(prev => ({
      ...prev,
      allCategory: checked,
      product_ids: checked ? [] : prev.product_ids,
    }));
  };

  // Helper: buscar nombre de producto por ID
  const getProductName = (productId: string) => {
    const p = products.find(pr => pr.id === productId);
    return p?.nombre || 'Producto desconocido';
  };

  const filteredExtras = filterCategory === 'all'
    ? extras
    : extras.filter(e => e.categoria === filterCategory);

  // Agrupar extras por nombre+categoría para mostrar productos asignados
  const groupedExtras = filteredExtras.reduce<Record<string, any[]>>((acc, extra) => {
    const key = `${extra.nombre}__${extra.categoria}__${extra.precio_usd}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(extra);
    return acc;
  }, {});

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
          <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                  onValueChange={val => setForm(prev => ({ ...prev, categoria: val, product_ids: [], allCategory: true }))}
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

              {/* MULTI-SELECT: Productos de la categoría */}
              {form.categoria && (
                <div>
                  <Label className="mb-2 block">Aplica a:</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {/* Opción: toda la categoría */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="all-category"
                        checked={form.allCategory}
                        onCheckedChange={(checked) => toggleAllCategory(!!checked)}
                      />
                      <label htmlFor="all-category" className="text-sm font-medium cursor-pointer">
                        Toda la categoría ({form.categoria})
                      </label>
                    </div>

                    {filteredProducts.length > 0 && (
                      <div className="border-t pt-2 mt-2 space-y-2">
                        <p className="text-xs text-muted-foreground">O selecciona productos específicos:</p>
                        {filteredProducts.map(p => (
                          <div key={p.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`product-${p.id}`}
                              checked={form.product_ids.includes(p.id)}
                              onCheckedChange={() => toggleProduct(p.id)}
                              disabled={form.allCategory}
                            />
                            <label
                              htmlFor={`product-${p.id}`}
                              className={`text-sm cursor-pointer ${form.allCategory ? 'text-muted-foreground' : ''}`}
                            >
                              {p.nombre}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {!form.allCategory && form.product_ids.length > 0 && !editingId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Se crearán {form.product_ids.length} filas (una por producto)
                    </p>
                  )}
                </div>
              )}

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

      {/* Lista de extras agrupados */}
      {Object.keys(groupedExtras).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay extras configurados{filterCategory !== 'all' ? ` para ${filterCategory}` : ''}. Crea uno para empezar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {Object.entries(groupedExtras).map(([key, group]) => {
            // Si el grupo tiene múltiples filas, mostrar agrupado
            const first = group[0];
            const hasMultiple = group.length > 1;
            const allActive = group.every(e => e.activo);
            const someActive = group.some(e => e.activo);

            return (
              <Card key={key} className={!someActive ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{first.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {first.categoria} • Orden: {first.orden}
                      </p>
                      {/* Mostrar productos asignados */}
                      <div className="text-xs text-muted-foreground mt-1">
                        {group.some(e => !e.product_id) ? (
                          <span className="text-primary font-medium">Toda la categoría</span>
                        ) : (
                          <span>
                            Productos: {group.map(e => getProductName(e.product_id)).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-secondary text-sm">
                      +${Number(first.precio_usd).toFixed(2)}
                    </span>
                  </div>

                  {/* Filas individuales para editar/eliminar */}
                  <div className="mt-2 space-y-1">
                    {group.map(extra => (
                      <div key={extra.id} className="flex items-center gap-2 pl-2 border-l-2 border-muted">
                        <Switch
                          checked={extra.activo}
                          onCheckedChange={activo => toggleActiveMutation.mutate({ id: extra.id, activo })}
                          className="scale-75"
                        />
                        <span className="text-xs flex-1 text-muted-foreground">
                          {extra.product_id ? getProductName(extra.product_id) : 'Toda la categoría'}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(extra)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm('¿Eliminar este extra?')) deleteMutation.mutate(extra.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
