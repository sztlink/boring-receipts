import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const root = cfg.root;
fs.mkdirSync(root, { recursive: true });
const logPath = path.join(root, 'run.log');
const jsonlPath = path.join(root, 'results.jsonl');
const statusPath = path.join(root, 'status.txt');
const summaryPath = path.join(root, 'SUMMARY.md');
const serverOut = path.join(root, 'server.out.log');
const serverErr = path.join(root, 'server.err.log');
function log(s) { fs.appendFileSync(logPath, `${new Date().toISOString()} ${s}\n`); console.log(s); }
function status(s) { fs.writeFileSync(statusPath, s + '\n'); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function fetchWithTimeout(url, opts = {}, timeoutMs = 600000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try { return await fetch(url, { ...opts, signal: ac.signal }); } finally { clearTimeout(t); }
}
async function waitHealth(port) {
  const start = Date.now();
  while (Date.now() - start < (cfg.serverLoadTimeoutSec || 1200) * 1000) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/health`);
      const txt = await r.text();
      log(`HEALTH ${r.status} ${txt.slice(0, 120)}`);
      if (r.ok) return true;
    } catch (e) { log(`HEALTH_WAIT ${e.message}`); }
    await sleep(10000);
  }
  return false;
}
function extractAnswer(text) {
  if (!text) return '';
  const boxed = [...text.matchAll(/\\boxed\{\s*([0-9]{1,3})\s*\}/g)].pop();
  if (boxed) return String(Number(boxed[1]));
  const final = [...text.matchAll(/final answer[^0-9]{0,80}([0-9]{1,3})/gi)].pop();
  if (final) return String(Number(final[1]));
  const nums = [...text.matchAll(/(?<![0-9])([0-9]{1,3})(?![0-9])/g)].map(m => m[1]);
  return nums.length ? String(Number(nums.at(-1))) : '';
}
function normAns(x) { return String(Number(String(x).trim())); }
function buildPrompt(problem) {
  return `Solve the following AIME 2026 problem. You may reason step by step, but keep the reasoning concise. The final answer is an integer from 0 to 999.\n\nProblem:\n${problem}\n\nReturn your final answer in exactly this format at the end: \\boxed{NNN}`;
}
async function runCase(item, idx) {
  const prompt = buildPrompt(item.problem);
  const rec = { index: idx, id: item.id ?? item.number ?? idx + 1, expected: normAns(item.answer ?? item.final_answer), promptChars: prompt.length, start: new Date().toISOString() };
  log(`CASE_START ${rec.id} expected=${rec.expected}`);
  const t0 = Date.now();
  try {
    const r = await fetchWithTimeout(`http://127.0.0.1:${cfg.port}/v1/chat/completions`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: cfg.alias,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: cfg.maxTokens || 4096,
        temperature: cfg.temperature ?? 0,
        top_p: cfg.topP ?? 0.95,
        seed: cfg.seed ?? 42,
        stream: false
      })
    }, (cfg.caseTimeoutSec || 1800) * 1000);
    const txt = await r.text();
    rec.http = r.status;
    rec.raw = txt.slice(0, 12000);
    try {
      const j = JSON.parse(txt);
      const msg = j.choices?.[0]?.message || {};
      rec.content = (msg.content || '').trim();
      rec.reasoning_content = (msg.reasoning_content || '').trim();
      rec.scored_text = rec.content || rec.reasoning_content || '';
      rec.usage = j.usage || null;
    } catch (e) { rec.parseError = e.message; rec.content = txt.slice(0, 4000); }
    rec.predicted = extractAnswer(rec.scored_text || rec.content || rec.reasoning_content);
    rec.correct = rec.predicted === rec.expected;
  } catch (e) {
    rec.error = e.name + ': ' + e.message;
    rec.predicted = '';
    rec.correct = false;
  }
  rec.elapsedSec = Math.round((Date.now() - t0)/1000);
  rec.end = new Date().toISOString();
  fs.appendFileSync(jsonlPath, JSON.stringify(rec) + '\n');
  log(`CASE_DONE ${rec.id} correct=${rec.correct} pred=${rec.predicted} expected=${rec.expected} elapsed=${rec.elapsedSec}s`);
}
async function main() {
  fs.writeFileSync(logPath, ''); fs.writeFileSync(jsonlPath, ''); status('RUNNING');
  log(`AIME_RUN_START label=${cfg.label}`);
  const args = ['-m', cfg.model, '-ngl', String(cfg.ngl ?? 99), '-fa', 'on', '-ctk', cfg.ctk || 'f16', '-ctv', cfg.ctv || 'f16', '-c', String(cfg.ctx || 32768), '--host', '127.0.0.1', '--port', String(cfg.port), '-np', '1', '--alias', cfg.alias, '--jinja', '--slots'];
  if (cfg.extraArgs) args.push(...cfg.extraArgs);
  log('SERVER_CMD llama-server.exe ' + args.join(' '));
  const out = fs.openSync(serverOut, 'a'); const err = fs.openSync(serverErr, 'a');
  const server = spawn(path.join(cfg.bin, 'llama-server.exe'), args, { cwd: cfg.bin, windowsHide: true, stdio: ['ignore', out, err] });
  fs.writeFileSync(path.join(root, 'server.pid'), String(server.pid));
  log(`SERVER_PID ${server.pid}`);
  server.on('exit', (code, sig) => log(`SERVER_EXIT code=${code} sig=${sig}`));
  if (!(await waitHealth(cfg.port))) throw new Error('server health timeout');
  const all = fs.readFileSync(cfg.dataset, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  const items = all.slice(cfg.offset || 0, (cfg.offset || 0) + (cfg.limit || all.length));
  for (let i = 0; i < items.length; i++) await runCase(items[i], (cfg.offset || 0) + i);
  const rows = fs.readFileSync(jsonlPath, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  const correct = rows.filter(r => r.correct).length;
  const md = [`# AIME26 run — ${cfg.label}`, '', `status: ${correct}/${rows.length}`, '', `model: ${cfg.model}`, `ctx: ${cfg.ctx}, KV: ${cfg.ctk}/${cfg.ctv}, max_tokens: ${cfg.maxTokens}`, '', '| # | expected | predicted | correct | elapsed | tokens |', '|---:|---:|---:|---|---:|---:|'];
  for (const r of rows) md.push(`| ${r.id} | ${r.expected} | ${r.predicted || ''} | ${r.correct ? 'PASS' : 'FAIL'} | ${r.elapsedSec}s | ${r.usage?.completion_tokens ?? ''} |`);
  fs.writeFileSync(summaryPath, md.join('\n') + '\n');
  log(`AIME_RUN_DONE score=${correct}/${rows.length}`); status('DONE');
  server.kill('SIGTERM'); setTimeout(()=>{ try{server.kill('SIGKILL')}catch{} }, 5000);
}
main().catch(e => { log('AIME_RUN_FAIL ' + (e.stack || e.message)); status('FAIL ' + e.message); process.exitCode = 1; });
