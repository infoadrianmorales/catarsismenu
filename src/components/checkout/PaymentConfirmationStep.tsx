import { useState } from 'react';
import { ArrowLeft, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface PaymentConfirmationStepProps {
  onBack: () => void;
  onSubmit: (reference: string, notes: string) => Promise<void>;
  isSubmitting: boolean;
}

export const PaymentConfirmationStep = ({
  onBack,
  onSubmit,
  isSubmitting,
}: PaymentConfirmationStepProps) => {
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reference.trim()) {
      setError('El número de referencia es obligatorio');
      toast.error('Ingresa el número de referencia');
      return;
    }
    setError('');
    await onSubmit(reference.trim(), notes.trim());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">Confirmar Pago</h1>
          <p className="text-muted-foreground">
            Ingresa los datos de tu comprobante de pago
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Comprobante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reference">Número de Referencia / Comprobante *</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => {
                setReference(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej: 123456789"
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cualquier información adicional sobre tu pago..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          size="lg" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
          {isSubmitting ? 'Enviando...' : 'Enviar confirmación por WhatsApp'}
        </Button>
      </div>
    </div>
  );
};
