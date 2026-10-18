import { Client } from "pg";

export const TEST_TENANT_KEY = "servior-playwright-e2e";
export const TEST_BRANCH_NAME = "Servior Playwright Test Branch";
export const TEST_SPORT_NAME = "Servior Playwright Test Sport";

export function createDatabaseClient() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error(
      "Set SUPABASE_DB_URL to your local Supabase database connection before running Playwright.",
    );
  }

  const url = new URL(connectionString);

  if (
    !["127.0.0.1", "localhost", "::1"].includes(url.hostname) ||
    url.port !== "54322" ||
    url.pathname !== "/postgres"
  ) {
    throw new Error(
      "Flow tests may connect only to local Supabase at 127.0.0.1:54322/postgres.",
    );
  }

  return new Client({ connectionString });
}

export async function removeTestBookings(client: Client) {
  await client.query(
    `DELETE FROM public.booking booking
     USING public.booking_court_time booking_time, public.courts court
     WHERE booking.id = booking_time.booking_id
       AND booking_time.court_id = court.id
       AND court.branch_id IN (
         SELECT branch.id
         FROM public.branches branch
         JOIN public.tenants tenant ON tenant.id = branch.tenant_id
         WHERE tenant.company_str = $1
       )`,
    [TEST_TENANT_KEY],
  );
}

export async function removeTestFixtures(client: Client) {
  await client.query("BEGIN");

  try {
    await removeTestBookings(client);
    await client.query(
      `DELETE FROM public.branches
       WHERE tenant_id IN (
         SELECT id FROM public.tenants WHERE company_str = $1
       )
       AND branch_name = $2`,
      [TEST_TENANT_KEY, TEST_BRANCH_NAME],
    );
    await client.query(
      "DELETE FROM public.tenants WHERE company_str = $1",
      [TEST_TENANT_KEY],
    );
    await client.query(
      `DELETE FROM public.sports
       WHERE sport_name = $1
         AND NOT EXISTS (
           SELECT 1 FROM public.courts WHERE sport_id = public.sports.id
         )`,
      [TEST_SPORT_NAME],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
