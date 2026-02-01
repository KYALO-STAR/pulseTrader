// src/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL; // Use VITE_ prefix for Rsbuild
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY; // Use VITE_ prefix



if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'Supabase URL or ANON Key is missing. Check your environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
