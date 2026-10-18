import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return Response.json(
      {
        status: "not_configured",
        message: "Set SUPABASE_URL and SUPABASE_ANON_KEY to enable the check.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("sports")
      .select("id")
      .limit(0);

    if (error) {
      return Response.json(
        { status: "unavailable", message: error.message },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    return Response.json(
      { status: "connected" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      {
        status: "unavailable",
        message:
          error instanceof Error
            ? error.message
            : "Unable to reach the Supabase database.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
