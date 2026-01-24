export type MenuCategory = 
  | 'todos' 
  | 'entradas' 
  | 'hamburguesas' 
  | 'emparedados' 
  | 'pizzas' 
  | 'parrilla' 
  | 'ensaladas' 
  | 'cocteleria' 
  | 'postres';

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
