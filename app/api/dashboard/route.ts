import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getAuthenticatedUser,
  isValidIsoDate,
  unauthorizedResponse,
} from "@/lib/supabase/request-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!isValidIsoDate(from) || !isValidIsoDate(to) || from > to) {
    return Response.json({ error: "invalid_dashboard_date_range" }, { status: 400 });
  }

  const days = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000;
  if (days > 366) {
    return Response.json({ error: "dashboard_date_range_too_large" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return unauthorizedResponse();

    const [{ data, error }, { data: bookingsData, error: bookingsError }] =
      await Promise.all([
        supabase.rpc("get_staff_dashboard", { p_from: from, p_to: to }),
        supabase.rpc("list_staff_bookings", {
          p_from: from,
          p_to: to,
          p_page: 1,
          p_page_size: 10,
        }),
      ]);

    if (error || bookingsError) {
      const rpcError = error ?? bookingsError;
      if (rpcError && rpcError.code === "42501") {
        return Response.json({ error: "staff_access_required" }, { status: 403 });
      }
      if (rpcError && rpcError.code === "22023") {
        return Response.json({ error: "invalid_dashboard_date_range" }, { status: 400 });
      }
      console.error(
        "Could not load staff dashboard:",
        rpcError instanceof Error ? rpcError.message : "Unknown error",
      );
      return Response.json({ error: "dashboard_unavailable" }, { status: 503 });
    }

    return Response.json(
      {
        ...data,
        recentBookings:
          typeof bookingsData === "object" &&
          bookingsData !== null &&
          "items" in bookingsData
            ? bookingsData.items
            : [],
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "Could not load staff dashboard:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "dashboard_unavailable" }, { status: 503 });
  }
}
