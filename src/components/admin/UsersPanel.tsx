import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Shield } from 'lucide-react';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(72),
});

export const UsersPanel = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { session } = useAuth();
  const { toast } = useToast();

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
        body: { email, password },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Usuario creado',
        description: `El administrador ${email} ha sido creado exitosamente`,
      });

      // Clear form
      setEmail('');
      setPassword('');
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

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-primary" />
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

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-base">Información</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Los nuevos usuarios tendrán acceso completo al panel de administración.</p>
          <p>• La contraseña debe tener al menos 6 caracteres.</p>
          <p>• El email debe ser único y válido.</p>
        </CardContent>
      </Card>
    </div>
  );
};
