import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MenuItem } from '@/types/menu';

export interface CartItem {
  id: string;
  nombre: string;
  precio_usd: number;
  imagen: string;
  quantity: number;
  categoria: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: MenuItem) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  subtotal: number;
  isProductOrderable: (product: MenuItem) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'catarsis_cart';

// Categories that cannot be ordered (for pickup only)
const NON_ORDERABLE_CATEGORIES = ['cocteleria', 'cocteles', 'cocktails'];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
