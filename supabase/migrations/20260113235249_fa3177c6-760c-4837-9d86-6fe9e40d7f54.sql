-- Add new categories to the product_category enum
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'entradas';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'ensaladas';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'emparedados';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'parrilla';
ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'cocteleria';