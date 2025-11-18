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

// Supabase configuration - messu system apk
const supabaseUrl = 'https://ayinverqjntywglsdlzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5aW52ZXJxam50eXdnbHNkbHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NjIyNTcsImV4cCI6MjA3OTAzODI1N30.RPVXzgZraHaJJTXI2OeKTN0cQTqX1knCl2aMMeD5ugc';

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
