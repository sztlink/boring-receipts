#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, rm, copyFile, readdir, stat, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const date = process.env.BORING_RECEIPTS_EXPORT_DATE || new Date().toISOString().slice(0, 10);
const packageName = `${date}-boring-receipts-lab`;
const outRoot = path.join(root, 'exports', packageName);

const includeFiles = [
  'README.md',
  'SUMMARY.md',
  'CANON.md',
  'AXES.md',
  'FORMAT.md',
  'HOW-TO-READ.md',
  'PRESERVATION.md',
  'PROCESS-INDEX.md',
  'NEGATIVES.md',
  'GENEALOGY.md',
  'GLOSSARY.md',
  'CONTRIBUTING.md',
  'receipt-template.md',
  'receipt-template.yaml',
  'LICENSE'
];

const includeDirs = [
  'receipts',
  'assets',
  'data',
  'docs',
  'scripts'
];

const excludeFromDirs = new Set([
  'exports',
  '.git',
  'node_modules'
]);

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function sha256(file) {
  const buf = await readFile(file);
  return createHash('sha256').update(buf).digest('hex');
}

async function copyRecursive(src, dst) {
  const s = await stat(src);
  if (s.isDirectory()) {
    if (excludeFromDirs.has(path.basename(src))) return;
    await mkdir(dst, { recursive: true });
    for (const entry of await readdir(src)) {
      await copyRecursive(path.join(src, entry), path.join(dst, entry));
    }
    return;
  }
  await mkdir(path.dirname(dst), { recursive: true });
  await copyFile(src, dst);
}

async function listFiles(dir, prefix = '') {
  const out = [];
  for (const entry of await readdir(dir)) {
    const full = path.join(dir, entry);
    const rel = path.join(prefix, entry).replaceAll('\\\\', '/');
    const s = await stat(full);
    if (s.isDirectory()) out.push(...await listFiles(full, rel));
    else out.push(rel);
  }
  return out.sort();
}

await rm(outRoot, { recursive: true, force: true });
await mkdir(outRoot, { recursive: true });

for (const rel of includeFiles) {
  const src = path.join(root, rel);
  if (await exists(src)) await copyRecursive(src, path.join(outRoot, rel));
}

for (const rel of includeDirs) {
  const src = path.join(root, rel);
  if (await exists(src)) await copyRecursive(src, path.join(outRoot, rel));
}

const files = (await listFiles(outRoot)).filter((f) => !['manifest.json', 'SHA256SUMS'].includes(f));
const manifestFiles = [];
for (const rel of files) {
  const full = path.join(outRoot, rel);
  const s = await stat(full);
  manifestFiles.push({ path: rel, bytes: s.size, sha256: await sha256(full) });
}

const manifest = {
  schema: 'boring-receipts-preservation-package-v1',
  package: packageName,
  created: new Date().toISOString(),
  source: 'https://github.com/sztlink/boring-receipts',
  site: 'https://sztlink.github.io/boring-receipts/',
  boundary: 'Static preservation package: Markdown receipts, public HTML exhibit, JSON index, SVG assets, scripts and checksums. External binaries/models/datasets are not bundled.',
  files: manifestFiles
};

await writeFile(path.join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(
  path.join(outRoot, 'SHA256SUMS'),
  manifestFiles.map((f) => `${f.sha256}  ${f.path}`).join('\n') + '\n'
);

const readme = `# ${packageName}\n\nStatic preservation package for Boring Receipts Lab.\n\nOpen \`docs/index.html\` for the public exhibit. Read \`receipts/*.md\`, \`SUMMARY.md\`, \`PROCESS-INDEX.md\` and \`NEGATIVES.md\` for the receipt archive.\n\nIntegrity files:\n\n- \`manifest.json\` - file list, byte counts and SHA-256 hashes.\n- \`SHA256SUMS\` - portable checksum list.\n\nBoundary: this package preserves the proof trail and command shapes. It does not bundle vendor binaries, model weights or external datasets.\n`;
await writeFile(path.join(outRoot, 'README.md'), readme);

// Recompute hashes after writing package README and manifests so README is listed too.
const finalFiles = (await listFiles(outRoot)).filter((f) => !['manifest.json', 'SHA256SUMS'].includes(f));
const finalManifestFiles = [];
for (const rel of finalFiles) {
  const full = path.join(outRoot, rel);
  const s = await stat(full);
  finalManifestFiles.push({ path: rel, bytes: s.size, sha256: await sha256(full) });
}
manifest.files = finalManifestFiles;
await writeFile(path.join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(
  path.join(outRoot, 'SHA256SUMS'),
  finalManifestFiles.map((f) => `${f.sha256}  ${f.path}`).join('\n') + '\n'
);

console.log(`Exported ${packageName} (${finalManifestFiles.length} files)`);
