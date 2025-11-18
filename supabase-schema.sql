-- ============================================
-- MESSU BOUW - Supabase Database Schema
-- ============================================
-- 
-- INSTRUKCJA:
-- 1. Zaloguj się do Supabase Dashboard
-- 2. Przejdź do SQL Editor
-- 3. Skopiuj i wklej cały ten plik
-- 4. Kliknij "Run"
-- 
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  kvk TEXT,
  vat_number TEXT,
  eori TEXT,
  iban TEXT,
  bic TEXT,
  phone TEXT,
  phone_mobile TEXT,
  phone_whatsapp TEXT,
  email TEXT,
  email_alt TEXT,
  website TEXT,
  bank_name TEXT,
  account_number TEXT,
  logo_url TEXT,
  currency TEXT DEFAULT 'EUR',
  default_payment_term_days INTEGER DEFAULT 14,
  default_vat_rate DECIMAL(5,2) DEFAULT 21.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);

-- ============================================
-- CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  kvk TEXT,
  vat_number TEXT,
  phone TEXT,
  email TEXT,
  contact_person TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10,2) NOT NULL,
  vat_rate DECIMAL(5,2) DEFAULT 21.00,
  unit TEXT DEFAULT 'stuk',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_term_days INTEGER DEFAULT 14,
  status TEXT DEFAULT 'unpaid',
  currency TEXT DEFAULT 'EUR',
  language TEXT DEFAULT 'nl',
  reverse_charge BOOLEAN DEFAULT FALSE,
  notes TEXT,
  lines JSONB NOT NULL DEFAULT '[]',
  total_net DECIMAL(10,2) DEFAULT 0,
  total_vat DECIMAL(10,2) DEFAULT 0,
  total_gross DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 21.00,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- ============================================
-- KILOMETERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS kilometers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  distance DECIMAL(10,2) NOT NULL,
  purpose TEXT,
  rate DECIMAL(5,2) DEFAULT 0.23,
  total DECIMAL(10,2) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kilometers_user_id ON kilometers(user_id);
CREATE INDEX IF NOT EXISTS idx_kilometers_date ON kilometers(date);
CREATE INDEX IF NOT EXISTS idx_kilometers_client_id ON kilometers(client_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Włącz RLS na wszystkich tabelach
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE kilometers ENABLE ROW LEVEL SECURITY;

-- Policy: Użytkownicy widzą tylko swoje dane
CREATE POLICY "Users can view own companies" ON companies
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own companies" ON companies
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own companies" ON companies
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own companies" ON companies
  FOR DELETE USING (auth.uid()::text = user_id);

-- Repeat for all tables
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid()::text = user_id);
  
CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
  
CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid()::text = user_id);
  
CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid()::text = user_id);
  
CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
  
CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid()::text = user_id);
  
CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid()::text = user_id);
  
CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
  
CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid()::text = user_id);
  
CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid()::text = user_id);
  
CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
  
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid()::text = user_id);
  
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own kilometers" ON kilometers
  FOR SELECT USING (auth.uid()::text = user_id);
  
CREATE POLICY "Users can insert own kilometers" ON kilometers
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
  
CREATE POLICY "Users can update own kilometers" ON kilometers
  FOR UPDATE USING (auth.uid()::text = user_id);
  
CREATE POLICY "Users can delete own kilometers" ON kilometers
  FOR DELETE USING (auth.uid()::text = user_id);

-- ============================================
-- DONE! ✅
-- ============================================
-- Twoje tabele są gotowe!
-- Następny krok: Skonfiguruj URL i ANON KEY w src/config/supabase.ts
