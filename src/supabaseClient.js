import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxkxzjpnmzafhkjoufjx.supabase.co'; // ← replace this
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a3h6anBubXphZmhram91Zmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NDYzODgsImV4cCI6MjA1OTEyMjM4OH0.5niKDmjFMP_459nHvGZ69nWkLucOxiarX2bTJ7TfWpg'; // ← from your Supabase dashboard (Project Settings > API)

export const supabase = createClient(supabaseUrl, supabaseKey);
