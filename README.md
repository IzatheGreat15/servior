This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## UI test suites

The UI suite is split into three categories:

- **Page (unit):** Vitest and React Testing Library mount one page component at a time and verify its main content, controls, and display data. Each route has its own test file under `tests/page/`.
- **Flow (integration/E2E):** Playwright tests user journeys in Chromium against a production build. Flow tests live under `tests/flow/` and can use local Supabase.
- **Error handling:** Playwright tests page- and flow-scope failure behavior. API/network failures are stubbed so the suite is deterministic and does not require database fixtures.

Run all categories with `npm run test:ui`. Run one category with `npm run test:ui:page:all`, `npm run test:ui:flow`, or `npm run test:ui:error`. Run one page by file, for example `npm run test:ui:page -- tests/page/login.test.tsx`.

Page tests are isolated from the backend. Flow tests use local Supabase: start the local services, apply repository migrations, set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_DB_URL` in `.env.local`, and install Chromium once with `npm run test:e2e:install`. The flow fixture is a dedicated test tenant, branch, sport, and courts. The suite removes its test bookings and fixture records; it does not reset or drop the database. Never use a production or shared database.

The booking flow test selects two hours on one court and one on another, creates a real 15-minute hold, checks the server-calculated total, and verifies the held slots disappear from availability. Booking holds do not process payments.

## Local database seed data

`supabase/seed.sql` creates 100 demo rows in each of the 11 public tables,
including related courts, bookings, inventory, pricing rules, employees, and
profiles. It creates corresponding Supabase Auth users for the profile,
employee, and booking foreign keys. Seed accounts use reserved `.invalid`
email addresses and the password `password`.

Supabase runs this file after migrations during `supabase db reset`; reset
clears the local database first. To apply pending migrations and add or refresh
only the demo rows without resetting the database, run these commands from the
repository root in PowerShell:

```powershell
npx supabase start
npx supabase migration up --local
Get-Content -Raw -Encoding UTF8 .\supabase\seed.sql | docker exec -i supabase_db_servior psql -U postgres -d postgres -X -v ON_ERROR_STOP=1
```

Use only a local development database. The seeder replaces its own demo Auth
users and demo tenants on reruns; their dependent seed records are removed by
cascade. It does not delete non-seed users or tenants.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# servior

## Supabase connection

The server-side Supabase client is in `lib/supabase/server.ts`. Configure
`SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env.local` (copy the names and
local URL from `.env.example`, then add the anon/publishable key from your
Supabase project). Never put a `service_role` key in browser code or commit
credentials.

With Supabase running and the project migration applied, check the connection
at `GET /api/health/supabase`. The endpoint runs a read-only, zero-row query
against `public.sports`; it returns `connected` only when that table is
reachable with the configured key.
