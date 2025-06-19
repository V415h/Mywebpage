// Simple role-based UI logic for demo (no real authentication)
document.addEventListener('DOMContentLoaded', function() {
  // Remove role selector logic
  const addEventCard = document.querySelector('.add-event');
  const eventsList = document.querySelector('.events-list ul');

  function getRole() {
    // Only return 'player' or 'admin' if actually logged in
    const role = localStorage.getItem('role');
    if (role === 'admin' || role === 'player') return role;
    return '';
  }

  // Supabase client
  const supabase = window._supabase;

  // Save event to Supabase
  async function saveEventToSupabase(event) {
    const { error } = await supabase.from('events').insert([event]);
    return error;
  }

  // Load events from Supabase
  async function loadEventsFromSupabase() {
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (error) return [];
    return data || [];
  }

  // --- Player Availability for Events ---
  // Table: event_availability (event_id, player, available)
  async function fetchEventAvailability(eventName) {
    const { data, error } = await supabase
      .from('event_availability')
      .select('*')
      .eq('event_id', eventName);
    return data || [];
  }

  async function saveEventAvailability(eventName, player, available) {
    // Upsert: delete old, insert new
    await supabase
      .from('event_availability')
      .delete()
      .eq('event_id', eventName)
      .eq('player', player);
    await supabase
      .from('event_availability')
      .insert([{ event_id: eventName, player, available }]);
  }

  function renderEventAvailabilityList(container, availability) {
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

  // Update renderEvents to add player availability UI
  function renderEvents(events) {
    eventsList.innerHTML = '';
    if (!events.length) {
      eventsList.innerHTML = '<li>No events yet.</li>';
      return;
    }
    events.forEach(ev => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${ev.name}</strong> (${ev.date})<br>${ev.description || ''}<br><span style='font-size:0.95em;color:#666;'>Created by: ${ev.created_by}</span> <button class='edit-btn'>Edit</button> <button class='delete-btn'>Delete</button>`;
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
        li.appendChild(availDiv);
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
          await saveEventAvailability(ev.name, player, available);
          statusSpan.textContent = 'Saved!';
          setTimeout(() => statusSpan.textContent = '', 1200);
          // Refresh list
          const avail = await fetchEventAvailability(ev.name);
          renderEventAvailabilityList(availDiv, avail);
        };
        fetchEventAvailability(ev.name).then(avail => {
          renderEventAvailabilityList(availDiv, avail);
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
        // For admin or not logged in, show only the summary (no checkboxes or save button)
        const availDiv = document.createElement('div');
        availDiv.style.marginTop = '0.7em';
        li.appendChild(availDiv);
        fetchEventAvailability(ev.name).then(avail => renderEventAvailabilityList(availDiv, avail));
      }
      eventsList.appendChild(li);
    });
    updateRoleUI();
  }

  function updateRoleUI() {
    if (getRole() === 'admin' || getRole() === 'player') {
      addEventCard.style.display = 'flex';
      document.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.style.display = 'inline-block');
    } else {
      addEventCard.style.display = 'none';
      document.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.style.display = 'none');
    }
  }

  // Load events on page load
  loadEventsFromSupabase().then(renderEvents);

  document.querySelector('.add-event form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (getRole() !== 'admin' && getRole() !== 'player') return;
    const name = document.getElementById('event-name').value;
    const date = document.getElementById('event-date').value;
    const desc = document.getElementById('event-desc').value;
    const created_by = localStorage.getItem('player') || localStorage.getItem('role') || 'unknown';
    const error = await saveEventToSupabase({ name, date, description: desc, created_by });
    if (error) {
      alert('Error saving event: ' + error.message);
      return;
    }
    loadEventsFromSupabase().then(renderEvents);
    document.querySelector('.add-event form').reset();
    updateRoleUI();
  });

  eventsList.addEventListener('click', async function(e) {
    if (e.target.classList.contains('delete-btn')) {
      // Find event name and date from the list item
      const li = e.target.parentElement;
      const [name, rest] = li.innerText.split(' (');
      const [date] = rest.split(')');
      // Delete from Supabase
      await supabase.from('events').delete().eq('name', name).eq('date', date);
      li.remove();
      if (!eventsList.children.length) {
        eventsList.innerHTML = '<li>No events yet.</li>';
      }
    } else if (e.target.classList.contains('edit-btn')) {
      const li = e.target.parentElement;
      const [name, rest] = li.innerText.split(' (');
      const [date] = rest.split(')');
      document.getElementById('event-name').value = name;
      document.getElementById('event-date').value = date;
      document.getElementById('event-desc').value = li.childNodes[2].textContent.trim();
      // Remove from Supabase (will be re-added on save)
      await supabase.from('events').delete().eq('name', name).eq('date', date);
      li.remove();
      if (!eventsList.children.length) {
        eventsList.innerHTML = '<li>No events yet.</li>';
      }
    }
  });

  // Listen for storage changes (e.g., login/logout in another tab)
  window.addEventListener('storage', updateRoleUI);
});
