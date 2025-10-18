import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (window as any).SUPABASE_URL;
const supabaseAnonKey = (window as any).SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    const message = `Supabase is not configured. Please add your Supabase URL and Anon Key to index.html.

Example in index.html:
<script>
  window.SUPABASE_URL = 'https://abcdefg.supabase.co';
  window.SUPABASE_ANON_KEY = 'ey...';
</script>

You can find these in your Supabase project's API settings.
The app cannot start without them.`;

    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `<div style="padding: 2rem; text-align: center; color: white; background-color: #111; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: monospace;"><pre style="white-space: pre-wrap; text-align: left; background: #222; padding: 2rem; border-radius: 8px; border: 1px solid #444;">${message}</pre></div>`;
    }
    throw new Error("Supabase credentials not provided in index.html.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: window.localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});