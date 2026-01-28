# Rosetta — React (Next.js)

Article management platform built with Next.js 16, Tailwind CSS v4, shadcn/ui, and Supabase.

## Features

- **Article CRUD** — Create, read, update, and delete articles
- **Infinite Scroll** — Articles load automatically as you scroll
- **Search & Filter** — Search by title, filter by status (Published / Draft)
- **Role-Based Access** — Editors can create/edit/delete; viewers can only browse
- **Dark Mode** — Toggle between light and dark themes (persisted)
- **Skeleton Loading** — Loading placeholders while data is fetched
- **Error Handling** — Error messages with retry functionality
- **Accessibility** — Keyboard navigation, screen reader support, skip-to-content link

## Prerequisites

- Node.js 20+
- Supabase project (local or hosted)

## Setup

1. Install dependencies:

   ```bash
   cd react
   npm install
   ```

2. Create environment file:

   ```bash
   cp .env.local.example .env.local
   ```

3. Set your Supabase credentials in `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

4. Run database migrations (from project root):

   ```bash
   supabase db push
   ```

5. Start development server:

   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (providers, header, footer)
│   ├── page.tsx            # Home (redirects to /articles)
│   ├── articles/page.tsx   # Article list page
│   ├── login/page.tsx      # Login page
│   └── auth/callback/      # Supabase auth callback
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── articles/           # Article-specific components
│   ├── layout/             # Header, Footer
│   └── theme/              # ThemeProvider, ThemeToggle
├── hooks/                  # Custom React hooks
│   ├── use-articles.ts     # Infinite scroll article fetching
│   ├── use-article-mutations.ts  # Create/update/delete operations
│   └── use-user.ts         # Auth state and role management
├── lib/
│   ├── supabase/           # Supabase client configuration
│   ├── types/              # TypeScript type definitions
│   ├── constants.ts        # App constants
│   └── utils.ts            # Utility functions
└── middleware.ts            # Auth session refresh middleware
```

## Database

The Supabase schema includes:

- `articles` table with title, content, status (draft/published), and author tracking
- `profiles` table with display names and user roles (viewer/editor)
- Row Level Security policies for access control
- Automatic triggers for timestamps and profile creation

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |
