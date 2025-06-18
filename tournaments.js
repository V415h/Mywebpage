// Tournament admin logic (same as events, only admin can add/edit/delete)
document.addEventListener('DOMContentLoaded', function() {
  const addTournamentCard = document.querySelector('.add-event'); // updated selector
  const tournamentsList = document.querySelector('.tournaments-list ul');

  function getRole() {
    return localStorage.getItem('role') || 'player';
  }

  function updateRoleUI() {
    if (!addTournamentCard) return; // prevent null error
    if (getRole() === 'admin') {
      addTournamentCard.style.display = 'flex';
      document.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.style.display = 'inline-block');
    } else {
      addTournamentCard.style.display = 'none';
      document.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.style.display = 'none');
    }
  }

  function updateNoTournamentsMsg() {
    const noTournamentsMsg = tournamentsList.querySelector('.no-tournaments-msg');
    if (noTournamentsMsg) {
      if (tournamentsList.children.length > 1 || (tournamentsList.children.length === 1 && !noTournamentsMsg)) {
        noTournamentsMsg.style.display = 'none';
      } else if (tournamentsList.children.length === 1 && noTournamentsMsg) {
        noTournamentsMsg.style.display = '';
      } else if (tournamentsList.children.length === 0) {
        // fallback
        tournamentsList.innerHTML = '<li class="no-tournaments-msg">No tournaments yet.</li>';
      }
    }
  }

  // Supabase client setup for browser
  const SUPABASE_URL = 'https://nrmauuyyzpkdpkbueuec.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybWF1dXl5enBrZHBrYnVldWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDgxMjUsImV4cCI6MjA2NTgyNDEyNX0.YuFbzTrc-lUggd4V-5u3sHL5tS4TmooxLpPucLCc4Mo';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Save tournaments to Supabase Storage as JSON
  async function saveTournamentsToSupabase(tournaments) {
    const file = new File([JSON.stringify(tournaments, null, 2)], 'tournaments.json', { type: 'application/json' });
    const { data, error } = await supabase.storage.from('uploads').upload('tournaments.json', file, { upsert: true });
    if (error) {
      alert('Error saving tournaments to Supabase: ' + error.message);
    }
  }

  // Load tournaments from Supabase Storage
  async function loadTournamentsFromSupabase() {
    const { data, error } = await supabase.storage.from('uploads').download('tournaments.json');
    if (error) return [];
    const text = await data.text();
    try {
      return JSON.parse(text);
    } catch {
      return [];
    }
  }

  // Load tournaments from Supabase
  async function loadTournaments() {
    tournamentsList.innerHTML = '<li class="no-tournaments-msg">No tournaments yet.</li>';
    const tournaments = await loadTournamentsFromSupabase();
    tournaments.forEach(t => {
      addTournamentToList(
        t.name, t.date, t.startTime, t.maxPlayer, t.street, t.postcode, t.city, t.country, t.desc
      );
    });
    updateNoTournamentsMsg();
  }

  // Save tournaments to Supabase
  function saveTournaments() {
    const tournaments = [];
    tournamentsList.querySelectorAll('li').forEach(li => {
      if (li.classList.contains('no-tournaments-msg')) return;
      const name = li.querySelector('strong')?.textContent || '';
      const dateText = li.innerHTML.match(/<b>Date:<\/b> ([^<]+)<br>/)?.[1] || '';
      // Convert DD/MM/YYYY to YYYY-MM-DD for storage
      let date = '';
      if (dateText) {
        const [d, m, y] = dateText.split('/');
        date = y && m && d ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : '';
      }
      const startTime = li.innerHTML.match(/<b>Start Time:<\/b> ([^<]+)<br>/)?.[1] || '';
      const maxPlayer = li.innerHTML.match(/<b>Max Players:<\/b> ([^<]+)<br>/)?.[1] || '';
      const location = li.innerHTML.match(/<b>Location:<\/b> ([^<]+)<br>/)?.[1] || '';
      const [street, postcode, city, country] = location.split(',').map(s => s.trim());
      const desc = li.innerHTML.match(/<b>Notes:<\/b> ([^<]*)<br>/)?.[1] || '';
      tournaments.push({ name, date, startTime, maxPlayer, street, postcode, city, country, desc });
    });
    saveTournamentsToSupabase(tournaments);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  // Call after any change
  function addTournamentToList(name, date, startTime, maxPlayer, street, postcode, city, country, desc) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${name}</strong><br>
      <b>Date:</b> ${formatDate(date)}<br>
      <b>Start Time:</b> ${startTime}<br>
      <b>Max Players:</b> ${maxPlayer}<br>
      <b>Location:</b> ${street}, ${postcode}, ${city}, ${country}<br>
      <b>Notes:</b> ${desc}<br>
      <button class='edit-btn'>Edit</button> <button class='delete-btn'>Delete</button>`;
    tournamentsList.appendChild(li);
    // Hide edit/delete if not admin
    if (getRole() !== 'admin') {
      li.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.style.display = 'none');
    }
    updateNoTournamentsMsg();
  }

  updateRoleUI();

  if (addTournamentCard) {
    addTournamentCard.querySelector('form').addEventListener('submit', function(e) {
      e.preventDefault();
      if (getRole() !== 'admin') return;
      const name = document.getElementById('event-name').value;
      const date = document.getElementById('event-date').value;
      const startTime = document.getElementById('start-time').value;
      const maxPlayer = document.getElementById('max-player').value;
      const street = document.getElementById('streetname').value;
      const postcode = document.getElementById('postcode').value;
      const city = document.getElementById('city').value;
      const country = document.getElementById('country').value;
      const desc = document.getElementById('event-desc').value;
      addTournamentToList(name, date, startTime, maxPlayer, street, postcode, city, country, desc);
      addTournamentCard.querySelector('form').reset();
      updateRoleUI();
      saveTournaments();
    });
  }

  tournamentsList.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
      e.target.parentElement.remove();
      updateNoTournamentsMsg();
      saveTournaments();
    } else if (e.target.classList.contains('edit-btn')) {
      const li = e.target.parentElement;
      // Parse fields from the card
      const name = li.querySelector('strong')?.textContent || '';
      const dateText = li.innerHTML.match(/<b>Date:<\/b> ([^<]+)<br>/)?.[1] || '';
      // Convert DD/MM/YYYY to YYYY-MM-DD for input
      const [d, m, y] = dateText.split('/');
      const date = y && m && d ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : '';
      const startTime = li.innerHTML.match(/<b>Start Time:<\/b> ([^<]+)<br>/)?.[1] || '';
      const maxPlayer = li.innerHTML.match(/<b>Max Players:<\/b> ([^<]+)<br>/)?.[1] || '';
      const location = li.innerHTML.match(/<b>Location:<\/b> ([^<]+)<br>/)?.[1] || '';
      const [street, postcode, city, country] = location.split(',').map(s => s.trim());
      const desc = li.innerHTML.match(/<b>Notes:<\/b> ([^<]+)<br>/)?.[1] || '';
      document.getElementById('event-name').value = name;
      document.getElementById('event-date').value = date;
      document.getElementById('start-time').value = startTime;
      document.getElementById('max-player').value = maxPlayer;
      document.getElementById('streetname').value = street || '';
      document.getElementById('postcode').value = postcode || '';
      document.getElementById('city').value = city || '';
      document.getElementById('country').value = country || '';
      document.getElementById('event-desc').value = desc;
      li.remove();
      updateNoTournamentsMsg();
      updateRoleUI();
      saveTournaments();
    }
  });

  // On load, ensure correct display
  loadTournaments();
  window.addEventListener('storage', function() {
    updateRoleUI();
    loadTournaments();
  });
});
