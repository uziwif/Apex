#!/usr/bin/env node
/**
 * One-command release: bumps version, syncs config, commits, pushes.
 * Triggers GitHub Actions to build and publish.
 * Only commits package.json, tauri.conf.json, Cargo.toml.
 *
 * Usage:
 *   npm run release                         → patch bump (0.0.1)
 *   npm run release -- --update minor       → patch (0.0.1)
 *   npm run release -- --update mid         → minor (0.1.0)
 *   npm run release -- --update full        → major (1.0.0)
 *   COMMENT="msg" npm run release           → push + add comment
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');

const argv = process.argv.slice(2);
let branch = 'main';
let comment = process.env.COMMENT || null;
let updateType = 'minor'; // default: patch
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--comment' && argv[i + 1]) {
    const rest = [];
    for (let j = i + 1; j < argv.length && !argv[j].startsWith('-'); j++) rest.push(argv[j]);
    comment = rest.join(' ');
    i += rest.length;
  } else if (argv[i].startsWith('--comment=')) {
    comment = argv[i].slice('--comment='.length);
  } else if (argv[i] === '--update' && argv[i + 1]) {
    updateType = argv[i + 1].toLowerCase();
    i++;
  } else if (!argv[i].startsWith('-')) {
    branch = argv[i];
  }
}

function getVersion(pkgPath) {
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
}

function setVersion(pkgPath, v) {
  const p = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  p.version = v;
  fs.writeFileSync(pkgPath, JSON.stringify(p, null, 2) + '\n');
}

function bumpVersion(v, type) {
  const [a, b, c] = v.split('.').map(Number);
  if (type === 'full') return `${(a || 0) + 1}.0.0`;
  if (type === 'mid') return `${a || 0}.${(b || 0) + 1}.0`;
  return `${a || 0}.${b || 0}.${(c || 0) + 1}`;
}

const pkgPath = path.join(root, 'package.json');
const tauriPath = path.join(root, 'src-tauri', 'tauri.conf.json');
const cargoPath = path.join(root, 'src-tauri', 'Cargo.toml');

const status = execSync('git status --porcelain', { cwd: root, encoding: 'utf8' });
const hasUnstaged = status.trim().length > 0;
if (hasUnstaged) {
  console.log('Stashing unstaged changes...');
  execSync('git stash push -u -m "apex-release-stash"', { cwd: root, stdio: 'inherit' });
}
execSync(`git pull --rebase origin ${branch}`, { cwd: root, stdio: 'inherit' });

const current = getVersion(pkgPath);
const next = bumpVersion(current, updateType);

console.log(`Bumping ${current} → ${next}`);
setVersion(pkgPath, next);
setVersion(tauriPath, next);
fs.writeFileSync(cargoPath, fs.readFileSync(cargoPath, 'utf8').replace(/^version = "[\d.]+"/m, `version = "${next}"`));

execSync('git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml', { cwd: root, stdio: 'inherit' });
execSync(`git commit -m "Release v${next}"`, { cwd: root, stdio: 'inherit' });
execSync(`git push origin ${branch}`, { cwd: root, stdio: 'inherit' });

if (comment) {
  execSync('node', [path.join(__dirname, 'gh-comment.cjs'), comment], { cwd: root, stdio: 'inherit' });
}

if (hasUnstaged) {
  execSync('git stash pop', { cwd: root, stdio: 'inherit' });
  console.log('Restored stashed changes.');
}
console.log(`\nPushed to ${branch}. GitHub Actions will build and publish.\n`);
