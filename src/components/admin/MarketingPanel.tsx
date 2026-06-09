/**
 * [MARKETING-PANEL] Panel unificado de Marketing.
 * Agrupa Meta (Pixel + Catálogo), Google (GTM/GA4/Ads/GSC) y UTM Links.
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Facebook, Chrome, Link2 } from 'lucide-react';
import { MetaCatalogPanel } from './MetaCatalogPanel';
import { GoogleTab } from './marketing/GoogleTab';
import { UtmLinksTab } from './marketing/UtmLinksTab';

export const MarketingPanel = () => {
  return (
    <Tabs defaultValue="meta" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="meta" className="gap-2">
          <Facebook className="h-4 w-4" />
          Meta
        </TabsTrigger>
        <TabsTrigger value="google" className="gap-2">
          <Chrome className="h-4 w-4" />
          Google
        </TabsTrigger>
        <TabsTrigger value="utm" className="gap-2">
          <Link2 className="h-4 w-4" />
          UTM Links
        </TabsTrigger>
      </TabsList>

      <TabsContent value="meta"><MetaCatalogPanel /></TabsContent>
      <TabsContent value="google"><GoogleTab /></TabsContent>
      <TabsContent value="utm"><UtmLinksTab /></TabsContent>
    </Tabs>
  );
};
