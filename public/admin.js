'use strict';

const $ = id => document.getElementById(id);

function getKey() {
  const k = $('apiKey').value.trim();
  if (k) {
    $('key-status').textContent = '✓ Schlüssel gesetzt';
    $('key-status').style.color = 'var(--green)';
  }
  return k;
}

$('apiKey').addEventListener('input', () => {
  const k = $('apiKey').value.trim();
  $('key-status').textContent = k ? '✓ Schlüssel gesetzt' : 'Schlüssel nicht gesetzt.';
  $('key-status').style.color = k ? 'var(--green)' : 'var(--muted)';
});

function showMsg(id, text, ok) {
  const el = $(id);
  el.textContent = text;
  el.className = 'msg ' + (ok ? 'ok' : 'err');
}

async function addContest() {
  const v = $('f-value').value;
  const body = {
    title:       $('f-title').value,
    cat:         $('f-cat').value,
    icon:        $('f-icon').value || '🎁',
    sponsor:     $('f-sponsor').value,
    deadline:    $('f-deadline').value,
    value_eur:   v !== '' ? parseFloat(v) : null,
    is_real:     parseInt($('f-real').value),
    is_favorite: $('f-favorite').checked ? 1 : 0,
    description: $('f-desc').value,
    url:         $('f-url').value || '#',
  };
  try {
    const res = await fetch('/api/admin/contests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getKey() },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.status);
    showMsg('add-msg', '✓ Erstellt mit ID ' + data.id, true);
    $('f-favorite').checked = false;
  } catch (e) {
    showMsg('add-msg', '✗ ' + e.message, false);
  }
}

async function toggleFavorite(id, currentlyFav, btn) {
  const newVal = currentlyFav ? 0 : 1;
  btn.disabled = true;
  try {
    const res = await fetch('/api/admin/contests/' + id + '/favorite', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getKey() },
      body: JSON.stringify({ is_favorite: newVal }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.status);
    loadContests();
  } catch (e) {
    btn.disabled = false;
    alert('Fehler: ' + e.message);
  }
}

// ── Edit modal ─────────────────────────────────────────────────────────────
function openEdit(c) {
  $('e-id').value       = c.id;
  $('e-title').value    = c.title;
  $('e-cat').value      = c.cat;
  $('e-icon').value     = c.icon;
  $('e-sponsor').value  = c.sponsor;
  $('e-deadline').value = c.deadline;
  $('e-value').value    = c.value_eur ?? '';
  $('e-real').value     = c.is_real ? '1' : '0';
  $('e-desc').value     = c.description;
  $('e-url').value      = c.url !== '#' ? c.url : '';
  $('e-active').checked = !!c.active;
  $('edit-msg').textContent = '';
  $('edit-backdrop').style.display = '';
  $('edit-modal').style.display = '';
  $('e-title').focus();
}

function closeEdit() {
  $('edit-backdrop').style.display = 'none';
  $('edit-modal').style.display = 'none';
}

async function saveEdit(e) {
  e.preventDefault();
  const id  = parseInt($('e-id').value);
  const v   = $('e-value').value;
  const body = {
    title:       $('e-title').value,
    cat:         $('e-cat').value,
    icon:        $('e-icon').value || '🎁',
    sponsor:     $('e-sponsor').value,
    deadline:    $('e-deadline').value,
    value_eur:   v !== '' ? parseFloat(v) : null,
    is_real:     parseInt($('e-real').value),
    description: $('e-desc').value,
    url:         $('e-url').value || '#',
    active:      $('e-active').checked ? 1 : 0,
  };
  const btn = $('e-save-btn');
  btn.disabled = true; btn.textContent = 'Speichern…';
  try {
    const res = await fetch('/api/admin/contests/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getKey() },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.status);
    showMsg('edit-msg', '✓ Gespeichert', true);
    setTimeout(() => { closeEdit(); loadContests(); }, 700);
  } catch (err) {
    showMsg('edit-msg', '✗ ' + err.message, false);
  } finally {
    btn.disabled = false; btn.textContent = 'Speichern';
  }
}

$('edit-close').addEventListener('click', closeEdit);
$('e-cancel-btn').addEventListener('click', closeEdit);
$('edit-backdrop').addEventListener('click', closeEdit);
$('edit-form').addEventListener('submit', saveEdit);

// ── Contest list ────────────────────────────────────────────────────────────
async function loadContests() {
  const tbody = $('table-body');
  tbody.innerHTML = '<tr><td class="load-row" colspan="8">Laden…</td></tr>';
  try {
    const res = await fetch('/api/admin/contests', {
      headers: { 'Authorization': 'Bearer ' + getKey() },
    });
    const list = await res.json();
    if (!res.ok) throw new Error(list.error || res.status);

    const favCount = list.filter(c => c.is_favorite && c.active).length;
    const byId = new Map(list.map(c => [c.id, c]));

    tbody.innerHTML = list.map(c => {
      const isFav = !!c.is_favorite;
      const canFav = isFav || favCount < 3;
      const favBtn = c.active
        ? `<button class="fav-btn${isFav ? ' fav-on' : ''}" data-id="${c.id}" data-fav="${isFav ? 1 : 0}" ${!canFav ? 'disabled title="Max. 3 Favoriten"' : ''}>
            ${isFav ? '★' : '☆'}
           </button>`
        : '–';

      return `
        <tr${!c.active ? ' class="row-inactive"' : ''}>
          <td style="color:var(--muted)">#${c.id}</td>
          <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.icon} ${c.title}</td>
          <td style="color:var(--muted)">${c.cat}</td>
          <td style="color:var(--muted)">${c.deadline}</td>
          <td><span class="badge ${c.is_real ? 'badge-real' : 'badge-demo'}">${c.is_real ? 'Echt' : 'Demo'}</span></td>
          <td><span class="badge ${c.active ? '' : 'badge-off'}">${c.active ? 'Aktiv' : 'Inaktiv'}</span></td>
          <td>${favBtn}</td>
          <td>
            <button class="edit-btn" data-id="${c.id}">✏ Bearbeiten</button>
            ${c.active ? `<button class="deact-btn" data-id="${c.id}">Deakt.</button>` : '–'}
          </td>
        </tr>
      `;
    }).join('');

    const inactiveCount = list.filter(c => !c.active).length;
    $('inactive-count').textContent = inactiveCount ? `${inactiveCount} inaktiv` : '';

    tbody.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', () => toggleFavorite(parseInt(btn.dataset.id), parseInt(btn.dataset.fav), btn));
    });
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openEdit(byId.get(parseInt(btn.dataset.id))));
    });
    tbody.querySelectorAll('.deact-btn').forEach(btn => {
      btn.addEventListener('click', () => deactivate(parseInt(btn.dataset.id), btn));
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td class="load-row err" colspan="8">✗ ${e.message}</td></tr>`;
  }
}

async function deactivate(id, btn) {
  btn.disabled = true; btn.textContent = '…';
  try {
    const res = await fetch('/api/admin/contests/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + getKey() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    loadContests();
  } catch (e) {
    btn.disabled = false; btn.textContent = 'Deakt.';
    alert('Fehler: ' + e.message);
  }
}

// ── Hide-inactive toggle ────────────────────────────────────────────────────
$('btn-hide-inactive').addEventListener('click', () => {
  const hiding = $('contest-table').classList.toggle('hide-inactive');
  $('btn-hide-inactive').classList.toggle('active', hiding);
  $('hide-label').textContent = hiding ? 'Inaktive einblenden' : 'Inaktive ausblenden';
});

document.getElementById('btn-add').addEventListener('click', addContest);
document.getElementById('btn-load').addEventListener('click', loadContests);
