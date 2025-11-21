-- ============================================
-- MIGRATION: Dodaj kolumnę 'code' do tabeli products
-- Data: 2025-11-21
-- ============================================

-- Dodaj kolumnę code do produktów
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS code TEXT DEFAULT '';

-- Dodaj index dla szybszego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);

-- Zaktualizuj istniejące produkty (jeśli są)
UPDATE products SET code = '' WHERE code IS NULL;

-- ============================================
-- GOTOWE! ✅
-- ============================================
-- Tabela products ma teraz kolumnę 'code'
-- Produkty będą się zapisywać poprawnie
