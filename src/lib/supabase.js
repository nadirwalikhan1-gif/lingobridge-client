import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('ENV CHECK:', SUPABASE_URL, SUPABASE_ANON_KEY ? 'KEY_PRESENT' : 'KEY_MISSING');

let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      lock: () => Promise.resolve(),  // disable navigator lock — fixes white screen on some browsers
    }
  });
} else {
  console.warn('Missing Supabase environment variables — client not initialized');
}

export { supabase };