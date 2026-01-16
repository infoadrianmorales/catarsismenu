import { MessageCircle } from 'lucide-react';
import { appConfig } from '@/data/config';

export const FloatingWhatsApp = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola, vengo del menú web de Catarsis. Quiero hacer un pedido.');
    window.open(`https://wa.me/${appConfig.whatsapp}?text=${message}`, '_blank');
    
    window.dispatchEvent(new CustomEvent('analytics', {
      detail: { event: 'click_whatsapp', source: 'floating_button' }
    }));
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse-slow"
      aria-label="Pedir por WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );
};
