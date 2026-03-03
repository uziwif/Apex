# Apex Launcher – Setup (one-time)

One-time setup for builds and auto-updates. After this, push to `main` (or run `npm run release`) and the launcher auto-updates for users.

---

## 1. Generate signing keys

```powershell
npx tauri signer generate -w $env:USERPROFILE\.tauri\apex.key -p "x"
```

If the key exists: add `-f` to overwrite.

---

## 2. Add public key to tauri.conf.json

Copy the contents of `apex.key.pub` into `tauri.conf.json` → `plugins.updater.pubkey`.

---

## 3. Add GitHub Secrets

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Name | Value |
|------|-------|
| `TAURI_SIGNING_PRIVATE_KEY` | Entire contents of `apex.key` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | `x` |

---

## 4. Workflow permissions

**Settings** → **Actions** → **General** → **Workflow permissions** → **Read and write permissions**.

---

## 5. Release

```bash
npm run release
```

Bumps version (patch), syncs `package.json`, `tauri.conf.json`, and `Cargo.toml`, commits, and pushes to `main`. GitHub Actions builds and publishes.

To push to a different branch: `npm run release -- other-branch`
