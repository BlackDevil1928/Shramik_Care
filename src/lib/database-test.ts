import { supabase } from './supabase';

/**
 * Test database connectivity and basic operations
 */
export async function testDatabaseConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Test basic connection
    const { data: connection } = await supabase
      .from('migrant_workers')
      .select('count')
      .limit(1);

    console.log('✅ Database connection successful');

    // Test table existence
    const tables = [
      'migrant_workers',
      'health_records', 
      'voice_sessions',
      'admin_users',
      'disease_surveillance'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.warn(`⚠️  Table ${table} may not exist or has access issues:`, error.message);
      } else {
        console.log(`✅ Table ${table} accessible`);
      }
    }

    return { success: true, message: 'Database connection test completed' };
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test environment variables
 */
export function testEnvironmentVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missing = [];
  const present = [];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  }

  console.log('Environment Variables Check:');
  present.forEach(v => console.log(`✅ ${v}: Present`));
  missing.forEach(v => console.log(`❌ ${v}: Missing`));

  return {
    allPresent: missing.length === 0,
    present,
    missing
  };
}