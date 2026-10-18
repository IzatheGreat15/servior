# Booking Holds Migration Summary

This migration adds a hold-based booking flow for the public booking system. It modifies the existing `public.booking` table, adds indexes for performance, introduces public-facing availability and hold functions, and sets execution permissions for anonymous/authenticated users.

## 1) Tables changed

### `public.booking`

This is the main booking table and is the primary table affected by the migration.

#### New columns

- `status` (`text`, `NOT NULL`, default `'confirmed'`)
  - Purpose: tracks booking lifecycle state.
  - Allowed values: `'held'`, `'confirmed'`, `'expired'`, `'cancelled'`.

- `hold_expires_at` (`timestamp with time zone`, nullable)
  - Purpose: stores when a temporary hold expires.
  - Enforced by a constraint: if status is `'held'`, this must be set.

- `guest_name` (`text`, nullable)
  - Purpose: stores the guest/customer name for the booking.

- `guest_email` (`text`, nullable)
  - Purpose: stores the guest email used in booking validation and hold creation.
  - Normalized to lowercase when a booking hold is created.

- `guest_phone` (`text`, nullable)
  - Purpose: stores optional guest phone number.

- `total_amount` (`numeric(12, 2)`, `NOT NULL`, default `0`)
  - Purpose: tracks the total booking cost at the time of the hold.

- `idempotency_key` (`text`, nullable)
  - Purpose: prevents duplicate booking requests from being processed multiple times.
  - Must be unique when present.

#### Constraint changes

- Drops old `booking_date_check` if present.
- Drops old status constraint and hold-expiry constraint.
- Adds a new status constraint:
  - `status IN ('held', 'confirmed', 'expired', 'cancelled')`
- Adds a new hold-expiry constraint:
  - `status <> 'held' OR hold_expires_at IS NOT NULL`

#### Purpose of these changes

These changes allow the system to support a temporary reservation or hold before a booking is fully confirmed, while also capturing contact information and allowing deduplication of requests.

#### Index added

- `booking_idempotency_key_unique`
  - `UNIQUE INDEX ON public.booking (idempotency_key) WHERE idempotency_key IS NOT NULL`
  - Purpose: ensures a request cannot be reused for a different booking attempt.

---

### `public.booking_court_time`

This table stores the relationship between a booking and a booked court/time slot.

#### Index added

- `booking_court_time_booking_start_idx`
  - `INDEX ON public.booking_court_time (court_id, start_time, booking_id)`
  - Purpose: improves lookup speed when checking if a given court/time is already taken for a date and a booking.

#### Purpose of this table in the migration

It allows one booking to contain multiple court-time slots, which is necessary for multi-slot reservations (for example, booking several court-hour combinations at once).

---

## 2) New tables

No new tables are created in this migration.

This migration modifies existing tables only and does not add any new database tables or row-level security (RLS) tables.

---

## 3) New database functions

### `public.get_public_booking_options()`

Purpose:
- Returns the public list of available branches and sports that currently have valid, priced courts.
- Used by the front end to populate booking filters.

Behavior:
- Returns JSON with:
  - `branches`: list of `{ id, name, sports }`, where `sports` contains only sports with priced courts at that branch
  - `sports`: list of `{ id, name }`
- Uses `SECURITY DEFINER` and `SET search_path = public, pg_temp`.
- Excludes branches/sports without valid courts or pricing.

---

### `public.get_public_booking_availability(p_branch_id bigint, p_sport_id bigint, p_booking_date date)`

Purpose:
- Returns available courts and unavailable hour slots for a specified branch, sport, and date.

Behavior:
- Validates that the booking date is not in the past.
- Returns:
  - `courts`: list of court metadata (`id`, `name`, `pricePerHour`)
  - `unavailableSlots`: list of `{ courtId, startHour }`
- Excludes any currently booked/held slots that are still active.
- Also marks time slots as unavailable when they fall outside court operating hours or when the selected date/time has already passed.

This function is intended for the public booking UI to determine what can be booked.

---

### `public.create_booking_hold(p_branch_id bigint, p_sport_id bigint, p_booking_date date, p_slots jsonb, p_guest_name text, p_guest_email text, p_guest_phone text, p_idempotency_key text)`

Purpose:
- Creates a temporary booking hold and registers the selected court-hour slots.

Behavior:
- Validates:
  - booking date is not in the past
  - slots are provided as an array with 1 to 12 entries
  - no duplicate court-hour pair appears in the same request
  - guest details are valid
  - `idempotency_key` is present and valid length
  - selected slots are within operating hours
  - selected times have not already passed
  - selected court/time is still available
- Uses `pg_advisory_xact_lock` to serialize conflicting requests by request key and by court/time key.
- Prevents duplicate submission using `idempotency_key`.
- Calculates `total_amount` based on selected courts.
- Inserts a booking row with:
  - `status = 'held'`
  - `hold_expires_at = now() + interval '15 minutes'`
  - guest metadata
  - `total_amount`
  - `idempotency_key`
- Inserts corresponding rows into `public.booking_court_time` for each selected slot.
- Returns JSON with:
  - `id`
  - `status`
  - `expiresAt`
  - `totalAmount`

#### Purpose of the hold feature

This creates a short-lived reservation window that allows users to reserve a slot while they complete the rest of the booking flow. The hold expires after 15 minutes if it is not converted into a confirmed booking.

---

## 4) Database permissions and policies

### Permissions

The migration explicitly revokes public access and grants execute permissions to the intended audiences:

- `REVOKE ALL ON FUNCTION ... FROM PUBLIC;`
- `GRANT EXECUTE ON FUNCTION ... TO anon, authenticated;`

This applies to:
- `public.get_public_booking_options()`
- `public.get_public_booking_availability(bigint, bigint, date)`
- `public.create_booking_hold(bigint, bigint, date, jsonb, text, text, text, text)`

### RLS / DB policies

There are no explicit `CREATE POLICY` statements in this migration.

So, in practical terms:
- No new row-level security policies were introduced in this migration.
- The public access model is enforced through function grants rather than table-level policies.

---

## 5) Business logic purpose of the migration

This migration is designed to support a public-facing booking workflow with these key requirements:

- Clients can view what branches and sports are available.
- Clients can check which court-hour combinations are unavailable for a date.
- Clients can reserve a slot temporarily using a hold.
- Holds are protected from duplicate submissions using `idempotency_key`.
- Holds expire automatically after 15 minutes.
- Conflicts are prevented with transactional advisory locking.
- The system keeps a record of guest details and total amount for the temporary reservation.

## 6) Summary

This migration does not add new tables, but it substantially upgrades the booking system by:

- introducing a booking lifecycle (`status` and expiry)
- capturing guest details and total cost
- deduplicating request attempts with `idempotency_key`
- adding indexes for performant conflict checking
- exposing public booking search and hold APIs
- securing access through function-level grants

The overall purpose is to support a robust and safe public booking/hold workflow without introducing explicit table-based policies.
