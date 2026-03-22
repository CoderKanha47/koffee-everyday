import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// 1. Initialize first
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 2. Then test
supabase.from('orders').select('*').limit(1)
  .then(({ data, error }) => {
    if (error) {
        console.error("Connection Error:", error.message);
        console.log("Tip: Check if the 'orders' table exists in your Supabase dashboard!");
    } else {
        console.log("Connection Successful! Table found:", data);
    }
  });