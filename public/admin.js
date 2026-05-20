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
  const body = {
    title:       $('f-title').value,
    cat:         $('f-cat').value,
    icon:        '🎁',
    sponsor:     $('f-sponsor').value,
    deadline:    $('f-deadline').value,
    is_real:     parseInt($('f-real').value),
    is_favorite: $('f-favorite').checked ? 1 : 0,
    description: $('f-desc').value,
    url:         $('f-url').value || '#',
    draw_date:   $('f-draw-date').value.trim() || null,
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
  $('e-id').value        = c.id;
  $('e-title').value     = c.title;
  $('e-cat').value       = c.cat;
  $('e-icon').value      = c.icon;
  $('e-sponsor').value   = c.sponsor;
  $('e-deadline').value  = c.deadline;
  $('e-real').value      = c.is_real ? '1' : '0';
  $('e-desc').value      = c.description;
  $('e-url').value       = c.url !== '#' ? c.url : '';
  $('e-draw-date').value = c.draw_date || '';
  $('e-active').checked  = !!c.active;
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
  const body = {
    title:       $('e-title').value,
    cat:         $('e-cat').value,
    icon:        $('e-icon').value || '🎁',
    sponsor:     $('e-sponsor').value,
    deadline:    $('e-deadline').value,
    is_real:     parseInt($('e-real').value),
    description: $('e-desc').value,
    url:         $('e-url').value || '#',
    active:      $('e-active').checked ? 1 : 0,
    draw_date:   $('e-draw-date').value.trim() || null,
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

      const searchText = `${c.title} ${c.sponsor} ${c.cat}`.toLowerCase().replace(/"/g, '');
      return `
        <tr${!c.active ? ' class="row-inactive"' : ''} data-search="${searchText}">
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
    applySearch();

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

// ── List search ────────────────────────────────────────────────────────────
function applySearch() {
  const term = $('list-search').value.trim().toLowerCase();
  document.querySelectorAll('#table-body tr[data-search]').forEach(row => {
    row.style.display = (!term || row.dataset.search.includes(term)) ? '' : 'none';
  });
}
$('list-search').addEventListener('input', applySearch);

// ── Hide-inactive toggle ────────────────────────────────────────────────────
$('btn-hide-inactive').addEventListener('click', () => {
  const hiding = $('contest-table').classList.toggle('hide-inactive');
  $('btn-hide-inactive').classList.toggle('active', hiding);
  $('hide-label').textContent = hiding ? 'Inaktive einblenden' : 'Inaktive ausblenden';
});

document.getElementById('btn-add').addEventListener('click', addContest);
document.getElementById('btn-load').addEventListener('click', loadContests);

// ── Collapsible cards ───────────────────────────────────────────────────────
function setupCollapsible(toggleId, cardId) {
  const toggle = $(toggleId);
  const card   = $(cardId);
  if (!toggle || !card) return;
  toggle.addEventListener('click', () => card.classList.toggle('collapsed'));
}

setupCollapsible('add-card-toggle',     'add-card');
setupCollapsible('reports-card-toggle', 'reports-card');
setupCollapsible('list-card-toggle',    'list-card');

// ── Agent-Berichte ──────────────────────────────────────────────────────────
function escHtml(t) {
  return String(t)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderInline(text) {
  return escHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="md-code">$1</code>');
}

function renderMd(md) {
  const lines = md.split('\n');
  let html = '', i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const hm = line.match(/^(#{1,3}) (.+)$/);
    if (hm) {
      const lv = hm[1].length;
      html += `<div class="md-h${lv}">${renderInline(hm[2])}</div>`;
      i++; continue;
    }
    if (/^---+$/.test(line.trim())) {
      html += '<hr class="md-hr">'; i++; continue;
    }
    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) { rows.push(lines[i]); i++; }
      const headers = rows[0].split('|').slice(1,-1).map(c => c.trim());
      html += '<div class="md-table-wrap"><table class="md-table"><thead><tr>';
      html += headers.map(h => `<th>${renderInline(h)}</th>`).join('');
      html += '</tr></thead><tbody>';
      for (let r = 2; r < rows.length; r++) {
        const cells = rows[r].split('|').slice(1,-1).map(c => c.trim());
        html += '<tr>' + cells.map(c => `<td>${renderInline(c)}</td>`).join('') + '</tr>';
      }
      html += '</tbody></table></div>'; continue;
    }
    if (/^[-*] /.test(line)) {
      html += '<ul class="md-list">';
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        html += `<li>${renderInline(lines[i].replace(/^[-*] /,''))}</li>`; i++;
      }
      html += '</ul>'; continue;
    }
    if (line.trim() === '') { i++; continue; }
    html += `<p class="md-p">${renderInline(line)}</p>`; i++;
  }
  return html;
}

function formatReportDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
  return `${parseInt(d)}. ${months[parseInt(m)-1]} ${y}`;
}

async function loadAgentReports() {
  const key = $('apiKey').value.trim();
  const wrap = $('reports-wrap');
  if (!key) {
    wrap.innerHTML = '<p style="font-size:0.84rem;color:var(--red)">✗ Bitte zuerst den API-Schlüssel eingeben.</p>';
    return;
  }
  wrap.innerHTML = '<p style="font-size:0.84rem;color:var(--muted)">Laden…</p>';
  try {
    const res = await fetch('/api/admin/agent-reports', {
      headers: { 'Authorization': 'Bearer ' + key },
    });
    const list = await res.json();
    if (!res.ok) throw new Error(list.error || 'HTTP ' + res.status);
    if (list.length === 0) {
      wrap.innerHTML = '<p style="font-size:0.84rem;color:var(--muted)">Noch keine Berichte vorhanden.</p>';
      return;
    }
    wrap.innerHTML = list.map(r => `
      <div class="report-item" data-date="${r.date}">
        <button class="report-header">
          <span>${formatReportDate(r.date)}</span>
          <svg class="report-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="report-body">
          <div class="report-content" style="color:var(--muted);font-size:0.83rem">Wird geladen…</div>
        </div>
      </div>
    `).join('');
    wrap.querySelectorAll('.report-item').forEach(item => {
      item.querySelector('.report-header').addEventListener('click', async () => {
        const wasOpen = item.classList.contains('open');
        item.classList.toggle('open');
        if (!wasOpen && !item.dataset.loaded) {
          item.dataset.loaded = '1';
          const content = item.querySelector('.report-content');
          try {
            const r = await fetch(`/api/admin/agent-reports/${item.dataset.date}`, {
              headers: { 'Authorization': 'Bearer ' + $('apiKey').value.trim() },
            });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            const md = await r.text();
            content.innerHTML = renderMd(md);
          } catch (e) {
            content.innerHTML = `<p style="color:var(--red)">Fehler: ${e.message}</p>`;
            delete item.dataset.loaded;
          }
        }
      });
    });
  } catch (e) {
    wrap.innerHTML = `<p style="color:var(--red);font-size:0.84rem">✗ ${e.message}</p>`;
  }
}

$('btn-load-reports').addEventListener('click', loadAgentReports);
