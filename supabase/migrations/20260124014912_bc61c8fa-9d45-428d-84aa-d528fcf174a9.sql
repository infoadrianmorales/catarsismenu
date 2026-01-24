-- Create payment_methods table for admin configuration
CREATE TABLE public.payment_methods (
  id text PRIMARY KEY,
  label text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  supports_usd boolean NOT NULL DEFAULT true,
  supports_ves boolean NOT NULL DEFAULT true,
  instructions_usd text,
  instructions_ves text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can read enabled payment methods"
  ON public.payment_methods
  FOR SELECT
  USING (enabled = true);

CREATE POLICY "Admins can read all payment methods"
  ON public.payment_methods
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert payment methods"
  ON public.payment_methods
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update payment methods"
  ON public.payment_methods
  FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete payment methods"
  ON public.payment_methods
  FOR DELETE
  USING (is_admin(auth.uid()));

-- Seed default payment methods
INSERT INTO public.payment_methods (id, label, enabled, supports_usd, supports_ves, instructions_usd, instructions_ves, display_order) VALUES
  ('PAGOMOVIL', 'Pago Móvil', true, false, true, NULL, 'Banco: Banesco
Teléfono: 0412-1234567
Cédula: V-12345678
Nombre: Catarsis C.A.', 1),
  ('ZELLE', 'Zelle', true, true, false, 'Email: pagos@catarsis.com
Nombre: Catarsis LLC', NULL, 2),
  ('USDT', 'USDT (TRC20)', true, true, false, 'Red: TRC20
Wallet: TXyz123...
Nombre: Catarsis', NULL, 3),
  ('ZINLI', 'Zinli', true, true, false, 'Usuario: @catarsis
Nombre: Catarsis', NULL, 4),
  ('TRANSFER', 'Transferencia Bancaria', true, true, true, 'Banco: Bank of America
Cuenta: 123456789
Routing: 987654321
Nombre: Catarsis LLC', 'Banco: Banesco
Cuenta: 0134-1234-12-1234567890
RIF: J-12345678-9
Nombre: Catarsis C.A.', 5);

-- Add trigger for updated_at
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add new columns to orders table
ALTER TABLE public.orders 
  ADD COLUMN payment_currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN payment_instructions_snapshot text,
  ADD COLUMN payment_reference text,
  ADD COLUMN payment_confirmed_at timestamp with time zone,
  ADD COLUMN notes text;