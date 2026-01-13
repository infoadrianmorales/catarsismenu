import { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, DollarSign, MessageCircle, Instagram, MapPin } from 'lucide-react';

export const ConfigPanel = () => {
  const { config, loading, updateConfig } = useConfig();
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    tasa_ves: '',
    whatsapp: '',
    instagram_url: '',
    tiktok_url: '',
    maps_url: '',
  });

  // Sync form values with config on load
  useState(() => {
    if (!loading) {
      setFormValues({
        tasa_ves: config.tasa_ves.toString(),
        whatsapp: config.whatsapp,
        instagram_url: config.instagram_url,
        tiktok_url: config.tiktok_url,
        maps_url: config.maps_url,
      });
    }
  });

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    try {
      await updateConfig(key, value);
      toast({
        title: 'Guardado',
        description: 'La configuración se actualizó correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive',
      });
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
      {/* Exchange Rate - Prominently displayed */}
      <Card className="bg-card border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <DollarSign className="h-5 w-5" />
            Tasa de Cambio
          </CardTitle>
          <CardDescription>
            Define la tasa de conversión de USD a Bolívares (VES)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="tasa_ves">1 USD = X Bolívares</Label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-secondary">Bs</span>
                <Input
                  id="tasa_ves"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={config.tasa_ves}
                  onChange={(e) => setFormValues(prev => ({ ...prev, tasa_ves: e.target.value }))}
                  className="text-2xl font-bold h-14 bg-input border-border"
                  placeholder="50.00"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Ejemplo: Si 1 USD = 50 Bs, un producto de $10 costará Bs 500
              </p>
            </div>
            <Button
              onClick={() => handleSave('tasa_ves', formValues.tasa_ves || config.tasa_ves.toString())}
              disabled={saving === 'tasa_ves'}
              className="bg-primary hover:bg-primary/90 h-14"
            >
              {saving === 'tasa_ves' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="ml-2">Guardar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Redes Sociales y Contacto
          </CardTitle>
          <CardDescription>
            Configura los enlaces de contacto y redes sociales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-500" />
              WhatsApp
            </Label>
            <div className="flex gap-2">
              <Input
                id="whatsapp"
                type="text"
                defaultValue={config.whatsapp}
                onChange={(e) => setFormValues(prev => ({ ...prev, whatsapp: e.target.value }))}
                className="bg-input border-border"
                placeholder="584121234567"
              />
              <Button
                onClick={() => handleSave('whatsapp', formValues.whatsapp || config.whatsapp)}
                disabled={saving === 'whatsapp'}
                size="icon"
                variant="outline"
              >
                {saving === 'whatsapp' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Número con código de país, sin + ni espacios (ej: 584121234567)
            </p>
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram_url" className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-500" />
              Instagram
            </Label>
            <div className="flex gap-2">
              <Input
                id="instagram_url"
                type="url"
                defaultValue={config.instagram_url}
                onChange={(e) => setFormValues(prev => ({ ...prev, instagram_url: e.target.value }))}
                className="bg-input border-border"
                placeholder="https://instagram.com/catarsislecheria"
              />
              <Button
                onClick={() => handleSave('instagram_url', formValues.instagram_url || config.instagram_url)}
                disabled={saving === 'instagram_url'}
                size="icon"
                variant="outline"
              >
                {saving === 'instagram_url' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* TikTok */}
          <div className="space-y-2">
            <Label htmlFor="tiktok_url">TikTok</Label>
            <div className="flex gap-2">
              <Input
                id="tiktok_url"
                type="url"
                defaultValue={config.tiktok_url}
                onChange={(e) => setFormValues(prev => ({ ...prev, tiktok_url: e.target.value }))}
                className="bg-input border-border"
                placeholder="https://tiktok.com/@catarsislecheria"
              />
              <Button
                onClick={() => handleSave('tiktok_url', formValues.tiktok_url || config.tiktok_url)}
                disabled={saving === 'tiktok_url'}
                size="icon"
                variant="outline"
              >
                {saving === 'tiktok_url' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Google Maps */}
          <div className="space-y-2">
            <Label htmlFor="maps_url" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" />
              Google Maps
            </Label>
            <div className="flex gap-2">
              <Input
                id="maps_url"
                type="url"
                defaultValue={config.maps_url}
                onChange={(e) => setFormValues(prev => ({ ...prev, maps_url: e.target.value }))}
                className="bg-input border-border"
                placeholder="https://maps.google.com/?q=..."
              />
              <Button
                onClick={() => handleSave('maps_url', formValues.maps_url || config.maps_url)}
                disabled={saving === 'maps_url'}
                size="icon"
                variant="outline"
              >
                {saving === 'maps_url' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
