#!/usr/bin/env node
/**
 * One-command release: bumps version, syncs config, commits, pushes.
 * Triggers GitHub Actions to build and publish.
 *
 * Usage: npm run release [branch]
 *   npm run release        → push to main
 *   npm run release main    → push to main
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const branch = process.argv[2] || 'main';

function getVersion(pkgPath) {
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
}

function setVersion(pkgPath, v) {
  const p = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  p.version = v;
  fs.writeFileSync(pkgPath, JSON.stringify(p, null, 2) + '\n');
}

function bumpPatch(v) {
  const [a, b, c] = v.split('.').map(Number);
  return `${a}.${b}.${(c || 0) + 1}`;
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
const next = bumpPatch(current);

console.log(`Bumping ${current} → ${next}`);
setVersion(pkgPath, next);
setVersion(tauriPath, next);
fs.writeFileSync(cargoPath, fs.readFileSync(cargoPath, 'utf8').replace(/^version = "[\d.]+"/m, `version = "${next}"`));

execSync('git add package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml', { cwd: root, stdio: 'inherit' });
execSync(`git commit -m "Release v${next}"`, { cwd: root, stdio: 'inherit' });
execSync(`git push origin ${branch}`, { cwd: root, stdio: 'inherit' });
if (hasUnstaged) {
  execSync('git stash pop', { cwd: root, stdio: 'inherit' });
  console.log('Restored stashed changes.');
}
console.log(`\nPushed to ${branch}. GitHub Actions will build and publish.\n`);
