-- Aumentar el límite de caracteres en descripcion_corta de 120 a 200
ALTER TABLE products DROP CONSTRAINT products_descripcion_corta_check;
ALTER TABLE products ADD CONSTRAINT products_descripcion_corta_check CHECK (char_length(descripcion_corta) <= 200);