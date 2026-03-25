{/* ================================================
    PÁGINA /menu — CATARSIS DRINKS & FOOD
    URL independiente para SEO e indexación por IA.

    REGLA: Esta página NO debe redirigir a la home.
    Google la indexa como URL separada con contenido propio.
    Las IAs referencian platos y precios desde esta URL.

    Al actualizar precios o platos, también actualizar:
    - src/components/RestaurantSchema.tsx (mentions + MenuSections)
    - src/components/FAQSchema.tsx (precios en respuestas)
    - public/llms.txt (menu_highlights)
    - public/sitemap.xml (campo lastmod)
    ================================================ */}

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';

/* ------------------------------------------------
   Datos del menú — carta verificada marzo 2026
   REGLA: No inventar precios ni platos.
   ------------------------------------------------ */

interface MenuItem {
  name: string;
  description: string;
  price: string;
}

interface MenuCategory {
  title: string;
  startingPrice: string;
  items: MenuItem[];
}

const menuData: MenuCategory[] = [
  {
    title: 'Hamburguesas',
    startingPrice: '$7.99',
    items: [
      { name: 'Double Cheesy', description: 'Dos carnes smash de 80g cada una, fundidas en doble capa de queso, acompañadas de cebolla grillada caramelizada y salsa relish.', price: '$7.99' },
      { name: 'Chicken Mayo', description: 'Pechuga de pollo frito dorado, lechuga picada en trozos pequeños, mayonesa artesanal, queso facilista derretido y tocineta crujiente.', price: '$7.99' },
      { name: 'Thousand Cheesy', description: 'Doble carne smash de 80g con costra perfecta, lechuga fresca, queso facilista derretido, pepinillos encurtidos y salsa Thousand Island.', price: '$8.50' },
      { name: 'Chicken Crunch', description: 'Pechuga de pollo ultra crujiente, tocineta ahumada, queso cheddar fundido, pepinillos encurtidos y vegetales frescos, finalizada con salsa tártara artesanal.', price: '$8.99' },
      { name: 'Chicken Spicy', description: 'Pechuga de pollo frito con el toque justo de picante de la casa, queso cheddar fundido, tocineta ahumada, pepinillos y vegetales frescos: cebolla, tomate y lechuga.', price: '$8.99' },
      { name: 'Shrimp Crunch', description: 'Langostinos frescos con rebozado crocante artesanal, vegetales frescos, pepinillos y reducción de balsámico con salsa tártara.', price: '$8.99' },
      { name: 'Clásica Americana', description: '150g de jugosa carne de solomo, queso cheddar fundido, tocineta crujiente, pepinillos, ketchup, mayonesa artesanal y vegetales frescos.', price: '$9.99' },
      { name: 'Honeyholic Burger', description: 'Pollo crispy bañado en miel con salsa Cholula, quesos cheddar y manchego fundidos, tocineta crujiente y vegetales frescos. El contraste dulce-picante perfecto.', price: '$9.99' },
      { name: 'Texmex', description: '150g de solomo con jalapeños frescos, queso cheddar fundido, cebolla caramelizada, tocineta crujiente, pimentón ahumado y vegetales frescos.', price: '$9.99' },
      { name: 'Onion Queen', description: '150g de solomo con cebolla crunch, queso cheddar fundido, tocineta crujiente, vegetales frescos y salsa tártara artesanal.', price: '$9.99' },
      { name: 'BBQ Champions', description: '150g de solomo bañado en salsa BBQ de la casa, coronado con salsa de queso azul con champiñones salteados, tocineta crujiente y vegetales frescos.', price: '$10.50' },
      { name: 'Smash', description: 'Doble carne smash (300g) con costra perfecta, doble capa de cheddar fundido, tocineta crujiente, pepinillos y vegetales frescos: cebolla, tomate y lechuga.', price: '$13.99' },
      { name: 'Thousand Smash', description: 'Triple carne smash (300g) con costra perfecta, tres capas de cheddar —una por cada carne—, tocineta crujiente, pepinillos y salsa Thousand Island.', price: '$13.99' },
    ],
  },
  {
    title: 'Emparedados',
    startingPrice: '$8.99',
    items: [
      { name: 'Chicken Crunch Americano', description: 'Pollo empanizado dorado y crujiente, queso cheddar fundido, tocineta crujiente, pepinillos, salsa tártara y vegetales frescos: cebolla, tomate y lechuga.', price: '$8.99' },
      { name: 'Perla Negra', description: 'Calamares con rebozado artesanal crocante, salsa tártara, pepinillos y vegetales frescos: cebolla, tomate y lechuga.', price: '$8.99' },
      { name: 'Chicken Cesar', description: 'Pollo crispy dorado, lechuga romana fresca, aderezo césar artesanal, queso manchego rallado y tocineta crujiente.', price: '$9.50' },
      { name: 'Fondue de Lomito', description: 'Tiras de lomito tierno sumergidas en fondue de queso azul con champiñones salteados, pepinillos y vegetales frescos: cebolla, tomate y lechuga. El más gourmet de la carta.', price: '$11.99' },
    ],
  },
  {
    title: 'Pizzas',
    startingPrice: '$7.99',
    items: [
      { name: 'Margarita', description: 'Salsa napoli, queso, jamón y maíz dulce', price: '$7.99' },
      { name: 'Pepperoni', description: 'Pizza clásica con generosas rodajas de pepperoni', price: '$8.50' },
      { name: 'Paradise', description: 'Jamón ahumado, pepperoni, tocineta y maíz', price: '$9.50' },
      { name: 'Hot Honey', description: 'Mozzarella, jamón ahumado, pepperoni y miel picante', price: '$9.50' },
      { name: 'Veggie', description: 'Cebolla morada, champiñones, aceitunas, berenjenas y manchego', price: '$9.99' },
      { name: 'Tasty', description: 'Jamón ahumado, tocineta, tomates secos, manchego y pesto', price: '$11.50' },
    ],
  },
  {
    title: 'Entradas',
    startingPrice: '$3.99',
    items: [
      { name: 'Aros de Cebolla', description: 'Aros de cebolla rebozados y fritos, perfectamente crocantes', price: '$3.99' },
      { name: 'Ración de Papas', description: '300g de papas fritas clásicas doradas y crujientes', price: '$3.99' },
      { name: 'Tequeños', description: '6 deditos de queso en masa artesanal frita', price: '$5.99' },
      { name: 'Papas con Queso Fundido', description: 'Papas fritas con queso fundido y tocineta crujiente', price: '$5.99' },
      { name: 'Animal Fries', description: 'Papas fritas con queso facilista, tocineta y cebolla caramelizada', price: '$7.50' },
      { name: 'Tenders de Pollo', description: '6 piezas de pechuga empanizada sobre papas fritas', price: '$7.50' },
      { name: 'Chili con Papas', description: 'Papas con chili de carne, jalapeños, cheddar y tocineta', price: '$7.99' },
      { name: 'Alitas de Pollo', description: 'Alitas crujientes o en salsa BBQ con papas fritas', price: '$8.99' },
      { name: 'Crispy Bites', description: 'Papas picantes con tenders, cheddar, tocineta y BBQ', price: '$8.99' },
      { name: 'Rebozados del Mar', description: 'Pescado, calamares y langostinos rebozados con papas', price: '$11.99' },
    ],
  },
  {
    title: 'Parrilla',
    startingPrice: '$10.99',
    items: [
      { name: 'Parrilla Mixta', description: 'Variedad de cortes de carne de res y pollo asados al punto perfecto. Ideal para compartir en grupo.', price: '$10.99' },
      { name: 'Parrilla de Pollo', description: 'Jugosa pechuga de pollo marinada con especias de la casa, asada a la parrilla con sabor ahumado característico.', price: '$10.99' },
      { name: 'Parrilla de Lomito', description: 'Tierno corte de lomito de res asado a la parrilla al punto perfecto, conservando todos sus jugos naturales.', price: '$11.99' },
      { name: 'Parrilla Mar y Tierra', description: 'Lo mejor de dos mundos: cortes de carne roja y mariscos frescos asados a la parrilla en un solo plato. Ideal para compartir.', price: '$15.50' },
      { name: 'Parrilla de Mariscos', description: 'Selección premium de frutos del mar frescos asados a la parrilla para resaltar su sabor natural.', price: '$15.50' },
    ],
  },
  {
    title: 'Ensaladas',
    startingPrice: '$7.49',
    items: [
      { name: 'César Clásica', description: 'Lechuga fresca, aderezo César artesanal, crutones y parmesano', price: '$7.49' },
      { name: 'César de Pollo', description: 'Ensalada César con pechuga de pollo grillada', price: '$8.99' },
      { name: 'César con Langostino', description: 'Ensalada César coronada con langostinos salteados', price: '$11.99' },
    ],
  },
  {
    title: 'Coctelería',
    startingPrice: '$4.99',
    items: [
      { name: 'Catarsis Punch', description: 'Ron añejo con parchita, naranja, limón y granadina', price: '$4.99' },
      { name: 'Spicy Tamarindo', description: 'Vodka tamarindo con limón, ají dulce y cilantro', price: '$4.99' },
      { name: 'Passion Fruit Mule', description: 'Vodka con parchita, limón y ginger beer', price: '$4.99' },
      { name: 'Whipped', description: 'Vodka Whipped con jarabe de parchita y limón', price: '$4.99' },
      { name: 'Le Fraisier', description: 'Ginebra con óleo de fresa, limón, bitter y soda', price: '$4.99' },
      { name: 'Flowers', description: 'Ginebra infusionada con Blue Butterfly y jarabe de flores', price: '$4.99' },
      { name: 'Rum Old Fashioned Tonic', description: 'Ron Cacique con azúcar, angostura y agua tónica', price: '$4.99' },
      { name: 'Sangría', description: 'Vino cabernet con ponsigué y frutas cítricas', price: '$4.99' },
      { name: 'Long Island Tea', description: 'Vodka, ginebra, ron, tequila, Triple Sec con limón', price: '$4.99' },
      { name: 'Margarita On the Rocks', description: 'Tequila y Triple Sec con limón y jarabe de fresa', price: '$4.99' },
      { name: 'Green Gin', description: 'Ginebra con Blue Curaçao y jugo de parchita', price: '$4.99' },
      { name: 'Southside Berry', description: 'Ginebra con limón, jarabe dulce y zumo de fresa', price: '$4.99' },
    ],
  },
  {
    title: 'Postres',
    startingPrice: '$5.99',
    items: [
      { name: 'Sweet Bites', description: 'Bocados dulces variados', price: '$5.99' },
      { name: 'Brownie con Helado', description: 'Brownie de chocolate tibio con bola de helado cremoso', price: '$6.99' },
    ],
  },
];

/* ------------------------------------------------
   Componente de sección de categoría
   ------------------------------------------------ */
const CategorySection = ({ category }: { category: MenuCategory }) => (
  <section className="mb-12">
    {/* Título de categoría con precio desde */}
    <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-6 border-b border-primary/30 pb-3">
      {category.title} <span className="text-secondary text-lg md:text-xl font-normal">— desde {category.startingPrice} USD</span>
    </h2>

    {/* Grid de platos: 1 col mobile, 2 col tablet+ */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
      {category.items.map((item) => (
        <article key={item.name} className="flex justify-between items-start gap-2 py-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base md:text-lg font-semibold text-foreground">
              {item.name}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {item.description}
            </p>
          </div>
          <span className="text-secondary font-bold text-base md:text-lg whitespace-nowrap shrink-0">
            {item.price}
          </span>
        </article>
      ))}
    </div>
  </section>
);

/* ------------------------------------------------
   Página principal /menu
   ------------------------------------------------ */
const Menu = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* META TAGS EXCLUSIVOS DE /menu
          Canonical apunta a /menu, no a /. */}
      <SEO
        title="Menú Completo"
        description="Carta completa de Catarsis Drinks & Food: hamburguesas artesanales desde $7.99 USD, pizzas desde $7.99, emparedados desde $8.99, parrilla, ensaladas y coctelería de autor desde $4.99. CC Aventura Plaza, Lechería, Anzoátegui."
        url="/menu"
      />

      {/* Navegación superior */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* H1 PRINCIPAL: Una sola vez por página */}
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center mb-4">
          Menú de Catarsis Drinks & Food
        </h1>
        <p className="text-center text-muted-foreground text-sm md:text-base mb-2">
          CC Aventura Plaza, Lechería, Anzoátegui
        </p>

        {/* Descripción introductoria para SEO/IA */}
        <p className="text-center text-muted-foreground text-sm md:text-base max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed">
          Carta completa de Catarsis: hamburguesas artesanales desde $7.99 USD,
          pizzas artesanales desde $7.99, emparedados desde $8.99, parrilla,
          ensaladas y coctelería de autor desde $4.99.
          Aceptamos Pago Móvil, Zelle, dólares, bolívares y tarjetas.
        </p>

        {/* 8 secciones de categoría */}
        {menuData.map((category) => (
          <CategorySection key={category.title} category={category} />
        ))}

        {/* Información de contacto y métodos de pago */}
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="font-display text-2xl font-bold text-primary mb-4">
            Cómo pedir en Catarsis
          </h2>
          <div className="space-y-3 text-muted-foreground text-sm md:text-base leading-relaxed">
            <p>
              Visítanos en CC Aventura Plaza, Lechería, Anzoátegui.
              Hacemos delivery en Lechería y zonas cercanas.
            </p>
            <p>
              Horario: lunes a jueves 12:00 PM – 11:00 PM,
              viernes y sábados 12:00 PM – 1:00 AM,
              domingos 12:00 PM – 10:00 PM.
            </p>
            <p>
              Métodos de pago aceptados: Pago Móvil, Zelle,
              efectivo en dólares (USD), bolívares (VES)
              y tarjetas de débito/crédito.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Menu;
