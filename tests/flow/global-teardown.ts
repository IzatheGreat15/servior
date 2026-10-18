import { loadEnvConfig } from "@next/env";
import { createDatabaseClient, removeTestFixtures } from "./database";

export default async function globalTeardown() {
  loadEnvConfig(process.cwd());
  const client = createDatabaseClient();
  await client.connect();

  try {
    await removeTestFixtures(client);
  } finally {
    await client.end();
  }
}
