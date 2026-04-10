// FEATURE [EXTRAS]: CartContext extendido con soporte de extras/add-ons.
// Cada CartItem puede tener un array de extras seleccionados que se
// suman automáticamente al subtotal. Las funciones addExtra/removeExtra
// permiten gestionar extras por producto sin afectar la lógica base.
//
// CORRECCIÓN CRÍTICA [CART-STORAGE]: Lectura de localStorage envuelta en
// try/catch. Sin esta protección, si 'catarsis_cart' contiene JSON inválido
// o corrupto, React falla antes del primer render y la página queda en blanco.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MenuItem } from '@/types/menu';

// [2026-04-08] SOURCE TRACKING: Registra de dónde se agrega cada producto al carrito.
// Valores posibles: 'menu' | 'best_seller' | 'suggestion' | 'search' | 'extras'
// Se persiste en order_items.source al completar el pedido.
// Para agregar un origen nuevo: añadir al tipo CartItemSource.
// [2026-04-10] Sources ampliados para mayor granularidad
// en el dashboard de comportamiento: product_page y category.
export type CartItemSource = 'menu' | 'best_seller' | 'suggestion' | 'search' | 'extras' | 'product_page' | 'category';

// FEATURE [EXTRAS]: Tipo para extras seleccionados en el carrito
export interface CartItemExtra {
  extraId: string;
  nombre: string;
  precio_usd: number;
}

export interface CartItem {
  id: string;
  nombre: string;
  precio_usd: number;
  imagen: string;
  quantity: number;
  categoria: string;
  notes?: string;
  // FEATURE [EXTRAS]: extras seleccionados para este producto
  extras?: CartItemExtra[];
  // [2026-04-08] SOURCE TRACKING: origen de la primera adición al carrito
  source: CartItemSource;
}

interface CartContextType {
  items: CartItem[];
  // [2026-04-08] SOURCE TRACKING: segundo parámetro opcional con default 'menu'
  addToCart: (product: MenuItem, source?: CartItemSource) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  subtotal: number;
  isProductOrderable: (product: MenuItem) => boolean;
  // FEATURE [EXTRAS]: funciones para gestionar extras
  addExtra: (productId: string, extra: CartItemExtra) => void;
  removeExtra: (productId: string, extraId: string) => void;
  getItemExtras: (productId: string) => CartItemExtra[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'catarsis_cart';

// Categories that cannot be ordered (for pickup only)
const NON_ORDERABLE_CATEGORIES: string[] = [];

// Simple UUID validation
const isValidUUID = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        console.warn('CartContext: catarsis_cart no es un array, limpiando storage');
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      return parsed.filter(item => isValidUUID(item.id));
    } catch (error) {
      console.warn('CartContext: Error al leer catarsis_cart, limpiando storage:', error);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  // CORRECCIÓN [CART-PERSIST]: setItem envuelto en try/catch.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('CartContext: No se pudo guardar el carrito:', error);
    }
  }, [items]);

  const isProductOrderable = useCallback((product: MenuItem): boolean => {
    const categoryLower = product.categoria.toLowerCase();
    if (NON_ORDERABLE_CATEGORIES.includes(categoryLower)) return false;
    if ('is_orderable' in product && product.is_orderable === false) return false;
    return true;
  }, []);

  // [2026-04-08] SOURCE TRACKING: Si no se especifica source, asume 'menu'.
  // El source registra la PRIMERA interacción. Si el usuario encontró
  // el producto en best sellers y luego incrementa cantidad desde el carrito,
  // el source sigue siendo 'best_seller'.
  const addToCart = useCallback((product: MenuItem, source: CartItemSource = 'menu'): boolean => {
    if (!isProductOrderable(product)) return false;

    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // NO cambiar el source original al incrementar cantidad
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        nombre: product.nombre,
        precio_usd: product.precio_usd,
        imagen: product.imagen,
        quantity: 1,
        categoria: product.categoria,
        source,
      }];
    });
    return true;
  }, [isProductOrderable]);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const updateItemNotes = useCallback((productId: string, notes: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, notes: notes.slice(0, 200) } : item
      )
    );
  }, []);

  // FEATURE [EXTRAS]: Agregar un extra a un producto del carrito
  const addExtra = useCallback((productId: string, extra: CartItemExtra) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== productId) return item;
        const currentExtras = item.extras || [];
        // Evitar duplicados
        if (currentExtras.some(e => e.extraId === extra.extraId)) return item;
        return { ...item, extras: [...currentExtras, extra] };
      })
    );
  }, []);

  // FEATURE [EXTRAS]: Quitar un extra de un producto del carrito
  const removeExtra = useCallback((productId: string, extraId: string) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== productId) return item;
        return {
          ...item,
          extras: (item.extras || []).filter(e => e.extraId !== extraId),
        };
      })
    );
  }, []);

  // FEATURE [EXTRAS]: Obtener extras de un producto
  const getItemExtras = useCallback((productId: string): CartItemExtra[] => {
    return items.find(item => item.id === productId)?.extras || [];
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback((productId: string): number => {
    return items.find(item => item.id === productId)?.quantity || 0;
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // FEATURE [EXTRAS]: El subtotal incluye el precio de los extras multiplicado por la cantidad
  const subtotal = items.reduce((sum, item) => {
    const extrasTotal = (item.extras || []).reduce((eSum, e) => eSum + e.precio_usd, 0);
    return sum + (item.precio_usd + extrasTotal) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateItemNotes,
      clearCart,
      getItemQuantity,
      totalItems,
      subtotal,
      isProductOrderable,
      addExtra,
      removeExtra,
      getItemExtras,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
