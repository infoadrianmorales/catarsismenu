-- ================================================
-- MIGRACIÓN: Agregar campo source a order_items
-- Fecha: 2026-04-08
-- Propósito: Registrar origen de adición al carrito
-- Valores: 'menu', 'best_seller', 'suggestion', 'search', 'extras'
-- ================================================
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS source text DEFAULT 'menu';
COMMENT ON COLUMN order_items.source IS 'Origen desde donde el usuario agregó el producto al carrito. Agregado 2026-04-08.';