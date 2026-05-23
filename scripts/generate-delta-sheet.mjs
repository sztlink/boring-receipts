#!/usr/bin/env node
/**
 * Boring-receipts delta sheet SVG (rung 2 weight-quant sweep).
 *
 * Layout: one block per metric; the three quants stacked; bar length = value
 * (longer bar = larger value, intuitive); value + delta% as a right-aligned
 * label; a per-metric direction note (higher=faster / lower=leaner) gives the
 * sense without a traffic-light color (AXES.md: color marks series, never verdict).
 * Data is the source; this script is a sibling render. Edit DATA + GATE, re-run.
 */
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(here, '..', 'assets');
const docs = path.join(here, '..', 'docs', 'assets');
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(docs, { recursive: true });

const C = {
  paper:'#f1ece0', ink:'#161410', muted:'#6e675a', line:'#1c1a15', faint:'#cdbe9f',
  panel:'#f7f1e3', green:'#356b46', bar:'#3a352c'
};
const QLAB = ['Q4','Q5','Q8'];

// metric: vals aligned to QLAB; base = index of baseline; dir note; fmt
// dedicated mode (R2b) — clean baseline, GPU idle 687 MiB, no resident process
const METRICS = [
  { label:'tg  decode',   unit:'t/s', vals:[131.76,118.74,89.80],  base:0, dir:'↑ higher = faster', fmt:v=>v.toFixed(1) },
  { label:'pp  prefill',  unit:'t/s', vals:[4455,4346,4621],       base:0, dir:'↑ higher = faster', fmt:v=>String(v) },
  { label:'VRAM peak',    unit:'GiB', vals:[5.6,6.3,8.7],          base:0, dir:'↓ lower = leaner',  fmt:v=>v.toFixed(1) },
  { label:'PPL  quality', unit:'',    vals:[7.5002,7.3948,7.3285], base:2, dir:'↓ lower = better (Q8 ref)', fmt:v=>v.toFixed(2) },
];
const GATE = { state:'PASS', version:'gate-v1',
  detail:'PPL Δ < 5% vs Q8_0 — none broke the model (Q4 +2.3% · Q5 +0.9%)' };

const esc = s => String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const gateColor = s => s==='PASS'?C.green:s==='FAIL'?'#a33a2b':'#9a7320';

const W=1180, H=952;
const BX0=128, BMAXW=420, VALX=620, DELX=702;

function block(y, m){
  const max = Math.max(...m.vals);
  const baseVal = m.vals[m.base];
  let s = `
    <text x="58" y="${y}" class="mono mlabel">${esc(m.label)}</text>
    <text x="58" y="${y+16}" class="mono unit">${esc(m.unit)}</text>
    <text x="1090" y="${y}" class="mono dir" text-anchor="end">${esc(m.dir)}</text>`;
  m.vals.forEach((v,i)=>{
    const ry = y + 30 + i*26;
    const w = Math.max((v/max)*BMAXW, 2);
    const d = ((v-baseVal)/baseVal)*100;
    const dlabel = i===m.base ? (m.base===2?'ref':'baseline') : (d>0?'+':'')+d.toFixed(1)+'%';
    s += `
      <text x="98" y="${ry+13}" class="mono q" text-anchor="end">${QLAB[i]}</text>
      <rect x="${BX0}" y="${ry+2}" width="${w.toFixed(1)}" height="15" fill="${C.bar}" opacity="0.9"/>
      <text x="${VALX}" y="${ry+13}" class="mono val" text-anchor="end">${esc(m.fmt(v))}</text>
      <text x="${DELX}" y="${ry+13}" class="mono del">${esc(dlabel)}</text>`;
  });
  return s;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="boring receipts delta sheet rung 2 weight quant sweep">
  <defs>
    <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse">
      <rect width="32" height="32" fill="${C.paper}"/>
      <path d="M0 8h32M0 23h32M7 0v32M24 0v32" stroke="${C.faint}" stroke-width="0.6" opacity="0.22"/>
    </pattern>
    <style>
      .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}
      .tag{font-size:13px;font-weight:700;letter-spacing:2.2px;fill:#a33a2b;}
      .title{font-size:40px;font-weight:800;letter-spacing:-1.5px;fill:${C.ink};}
      .sub{font-size:16px;fill:${C.muted};}
      .leg{font-size:12.5px;fill:${C.muted};}
      .mlabel{font-size:17px;fill:${C.ink};font-weight:700;}
      .unit{font-size:12px;fill:${C.muted};}
      .dir{font-size:13px;fill:${C.muted};}
      .q{font-size:14px;fill:${C.ink};}
      .val{font-size:14px;fill:${C.ink};font-weight:700;}
      .del{font-size:13px;fill:${C.muted};}
      .small{font-size:12.5px;fill:${C.muted};}
      .micro{font-size:11px;fill:${C.muted};}
    </style>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="28" y="28" width="${W-56}" height="${H-56}" fill="none" stroke="${C.line}" stroke-width="1.5"/>
  <text x="58" y="66" class="mono tag">BORING-RECEIPTS · RUNG 2 · WEIGHT-QUANT SWEEP</text>
  <text x="58" y="116" class="mono title">delta sheet</text>
  <text x="58" y="146" class="mono sub">Llama-3.1-8B · AYA-3090 · llama.cpp b9286 · three weight quants · dedicated mode</text>

  <rect x="58" y="170" width="${W-116}" height="42" fill="${C.paper}" stroke="${gateColor(GATE.state)}" stroke-width="1.6"/>
  <text x="78" y="197" class="mono mlabel" fill="${gateColor(GATE.state)}">GATE: ${esc(GATE.state)}</text>
  <text x="300" y="197" class="mono small">${esc(GATE.detail)} · ${esc(GATE.version)}</text>

  <text x="58" y="244" class="mono leg">Q4_K_M · Q5_K_M · Q8_0 weight quants · bar length = value · delta vs Q4 baseline (PPL vs Q8 ref)</text>

  ${block(300, METRICS[0])}
  ${block(444, METRICS[1])}
  ${block(588, METRICS[2])}
  ${block(732, METRICS[3])}

  <line x1="58" y1="854" x2="${W-58}" y2="854" stroke="${C.faint}" stroke-width="1"/>
  <text x="58" y="878" class="mono small">tg (decode) falls hard with bits — memory-bound. pp (prefill) is flat — compute-bound. that divergence is the thesis.</text>
  <text x="58" y="898" class="mono small">trade-off vs Q4 baseline: Q8 is −32% decode &amp; +55% VRAM, for 2.3% lower PPL (better) — Q4 is the speed/footprint floor.</text>
  <text x="58" y="918" class="mono micro">reproduce: llama-bench -m {Q4,Q5,Q8} -ngl 99 -p 512 -n 128 -r 5 · gate: llama-perplexity -f wiki.test.raw</text>
</svg>`;

fs.writeFileSync(path.join(out,'delta-sheet-rung2-quant-sweep.svg'), svg, 'utf8');
fs.writeFileSync(path.join(docs,'delta-sheet-rung2-quant-sweep.svg'), svg, 'utf8');
console.log('wrote delta-sheet-rung2-quant-sweep.svg (unidirectional bars, gate '+GATE.state+')');
