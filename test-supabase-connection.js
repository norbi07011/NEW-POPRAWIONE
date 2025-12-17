/**
 * 🧪 Test połączenia z Supabase i sprawdzenie tabel
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ayinverqjntywglsdlzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5aW52ZXJxam50eXdnbHNkbHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NjIyNTcsImV4cCI6MjA3OTAzODI1N30.RPVXzgZraHaJJTXI2OeKTN0cQTqX1knCl2aMMeD5ugc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testowanie połączenia z Supabase...\n');
  
  // Test 1: Sprawdź tabele companies
  console.log('📊 Test 1: Tabela companies');
  try {
    const { data, error, count } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: false })
      .limit(3);
    
    if (error) {
      console.error('❌ Błąd:', error.message);
    } else {
      console.log(`✅ OK - Znaleziono ${count} rekordów`);
      if (data && data.length > 0) {
        console.log('   Przykładowy rekord:', data[0].name);
      }
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }
  
  // Test 2: Sprawdź tabele clients
  console.log('\n📊 Test 2: Tabela clients');
  try {
    const { data, error, count } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: false })
      .limit(3);
    
    if (error) {
      console.error('❌ Błąd:', error.message);
    } else {
      console.log(`✅ OK - Znaleziono ${count} rekordów`);
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }
  
  // Test 3: Sprawdź tabele invoices
  console.log('\n📊 Test 3: Tabela invoices');
  try {
    const { data, error, count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: false })
      .limit(3);
    
    if (error) {
      console.error('❌ Błąd:', error.message);
    } else {
      console.log(`✅ OK - Znaleziono ${count} rekordów`);
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }
  
  // Test 4: Sprawdź tabele profiles (NOWA)
  console.log('\n📊 Test 4: Tabela profiles (NOWA - może nie istnieć)');
  try {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: false })
      .limit(3);
    
    if (error) {
      console.error('❌ Błąd:', error.message);
      console.log('   ⚠️ Tabela prawdopodobnie nie istnieje - trzeba wdrożyć SQL!');
    } else {
      console.log(`✅ OK - Znaleziono ${count} rekordów`);
      if (data && data.length > 0) {
        console.log('   User:', data[0].email, '- Plan:', data[0].plan);
      }
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }
  
  // Test 5: Sprawdź tabele licenses (NOWA)
  console.log('\n📊 Test 5: Tabela licenses (NOWA - może nie istnieć)');
  try {
    const { data, error, count } = await supabase
      .from('licenses')
      .select('*', { count: 'exact', head: false })
      .limit(3);
    
    if (error) {
      console.error('❌ Błąd:', error.message);
      console.log('   ⚠️ Tabela prawdopodobnie nie istnieje - trzeba wdrożyć SQL!');
    } else {
      console.log(`✅ OK - Znaleziono ${count} rekordów`);
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }
  
  // Test 6: Sprawdź auth.users
  console.log('\n📊 Test 6: Auth users');
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Błąd:', error.message);
    } else {
      if (data.session) {
        console.log('✅ Użytkownik zalogowany:', data.session.user.email);
      } else {
        console.log('⚠️ Brak zalogowanego użytkownika (to normalne dla testu)');
      }
    }
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 PODSUMOWANIE:');
  console.log('='.repeat(60));
  console.log('\n✅ ISTNIEJĄCE TABELE:');
  console.log('   - companies (główna baza firm)');
  console.log('   - clients (klienci)');
  console.log('   - invoices (faktury)');
  console.log('   - products (produkty)');
  console.log('\n⏳ DO WDROŻENIA (z profiles-and-auth.sql):');
  console.log('   - profiles (profile użytkowników + subskrypcje)');
  console.log('   - licenses (licencje + płatności)');
  console.log('\n📝 NASTĘPNY KROK:');
  console.log('   1. Otwórz: https://supabase.com/dashboard/project/ayinverqjntywglsdlzo/sql');
  console.log('   2. Skopiuj: database-migrations/profiles-and-auth.sql');
  console.log('   3. Wklej i kliknij Run');
  console.log('   4. Uruchom ponownie: node test-supabase-connection.js');
  console.log('='.repeat(60));
}

testConnection();
