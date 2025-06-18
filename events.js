// Simple role-based UI logic for demo (no real authentication)
document.addEventListener('DOMContentLoaded', function() {
  // Remove role selector logic
  const addEventCard = document.querySelector('.add-event');
  const eventsList = document.querySelector('.events-list ul');

  function getRole() {
    return localStorage.getItem('role') || 'player';
  }

  function updateRoleUI() {
    if (getRole() === 'admin') {
      addEventCard.style.display = 'flex';
      document.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.style.display = 'inline-block');
    } else {
      addEventCard.style.display = 'none';
      document.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.style.display = 'none');
    }
  }

  updateRoleUI();

  document.querySelector('.add-event form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (getRole() !== 'admin') return;
    const name = document.getElementById('event-name').value;
    const date = document.getElementById('event-date').value;
    const desc = document.getElementById('event-desc').value;
    const li = document.createElement('li');
    li.innerHTML = `<strong>${name}</strong> (${date})<br>${desc} <button class='edit-btn'>Edit</button> <button class='delete-btn'>Delete</button>`;
    eventsList.appendChild(li);
    document.querySelector('.add-event form').reset();
    updateRoleUI();
  });

  eventsList.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
      e.target.parentElement.remove();
    } else if (e.target.classList.contains('edit-btn')) {
      const li = e.target.parentElement;
      const [name, rest] = li.innerText.split(' (');
      const [date] = rest.split(')');
      document.getElementById('event-name').value = name;
      document.getElementById('event-date').value = date;
      document.getElementById('event-desc').value = li.childNodes[2].textContent.trim();
      li.remove();
      updateRoleUI();
    }
  });

  // Listen for storage changes (e.g., login/logout in another tab)
  window.addEventListener('storage', updateRoleUI);
});
