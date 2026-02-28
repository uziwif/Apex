# Publishing to GitHub and Enabling the Auto Updater

This app uses Tauri’s updater plugin. To publish to GitHub and have the in-app “Check for updates” work, follow these steps.

## 1. Create a GitHub repo and push

If you haven’t already:

```bash
# Create a new repo on GitHub (e.g. github.com/YOUR_USERNAME/apex-launcher), then:
git remote add origin https://github.com/YOUR_USERNAME/apex-launcher.git
git branch -M main
git push -u origin main
```

Use your actual GitHub username/org and repo name instead of `YOUR_USERNAME/apex-launcher`.

## 2. Set the updater endpoint in config

Edit `src-tauri/tauri.conf.json` and replace `GITHUB_OWNER` in the updater endpoint with your GitHub username or org:

- Current: `https://github.com/GITHUB_OWNER/apex-launcher/releases/latest/download/latest.json`
- Example: `https://github.com/myusername/apex-launcher/releases/latest/download/latest.json`

If your repo name is not `apex-launcher`, change that part of the URL too.

## 3. Generate signing keys (one-time)

The updater requires signed updates. Generate a keypair with the Tauri CLI:

**Windows (PowerShell):**

```powershell
npx tauri signer generate -w $env:USERPROFILE\.tauri\apex-launcher.key
```

**macOS/Linux:**

```bash
npx tauri signer generate -w ~/.tauri/apex-launcher.key
```

- Back up the **private key** file safely. If you lose it, you cannot publish new updates for existing installs.
- Copy the **public key** that is printed (starts with the key content, not a path).

## 4. Add the public key to the app

In `src-tauri/tauri.conf.json`, set the updater `pubkey` to the **full public key string** you copied (the entire content, not a file path):

```json
"plugins": {
  "updater": {
    "pubkey": "PASTE_THE_FULL_PUBLIC_KEY_HERE",
    "endpoints": ["https://github.com/YOUR_USERNAME/apex-launcher/releases/latest/download/latest.json"]
  }
}
```

Commit and push this change (the public key is safe to commit).

## 5. Add the private key as a GitHub secret

1. On GitHub: repo → **Settings** → **Secrets and variables** → **Actions**.
2. **New repository secret**:
   - Name: `TAURI_SIGNING_PRIVATE_KEY`
   - Value: either the **contents** of your private key file, or the path to it (e.g. `C:\Users\You\.tauri\apex-launcher.key` on Windows). The workflow uses this when building.

If the key is password-protected, add another secret:

- Name: `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- Value: the key’s password.

## 6. Allow the workflow to create releases

1. Repo → **Settings** → **Actions** → **General**.
2. Under **Workflow permissions**, choose **Read and write permissions**.
3. Save.

## 7. Create a release (trigger the workflow)

The workflow in `.github/workflows/release.yml` runs when you push to the `release` branch (or when you run it manually).

**Option A – Push to `release`:**

```bash
git checkout -b release
git push -u origin release
```

After the workflow runs, a **draft** release is created. Open **Releases**, edit the draft, add release notes if you want, then click **Publish release**.

**Option B – Run manually:**

1. Go to **Actions** → **release**.
2. Click **Run workflow**, choose the branch, then **Run workflow**.

Again, publish the draft release when the run finishes.

## 8. After the first release

- The app will find updates from:  
  `https://github.com/YOUR_USERNAME/apex-launcher/releases/latest/download/latest.json`
- Users can use **Settings → Check for updates** in the app.
- For new versions: bump `version` in `src-tauri/tauri.conf.json` (and in `package.json` if you keep them in sync), then push to `release` (or run the workflow again). Publish the new draft release when the build completes.

## Summary checklist

- [ ] GitHub repo created and code pushed
- [ ] `GITHUB_OWNER` (and repo name if different) updated in `tauri.conf.json` updater endpoint
- [ ] Signing keypair generated and private key backed up
- [ ] Public key set in `tauri.conf.json` under `plugins.updater.pubkey`
- [ ] `TAURI_SIGNING_PRIVATE_KEY` (and optionally `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`) added as repo secrets
- [ ] Workflow permissions set to “Read and write”
- [ ] First release created via push to `release` or manual run, then draft published

After that, the auto updater will work for installs that use this GitHub repo’s releases.
