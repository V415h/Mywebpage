// Get player name from URL and show info
const urlParams = new URLSearchParams(window.location.search);
const playerName = urlParams.get('name') || 'Unknown Player';
document.getElementById('player-name').textContent = playerName;

// Set player photo
function getFirstName(fullName) {
  return fullName.split(' ')[0].toLowerCase();
}
let photoFile = `${getFirstName(playerName)}.jpg`;
const photoPath = `assets/players/${photoFile}`;
const playerPhoto = document.getElementById('player-photo');
playerPhoto.src = photoPath;
playerPhoto.alt = playerName;
playerPhoto.onerror = function() {
  playerPhoto.onerror = null; // Prevent infinite loop
  playerPhoto.src = 'assets/players/default.jpg';
};

// Career details (placeholder, can be extended)
const careerMap = {
  'Santhuru Sivamoorthy': 'Captain. All-rounder. Leading the team with passion.',
  'Rion Ockers': 'Wicketkeeper. Fast hands and sharp mind.',
  // Add more player career details here as needed
};
document.getElementById('career-details').textContent = careerMap[playerName] || 'No career details yet.';

// --- Career Details CRUD with Supabase ---
const careerFields = [
  { id: 'career-age', label: 'Age', type: 'number' },
  { id: 'career-batting', label: 'Batting Style', type: 'text' },
  { id: 'career-bowling', label: 'Bowling Style', type: 'text' },
  { id: 'career-best', label: 'Career Best Score', type: 'number' },
  { id: 'career-year-best', label: 'This Year Best Score', type: 'number' }
];

const careerDetailsDiv = document.getElementById('career-details');

function renderCareerForm(data, editable) {
  careerDetailsDiv.innerHTML = '';
  careerFields.forEach(f => {
    const val = data && data[f.id] !== undefined ? data[f.id] : '';
    const label = document.createElement('label');
    label.textContent = f.label + ': ';
    const input = document.createElement('input');
    input.type = f.type;
    input.id = f.id;
    input.value = val;
    input.disabled = !editable;
    label.appendChild(input);
    careerDetailsDiv.appendChild(label);
    careerDetailsDiv.appendChild(document.createElement('br'));
  });
  if (editable) {
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Career Details';
    saveBtn.style.marginTop = '1em';
    saveBtn.onclick = saveCareerDetails;
    careerDetailsDiv.appendChild(saveBtn);
  }
}

async function loadCareerDetails() {
  const supabase = window._supabase;
  const { data, error } = await supabase
    .from('player_career')
    .select('*')
    .eq('player_name', playerName)
    .maybeSingle(); // Use maybeSingle to avoid 406 error
  if (error || !data) {
    renderCareerForm({}, isAdmin());
    return;
  }
  // Map DB fields to form fields
  renderCareerForm({
    'career-age': data.age || '',
    'career-batting': data.batting_style || '',
    'career-bowling': data.bowling_style || '',
    'career-best': data.career_best_score || '',
    'career-year-best': data.year_best_score || ''
  }, isAdmin());
}

function isAdmin() {
  return localStorage.getItem('role') === 'admin';
}

async function saveCareerDetails() {
  const supabase = window._supabase;
  const values = {
    player_name: playerName,
    age: parseInt(document.getElementById('career-age').value) || null,
    batting_style: document.getElementById('career-batting').value,
    bowling_style: document.getElementById('career-bowling').value,
    career_best_score: parseInt(document.getElementById('career-best').value) || null,
    year_best_score: parseInt(document.getElementById('career-year-best').value) || null
  };
  // Upsert (insert or update)
  const { error } = await supabase
    .from('player_career')
    .upsert([values], { onConflict: 'player_name' });
  if (!error) {
    alert('Career details saved!');
    loadCareerDetails();
  } else {
    alert('Error saving: ' + error.message);
  }
}

// --- Workout Log Modal ---
function createWorkoutModal() {
  if (document.getElementById('workout-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'workout-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.4)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '1000';

  // Example gym workouts
  const workouts = [
    { name: 'Bench Press', isWeight: true },
    { name: 'Squat', isWeight: true },
    { name: 'Deadlift', isWeight: true },
    { name: 'Pull Ups', isWeight: false },
    { name: 'Push Ups', isWeight: false },
    { name: 'Plank', isWeight: false },
    { name: 'Bicep Curl', isWeight: true },
    { name: 'Tricep Extension', isWeight: true },
    { name: 'Shoulder Press', isWeight: true },
    { name: 'Cardio', isWeight: false },
    { name: 'Swimming', isWeight: false }
  ];

  const form = document.createElement('form');
  form.style.background = '#fff';
  form.style.padding = '2em 1.5em';
  form.style.borderRadius = '12px';
  form.style.minWidth = '320px';
  form.style.maxWidth = '90vw';
  form.style.boxShadow = '0 4px 24px rgba(21,101,192,0.18)';

  form.innerHTML = '<h3>Log Gym Workout</h3>';
  workouts.forEach((w, i) => {
    const row = document.createElement('div');
    row.style.marginBottom = '0.7em';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = `workout-cb-${i}`;
    cb.name = 'workout';
    cb.value = w.name;
    row.appendChild(cb);
    const label = document.createElement('label');
    label.textContent = w.name;
    label.htmlFor = cb.id;
    label.style.marginLeft = '0.5em';
    row.appendChild(label);
    if (w.isWeight) {
      const weightInput = document.createElement('input');
      weightInput.type = 'number';
      weightInput.placeholder = 'Weight (kg)';
      weightInput.style.marginLeft = '1em';
      weightInput.style.width = '80px';
      weightInput.disabled = true;
      weightInput.min = 0;
      cb.addEventListener('change', function() {
        weightInput.disabled = !cb.checked;
      });
      row.appendChild(weightInput);
    }
    const setsInput = document.createElement('input');
    setsInput.type = 'number';
    setsInput.placeholder = 'Sets';
    setsInput.style.marginLeft = '1em';
    setsInput.style.width = '60px';
    setsInput.min = 1;
    setsInput.disabled = true;
    cb.addEventListener('change', function() {
      setsInput.disabled = !cb.checked;
    });
    row.appendChild(setsInput);
    form.appendChild(row);
  });
  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.textContent = 'Save Workouts';
  saveBtn.style.marginTop = '1em';
  saveBtn.style.background = '#1565c0';
  saveBtn.style.color = '#fff';
  saveBtn.style.border = 'none';
  saveBtn.style.borderRadius = '6px';
  saveBtn.style.padding = '0.5rem 1.2rem';
  saveBtn.style.fontWeight = 'bold';
  saveBtn.style.cursor = 'pointer';
  form.appendChild(saveBtn);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = 'Cancel';
  closeBtn.style.marginLeft = '1em';
  closeBtn.onclick = function(e) {
    e.preventDefault();
    modal.remove();
  };
  form.appendChild(closeBtn);

  form.onsubmit = async function(e) {
    e.preventDefault();
    const supabase = window._supabase;
    const today = new Date().toISOString().slice(0, 10);
    let anyChecked = false;
    for (let i = 0; i < workouts.length; i++) {
      const cb = form.querySelector(`#workout-cb-${i}`);
      if (cb.checked) {
        anyChecked = true;
        const w = workouts[i];
        // Find the correct inputs for weight and sets
        let weight = null, sets = null;
        // Find all inputs in the row (cb.parentElement)
        const inputs = cb.parentElement.querySelectorAll('input');
        if (w.isWeight) {
          weight = parseInt(inputs[1]?.value) || null;
          sets = parseInt(inputs[2]?.value) || null;
        } else {
          sets = parseInt(inputs[1]?.value) || null;
        }
        // Save to Supabase
        await supabase.from('player_workout_logs').insert([
          {
            player_name: playerName,
            date: today,
            workout: w.name,
            is_weight: w.isWeight,
            weight: weight,
            sets: sets
          }
        ]);
        // Add to logs UI
        const logMsg = w.isWeight
          ? `${w.name}: ${sets || '?'} sets @ ${weight || '?'}kg`
          : `${w.name}: ${sets || '?'} sets`;
        addLogToSupabaseAndUI(logMsg);
      }
    }
    if (!anyChecked) {
      alert('Select at least one workout!');
      return;
    }
    modal.remove();
  };

  modal.appendChild(form);
  document.body.appendChild(modal);
}

// --- Load and render all logs from Supabase for this player ---
async function loadAllLogs() {
  const supabase = window._supabase;
  const { data, error } = await supabase
    .from('player_logs')
    .select('*')
    .eq('player_name', playerName)
    .order('created_at', { ascending: false });
  const logsList = document.getElementById('logs-list');
  logsList.innerHTML = '';
  if (error || !data || !data.length) {
    logsList.innerHTML = '<li>No logs yet.</li>';
    return;
  }
  data.forEach(log => {
    const li = document.createElement('li');
    const dateStr = log.created_at ? new Date(log.created_at).toLocaleDateString() : '';
    li.innerHTML = `[${dateStr}] <span class="log-msg">${log.log}</span>`;
    // Only allow edit/delete for the assigned player
    if (localStorage.getItem('player') === playerName) {
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.style.marginLeft = '1em';
      editBtn.onclick = function() {
        const newLog = prompt('Edit log:', log.log);
        if (newLog !== null && newLog.trim() !== '') {
          updateLog(log.id, newLog.trim());
        }
      };
      li.appendChild(editBtn);
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.style.marginLeft = '0.5em';
      delBtn.onclick = function() {
        if (confirm('Delete this log?')) {
          deleteLog(log.id);
        }
      };
      li.appendChild(delBtn);
    }
    logsList.appendChild(li);
  });
}

// --- Load and render all workout logs from Supabase for this player ---
async function loadAllWorkoutLogs() {
  const supabase = window._supabase;
  const { data, error } = await supabase
    .from('player_workout_logs')
    .select('*')
    .eq('player_name', playerName)
    .order('created_at', { ascending: false });
  const workoutLogsList = document.getElementById('workout-logs-list');
  workoutLogsList.innerHTML = '';
  if (error || !data || !data.length) {
    workoutLogsList.innerHTML = '<li>No workout logs yet.</li>';
    return;
  }
  data.forEach(log => {
    const dateStr = log.created_at ? new Date(log.created_at).toLocaleDateString() : '';
    let msg = `[${dateStr}] ${log.workout}`;
    if (log.is_weight) {
      msg += `: ${log.sets || '?'} sets @ ${log.weight || '?'}kg`;
    } else if (log.sets) {
      msg += `: ${log.sets} sets`;
    }
    const li = document.createElement('li');
    li.textContent = msg;
    // Only allow edit/delete for the assigned player
    if (localStorage.getItem('player') === playerName) {
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.style.marginLeft = '1em';
      editBtn.onclick = function() {
        const newSets = prompt('Edit sets:', log.sets || '');
        let newWeight = log.weight;
        if (log.is_weight) {
          newWeight = prompt('Edit weight (kg):', log.weight || '');
        }
        if (newSets !== null && newSets.trim() !== '') {
          updateWorkoutLog(log.id, newSets.trim(), newWeight);
        }
      };
      li.appendChild(editBtn);
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.style.marginLeft = '0.5em';
      delBtn.onclick = function() {
        if (confirm('Delete this workout log?')) {
          deleteWorkoutLog(log.id);
        }
      };
      li.appendChild(delBtn);
    }
    workoutLogsList.appendChild(li);
  });
}

async function updateLog(id, newLog) {
  const supabase = window._supabase;
  await supabase.from('player_logs').update({ log: newLog }).eq('id', id);
  loadAllLogs();
}

async function deleteLog(id) {
  const supabase = window._supabase;
  await supabase.from('player_logs').delete().eq('id', id);
  loadAllLogs();
}

async function updateWorkoutLog(id, newSets, newWeight) {
  const supabase = window._supabase;
  await supabase.from('player_workout_logs').update({ sets: newSets, weight: newWeight }).eq('id', id);
  loadAllWorkoutLogs();
}

async function deleteWorkoutLog(id) {
  const supabase = window._supabase;
  await supabase.from('player_workout_logs').delete().eq('id', id);
  loadAllWorkoutLogs();
}

// On load, show all logs for this player
loadAllLogs();
loadAllWorkoutLogs();

// When adding a new log, reload all logs
async function addLogToSupabaseAndUI(logMsg) {
  const supabase = window._supabase;
  const now = new Date();
  await supabase.from('player_logs').insert([
    { player_name: playerName, log: logMsg, created_at: now.toISOString() }
  ]);
  loadAllLogs();
}

// Attach event handler for Save Log button to save to Supabase
const saveLogBtn = document.getElementById('save-log');
if (saveLogBtn) {
  saveLogBtn.onclick = async function() {
    const logInput = document.getElementById('log-input');
    const log = logInput.value.trim();
    if (!log) return;
    await addLogToSupabaseAndUI(log);
    logInput.value = '';
  };
}

// Show workout log modal only for assigned player
const currentPlayer = localStorage.getItem('player');
if (currentPlayer === playerName) {
  // Remove auto-injected Workout Log button if it already exists in HTML
  const autoWorkoutBtn = document.getElementById('workout-log-btn');
  if (autoWorkoutBtn) {
    autoWorkoutBtn.onclick = null; // Remove any previous handler
    autoWorkoutBtn.onclick = createWorkoutModal;
  } else {
    // Only add the button if it doesn't already exist
    const workoutBtn = document.createElement('button');
    workoutBtn.id = 'workout-log-btn';
    workoutBtn.textContent = 'Workout Log';
    workoutBtn.style.marginLeft = '1em';
    workoutBtn.onclick = createWorkoutModal;
    document.getElementById('save-log').after(workoutBtn);
  }
}

// Only show the workout logs section if the user is the assigned player or an admin
const workoutLogsSection = document.querySelectorAll('.player-info-logs')[1];
if (!(localStorage.getItem('player') === playerName || localStorage.getItem('role') === 'admin')) {
  workoutLogsSection.style.display = 'none';
}

// Only show the player logs section for everyone, but only allow edit/add for assigned player or admin
const playerLogsSection = document.querySelectorAll('.player-info-logs')[0];
const isOwnerOrAdmin = localStorage.getItem('player') === playerName || localStorage.getItem('role') === 'admin';
// Hide log input and save button if not owner or admin
if (!isOwnerOrAdmin) {
  document.getElementById('log-input').style.display = 'none';
  document.getElementById('save-log').style.display = 'none';
}

// Add edit button for admin if not already editing
if (isAdmin()) {
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit Career Details';
  editBtn.style.marginTop = '1em';
  editBtn.onclick = function() {
    // Reload form in editable mode
    loadCareerDetails();
    setTimeout(() => {
      // Enable all inputs and show save button
      document.querySelectorAll('#career-details input').forEach(input => input.disabled = false);
      if (!document.querySelector('#career-details button')) {
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save Career Details';
        saveBtn.style.marginTop = '1em';
        saveBtn.onclick = saveCareerDetails;
        document.getElementById('career-details').appendChild(saveBtn);
      }
    }, 100);
  };
  document.getElementById('career-details').appendChild(editBtn);
}

// If not admin, disable editing
if (!isAdmin()) {
  document.querySelectorAll('#career-details input').forEach(input => input.disabled = true);
}
