# Flow-test procedures

Use these step-by-step procedures when implementing Playwright journeys for
login, password reset, branch creation, court creation, and booking. They
describe the current UI and expected behavior, not additional UI requirements.
Use accessible locators (`getByRole`, `getByLabel`, `getByText`) and wait for
visible results or API responses rather than fixed delays.

## Before writing a flow test

1. Add the Playwright test under `tests/flow/` and use the existing config,
   fixtures, and `captureEvidence` helper.
2. Run only against a production build and local Supabase. Configure
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_DB_URL` in `.env.local`,
   apply migrations, then run `npm run test:ui:flow`. Install Chromium once
   with `npm run test:e2e:install`.
3. Set up deterministic test data before navigating: local user credentials
   for auth, staff-role credentials for branch/court, and unique names/dates
   for records. Always clean up data created by a flow. Never use production
   or shared Supabase.
4. Use `page.goto()` for the route if the UI has no working route to that
   journey. Assert the starting page before interacting.
5. For each submit action, assert the visible outcome and, where meaningful,
   the request method/status and persisted result after reload. Do not treat
   a local UI state change as proof of persistence.

Automated flow coverage currently exists only for booking in
[`booking.spec.ts`](./booking.spec.ts). The procedures below for login,
password reset, branch, and court are not yet implemented as Playwright
journeys.

## Login flow

**Start at:** `/login`  
**Request:** `POST /api/sessions`

1. Arrange a local Supabase user with a known email and password. Keep the
   credentials in test setup/environment, not in source control.
2. Navigate to `/login`.
3. Assert the “Welcome back” heading, “Email address” input, “Password” input,
   and “Sign in” button are visible.
4. Assert the password input is initially `type="password"`. Click “Show
   password” and assert it changes to `type="text"`; click “Hide password” and
   assert it returns to `type="password"`.
5. Fill the test user's email and password.
6. Before clicking “Sign in”, wait for a `POST /api/sessions` response. Click
   the button and assert a successful response.
7. Assert the page navigates to `/dashboard`. If subsequent tests need an
   authenticated browser session, verify it remains authenticated after a
   reload.

**Negative cases to add:**

- Submit an incorrect password; assert the `401` response, the alert “Email or
  password is incorrect.”, and that the page remains on `/login`.
- Stub an unavailable API/network response; assert the temporary-unavailability
  alert and that the user can retry.
- While a delayed request is pending, assert the button is disabled and reads
  “Signing in...”.

**Current UI gaps / cautions:**

- “Remember me” is displayed but the current login submit handler does not send
  or use its checkbox value. Do not assert persistent-login behavior.
- There is no dedicated success panel; successful login is indicated by
  navigation to `/dashboard`.
- This flow needs a provisioned local Auth user; current flow setup does not
  create one.

## Forgot-password and reset-password flow

**Start at:** `/login`  
**Routes:** `/forgot-password` → email recovery link → `/reset-password`  
**Requests:** `POST /api/password-reset-requests`, then `PUT /api/password`

1. Navigate to `/login` and click “Forgot password?”.
2. Assert navigation to `/forgot-password`, the “Forgot your password?”
   heading, required “Email address” field, and “Send reset link” button.
3. Fill a valid local test-user email. Wait for a `POST
   /api/password-reset-requests` response, then click “Send reset link”.
4. Assert the success status reads “If an account exists for that email, a
   reset link will be sent.” Do not assert whether the email exists based on
   this message; the response intentionally avoids account enumeration.
5. Retrieve the recovery link from the local Supabase email catcher/test
   harness. Open it in the same browser context so the recovery session is
   available to the page.
6. Assert `/reset-password` loads with a valid recovery session and the
   “Update password” button becomes enabled.
7. Fill “New password” and “Confirm new password” with the same password
   (8–128 characters). Wait for a `PUT /api/password` response, then click
   “Update password”.
8. Assert the status “Your password has been updated. You can now sign in.”
9. Return to `/login` and verify the new password succeeds. If the old password
   is known, optionally assert it no longer works.

**Negative cases to add:**

- Submit malformed email and assert native required/email validation prevents
  the request.
- Stub a failed reset-request response/network error and assert the retryable
  reset-link message.
- Open `/reset-password` without a recovery fragment; assert the instruction
  message and disabled “Update password” button.
- With an invalid/expired recovery session, assert the invalid/expired message.
- Enter different confirmation text; assert “The passwords do not match.” and
  verify no `PUT /api/password` request was made.
- Stub failed password update; assert the error status and no success message.

**Current UI gaps / cautions:**

- After requesting the email, the page does not display the recovery link or
  provide a button to continue to `/reset-password`. The test must obtain the
  link through local email capture or deliberately test the reset page with a
  controlled recovery session.
- No reset-password page component test or password-reset flow test currently
  exists. Local Supabase email delivery/recovery setup is required for a true
  end-to-end journey; do not rely on real external email.

## Add-branch flow

**Start at:** signed-in staff session → `/branches/add`  
**Request:** `POST /api/branches` (staff access required)

1. Provision/sign in a local user authorized for staff branch management.
2. Start on `/dashboard`. In the sidebar, open “Branches” if its submenu is
   collapsed, then click “Add Branch”. Alternatively navigate directly to
   `/branches/add` if testing form behavior in isolation.
3. Assert “Add New Branch”, “Branch details”, “Operating hours”, “Sports &
   Courts”, and “Save branch” are visible.
4. The form starts with example branch details and example sports/courts. Fill
   “Branch name” with a unique test name and fill “Address” with a valid value.
   Set contact details and operating hours to known test values as needed.
5. If testing a minimal branch, remove or adjust the example data as required
   by the branch API/database validation. If testing court creation in the same
   journey, add the court before saving (see Add-court procedure).
6. Wait for a `POST /api/branches` response, then click “Save branch”.
7. Assert success status “Branch saved.” and navigation to
   `/branches/<id>/edit`.
8. Reload the resulting edit route. Assert a branch load request succeeds and
   the unique name, address, and configured sports/courts are present after
   reload.
9. Delete the test branch (and dependent test data) in teardown.

**Negative cases to add:**

- Clear “Branch name” or “Address” and submit; assert no success navigation
  and an error is shown. The API requires both values.
- Run as an unauthenticated user/non-staff user; assert the request is rejected
  and the page does not show “Branch saved.”
- Stub an API/service failure; assert the error status is shown and entered
  form data remains available for retry.

**Current UI gaps / cautions:**

- The Add Branch sidebar link exists, but the parent `/branches` destination
  has no implemented page. Use the “Add Branch” child link or direct route;
  do not click a nonexistent Branches index page expecting a branch list.
- The sidebar's example links `/branches/branch-1/edit` and
  `/branches/branch-2/edit` use nonnumeric IDs. The branch API accepts numeric
  IDs, so use the actual ID returned by branch creation or a valid seeded
  branch for edit journeys.
- The editor's initial values are examples, not blank fields; tests must
  overwrite values and clean up persisted rows.
- Existing flow setup provisions booking fixtures only. There is no staff
  account/branch fixture or branch cleanup helper yet.

## Add-court flow

**Start at:** `/branches/add` or a valid `/branches/<numeric-id>/edit` route  
**UI actions:** “Add court” → “Save court” → parent “Save branch”  
**Persistence:** parent `POST /api/branches` or `PATCH /api/branches/<id>`

1. Sign in as a local staff user and open the branch editor. For an existing
   branch, use a numeric branch ID that the staff user can access.
2. Locate the intended sport group and click its “Add court” button.
3. Assert a dialog is visible with heading “Add court” and the correct sport
   name. Assert the “Court name” input, “Court is active” checkbox, pricing
   controls, “Cancel”, and “Save court” are present.
4. Fill “Court name” with a unique test value.
5. For the basic path, leave the default active state and no pricing rules;
   for pricing coverage, click “Add rule”, set its days/time/rate, and assert
   the values appear in the dialog.
6. Click “Save court”. Assert the dialog closes and the court name appears
   inside the intended sport group. At this point, only editor state changed.
7. Wait for the parent `POST /api/branches` or `PATCH /api/branches/<id>`
   response, then click “Save branch”.
8. Assert “Branch saved.” and, for a new branch, navigation to the returned
   edit route.
9. Reload the edit route and assert the court is still listed under the correct
   sport. This reload is the persistence check.
10. Remove the created branch/court through test cleanup (or restore the
    seeded branch to its original state).

**Negative / optional cases to add:**

- Save with a blank/whitespace court name; assert alert “Enter a name for this
  court.” and that the dialog remains open.
- Add invalid pricing rules (no days, end time not after start, negative rate,
  or overlapping times on shared days); assert the matching validation alert
  and that the dialog remains open.
- Select a non-image or image larger than 5 MB; assert the photo error.
- Cancel or close the dialog; assert the unsaved court does not appear in the
  sport group.
- For photo persistence, use a local fixture image, save the parent branch,
  reload, and verify the image is attached. Cover upload failure separately.

**Current UI gaps / cautions:**

- “Save court” only changes local editor state; the current UI has no separate
  backend save for a court. The parent “Save branch” action is required.
- The Add court modal has no visible delete-court action. Do not write a
  delete-court journey against this screen unless the product adds one.
- No court flow test or staff/court database fixture exists yet.

## Booking flow

**Start at:** `/booking`  
**Requests:** `GET /api/booking/options`,
`GET /api/branches/<branchId>/availability`, `POST /api/bookings`

1. Use the existing local booking fixture (“Servior Playwright Test Branch”,
   “Servior Playwright Test Sport”, “Court 1”, and “Court 2”) from
   `tests/flow/global-setup.ts`. Choose a future date unique to the test to
   avoid existing holds.
2. Navigate directly to `/booking` and assert the “Book your court” heading.
   Wait until branch/sport choices and availability have loaded.
3. Choose the fixture branch and sport, then fill “Date” with the future date.
   Wait for the availability request to finish.
4. Click one or more available court-hour buttons. For a multi-slot test,
   select two hours on Court 1 and one hour on Court 2.
5. Assert each selection appears in “Booking Summary”; assert slot count,
   duration, and estimated total match the selected hours and per-hour rates.
   Assert unavailable slots are disabled.
6. Click “Continue”; assert the booking-details dialog is visible. Fill “Full
   name” and “Email address”; phone is optional.
7. Wait for `POST /api/bookings`, click “Create booking hold”, and assert
   response status `201`. Verify returned hold ID, `held` status, future
   `expiresAt`, and server-calculated total.
8. Assert the page shows a “Booking hold” status. Wait for availability to
   refresh and assert the held hours are now disabled/unavailable.
9. Let the existing global teardown remove test bookings. Do not create
   fixture data or run cleanup against a non-local database.

**Additional booking checks:**

- Change branch, sport, or date after selecting hours; assert the selection is
  cleared and availability refreshes.
- In the conflict scenario, have another request hold a selected slot before
  submitting the UI form; assert the `409` conflict message and refreshed
  availability.
- Repeat a request with the same `Idempotency-Key`; assert it returns the same
  booking ID. Use a different key against the held slot and assert `409`.
- Stub unavailable options, availability, and booking creation to assert the
  user-facing error states without raw server details.

**Current UI gaps / cautions:**

- The booking header has a home link but no sign-in/account link. Start this
  journey directly at `/booking`.
- Booking currently creates an expiring hold only. There is no payment,
  confirmation, or follow-up page/button in the implemented flow; do not assert
  payment or confirmed status.
- The existing test in [`booking.spec.ts`](./booking.spec.ts) covers the
  multi-court hold, total, availability update, idempotency, and conflict. The
  separate error-handling suite covers options/availability and booking
  failures.
