import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // bare video ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Get thumbnail URL — custom override or YouTube default
 */
export function getThumbnail(instrument) {
  if (instrument.thumbnail_url) return instrument.thumbnail_url;
  const videoId = extractVideoId(instrument.youtube_url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
}

/**
 * Fetch enabled instruments (public)
 */
export async function fetchInstruments() {
  const { data, error } = await supabase
    .from('instruments')
    .select('*')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Fetch ALL instruments (admin — requires auth)
 */
export async function fetchAllInstruments() {
  const { data, error } = await supabase
    .from('instruments')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Upsert instrument
 */
export async function upsertInstrument(instrument) {
  const { data, error } = await supabase
    .from('instruments')
    .upsert(instrument, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete instrument
 */
export async function deleteInstrument(id) {
  const { error } = await supabase
    .from('instruments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
