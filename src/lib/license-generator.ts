/**
 * License Key Generator
 * 
 * Generates unique license keys with Device ID binding.
 * Format: MESSUBOUW-{PLAN}-{YEAR}-{RANDOM}
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for backend operations
);

export type LicensePlan = 'free' | 'starter' | 'pro';

export interface License {
  id: string;
  userId: string;
  licenseKey: string;
  plan: LicensePlan;
  status: 'active' | 'expired' | 'cancelled';
  deviceId?: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Generate a unique license key
 */
export function generateLicenseKey(plan: LicensePlan): string {
  const prefix = 'MESSUBOUW';
  const planCode = plan.toUpperCase();
  const year = new Date().getFullYear();
  
  // Generate 6-character random string (alphanumeric, no confusing chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${prefix}-${planCode}-${year}-${random}`;
}

/**
 * Create a new license in database
 */
export async function createLicense(params: {
  userId: string;
  email: string;
  plan: LicensePlan;
  paymentId: string;
  amount: number;
  currency: string;
  cryptoAmount?: string;
  cryptoCurrency?: string;
}): Promise<License> {
  const licenseKey = generateLicenseKey(params.plan);
  
  // Calculate expiry date (30 days for monthly, 365 for yearly)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // Default: 30 days
  
  // Insert license
  const { data, error } = await supabase
    .from('licenses')
    .insert({
      user_id: params.userId,
      license_key: licenseKey,
      plan: params.plan,
      status: 'active',
      payment_method: 'crypto',
      payment_id: params.paymentId,
      amount: params.amount,
      currency: params.currency,
      crypto_amount: params.cryptoAmount,
      crypto_currency: params.cryptoCurrency,
      expires_at: expiryDate.toISOString(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error('Failed to create license:', error);
    throw new Error(`Database error: ${error.message}`);
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    licenseKey: data.license_key,
    plan: data.plan,
    status: data.status,
    deviceId: data.device_id,
    expiresAt: new Date(data.expires_at),
    createdAt: new Date(data.created_at),
  };
}

/**
 * Validate license key and bind to device
 */
export async function validateLicense(
  licenseKey: string,
  deviceId: string
): Promise<{ valid: boolean; license?: License; error?: string }> {
  try {
    // Fetch license
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .single();
    
    if (error || !license) {
      return { valid: false, error: 'License key not found' };
    }
    
    // Check expiry
    const expiryDate = new Date(license.expires_at);
    if (expiryDate < new Date()) {
      return { valid: false, error: 'License has expired' };
    }
    
    // Check status
    if (license.status !== 'active') {
      return { valid: false, error: `License is ${license.status}` };
    }
    
    // Device binding
    if (license.device_id) {
      // Already bound to a device
      if (license.device_id !== deviceId) {
        return {
          valid: false,
          error: 'License already activated on another device',
        };
      }
    } else {
      // First activation - bind to this device
      const { error: updateError } = await supabase
        .from('licenses')
        .update({ device_id: deviceId })
        .eq('id', license.id);
      
      if (updateError) {
        console.error('Failed to bind device:', updateError);
      }
    }
    
    return {
      valid: true,
      license: {
        id: license.id,
        userId: license.user_id,
        licenseKey: license.license_key,
        plan: license.plan,
        status: license.status,
        deviceId: license.device_id,
        expiresAt: new Date(license.expires_at),
        createdAt: new Date(license.created_at),
      },
    };
  } catch (error) {
    console.error('License validation error:', error);
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Get user's active licenses
 */
export async function getUserLicenses(userId: string): Promise<License[]> {
  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Failed to fetch licenses:', error);
    return [];
  }
  
  return data.map((license) => ({
    id: license.id,
    userId: license.user_id,
    licenseKey: license.license_key,
    plan: license.plan,
    status: license.status,
    deviceId: license.device_id,
    expiresAt: new Date(license.expires_at),
    createdAt: new Date(license.created_at),
  }));
}

/**
 * Deactivate license (for refunds/cancellations)
 */
export async function deactivateLicense(licenseKey: string): Promise<void> {
  const { error } = await supabase
    .from('licenses')
    .update({ status: 'cancelled' })
    .eq('license_key', licenseKey);
  
  if (error) {
    throw new Error(`Failed to deactivate license: ${error.message}`);
  }
}
