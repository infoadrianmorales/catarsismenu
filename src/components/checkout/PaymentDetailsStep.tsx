import { useState } from 'react';
import { ArrowLeft, Copy, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface PaymentDetailsStepProps {
  paymentMethod: string;
  paymentMethodLabel: string;
  paymentCurrency: 'USD' | 'VES';
  instructions: string;
  totalFormatted: string;
  onBack: () => void;
  onContinue: () => void;
}

export const PaymentDetailsStep = ({
  paymentMethodLabel,
  paymentCurrency,
  instructions,
  totalFormatted,
  onBack,
  onContinue,
}: PaymentDetailsStepProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(instructions);
      setCopied(true);
      toast.success('Datos copiados al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">Datos para Pagar</h1>
          <p className="text-muted-foreground">
            Usa estos datos para realizar tu pago
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{paymentMethodLabel}</span>
            <span className="text-sm font-normal text-muted-foreground">
              Pago en {paymentCurrency}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructions Box */}
          <div className="relative">
            <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
              {instructions}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 gap-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar
                </>
              )}
            </Button>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t border-border pt-4">
            <span className="text-lg font-medium">Total a pagar:</span>
            <span className="text-2xl font-bold text-secondary">{totalFormatted}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={onContinue} className="gap-2">
          Ya pagué / Continuar
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
