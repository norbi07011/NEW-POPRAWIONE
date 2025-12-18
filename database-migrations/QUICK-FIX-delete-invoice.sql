-- ============================================
-- 🚀 QUICK FIX: Usuwanie Faktur - Minimalna Naprawa
-- ============================================
-- Użyj tego jeśli chcesz tylko naprawić DELETE dla invoices
-- (zamiast pełnej migracji wszystkich tabel)
-- ============================================

-- KROK 1: Wyłącz RLS dla invoices (tymczasowo)
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- KROK 2: Usuń starą politykę DELETE
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;

-- KROK 3: Zmień typ kolumny user_id z TEXT → UUID
ALTER TABLE invoices ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

-- KROK 4: Stwórz nową poprawną politykę DELETE (UUID = UUID, bez kastowania)
CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE 
  USING (auth.uid() = user_id);

-- KROK 5: Włącz RLS ponownie
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ✅ GOTOWE!
-- ============================================
-- Teraz spróbuj usunąć fakturę w aplikacji.
-- Powinno działać!
--
-- SPRAWDZENIE:
-- SELECT tablename, policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'invoices' AND policyname LIKE '%delete%';
--
-- W kolumnie 'qual' powinno być:
-- (auth.uid() = user_id)  ← BEZ ::text
