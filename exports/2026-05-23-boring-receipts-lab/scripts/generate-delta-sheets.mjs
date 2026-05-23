#!/usr/bin/env node
/**
 * Generate delta-sheet SVGs for all receipts that benefit from a chart.
 * Two primitives: barsSheet (stacked unidirectional bars) and curveSheet
 * (line panels). szt.link light tokens; color marks series, never verdict;
 * bar length = value; data is the source, this is a sibling render.
 *
 * Note: R2b's sheet (delta-sheet-rung2-quant-sweep.svg) is produced by
 * generate-delta-sheet.mjs (kept as-is). This script makes the rest.
 */
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(here, '..', 'assets');
const docs = path.join(here, '..', 'docs', 'assets');
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(docs, { recursive: true });

const C = {
  paper:'#f1ece0', ink:'#161410', muted:'#6e675a', line:'#1c1a15', faint:'#cdbe9f',
  panel:'#f7f1e3', bar:'#3a352c', blue:'#2f5f87', green:'#356b46', red:'#a33a2b'
};
const esc = s => String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

function write(name, svg){
  fs.writeFileSync(path.join(out, name), svg, 'utf8');
  fs.writeFileSync(path.join(docs, name), svg, 'utf8');
  console.log('wrote', name);
}

function doc({w,h,tag,title,sub,body,footer=[]}){
  const fy = h - 18 - (footer.length-1)*20;
  const foot = footer.map((t,i)=>`<text x="58" y="${fy + i*20}" class="mono ${i===footer.length-1?'micro':'small'}">${esc(t)}</text>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
  <defs>
    <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse">
      <rect width="32" height="32" fill="${C.paper}"/>
      <path d="M0 8h32M0 23h32M7 0v32M24 0v32" stroke="${C.faint}" stroke-width="0.6" opacity="0.22"/>
    </pattern>
    <style>
      .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}
      .tag{font-size:13px;font-weight:700;letter-spacing:2.2px;fill:${C.red};}
      .title{font-size:38px;font-weight:800;letter-spacing:-1.5px;fill:${C.ink};}
      .sub{font-size:15px;fill:${C.muted};}
      .pl{font-size:16px;font-weight:700;fill:${C.ink};}
      .un{font-size:11px;fill:${C.muted};}
      .lbl{font-size:13px;fill:${C.ink};}
      .val{font-size:13px;font-weight:700;fill:${C.ink};}
      .del{font-size:12px;fill:${C.muted};}
      .ax{font-size:11px;fill:${C.muted};}
      .leg{font-size:12px;fill:${C.muted};}
      .small{font-size:12px;fill:${C.muted};}
      .micro{font-size:10.5px;fill:${C.muted};}
    </style>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect x="28" y="28" width="${w-56}" height="${h-56}" fill="none" stroke="${C.line}" stroke-width="1.5"/>
  <text x="58" y="64" class="mono tag">${esc(tag)}</text>
  <text x="58" y="112" class="mono title">${esc(title)}</text>
  <text x="58" y="140" class="mono sub">${esc(sub)}</text>
  ${body}
  ${foot}
</svg>`;
}

// ---- bars primitive: metrics = [{label,unit,dir,base,fmt,items:[{name,val}]}]
function barsSheet(name, {tag,title,sub,metrics,footer,w=1180}){
  const BX0=150, BMAXW=430, VALX=640, DELX=720;
  let y=190, body='';
  for(const m of metrics){
    const vals=m.items.map(i=>i.val), max=Math.max(...vals), base=vals[m.base];
    body += `<text x="58" y="${y}" class="mono pl">${esc(m.label)}</text>
      <text x="58" y="${y+16}" class="mono un">${esc(m.unit||'')}</text>
      <text x="1090" y="${y}" class="mono un" text-anchor="end">${esc(m.dir||'')}</text>`;
    m.items.forEach((it,i)=>{
      const ry=y+30+i*24, wd=Math.max(it.val/max*BMAXW,2);
      const d=(it.val-base)/base*100;
      const dl = i===m.base ? (m.baselabel||'baseline') : (d>0?'+':'')+d.toFixed(1)+'%';
      body += `<text x="${BX0-12}" y="${ry+12}" class="mono lbl" text-anchor="end">${esc(it.name)}</text>
        <rect x="${BX0}" y="${ry+1}" width="${wd.toFixed(1)}" height="14" fill="${C.bar}" opacity="0.9"/>
        <text x="${VALX}" y="${ry+12}" class="mono val" text-anchor="end">${esc(m.fmt?m.fmt(it.val):it.val)}</text>
        <text x="${DELX}" y="${ry+12}" class="mono del">${esc(dl)}</text>`;
    });
    y += 40 + m.items.length*24;
  }
  const h = y + 30 + footer.length*20;
  write(name, doc({w,h,tag,title,sub,body,footer}));
}

// ---- curve primitive: panels = [{label,unit,series:[{name,color,vals}]}], xlabels
function curveSheet(name, {tag,title,sub,xlabels,panels,footer,w=1180}){
  const PX=90, PW=w-150, PH=190, GAP=46; let y=180, body='';
  for(const p of panels){
    const all=p.series.flatMap(s=>s.vals), ymax=Math.max(...all)*1.12;
    const x0=PX, x1=PX+PW, plotY0=y+34, plotY1=y+PH-24;
    const n=xlabels.length;
    const xpos=i=> x0 + (i*(x1-x0)/(n-1));
    const ypos=v=> plotY1 - (v/ymax)*(plotY1-plotY0);
    body += `<text x="58" y="${y+18}" class="mono pl">${esc(p.label)}</text>
      <text x="58" y="${y+34}" class="mono un">${esc(p.unit||'')}</text>`;
    // axes
    body += `<line x1="${x0}" y1="${plotY0}" x2="${x0}" y2="${plotY1}" stroke="${C.faint}" stroke-width="1"/>
      <line x1="${x0}" y1="${plotY1}" x2="${x1}" y2="${plotY1}" stroke="${C.line}" stroke-width="1.2"/>`;
    // x labels
    xlabels.forEach((xl,i)=> body += `<text x="${xpos(i)}" y="${plotY1+16}" class="mono ax" text-anchor="middle">${esc(xl)}</text>`);
    // series
    p.series.forEach((s,si)=>{
      const col = s.color || (si===0?C.bar:C.blue);
      const pts = s.vals.map((v,i)=>`${xpos(i).toFixed(1)},${ypos(v).toFixed(1)}`).join(' ');
      body += `<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2.2" ${si>0?'stroke-dasharray="1 0"':''}/>`;
      s.vals.forEach((v,i)=> body += `<circle cx="${xpos(i).toFixed(1)}" cy="${ypos(v).toFixed(1)}" r="3.2" fill="${col}"/>`);
      // end label
      const lv=s.vals[s.vals.length-1];
      body += `<text x="${(x1+6)}" y="${ypos(lv)+4}" class="mono leg" fill="${col}">${esc(s.name)}</text>`;
      // value labels on points
      s.vals.forEach((v,i)=> body += `<text x="${xpos(i)}" y="${ypos(v)-8}" class="mono ax" fill="${col}" text-anchor="middle">${esc(typeof v==='number'&&v<10?v.toFixed(1):Math.round(v))}</text>`);
    });
    y += PH + GAP;
  }
  const h = y - GAP + 40 + footer.length*20;
  write(name, doc({w,h,tag,title,sub,body,footer}));
}

const XC = ['0','4K','16K','32K','64K'];

// ===== R3 - context wall (Llama, fa off) =====
curveSheet('delta-r3-context-wall.svg', {
  tag:'BORING-RECEIPTS · R3 · CONTEXT WALL', title:'context curve',
  sub:'Llama-3.1-8B Q4_K_M · AYA-3090 · prefill depth 0→64K · f16 KV, fa off',
  xlabels:XC,
  panels:[
    {label:'tg  decode', unit:'t/s · ↓ collapses with context', series:[{name:'tg', color:C.bar, vals:[132.7,111.6,73.4,39.0,20.5]}]},
    {label:'pp  prefill', unit:'t/s · ↓ collapses even faster', series:[{name:'pp', color:C.blue, vals:[4478,2748,1268,532,266]}]},
  ],
  footer:['both prefill and decode collapse with depth (pp −94%, tg −85% by 64K) - the bottleneck is attention over the growing KV cache.',
          'decode at 64K is ~20 t/s, the honest number a "128K context!" claim hides. levers: flash-attn (R6), KV-quant (BLOCKED, R4).'],
});

// ===== R6 - flash-attn × context (Llama) =====
curveSheet('delta-r6-flash-attn-context.svg', {
  tag:'BORING-RECEIPTS · R6 · FLASH-ATTN × CONTEXT', title:'flash-attn lifts the curve',
  sub:'Llama-3.1-8B Q4_K_M · AYA-3090 · fa off vs on, depth 0→64K',
  xlabels:XC,
  panels:[
    {label:'tg  decode', unit:'t/s', series:[{name:'fa off', color:C.muted, vals:[132.7,111.6,73.4,39.0,20.5]},{name:'fa on', color:C.green, vals:[139.8,128.6,103.9,82.6,58.4]}]},
    {label:'pp  prefill', unit:'t/s', series:[{name:'fa off', color:C.muted, vals:[4478,2748,1268,532,266]},{name:'fa on', color:C.green, vals:[4967,4296,2933,2026,1214]}]},
  ],
  footer:['the win grows with context: +5% tg at d0 → +185% tg at 64K (decode nearly 3×); prefill 4.6× at 64K.',
          'flash-attn halves the context-tax slope. always pass -fa 1 for long context.'],
});

// ===== R12 - flash-attn × context (Qwen, generalization) =====
curveSheet('delta-r12-qwen-flash-attn-context.svg', {
  tag:'BORING-RECEIPTS · R12 · FLASH-ATTN × CONTEXT (QWEN)', title:'it generalizes',
  sub:'Qwen2.5-7B Q4_K_M · AYA-3090 · fa off vs on, depth 0/16K/64K',
  xlabels:['0','16K','64K'],
  panels:[
    {label:'tg  decode', unit:'t/s', series:[{name:'fa off', color:C.muted, vals:[140.2,86.4,26.0]},{name:'fa on', color:C.green, vals:[134.1,118.1,86.5]}]},
    {label:'pp  prefill', unit:'t/s', series:[{name:'fa off', color:C.muted, vals:[4915,1575,342]},{name:'fa on', color:C.green, vals:[4850,2448,1369]}]},
  ],
  footer:['same shape as Llama (R6): 64K decode +233% (>Llama +185%); break-even at d0 (−4%, noise).',
          'flash-attn-scales-with-context confirmed on a 2nd architecture - it is about attention cost, not one model.'],
});

// ===== R5 - flash-attn on/off (bars) =====
barsSheet('delta-r5-flash-attn.svg', {
  tag:'BORING-RECEIPTS · R5 · FLASH-ATTN ON/OFF', title:'flash-attn on/off',
  sub:'Llama-3.1-8B Q4_K_M · AYA-3090 · -fa 0 vs 1, at d0 and 16K',
  metrics:[
    {label:'pp @ 16K', unit:'t/s', dir:'↑ faster', base:0, items:[{name:'fa off',val:1278},{name:'fa on',val:2897}]},
    {label:'tg @ 16K', unit:'t/s', dir:'↑ faster', base:0, items:[{name:'fa off',val:74.2},{name:'fa on',val:103.3}]},
    {label:'pp @ d0', unit:'t/s', dir:'↑ faster', base:0, items:[{name:'fa off',val:4498},{name:'fa on',val:5000}]},
    {label:'tg @ d0', unit:'t/s', dir:'↑ faster', base:0, items:[{name:'fa off',val:133.6},{name:'fa on',val:139.4}]},
  ],
  footer:['the gain is small at d0 (+11% pp / +4% tg) but large at 16K (+127% pp / +39% tg) - see the full curve in R6.'],
});

// ===== R10 - Qwen quant ladder (bars) =====
barsSheet('delta-r10-qwen-quant-ladder.svg', {
  tag:'BORING-RECEIPTS · R10 · QWEN QUANT LADDER', title:'quant ladder · Qwen',
  sub:'Qwen2.5-7B · AYA-3090 · Q4/Q5/Q8 · fa on · vs Llama R2b',
  metrics:[
    {label:'tg  decode', unit:'t/s', dir:'↑ higher = faster', base:0, fmt:v=>v.toFixed(1), items:[{name:'Q4',val:144.0},{name:'Q5',val:132.4},{name:'Q8',val:100.2}]},
    {label:'VRAM peak', unit:'GiB', dir:'↓ lower = leaner', base:0, fmt:v=>v.toFixed(1), items:[{name:'Q4',val:5.0},{name:'Q5',val:5.7},{name:'Q8',val:8.0}]},
    {label:'PPL', unit:'↓ lower = better (Q8 ref)', dir:'', base:2, baselabel:'ref', fmt:v=>v.toFixed(2), items:[{name:'Q4',val:8.02},{name:'Q5',val:7.94},{name:'Q8',val:7.90}]},
  ],
  footer:['trade-off generalizes: decode −30.4% Q4→Q8 (Llama −31.5%), prefill flat, VRAM grows.',
          'but Q4 quality cost is model-specific: +1.5% PPL here vs +2.3% on Llama (R2b).'],
});

// ===== Library - 5-model comparison (bars) =====
barsSheet('delta-library-5model.svg', {
  tag:'BORING-RECEIPTS · MODEL LIBRARY', title:'5-model library',
  sub:'Q4_K_M · AYA-3090 · fa on · dedicated · 7.25B → 14.77B',
  metrics:[
    {label:'tg  decode', unit:'t/s · ↑ faster', dir:'↓ tracks params', base:0, fmt:v=>v.toFixed(1), items:[
      {name:'Mistral-7B',val:149.2},{name:'Qwen2.5-7B',val:145.2},{name:'Llama-3.1-8B',val:139.8},{name:'Gemma-2-9B',val:102.8},{name:'Qwen2.5-14B',val:77.2}]},
    {label:'VRAM peak', unit:'GiB · ↓ leaner', dir:'↑ grows w/ size', base:0, fmt:v=>v.toFixed(1), items:[
      {name:'Mistral-7B',val:4.9},{name:'Qwen2.5-7B',val:5.3},{name:'Llama-3.1-8B',val:5.6},{name:'Gemma-2-9B',val:6.9},{name:'Qwen2.5-14B',val:9.2}]},
  ],
  footer:['decode tracks parameter count within an architecture; Gemma-2-9B drops more than its params imply (heavier arch).',
          'prefill (not shown) does NOT track size as cleanly - it is compute/architecture-bound. PPL not cross-family comparable.'],
});

console.log('done.');
