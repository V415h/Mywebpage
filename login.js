// Simple login demo: stores role in localStorage and redirects back
const form = document.querySelector('.login-form');
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  // Only madmin/mokkuadmin is admin, all others are player
  let role = 'player';
  if (username === 'madmin' && password === 'mokkuadmin') {
    role = 'admin';
  }
  localStorage.setItem('role', role);
  // Go back to previous page
  const prev = sessionStorage.getItem('prevPage') || 'index.html';
  window.location.href = prev;
});
