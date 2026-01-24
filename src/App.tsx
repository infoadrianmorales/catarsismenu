import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Legal from "./pages/Legal";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmed from "./pages/OrderConfirmed";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import NotFound from "./pages/NotFound";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const hideFloatingWhatsApp = location.pathname === '/admin' || location.pathname === '/auth';

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/producto/:slug" element={<ProductPage />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orden-confirmada" element={<OrderConfirmed />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideFloatingWhatsApp && <FloatingWhatsApp />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
