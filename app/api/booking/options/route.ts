import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BookingOption = {
  id: string;
  name: string;
};

type BookingBranch = BookingOption & {
  sports: BookingOption[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toBookingOption(
  id: unknown,
  name: unknown,
): BookingOption | null {
  if (
    (typeof id !== "string" && typeof id !== "number") ||
    typeof name !== "string"
  ) {
    return null;
  }
  return { id: String(id), name };
}

async function loadBranchSports(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
) {
  const { data, error } = await supabase
    .from("branches")
    .select("id, branch_name, courts(sport_id, price, sports(id, sport_name))");

  if (error) {
    console.error("Could not load branch-specific booking options:", error.code);
    return null;
  }

  const sportsById = new Map<string, BookingOption>();
  const branches: BookingBranch[] = [];

  for (const row of data ?? []) {
    const branch = toBookingOption(row.id, row.branch_name);
    if (!branch || !Array.isArray(row.courts)) continue;

    const branchSports = new Map<string, BookingOption>();
    for (const court of row.courts) {
      if (!isRecord(court) || typeof court.price !== "number" || court.price <= 0) {
        continue;
      }
      const sportRow = Array.isArray(court.sports) ? court.sports[0] : court.sports;
      if (!isRecord(sportRow)) continue;

      const sport = toBookingOption(sportRow.id, sportRow.sport_name);
      if (sport) {
        branchSports.set(sport.id, sport);
        sportsById.set(sport.id, sport);
      }
    }

    if (branchSports.size) {
      branches.push({ ...branch, sports: [...branchSports.values()] });
    }
  }

  return {
    branches,
    sports: [...sportsById.values()],
  };
}

export async function GET() {
  await connection();

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc(
      "get_public_booking_options",
    );

    if (error) {
      console.error("Could not load public booking options:", error.code);
      return Response.json(
        { error: "booking_options_unavailable" },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    const branchOptions = Array.isArray(data?.branches) ? data.branches : [];
    const hasBranchSports = branchOptions.every(
      (branch: unknown) => isRecord(branch) && Array.isArray(branch.sports),
    );
    const options = hasBranchSports
      ? data
      : await loadBranchSports(supabase);

    if (!options) {
      return Response.json(
        { error: "booking_options_unavailable" },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    return Response.json(options, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(
      "Could not connect to the booking options service:",
      error instanceof Error ? error.message : "Unknown connection error",
    );
    return Response.json(
      { error: "booking_options_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
