import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isRecord } from "@/lib/supabase/request-auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (
    !isRecord(body) ||
    typeof body.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
  ) {
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  const appUrl = process.env.APP_URL ?? "http://127.0.0.1:3000";
  let redirectTo: string;
  try {
    const base = new URL(appUrl);
    if (base.protocol !== "https:" && base.hostname !== "127.0.0.1" && base.hostname !== "localhost") {
      return Response.json({ error: "invalid_app_url_configuration" }, { status: 500 });
    }
    redirectTo = new URL("/reset-password", base).toString();
  } catch {
    return Response.json({ error: "invalid_app_url_configuration" }, { status: 500 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      body.email.trim().toLowerCase(),
      { redirectTo },
    );

    if (error) {
      console.error("Could not request password reset:", error.message);
      return Response.json({ error: "password_reset_unavailable" }, { status: 503 });
    }

    return Response.json({
      message: "If an account exists for that email, a reset link will be sent.",
    });
  } catch (error) {
    console.error(
      "Could not request password reset:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "password_reset_unavailable" }, { status: 503 });
  }
}
