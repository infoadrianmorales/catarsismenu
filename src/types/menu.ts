// Dynamic category type - now loaded from database
export type MenuCategory = string;

// Category interface for public menu display
export interface PublicCategory {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  icono: string;
  orden: number;
}

export interface MenuItem {
  id: string;
  nombre: string;
  slug: string;
  descripcion_corta: string;
  precio_usd: number;
  categoria: Exclude<MenuCategory, 'todos'>;
  imagen: string;
  ratio: '1x1' | '4x5';
  tags: string[];
  orden: number;
  destacado?: boolean;
  is_orderable?: boolean;
}

export type Currency = 'USD' | 'VES';

export interface AppConfig {
  tasa_ves: number;
  whatsapp: string;
  instagram_url: string;
  tiktok_url?: string;
  maps_url: string;
}

export interface CartItem {
  producto: MenuItem;
  cantidad: number;
  comentarios?: string;
}
