export type MenuCategory = 'todos' | 'burgers' | 'pizzas' | 'cocktails' | 'entradas';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  category: MenuCategory;
  image: string;
  featured?: boolean;
}

export type Currency = 'USD' | 'VES';
