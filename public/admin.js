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
  } catch (e) {
    showMsg('add-msg', '✗ ' + e.message, false);
  }
}

async function loadContests() {
  const tbody = $('table-body');
  tbody.innerHTML = '<tr><td class="load-row" colspan="7">Laden…</td></tr>';
  try {
    const res = await fetch('/api/admin/contests', {
      headers: { 'Authorization': 'Bearer ' + getKey() },
    });
    const list = await res.json();
    if (!res.ok) throw new Error(list.error || res.status);

    tbody.innerHTML = list.map(c => `
      <tr>
        <td style="color:var(--muted)">#${c.id}</td>
        <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.icon} ${c.title}</td>
        <td style="color:var(--muted)">${c.cat}</td>
        <td style="color:var(--muted)">${c.deadline}</td>
        <td><span class="badge ${c.is_real ? 'badge-real' : 'badge-demo'}">${c.is_real ? 'Echt' : 'Demo'}</span></td>
        <td><span class="badge ${c.active ? '' : 'badge-off'}">${c.active ? 'Aktiv' : 'Inaktiv'}</span></td>
        <td>${c.active ? `<button class="deact-btn" data-id="${c.id}">Deakt.</button>` : '–'}</td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.deact-btn').forEach(btn => {
      btn.addEventListener('click', () => deactivate(parseInt(btn.dataset.id), btn));
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td class="load-row err" colspan="7">✗ ${e.message}</td></tr>`;
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
