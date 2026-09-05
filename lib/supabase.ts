import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Product = {
  id: string;
  title: string;
  price: number;
  description: string;
  category?: string;
  file_url: string;
  image_url?: string | null;
  seller_id?: string | null;
  created_at?: string;
};

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function getSupabaseAccessToken(): Promise<string | null> {
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.access_token) {
    return sessionData.session.access_token;
  }

  const { data: refreshedData } = await supabase.auth.refreshSession();
  return refreshedData.session?.access_token || null;
}

export async function getProducts(): Promise<Product[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as Product | null) || null;
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase.from('products').insert(product).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Product;
}

export async function uploadProductFile(file: File, accessToken?: string): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

  const client = accessToken ? createAuthenticatedClient(accessToken) : supabase;
  const { data, error } = await client.storage.from('digital-files').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicData } = client.storage.from('digital-files').getPublicUrl(data.path);
  return publicData.publicUrl;
}
