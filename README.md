# Together — Together We Can

A **demo web application** for peer connection and emotional check-ins. Users sign up with interests and identity preferences, log how they feel, get matched with mock “peers,” send connection invites, chat with lightweight safety tooling, plan first conversations, set reminders, and access crisis-oriented help links. The experience is **fully client-side** (no backend server in this repo) with data stored in the browser.

> **Disclaimer:** This is an MVP / prototype. It is **not** a medical device, therapist, or crisis service. Safety and AI features are for demonstration only. If you or someone else is in immediate danger, contact local emergency services or a licensed professional.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Data & persistence](#data--persistence)
- [How core flows work](#how-core-flows-work)
- [Internationalization](#internationalization)
- [Product vision (Pro)](#product-vision-pro)
- [Security notes](#security-notes)

---

## Features

### Onboarding & profile

- **Sign-up flow:** Username/password (demo only), display name or anonymous mode, up to **10 tags** (interests, hobbies, occupation), free-text “what you’re feeling,” ethnicity and region (used for resource copy), and initial mood emoji/text.
- **Profile:** Switch app language (**English** / **नेपाली Nepali**). Edit **interests**, **hobbies**, and **profession** buckets with add/remove; saves a flat `tags` list for matching plus optional `tagSections` so grouping survives reload.
- **Together Pro (vision):** In-app copy describing a **future** tier with wearable-informed mood support. **No** wearable integration or health analysis in this build.

### Home (Swipe tab)

- **Mood check-in:** Carousel of mood emojis with labels; optional typed mood. Typed text is **debounced** and mapped to the closest mood category via keyword heuristics (`inferMoodEmoji`).
- **Submit mood** refreshes match ordering and can clear the “passed” swipe stack.
- **Swipe stack:** Up to three visible mock peer cards; **swipe/drag right** to send an invite, **left** to pass. Peers are scored from shared tags; optional re-ranking by mood text.
- **Invites** block peers who already have pending/accepted invites or active threads.

### Connections

- **Pending invites** you sent (with a **demo** control to simulate the other person accepting).
- **Active chats** open the full-screen **chat modal**.

### Chat

- Messages stored only in **local state** / `localStorage` (demo threads).
- **Rule-based safety scan** on send (`safety.ts`): flags for risky patterns (scams, self-harm language, etc.) with severities and copy.
- **Optional OpenAI assist:** If `VITE_OPENAI_API_KEY` is set, an additional JSON “safety flags” pass can merge with rule results. **Keys in the browser are only appropriate for local demos**—production apps should call OpenAI from a server.
- **Mood-based conversation starters** above the composer: short suggested openers derived from the user’s latest mood check-in and optional tag overlap with the peer (EN/NE).

### First conversation (“1st talk”)

- Guided inputs: feeling, audience (family / friend / stranger), topics, output language, culture/region, preferred time.
- Generates **conversation starters** with optional “why this works” expanders.
- Can attach a starter to a **scheduled reminder** (stored locally; no push notifications).

### Reminders

- Lists scheduled check-ins from the first-conversation flow (demo persistence only).

### Help now (distress)

- Floating **Help now** button opens a panel with region-aware helpline hints, curated links, and a simple chat-style UI.
- With OpenAI configured, replies can use the API; otherwise **scripted** responses are used.

---

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 18 |
| Language | TypeScript |
| Build / dev | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | React Context (`AppContext`) |
| Persistence | `localStorage` (key `together-mvp-v1`) |
| Optional AI | OpenAI Chat Completions (browser `fetch`, demo-only pattern) |

Path alias: `@/` → `src/` (see `vite.config.ts` / `tsconfig.json`).

---

## Requirements

- **Node.js** 18+ (recommended; matches typical Vite 5 usage)
- **npm** (or compatible client) for installs

---

## Getting started

```bash
git clone https://github.com/udhungana/team88.git
cd team88
npm install
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173`).

```bash
npm run build   # typecheck + production bundle to dist/
npm run preview # serve dist/ locally
```

---

## Environment variables

Create **`.env.local`** in the project root (this file is git-ignored by typical Vite setups; do **not** commit secrets).

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | No | Enables OpenAI for distress chat assist and optional chat safety merge. |
| `VITE_OPENAI_BASE_URL` | No | Default `https://api.openai.com/v1`. |
| `VITE_OPENAI_MODEL` | No | Default `gpt-4o-mini`. |

**Never** commit API keys or paste them into public repositories. Rotate any key that has been exposed.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | `tsc -b` then `vite build` |
| `npm run preview` | Preview the production build |

---

## Project structure

```
team88/
├── public/                 # Static assets (e.g. favicon)
├── src/
│   ├── App.tsx             # Gate: sign-up vs main shell
│   ├── main.tsx            # React root
│   ├── index.css           # Global styles + Tailwind
│   ├── types.ts            # Shared TypeScript types
│   ├── context/
│   │   └── AppContext.tsx  # Tabs, user, invites, threads, mood, first convo, persistence sync
│   ├── components/         # UI screens & modals
│   ├── data/
│   │   └── mockUsers.ts    # Mock peer profiles
│   ├── i18n/
│   │   ├── translations.ts # English & Nepali strings
│   │   └── useT.ts         # Translation hook
│   └── lib/                # Matching, safety, OpenAI, storage, starters, mood inference, etc.
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── tsconfig*.json
```

---

## Data & persistence

Everything is stored under the key **`together-mvp-v1`** in `localStorage`:

- Current user profile and mood fields  
- Invites and threads (chat messages)  
- Scheduled reminders  
- First-conversation wizard progress and generated starters  

**Log out** (from Connections) clears persisted demo data via `clearPersist()`.

---

## How core flows work

- **Matching:** `scorePeers` compares the user’s tag list to each mock peer’s tags. `rankPeersByMood` can reorder peers using the submitted mood text.
- **Mood → emoji index:** `inferMoodEmoji.ts` scores free text against keyword groups (English + some Nepali) to pick a carousel index.
- **Chat safety:** `scanMessage` applies rules; `openai.ts` may add AI-derived flags when configured.
- **Starters (first conversation):** `starters.ts` builds suggestions from inputs; Nepali output when the profile language is Nepali.
- **Chat starters:** `chatMoodStarters.ts` buckets mood into positive / heavy / reflective / neutral pools and suggests lines (plus optional shared-tag line).

---

## Internationalization

- Strings live in `src/i18n/translations.ts` for **`en`** and **`ne`**.
- Profile language sets `document.documentElement.lang` and a `lang-ne` class for Devanagari font support (see `index.html` font links and `index.css`).

---

## Product vision (Pro)

The profile screen includes **marketing-only** copy for **Together Pro**: a future idea where optional wearable data (e.g. Apple Watch, Whoop, Oura) could inform sleep, heart rate, stress proxies, and activity—supporting **gentle** mood-aware nudges (e.g. reach out, open a chat, small actionable steps). **This repository does not connect to wearables or process health data.**

---

## Security notes

- Passwords and “accounts” are **not** secured; this is a **frontend demo**.
- Bundling `VITE_*` keys ships them to anyone who loads the built site—use **only** for local experimentation unless you accept that risk.
- For production, add a real backend, authentication, rate limiting, and server-side moderation/AI calls.

---

## Repository

Default remote: **`https://github.com/udhungana/team88`**

---

## License

This project is marked **private** in `package.json`. Add a `LICENSE` file if you intend to open-source it.
