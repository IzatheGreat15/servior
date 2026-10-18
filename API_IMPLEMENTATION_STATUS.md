# Resource-based API implementation status

This inventory compares the endpoint list in [API_ENDPOINTS_RESOURCE_BASED.md](API_ENDPOINTS_RESOURCE_BASED.md) with the current source tree. Status is based on the repository contents inspected on 2026-10-17; it describes code present in the repository, not whether local Supabase credentials/services are currently available.

## Summary

| Status | Count | Meaning |
| --- | ---: | --- |
| Implemented | 3 | A matching Next.js Route Handler exists and is used by the relevant page. |
| Not implemented | 11 | No matching endpoint handler exists yet. |
| Deferred | 2 | Payment integration endpoints are intentionally postponed, as marked in the resource API proposal. |

Counts are for unique endpoint routes; the court-photo upload route is listed under both Add Branch and Edit Branch but counted once.

The health check at `GET /api/health/supabase` is implemented, but it is an operational endpoint and is not one of the page/resource APIs inventoried below.

## Court booking — `/booking`

| Method and endpoint | Status | Current implementation | Target files to integrate or complete |
| --- | --- | --- | --- |
| `GET /api/booking/options` | Implemented | `app/api/booking/options/route.ts`; reads options through the `get_public_booking_options` database function. | Already used by `components/booking/BookingPage.tsx`. Shared response types are in `lib/booking/options.ts`. |
| `GET /api/branches/{branchId}/availability` | Implemented | `app/api/branches/[branchId]/availability/route.ts`; validates branch, sport, and date, then calls `get_public_booking_availability`. | Already used by `components/booking/BookingPage.tsx`. Shared response types are in `lib/booking/options.ts`. |
| `POST /api/bookings` | Implemented | `app/api/bookings/route.ts`; validates guest/slot input and an idempotency key, then calls `create_booking_hold`. | Already used by `components/booking/BookingPage.tsx`. Database functions are defined in `supabase/migrations/20261017100000_booking_holds.sql`. |
| `POST /api/bookings/{bookingId}/payments` | Deferred | No handler; payment work is explicitly deferred. | When payment work begins, add `app/api/bookings/[bookingId]/payments/route.ts`; integrate the checkout flow in `components/booking/BookingPage.tsx` and likely `components/booking/BookingSummary.tsx`. |
| `POST /api/webhooks/paymongo` | Deferred | No webhook handler or Supabase Edge Function was found. | If hosted in Next.js, add `app/api/webhooks/paymongo/route.ts`. If hosted as an Edge Function, add a function under `supabase/functions/` and configure the provider callback. Payment integration remains deferred. |

The booking page now loads options, availability, and creates a hold from the API. Its current confirmation is only a hold confirmation; it does not collect payment.

## Sign in — `/login`

| Method and endpoint | Status | Current implementation | Target files to integrate or complete |
| --- | --- | --- | --- |
| `POST /api/sessions` | Not implemented | No sessions route or Supabase sign-in call exists. | Add `app/api/sessions/route.ts`; connect the form in `app/(auth)/login/page.tsx`. For cookie-backed auth, review/update `lib/supabase/server.ts` and add the required Supabase SSR client setup. |

## Create account — `/register`

| Method and endpoint | Status | Current implementation | Target files to integrate or complete |
| --- | --- | --- | --- |
| `POST /api/users` | Not implemented | No users route or Supabase sign-up call exists. | Add `app/api/users/route.ts`; connect the form in `app/(auth)/register/page.tsx`. Add trusted account/profile provisioning as needed; do not take privileged roles from this form. |

## Forgot password — `/forgot-password`

| Method and endpoint | Status | Current implementation | Target files to integrate or complete |
| --- | --- | --- | --- |
| `POST /api/password-reset-requests` | Not implemented | No password-reset route or Auth call exists. | Add `app/api/password-reset-requests/route.ts`; connect the form in `app/(auth)/forgot-password/page.tsx`; configure local/deployed Auth redirect allow-lists. |
| `PUT /api/password` | Not implemented | No password-update route or recovery page exists. | Add `app/api/password/route.ts` and a recovery/password-update page under `app/(auth)/` (for example `app/(auth)/reset-password/page.tsx`); connect the form there to the recovery session. |

## Dashboard — `/dashboard`

| Method and endpoint | Status | Current implementation | Target files to integrate or complete |
| --- | --- | --- | --- |
| `GET /api/dashboard` | Not implemented | `components/internal/admin/dashboard/DashboardPage.tsx` uses imported mock metrics and bookings; there is no dashboard handler. | Add `app/api/dashboard/route.ts`; replace mock data in `components/internal/admin/dashboard/DashboardPage.tsx` with a request and loading/error handling. Relevant dashboard widgets/types may also need API response types. |

## Staff bookings — `/bookings`

| Method and endpoint | Status | Current implementation | Target files to integrate or complete |
| --- | --- | --- | --- |
| `GET /api/bookings` | Not implemented | `app/api/bookings/route.ts` currently exports only `POST`; it does not implement the collection `GET`. | Add `GET` to `app/api/bookings/route.ts`; load results in `app/(internal)/(staff)/bookings/page.tsx` and pass them to `components/internal/admin/dashboard/BookingsTable.tsx`. Move filtering/pagination to the API as desired. |

## My Bookings — `/my-bookings`

| Method and endpoint | Status | Current implementation | Target files to integrate or complete |
| --- | --- | --- | --- |
| `GET /api/me/bookings` | Not implemented | `app/(internal)/(member)/my-bookings/page.tsx` filters imported `mockBookings`; no member endpoint exists. | Add `app/api/me/bookings/route.ts`; replace mock data in `app/(internal)/(member)/my-bookings/page.tsx`. If the member dashboard is enabled, also integrate `components/internal/member/dashboard/DashboardPage.tsx`. Identity must come from an authenticated session. |

## Add branch — `/branches/add`

| Method and endpoint | Status | Current implementation | Target files to integrate or complete |
| --- | --- | --- | --- |
| `POST /api/branches` | Not implemented | No branch collection handler exists; the page's save button displays a prototype alert. | Add `POST` to `app/api/branches/route.ts`; connect the save action in `app/(internal)/(staff)/branches/add/page.tsx`. Lift/share form state from `components/internal/branches/BranchDetailForm.tsx` and `components/internal/branches/SportsCourtsPanel.tsx` so the full nested form can be submitted. |
| `POST /api/branches/{branchId}/court-photo-uploads` | Not implemented | No Storage upload authorization handler or Storage integration exists. | Add `app/api/branches/[branchId]/court-photo-uploads/route.ts`; integrate upload handling in `components/internal/branches/CourtModal.tsx`. The new-branch flow may need to create the branch before requesting branch-scoped uploads, or use a separate temporary upload scope. |

## Edit branch — `/branches/{branchId}/edit`

| Method and endpoint | Status | Current implementation | Target files to integrate or complete |
| --- | --- | --- | --- |
| `GET /api/branches/{branchId}` | Not implemented | No branch detail handler exists; the page renders fixed Greenfield example content. | Add `GET` to `app/api/branches/[branchId]/route.ts`; fetch and populate fields in `app/(internal)/(staff)/branches/[id]/edit/page.tsx`, `components/internal/branches/BranchDetailForm.tsx`, and `components/internal/branches/SportsCourtsPanel.tsx`. |
| `PATCH /api/branches/{branchId}` | Not implemented | No branch update handler exists; the save button displays a prototype alert. | Add `PATCH` to `app/api/branches/[branchId]/route.ts`; connect save in `app/(internal)/(staff)/branches/[id]/edit/page.tsx` using shared branch/court form state. |
| `POST /api/branches/{branchId}/court-photo-uploads` | Not implemented | No upload handler exists. | Share `app/api/branches/[branchId]/court-photo-uploads/route.ts` with Add Branch; integrate it in `components/internal/branches/CourtModal.tsx`. |

## Cross-cutting prerequisites and observations

- API handlers found in the repository are the booking options, availability, booking creation, and Supabase health handlers. No Supabase Edge Functions were found.
- `lib/supabase/server.ts` currently constructs a server-only Supabase client with the anon key, but does not read or persist a signed-in user's cookies/session. Before authenticated endpoints are added, implement the project's intended SSR session handling and authorization checks.
- The booking handlers call three SQL functions in `supabase/migrations/20261017100000_booking_holds.sql`. The initial schema migration alone does not define those functions.
- Staff and member pages are not currently protected by sign-in. Add route/page authorization as well as endpoint authorization before exposing private booking, dashboard, or branch data.
- The current branch edit/add form state is local to child components. Integrating the full branch payload will require sharing state or introducing a parent form/controller so branch details, sports, courts, pricing rules, and photo references can be submitted together.
- `API_ENDPOINTS_RESOURCE_BASED.md` currently describes booking options as `GET /api/booking/options`, matching the implemented handler. Its “What changed from the original endpoint proposal” table still lists `GET /api/branches?bookable=true` and `GET /api/sports` instead. Decide which contract is canonical and align that comparison table before treating this inventory as a final API specification.
