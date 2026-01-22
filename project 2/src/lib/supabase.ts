import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { localStorageClient } from './localStorageAdapter';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are available
const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== '' && supabaseAnonKey !== '' &&
  !supabaseUrl.includes('your-project') && !supabaseAnonKey.includes('your-anon-key');

// Export a flag to check if we're in demo mode
export const isDemoMode = !hasSupabaseCredentials;

// Create the appropriate client
let realSupabase: SupabaseClient | null = null;

if (hasSupabaseCredentials) {
  try {
    realSupabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Failed to create Supabase client, falling back to demo mode:', err);
  }
}

// Export either the real Supabase client or the localStorage adapter
// The localStorage adapter mimics the Supabase API for basic operations
export const supabase = (realSupabase || localStorageClient) as unknown as SupabaseClient;
