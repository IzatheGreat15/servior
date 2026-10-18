import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getAuthenticatedUser,
  isRecord,
  unauthorizedResponse,
} from "@/lib/supabase/request-auth";

type RouteContext = { params: Promise<{ branchId: string }> };

function parseBranchId(value: string) {
  return /^[1-9]\d*$/.test(value) ? value : null;
}

function validateBranchPayload(value: unknown) {
  return (
    isRecord(value) &&
    isRecord(value.branch) &&
    typeof value.branch.name === "string" &&
    value.branch.name.trim().length > 0 &&
    typeof value.branch.address === "string" &&
    value.branch.address.trim().length > 0 &&
    Array.isArray(value.sports) &&
    value.sports.every(
      (sport) =>
        isRecord(sport) &&
        typeof sport.name === "string" &&
        Array.isArray(sport.courts),
    )
  );
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { branchId: rawBranchId } = await params;
  const branchId = parseBranchId(rawBranchId);
  if (!branchId) {
    return Response.json({ error: "invalid_branch_id" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return unauthorizedResponse();

    const { data, error } = await supabase.rpc("get_staff_branch", {
      p_branch_id: branchId,
    });
    if (error) {
      if (error.code === "42501" || error.code === "P0002") {
        return Response.json({ error: "branch_not_found" }, { status: 404 });
      }
      console.error("Could not load branch:", error.code);
      return Response.json({ error: "branch_unavailable" }, { status: 503 });
    }

    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(
      "Could not load branch:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "branch_unavailable" }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { branchId: rawBranchId } = await params;
  const branchId = parseBranchId(rawBranchId);
  if (!branchId) {
    return Response.json({ error: "invalid_branch_id" }, { status: 400 });
  }

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
      p_branch_id: branchId,
      p_branch: payload.branch,
      p_sports: payload.sports,
    });

    if (error) {
      if (error.code === "42501" || error.code === "P0002") {
        return Response.json({ error: "branch_not_found" }, { status: 404 });
      }
      if (error.code === "22023" || error.code === "22P02") {
        return Response.json({ error: "invalid_branch_payload" }, { status: 400 });
      }
      console.error("Could not update branch:", error.code);
      return Response.json({ error: "branch_update_unavailable" }, { status: 503 });
    }

    return Response.json(data);
  } catch (error) {
    console.error(
      "Could not update branch:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "branch_update_unavailable" }, { status: 503 });
  }
}
