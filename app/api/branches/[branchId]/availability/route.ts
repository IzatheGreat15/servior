import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isPositiveInteger(value: string | null) {
  return value !== null && /^[1-9]\d*$/.test(value);
}

function isDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ branchId: string }> },
) {
  await connection();

  const { branchId } = await params;
  const url = new URL(request.url);
  const sportId = url.searchParams.get("sportId");
  const date = url.searchParams.get("date");

  if (!isPositiveInteger(branchId) || !isPositiveInteger(sportId) || !isDate(date)) {
    return Response.json(
      { error: "invalid_booking_filters" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc(
      "get_public_booking_availability",
      {
        p_branch_id: branchId,
        p_sport_id: sportId,
        p_booking_date: date,
      },
    );

    if (error) {
      if (error.code === "22023") {
        return Response.json(
          { error: "invalid_booking_date" },
          { status: 400, headers: { "Cache-Control": "no-store" } },
        );
      }

      console.error("Could not load court availability:", error.code);
      return Response.json(
        { error: "availability_unavailable" },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    return Response.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(
      "Could not connect to the court availability service:",
      error instanceof Error ? error.message : "Unknown connection error",
    );
    return Response.json(
      { error: "availability_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
