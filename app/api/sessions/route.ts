import { createSupabaseServerClient } from "@/lib/supabase/server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
    typeof body.password !== "string" ||
    body.password.length < 1
  ) {
    return Response.json({ error: "invalid_credentials" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email.trim().toLowerCase(),
      password: body.password,
    });

    if (error || !data.user) {
      return Response.json(
        { error: "invalid_credentials" },
        { status: 401 },
      );
    }

    return Response.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata.full_name ?? "",
      },
    });
  } catch (error) {
    console.error(
      "Could not create user session:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "authentication_unavailable" }, { status: 503 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Could not end user session:", error.message);
      return Response.json({ error: "sign_out_failed" }, { status: 503 });
    }

    return Response.json({ signedOut: true });
  } catch (error) {
    console.error(
      "Could not end user session:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "authentication_unavailable" }, { status: 503 });
  }
}
