CREATE OR REPLACE FUNCTION public.get_public_booking_options()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'branches',
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', b.id::text,
          'name', b.branch_name,
          'sports', COALESCE((
            SELECT jsonb_agg(
              jsonb_build_object('id', s.id::text, 'name', s.sport_name)
              ORDER BY s.sport_name, s.id
            )
            FROM public.sports s
            WHERE EXISTS (
              SELECT 1
              FROM public.courts c
              WHERE c.branch_id = b.id
                AND c.sport_id = s.id
                AND COALESCE(c.price, 0) > 0
            )
          ), '[]'::jsonb)
        )
        ORDER BY b.branch_name, b.id
      )
      FROM public.branches b
      WHERE b.branch_name IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.courts c
          WHERE c.branch_id = b.id
            AND c.sport_id IS NOT NULL
            AND COALESCE(c.price, 0) > 0
        )
    ), '[]'::jsonb),
    'sports',
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object('id', s.id::text, 'name', s.sport_name)
        ORDER BY s.sport_name, s.id
      )
      FROM public.sports s
      WHERE EXISTS (
        SELECT 1
        FROM public.courts c
        WHERE c.sport_id = s.id
          AND c.branch_id IS NOT NULL
          AND COALESCE(c.price, 0) > 0
      )
    ), '[]'::jsonb)
  );
$$;
