// Get player name from URL and show info, allow logs to be created and saved in localStorage
const urlParams = new URLSearchParams(window.location.search);
const playerName = urlParams.get('name') || 'Unknown Player';
document.getElementById('player-name').textContent = playerName;

// Set player photo
const photoMap = {
  'Santhuru Sivamoorthy': 'santhuru.jpg',
  'Vithuran': 'vithuran.jpg',
  'Jenagan': 'jenagan.jpg',
  'Arun': 'arun.jpg',
  'Rion Ockers': 'rion.jpg',
  'Logesan Shandralingam': 'logesan.jpg',
  'Mayuran Sivamoorthy': 'mayuran.jpg',
  'Don Sinthu': 'don.jpg',
  'Kanesh': 'kanesh.jpg',
  'Pradeep': 'pradeep.jpg',
  'Rasa Suji': 'rasa.jpg',
  'Sudarshan': 'sudarshan.jpg',
  'Gobi Annan': 'gobi.jpg',
  'Vaishnavan Selvam': 'vaishnavan.jpg'
};
const photoFile = photoMap[playerName] || 'default.jpg';
document.getElementById('player-photo').src = `assets/players/${photoFile}`;
document.getElementById('player-photo').alt = playerName;

// Career details (placeholder, can be extended)
const careerMap = {
  'Santhuru Sivamoorthy': 'Captain. All-rounder. Leading the team with passion.',
  'Rion Ockers': 'Wicketkeeper. Fast hands and sharp mind.',
  // Add more player career details here as needed
};
document.getElementById('career-details').textContent = careerMap[playerName] || 'No career details yet.';

// Logs (saved in localStorage per player)
const logsKey = `playerLogs_${playerName}`;
const logsList = document.getElementById('logs-list');
function renderLogs() {
  logsList.innerHTML = '';
  const logs = JSON.parse(localStorage.getItem(logsKey) || '[]');
  logs.forEach((log, i) => {
    const li = document.createElement('li');
    li.textContent = log;
    logsList.appendChild(li);
  });
}
renderLogs();
document.getElementById('save-log').onclick = function() {
  const logInput = document.getElementById('log-input');
  const log = logInput.value.trim();
  if (!log) return;
  const logs = JSON.parse(localStorage.getItem(logsKey) || '[]');
  logs.push(log);
  localStorage.setItem(logsKey, JSON.stringify(logs));
  logInput.value = '';
  renderLogs();
};
