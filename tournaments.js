// Tournament admin logic (same as events, only admin can add/edit/delete)
document.addEventListener('DOMContentLoaded', function() {
  const addTournamentCard = document.querySelector('.add-event'); // updated selector
  const tournamentCardsContainer = document.getElementById('tournament-cards-container');

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
    const noTournamentsMsg = tournamentCardsContainer.querySelector('.no-tournaments-msg');
    if (noTournamentsMsg) {
      if (tournamentCardsContainer.children.length > 1 || (tournamentCardsContainer.children.length === 1 && !noTournamentsMsg)) {
        noTournamentsMsg.style.display = 'none';
      } else if (tournamentCardsContainer.children.length === 1 && noTournamentsMsg) {
        noTournamentsMsg.style.display = '';
      } else if (tournamentCardsContainer.children.length === 0) {
        // fallback
        tournamentCardsContainer.innerHTML = '<div class="no-tournaments-msg">No tournaments yet.</div>';
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
    clearTournamentCards();
    const tournaments = await loadTournamentsFromSupabase();
    if (!tournaments.length) {
      tournamentCardsContainer.innerHTML = '<div class="no-tournaments-msg">No tournaments yet.</div>';
      return;
    }
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
    tournamentCardsContainer.querySelectorAll('.tournament-card').forEach(card => {
      const name = card.querySelector('strong')?.textContent || '';
      const dateText = card.innerHTML.match(/<b>Date:<\/b> ([^<]+)<br>/)?.[1] || '';
      // Convert DD/MM/YYYY to YYYY-MM-DD for storage
      let date = '';
      if (dateText) {
        const [d, m, y] = dateText.split('/');
        date = y && m && d ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : '';
      }
      const startTime = card.innerHTML.match(/<b>Start Time:<\/b> ([^<]+)<br>/)?.[1] || '';
      const maxPlayer = card.innerHTML.match(/<b>Max Players:<\/b> ([^<]+)<br>/)?.[1] || '';
      const location = card.innerHTML.match(/<b>Location:<\/b> ([^<]+)<br>/)?.[1] || '';
      const [street, postcode, city, country] = location.split(',').map(s => s.trim());
      const desc = card.innerHTML.match(/<b>Notes:<\/b> ([^<]*)<br>/)?.[1] || '';
      tournaments.push({ name, date, startTime, maxPlayer, street, postcode, city, country, desc });
    });
    saveTournamentsToSupabase(tournaments);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  // --- Player Availability Logic ---
  const availabilityTable = 'tournament_availability';
  const playerList = [
    'Santhuru Sivamoorthy', 'Vithuran', 'Jenagan', 'Arun', 'Rion Ockers',
    'Logesan Shandralingam', 'Mayuran Sivamoorthy', 'Don Sinthu', 'Kanesh',
    'Pradeep', 'Rasa Suji', 'Sudarshan', 'Gobi Annan', 'Vaishnavan Selvam'
  ];

  function clearTournamentCards() {
    tournamentCardsContainer.innerHTML = '';
  }

  function renderAvailabilityList(container, availability) {
    let summary =
      `<div class="availability-summary" style="margin-top:0.5em;font-size:0.95em;">
        <b>Available:</b> ${availability.filter(a => a.available).map(a => a.player).join(', ') || 'None'}<br>
        <b>Not Available:</b> ${availability.filter(a => !a.available).map(a => a.player).join(', ') || 'None'}
      </div>`;
    let summaryDiv = container.querySelector('.availability-summary');
    if (summaryDiv) {
      summaryDiv.outerHTML = summary;
    } else {
      container.insertAdjacentHTML('beforeend', summary);
    }
  }

  // Fetch player availability for a tournament from Supabase
  async function fetchAvailability(tournamentName) {
    const { data, error } = await supabase
      .from('tournament_availability')
      .select('*')
      .eq('tournament_id', tournamentName);
    return data || [];
  }

  // Save player availability for a tournament in Supabase
  async function saveAvailability(tournamentName, player, available) {
    // Upsert: delete old, insert new
    await supabase
      .from('tournament_availability')
      .delete()
      .eq('tournament_id', tournamentName)
      .eq('player', player);
    await supabase
      .from('tournament_availability')
      .insert([{ tournament_id: tournamentName, player, available }]);
  }

  // Call after any change
  function addTournamentToList(name, date, startTime, maxPlayer, street, postcode, city, country, desc) {
    const container = document.createElement('div');
    container.className = 'card tournament-card';
    container.style.marginBottom = '2rem';
    container.style.flex = '1 1 320px';
    container.style.maxWidth = '350px';
    container.innerHTML = `<strong style="font-size:1.2em;">${name}</strong><br>
      <b>Date:</b> ${formatDate(date)}<br>
      <b>Start Time:</b> ${startTime}<br>
      <b>Max Players:</b> ${maxPlayer}<br>
      <b>Location:</b> ${street}, ${postcode}, ${city}, ${country}<br>
      <b>Notes:</b> ${desc}<br>
      <button class='edit-btn'>Edit</button> <button class='delete-btn'>Delete</button>`;
    // Hide edit/delete if not admin
    if (getRole() !== 'admin') {
      container.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.style.display = 'none');
    }
    // --- Player availability UI ---
    const player = localStorage.getItem('player') || '';
    if (getRole() === 'player' && player) {
      const availDiv = document.createElement('div');
      availDiv.style.marginTop = '0.7em';
      availDiv.innerHTML = `
        <label style="font-weight:bold;">Your Availability:</label>
        <label style="margin-left:1em;"><input type="checkbox" class="avail-checkbox" value="yes"> Available</label>
        <label style="margin-left:1em;"><input type="checkbox" class="notavail-checkbox" value="no"> Not Available</label>
        <button class="save-availability-btn" style="margin-left:1em;">Save</button>
        <span class="save-status" style="margin-left:0.7em;color:#388e3c;"></span>
      `;
      container.appendChild(availDiv);
      const availCheckbox = availDiv.querySelector('.avail-checkbox');
      const notAvailCheckbox = availDiv.querySelector('.notavail-checkbox');
      const saveBtn = availDiv.querySelector('.save-availability-btn');
      const statusSpan = availDiv.querySelector('.save-status');
      availCheckbox.addEventListener('change', function() {
        if (availCheckbox.checked) notAvailCheckbox.checked = false;
      });
      notAvailCheckbox.addEventListener('change', function() {
        if (notAvailCheckbox.checked) availCheckbox.checked = false;
      });
      saveBtn.onclick = async function() {
        if (!player) {
          statusSpan.textContent = 'Log in as player!';
          return;
        }
        if (!availCheckbox.checked && !notAvailCheckbox.checked) {
          statusSpan.textContent = 'Select availability!';
          return;
        }
        const available = availCheckbox.checked;
        await saveAvailability(name, player, available);
        statusSpan.textContent = 'Saved!';
        setTimeout(() => statusSpan.textContent = '', 1200);
        // Refresh list
        const avail = await fetchAvailability(name);
        renderAvailabilityList(availDiv, avail);
      };
      fetchAvailability(name).then(avail => {
        renderAvailabilityList(availDiv, avail);
        const found = avail.find(a => a.player === player);
        if (found) {
          if (found.available) {
            availCheckbox.checked = true;
            notAvailCheckbox.checked = false;
          } else {
            availCheckbox.checked = false;
            notAvailCheckbox.checked = true;
          }
        }
      });
    } else {
      // For admin or not logged in, show all availability only
      const availDiv = document.createElement('div');
      availDiv.style.marginTop = '0.7em';
      container.appendChild(availDiv);
      fetchAvailability(name).then(avail => renderAvailabilityList(availDiv, avail));
    }
    tournamentCardsContainer.appendChild(container);
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

  tournamentCardsContainer.addEventListener('click', async function(e) {
    if (e.target.classList.contains('delete-btn')) {
      const card = e.target.closest('.tournament-card');
      const name = card.querySelector('strong')?.textContent || '';
      await supabase.from(availabilityTable).delete().eq('tournament_id', name);
      card.remove();
      updateNoTournamentsMsg();
      saveTournaments();
    } else if (e.target.classList.contains('edit-btn')) {
      const card = e.target.closest('.tournament-card');
      // Parse fields from the card
      const name = card.querySelector('strong')?.textContent || '';
      const dateText = card.innerHTML.match(/<b>Date:<\/b> ([^<]+)<br>/)?.[1] || '';
      // Convert DD/MM/YYYY to YYYY-MM-DD for input
      const [d, m, y] = dateText.split('/');
      const date = y && m && d ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : '';
      const startTime = card.innerHTML.match(/<b>Start Time:<\/b> ([^<]+)<br>/)?.[1] || '';
      const maxPlayer = card.innerHTML.match(/<b>Max Players:<\/b> ([^<]+)<br>/)?.[1] || '';
      const location = card.innerHTML.match(/<b>Location:<\/b> ([^<]+)<br>/)?.[1] || '';
      const [street, postcode, city, country] = location.split(',').map(s => s.trim());
      const desc = card.innerHTML.match(/<b>Notes:<\/b> ([^<]+)<br>/)?.[1] || '';
      document.getElementById('event-name').value = name;
      document.getElementById('event-date').value = date;
      document.getElementById('start-time').value = startTime;
      document.getElementById('max-player').value = maxPlayer;
      document.getElementById('streetname').value = street || '';
      document.getElementById('postcode').value = postcode || '';
      document.getElementById('city').value = city || '';
      document.getElementById('country').value = country || '';
      document.getElementById('event-desc').value = desc;
      card.remove();
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
