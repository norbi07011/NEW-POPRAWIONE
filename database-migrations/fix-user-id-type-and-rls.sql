-- ============================================
-- 🔧 NAPRAWA: user_id TEXT → UUID + FIX RLS POLICIES
-- ============================================
-- PROBLEM: RLS policies nie działają bo porównują UUID z TEXT
-- ROZWIĄZANIE: Zmień user_id na UUID i popraw policies
-- ============================================

-- KROK 1: WYŁĄCZ RLS przed migracją (żeby uniknąć błędów)
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE kilometers DISABLE ROW LEVEL SECURITY;

-- KROK 2: USUŃ STARE POLITYKI (będziemy tworzyć nowe poprawne)
DROP POLICY IF EXISTS "Users can view own companies" ON companies;
DROP POLICY IF EXISTS "Users can insert own companies" ON companies;
DROP POLICY IF EXISTS "Users can update own companies" ON companies;
DROP POLICY IF EXISTS "Users can delete own companies" ON companies;

DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;

DROP POLICY IF EXISTS "Users can view own kilometers" ON kilometers;
DROP POLICY IF EXISTS "Users can insert own kilometers" ON kilometers;
DROP POLICY IF EXISTS "Users can update own kilometers" ON kilometers;
DROP POLICY IF EXISTS "Users can delete own kilometers" ON kilometers;

-- KROK 3: ZMIEŃ TYP KOLUMNY user_id z TEXT na UUID
-- UWAGA: To konwertuje istniejące wartości TEXT (UUID jako string) → UUID
ALTER TABLE companies ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE clients ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE products ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE invoices ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE expenses ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
ALTER TABLE kilometers ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

-- KROK 4: STWÓRZ NOWE POPRAWNE POLITYKI RLS
-- Teraz auth.uid() i user_id są tego samego typu (UUID)!

-- COMPANIES
CREATE POLICY "Users can view own companies" ON companies
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own companies" ON companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own companies" ON companies
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own companies" ON companies
  FOR DELETE USING (auth.uid() = user_id);

-- CLIENTS
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- PRODUCTS
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- INVOICES (TO BYŁO NAJBARDZIEJ PROBLEMATYCZNE!)
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- EXPENSES
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- KILOMETERS
CREATE POLICY "Users can view own kilometers" ON kilometers
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own kilometers" ON kilometers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own kilometers" ON kilometers
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own kilometers" ON kilometers
  FOR DELETE USING (auth.uid() = user_id);

-- KROK 5: WŁĄCZ RLS PONOWNIE
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE kilometers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ✅ GOTOWE!
-- ============================================
-- SPRAWDZENIE:
-- SELECT tablename, policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' AND tablename = 'invoices';
-- 
-- TEST USUWANIA:
-- DELETE FROM invoices WHERE id = 'jakies-uuid';
-- (powinno działać jeśli jesteś zalogowany!)
