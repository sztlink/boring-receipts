(() => {
  const data = window.BORING_RECEIPTS_INDEX || { receipts: [] };
  const receipts = data.receipts || [];
  const $ = (id) => document.getElementById(id);
  const tbody = $('home-receipt-results');
  const count = $('home-receipt-count');
  const meta = $('home-receipt-meta');
  if (!tbody || !receipts.length) return;

  const norm = (s) => String(s || '').toLowerCase();
  const idNum = (id) => {
    const m = String(id || '').match(/^(?:R|RS)(\d+)/i);
    return m ? Number(m[1]) : 0;
  };
  const statusGroup = (status) => {
    const s = norm(status);
    if (s === 'pass' || s.includes('pass_to') || s.includes('smoke_tie') || s.includes('aime_smoke') || s.includes('axis_added')) return 'pass';
    if (s.includes('negative') || s.includes('no_delta') || s.includes('no-delta') || s.includes('slower')) return 'negative';
    if (s.includes('blocked')) return 'blocked';
    if (s.includes('partial') || s.includes('timeout') || s.includes('wall')) return 'partial';
    if (s.includes('mixed')) return 'mixed';
    return 'other';
  };
  const statusClass = (status) => {
    const g = statusGroup(status);
    if (g === 'pass') return 'pass';
    if (g === 'blocked' || g === 'partial') return 'warn';
    if (g === 'negative' || g === 'mixed') return 'gb';
    return '';
  };
  const label = (status) => {
    const g = statusGroup(status);
    return g === 'pass' ? 'PASS' : g === 'negative' ? 'NEG/NO-DELTA' : g === 'blocked' ? 'BLOCKED' : g === 'partial' ? 'PARTIAL' : g === 'mixed' ? 'MIXED' : status;
  };
  const rows = [...receipts].sort((a, b) =>
    String(b.date).localeCompare(a.date) || idNum(b.id) - idNum(a.id) || String(b.id).localeCompare(String(a.id))
  );
  const latestDate = rows[0]?.date || data.updated || '';
  const top = rows.slice(0, 14);

  if (count) count.textContent = `${receipts.length} receipts indexed, latest ${latestDate}`;
  if (meta) meta.textContent = `JOB 0142 · LIVE INDEX\n${latestDate} · ${receipts.length} RECEIPTS\n*BORING*  PG 1/1`;
  tbody.innerHTML = top.map((r) => `
    <tr>
      <td data-l="ID"><a href="${r.url}">${r.id}</a></td>
      <td data-l="Date">${r.date}</td>
      <td data-l="Axis">${r.category}</td>
      <td data-l="Node">${r.node}</td>
      <td data-l="Status" class="${statusClass(r.status)}" title="${r.status}">${label(r.status)}</td>
      <td data-l="Gesture" class="gesture">${r.gesture}</td>
      <td data-l="Link"><a href="${r.url}">open</a></td>
    </tr>`).join('');
})();
