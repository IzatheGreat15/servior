# Resource-based API endpoint requirements by page

This is a separate, resource-oriented alternative to [API_ENDPOINTS.md](API_ENDPOINTS.md). It follows common Laravel REST conventions: plural resource names, standard HTTP verbs for CRUD, nested routes where they express ownership, and action-style endpoints only where the operation is inherently a workflow (such as session creation, password reset, or a payment-provider webhook).

This document proposes endpoints; they do not currently exist. The **Implementable** column marks payment endpoints `FALSE` because payment integration is deferred. Other proposed endpoints are marked `TRUE`.

## At a glance

| Page | API required? | Why |
| --- | --- | --- |
| Marketing home (`/`) | No, for current content | The page is static. Add an endpoint only if the waitlist form is brought into the app instead of using the external Google Form. |
| Court booking (`/booking`) | Yes | Read branches, sports, and availability; create a booking. Payment endpoints are specified but deferred. |
| Sign in (`/login`) | Yes, to make sign-in work | The form currently does not authenticate. |
| Create account (`/register`) | Yes, to make registration work | The form currently does not create an account. |
| Forgot password (`/forgot-password`) | Yes, to send reset emails | A full reset flow also needs a recovery callback and password-update screen, which do not exist yet. |
| Dashboard (`/dashboard`) | Yes, for live metrics | The current dashboard is staff/admin-style and uses demo data. |
| Staff bookings (`/bookings`) | Yes, for live bookings | The current table filters and paginates demo data in the browser. |
| My Bookings (`/my-bookings`) | Yes, for member-specific bookings | The page currently uses demo data. |
| Add branch (`/branches/add`) | Yes, to persist changes | Form data currently stays in browser state; save displays a prototype alert. |
| Edit branch (`/branches/{branchId}/edit`) | Yes, to load and persist changes | Current branch content is fixed example data and is not saved. |

## Marketing home — `/`

**API required? No** for the current static marketing content. The waitlist currently links externally. If a first-party waitlist submission is added, a resource-style option is `POST /api/waitlist-subscriptions`; it is not required for the page as implemented.

## Court booking — `/booking`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Get booking options | GET | `/api/booking/options` | None | Return branches and sports with courts configured for paid hourly booking. | TRUE |
| List branch availability | GET | `/api/branches/{branchId}/availability` | Path: `branchId`; query: `date` (YYYY-MM-DD), `sportId` | Return courts and available time slots, including prices, for a branch, sport, and date. Availability is a read-only view of the scheduling resource. | TRUE |
| Create booking | POST | `/api/bookings` | JSON: `branchId`, `sportId`, `date`, `slots[]` (`courtId`, `startHour` for a one-hour slot), `guest` (`name`, `email`, optional `phone`); required `Idempotency-Key` header | Validate and atomically create a guest booking in a temporary `hold` state. Return the booking representation, amount, and hold expiry. | TRUE |
| Create payment for booking | POST | `/api/bookings/{bookingId}/payments` | Path: `bookingId`; JSON: optional allow-listed return/cancel URLs; optional `Idempotency-Key` header | Create a payment resource for a valid booking hold and return the provider checkout URL. Calculate the amount from trusted booking/pricing data, not from client input. | FALSE |
| Receive payment-provider event | POST | `/api/webhooks/paymongo` | Raw provider request body and signature headers | Verify the provider signature, then idempotently update the payment and booking state. This is an external provider callback, so it is intentionally not modeled as a browser CRUD resource. | FALSE |

**Status:** Branch/sport options, court availability, and booking-hold creation are implemented by the `/api/booking/options`, `/api/branches/{branchId}/availability`, and `/api/bookings` Route Handlers. The hold Route Handler calls a PostgreSQL function/RPC to check conflicts and create the hold atomically. Holds expire after 15 minutes. Payment creation is deferred. When implemented, keep provider credentials in server-only code. Choose one deployed webhook URL; a Supabase Edge Function is suitable when the webhook should deploy independently from the web application.

## Sign in — `/login`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Create session | POST | `/api/sessions` | JSON: `email`, `password` | Authenticate through Supabase Auth and establish the application session. Session creation is an authentication workflow, so it is represented as a session resource. | TRUE |

**Where to implement:** Use a Next.js Route Handler or the Supabase SSR Auth client in the Next.js server boundary so session cookies and redirects are handled by the web app. Supabase Auth remains responsible for identity; do not reimplement password/token handling in an Edge Function.

## Create account — `/register`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Create user account | POST | `/api/users` | JSON: `name`, `email`, `password`; optional approved role-specific details | Create an account through Supabase Auth and return confirmation/session state. Never accept a client-selected privileged role. | TRUE |

**Where to implement:** Use the Next.js server boundary with Supabase Auth. Assign roles and tenant memberships only through trusted server-side flows, not form-supplied role values.

## Forgot password — `/forgot-password`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Create password-reset request | POST | `/api/password-reset-requests` | JSON: `email`; configured redirect URL | Ask Supabase Auth to send a password-reset email. Use a fixed, allow-listed callback rather than trusting an arbitrary URL. | TRUE |
| Update password | PUT | `/api/password` | Authenticated recovery session; JSON: `password` | Set a new password after the user follows the recovery link. This endpoint is needed for a complete reset flow, but the callback and password-update page do not exist yet. | TRUE |

**Where to implement:** Use a Next.js Route Handler or Supabase SSR Auth from the Next.js server boundary. Allow-list recovery URLs in Supabase Auth configuration.

## Dashboard — `/dashboard`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Show staff dashboard | GET | `/api/dashboard` | Query: `from`, `to` (YYYY-MM-DD) | Return authorized dashboard totals, booking revenue by date, branch revenue ranking, popular sports, user growth, and recent bookings for the selected period. This is a read-only dashboard projection. | TRUE |

**Where to implement:** Use a Next.js Route Handler that validates the staff session and tenant scope, then queries Supabase. The route currently renders the staff/admin-style dashboard. A member dashboard component exists but is not mounted here; if a separate member dashboard is exposed, it should use the member bookings resource below rather than staff metrics.

## Staff bookings — `/bookings`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| List bookings | GET | `/api/bookings` | Query: optional `q`, `status`, `paymentStatus`, `branchId`, `from`, `to`, `page`, `pageSize` | Return tenant-scoped bookings and session details for the staff bookings table and detail modal. Date filters apply to session dates. | TRUE |

**Where to implement:** Use a Next.js Route Handler with verified staff/tenant access. Query parameters enable filtering and pagination against live data.

## My Bookings — `/my-bookings`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| List my bookings | GET | `/api/me/bookings` | Query: optional `status`, `from`, `to`, `page`, `pageSize` | Return the signed-in user's bookings and session details for the member dashboard and My Bookings page. | TRUE |

**Where to implement:** Use a Next.js Route Handler that derives the customer identity from the verified session. Never accept a client-supplied user/customer ID to choose whose bookings to return; enforce row access with RLS as defense in depth.

## Add branch — `/branches/add`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Create branch | POST | `/api/branches` | JSON: branch name, address/location, contact details, hours, and initial sports/courts/pricing rules | Create a branch and its supplied configuration for the authenticated staff member's tenant. Persist related records transactionally where possible. | TRUE |
| Create court-photo upload | POST | `/api/branches/{branchId}/court-photo-uploads` | Path: `branchId`; JSON: `fileName`, `contentType`, `sizeBytes` | Create a short-lived Supabase Storage upload authorization for a court image. The browser uploads directly to Storage; the API returns the upload URL and object path. | TRUE |

**Where to implement:** Use Next.js Route Handlers to validate staff/tenant membership and write branch data to Supabase. Upload photos directly to Supabase Storage with the short-lived upload authorization rather than proxying large image bodies through the app API.

## Edit branch — `/branches/{branchId}/edit`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Show branch | GET | `/api/branches/{branchId}` | Path: `branchId` | Return the authorized branch, sports, courts, and pricing rules to populate the edit form. | TRUE |
| Update branch | PATCH | `/api/branches/{branchId}` | Path: `branchId`; JSON: fields to change, including branch details and sports/courts/pricing-rule changes | Persist partial branch and nested configuration changes. Verify tenant ownership and validate court/pricing rules on the server. | TRUE |
| Create court-photo upload | POST | `/api/branches/{branchId}/court-photo-uploads` | Path: `branchId`; JSON: `fileName`, `contentType`, `sizeBytes` | Create a short-lived Supabase Storage upload authorization for a court image. The browser uploads directly to Storage. | TRUE |

**Where to implement:** Use Next.js Route Handlers with verified staff/tenant authorization. The photo-upload resource is shared with the Add Branch page. Persist only the Storage path/URL with the court record.

## Pages not included

The currently linked `/terms`, `/privacy`, and `/branches` pages do not exist. Terms and privacy are static/legal pages; `/branches` would use `GET /api/branches` if implemented with live branch data. The configured but unimplemented `/admin/*` destinations are also out of scope for this inventory.

## What changed from the original endpoint proposal

| Original proposal in `API_ENDPOINTS.md` | Resource-based alternative | Change |
| --- | --- | --- |
| `GET /api/booking/options` | `GET /api/branches?bookable=true` and `GET /api/sports` | Reads now target the branch and sport collections instead of an action-like options endpoint. |
| `GET /api/branches/{branchId}/availability` | `GET /api/branches/{branchId}/availability` | Unchanged; availability remains a read-only nested resource. |
| `POST /api/bookings` | `POST /api/bookings` | Unchanged; a booking is created as a temporary hold. |
| `POST /api/bookings/{bookingId}/checkout` | `POST /api/bookings/{bookingId}/payments` | Renamed checkout operation to creating a payment resource. **FALSE**; deferred. |
| `POST /api/webhooks/paymongo` | `POST /api/webhooks/paymongo` | Unchanged; provider callback is an integration endpoint, not a CRUD resource. **FALSE**; deferred. |
| `POST /api/auth/sign-in` | `POST /api/sessions` | Sign-in creates an authenticated session resource. |
| `POST /api/auth/sign-up` | `POST /api/users` | Account registration creates a user resource. |
| `POST /api/auth/password-reset` | `POST /api/password-reset-requests` and `PUT /api/password` | Reset request is modeled as a resource; completing reset updates the password resource. |
| `GET /api/dashboard/summary` | `GET /api/dashboard` | Treat the dashboard as a read-only projection rather than a nested `summary` action. |
| `GET /api/bookings` and `GET /api/me/bookings` | Unchanged | These already use collection-resource routes. The member route retains `/me` so identity always comes from the session. |
| `PUT /api/branches/{branchId}` | `PATCH /api/branches/{branchId}` | Use `PATCH` because the edit form can submit only changed fields; use `PUT` if the API instead requires a complete replacement representation. |
| `POST /api/branches/{branchId}/court-photos/upload-url` | `POST /api/branches/{branchId}/court-photo-uploads` | Model issuing an upload authorization as creating a court-photo-upload resource. |

## Implementation guidance and prerequisites

“Next.js function” here means an App Router **Route Handler** (`route.ts` under `app/api/...`). A “Supabase server-side function” means a **Supabase Edge Function**. Both execute server-side, but have different deployment and trust boundaries.

Use Next.js Route Handlers as the default API layer for requests initiated by these pages. Use Supabase for Auth, Postgres, and Storage, with user-scoped access and explicit RLS policies. Use an Edge Function when an independently deployed integration/background handler is useful—most notably the payment-provider webhook. Do not split the same endpoint between Next.js and Edge Functions without a concrete deployment or security reason.

Keep booking-slot conflict handling in one PostgreSQL transaction (for example, a database function invoked by the booking Route Handler). Keep external provider secrets in server-side environment variables, never in `NEXT_PUBLIC_*` values. Never expose the Supabase service-role key to the browser; any server code using it must perform explicit identity, tenant, and role checks because it bypasses RLS.

Before implementing these proposals, account for the following:

- Authentication, branch management, booking payments, and webhooks are not implemented. The booking UI currently creates guest holds only.
- The booking RPCs use `SECURITY DEFINER` with a restricted `search_path` to read public bookable information and write guest booking holds. Review and test the public booking policy before deployment.
- Checkout/payment references, per-session dates/prices/statuses, and court pricing rules are not implemented. The current booking date/time tables are insufficient for all of the multi-session UI.
- The tenant table has PayMongo account/link fields, but that does not implement payment processing or a webhook. Confirm the provider and its required booking/payment schema before implementing checkout.
- Local Supabase services must be running and configured for Auth, database, and Storage once these endpoints are introduced. Password-reset redirects must be allow-listed in local and deployed Auth configuration.
- Protect staff operations with verified staff/tenant membership; protect member data by deriving the customer identity from the verified session. Internal pages currently have no sign-in/access enforcement.
- The booking UI offers guest booking. Support it safely with rate limiting, validation, opaque references, and non-guessable booking access or verified email.
- Local booking E2E tests use a dedicated local Supabase fixture. See the [Playwright setup](README.md#booking-ui-end-to-end-tests); never use production or shared database credentials for the test runner.
