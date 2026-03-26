import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MenuItem } from '@/types/menu';

export interface CartItem {
  id: string;
  nombre: string;
  precio_usd: number;
  imagen: string;
  quantity: number;
  categoria: string;
  notes?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: MenuItem) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  subtotal: number;
  isProductOrderable: (product: MenuItem) => boolean;
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
  // CORRECCIÓN CRÍTICA [CART-STORAGE]: Lectura de localStorage envuelta en
  // try/catch. Sin esta protección, si 'catarsis_cart' contiene JSON inválido
  // o corrupto, React falla antes del primer render y la página queda en blanco.
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      // Validar que sea un array antes de usarlo
      if (!Array.isArray(parsed)) {
        console.warn('CartContext: catarsis_cart no es un array, limpiando storage');
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }
      // Filter out items with invalid IDs (non-UUID format)
      return parsed.filter(item => isValidUUID(item.id));
    } catch (error) {
      // Si el JSON está corrupto, limpiar y arrancar con carrito vacío
      console.warn('CartContext: Error al leer catarsis_cart, limpiando storage:', error);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  // CORRECCIÓN [CART-PERSIST]: setItem envuelto en try/catch.
  // Si falla el guardado (storage lleno o bloqueado), la UI sigue funcionando.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('CartContext: No se pudo guardar el carrito:', error);
    }
  }, [items]);

  const isProductOrderable = useCallback((product: MenuItem): boolean => {
    // Check if category is in non-orderable list
    const categoryLower = product.categoria.toLowerCase();
    if (NON_ORDERABLE_CATEGORIES.includes(categoryLower)) {
      return false;
    }
    // Also check is_orderable field if it exists
    if ('is_orderable' in product && product.is_orderable === false) {
      return false;
    }
    return true;
  }, []);

  const addToCart = useCallback((product: MenuItem): boolean => {
    if (!isProductOrderable(product)) {
      return false;
    }

    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
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

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback((productId: string): number => {
    return items.find(item => item.id === productId)?.quantity || 0;
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.precio_usd * item.quantity, 0);

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
