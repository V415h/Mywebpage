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
  { id: 'career-jersy', label: 'Jersey No', type: 'number' },
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
    
    // Create the career item container
    const careerItem = document.createElement('div');
    careerItem.className = 'career-item';
    
    // Create the label
    const label = document.createElement('div');
    label.className = 'career-label';
    label.textContent = f.label;
    
    // Create the value container
    const valueContainer = document.createElement('div');
    valueContainer.className = 'career-value';
    
    if (editable) {
      // Create editable input
      const input = document.createElement('input');
      input.type = f.type;
      input.id = f.id;
      input.value = val;
      input.className = 'career-value editable';
      input.style.border = '1px solid #e2e8f0';
      input.style.borderRadius = '6px';
      input.style.padding = '0.4rem 0.75rem';
      input.style.width = '100%';
      input.style.maxWidth = '200px';
      valueContainer.appendChild(input);
    } else {
      // Create read-only display
      valueContainer.textContent = val || 'Not set';
      if (!val) {
        valueContainer.style.color = '#a0aec0';
        valueContainer.style.fontStyle = 'italic';
      }
    }
    
    careerItem.appendChild(label);
    careerItem.appendChild(valueContainer);
    careerDetailsDiv.appendChild(careerItem);
  });
  
  if (editable) {
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Career Details';
    saveBtn.onclick = saveCareerDetails;
    careerDetailsDiv.appendChild(saveBtn);
  } else if (!editable && isLoggedIn()) {
    // Show edit button for logged-in users (but only admins can actually edit)
    const editBtn = document.createElement('button');
    editBtn.textContent = isAdmin() ? 'Edit Career Details' : 'View Only (Admin access required to edit)';
    editBtn.disabled = !isAdmin();
    editBtn.style.opacity = isAdmin() ? '1' : '0.6';
    if (isAdmin()) {
      editBtn.onclick = () => renderCareerForm(data, true);
    }
    careerDetailsDiv.appendChild(editBtn);
  }
  
  // Add a message area under career details
  let careerMsg = document.getElementById('career-msg');
  if (!careerMsg) {
    careerMsg = document.createElement('div');
    careerMsg.id = 'career-msg';
    careerMsg.style.marginTop = '1em';
    careerMsg.style.textAlign = 'center';
    careerMsg.style.padding = '0.5rem';
    careerMsg.style.borderRadius = '6px';
    careerMsg.style.fontSize = '0.9rem';
    careerDetailsDiv.appendChild(careerMsg);
  }
}

// Helper function to check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('role') === 'admin' || localStorage.getItem('role') === 'player';
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
    'career-jersy': data.jersy_no || '',
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
  let careerMsg = document.getElementById('career-msg');
  if (!careerMsg) {
    careerMsg = document.createElement('div');
    careerMsg.id = 'career-msg';
    careerMsg.style.marginTop = '1em';
    careerMsg.style.textAlign = 'center';
    document.getElementById('career-details').appendChild(careerMsg);
  }
  const values = {
    player_name: playerName,
    age: parseInt(document.getElementById('career-age').value) || null,
    jersy_no: parseInt(document.getElementById('career-jersy').value) || null,
    batting_style: document.getElementById('career-batting').value,
    bowling_style: document.getElementById('career-bowling').value,
    career_best_score: parseInt(document.getElementById('career-best').value) || null,
    year_best_score: parseInt(document.getElementById('career-year-best').value) || null
  };
  // Upsert (insert or update)
  const { error } = await supabase
    .from('player_career')
    .upsert([values], { onConflict: 'player_name' });  if (!error) {
    careerMsg.textContent = '✅ Career details saved successfully!';
    careerMsg.style.color = '#16a085';
    careerMsg.style.background = '#d4edda';
    careerMsg.style.border = '1px solid #c3e6cb';
    setTimeout(() => {
      careerMsg.textContent = '';
      careerMsg.style.background = '';
      careerMsg.style.border = '';
    }, 3000);
    loadCareerDetails();
  } else {
    careerMsg.textContent = '❌ Error saving: ' + error.message;
    careerMsg.style.color = '#721c24';
    careerMsg.style.background = '#f8d7da';
    careerMsg.style.border = '1px solid #f5c6cb';
    setTimeout(() => {
      careerMsg.textContent = '';
      careerMsg.style.background = '';
      careerMsg.style.border = '';
    }, 3000);
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
    { name: 'Pull Ups', isWeight: false, isMinutes: false },
    { name: 'Push Ups', isWeight: false, isMinutes: false },
    { name: 'Plank', isWeight: false, isMinutes: true },
    { name: 'Bicep Curl', isWeight: true },
    { name: 'Tricep Extension', isWeight: true },
    { name: 'Shoulder Press', isWeight: true },
    { name: 'Cardio', isWeight: false, isMinutes: true },
    { name: 'Swimming', isWeight: false, isMinutes: true }
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
    let setsOrMinutesInput;
    if (w.isMinutes) {
      setsOrMinutesInput = document.createElement('input');
      setsOrMinutesInput.type = 'number';
      setsOrMinutesInput.placeholder = 'Minutes';
      setsOrMinutesInput.style.marginLeft = '1em';
      setsOrMinutesInput.style.width = '60px';
      setsOrMinutesInput.min = 1;
      setsOrMinutesInput.disabled = true;
      cb.addEventListener('change', function() {
        setsOrMinutesInput.disabled = !cb.checked;
      });
      row.appendChild(setsOrMinutesInput);
    } else {
      setsOrMinutesInput = document.createElement('input');
      setsOrMinutesInput.type = 'number';
      setsOrMinutesInput.placeholder = 'Sets';
      setsOrMinutesInput.style.marginLeft = '1em';
      setsOrMinutesInput.style.width = '60px';
      setsOrMinutesInput.min = 1;
      setsOrMinutesInput.disabled = true;
      cb.addEventListener('change', function() {
        setsOrMinutesInput.disabled = !cb.checked;
      });
      row.appendChild(setsOrMinutesInput);
    }
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
        // Find the correct inputs for weight and sets/minutes
        let weight = null, sets = null, minutes = null;
        const inputs = cb.parentElement.querySelectorAll('input');
        if (w.isWeight) {
          weight = parseInt(inputs[1]?.value) || null;
          sets = parseInt(inputs[2]?.value) || null;
        } else if (w.isMinutes) {
          minutes = parseInt(inputs[1]?.value) || null;
        } else {
          sets = parseInt(inputs[1]?.value) || null;
        }
        await supabase.from('player_workout_logs').insert([
          {
            player_name: playerName,
            date: today,
            workout: w.name,
            is_weight: w.isWeight,
            weight: weight,
            sets: sets,
            minutes: minutes
          }
        ]);
      }
    }
    if (!anyChecked) {
      alert('Select at least one workout!');
      return;
    }
    modal.remove();
    loadAllWorkoutLogs();
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
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  const workoutLogsList = document.getElementById('workout-logs-list');
  workoutLogsList.innerHTML = '';
  if (error || !data || !data.length) {
    workoutLogsList.innerHTML = '<li>No workout logs yet.</li>';
    return;
  }
  // Group logs by date
  const grouped = {};
  data.forEach(log => {
    const dateStr = log.date || (log.created_at ? new Date(log.created_at).toISOString().slice(0,10) : '');
    if (!grouped[dateStr]) grouped[dateStr] = [];
    let msg = `${log.workout}`;
    if (log.is_weight) {
      msg += `: ${log.sets || '?'} sets @ ${log.weight || '?'}kg`;
    } else if (log.minutes) {
      msg += `: ${log.minutes} min`;
    } else if (log.sets) {
      msg += `: ${log.sets} sets`;
    }
    grouped[dateStr].push({msg, log});
  });
  Object.entries(grouped).forEach(([dateStr, logs]) => {
    const li = document.createElement('li');
    li.textContent = `[${dateStr}] ` + logs.map(l => l.msg).join(', ');
    // Only allow edit/delete for the assigned player (one button per line)
    if (isCurrentPlayer()) {
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.style.marginLeft = '1em';
      editBtn.onclick = function() {
        // Create a modal for editing all workouts for this date
        const modal = document.createElement('div');
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
        const form = document.createElement('form');
        form.style.background = '#fff';
        form.style.padding = '2em 1.5em';
        form.style.borderRadius = '12px';
        form.style.minWidth = '320px';
        form.style.maxWidth = '90vw';
        form.style.boxShadow = '0 4px 24px rgba(21,101,192,0.18)';
        form.innerHTML = `<h3>Edit Workouts for ${dateStr}</h3>`;
        const fields = [];
        logs.forEach((l, idx) => {
          const row = document.createElement('div');
          row.style.marginBottom = '1em';
          row.innerHTML = `<b>${l.log.workout}</b>`;
          const setsInput = document.createElement('input');
          setsInput.type = 'number';
          setsInput.placeholder = 'Sets';
          setsInput.value = l.log.sets || '';
          setsInput.style.marginLeft = '1em';
          setsInput.style.width = '60px';
          row.appendChild(setsInput);
          let weightInput = null;
          if (l.log.is_weight) {
            weightInput = document.createElement('input');
            weightInput.type = 'number';
            weightInput.placeholder = 'Weight (kg)';
            weightInput.value = l.log.weight || '';
            weightInput.style.marginLeft = '1em';
            weightInput.style.width = '80px';
            row.appendChild(weightInput);
          }
          form.appendChild(row);
          fields.push({id: l.log.id, setsInput, weightInput});
        });
        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.textContent = 'Save';
        saveBtn.style.marginTop = '1em';
        saveBtn.style.background = '#1565c0';
        saveBtn.style.color = '#fff';
        saveBtn.style.border = 'none';
        saveBtn.style.borderRadius = '6px';
        saveBtn.style.padding = '0.5rem 1.2rem';
        saveBtn.style.fontWeight = 'bold';
        saveBtn.style.cursor = 'pointer';
        form.appendChild(saveBtn);
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.marginLeft = '1em';
        cancelBtn.onclick = function(e) {
          e.preventDefault();
          modal.remove();
        };
        form.appendChild(cancelBtn);
        form.onsubmit = async function(e) {
          e.preventDefault();
          for (const f of fields) {
            const newSets = f.setsInput.value;
            const newWeight = f.weightInput ? f.weightInput.value : null;
            await updateWorkoutLog(f.id, newSets, newWeight);
          }
          modal.remove();
          loadAllWorkoutLogs();
        };
        modal.appendChild(form);
        document.body.appendChild(modal);
      };
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.style.marginLeft = '0.5em';
      delBtn.onclick = function() {
        if (confirm('Delete all workout logs for this date?')) {
          logs.forEach(l => deleteWorkoutLog(l.log.id));
        }
      };
      li.appendChild(editBtn);
      li.appendChild(delBtn);
    }
    workoutLogsList.appendChild(li);
  });
}

// Helper: case-insensitive, trimmed player match
function isCurrentPlayer() {
  const stored = (localStorage.getItem('player') || '').trim().toLowerCase();
  const urlName = (playerName || '').trim().toLowerCase();
  return stored === urlName;
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

// Load career details on page load
loadCareerDetails();

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

// Only show the workout logs section (list) for everyone, but only show the button for assigned player
const workoutLogsSection = document.querySelectorAll('.player-info-logs')[1];
const workoutLogBtn = document.getElementById('workout-log-btn');
if (workoutLogsSection) {
  workoutLogsSection.style.display = '';
  if (!(localStorage.getItem('player') === playerName)) {
    if (workoutLogBtn) workoutLogBtn.style.display = 'none';
  } else {
    if (workoutLogBtn) workoutLogBtn.style.display = '';
  }
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

/*
 * IMPORTANT: Ensure your Supabase table has a unique constraint on player_name for upsert to work:
 *
 *   alter table player_career add constraint unique_player_name unique(player_name);
 *
 * Also, check your Supabase Row Level Security (RLS) policies to allow select and upsert for the right users.
 */

// End of file: ensure no syntax errors
