import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { ViewModeProvider } from "@/contexts/ViewModeContext";
import { Skeleton } from "@/components/ui/skeleton";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { FloatingCart } from "./components/FloatingCart";
import { MetaPixelProvider } from "./components/MetaPixelProvider";
import { ScrollToTop } from "./components/ScrollToTop";
import { MetricoolProvider } from "./components/MetricoolProvider";
import { useVisitorTracker } from "./hooks/useVisitorTracker";

// Lazy load non-critical pages
const Legal = lazy(() => import("./pages/Legal"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmed = lazy(() => import("./pages/OrderConfirmed"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const MenuLocal = lazy(() => import("./pages/MenuLocal"));

// Configure QueryClient with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes default stale time
      gcTime: 5 * 60 * 1000, // 5 minutes cache time
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback for lazy pages
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  </div>
);

const AppContent = () => {
  useVisitorTracker();

  return (
    <ViewModeProvider>
      <MetaPixelProvider>
        <ScrollToTop />
        <MetricoolProvider />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<Navigate to="/" replace />} />
            <Route path="/local" element={<MenuLocal />} />
          <Route path="/categoria/:slug" element={<CategoryPage />} />
          {/* Short category URLs for Meta Ads */}
          <Route path="/best-seller" element={<CategoryPage />} />
          <Route path="/hamburguesas" element={<CategoryPage />} />
          <Route path="/pizzas" element={<CategoryPage />} />
          <Route path="/emparedados" element={<CategoryPage />} />
          <Route path="/parrilla" element={<CategoryPage />} />
          <Route path="/entradas" element={<CategoryPage />} />
          <Route path="/ensaladas" element={<CategoryPage />} />
          <Route path="/cocteleria" element={<CategoryPage />} />
            <Route path="/producto/:slug" element={<ProductPage />} />
            <Route path="/terminos-y-condiciones" element={<Legal />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orden-confirmada" element={<OrderConfirmed />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <FloatingCart />
      </MetaPixelProvider>
    </ViewModeProvider>
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
