-- ============================================
-- USER PROFILES & AUTH SYSTEM
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro')),
  
  -- Subscription tracking
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired')),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  
  -- License tracking
  license_key TEXT,
  license_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Usage limits (for FREE plan)
  invoices_created INTEGER DEFAULT 0,
  invoices_limit INTEGER DEFAULT 5,
  companies_limit INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_license_key ON profiles(license_key);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- LICENSES TABLE (from crypto-payments)
-- ============================================

CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  license_key VARCHAR(50) UNIQUE NOT NULL,
  
  -- Plan details
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'starter', 'pro')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  
  -- Device binding (one license = one device)
  device_id VARCHAR(100),
  
  -- Payment tracking
  payment_method VARCHAR(20) NOT NULL DEFAULT 'crypto',
  payment_id VARCHAR(100), -- BTCPay invoice ID
  amount DECIMAL(10,2),
  currency VARCHAR(3), -- EUR, USD, etc.
  crypto_amount VARCHAR(50), -- Actual BTC amount paid
  crypto_currency VARCHAR(10), -- BTC, BTC-LightningNetwork
  
  -- Timestamps
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_device ON licenses(device_id);

-- Enable RLS
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own licenses"
  ON licenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert licenses"
  ON licenses FOR INSERT
  WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Check plan limits
CREATE OR REPLACE FUNCTION check_plan_limits(
  user_uuid UUID,
  check_type TEXT -- 'invoices', 'companies', 'features'
)
RETURNS JSON AS $$
DECLARE
  user_profile RECORD;
  result JSON;
BEGIN
  SELECT * INTO user_profile FROM profiles WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN json_build_object('allowed', false, 'error', 'Profile not found');
  END IF;
  
  -- FREE plan limits
  IF user_profile.plan = 'free' THEN
    IF check_type = 'invoices' THEN
      IF user_profile.invoices_created >= user_profile.invoices_limit THEN
        RETURN json_build_object(
          'allowed', false,
          'error', 'Invoice limit reached (5/5). Upgrade to STARTER for unlimited invoices.',
          'current', user_profile.invoices_created,
          'limit', user_profile.invoices_limit
        );
      END IF;
    ELSIF check_type = 'companies' THEN
      IF user_profile.companies_limit <= 1 THEN
        RETURN json_build_object(
          'allowed', false,
          'error', 'Company limit reached (1/1). Upgrade to STARTER for 3 companies.',
          'limit', 1
        );
      END IF;
    END IF;
  END IF;
  
  -- STARTER plan limits
  IF user_profile.plan = 'starter' THEN
    IF check_type = 'companies' THEN
      IF user_profile.companies_limit >= 3 THEN
        RETURN json_build_object(
          'allowed', false,
          'error', 'Company limit reached (3/3). Upgrade to PRO for unlimited companies.',
          'limit', 3
        );
      END IF;
    END IF;
  END IF;
  
  -- PRO plan = unlimited everything
  RETURN json_build_object('allowed', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TEST DATA
-- ============================================

-- Insert test user profile (if not exists)
-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'demo@messubouw.com') THEN
--     INSERT INTO profiles (id, email, full_name, plan, subscription_status)
--     VALUES (
--       gen_random_uuid(),
--       'demo@messubouw.com',
--       'Demo User',
--       'free',
--       'active'
--     );
--   END IF;
-- END $$;
