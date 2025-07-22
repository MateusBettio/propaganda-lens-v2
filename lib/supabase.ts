import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable auth for this app since we don't need user authentication
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Debug the configuration in development
if (__DEV__) {
  console.log('=== SUPABASE CLIENT DEBUG ===');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase URL valid:', supabaseUrl.includes('supabase.co'));
  console.log('Anon key length:', supabaseAnonKey.length);
  console.log('Anon key starts with:', supabaseAnonKey.substring(0, 10));
  console.log('==============================');
}