# API endpoint requirements by page

This document proposes the API surface needed to connect the current Servior pages to real data and actions. These are **design recommendations**, not endpoints that already exist in the application. The project currently has no `app/api` route handlers, and its page data and forms are still prototypes.

## At a glance

In the endpoint tables, **TRUE** means the endpoint is in scope to implement now; **FALSE** means it is deferred. Payment checkout and payment-provider webhook endpoints are marked FALSE because payment integration will be implemented later.

| Page | API required? | Why |
| --- | --- | --- |
| Marketing home (`/`) | No, for current content | The page is static. Add an endpoint only if the waitlist form is brought into the app instead of using the external Google Form. |
| Court booking (`/booking`) | Yes | Load bookable options and availability, create a booking hold, and initiate payment. |
| Sign in (`/login`) | Yes, to make sign-in work | The form currently does not authenticate. |
| Create account (`/register`) | Yes, to make registration work | The form currently does not create an account. |
| Forgot password (`/forgot-password`) | Yes, to send reset emails | A full reset flow also needs a recovery callback and password-update screen, which do not exist yet. |
| Dashboard (`/dashboard`) | Yes, for live metrics | The current dashboard is staff/admin-style and uses demo data. |
| Staff bookings (`/bookings`) | Yes, for live bookings | The current table filters and paginates demo data in the browser. |
| My Bookings (`/my-bookings`) | Yes, for member-specific bookings | The page currently uses demo data. |
| Add branch (`/branches/add`) | Yes, to persist changes | Form data currently stays in browser state; save displays a prototype alert. |
| Edit branch (`/branches/{branchId}/edit`) | Yes, to load and persist changes | Current branch content is fixed example data and is not saved. |

## Marketing home — `/`

**API required? No** for the current static marketing content. The waitlist currently links externally. If a first-party waitlist submission is added, it could use a `POST /api/waitlist` endpoint, but that is not required for the page as implemented.

## Court booking — `/booking`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Get booking options | GET | `/api/booking/options` | None | Return branches and sports with courts configured for paid hourly booking. | TRUE |
| Get court availability | GET | `/api/branches/{branchId}/availability` | Path: `branchId`; query: `date` (YYYY-MM-DD), `sportId` | Return active courts and available time slots, with prices, for the selected branch, sport, and date. | TRUE |
| Create booking hold | POST | `/api/bookings` | JSON: `branchId`, `sportId`, `date`, `slots[]` (`courtId`, `startHour` for a one-hour slot), `guest` (`name`, `email`, optional `phone`); required `Idempotency-Key` header | Validate and atomically reserve the selected slots temporarily. Return the booking ID, amount, and hold expiry. The current UI creates guest bookings. | TRUE |
| Start booking payment | POST | `/api/bookings/{bookingId}/checkout` | Path: `bookingId`; optional return/cancel URLs from an allow-listed set | Create a payment checkout session for a valid booking hold and return the provider redirect URL. The server calculates the amount from trusted booking/pricing data. | FALSE |
| Receive payment-provider event | POST | `/api/webhooks/paymongo` | Raw provider request body and signature headers | Verify the provider signature, then idempotently mark the booking/payment paid, failed, or refunded. This is a provider callback, not a browser-facing page API. | FALSE |

**Status:** Booking options, court availability, and booking-hold creation are implemented by the `/api/booking/options`, `/api/branches/{branchId}/availability`, and `/api/bookings` Route Handlers. The handlers call the `get_public_booking_options`, `get_public_booking_availability`, and `create_booking_hold` PostgreSQL functions added by the booking-holds migration. The atomic hold function reserves individual court-hour slots and uses a 15-minute expiry.

**Where to implement remaining work:** Checkout and the payment webhook are not implemented. Use a Supabase Edge Function or a Next.js Route Handler for the payment webhook, choosing one deployed callback URL; an Edge Function is a good fit when the webhook should deploy independently of the web app.

## Sign in — `/login`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Sign in | POST | `/api/auth/sign-in` | JSON: `email`, `password` | Authenticate through Supabase Auth and establish or refresh the application session. | TRUE |

**Where to implement:** Use a Next.js Route Handler or the Supabase SSR Auth client in the Next.js server boundary so session cookies and redirects are handled by the web app. Supabase Auth remains responsible for identity; do not reimplement password/token handling in an Edge Function.

## Create account — `/register`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Register account | POST | `/api/auth/sign-up` | JSON: `name`, `email`, `password`; optional approved role-specific details | Create an account through Supabase Auth and return the confirmation/session state. Never accept a client-selected privileged role. | TRUE |

**Where to implement:** Use the Next.js server boundary with Supabase Auth, as for sign-in. Assign roles and tenant memberships only through trusted server-side flows, not form-supplied role values.

## Forgot password — `/forgot-password`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Request password reset | POST | `/api/auth/password-reset` | JSON: `email`; configured redirect URL | Ask Supabase Auth to send a password-reset email. Use a fixed, allow-listed callback rather than trusting an arbitrary URL. | TRUE |

**Where to implement:** Use a Next.js Route Handler or Supabase SSR Auth from the Next.js server boundary. The complete flow also needs an allow-listed recovery callback and a page/action to set a new password after the user follows the email link.

## Dashboard — `/dashboard`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Get staff dashboard summary | GET | `/api/dashboard/summary` | Query: `from`, `to` (YYYY-MM-DD) | Return authorized dashboard totals, booking revenue by date, branch revenue ranking, popular sports, user growth, and recent bookings for the selected period. | TRUE |

**Where to implement:** Use a Next.js Route Handler that validates the staff session and tenant scope, then queries Supabase. The route currently renders the staff/admin-style dashboard. A member dashboard component exists but is not mounted here; if a separate member dashboard is exposed, it should use the member endpoint below rather than staff metrics.

## Staff bookings — `/bookings`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| List staff bookings | GET | `/api/bookings` | Query: optional `q`, `status`, `paymentStatus`, `branchId`, `from`, `to`, `page`, `pageSize` | Return tenant-scoped bookings and session details for the staff bookings table and detail modal. Date filters apply to session dates. | TRUE |

**Where to implement:** Use a Next.js Route Handler with verified staff/tenant access. The current table filters and paginates client-side over demo data; query parameters enable filtering and pagination against live data.

## My Bookings — `/my-bookings`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| List my bookings | GET | `/api/me/bookings` | Query: optional `status`, `from`, `to`, `page`, `pageSize` | Return the signed-in user's bookings and session details for the member dashboard and My Bookings page. | TRUE |

**Where to implement:** Use a Next.js Route Handler that derives the customer identity from the verified session. Never accept a client-supplied user/customer ID to choose whose bookings to return; enforce row access with RLS as defense in depth.

## Add branch — `/branches/add`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Create branch | POST | `/api/branches` | JSON: branch name, address/location, contact details, hours, and initial sports/courts/pricing rules | Create a branch and its supplied configuration for the authenticated staff member's tenant. Persist related records transactionally where possible. | TRUE |
| Create court-photo upload URL | POST | `/api/branches/{branchId}/court-photos/upload-url` | Path: `branchId`; JSON: `fileName`, `contentType`, `sizeBytes` | Authorize staff and issue a short-lived Supabase Storage signed upload URL for an image. The browser uploads directly to Storage using that URL. | TRUE |

**Where to implement:** Use Next.js Route Handlers to validate staff/tenant membership and write branch data to Supabase. Upload photos directly to Supabase Storage with a short-lived signed URL rather than proxying large image bodies through the app API.

## Edit branch — `/branches/{branchId}/edit`

| Name of Endpoint | Method | URL | args | Description of purpose | Implementable |
| --- | --- | --- | --- | --- | --- |
| Get branch for editing | GET | `/api/branches/{branchId}` | Path: `branchId` | Return the authorized branch, sports, courts, and pricing rules to populate the edit form. | TRUE |
| Update branch | PUT | `/api/branches/{branchId}` | Path: `branchId`; JSON: editable branch fields and sports/courts/pricing-rule changes | Save branch and nested configuration changes. Verify tenant ownership and validate court/pricing rules on the server. | TRUE |
| Create court-photo upload URL | POST | `/api/branches/{branchId}/court-photos/upload-url` | Path: `branchId`; JSON: `fileName`, `contentType`, `sizeBytes` | Authorize staff and issue a short-lived Supabase Storage signed upload URL for an image. The browser uploads directly to Storage using that URL. | TRUE |

**Where to implement:** Use Next.js Route Handlers with verified staff/tenant authorization. The upload URL endpoint is shared with the Add Branch page. For both pages, store the image in Supabase Storage and persist only its Storage path/URL with the court record.

## Pages not included

The currently linked `/terms`, `/privacy`, and `/branches` pages do not exist. Terms and privacy are static/legal pages; `/branches` would need a list endpoint only if that page is implemented with live branch data. The configured but unimplemented `/admin/*` destinations are also out of scope for this inventory.

## Implementation guidance and prerequisites

“Next.js function” here means an App Router **Route Handler** (`route.ts` under `app/api/...`). A “Supabase server-side function” means a **Supabase Edge Function**. Both execute server-side, but have different deployment and trust boundaries.

Use Next.js Route Handlers as the default API layer for requests initiated by these pages. Use Supabase for Auth, Postgres, and Storage, with user-scoped access and explicit RLS policies. Use an Edge Function when an independently deployed integration/background handler is useful—most notably the payment-provider webhook. Do not split the same endpoint between Next.js and Edge Functions without a concrete deployment or security reason.

Keep booking-slot conflict handling in one PostgreSQL transaction (for example, a database function invoked by the booking Route Handler). Keep external provider secrets in server-side environment variables, never in `NEXT_PUBLIC_*` values. Never expose the Supabase service-role key to the browser; any server code using it must perform explicit identity, tenant, and role checks because it bypasses RLS.

Before implementing these proposals, account for the following:

- The booking endpoints currently use database functions with a fixed application-owned `search_path`; review and test their access policy before deploying publicly. They do not accept client-controlled prices or booking status.
- Authentication, checkout, and webhooks are not implemented. The schema does not yet model payment/provider references, per-session dates/prices/statuses, or court pricing rules needed for a complete multi-session/payment flow.
- The tenant table has PayMongo account/link fields, but that does not implement payment processing or a webhook. Confirm the provider and its required booking/payment schema before implementing checkout.
- Local Supabase services must be running and configured for Auth, database, and Storage once these endpoints are introduced. Password-reset redirects must be allow-listed in local and deployed Auth configuration.
- Protect staff operations with verified staff/tenant membership; protect member data by deriving the customer identity from the verified session. Internal pages currently have no sign-in/access enforcement.
- The booking UI offers guest booking. Support it safely with rate limiting, validation, opaque references, and non-guessable booking access or verified email.
- Local booking E2E tests use only a dedicated local Supabase fixture. See the [Playwright setup](README.md#booking-ui-end-to-end-tests); never use production or shared database credentials for the test runner.
