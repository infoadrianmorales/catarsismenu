import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, RefreshCw, CreditCard, DollarSign, Banknote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  label: string;
  enabled: boolean;
  supports_usd: boolean;
  supports_ves: boolean;
  instructions_usd: string | null;
  instructions_ves: string | null;
  display_order: number;
}

export const PaymentMethodsPanel = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchMethods = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Error al cargar métodos de pago');
      console.error(error);
    } else {
      setMethods(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleToggle = async (id: string, field: 'enabled' | 'supports_usd' | 'supports_ves', value: boolean) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
    
    const { error } = await supabase
      .from('payment_methods')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      toast.error('Error al actualizar');
      fetchMethods();
    } else {
      toast.success('Actualizado');
    }
  };

  const handleInstructionsChange = (id: string, field: 'instructions_usd' | 'instructions_ves', value: string) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSaveInstructions = async (id: string) => {
    setSaving(id);
    const method = methods.find(m => m.id === id);
    if (!method) return;

    const { error } = await supabase
      .from('payment_methods')
      .update({
        instructions_usd: method.instructions_usd,
        instructions_ves: method.instructions_ves,
      })
      .eq('id', id);

    if (error) {
      toast.error('Error al guardar instrucciones');
    } else {
      toast.success('Instrucciones guardadas');
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Métodos de Pago</h2>
          <p className="text-muted-foreground">
            Configura los datos bancarios y monedas soportadas por cada método
          </p>
        </div>
        <Button variant="outline" onClick={fetchMethods} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-6">
        {methods.map((method) => (
          <Card key={method.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{method.label}</CardTitle>
                    <CardDescription>ID: {method.id}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`enabled-${method.id}`} className="text-sm text-muted-foreground">
                    Activo
                  </Label>
                  <Switch
                    id={`enabled-${method.id}`}
                    checked={method.enabled}
                    onCheckedChange={(checked) => handleToggle(method.id, 'enabled', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency Support */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-secondary" />
                  <Label htmlFor={`usd-${method.id}`} className="text-sm">Soporta USD</Label>
                  <Switch
                    id={`usd-${method.id}`}
                    checked={method.supports_usd}
                    onCheckedChange={(checked) => handleToggle(method.id, 'supports_usd', checked)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Banknote className="h-4 w-4 text-accent" />
                  <Label htmlFor={`ves-${method.id}`} className="text-sm">Soporta VES</Label>
                  <Switch
                    id={`ves-${method.id}`}
                    checked={method.supports_ves}
                    onCheckedChange={(checked) => handleToggle(method.id, 'supports_ves', checked)}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="grid md:grid-cols-2 gap-4">
                {method.supports_usd && (
                  <div className="space-y-2">
                    <Label htmlFor={`instructions-usd-${method.id}`}>
                      Instrucciones para pago en USD
                    </Label>
                    <Textarea
                      id={`instructions-usd-${method.id}`}
                      value={method.instructions_usd || ''}
                      onChange={(e) => handleInstructionsChange(method.id, 'instructions_usd', e.target.value)}
                      placeholder="Ingresa los datos para pago en USD..."
                      rows={5}
                      className="font-mono text-sm"
                    />
                  </div>
                )}
                {method.supports_ves && (
                  <div className="space-y-2">
                    <Label htmlFor={`instructions-ves-${method.id}`}>
                      Instrucciones para pago en VES
                    </Label>
                    <Textarea
                      id={`instructions-ves-${method.id}`}
                      value={method.instructions_ves || ''}
                      onChange={(e) => handleInstructionsChange(method.id, 'instructions_ves', e.target.value)}
                      placeholder="Ingresa los datos para pago en Bolívares..."
                      rows={5}
                      className="font-mono text-sm"
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleSaveInstructions(method.id)}
                disabled={saving === method.id}
                className="gap-2"
              >
                {saving === method.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar Instrucciones
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
