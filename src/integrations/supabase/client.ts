
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lnyixnhsrovzdxybmjfa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxueWl4bmhzcm92emR4eWJtamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzEwOTUsImV4cCI6MjA1ODc0NzA5NX0.a9Su1YiPudHkbt70262y4YBGTBwlqikvKHxahqb7hiA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
