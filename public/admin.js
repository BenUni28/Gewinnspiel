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

    tbody.innerHTML = list.map(c => {
      const isFav = !!c.is_favorite;
      const canFav = isFav || favCount < 3;
      const favBtn = c.active
        ? `<button class="fav-btn${isFav ? ' fav-on' : ''}" data-id="${c.id}" data-fav="${isFav ? 1 : 0}" ${!canFav ? 'disabled title="Max. 3 Favoriten"' : ''}>
            ${isFav ? '★' : '☆'}
           </button>`
        : '–';

      return `
        <tr>
          <td style="color:var(--muted)">#${c.id}</td>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.icon} ${c.title}</td>
          <td style="color:var(--muted)">${c.cat}</td>
          <td style="color:var(--muted)">${c.deadline}</td>
          <td><span class="badge ${c.is_real ? 'badge-real' : 'badge-demo'}">${c.is_real ? 'Echt' : 'Demo'}</span></td>
          <td><span class="badge ${c.active ? '' : 'badge-off'}">${c.active ? 'Aktiv' : 'Inaktiv'}</span></td>
          <td>${favBtn}</td>
          <td>${c.active ? `<button class="deact-btn" data-id="${c.id}">Deakt.</button>` : '–'}</td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = parseInt(btn.dataset.id);
        const fav = parseInt(btn.dataset.fav);
        toggleFavorite(id, fav, btn);
      });
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

document.getElementById('btn-add').addEventListener('click', addContest);
document.getElementById('btn-load').addEventListener('click', loadContests);
