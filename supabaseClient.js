import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lpdqmavqqyuhvalnfqlt.supabase.co';     
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwZHFtYXZxcXl1aHZhbG5mcWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTMxNjEsImV4cCI6MjA3NTM4OTE2MX0.OaCKAqlcDiyJf3Q2vihYD5YRJ2L_UIWznn6XnVm2OwM';                        

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);