import { createClient } from '@supabase/supabase-js';

// Access environment variables for Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://mozejvkqxkrbvrssboiw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vemVqdmtxeGtyYnZyc3Nib2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzYxNzUsImV4cCI6MjA4MTMxMjE3NX0.mG6-f_e6vYP1dqQyjVbNpAX7AP_HkRyUBR3bho56Gg0';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);