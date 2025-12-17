/**
 * 🧪 Database Test Script
 * Checks if profiles and licenses tables exist
 */
import { supabase } from './src/config/supabase';

async function testDatabase() {
  console.log('🧪 TESTING DATABASE SETUP...\n');

  // Test 1: Check if profiles table exists
  console.log('📋 Test 1: Checking profiles table...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ FAILED: profiles table does not exist or RLS is blocking');
      console.log('   Error:', error.message);
      console.log('\n⚠️  Please deploy database-migrations/profiles-and-auth.sql to Supabase!\n');
      return false;
    }

    console.log('✅ PASSED: profiles table exists');
    console.log('   Profiles count:', data.length);
  } catch (error: any) {
    console.log('❌ FAILED:', error.message);
    return false;
  }

  // Test 2: Check if licenses table exists
  console.log('\n📋 Test 2: Checking licenses table...');
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ FAILED: licenses table does not exist or RLS is blocking');
      console.log('   Error:', error.message);
      return false;
    }

    console.log('✅ PASSED: licenses table exists');
    console.log('   Licenses count:', data.length);
  } catch (error: any) {
    console.log('❌ FAILED:', error.message);
    return false;
  }

  // Test 3: Check auth
  console.log('\n📋 Test 3: Checking Supabase Auth...');
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log('❌ FAILED:', error.message);
      return false;
    }

    console.log('✅ PASSED: Supabase Auth is working');
    console.log('   Current user:', data.session?.user?.email || 'Not logged in');
  } catch (error: any) {
    console.log('❌ FAILED:', error.message);
    return false;
  }

  console.log('\n🎉 ALL TESTS PASSED!\n');
  console.log('📝 Next steps:');
  console.log('1. Create test user in Supabase Dashboard (test@messubouw.com)');
  console.log('2. Run app: npm run dev');
  console.log('3. Visit: http://localhost:5000/auth');
  console.log('4. Login and test Profile page\n');

  return true;
}

// Run tests
testDatabase()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test script error:', error);
    process.exit(1);
  });
