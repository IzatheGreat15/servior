import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/supabase/request-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isRecord } from "@/lib/supabase/request-auth";

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (
    !isRecord(body) ||
    typeof body.password !== "string" ||
    body.password.length < 8 ||
    body.password.length > 128
  ) {
    return Response.json({ error: "invalid_password" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return unauthorizedResponse();

    const { error } = await supabase.auth.updateUser({ password: body.password });
    if (error) {
      console.error("Could not update password:", error.message);
      return Response.json({ error: "password_update_failed" }, { status: 400 });
    }

    return Response.json({ updated: true });
  } catch (error) {
    console.error(
      "Could not update password:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "password_update_unavailable" }, { status: 503 });
  }
}
