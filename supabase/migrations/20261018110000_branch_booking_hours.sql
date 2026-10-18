WITH court_hours AS (
  SELECT
    branch_id,
    CASE WHEN count(DISTINCT opening_time) <= 1 THEN min(opening_time) END AS opening_time,
    CASE WHEN count(DISTINCT closing_time) <= 1 THEN min(closing_time) END AS closing_time
  FROM public.courts
  GROUP BY branch_id
)
UPDATE public.branches b
SET opening_time = COALESCE(b.opening_time, hours.opening_time, time '06:00'),
    closing_time = COALESCE(b.closing_time, hours.closing_time, time '22:00')
FROM (
  SELECT branch.id, court_hours.opening_time, court_hours.closing_time
  FROM public.branches branch
  LEFT JOIN court_hours ON court_hours.branch_id = branch.id
) hours
WHERE b.id = hours.id;

ALTER TABLE public.branches
  ALTER COLUMN opening_time SET DEFAULT time '06:00',
  ALTER COLUMN opening_time SET NOT NULL,
  ALTER COLUMN closing_time SET DEFAULT time '22:00',
  ALTER COLUMN closing_time SET NOT NULL;

CREATE OR REPLACE FUNCTION public.get_public_booking_availability(
  p_branch_id bigint,
  p_sport_id bigint,
  p_booking_date date
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_courts jsonb;
  v_unavailable jsonb;
BEGIN
  IF p_booking_date < (now() AT TIME ZONE 'Asia/Manila')::date THEN
    RAISE EXCEPTION 'Booking date cannot be in the past.'
      USING ERRCODE = '22023';
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', c.id::text,
      'name', c.court_name,
      'pricePerHour', c.price
    )
    ORDER BY c.court_name, c.id
  ), '[]'::jsonb)
  INTO v_courts
  FROM public.courts c
  WHERE c.branch_id = p_branch_id
    AND c.sport_id = p_sport_id
    AND c.court_name IS NOT NULL
    AND COALESCE(c.price, 0) > 0;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'courtId', bct.court_id::text,
      'startHour', EXTRACT(HOUR FROM bct.start_time)::integer
    )
    ORDER BY bct.court_id, bct.start_time
  ), '[]'::jsonb)
  INTO v_unavailable
  FROM public.booking_court_time bct
  JOIN public.booking b ON b.id = bct.booking_id
  WHERE b.booking_date = p_booking_date
    AND bct.court_id IN (
      SELECT c.id
      FROM public.courts c
      WHERE c.branch_id = p_branch_id
        AND c.sport_id = p_sport_id
    )
    AND b.status IN ('confirmed', 'held')
    AND (b.status <> 'held' OR b.hold_expires_at > now());

  SELECT v_unavailable || COALESCE(jsonb_agg(
    jsonb_build_object('courtId', c.id::text, 'startHour', hours.start_hour)
  ), '[]'::jsonb)
  INTO v_unavailable
  FROM public.branches b
  JOIN public.courts c ON c.branch_id = b.id
  CROSS JOIN generate_series(0, 22) AS hours(start_hour)
  WHERE b.id = p_branch_id
    AND c.sport_id = p_sport_id
    AND (
      make_time(hours.start_hour, 0, 0) < b.opening_time
      OR make_time(hours.start_hour + 1, 0, 0) > b.closing_time
      OR (
        p_booking_date = (now() AT TIME ZONE 'Asia/Manila')::date
        AND make_time(hours.start_hour, 0, 0)
          <= (now() AT TIME ZONE 'Asia/Manila')::time
      )
    )
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_to_recordset(v_unavailable) AS busy("courtId" text, "startHour" integer)
      WHERE busy."courtId" = c.id::text
        AND busy."startHour" = hours.start_hour
    );

  RETURN jsonb_build_object('courts', v_courts, 'unavailableSlots', v_unavailable);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_booking_hold(
  p_branch_id bigint,
  p_sport_id bigint,
  p_booking_date date,
  p_slots jsonb,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_idempotency_key text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_slot record;
  v_existing public.booking%ROWTYPE;
  v_booking_id bigint;
  v_total numeric(12, 2) := 0;
  v_expiry timestamp with time zone := now() + interval '15 minutes';
BEGIN
  IF p_booking_date < (now() AT TIME ZONE 'Asia/Manila')::date THEN
    RAISE EXCEPTION 'Booking date cannot be in the past.'
      USING ERRCODE = '22023';
  END IF;

  IF p_slots IS NULL
     OR jsonb_typeof(p_slots) <> 'array'
     OR jsonb_array_length(p_slots) < 1
     OR jsonb_array_length(p_slots) > 12 THEN
    RAISE EXCEPTION 'Select between 1 and 12 court-hour slots.'
      USING ERRCODE = '22023';
  END IF;

  IF p_guest_name IS NULL OR length(btrim(p_guest_name)) NOT BETWEEN 1 AND 100
     OR p_guest_email IS NULL OR length(btrim(p_guest_email)) > 254
     OR p_guest_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     OR (p_guest_phone IS NOT NULL AND length(btrim(p_guest_phone)) > 40)
     OR p_idempotency_key IS NULL
     OR length(p_idempotency_key) NOT BETWEEN 16 AND 100 THEN
    RAISE EXCEPTION 'Guest details or request key are invalid.'
      USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended('booking-key:' || p_idempotency_key, 0)
  );

  SELECT *
  INTO v_existing
  FROM public.booking
  WHERE idempotency_key = p_idempotency_key;

  IF FOUND THEN
    IF v_existing.guest_email <> btrim(p_guest_email)
       OR v_existing.booking_date <> p_booking_date THEN
      RAISE EXCEPTION 'Request key was already used for a different booking.'
        USING ERRCODE = '23505';
    END IF;
    RETURN jsonb_build_object(
      'id', v_existing.id::text,
      'status', v_existing.status,
      'expiresAt', v_existing.hold_expires_at,
      'totalAmount', v_existing.total_amount
    );
  END IF;

  IF (
    SELECT count(*) <> count(DISTINCT (slot."courtId", slot."startHour"))
    FROM jsonb_to_recordset(p_slots) AS slot("courtId" bigint, "startHour" integer)
  ) THEN
    RAISE EXCEPTION 'A court-hour slot may only be selected once.'
      USING ERRCODE = '22023';
  END IF;

  FOR v_slot IN
    SELECT slot."courtId" AS court_id, slot."startHour" AS start_hour
    FROM jsonb_to_recordset(p_slots) AS slot("courtId" bigint, "startHour" integer)
    ORDER BY slot."courtId", slot."startHour"
  LOOP
    IF v_slot.start_hour < 0 OR v_slot.start_hour >= 23 THEN
      RAISE EXCEPTION 'Selected time is outside operating hours.'
        USING ERRCODE = '22023';
    END IF;

    IF p_booking_date = (now() AT TIME ZONE 'Asia/Manila')::date
       AND make_time(v_slot.start_hour, 0, 0) <= (now() AT TIME ZONE 'Asia/Manila')::time THEN
      RAISE EXCEPTION 'Selected time has already passed.'
        USING ERRCODE = '22023';
    END IF;

    PERFORM pg_advisory_xact_lock(
      hashtextextended(
        p_booking_date::text || ':' || v_slot.court_id::text || ':' || v_slot.start_hour::text,
        0
      )
    );

    IF NOT EXISTS (
      SELECT 1
      FROM public.courts c
      JOIN public.branches b ON b.id = c.branch_id
      WHERE c.id = v_slot.court_id
        AND c.branch_id = p_branch_id
        AND c.sport_id = p_sport_id
        AND COALESCE(c.price, 0) > 0
        AND make_time(v_slot.start_hour, 0, 0) >= b.opening_time
        AND make_time(v_slot.start_hour + 1, 0, 0) <= b.closing_time
    ) THEN
      RAISE EXCEPTION 'Selected court is not available for this branch and sport.'
        USING ERRCODE = '22023';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.booking_court_time bct
      JOIN public.booking b ON b.id = bct.booking_id
      WHERE bct.court_id = v_slot.court_id
        AND bct.start_time = make_time(v_slot.start_hour, 0, 0)
        AND b.booking_date = p_booking_date
        AND (
          b.status = 'confirmed'
          OR (b.status = 'held' AND b.hold_expires_at > now())
        )
    ) THEN
      RAISE EXCEPTION 'One or more selected times are no longer available.'
        USING ERRCODE = '23505';
    END IF;

    SELECT v_total + round(c.price::numeric, 2)
    INTO v_total
    FROM public.courts c
    WHERE c.id = v_slot.court_id;
  END LOOP;

  INSERT INTO public.booking (
    booking_date,
    status,
    hold_expires_at,
    guest_name,
    guest_email,
    guest_phone,
    total_amount,
    idempotency_key
  )
  VALUES (
    p_booking_date,
    'held',
    v_expiry,
    btrim(p_guest_name),
    lower(btrim(p_guest_email)),
    NULLIF(btrim(p_guest_phone), ''),
    v_total,
    p_idempotency_key
  )
  RETURNING id INTO v_booking_id;

  INSERT INTO public.booking_court_time (booking_id, court_id, start_time)
  SELECT
    v_booking_id,
    slot."courtId",
    make_time(slot."startHour", 0, 0)
  FROM jsonb_to_recordset(p_slots) AS slot("courtId" bigint, "startHour" integer);

  RETURN jsonb_build_object(
    'id', v_booking_id::text,
    'status', 'held',
    'expiresAt', v_expiry,
    'totalAmount', v_total
  );
END;
$$;

ALTER TABLE public.courts
  DROP COLUMN IF EXISTS opening_time,
  DROP COLUMN IF EXISTS closing_time;
