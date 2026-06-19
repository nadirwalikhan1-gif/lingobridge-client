import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      // Correct no-op lock: must invoke and return the wrapped fn,
      // otherwise getSession()/getUser()/refresh all resolve to undefined.
      lock: (name, acquireTimeout, fn) => fn(),
    }
  });
} else {
  console.warn('Missing Supabase environment variables — client not initialized');
}

export { supabase };
