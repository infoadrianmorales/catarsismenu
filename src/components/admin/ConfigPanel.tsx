import { useState, useEffect } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, DollarSign, MessageCircle, Instagram, MapPin, RefreshCw, CheckCircle2, Eye, BarChart3 } from 'lucide-react';

type PriceDisplayMode = 'solo_usd' | 'solo_ves' | 'ambas';
type RateSource = 'bcv' | 'manual';

export const ConfigPanel = () => {
  const { config, loading, updateConfig, refetch } = useConfig();
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);
  const [syncingBcv, setSyncingBcv] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [priceDisplayMode, setPriceDisplayMode] = useState<PriceDisplayMode>('ambas');
  const [rateSource, setRateSource] = useState<RateSource>('bcv');
  const [metricoolHash, setMetricoolHash] = useState('');
  const [formValues, setFormValues] = useState({
    tasa_ves: '',
    tasa_manual: '',
    whatsapp: '',
    instagram_url: '',
    tiktok_url: '',
    maps_url: '',
  });

  // Sync form values with config on load
  useEffect(() => {
    if (!loading) {
      setFormValues({
        tasa_ves: config.tasa_ves.toString(),
        tasa_manual: '',
        whatsapp: config.whatsapp,
        instagram_url: config.instagram_url,
        tiktok_url: config.tiktok_url,
        maps_url: config.maps_url,
      });
    }
  }, [loading, config]);

  // Fetch last sync time, display mode, and rate source
  useEffect(() => {
    const fetchConfigData = async () => {
      const { data } = await supabase
        .from('config')
        .select('key, value')
        .in('key', ['bcv_last_sync', 'price_display_mode', 'rate_source', 'tasa_manual', 'metricool_hash']);
      
      if (data) {
        data.forEach(item => {
          if (item.key === 'bcv_last_sync') {
            setLastSync(item.value);
          } else if (item.key === 'price_display_mode') {
            setPriceDisplayMode(item.value as PriceDisplayMode);
          } else if (item.key === 'rate_source') {
            setRateSource(item.value as RateSource);
          } else if (item.key === 'tasa_manual') {
            setFormValues(prev => ({ ...prev, tasa_manual: item.value }));
          } else if (item.key === 'metricool_hash') {
            setMetricoolHash(item.value);
          }
        });
      }
    };
    fetchConfigData();
  }, []);

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

  const handleSyncBcv = async () => {
    setSyncingBcv(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-bcv-rate');
      
      if (error) throw error;
      
      if (data.success) {
        const rateNum = parseFloat(data.rate);
        toast({
          title: 'Tasa sincronizada',
          description: `Tasa BCV actualizada: Bs ${rateNum.toFixed(2)}`,
        });
        
        // Refresh config to show new rate
        refetch();
        setLastSync(data.syncedAt);
        setFormValues(prev => ({ ...prev, tasa_ves: rateNum.toString() }));
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error syncing BCV rate:', error);
      toast({
        title: 'Error al sincronizar',
        description: error.message || 'No se pudo obtener la tasa del BCV',
        variant: 'destructive',
      });
    } finally {
      setSyncingBcv(false);
    }
  };

  const formatLastSync = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <CardContent className="space-y-6">
          {/* Rate Source Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Fuente de la tasa</Label>
            <RadioGroup
              value={rateSource}
              onValueChange={async (value) => {
                const newSource = value as RateSource;
                setRateSource(newSource);
                await handleSave('rate_source', newSource);
                
                // If switching to BCV, sync immediately
                if (newSource === 'bcv') {
                  handleSyncBcv();
                }
              }}
              className="grid grid-cols-2 gap-3"
            >
              <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                rateSource === 'bcv' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-muted-foreground'
              }`}>
                <RadioGroupItem value="bcv" id="rate-bcv" />
                <Label htmlFor="rate-bcv" className="flex-1 cursor-pointer">
                  <span className="font-medium">Tasa BCV</span>
                  <p className="text-xs text-muted-foreground">
                    Automática del Banco Central
                  </p>
                </Label>
              </div>
              <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                rateSource === 'manual' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-muted-foreground'
              }`}>
                <RadioGroupItem value="manual" id="rate-manual" />
                <Label htmlFor="rate-manual" className="flex-1 cursor-pointer">
                  <span className="font-medium">Tasa Manual</span>
                  <p className="text-xs text-muted-foreground">
                    Personalizada por ti
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* BCV Section - Only active when BCV is selected */}
          <div className={`p-4 rounded-lg border transition-all ${
            rateSource === 'bcv' 
              ? 'bg-muted/50 border-primary/30' 
              : 'bg-muted/20 border-border opacity-50'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tasa BCV Actual</span>
                  {rateSource === 'bcv' && (
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
                      Activa
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-secondary">
                  Bs {formValues.tasa_ves || '0.00'}
                </p>
                {lastSync && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Última sincronización: {formatLastSync(lastSync)}
                  </p>
                )}
              </div>
              <Button
                onClick={handleSyncBcv}
                disabled={syncingBcv || rateSource !== 'bcv'}
                variant="outline"
                className="gap-2"
              >
                {syncingBcv ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Sincronizar ahora
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Se actualiza automáticamente cada hora entre 5:00 PM y 9:00 PM (hora Venezuela)
            </p>
          </div>

          {/* Manual Rate Section - Only active when Manual is selected */}
          <div className={`p-4 rounded-lg border transition-all ${
            rateSource === 'manual' 
              ? 'bg-muted/50 border-primary/30' 
              : 'bg-muted/20 border-border opacity-50'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Tasa Manual</span>
                {rateSource === 'manual' && (
                  <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
                    Activa
                  </span>
                )}
              </div>
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="tasa_manual">1 USD = X Bolívares</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-secondary">Bs</span>
                    <Input
                      id="tasa_manual"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formValues.tasa_manual === '0' ? '' : formValues.tasa_manual}
                      onChange={(e) => setFormValues(prev => ({ ...prev, tasa_manual: e.target.value }))}
                      className="text-2xl font-bold h-14 bg-input border-border"
                      placeholder="50.00"
                      disabled={rateSource !== 'manual'}
                    />
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    await handleSave('tasa_manual', formValues.tasa_manual);
                    // Also update tasa_ves to use this manual value
                    await handleSave('tasa_ves', formValues.tasa_manual);
                    refetch();
                  }}
                  disabled={saving === 'tasa_manual' || rateSource !== 'manual'}
                  className="bg-primary hover:bg-primary/90 h-14"
                >
                  {saving === 'tasa_manual' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="ml-2">Guardar</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Ingresa la tasa que deseas usar para calcular los precios en bolívares
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Display Mode */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visualización de Precios
          </CardTitle>
          <CardDescription>
            Elige cómo se muestran los precios en el menú público
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={priceDisplayMode}
            onValueChange={(value) => setPriceDisplayMode(value as PriceDisplayMode)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="ambas" id="ambas" />
              <Label htmlFor="ambas" className="flex-1 cursor-pointer">
                <span className="font-medium">Ambas monedas</span>
                <p className="text-xs text-muted-foreground">
                  Muestra USD y Bs simultáneamente. El usuario puede alternar cuál resaltar.
                </p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="solo_usd" id="solo_usd" />
              <Label htmlFor="solo_usd" className="flex-1 cursor-pointer">
                <span className="font-medium">Solo Dólares (USD)</span>
                <p className="text-xs text-muted-foreground">
                  Muestra únicamente precios en dólares americanos.
                </p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="solo_ves" id="solo_ves" />
              <Label htmlFor="solo_ves" className="flex-1 cursor-pointer">
                <span className="font-medium">Solo Bolívares (VES)</span>
                <p className="text-xs text-muted-foreground">
                  Muestra únicamente precios en bolívares, calculados con la tasa actual.
                </p>
              </Label>
            </div>
          </RadioGroup>
          
          <Button
            onClick={() => handleSave('price_display_mode', priceDisplayMode)}
            disabled={saving === 'price_display_mode'}
            className="w-full gap-2"
          >
            {saving === 'price_display_mode' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar preferencia
          </Button>
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

      {/* Metricool */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Metricool
          </CardTitle>
          <CardDescription>
            Configuración del script de seguimiento de Metricool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metricool_hash">Hash ID de Metricool</Label>
            <div className="flex gap-2">
              <Input
                id="metricool_hash"
                type="text"
                value={metricoolHash}
                onChange={(e) => setMetricoolHash(e.target.value)}
                className="bg-input border-border font-mono"
                placeholder="4157fa87e6bd40d5b2591b9947e24168"
              />
              <Button
                onClick={() => handleSave('metricool_hash', metricoolHash)}
                disabled={saving === 'metricool_hash'}
                size="icon"
                variant="outline"
              >
                {saving === 'metricool_hash' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Identificador único de tu cuenta Metricool. Se carga dinámicamente en el sitio. Si se deja vacío, el script no se cargará.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
