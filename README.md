# vibespace

vibespace is a React + TypeScript wellness demo app built with Vite and Tailwind CSS.

## Team Members
- Swach Acharya
- Utsav Dhungana
- Lochan Acharya

## Features

- Mood-based swipe matching
- First Talk starter generator (family or friend)
- Chat area with invite notifications
- Reminder scheduling with audience label and delete option
- Distress support panel with optional AI-assisted replies
- English and Nepali UI localization

## Tech Stack

- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create or update `.env.local` in the project root.

Optional AI settings (for demo use):

```env
# Perplexity (preferred if provided)
VITE_PERPLEXITY_API_KEY=
VITE_PERPLEXITY_BASE_URL=https://api.perplexity.ai
VITE_PERPLEXITY_MODEL=sonar
VITE_PERPLEXITY_MODEL_CHAT=sonar-pro
VITE_PERPLEXITY_MODEL_STRUCTURED=sonar-reasoning-pro

# OpenAI fallback
VITE_OPENAI_API_KEY=
VITE_OPENAI_BASE_URL=https://api.openai.com/v1
VITE_OPENAI_MODEL=gpt-4o-mini
```

Notes:
- If no API keys are set, the app still works using local/template behavior.
- This project is a demo. Do not expose production secrets in client-side env vars.

3. Run the dev server:

```bash
npm run dev
```

4. Open the local URL shown in terminal (usually http://localhost:5173).

## Build and Preview

Build production assets:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deploy (Netlify)

This repo includes `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`

Deploy to production with Netlify CLI:

```bash
npx netlify deploy --build --prod
```

## Project Structure

```text
src/
  components/     UI screens and panels
  context/        App state and actions
  data/           Demo mock data
  i18n/           Translation dictionaries and hooks
  lib/            Matching, safety, AI helpers, storage helpers
  types.ts        Shared app types
public/           Static assets (favicon/logo)
```

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Type check and build
- `npm run preview` - Preview built app
