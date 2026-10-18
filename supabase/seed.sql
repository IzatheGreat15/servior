BEGIN;

-- Keep reruns repeatable without touching non-seed application data.
DELETE FROM public.employees
WHERE tenant_id IN (
  SELECT id
  FROM public.tenants
  WHERE company_str LIKE 'servior-seed-%'
);

DELETE FROM auth.users
WHERE email LIKE 'servior.seed.%@example.invalid';

DELETE FROM public.tenants
WHERE company_str LIKE 'servior-seed-%';

DO $$
DECLARE
  i integer;
  v_user_id uuid;
  v_sport_id bigint;
  v_tenant_id bigint;
  v_branch_id bigint;
  v_court_id bigint;
  v_inventory_item_id bigint;
  v_booking_id bigint;
  v_sport_ids bigint[] := ARRAY[]::bigint[];
  v_user_ids uuid[] := ARRAY[]::uuid[];
BEGIN
  FOR i IN 1..100 LOOP
    SELECT id
    INTO v_sport_id
    FROM public.sports
    WHERE sport_name = format('Demo Sport %s', lpad(i::text, 3, '0'))
    ORDER BY id
    LIMIT 1;

    IF v_sport_id IS NULL THEN
      INSERT INTO public.sports (sport_name)
      VALUES (format('Demo Sport %s', lpad(i::text, 3, '0')))
      RETURNING id INTO v_sport_id;
    END IF;

    v_sport_ids := array_append(v_sport_ids, v_sport_id);
  END LOOP;

  FOR i IN 1..100 LOOP
    v_user_id := md5('servior-seed-user-' || i::text)::uuid;

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      format('servior.seed.%s@example.invalid', lpad(i::text, 3, '0')),
      crypt('password', gen_salt('bf')),
      '',
      '',
      '',
      '',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', format('Demo User %s', lpad(i::text, 3, '0'))),
      now(),
      now()
    );

    INSERT INTO auth.identities (
      user_id,
      identity_data,
      provider,
      provider_id,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', format('servior.seed.%s@example.invalid', lpad(i::text, 3, '0')),
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      format('servior.seed.%s@example.invalid', lpad(i::text, 3, '0')),
      now(),
      now()
    );

    v_user_ids := array_append(v_user_ids, v_user_id);

    INSERT INTO public.tenants (
      business_name,
      company_str,
      contact_number,
      email,
      onboarding_status,
      payout_status
    )
    VALUES (
      format('Demo Sports Business %s', lpad(i::text, 3, '0')),
      format('servior-seed-%s', lpad(i::text, 3, '0')),
      '+63917' || lpad(i::text, 7, '0'),
      format('business.%s@example.invalid', lpad(i::text, 3, '0')),
      true,
      true
    )
    RETURNING id INTO v_tenant_id;

    INSERT INTO public.branches (
      branch_name,
      tenant_id,
      branch_location,
      location,
      address,
      opening_time,
      closing_time,
      contact_number,
      email
    )
    VALUES (
      format('Demo Branch %s', lpad(i::text, 3, '0')),
      v_tenant_id,
      json_build_object(
        'address', format('%s Demo Street', i),
        'city', 'Manila',
        'country', 'Philippines'
      ),
      jsonb_build_object(
        'latitude', 14.5995 + (i * 0.0001),
        'longitude', 120.9842 + (i * 0.0001)
      ),
      format('%s Demo Street, Manila', i),
      '06:00',
      '23:00',
      '+63918' || lpad(i::text, 7, '0'),
      format('branch.%s@example.invalid', lpad(i::text, 3, '0'))
    )
    RETURNING id INTO v_branch_id;

    INSERT INTO public.courts (
      branch_id,
      court_name,
      price,
      opening_time,
      closing_time,
      sport_id,
      is_active
    )
    VALUES (
      v_branch_id,
      format('Demo Court %s', lpad(i::text, 3, '0')),
      (300 + i)::real,
      '06:00',
      '23:00',
      v_sport_ids[i],
      true
    )
    RETURNING id INTO v_court_id;

    INSERT INTO public.court_pricing_rules (
      court_id,
      days,
      start_time,
      end_time,
      hourly_rate
    )
    VALUES (
      v_court_id,
      ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      '06:00',
      '23:00',
      300 + i
    );

    INSERT INTO public.inventory_items (
      branch_id,
      description,
      item_name,
      price,
      quantity,
      is_listed
    )
    VALUES (
      v_branch_id,
      format('Demo rental item %s', i),
      format('Demo Equipment %s', lpad(i::text, 3, '0')),
      (50 + i)::real,
      10 + i,
      true
    )
    RETURNING id INTO v_inventory_item_id;

    INSERT INTO public.booking (
      customer_id,
      booking_date,
      status,
      guest_name,
      guest_email,
      guest_phone,
      total_amount
    )
    VALUES (
      v_user_ids[i],
      (now() AT TIME ZONE 'Asia/Manila')::date + (1 + ((i - 1) % 30)),
      'confirmed',
      format('Demo User %s', lpad(i::text, 3, '0')),
      format('servior.seed.%s@example.invalid', lpad(i::text, 3, '0')),
      '+63917' || lpad(i::text, 7, '0'),
      350 + (2 * i)
    )
    RETURNING id INTO v_booking_id;

    INSERT INTO public.booking_court_time (court_id, booking_id, start_time)
    VALUES (
      v_court_id,
      v_booking_id,
      make_time(6 + ((i - 1) % 15), 0, 0)
    );

    INSERT INTO public.booking_addons (booking_id, addon_inventory_id, quantity)
    VALUES (v_booking_id, v_inventory_item_id, 1 + ((i - 1) % 3));

    INSERT INTO public.employees (user_id, tenant_id)
    VALUES (v_user_ids[i], v_tenant_id);
  END LOOP;

  INSERT INTO public.profiles (id, full_name)
  SELECT
    id,
    raw_user_meta_data ->> 'full_name'
  FROM auth.users
  WHERE email LIKE 'servior.seed.%@example.invalid'
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = now();
END;
$$;

COMMIT;
