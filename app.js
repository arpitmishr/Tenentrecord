// Simple LocalStorage-based data model
let state = {
  rooms: JSON.parse(localStorage.getItem('rooms') || '[]'),
  tenants: JSON.parse(localStorage.getItem('tenants') || '[]')
};

function saveState() {
  localStorage.setItem('rooms', JSON.stringify(state.rooms));
  localStorage.setItem('tenants', JSON.stringify(state.tenants));
}

function render() {
  let main = document.getElementById('main');
  let html = '<h2>Rooms</h2><ul>';
  if (state.rooms.length === 0) html += '<li>No rooms added.</li>';
  state.rooms.forEach(r => {
    html += `<li>${r.name}</li>`;
  });
  html += '</ul><h2>Tenants</h2><table border="1" cellpadding="5"><tr><th>Name</th><th>Room</th><th>Move-in</th><th>Verified</th><th>Rent</th><th>Elec (Prev/Curr/Unit)</th><th>Services</th></tr>';
  if (state.tenants.length === 0) html += '<tr><td colspan="7">No tenants added.</td></tr>';
  state.tenants.forEach(t => {
    let services = t.addonServices.map(s => `${s.name} (${s.charge})`).join(', ');
    let units = t.meterCurr - t.meterPrev;
    html += `<tr>
      <td>${t.name}</td>
      <td>${t.room}</td>
      <td>${t.moveInDate}</td>
      <td>${t.verified ? "Yes" : "No"}</td>
      <td>${t.rentRate}</td>
      <td>${t.meterPrev} / ${t.meterCurr} / ${units}</td>
      <td>${services}</td>
    </tr>`;
  });
  html += '</table>';
  main.innerHTML = html;
}
render();

// Modal helpers
function hideModals() {
  document.getElementById('roomForm').style.display = "none";
  document.getElementById('tenantForm').style.display = "none";
}

// Room functions
function showAddRoomForm() {
  document.getElementById('roomForm').style.display = "flex";
  document.getElementById('roomName').value = '';
}
function addRoom(e) {
  e.preventDefault();
  let name = document.getElementById('roomName').value;
  state.rooms.push({ name });
  saveState();
  hideModals();
  render();
}

// Tenant functions
function showAddTenantForm() {
  let sel = document.getElementById('tenantRoom');
  sel.innerHTML = state.rooms.map(r => `<option value="${r.name}">${r.name}</option>`).join('');
  document.getElementById('tenantForm').style.display = "flex";
  document.getElementById('tenantName').value = '';
  document.getElementById('moveInDate').value = '';
  document.getElementById('verified').checked = false;
  document.getElementById('rentRate').value = '';
  document.getElementById('meterPrev').value = '';
  document.getElementById('meterCurr').value = '';
  document.getElementById('addonService').value = '';
}
function addTenant(e) {
  e.preventDefault();
  let name = document.getElementById('tenantName').value;
  let room = document.getElementById('tenantRoom').value;
  let moveInDate = document.getElementById('moveInDate').value;
  let verified = document.getElementById('verified').checked;
  let rentRate = Number(document.getElementById('rentRate').value);
  let meterPrev = Number(document.getElementById('meterPrev').value);
  let meterCurr = Number(document.getElementById('meterCurr').value);
  let addonService = document.getElementById('addonService').value;
  let addonServices = [];
  if (addonService) {
    addonServices = addonService.split(';').map(s => {
      let parts = s.split(',');
      return { name: parts[0]?.trim(), charge: Number(parts[1]) || 0 };
    }).filter(s => s.name);
  }
  state.tenants.push({ name, room, moveInDate, verified, rentRate, meterPrev, meterCurr, addonServices });
  saveState();
  hideModals();
  render();
}

// PWA support (Optional)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}