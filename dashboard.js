// ─── Config ───────────────────────────────────────────────────────────────────
const API = 'http://localhost:3000/api';

// ─── State ────────────────────────────────────────────────────────────────────
let allIncidents = [];

// ─── Severity / Status helpers ────────────────────────────────────────────────
const SEV_COLOR = {
  Critical: '#ff4060',
  High:     '#ff8c38',
  Medium:   '#f5c842',
  Low:      '#38d9a9',
};

const STATUS_CLASS = {
  Open:          'stat-open',
  Investigating: 'stat-investigating',
  Escalated:     'stat-escalated',
  Resolved:      'stat-resolved',
  Closed:        'stat-closed',
};

function sevBadge(sev) {
  const cls = { Critical:'sev-critical', High:'sev-high', Medium:'sev-medium', Low:'sev-low' }[sev] || '';
  return `<span class="severity-badge ${cls}">${sev}</span>`;
}

function statusBadge(st) {
  const cls = STATUS_CLASS[st] || '';
  return `<span class="status-badge ${cls}">${st}</span>`;
}

function formatTs(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Clock ────────────────────────────────────────────────────────────────────
function startClock() {
  const el = document.getElementById('clock');
  function tick() {
    el.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
  }
  tick();
  setInterval(tick, 1000);
}

// ─── Navigation ───────────────────────────────────────────────────────────────
const VIEW_LABELS = {
  dashboard: ['Dashboard', 'Security Operations Center'],
  incidents: ['Incidents', 'All logged security events'],
  report:    ['Log Incident', 'Submit a new security event'],
};

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const view = item.dataset.view;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    const [title, sub] = VIEW_LABELS[view];
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('pageSub').textContent = sub;
    if (view === 'incidents') renderFilteredTable();
  });
});

// ─── Fetch & Init ─────────────────────────────────────────────────────────────
async function fetchAll() {
  try {
    const [incRes, statsRes] = await Promise.all([
      fetch(`${API}/incidents`),
      fetch(`${API}/stats`),
    ]);

    allIncidents = await incRes.json();
    const stats   = await statsRes.json();

    renderStats(stats);
    renderCharts(stats);
    renderRecentActivity();
    renderFilteredTable();
  } catch (err) {
    console.error('Failed to fetch data. Is the backend running?', err);
    // Graceful demo fallback
    showOfflineNotice();
  }
}

function showOfflineNotice() {
  const tables = ['incidentTable'];
  tables.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-dim);font-family:var(--font-mono);font-size:12px;">⚠ Backend offline — run <code>node backend/server.js</code> to connect</td></tr>`;
  });
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function renderStats(stats) {
  document.getElementById('statTotal').textContent    = stats.total;
  document.getElementById('statCritical').textContent = stats.bySeverity.Critical;
  document.getElementById('statActive').textContent   = stats.activeCount;
  const resolved = (stats.byStatus.Resolved || 0) + (stats.byStatus.Closed || 0);
  document.getElementById('statResolved').textContent = resolved;
}

// ─── Charts ───────────────────────────────────────────────────────────────────
function renderCharts(stats) {
  renderBarChart(stats);
  renderDonut(stats);
}

function renderBarChart(stats) {
  const container = document.getElementById('severityChart');
  const sev = stats.bySeverity;
  const max = Math.max(...Object.values(sev), 1);
  const order = ['Critical', 'High', 'Medium', 'Low'];

  container.innerHTML = order.map(s => `
    <div class="bar-row">
      <span class="bar-label" style="color:${SEV_COLOR[s]}">${s}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(sev[s] / max) * 100}%;background:${SEV_COLOR[s]}"></div>
      </div>
      <span class="bar-count">${sev[s]}</span>
    </div>
  `).join('');
}

function renderDonut(stats) {
  const canvas = document.getElementById('statusDonut');
  const ctx = canvas.getContext('2d');
  const statusData = stats.byStatus;

  const STATUS_COLORS = {
    Open:          '#4da6ff',
    Investigating: '#f5c842',
    Escalated:     '#ff4060',
    Resolved:      '#38d9a9',
    Closed:        '#3a4f68',
  };

  const entries = Object.entries(statusData).filter(([, v]) => v > 0);
  const total   = entries.reduce((s, [, v]) => s + v, 0);

  const cx = 80, cy = 80, r = 60, ri = 38;
  let angle = -Math.PI / 2;

  ctx.clearRect(0, 0, 160, 160);

  entries.forEach(([key, val]) => {
    const sweep = (val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = STATUS_COLORS[key] || '#555';
    ctx.fill();
    angle += sweep;
  });

  // Inner cutout
  ctx.beginPath();
  ctx.arc(cx, cy, ri, 0, Math.PI * 2);
  ctx.fillStyle = '#111722';
  ctx.fill();

  // Center label
  ctx.fillStyle = '#c9d6e8';
  ctx.font = '600 20px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total, cx, cy - 6);
  ctx.font = '400 9px Inter, sans-serif';
  ctx.fillStyle = '#5a7090';
  ctx.fillText('incidents', cx, cy + 12);

  // Legend
  const legend = document.getElementById('donutLegend');
  legend.innerHTML = entries.map(([key, val]) => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${STATUS_COLORS[key]}"></div>
      <span>${key} <strong style="color:var(--text)">${val}</strong></span>
    </div>
  `).join('');
}

function renderRecentActivity() {
  const sorted = [...allIncidents].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  const container = document.getElementById('recentActivity');

  container.innerHTML = sorted.map(inc => `
    <div class="recent-item" onclick="openModal('${inc.id}')">
      <div class="recent-dot" style="background:${SEV_COLOR[inc.severity] || '#555'}"></div>
      <div class="recent-info">
        <div class="recent-id">${inc.id}</div>
        <div class="recent-type">${inc.attackType}</div>
        <div class="recent-time">${timeAgo(inc.timestamp)} · ${inc.sourceIP}</div>
      </div>
    </div>
  `).join('');
}

// ─── Table ────────────────────────────────────────────────────────────────────
function renderFilteredTable() {
  const search  = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const severity = document.getElementById('severityFilter')?.value || 'All';
  const status   = document.getElementById('statusFilter')?.value   || 'All';

  let data = allIncidents;

  if (severity !== 'All') data = data.filter(i => i.severity === severity);
  if (status   !== 'All') data = data.filter(i => i.status   === status);
  if (search)             data = data.filter(i =>
    i.attackType.toLowerCase().includes(search) ||
    i.sourceIP.includes(search) ||
    (i.targetHost || '').toLowerCase().includes(search) ||
    i.id.toLowerCase().includes(search)
  );

  document.getElementById('resultCount').textContent = `${data.length} result${data.length !== 1 ? 's' : ''}`;

  const tbody = document.getElementById('incidentTable');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-dim);font-family:var(--font-mono);font-size:12px;">No incidents match your filters</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(i => `
    <tr onclick="openModal('${i.id}')">
      <td class="td-id">${i.id}</td>
      <td class="td-ts">${formatTs(i.timestamp)}</td>
      <td>${sevBadge(i.severity)}</td>
      <td style="font-weight:500">${i.attackType}</td>
      <td class="td-mono" style="font-size:11px;color:var(--text-dim)">${i.sourceIP}</td>
      <td class="td-mono" style="font-size:11px">${i.targetHost || '—'}</td>
      <td>${i.mitreTechnique ? `<span class="mitre-tag">${i.mitreTechnique}</span>` : '<span style="color:var(--text-muted)">—</span>'}</td>
      <td style="font-size:12px;color:var(--text-dim)">${i.analyst || '—'}</td>
      <td>${statusBadge(i.status)}</td>
      <td><button class="detail-btn" onclick="event.stopPropagation();openModal('${i.id}')">View</button></td>
    </tr>
  `).join('');
}

// ─── Filters ──────────────────────────────────────────────────────────────────
document.getElementById('searchInput')?.addEventListener('input',   renderFilteredTable);
document.getElementById('severityFilter')?.addEventListener('change', renderFilteredTable);
document.getElementById('statusFilter')?.addEventListener('change',   renderFilteredTable);

// ─── Modal ────────────────────────────────────────────────────────────────────
function openModal(id) {
  const inc = allIncidents.find(i => i.id === id);
  if (!inc) return;

  document.getElementById('modalId').textContent         = inc.id;
  document.getElementById('modalAttackType').textContent = inc.attackType;

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-row">
      <div class="modal-field">
        <div class="modal-field-label">Severity</div>
        <div class="modal-field-value">${sevBadge(inc.severity)}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">Status</div>
        <div class="modal-field-value">${statusBadge(inc.status)}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">Timestamp</div>
        <div class="modal-field-value">${formatTs(inc.timestamp)}</div>
      </div>
    </div>
    <div class="modal-row">
      <div class="modal-field">
        <div class="modal-field-label">Source IP</div>
        <div class="modal-field-value">${inc.sourceIP}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">Target Host</div>
        <div class="modal-field-value">${inc.targetHost || '—'}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">Analyst</div>
        <div class="modal-field-value">${inc.analyst || '—'}</div>
      </div>
    </div>
    <div class="modal-row">
      <div class="modal-field">
        <div class="modal-field-label">MITRE Tactic</div>
        <div class="modal-field-value">${inc.mitreTactic || '—'}</div>
      </div>
      <div class="modal-field">
        <div class="modal-field-label">MITRE Technique</div>
        <div class="modal-field-value">${inc.mitreTechnique ? `<span class="mitre-tag">${inc.mitreTechnique}</span>` : '—'}</div>
      </div>
    </div>
    ${inc.description ? `
    <div>
      <div class="modal-field-label" style="margin-bottom:6px">Description</div>
      <div class="modal-description">${inc.description}</div>
    </div>` : ''}
  `;

  document.getElementById('modalBackdrop').classList.add('open');
}

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('modalBackdrop').classList.remove('open');
});

document.getElementById('modalBackdrop').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modalBackdrop')) {
    document.getElementById('modalBackdrop').classList.remove('open');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.getElementById('modalBackdrop').classList.remove('open');
});

// ─── Form ─────────────────────────────────────────────────────────────────────
document.getElementById('submitIncident').addEventListener('click', async () => {
  const feedback = document.getElementById('formFeedback');
  const body = {
    severity:       document.getElementById('formSeverity').value,
    status:         document.getElementById('formStatus').value,
    attackType:     document.getElementById('formAttackType').value.trim(),
    sourceIP:       document.getElementById('formSourceIP').value.trim(),
    targetHost:     document.getElementById('formTargetHost').value.trim(),
    analyst:        document.getElementById('formAnalyst').value.trim(),
    description:    document.getElementById('formDescription').value.trim(),
    mitreTactic:    document.getElementById('formMitreTactic').value.trim(),
    mitreTechnique: document.getElementById('formMitreTechnique').value.trim(),
  };

  if (!body.severity || !body.status || !body.attackType || !body.sourceIP) {
    feedback.innerHTML = `<span class="feedback-err">⚠ Please fill in all required fields.</span>`;
    return;
  }

  try {
    const res = await fetch(`${API}/incidents`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!res.ok) throw new Error(await res.text());
    const created = await res.json();

    feedback.innerHTML = `<span class="feedback-ok">✓ Incident ${created.id} created successfully.</span>`;

    // Clear form
    ['formSeverity','formStatus','formAttackType','formSourceIP','formTargetHost','formAnalyst','formDescription','formMitreTactic','formMitreTechnique']
      .forEach(id => { document.getElementById(id).value = ''; });

    // Refresh data
    await fetchAll();
    setTimeout(() => { feedback.innerHTML = ''; }, 4000);
  } catch (err) {
    feedback.innerHTML = `<span class="feedback-err">✗ Failed to submit. Backend may be offline.</span>`;
  }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
startClock();
fetchAll();
