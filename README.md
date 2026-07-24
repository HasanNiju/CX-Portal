<div align="center">

# 🚚 Pathao CX Portal

**A single-file, bilingual support toolkit for Pathao customer support agents —**
**reply presets, a delivery fee calculator, and hub coverage lookup, all in one place.**

[![Made with HTML](https://img.shields.io/badge/Made%20with-HTML%2FCSS%2FJS-E83330?style=for-the-badge&logo=html5&logoColor=white)](.)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new)
[![Bilingual](https://img.shields.io/badge/Language-বাংলা%20%2F%20English-12777A?style=for-the-badge)](.)
[![License](https://img.shields.io/badge/License-MIT-9C948A?style=for-the-badge)](LICENSE)

</div>

---

## ✨ What is this?

**Pathao CX Portal** is a lightweight, no-backend-required web app built for Pathao's
customer support agents. It puts the three things an agent reaches for most —
**canned replies, a fee calculator, and hub coverage info** — one click away, with
zero page reloads and zero setup.

It runs entirely as a single HTML file: open it in a browser and it just works.
No server, no build step, no dependencies to install.

---

## 🧩 Features

| | Feature | Details |
|---|---|---|
| 💬 | **Reply Preset Library** | Searchable, categorized canned responses for common support scenarios, in Bangla and English |
| 📌 | **Pin & Recent Dock** | Pin your most-used replies and keep a running list of recently copied ones |
| 🧮 | **Delivery Fee Calculator** | Instantly estimate courier charges across merchant types, zones, and weight |
| 📍 | **Hub Coverage Checker** | Check whether pickup/delivery is available in a given area |
| 🏢 | **Designated Hub Finder** | Find the exact hub responsible for a specific area |
| ⌘K | **Command Palette** | `Ctrl/Cmd + K` to search and copy any preset instantly, keyboard-first |
| 🌗 | **Light / Dark Mode** | Toggle instantly, saved across sessions |
| 🌐 | **Bangla / English Toggle** | Every preset, label, and tool switches language on the fly |
| 🔐 | **Admin-Gated Management** | Editing, deleting, importing, and exporting data requires an admin password — anyone can *add* a new preset or hub freely |
| 💾 | **Backup / Restore** | Export your preset & hub data as JSON, import it back anytime |

---

## 🔐 Admin Access

Some actions are protected so the shared library doesn't get accidentally edited or wiped:

| Action | Needs Admin? |
|---|:---:|
| Add a new preset | ❌ No |
| Add a new hub | ❌ No |
| Edit / delete a preset or hub | ✅ Yes |
| Reset sample hub data | ✅ Yes |
| Export / import backup JSON | ✅ Yes |

- **Default password:** `1234`
- Changeable anytime from the 🔒 admin icon in the top bar, once unlocked.

> ⚠️ **Note:** In the current version, this check runs entirely in the browser (no backend), so treat it as a soft guardrail against accidental edits — not a real security boundary. See [Roadmap](#-roadmap) below for the plan to move this server-side.

---

## 🚀 Getting Started

### Option 1 — Just open it
Download `Pathao_CX_Portal.html` and double-click it. That's it — it runs locally in any modern browser.

### Option 2 — Host it for your team

**1. Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit — Pathao CX Portal"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

**2. Deploy on Vercel**
- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repo
- Leave all settings as default (it's a static site — zero configuration needed)
- Click **Deploy**

Your portal will be live at `https://<your-repo>.vercel.app` in under a minute.

---

## 🗂️ Project Structure

```
📦 pathao-cx-portal
 ┗ 📄 Pathao_CX_Portal.html   ← the entire app: HTML + CSS + JS in one file
```

---

## ⚠️ Good to Know: How Data Storage Works

This app currently stores all data (custom presets, hubs, pins, admin password) in the
browser's **`localStorage`** — there's no database or backend.

- ✅ Your data persists across reloads and browser restarts.
- ❌ It is **not shared** between devices or between team members. Each person who opens
  the portal builds up their own private copy.
- 🔄 To sync data across a team today, use **Export JSON** on one device and
  **Import JSON** on another.

A shared, database-backed version (so the whole team edits one live library) is on the
roadmap — see below.

---

## 🛣️ Roadmap

- [ ] Shared storage via **Vercel + Upstash Redis** (free tier) — one live library for the whole team instead of per-browser data
- [ ] Move admin password verification server-side
- [ ] Multi-admin accounts with individual logins
- [ ] Usage analytics (most-copied presets, busiest hubs)

---

## 🛠️ Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

No frameworks, no build tools, no npm install — just plain HTML/CSS/JS, on purpose,
so it stays a single portable file.

---

## 🤝 Contributing

Found an outdated fee table, a missing hub, or a preset that needs updating? Feel free
to open an issue or a pull request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">

Made for Pathao Customer Support agents 🩷

</div>
