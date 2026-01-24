import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Settings, Package, Megaphone, Users, Layers, ShoppingBag, UserCheck } from 'lucide-react';
import { ConfigPanel } from '@/components/admin/ConfigPanel';
import { ProductsPanel } from '@/components/admin/ProductsPanel';
import { PromotionsPanel } from '@/components/admin/PromotionsPanel';
import { UsersPanel } from '@/components/admin/UsersPanel';
import { CategoriesPanel } from '@/components/admin/CategoriesPanel';
import { OrdersPanel } from '@/components/admin/OrdersPanel';
import { CustomersPanel } from '@/components/admin/CustomersPanel';

const Admin = () => {
  const { user, isAdmin, loading, roleLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !roleLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, roleLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display text-foreground">
              Panel de Administración
            </h1>
            <p className="text-sm text-muted-foreground">
              Catarsis Lechería
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Órdenes</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Secciones</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Productos</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Promos</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersPanel />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersPanel />
          </TabsContent>

          <TabsContent value="config">
            <ConfigPanel />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesPanel />
          </TabsContent>

          <TabsContent value="products">
            <ProductsPanel />
          </TabsContent>

          <TabsContent value="promotions">
            <PromotionsPanel />
          </TabsContent>

          <TabsContent value="users">
            <UsersPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
