# Apex Launcher – Dev Cheat Sheet

Commands and workflows. Nothing private (open source).

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
npm run release
```

Push source → CI builds → publishes to Releases → launcher auto-updates. One flow: you push, users get the update.

Bumps patch (1.0.0 → 1.0.1), syncs `package.json` / `tauri.conf.json` / `Cargo.toml`, commits, pushes to `main`. GitHub Actions builds and publishes.

Other branch: `npm run release -- branch-name`

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

## Useful URLs

- Updater endpoint: `https://github.com/uziwif/Apex/releases/latest/download/latest.json`
- LawinServer: https://github.com/Lawin0129/LawinServer
- Erbium: https://github.com/plooshi/Erbium
- Tellurium: https://github.com/plooshi/Tellurium
