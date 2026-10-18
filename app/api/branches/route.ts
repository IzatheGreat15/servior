import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getAuthenticatedUser,
  isRecord,
  unauthorizedResponse,
} from "@/lib/supabase/request-auth";

function validateBranchPayload(value: unknown) {
  if (!isRecord(value) || !isRecord(value.branch) || !Array.isArray(value.sports)) {
    return false;
  }

  return (
    typeof value.branch.name === "string" &&
    value.branch.name.trim().length > 0 &&
    typeof value.branch.address === "string" &&
    value.branch.address.trim().length > 0 &&
    value.sports.every(
      (sport) =>
        isRecord(sport) &&
        typeof sport.name === "string" &&
        Array.isArray(sport.courts),
    )
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!validateBranchPayload(body)) {
    return Response.json({ error: "invalid_branch_payload" }, { status: 400 });
  }

  const payload = body as { branch: Record<string, unknown>; sports: unknown[] };

  try {
    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return unauthorizedResponse();

    const { data, error } = await supabase.rpc("save_staff_branch", {
      p_branch_id: null,
      p_branch: payload.branch,
      p_sports: payload.sports,
    });

    if (error) {
      if (error.code === "42501") {
        return Response.json({ error: "staff_access_required" }, { status: 403 });
      }
      if (error.code === "22023" || error.code === "22P02") {
        return Response.json({ error: "invalid_branch_payload" }, { status: 400 });
      }
      console.error("Could not create branch:", error.code);
      return Response.json({ error: "branch_creation_unavailable" }, { status: 503 });
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error(
      "Could not create branch:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "branch_creation_unavailable" }, { status: 503 });
  }
}
