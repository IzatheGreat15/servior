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
    typeof body.name !== "string" ||
    body.name.trim().length < 1 ||
    body.name.trim().length > 100 ||
    typeof body.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
    typeof body.password !== "string" ||
    body.password.length < 8 ||
    body.password.length > 128
  ) {
    return Response.json({ error: "invalid_registration" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: body.email.trim().toLowerCase(),
      password: body.password,
      options: {
        data: { full_name: body.name.trim() },
      },
    });

    if (error) {
      if (error.status && error.status >= 500) {
        console.error("Supabase sign-up failed:", error.message);
        return Response.json({ error: "registration_unavailable" }, { status: 503 });
      }
      return Response.json({ error: "registration_rejected" }, { status: 400 });
    }

    return Response.json(
      {
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email,
              fullName: data.user.user_metadata.full_name ?? "",
            }
          : null,
        confirmationRequired: !data.session,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Could not register user:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "registration_unavailable" }, { status: 503 });
  }
}
