-- ============================================
-- SPRAWDZANIE I NAPRAWA POLITYK RLS
-- ============================================
-- Uruchom to w Supabase SQL Editor
-- ============================================

-- 1. SPRAWDŹ CZY POLITYKI ISTNIEJĄ
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'invoices'
ORDER BY policyname;

-- 2. JEŚLI NIE MA POLITYK DELETE - DODAJ JĄ
-- Najpierw usuń starą jeśli istnieje (żeby uniknąć duplikatów)
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;

-- Teraz stwórz nową politykę DELETE (bez ::text - UUID = UUID)
CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 3. SPRAWDŹ CZY POLITYKA ZOSTAŁA DODANA
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'invoices'
AND policyname = 'Users can delete own invoices';

-- 4. TEST - sprawdź czy możesz usunąć (to NIE usunie, tylko sprawdzi czy możesz)
-- Zmień 'TWOJE_ID' na rzeczywiste ID faktury z tabeli
-- SELECT * FROM invoices WHERE id = 'TWOJE_ID' AND auth.uid()::text = user_id;
