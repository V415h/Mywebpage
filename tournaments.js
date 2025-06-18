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

  // Call after any change
  function addTournamentToList(name, date, startTime, maxPlayer, street, postcode, city, country, desc) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${name}</strong> (${date} ${startTime})<br>
      <b>Max Players:</b> ${maxPlayer}<br>
      <b>Location:</b> ${street}, ${postcode}, ${city}, ${country}<br>
      ${desc} <button class='edit-btn'>Edit</button> <button class='delete-btn'>Delete</button>`;
    tournamentsList.appendChild(li);
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
    });
  }

  tournamentsList.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
      e.target.parentElement.remove();
      updateNoTournamentsMsg();
    } else if (e.target.classList.contains('edit-btn')) {
      const li = e.target.parentElement;
      const [name, rest] = li.innerText.split(' (');
      const [date] = rest.split(')');
      document.getElementById('event-name').value = name;
      document.getElementById('event-date').value = date;
      document.getElementById('event-desc').value = li.childNodes[2].textContent.trim();
      li.remove();
      updateNoTournamentsMsg();
      updateRoleUI();
    }
  });

  // On load, ensure correct display
  updateNoTournamentsMsg();
  window.addEventListener('storage', updateRoleUI);
});
