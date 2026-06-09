// FEATURE [EXTRAS-ADMIN]: Panel CRUD de extras/add-ons en el admin.
// [2026-06-09] REFACTOR: vista agrupada por categoría con acordeones + grid
// de tarjetas compactas + buscador. Reemplaza la lista plana que se veía
// "regada" cuando hay 30+ extras. Lógica de mutaciones y agrupación
// (nombre+categoria+precio) no cambia.

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Search, Users } from 'lucide-react';
import { Constants } from '@/integrations/supabase/types';

const CATEGORIES = Constants.public.Enums.product_category;

interface ExtraForm {
  nombre: string;
  precio_usd: string;
  categoria: string;
  product_ids: string[];
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

const formatCat = (c: string) => c.charAt(0).toUpperCase() + c.slice(1);

export const ExtrasPanel = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExtraForm>(defaultForm);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
        const { error } = await supabase
          .from('product_extras')
          .update(basePayload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        if (data.allCategory || data.product_ids.length === 0) {
          const { error } = await supabase
            .from('product_extras')
            .insert({ ...basePayload, product_id: null });
          if (error) throw error;
        } else {
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

  const deleteGroupMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('product_extras')
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product-extras'] });
      queryClient.invalidateQueries({ queryKey: ['product-extras'] });
      toast.success('Extra eliminado');
    },
    onError: (error: any) => toast.error(`Error: ${error.message}`),
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

  // Toggle todo el grupo (todas las filas con mismo nombre+cat+precio)
  const toggleGroupActiveMutation = useMutation({
    mutationFn: async ({ ids, activo }: { ids: string[]; activo: boolean }) => {
      const { error } = await supabase
        .from('product_extras')
        .update({ activo })
        .in('id', ids);
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

  const toggleProduct = (productId: string) => {
    setForm(prev => {
      const isSelected = prev.product_ids.includes(productId);
      return {
        ...prev,
        product_ids: isSelected
          ? prev.product_ids.filter(id => id !== productId)
          : [...prev.product_ids, productId],
        allCategory: false,
      };
    });
  };

  const toggleAllCategory = (checked: boolean) => {
    setForm(prev => ({
      ...prev,
      allCategory: checked,
      product_ids: checked ? [] : prev.product_ids,
    }));
  };

  const getProductName = (productId: string) => {
    const p = products.find(pr => pr.id === productId);
    return p?.nombre || 'Producto desconocido';
  };

  // Aplicar filtros (categoría + búsqueda por nombre)
  const filteredExtras = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return extras.filter(e => {
      if (filterCategory !== 'all' && e.categoria !== filterCategory) return false;
      if (term && !e.nombre.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [extras, filterCategory, searchTerm]);

  // Agrupar por categoría → luego por nombre+precio
  const byCategory = useMemo(() => {
    const out: Record<string, Record<string, any[]>> = {};
    for (const extra of filteredExtras) {
      const cat = extra.categoria;
      if (!out[cat]) out[cat] = {};
      const key = `${extra.nombre}__${extra.precio_usd}`;
      if (!out[cat][key]) out[cat][key] = [];
      out[cat][key].push(extra);
    }
    return out;
  }, [filteredExtras]);

  // Ordenar categorías: con extras primero (siguiendo orden del enum), luego vacías
  const categoryList = useMemo(() => {
    const withExtras: string[] = [];
    for (const cat of CATEGORIES) {
      if (byCategory[cat] && Object.keys(byCategory[cat]).length > 0) {
        withExtras.push(cat);
      }
    }
    return withExtras;
  }, [byCategory]);

  // Default: primera categoría con extras abierta; si filtran, abre esa
  const defaultOpen = useMemo(() => {
    if (filterCategory !== 'all') return [filterCategory];
    return categoryList.length > 0 ? [categoryList[0]] : [];
  }, [filterCategory, categoryList]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
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
                      <SelectItem key={cat} value={cat}>{formatCat(cat)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.categoria && (
                <div>
                  <Label className="mb-2 block">Aplica a:</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
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

      {/* Toolbar: buscador + filtro categoría */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar extra por nombre…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{formatCat(cat)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista agrupada por categoría */}
      {categoryList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchTerm || filterCategory !== 'all'
              ? 'No hay extras que coincidan con los filtros.'
              : 'No hay extras configurados. Crea uno para empezar.'}
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" defaultValue={defaultOpen} className="space-y-3">
          {categoryList.map(cat => {
            const groups = Object.values(byCategory[cat]);
            const totalRows = groups.reduce((sum, g) => sum + g.length, 0);
            const activeRows = groups.reduce(
              (sum, g) => sum + g.filter((e: any) => e.activo).length,
              0
            );

            return (
              <AccordionItem
                key={cat}
                value={cat}
                className="border rounded-lg bg-card px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-display font-bold text-base">
                      {formatCat(cat)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {groups.length} {groups.length === 1 ? 'extra' : 'extras'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activeRows}/{totalRows} activos
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2 pb-3">
                    {groups.map((group: any[]) => {
                      const first = group[0];
                      const allActive = group.every(e => e.activo);
                      const someActive = group.some(e => e.activo);
                      const isCategoryWide = group.some(e => !e.product_id);
                      const productCount = group.filter(e => e.product_id).length;
                      const groupIds = group.map(e => e.id);
                      const groupKey = `${first.nombre}__${first.precio_usd}`;

                      return (
                        <Card
                          key={groupKey}
                          className={`relative ${!someActive ? 'opacity-60' : ''}`}
                        >
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-sm leading-tight flex-1">
                                {first.nombre}
                              </p>
                              <span className="font-bold text-secondary text-sm whitespace-nowrap">
                                +${Number(first.precio_usd).toFixed(2)}
                              </span>
                            </div>

                            {/* Alcance */}
                            <div className="text-xs">
                              {isCategoryWide ? (
                                <span className="inline-flex items-center gap-1 text-primary font-medium">
                                  Toda la categoría
                                </span>
                              ) : (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                                      <Users className="h-3 w-3" />
                                      {productCount}{' '}
                                      {productCount === 1 ? 'producto' : 'productos'}
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64 text-xs">
                                    <p className="font-medium mb-2">Aplica a:</p>
                                    <ul className="space-y-1 max-h-48 overflow-y-auto">
                                      {group.map(e => (
                                        <li key={e.id} className="text-muted-foreground">
                                          • {getProductName(e.product_id)}
                                        </li>
                                      ))}
                                    </ul>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>

                            {/* Footer: switch + acciones */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={allActive}
                                  onCheckedChange={(activo) =>
                                    toggleGroupActiveMutation.mutate({ ids: groupIds, activo })
                                  }
                                  className="scale-90"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {allActive ? 'Activo' : someActive ? 'Parcial' : 'Inactivo'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEdit(first)}
                                  title="Editar"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => {
                                    const msg = group.length > 1
                                      ? `¿Eliminar este extra de ${group.length} productos?`
                                      : '¿Eliminar este extra?';
                                    if (confirm(msg)) {
                                      if (group.length > 1) {
                                        deleteGroupMutation.mutate(groupIds);
                                      } else {
                                        deleteMutation.mutate(first.id);
                                      }
                                    }
                                  }}
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};
