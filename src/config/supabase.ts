/**
 * 🚀 Supabase Configuration
 * 
 * INSTRUKCJA KONFIGURACJI:
 * 1. Idź na https://supabase.com/
 * 2. Utwórz darmowe konto
 * 3. Utwórz nowy projekt "messu-bouw-management"
 * 4. Skopiuj URL i ANON KEY z Project Settings > API
 * 5. Wklej poniżej
 * 
 * DARMOWY PLAN:
 * ✅ 500 MB bazy danych
 * ✅ 50,000 aktywnych użytkowników
 * ✅ Unlimited API requests
 * ✅ PostgreSQL + Realtime
 */

import { createClient } from '@supabase/supabase-js';

// TODO: Wypełnij swoimi danymi z Supabase Dashboard
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Utwórz klienta Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper do sprawdzenia czy Supabase jest skonfigurowany
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';
};

// Eksportuj dla wygody
export default supabase;
