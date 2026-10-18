import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function getAuthenticatedUser(
  supabase: SupabaseClient,
): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return null;

  return data.user;
}

export async function getEmployeeTenantIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<number[] | null> {
  const { data, error } = await supabase
    .from("employees")
    .select("tenant_id")
    .eq("user_id", userId);

  if (error) return null;

  return [...new Set((data ?? []).map((row) => Number(row.tenant_id)))];
}

export function unauthorizedResponse() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

export function isValidIsoDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
