(() => {
  const data = window.BORING_RECEIPTS_INDEX || { receipts: [], semanticMap: {} };
  const receipts = data.receipts || [];
  const $ = (id) => document.getElementById(id);
  const els = {
    q: $('receipt-q'),
    mode: $('receipt-mode'),
    category: $('receipt-category'),
    status: $('receipt-status'),
    node: $('receipt-node'),
    tbody: $('receipt-results'),
    count: $('receipt-count'),
    clear: $('receipt-clear'),
    note: $('semantic-note'),
  };
  if (!els.tbody) return;

  const norm = (s) => String(s || '').toLowerCase();
  const words = (s) => norm(s).match(/[a-z0-9_.+-]+/g) || [];
  const hay = (r) => [r.id, r.date, r.node, r.category, r.status, r.gesture, r.file].join(' ');
  const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();
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
  const populate = (el, vals, allLabel) => {
    el.innerHTML = `<option value="">${allLabel}</option>` + vals.map(v => `<option value="${v}">${v}</option>`).join('');
  };
  populate(els.category, uniq(receipts.map(r => r.category)), 'all axes');
  populate(els.node, uniq(receipts.map(r => r.node)), 'all nodes');

  const semanticTerms = (query) => {
    const q = norm(query);
    const out = new Set(words(query));
    for (const [concept, terms] of Object.entries(data.semanticMap || {})) {
      if (q.includes(concept.replace(/-/g, ' ')) || terms.some(t => q.includes(norm(t)))) {
        out.add(concept);
        terms.forEach(t => words(t).forEach(w => out.add(w)));
      }
    }
    const shortcuts = {
      'cabia': ['context', 'capacity', 'fits', 'passkey', 'quality'],
      'recuperava': ['retrieval', 'passkey', 'needle', 'quality'],
      'buun': ['bunn', 'ablation', 'huihui', 'stock', 'aime', '30k'],
      'bunn': ['ablation', 'huihui', 'stock', 'aime', '30k'],
      'lento': ['slower', 'negative', 'decode', 'tok'],
      'falha': ['blocked', 'timeout', 'unsafe', 'failed'],
      'travou': ['blocked', 'timeout', 'unsafe'],
      'qualidade': ['quality', 'passkey', 'kld', 'aime', 'correctness'],
    };
    for (const [k, vals] of Object.entries(shortcuts)) if (q.includes(k)) vals.forEach(v => out.add(v));
    return [...out];
  };
  const scoreText = (r, query, semantic) => {
    if (!query.trim()) return 1;
    const h = norm(hay(r));
    const qWords = semantic ? semanticTerms(query) : words(query);
    let score = 0;
    for (const w of qWords) {
      if (!w) continue;
      if (norm(r.id) === w) score += 10;
      if (h.includes(w)) score += semantic ? 2 : 4;
      if (semantic && norm(r.category).includes(w)) score += 3;
      if (semantic && norm(r.status).includes(w)) score += 2;
    }
    return score;
  };
  const render = () => {
    const q = els.q.value || '';
    const semantic = els.mode.value === 'semantic';
    let rows = receipts.map(r => ({ r, score: scoreText(r, q, semantic) }))
      .filter(x => !q.trim() || x.score > 0)
      .filter(x => !els.category.value || x.r.category === els.category.value)
      .filter(x => !els.node.value || x.r.node === els.node.value)
      .filter(x => !els.status.value || statusGroup(x.r.status) === els.status.value);
    rows.sort((a, b) => (q.trim() ? b.score - a.score : 0) || String(b.r.date).localeCompare(a.r.date) || a.r.id.localeCompare(b.r.id, undefined, { numeric: true }));
    els.count.textContent = `${rows.length} / ${receipts.length} receipts`;
    els.note.hidden = !semantic;
    els.tbody.innerHTML = rows.map(({ r, score }) => `
      <tr>
        <td data-l="ID"><a href="${r.url}">${r.id}</a></td>
        <td data-l="Date">${r.date}</td>
        <td data-l="Axis">${r.category}</td>
        <td data-l="Node">${r.node}</td>
        <td data-l="Status" class="${statusClass(r.status)}" title="${r.status}">${label(r.status)}</td>
        <td data-l="Gesture" class="gesture">${r.gesture}</td>
        <td data-l="Score">${q.trim() ? score : ''}</td>
      </tr>`).join('') || '<tr><td colspan="7">No receipts match.</td></tr>';
  };
  [els.q, els.mode, els.category, els.status, els.node].forEach(el => el.addEventListener('input', render));
  els.clear.addEventListener('click', () => { els.q.value = ''; els.mode.value = 'text'; els.category.value = ''; els.status.value = ''; els.node.value = ''; render(); });
  render();
})();
