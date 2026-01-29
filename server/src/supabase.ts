import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load our .env file so we can read the secrets
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// We use the SERVICE_ROLE key on the backend because it bypasses policies.
// This lets our server do things (like upload files) that a specialized user might not be able to.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail fast: checking this now saves us hours of debugging later
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing. Check your .env file!');
}

// Export the client so other files can just `import { supabase }`
export const supabase = createClient(supabaseUrl, supabaseKey);