import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Shield, Trash2, ShieldCheck } from 'lucide-react';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const userSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(72),
});

interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  is_protected: boolean;
}

export const UsersPanel = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: { action: 'list' },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setUsers(data.users || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: 'Error al cargar usuarios',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = () => {
    try {
      userSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: { action: 'create', email, password },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Usuario creado',
        description: `El administrador ${email} ha sido creado exitosamente`,
      });

      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: 'Error al crear usuario',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    setDeletingUserId(userId);

    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: { action: 'delete', user_id: userId },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Usuario eliminado',
        description: `El administrador ${userEmail} ha sido eliminado`,
      });

      fetchUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: 'Error al eliminar usuario',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create User Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <UserPlus className="h-5 w-5 text-primary" />
            Crear Administrador
          </CardTitle>
          <CardDescription>
            Agrega nuevos usuarios con acceso al panel de administración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="nuevo@catarsis.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Crear Administrador
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-primary" />
            Usuarios Administradores
          </CardTitle>
          <CardDescription>
            Lista de usuarios con acceso al panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay usuarios administradores
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex items-center gap-3">
                    {user.is_protected ? (
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.role} • {new Date(user.created_at).toLocaleDateString('es-ES')}
                        {user.is_protected && ' • Protegido'}
                      </p>
                    </div>
                  </div>
                  
                  {!user.is_protected && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingUserId === user.id}
                        >
                          {deletingUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar administrador?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente al usuario <strong>{user.email}</strong> y
                            no podrá acceder más al panel de administración.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
