// events-preview.js
// Show upcoming events from Supabase in the homepage

(async function() {
  if (!window._supabase) {
    const SUPABASE_URL = 'https://nrmauuyyzpkdpkbueuec.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybWF1dXl5enBrZHBrYnVldWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDgxMjUsImV4cCI6MjA2NTgyNDEyNX0.YuFbzTrc-lUggd4V-5u3sHL5tS4TmooxLpPucLCc4Mo';
    window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  const supabase = window._supabase;
  const eventsList = document.querySelector('.card.events ul');
  if (!eventsList) return;
  const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
  eventsList.innerHTML = '';
  if (error || !data || !data.length) {
    eventsList.innerHTML = '<li>Stay tuned for updates!</li>';
    return;
  }
  data.forEach(ev => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${ev.name}</strong> (${ev.date})<br>${ev.description || ''}`;
    eventsList.appendChild(li);
  });
})();
