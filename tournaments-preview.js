// Fetch tournaments from Supabase and show in the homepage tournaments card
const SUPABASE_URL = 'https://nrmauuyyzpkdpkbueuec.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybWF1dXl5enBrZHBrYnVldWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDgxMjUsImV4cCI6MjA2NTgyNDEyNX0.YuFbzTrc-lUggd4V-5u3sHL5tS4TmooxLpPucLCc4Mo';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

async function showTournamentsPreview() {
  const tournamentsCard = document.querySelector('.card.tournaments ul');
  if (!tournamentsCard) return;
  tournamentsCard.innerHTML = '<li>Loading...</li>';
  const { data, error } = await supabase.storage.from('uploads').download('tournaments.json');
  if (error) {
    tournamentsCard.innerHTML = '<li>Could not load tournaments.</li>';
    return;
  }
  const text = await data.text();
  let tournaments = [];
  try {
    tournaments = JSON.parse(text);
  } catch {}
  if (!tournaments.length) {
    tournamentsCard.innerHTML = '<li>No tournaments yet.</li>';
    return;
  }
  tournamentsCard.innerHTML = '';
  tournaments.forEach(t => {
    tournamentsCard.innerHTML += `<li style="margin-bottom:1.5rem;">
      <strong>${t.name}</strong><br>
      <b>Date:</b> ${formatDate(t.date)}<br>
      <b>Start Time:</b> ${t.startTime}<br>
      <b>Max Players:</b> ${t.maxPlayer}<br>
      <b>Location:</b> ${t.street}, ${t.postcode}, ${t.city}, ${t.country}<br>
      <b>Notes:</b> ${t.desc && t.desc.trim() ? t.desc : '-'}<br>
    </li>`;
  });
}

document.addEventListener('DOMContentLoaded', showTournamentsPreview);
