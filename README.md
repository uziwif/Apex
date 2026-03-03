# Apex Launcher

A desktop launcher for Fortnite that supports versions **OT6.5** through **32.11**. Built with [Tauri 2](https://tauri.app/) and React.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)
![Tauri](https://img.shields.io/badge/Tauri-2.0-24C8DB?logo=tauri)

---

## Features

- **Library** — Browse and manage installed Fortnite versions
- **Downloads** — Download and install supported versions (OT6.5 – 32.11)
- **Config** — Adjust backend, game server, and launch options
- **Online** — Connect and play with others
- **Mods** — Manage mods for your installations
- **Settings** — Install directory, theme, language, and in-app updates
- **Auto-updater** — Push to main → CI builds → launcher checks Releases and updates
- **Multi-language** — UI available in multiple languages

---

## Requirements

- **Windows** (10/11)
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed on Windows 11)

---

## Download & Install

1. Go to [Releases](https://github.com/uziwif/Apex/releases).
2. Download the latest **Apex Launcher** installer.
3. Run the installer and follow the steps.
4. Launch **Apex** and use **Settings** to set your install directory and preferences.

---

## Building from source

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://www.rust-lang.org/tools/install)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows)

### Credits

Credits are in the launcher but ill add them here also.
Just a note that these are tempory solutions being used, will change when i can be bothered to sit down and make the stuff ive used.

Backend = [Lawin](https://github.com/Lawin0129), [LawinServer](https://github.com/Lawin0129/LawinServer)
Gameserver = [Ploosh](https://github.com/plooshi), [Erbium](https://github.com/plooshi/Erbium)
Redirect = [Ploosh](https://github.com/plooshi), [Tellurium](https://github.com/plooshi/Tellurium)

---

**Maintainers:** See [SETUP.md](SETUP.md) for one-time setup. Private keys stay in GitHub Secrets only.
