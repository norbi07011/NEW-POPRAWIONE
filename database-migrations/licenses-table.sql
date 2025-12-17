-- ========================================
-- MessuBouw License System - Database Schema
-- ========================================

-- Create licenses table
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
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_device ON licenses(device_id);
CREATE INDEX IF NOT EXISTS idx_licenses_expires ON licenses(expires_at);

-- Enable Row Level Security
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own licenses
CREATE POLICY "Users can view own licenses"
  ON licenses FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own device_id (first activation)
CREATE POLICY "Users can activate own licenses"
  ON licenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: System can insert licenses (webhook creates them)
CREATE POLICY "System can insert licenses"
  ON licenses FOR INSERT
  WITH CHECK (true);

-- RLS Policy: System can update licenses (webhook updates status)
CREATE POLICY "System can update licenses"
  ON licenses FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ========================================
-- License Validation Function
-- ========================================

CREATE OR REPLACE FUNCTION validate_license(
  p_license_key VARCHAR(50),
  p_device_id VARCHAR(100)
)
RETURNS JSON AS $$
DECLARE
  v_license RECORD;
  v_result JSON;
BEGIN
  -- Fetch license
  SELECT * INTO v_license
  FROM licenses
  WHERE license_key = p_license_key;
  
  -- Check if license exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'License key not found'
    );
  END IF;
  
  -- Check expiry
  IF v_license.expires_at < NOW() THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'License has expired'
    );
  END IF;
  
  -- Check status
  IF v_license.status != 'active' THEN
    RETURN json_build_object(
      'valid', false,
      'error', format('License is %s', v_license.status)
    );
  END IF;
  
  -- Check device binding
  IF v_license.device_id IS NOT NULL THEN
    IF v_license.device_id != p_device_id THEN
      RETURN json_build_object(
        'valid', false,
        'error', 'License already activated on another device'
      );
    END IF;
  ELSE
    -- First activation - bind to this device
    UPDATE licenses
    SET device_id = p_device_id, updated_at = NOW()
    WHERE id = v_license.id;
  END IF;
  
  -- Valid license
  RETURN json_build_object(
    'valid', true,
    'license', json_build_object(
      'id', v_license.id,
      'plan', v_license.plan,
      'expires_at', v_license.expires_at,
      'device_id', v_license.device_id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Auto-update timestamp trigger
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER licenses_updated_at
  BEFORE UPDATE ON licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ========================================
-- Test Data (for development only)
-- ========================================

-- Insert test licenses
INSERT INTO licenses (
  user_id,
  license_key,
  plan,
  status,
  payment_method,
  amount,
  currency,
  expires_at
) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'MESSUBOUW-FREE-2025-TEST1',
    'free',
    'active',
    'test',
    0.00,
    'EUR',
    NOW() + INTERVAL '30 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'MESSUBOUW-STARTER-2025-TEST2',
    'starter',
    'active',
    'test',
    9.99,
    'EUR',
    NOW() + INTERVAL '30 days'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'MESSUBOUW-PRO-2025-TEST3',
    'pro',
    'active',
    'test',
    29.99,
    'EUR',
    NOW() + INTERVAL '30 days'
  )
ON CONFLICT (license_key) DO NOTHING;

-- ========================================
-- Grants
-- ========================================

-- Allow authenticated users to call validate_license function
GRANT EXECUTE ON FUNCTION validate_license TO authenticated;

-- ========================================
-- Analytics Views
-- ========================================

-- Revenue by plan
CREATE OR REPLACE VIEW revenue_by_plan AS
SELECT
  plan,
  COUNT(*) as total_licenses,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_licenses,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_revenue
FROM licenses
WHERE payment_method != 'test'
GROUP BY plan
ORDER BY total_revenue DESC;

-- Recent sales
CREATE OR REPLACE VIEW recent_sales AS
SELECT
  l.license_key,
  l.plan,
  l.amount,
  l.currency,
  l.crypto_amount,
  l.crypto_currency,
  l.created_at,
  u.email
FROM licenses l
LEFT JOIN auth.users u ON l.user_id = u.id
WHERE l.payment_method != 'test'
ORDER BY l.created_at DESC
LIMIT 100;

-- Grant access to views
GRANT SELECT ON revenue_by_plan TO authenticated;
GRANT SELECT ON recent_sales TO authenticated;
