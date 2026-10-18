INSERT INTO public.profiles (id, full_name)
SELECT id, COALESCE(raw_user_meta_data ->> 'full_name', '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.booking_resource_json(p_booking_id bigint)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'id', b.id::text,
    'reference', 'SVR-' || to_char(b.created_at, 'YYYY') || '-' || lpad(b.id::text, 4, '0'),
    'venueName', COALESCE(t.business_name, 'Sports facility'),
    'branchName', COALESCE(br.branch_name, 'Branch'),
    'sport', COALESCE(s.sport_name, 'Sport'),
    'courtName', COALESCE(c.court_name, 'Court'),
    'address', COALESCE(br.address, br.branch_location ->> 'address', ''),
    'createdAt', b.created_at,
    'status', CASE
      WHEN b.status IN ('cancelled', 'expired') THEN 'cancelled'
      WHEN b.status = 'held' THEN 'pending'
      WHEN b.booking_date < (now() AT TIME ZONE 'Asia/Manila')::date THEN 'completed'
      ELSE 'confirmed'
    END,
    'paymentStatus', 'unpaid',
    'sessions', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', bct.id::text,
        'date', b.booking_date,
        'startTime', to_char(bct.start_time, 'HH24:MI'),
        'endTime', to_char(bct.start_time + interval '1 hour', 'HH24:MI'),
        'price', COALESCE(court.price, 0),
        'status', CASE
          WHEN b.status IN ('cancelled', 'expired') THEN 'cancelled'
          WHEN b.status = 'held' THEN 'pending'
          WHEN b.booking_date < (now() AT TIME ZONE 'Asia/Manila')::date THEN 'completed'
          ELSE 'confirmed'
        END
      ) ORDER BY bct.start_time, bct.id)
      FROM public.booking_court_time bct
      JOIN public.courts court ON court.id = bct.court_id
      WHERE bct.booking_id = b.id
    )
  )
  FROM public.booking b
  JOIN LATERAL (
    SELECT court_row.id AS court_id, court_row.branch_id, court_row.sport_id
    FROM public.booking_court_time time_row
    JOIN public.courts court_row ON court_row.id = time_row.court_id
    WHERE time_row.booking_id = b.id
    ORDER BY time_row.id
    LIMIT 1
  ) first_court ON true
  JOIN public.courts c ON c.id = first_court.court_id
  JOIN public.branches br ON br.id = first_court.branch_id
  LEFT JOIN public.tenants t ON t.id = br.tenant_id
  LEFT JOIN public.sports s ON s.id = first_court.sport_id
  WHERE b.id = p_booking_id;
$$;

CREATE OR REPLACE FUNCTION public.list_staff_bookings(
  p_query text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_payment_status text DEFAULT NULL,
  p_branch_id bigint DEFAULT NULL,
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL,
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 100
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result jsonb;
  v_total bigint;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.employees WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Staff membership required.' USING ERRCODE = '42501';
  END IF;
  IF p_page < 1 OR p_page_size < 1 OR p_page_size > 1000
     OR (p_from IS NOT NULL AND p_to IS NOT NULL AND p_from > p_to) THEN
    RAISE EXCEPTION 'Invalid pagination or date range.' USING ERRCODE = '22023';
  END IF;
  IF p_status IS NOT NULL AND p_status NOT IN ('pending', 'confirmed', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid booking status.' USING ERRCODE = '22023';
  END IF;
  IF p_payment_status IS NOT NULL AND p_payment_status NOT IN ('paid', 'unpaid', 'refunded') THEN
    RAISE EXCEPTION 'Invalid payment status.' USING ERRCODE = '22023';
  END IF;
  IF p_payment_status IS NOT NULL AND p_payment_status <> 'unpaid' THEN
    SELECT count(*) INTO v_total WHERE false;
    RETURN jsonb_build_object('items', '[]'::jsonb, 'total', 0);
  END IF;

  WITH eligible AS (
    SELECT DISTINCT b.id, b.created_at, b.booking_date
    FROM public.booking b
    JOIN public.booking_court_time bct ON bct.booking_id = b.id
    JOIN public.courts c ON c.id = bct.court_id
    JOIN public.branches br ON br.id = c.branch_id
    WHERE EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.user_id = auth.uid() AND e.tenant_id = br.tenant_id
    )
      AND (p_branch_id IS NULL OR br.id = p_branch_id)
      AND (p_from IS NULL OR b.booking_date >= p_from)
      AND (p_to IS NULL OR b.booking_date <= p_to)
      AND (
        p_status IS NULL
        OR (p_status = 'pending' AND b.status = 'held')
        OR (p_status = 'cancelled' AND b.status IN ('cancelled', 'expired'))
        OR (p_status = 'confirmed' AND b.status = 'confirmed'
            AND b.booking_date >= (now() AT TIME ZONE 'Asia/Manila')::date)
        OR (p_status = 'completed' AND b.status = 'confirmed'
            AND b.booking_date < (now() AT TIME ZONE 'Asia/Manila')::date)
      )
      AND (
        p_query IS NULL OR b.id::text ILIKE '%' || p_query || '%'
        OR EXISTS (
          SELECT 1
          FROM public.booking_court_time search_time
          JOIN public.courts search_court ON search_court.id = search_time.court_id
          JOIN public.branches search_branch ON search_branch.id = search_court.branch_id
          LEFT JOIN public.sports search_sport ON search_sport.id = search_court.sport_id
          LEFT JOIN public.tenants search_tenant ON search_tenant.id = search_branch.tenant_id
          WHERE search_time.booking_id = b.id
            AND concat_ws(' ', search_branch.branch_name, search_court.court_name,
              search_sport.sport_name, search_tenant.business_name, b.guest_email)
              ILIKE '%' || p_query || '%'
        )
      )
  )
  SELECT count(*) INTO v_total FROM eligible;

  WITH eligible AS (
    SELECT DISTINCT b.id, b.created_at, b.booking_date
    FROM public.booking b
    JOIN public.booking_court_time bct ON bct.booking_id = b.id
    JOIN public.courts c ON c.id = bct.court_id
    JOIN public.branches br ON br.id = c.branch_id
    WHERE EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.user_id = auth.uid() AND e.tenant_id = br.tenant_id
    )
      AND (p_branch_id IS NULL OR br.id = p_branch_id)
      AND (p_from IS NULL OR b.booking_date >= p_from)
      AND (p_to IS NULL OR b.booking_date <= p_to)
      AND (
        p_status IS NULL
        OR (p_status = 'pending' AND b.status = 'held')
        OR (p_status = 'cancelled' AND b.status IN ('cancelled', 'expired'))
        OR (p_status = 'confirmed' AND b.status = 'confirmed'
            AND b.booking_date >= (now() AT TIME ZONE 'Asia/Manila')::date)
        OR (p_status = 'completed' AND b.status = 'confirmed'
            AND b.booking_date < (now() AT TIME ZONE 'Asia/Manila')::date)
      )
      AND (
        p_query IS NULL OR b.id::text ILIKE '%' || p_query || '%'
        OR EXISTS (
          SELECT 1
          FROM public.booking_court_time search_time
          JOIN public.courts search_court ON search_court.id = search_time.court_id
          JOIN public.branches search_branch ON search_branch.id = search_court.branch_id
          LEFT JOIN public.sports search_sport ON search_sport.id = search_court.sport_id
          LEFT JOIN public.tenants search_tenant ON search_tenant.id = search_branch.tenant_id
          WHERE search_time.booking_id = b.id
            AND concat_ws(' ', search_branch.branch_name, search_court.court_name,
              search_sport.sport_name, search_tenant.business_name, b.guest_email)
              ILIKE '%' || p_query || '%'
        )
      )
  )
  SELECT COALESCE(jsonb_agg(public.booking_resource_json(rows.id)
    ORDER BY rows.booking_date DESC, rows.created_at DESC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT id, created_at, booking_date
    FROM eligible
    ORDER BY booking_date DESC, created_at DESC
    OFFSET (p_page - 1) * p_page_size
    LIMIT p_page_size
  ) rows;

  RETURN jsonb_build_object('items', COALESCE(v_result, '[]'::jsonb), 'total', v_total);
END;
$$;

CREATE OR REPLACE FUNCTION public.list_my_bookings(
  p_status text DEFAULT NULL,
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL,
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 100
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_items jsonb;
  v_total bigint;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
  END IF;
  IF p_page < 1 OR p_page_size < 1 OR p_page_size > 1000
     OR (p_from IS NOT NULL AND p_to IS NOT NULL AND p_from > p_to) THEN
    RAISE EXCEPTION 'Invalid pagination or date range.' USING ERRCODE = '22023';
  END IF;
  IF p_status IS NOT NULL AND p_status NOT IN ('pending', 'confirmed', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid booking status.' USING ERRCODE = '22023';
  END IF;

  WITH eligible AS (
    SELECT b.id, b.created_at, b.booking_date
    FROM public.booking b
    WHERE b.customer_id = auth.uid()
      AND EXISTS (SELECT 1 FROM public.booking_court_time bct WHERE bct.booking_id = b.id)
      AND (p_from IS NULL OR b.booking_date >= p_from)
      AND (p_to IS NULL OR b.booking_date <= p_to)
      AND (
        p_status IS NULL
        OR (p_status = 'pending' AND b.status = 'held')
        OR (p_status = 'cancelled' AND b.status IN ('cancelled', 'expired'))
        OR (p_status = 'confirmed' AND b.status = 'confirmed'
            AND b.booking_date >= (now() AT TIME ZONE 'Asia/Manila')::date)
        OR (p_status = 'completed' AND b.status = 'confirmed'
            AND b.booking_date < (now() AT TIME ZONE 'Asia/Manila')::date)
      )
  )
  SELECT count(*) INTO v_total FROM eligible;

  WITH eligible AS (
    SELECT b.id, b.created_at, b.booking_date
    FROM public.booking b
    WHERE b.customer_id = auth.uid()
      AND EXISTS (SELECT 1 FROM public.booking_court_time bct WHERE bct.booking_id = b.id)
      AND (p_from IS NULL OR b.booking_date >= p_from)
      AND (p_to IS NULL OR b.booking_date <= p_to)
      AND (
        p_status IS NULL
        OR (p_status = 'pending' AND b.status = 'held')
        OR (p_status = 'cancelled' AND b.status IN ('cancelled', 'expired'))
        OR (p_status = 'confirmed' AND b.status = 'confirmed'
            AND b.booking_date >= (now() AT TIME ZONE 'Asia/Manila')::date)
        OR (p_status = 'completed' AND b.status = 'confirmed'
            AND b.booking_date < (now() AT TIME ZONE 'Asia/Manila')::date)
      )
  )
  SELECT COALESCE(jsonb_agg(public.booking_resource_json(rows.id)
    ORDER BY rows.booking_date DESC, rows.created_at DESC), '[]'::jsonb)
  INTO v_items
  FROM (
    SELECT id, created_at, booking_date
    FROM eligible
    ORDER BY booking_date DESC, created_at DESC
    OFFSET (p_page - 1) * p_page_size
    LIMIT p_page_size
  ) rows;

  RETURN jsonb_build_object('items', COALESCE(v_items, '[]'::jsonb), 'total', v_total);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_staff_dashboard(p_from date, p_to date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_days integer;
  v_previous_from date;
  v_previous_to date;
  v_booking_count bigint;
  v_previous_booking_count bigint;
  v_revenue numeric(12, 2);
  v_previous_revenue numeric(12, 2);
  v_total_users bigint;
  v_new_users bigint;
  v_previous_users bigint;
  v_booking_revenue jsonb;
  v_branch_revenue jsonb;
  v_popular_sports jsonb;
  v_user_growth jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.employees WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Staff membership required.' USING ERRCODE = '42501';
  END IF;
  IF p_from IS NULL OR p_to IS NULL OR p_from > p_to OR p_to - p_from > 366 THEN
    RAISE EXCEPTION 'Invalid dashboard date range.' USING ERRCODE = '22023';
  END IF;

  v_days := p_to - p_from + 1;
  v_previous_to := p_from - 1;
  v_previous_from := v_previous_to - v_days + 1;

  SELECT count(*), COALESCE(sum(b.total_amount), 0)
  INTO v_booking_count, v_revenue
  FROM public.booking b
  WHERE b.booking_date BETWEEN p_from AND p_to
    AND b.status = 'confirmed'
    AND EXISTS (
      SELECT 1
      FROM public.booking_court_time bct
      JOIN public.courts c ON c.id = bct.court_id
      JOIN public.branches br ON br.id = c.branch_id
      JOIN public.employees e ON e.tenant_id = br.tenant_id
      WHERE bct.booking_id = b.id AND e.user_id = auth.uid()
    );

  SELECT count(*), COALESCE(sum(b.total_amount), 0)
  INTO v_previous_booking_count, v_previous_revenue
  FROM public.booking b
  WHERE b.booking_date BETWEEN v_previous_from AND v_previous_to
    AND b.status = 'confirmed'
    AND EXISTS (
      SELECT 1
      FROM public.booking_court_time bct
      JOIN public.courts c ON c.id = bct.court_id
      JOIN public.branches br ON br.id = c.branch_id
      JOIN public.employees e ON e.tenant_id = br.tenant_id
      WHERE bct.booking_id = b.id AND e.user_id = auth.uid()
    );

  SELECT count(DISTINCT p.id)
  INTO v_total_users
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1
    FROM public.booking b
    JOIN public.booking_court_time bct ON bct.booking_id = b.id
    JOIN public.courts c ON c.id = bct.court_id
    JOIN public.branches br ON br.id = c.branch_id
    JOIN public.employees e ON e.tenant_id = br.tenant_id
    WHERE b.customer_id = p.id AND e.user_id = auth.uid()
  );

  SELECT count(DISTINCT p.id)
  INTO v_new_users
  FROM public.profiles p
  WHERE p.created_at::date BETWEEN p_from AND p_to
    AND EXISTS (
      SELECT 1
      FROM public.booking b
      JOIN public.booking_court_time bct ON bct.booking_id = b.id
      JOIN public.courts c ON c.id = bct.court_id
      JOIN public.branches br ON br.id = c.branch_id
      JOIN public.employees e ON e.tenant_id = br.tenant_id
      WHERE b.customer_id = p.id AND e.user_id = auth.uid()
    );

  SELECT count(DISTINCT p.id)
  INTO v_previous_users
  FROM public.profiles p
  WHERE p.created_at::date BETWEEN v_previous_from AND v_previous_to
    AND EXISTS (
      SELECT 1
      FROM public.booking b
      JOIN public.booking_court_time bct ON bct.booking_id = b.id
      JOIN public.courts c ON c.id = bct.court_id
      JOIN public.branches br ON br.id = c.branch_id
      JOIN public.employees e ON e.tenant_id = br.tenant_id
      WHERE b.customer_id = p.id AND e.user_id = auth.uid()
    );

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'date', grouped.booking_date,
    'bookings', grouped.bookings,
    'revenue', grouped.revenue
  ) ORDER BY grouped.booking_date), '[]'::jsonb)
  INTO v_booking_revenue
  FROM (
    SELECT b.booking_date, count(*) AS bookings, sum(b.total_amount) AS revenue
    FROM public.booking b
    WHERE b.booking_date BETWEEN p_from AND p_to
      AND b.status = 'confirmed'
      AND EXISTS (
        SELECT 1 FROM public.booking_court_time bct
        JOIN public.courts c ON c.id = bct.court_id
        JOIN public.branches br ON br.id = c.branch_id
        JOIN public.employees e ON e.tenant_id = br.tenant_id
        WHERE bct.booking_id = b.id AND e.user_id = auth.uid()
      )
    GROUP BY b.booking_date
  ) grouped;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'branchId', grouped.branch_id::text,
    'branchName', grouped.branch_name,
    'revenue', grouped.revenue
  ) ORDER BY grouped.revenue DESC), '[]'::jsonb)
  INTO v_branch_revenue
  FROM (
    SELECT br.id AS branch_id, br.branch_name,
      sum(b.total_amount) AS revenue
    FROM public.booking b
    JOIN public.booking_court_time bct ON bct.booking_id = b.id
    JOIN public.courts c ON c.id = bct.court_id
    JOIN public.branches br ON br.id = c.branch_id
    JOIN public.employees e ON e.tenant_id = br.tenant_id
    WHERE b.booking_date BETWEEN p_from AND p_to
      AND b.status = 'confirmed' AND e.user_id = auth.uid()
    GROUP BY br.id, br.branch_name
  ) grouped;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'sport', grouped.sport_name,
    'bookings', grouped.bookings
  ) ORDER BY grouped.bookings DESC), '[]'::jsonb)
  INTO v_popular_sports
  FROM (
    SELECT s.sport_name, count(DISTINCT b.id) AS bookings
    FROM public.booking b
    JOIN public.booking_court_time bct ON bct.booking_id = b.id
    JOIN public.courts c ON c.id = bct.court_id
    JOIN public.branches br ON br.id = c.branch_id
    JOIN public.employees e ON e.tenant_id = br.tenant_id
    JOIN public.sports s ON s.id = c.sport_id
    WHERE b.booking_date BETWEEN p_from AND p_to
      AND b.status = 'confirmed' AND e.user_id = auth.uid()
    GROUP BY s.sport_name
  ) grouped;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'month', to_char(grouped.month_start, 'Mon'),
    'users', grouped.users
  ) ORDER BY grouped.month_start), '[]'::jsonb)
  INTO v_user_growth
  FROM (
    SELECT date_trunc('month', p.created_at)::date AS month_start,
      count(DISTINCT p.id) AS users
    FROM public.profiles p
    WHERE p.created_at >= date_trunc('month', p_to) - interval '5 months'
      AND p.created_at < date_trunc('month', p_to) + interval '1 month'
      AND EXISTS (
        SELECT 1 FROM public.booking b
        JOIN public.booking_court_time bct ON bct.booking_id = b.id
        JOIN public.courts c ON c.id = bct.court_id
        JOIN public.branches br ON br.id = c.branch_id
        JOIN public.employees e ON e.tenant_id = br.tenant_id
        WHERE b.customer_id = p.id AND e.user_id = auth.uid()
      )
    GROUP BY date_trunc('month', p.created_at)::date
  ) grouped;

  RETURN jsonb_build_object(
    'stats', jsonb_build_object(
      'newUsers', v_new_users,
      'totalUsers', v_total_users,
      'totalBookings', v_booking_count,
      'revenue', v_revenue,
      'newUsersChange', CASE WHEN v_previous_users = 0 THEN 0
        ELSE round((v_new_users - v_previous_users)::numeric * 100 / v_previous_users)::integer END,
      'bookingsChange', CASE WHEN v_previous_booking_count = 0 THEN 0
        ELSE round((v_booking_count - v_previous_booking_count)::numeric * 100 / v_previous_booking_count)::integer END,
      'revenueChange', CASE WHEN v_previous_revenue = 0 THEN 0
        ELSE round((v_revenue - v_previous_revenue) * 100 / v_previous_revenue)::integer END
    ),
    'bookingRevenue', v_booking_revenue,
    'branchRevenue', v_branch_revenue,
    'sports', v_popular_sports,
    'userGrowth', v_user_growth
  );
END;
$$;

REVOKE ALL ON FUNCTION public.booking_resource_json(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_staff_bookings(text, text, text, bigint, date, date, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_my_bookings(text, date, date, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_staff_dashboard(date, date) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.list_staff_bookings(text, text, text, bigint, date, date, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_my_bookings(text, date, date, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_staff_dashboard(date, date) TO authenticated;
