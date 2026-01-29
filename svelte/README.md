# Rosetta - Svelte Frontend

Article management platform built with SvelteKit, TailwindCSS, and Supabase.

## Features

- Article CRUD (create, read, update, delete)
- Search articles by title with debounced input
- Filter articles by status (Published / Draft)
- Infinite scroll pagination
- Role-based access control (viewer / editor)
- Light/dark theme toggle with persistence
- Loading skeletons and error states
- Keyboard accessible with screen reader support

## Tech Stack

| Layer     | Technology                         |
| --------- | ---------------------------------- |
| Framework | SvelteKit 2 (Svelte 5 with runes)  |
| Styling   | TailwindCSS v4                     |
| Backend   | Supabase (PostgreSQL + Auth + RLS) |
| Icons     | lucide-svelte                      |
| Testing   | Vitest + Playwright                |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (local or hosted)

### Setup

1. Install dependencies:

```sh
npm install
```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```sh
cp .env.example .env
```

Required environment variables:

| Variable                     | Description               |
| ---------------------------- | ------------------------- |
| `PUBLIC_SUPABASE_URL`        | Your Supabase project URL |
| `PUBLIC_SUPABASE_PUBLIC_KEY` | Your Supabase public key  |

3. Run database migrations (from the repository root):

```sh
npx supabase db push
```

4. Start the development server:

```sh
npm run dev
```

## Project Structure

```
src/
├── routes/                     # SvelteKit file-based routing
│   ├── +layout.svelte          # Root layout (header, theme)
│   ├── +layout.server.ts       # Server layout (session, profile)
│   ├── +page.svelte            # Home / redirect
│   ├── auth/                   # Authentication pages
│   │   ├── login/              # Sign in
│   │   ├── register/           # Create account
│   │   └── callback/           # Auth callback handler
│   └── articles/               # Article list page
│       ├── +page.server.ts     # SSR data loading
│       └── +page.svelte        # Article list with CRUD
├── lib/
│   ├── components/
│   │   ├── articles/           # Article-specific components
│   │   ├── common/             # Reusable components
│   │   ├── layout/             # App layout components
│   │   └── search/             # Search and filter components
│   ├── services/               # Data access layer
│   ├── stores/                 # Svelte rune stores
│   ├── supabase/               # Supabase client setup
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── hooks.server.ts             # Server hooks (auth)
└── app.d.ts                    # Global type declarations
```

## Authentication & Authorization

- Email/password authentication via Supabase Auth
- Server-side session management with cookie-based auth
- Two roles: `viewer` (read-only) and `editor` (full CRUD)
- Role stored in `profiles` table, loaded in server layout
- RLS policies enforce data access at database level

## Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start development server     |
| `npm run build`     | Build for production         |
| `npm run preview`   | Preview production build     |
| `npm run check`     | Run Svelte type checking     |
| `npm run lint`      | Check formatting and linting |
| `npm run format`    | Format all files             |
| `npm run test:unit` | Run unit tests               |
| `npm run test:e2e`  | Run end-to-end tests         |
