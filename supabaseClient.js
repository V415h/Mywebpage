// Supabase client setup
// Replace with your Supabase project URL and anon key
const SUPABASE_URL = 'https://nrmauuyyzpkdpkbueuec.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybWF1dXl5enBrZHBrYnVldWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDgxMjUsImV4cCI6MjA2NTgyNDEyNX0.YuFbzTrc-lUggd4V-5u3sHL5tS4TmooxLpPucLCc4Mo';
window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
