// Fetch tournaments from Supabase and show in the homepage tournaments card
(function() {
  const supabase = window._supabase;
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
    // Filter out past tournaments and sort by date ascending
    const today = new Date();
    tournaments = tournaments.filter(t => {
      if (!t.date) return false;
      const tDate = new Date(t.date);
      // Only keep tournaments today or in the future
      return tDate >= today.setHours(0,0,0,0);
    });
    tournaments.sort((a, b) => new Date(a.date) - new Date(b.date));
    // Show only the 2 soonest upcoming tournaments
    const upcoming = tournaments.slice(0, 2);
    tournamentsCard.innerHTML = '';
    if (!upcoming.length) {
      tournamentsCard.innerHTML = '<li>No upcoming tournaments.</li>';
      return;
    }
    upcoming.forEach(t => {
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
})();
