import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getAuthenticatedUser,
  isValidIsoDate,
  unauthorizedResponse,
} from "@/lib/supabase/request-auth";

const bookingStatuses = new Set(["pending", "confirmed", "completed", "cancelled"]);

function positiveInteger(value: string | null, fallback: number, max: number) {
  if (value === null) return fallback;
  if (!/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return parsed <= max ? parsed : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = positiveInteger(url.searchParams.get("page"), 1, 100_000);
  const pageSize = positiveInteger(url.searchParams.get("pageSize"), 100, 1000);
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (
    page === null ||
    pageSize === null ||
    (status !== null && !bookingStatuses.has(status)) ||
    (from !== null && !isValidIsoDate(from)) ||
    (to !== null && !isValidIsoDate(to)) ||
    (from !== null && to !== null && from > to)
  ) {
    return Response.json({ error: "invalid_booking_filters" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return unauthorizedResponse();

    const { data, error } = await supabase.rpc("list_my_bookings", {
      p_status: status,
      p_from: from,
      p_to: to,
      p_page: page,
      p_page_size: pageSize,
    });

    if (error) {
      if (error.code === "42501") {
        return Response.json({ error: "unauthorized" }, { status: 401 });
      }
      if (error.code === "22023") {
        return Response.json({ error: "invalid_booking_filters" }, { status: 400 });
      }
      console.error("Could not load member bookings:", error.code);
      return Response.json({ error: "bookings_unavailable" }, { status: 503 });
    }

    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(
      "Could not load member bookings:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "bookings_unavailable" }, { status: 503 });
  }
}
