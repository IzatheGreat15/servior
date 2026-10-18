import { loadEnvConfig } from "@next/env";
import {
  createDatabaseClient,
  removeTestBookings,
  TEST_BRANCH_NAME,
  TEST_SPORT_NAME,
  TEST_TENANT_KEY,
} from "./database";

export default async function globalSetup() {
  loadEnvConfig(process.cwd());
  const client = createDatabaseClient();
  await client.connect();

  try {
    const schema = await client.query<{
      bookingTable: string | null;
      bookingStatus: string | null;
      createHold: string | null;
    }>(`
      SELECT
        to_regclass('public.booking')::text AS "bookingTable",
        (
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'booking'
            AND column_name = 'status'
        ) AS "bookingStatus",
        to_regprocedure(
          'public.create_booking_hold(bigint,bigint,date,jsonb,text,text,text,text)'
        )::text AS "createHold"
    `);

    if (
      !schema.rows[0].bookingTable ||
      !schema.rows[0].bookingStatus ||
      !schema.rows[0].createHold
    ) {
      throw new Error(
        "Booking schema is missing. Apply the Supabase migrations locally before running flow tests.",
      );
    }

    await client.query("BEGIN");

    const tenant = await client.query<{ id: string }>(
      `INSERT INTO public.tenants (business_name, company_str)
       VALUES ('Servior Playwright Test Tenant', $1)
       ON CONFLICT (company_str)
       DO UPDATE SET business_name = EXCLUDED.business_name
       RETURNING id`,
      [TEST_TENANT_KEY],
    );
    const tenantId = tenant.rows[0].id;

    let sport = await client.query<{ id: string }>(
      "SELECT id FROM public.sports WHERE sport_name = $1 ORDER BY id LIMIT 1",
      [TEST_SPORT_NAME],
    );
    if (!sport.rowCount) {
      sport = await client.query<{ id: string }>(
        "INSERT INTO public.sports (sport_name) VALUES ($1) RETURNING id",
        [TEST_SPORT_NAME],
      );
    }
    const sportId = sport.rows[0].id;

    let branch = await client.query<{ id: string }>(
      `SELECT id FROM public.branches
       WHERE tenant_id = $1 AND branch_name = $2
       ORDER BY id LIMIT 1`,
      [tenantId, TEST_BRANCH_NAME],
    );
    if (!branch.rowCount) {
      branch = await client.query<{ id: string }>(
        `INSERT INTO public.branches
          (tenant_id, branch_name, branch_location, opening_time, closing_time)
         VALUES ($1, $2, '{}'::json, '06:00', '22:00')
         RETURNING id`,
        [tenantId, TEST_BRANCH_NAME],
      );
    }
    const branchId = branch.rows[0].id;

    await client.query(
      `UPDATE public.branches
       SET opening_time = '06:00', closing_time = '22:00'
       WHERE id = $1`,
      [branchId],
    );

    for (const courtName of ["Court 1", "Court 2"]) {
      const existingCourt = await client.query(
        `SELECT id FROM public.courts
         WHERE branch_id = $1 AND court_name = $2
         ORDER BY id LIMIT 1`,
        [branchId, courtName],
      );

      if (existingCourt.rowCount) {
        await client.query(
          `UPDATE public.courts
           SET sport_id = $1, price = 400
           WHERE id = $2`,
          [sportId, existingCourt.rows[0].id],
        );
      } else {
        await client.query(
          `INSERT INTO public.courts
            (branch_id, court_name, price, sport_id)
           VALUES ($1, $2, 400, $3)`,
          [branchId, courtName, sportId],
        );
      }
    }

    await removeTestBookings(client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}
