# Apex – Dev Index

for me to remember shit

---

## npm scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start Vite dev server (localhost:5173) |
| `npm run build` | TypeScript + Vite build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run tauri dev` | Run Tauri app in dev (loads localhost) |
| `npm run build:app` | Build frontend + Tauri → installer |
| `npm run release` | Bump version, commit, push to main → triggers GitHub release |
| `npm run gh:comment` | Add comment to GitHub commit (see below) |

---

## GitHub commit comments (CLI)

Add a comment to a commit via GitHub API

```bash
# Set token once (GitHub → Settings → Developer settings → Personal access tokens)
$env:GITHUB_TOKEN = "ghp_xxx"

# Comment on latest commit (HEAD)
npm run gh:comment -- "Fixed typo in docs"

# Comment on specific commit
npm run gh:comment -- abc123 "This was the release commit"
```

Uses `scripts/gh-comment.cjs`. Repo is inferred from `git remote origin`. Token from `GITHUB_TOKEN` env.

---

## Tauri

```bash
npx tauri dev          # Dev mode (webview + Rust)
npx tauri build        # Build installer
npx tauri icon path.png # Generate icons from image
```

---

## Release flow

```bash
npm run release                              # patch: 1.0.2 → 1.0.3
npm run release -- --update minor             # patch (0.0.1)
npm run release -- --update mid               # minor (0.1.0): 1.0.2 → 1.1.0
npm run release -- --update full              # major (1.0.0): 1.0.2 → 2.0.0
COMMENT="added new fixes" npm run release
```

Push source → CI builds → publishes to Releases → launcher auto-updates. Only commits `package.json`, `tauri.conf.json`, `Cargo.toml`. Version is injected at build time and shown in Settings, Home, Changelog.

**Why `COMMENT=` not `--comment`?** npm eats `--comment` before the script runs. Use the env var, or `npm run release -- --comment "msg"` (the `--` passes args through).

---

## Signing keys (one-time setup)

```powershell
npx tauri signer generate -w $env:USERPROFILE\.tauri\apex.key -p "x"
```

Overwrite existing: add `-f`

- Public key → `tauri.conf.json` → `plugins.updater.pubkey`
- Private key → GitHub Secret `TAURI_SIGNING_PRIVATE_KEY`
- Password → GitHub Secret `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

---

## Project layout

```
src/                 # React frontend
  components/
  pages/
  store/
  lib/
src-tauri/           # Rust backend
  src/
    commands/        # Tauri commands (launch, download, etc.)
  icons/
  tauri.conf.json
.github/workflows/   # CI (release on push to main)
scripts/
  release.cjs        # Version bump + push
  gh-comment.cjs     # GitHub commit comment CLI
  generate-icon.cjs  # Icon generation
```

---

## AppData structure (runtime)

```
%LOCALAPPDATA%\Apex\
  backend/           # LawinServer
  gameserver/        # Erbium
  redirect/          # Tellurium
  mods/
    installed_mods/
    data/
  online/
  logs/              # apex.log
  downloads/
```

---

## Key files

| File | Purpose |
|------|---------|
| `tauri.conf.json` | App config, updater endpoint, pubkey |
| `src-tauri/capabilities/default.json` | Tauri permissions (dialog, etc.) |
| `src-tauri/src/commands/mod.rs` | Launch, download, inject, paths |

---

## Customization

### Tailwind prefix

To avoid class name collisions (e.g. `tw-`), add to `tailwind.config.cjs`:

```js
module.exports = {
  prefix: 'tw-',  // classes become tw-flex, tw-p-4, etc.
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // ...
};
```

### Commit message prefix

Use conventional commits if you want: `feat:`, `fix:`, `chore:`. The release script uses `Release v${version}`. Edit `scripts/release.cjs` to change.

### i18n prefix

In `src/lib/i18n.ts` or wherever i18next is configured, you can set `keySeparator`, `nsSeparator`, or a custom prefix for translation keys.

---


## Troubleshooting

| Issue | Fix |
|------|-----|
| Tauri build fails | `rustup update` |
| Dialog not opening | Check `capabilities/default.json` has `dialog:allow-open` |
| Updater not found | Verify `tauri.conf.json` updater URL and pubkey |
| Git push rejected | `git pull --rebase` first |
