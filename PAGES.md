# Servior page inventory

This inventory lists the pages currently implemented in the App Router and how to open them on a local deployment.

For the proposed backend endpoints and where to implement them, see the [API endpoint requirements](API_ENDPOINTS.md).

## Start the app locally

From the repository root, install dependencies with npm and start the development server with `npx`:

```bash
npm install
npx next dev
```

Open [http://localhost:3000](http://localhost:3000). If port 3000 is already in use, Next.js may choose another port; use the URL printed in the terminal instead. No `.env` values or local Supabase services are currently required to view these pages. Internet access is needed for the Google font and some externally hosted background images and video.

To preview a production build locally, run `npx next build` followed by `npx next start`, then open the URL printed by Next.js (normally `http://localhost:3000`).

## Implemented pages

| Page | Local URL | Prerequisites / notes |
| --- | --- | --- |
| Marketing home | [http://localhost:3000/](http://localhost:3000/) | None beyond starting the app. Sign-in and registration links are available in the header. |
| Court booking | [http://localhost:3000/booking](http://localhost:3000/booking) | Reads bookable branches, courts, and availability from Supabase. Submitting guest details creates a 15-minute booking hold; payment is not implemented. |
| Sign in | [http://localhost:3000/login](http://localhost:3000/login) | No account required to view. Submits credentials to Supabase Auth; a successful sign-in opens the dashboard. |
| Create account | [http://localhost:3000/register](http://localhost:3000/register) | No account required to view. Registration has not been connected, so the form does not create an account. |
| Forgot password | [http://localhost:3000/forgot-password](http://localhost:3000/forgot-password) | No account required to view. Requests a recovery email through Supabase Auth; `/reset-password` accepts a valid recovery session to update the password. |
| Internal dashboard | [http://localhost:3000/dashboard](http://localhost:3000/dashboard) | Opens directly; no sign-in is currently enforced. Dashboard content is a UI prototype using demo data. |
| Staff bookings | [http://localhost:3000/bookings](http://localhost:3000/bookings) | Opens directly; no sign-in is currently enforced. Booking rows are demo data. |
| Member bookings | [http://localhost:3000/my-bookings](http://localhost:3000/my-bookings) | Opens directly; no sign-in is currently enforced. Booking rows are demo data. |
| Add branch | [http://localhost:3000/branches/add](http://localhost:3000/branches/add) | The editor starts with example values. Saving creates a branch through the staff-only API and opens its edit route; a staff session and Supabase are required to persist it. |
| Edit branch | [http://localhost:3000/branches/branch-1/edit](http://localhost:3000/branches/branch-1/edit) | The `[id]` segment must be a branch ID available to the signed-in staff user. Branch data is loaded and saved through staff-only APIs. |

## Links that do not have pages yet

The following destinations are referenced by existing UI, but no corresponding page is currently implemented. Visiting them locally will not open a project page:

- `/terms` — Terms of Service link in the registration and sign-in layouts.
- `/privacy` — Privacy Policy link in the registration and sign-in layouts.
- `/branches` — Branches navigation destination; only add and edit branch pages exist.
- `/courts` — Linked from a bookings empty state.
- `/admin/dashboard`, `/admin/users`, `/admin/companies`, `/admin/settings` — Destinations in the admin navigation configuration; no admin pages currently exist.

## Current access and data limitations

- Internal pages are directly reachable without signing in; they are not access-controlled.
- Login, password reset, branch persistence, and booking holds use Supabase-backed APIs. Staff branch reads/writes require an authenticated staff user, although the internal page shells may still be directly reachable.
- Booking holds persist in Supabase; payment and automatic confirmation are not implemented. The add-branch editor begins with sample values, and dashboard examples use in-project demo data.

## Page source files

- Home: [`app/(marketing)/page.tsx`](app/(marketing)/page.tsx)
- Booking: [`app/booking/page.tsx`](app/booking/page.tsx)
- Sign in: [`app/(auth)/login/page.tsx`](app/(auth)/login/page.tsx)
- Registration: [`app/(auth)/register/page.tsx`](app/(auth)/register/page.tsx)
- Password reset: [`app/(auth)/forgot-password/page.tsx`](app/(auth)/forgot-password/page.tsx)
- Dashboard: [`app/(internal)/dashboard/page.tsx`](app/(internal)/dashboard/page.tsx)
- Staff bookings: [`app/(internal)/(staff)/bookings/page.tsx`](app/(internal)/(staff)/bookings/page.tsx)
- Member bookings: [`app/(internal)/(member)/my-bookings/page.tsx`](app/(internal)/(member)/my-bookings/page.tsx)
- Add branch: [`app/(internal)/(staff)/branches/add/page.tsx`](app/(internal)/(staff)/branches/add/page.tsx)
- Edit branch: [`app/(internal)/(staff)/branches/[id]/edit/page.tsx`](app/(internal)/(staff)/branches/[id]/edit/page.tsx)

## UI testing

Each implemented page has an independent component-level test under `tests/page/`. User journeys are Playwright tests under `tests/flow/`; failure-state tests are under `tests/error-handling/`. The separate commands and local database safety setup are documented in the [UI test suites section of the README](README.md#ui-test-suites). Tests must run only against local Supabase and use the dedicated Playwright fixture branch.
