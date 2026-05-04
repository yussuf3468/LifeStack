# LifeStack

LifeStack is a mobile-first personal operating system for daily discipline. It combines habit tracking, prayer tracking, dhikr, Quran study, hydration, focus blocks, journaling, streaks, and long-term stats in a fast PWA designed for daily use.

## Stack

- React 19
- TypeScript
- Vite 8
- React Router with hash routing for static hosting
- Supabase for authentication and long-term sync
- Local-first persistence for instant daily use

## Features

- Daily dashboard with habits, energy, hydration, focus, sleep, mood, and reflection
- Dedicated Quran screen with daily study flow and tafseer-style guidance
- Dedicated prayer screen with history and completion trends
- Dhikr tracker and long-term stats views
- Offline-friendly PWA with service worker and install support
- Local data scoped per authenticated user with optional Supabase sync

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The production output is generated in `dist/`.

## Environment variables

Copy `.env.example` to a local env file and provide your Supabase values:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For hosted deployments, set these variables in your hosting provider instead of committing env files.

## Supabase setup

1. Create a Supabase project.
2. Enable Email auth in Supabase Auth.
3. Disable anonymous auth.
4. Run the SQL in `supabase/schema.sql`.
5. Use the email/password account you created in Supabase to sign in.

## Deployment notes

- The app uses hash routing, so it works well on static hosts.
- Build with `npm run build` and deploy the `dist/` folder.
- Keep `.env.example` in the repo, but do not commit real env files.

## Scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` runs TypeScript build checks and creates the production bundle.
- `npm run lint` runs ESLint.
- `npm run preview` serves the production build locally.
