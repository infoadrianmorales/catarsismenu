import { MenuItem } from '@/types/menu';
import burgerClassic from '@/assets/burger-classic.jpg';
import pizzaFeature from '@/assets/pizza-feature.jpg';
import cocktailFeature from '@/assets/cocktail-feature.jpg';
import wingsAppetizer from '@/assets/wings-appetizer.jpg';

export const menuItems: MenuItem[] = [
  // Burgers
  {
    id: 'burger-1',
    name: 'Catarsis Burger',
    description: 'Nuestra hamburguesa insignia con carne angus, queso cheddar, bacon ahumado, cebolla caramelizada y salsa especial de la casa.',
    priceUSD: 12.50,
    category: 'burgers',
    image: burgerClassic,
    featured: true,
  },
  {
    id: 'burger-2',
    name: 'BBQ Bacon Burger',
    description: 'Carne jugosa, bacon crujiente, queso americano, aros de cebolla y salsa BBQ ahumada.',
    priceUSD: 13.00,
    category: 'burgers',
    image: burgerClassic,
  },
  {
    id: 'burger-3',
    name: 'Veggie Delight',
    description: 'Hamburguesa vegetariana con quinoa, espinacas, champiñones portobello y aguacate fresco.',
    priceUSD: 11.00,
    category: 'burgers',
    image: burgerClassic,
  },
  {
    id: 'burger-4',
    name: 'Double Trouble',
    description: 'Doble carne, doble queso, doble bacon. Para los que no se conforman con poco.',
    priceUSD: 15.50,
    category: 'burgers',
    image: burgerClassic,
  },
  
  // Pizzas
  {
    id: 'pizza-1',
    name: 'Pepperoni Clásica',
    description: 'La favorita de todos. Salsa de tomate casera, mozzarella premium y generoso pepperoni.',
    priceUSD: 14.00,
    category: 'pizzas',
    image: pizzaFeature,
    featured: true,
  },
  {
    id: 'pizza-2',
    name: 'Cuatro Quesos',
    description: 'Mezcla perfecta de mozzarella, parmesano, gorgonzola y queso de cabra.',
    priceUSD: 15.50,
    category: 'pizzas',
    image: pizzaFeature,
  },
  {
    id: 'pizza-3',
    name: 'Hawaiana Gourmet',
    description: 'Jamón premium, piña caramelizada, mozzarella y toque de miel.',
    priceUSD: 13.50,
    category: 'pizzas',
    image: pizzaFeature,
  },
  
  // Cocktails
  {
    id: 'cocktail-1',
    name: 'Catarsis Signature',
    description: 'Nuestro cóctel especial con vodka premium, frutos rojos, menta fresca y toque cítrico.',
    priceUSD: 9.00,
    category: 'cocktails',
    image: cocktailFeature,
    featured: true,
  },
  {
    id: 'cocktail-2',
    name: 'Mojito de Frambuesa',
    description: 'Ron blanco, frambuesas frescas, menta, limón y agua con gas.',
    priceUSD: 8.50,
    category: 'cocktails',
    image: cocktailFeature,
  },
  {
    id: 'cocktail-3',
    name: 'Margarita Premium',
    description: 'Tequila reposado, triple sec, limón fresco y sal de mar en el borde.',
    priceUSD: 10.00,
    category: 'cocktails',
    image: cocktailFeature,
  },
  {
    id: 'cocktail-4',
    name: 'Piña Colada Tropical',
    description: 'Ron añejo, crema de coco, jugo de piña fresca y hielo frappe.',
    priceUSD: 9.50,
    category: 'cocktails',
    image: cocktailFeature,
  },
  
  // Entradas
  {
    id: 'entrada-1',
    name: 'Alitas BBQ',
    description: 'Alitas de pollo crujientes bañadas en nuestra salsa BBQ casera, servidas con aderezo ranch.',
    priceUSD: 10.00,
    category: 'entradas',
    image: wingsAppetizer,
    featured: true,
  },
  {
    id: 'entrada-2',
    name: 'Nachos Supreme',
    description: 'Nachos crujientes con queso fundido, guacamole, pico de gallo, jalapeños y crema.',
    priceUSD: 11.50,
    category: 'entradas',
    image: wingsAppetizer,
  },
  {
    id: 'entrada-3',
    name: 'Tequeños de Queso',
    description: 'Crujientes tequeños rellenos de queso venezolano, servidos con salsas variadas.',
    priceUSD: 8.50,
    category: 'entradas',
    image: wingsAppetizer,
  },
  {
    id: 'entrada-4',
    name: 'Deditos de Mozzarella',
    description: 'Bastones de mozzarella empanizados con salsa marinara picante.',
    priceUSD: 9.00,
    category: 'entradas',
    image: wingsAppetizer,
  },
];
