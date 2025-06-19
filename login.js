// Simple login demo: uses Supabase for user management
const form = document.querySelector('.login-form');
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  let users = [];
  try {
    users = await getUsers();
    if (!Array.isArray(users)) {
      alert('Could not fetch users from Supabase.');
      console.error('Supabase returned:', users);
      return;
    }
  } catch (err) {
    alert('Error fetching users from Supabase.');
    console.error('Fetch error:', err);
    return;
  }
  if (!users.length) {
    alert('No users found in Supabase.');
    return;
  }
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    alert('Invalid username or password!');
    return;
  }
  localStorage.setItem('role', user.role);
  if (user.role === 'player') {
    localStorage.setItem('player', user.player); // Save the player name for tournaments
  } else {
    localStorage.removeItem('player');
  }
  // Go back to previous page
  const prev = sessionStorage.getItem('prevPage') || 'index.html';
  if (prev.startsWith('player-info.html')) {
    // Preserve query string if present
    const query = sessionStorage.getItem('prevQuery') || '';
    window.location.href = prev + (query ? '?' + query : '');
  } else {
    window.location.href = prev;
  }
});

const addUserBtn = document.getElementById('add-user-btn');
const addUserModal = document.getElementById('add-user-modal');
const addUserMsg = document.getElementById('add-user-message');

// Only show Add User button for admin
function updateAddUserBtnVisibility() {
  const role = localStorage.getItem('role');
  if (role === 'admin') {
    addUserBtn.style.display = 'inline-block';
  } else {
    addUserBtn.style.display = 'none';
    addUserModal.style.display = 'none';
  }
}

updateAddUserBtnVisibility();
window.addEventListener('storage', updateAddUserBtnVisibility);

addUserBtn.onclick = function() {
  if (localStorage.getItem('role') !== 'admin') return;
  addUserModal.style.display = 'flex';
  addUserMsg.textContent = '';
};
const closeModalBtn = document.getElementById('close-modal');
closeModalBtn.onclick = function() {
  addUserModal.style.display = 'none';
};

const addUserForm = document.getElementById('add-user-form');

// Use Supabase for user management
async function getUsers() {
  const { data, error } = await _supabase
    .from('users')
    .select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data || [];
}

async function addUserToSupabase(user) {
  const { error } = await _supabase
    .from('users')
    .insert([user]);
  return error;
}

addUserForm.onsubmit = async function(e) {
  e.preventDefault();
  if (localStorage.getItem('role') !== 'admin') {
    addUserMsg.textContent = 'Only admins can create users!';
    return;
  }
  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value;
  const role = document.getElementById('new-role').value;
  const player = document.getElementById('assign-player').value;
  const users = await getUsers();
  if (users.find(u => u.username === username)) {
    addUserMsg.textContent = 'Username already exists!';
    return;
  }
  const error = await addUserToSupabase({ username, password, role, player });
  if (error) {
    addUserMsg.textContent = 'Error creating user!';
    return;
  }
  addUserMsg.style.color = '#388e3c';
  addUserMsg.textContent = 'User created!';
  addUserForm.reset();
  setTimeout(() => {
    addUserModal.style.display = 'none';
    addUserMsg.style.color = '#d32f2f';
    addUserMsg.textContent = '';
  }, 1000);
};
