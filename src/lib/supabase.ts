import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

const getSupabaseUrl = () =>
  localStorage.getItem('hirenest_supabase_url') ||
  import.meta.env.VITE_SUPABASE_URL ||
  '';

const getSupabaseAnonKey = () =>
  localStorage.getItem('hirenest_supabase_anon_key') ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return !!(url && key && url.includes('supabase.co'));
};

const createNewClient = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key) {
    console.warn('Supabase not configured');
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
};

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const client = createNewClient();
    if (!client) throw new Error('Supabase not configured');
    supabaseInstance = client;
  }
  return supabaseInstance;
};

export const supabase = new Proxy({} as SupabaseClient, {
  get: (_, prop) => {
    const client = getSupabase();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
