import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Layers, GripVertical, Pencil, Trash2, Info } from 'lucide-react';
import { useCategories, Category, CategoryInsert, CategoryUpdate } from '@/hooks/useCategories';
import * as LucideIcons from 'lucide-react';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Available icons for categories
const AVAILABLE_ICONS = [
  'Utensils', 'UtensilsCrossed', 'Soup', 'Beef', 'Sandwich', 'Pizza', 
  'Flame', 'Salad', 'Wine', 'Beer', 'Coffee', 'Cake', 'IceCream',
  'Cookie', 'Croissant', 'Egg', 'Fish', 'Drumstick', 'Cherry',
  'Apple', 'Carrot', 'Milk', 'GlassWater', 'Martini', 'CupSoda'
];

const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> => {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const IconComponent = icons[iconName];
  return IconComponent || LucideIcons.Utensils;
};

interface SortableCategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const SortableCategoryRow = ({ category, onEdit, onDelete }: SortableCategoryRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = getIconComponent(category.icono);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-4 p-4 bg-card border border-border rounded-lg
        ${isDragging ? 'opacity-50 shadow-lg z-50' : ''}
        ${!category.activo ? 'opacity-60' : ''}
      `}
    >
      {/* Drag Handle */}
      <button
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground truncate">{category.nombre}</h3>
          {!category.activo && (
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
              Inactiva
            </span>
          )}
        </div>
        {category.descripcion && (
          <p className="text-sm text-muted-foreground truncate">{category.descripcion}</p>
        )}
        <p className="text-xs text-muted-foreground">slug: {category.slug}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(category)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(category)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface CategoryFormData {
  nombre: string;
  slug: string;
  descripcion: string;
  icono: string;
  activo: boolean;
}

const initialFormData: CategoryFormData = {
  nombre: '',
  slug: '',
  descripcion: '',
  icono: 'Utensils',
  activo: true,
};

export const CategoriesPanel = () => {
  const { categories, loading, createCategory, updateCategory, deleteCategory, updateCategoryOrder } = useCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      nombre: value,
      slug: editingCategory ? prev.slug : generateSlug(value),
    }));
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData(initialFormData);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nombre: category.nombre,
      slug: category.slug,
      descripcion: category.descripcion || '',
      icono: category.icono,
      activo: category.activo,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.slug.trim()) {
      return;
    }

    setSaving(true);

    if (editingCategory) {
      const updates: CategoryUpdate = {
        nombre: formData.nombre.trim(),
        slug: formData.slug.trim(),
        descripcion: formData.descripcion.trim() || null,
        icono: formData.icono,
        activo: formData.activo,
      };
      await updateCategory(editingCategory.id, updates);
    } else {
      const newCategory: CategoryInsert = {
        nombre: formData.nombre.trim(),
        slug: formData.slug.trim(),
        descripcion: formData.descripcion.trim() || null,
        icono: formData.icono,
        activo: formData.activo,
        orden: categories.length + 1,
      };
      await createCategory(newCategory);
    }

    setSaving(false);
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData(initialFormData);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    await deleteCategory(deletingCategory.id);
    setDeletingCategory(null);
  };

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex(c => c.id === active.id);
    const newIndex = categories.findIndex(c => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(categories, oldIndex, newIndex);
    await updateCategoryOrder(reordered.map(c => c.id));
  }, [categories, updateCategoryOrder]);

  const IconPreview = getIconComponent(formData.icono);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Secciones del Menú</h2>
          <p className="text-sm text-muted-foreground">
            {categories.length} categorías configuradas
          </p>
        </div>
        <Button onClick={handleAddCategory} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nueva Sección
        </Button>
      </div>

      {/* Drag & Drop hint */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <Info className="h-4 w-4 shrink-0" />
        <span>Arrastra las secciones para cambiar el orden en que aparecen en el menú.</span>
      </div>

      {categories.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No hay secciones configuradas.
              <br />
              Agrega tu primera sección para organizar el menú.
            </p>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {categories.map((category) => (
                <SortableCategoryRow
                  key={category.id}
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={setDeletingCategory}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Category Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Sección' : 'Nueva Sección'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Hamburguesas"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Identificador (slug) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="hamburguesas"
                required
              />
              <p className="text-xs text-muted-foreground">
                Usado internamente. Solo letras minúsculas, números y guiones.
              </p>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción opcional de la sección"
                rows={2}
              />
            </div>

            {/* Ícono */}
            <div className="space-y-2">
              <Label>Ícono</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                  <IconPreview className="h-6 w-6" />
                </div>
                <Select
                  value={formData.icono}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icono: value }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar ícono" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ICONS.map((iconName) => {
                      const Icon = getIconComponent(iconName);
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{iconName}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Activo */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="activo">Visible en el menú</Label>
                <p className="text-xs text-muted-foreground">
                  Las secciones inactivas no se muestran a los clientes
                </p>
              </div>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.nombre.trim() || !formData.slug.trim()}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  editingCategory ? 'Guardar Cambios' : 'Crear Sección'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sección?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la sección "{deletingCategory?.nombre}". 
              Los productos asociados deberán ser reasignados a otra sección.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
