import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getAuthenticatedUser,
  getEmployeeTenantIds,
  isRecord,
  unauthorizedResponse,
} from "@/lib/supabase/request-auth";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ branchId: string }> },
) {
  const { branchId } = await params;
  if (!/^[1-9]\d*$/.test(branchId)) {
    return Response.json({ error: "invalid_branch_id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  if (
    !isRecord(body) ||
    typeof body.contentType !== "string" ||
    !allowedTypes.has(body.contentType) ||
    typeof body.sizeBytes !== "number" ||
    !Number.isInteger(body.sizeBytes) ||
    body.sizeBytes < 1 ||
    body.sizeBytes > 5 * 1024 * 1024
  ) {
    return Response.json({ error: "invalid_photo" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return unauthorizedResponse();

    const [tenantIds, branchResult] = await Promise.all([
      getEmployeeTenantIds(supabase, user.id),
      supabase.from("branches").select("tenant_id").eq("id", branchId).maybeSingle(),
    ]);

    if (branchResult.error) {
      console.error("Could not verify branch for photo upload:", branchResult.error.code);
      return Response.json({ error: "photo_upload_unavailable" }, { status: 503 });
    }
    if (!branchResult.data) {
      return Response.json({ error: "branch_not_found" }, { status: 404 });
    }
    if (tenantIds === null) {
      console.error("Could not verify staff membership for photo upload.");
      return Response.json({ error: "photo_upload_unavailable" }, { status: 503 });
    }

    const tenantId = Number(branchResult.data.tenant_id);
    if (!tenantIds.includes(tenantId)) {
      return Response.json({ error: "staff_access_required" }, { status: 403 });
    }

    const extension = allowedTypes.get(body.contentType)!;
    const path = `${tenantId}/${branchId}/${crypto.randomUUID()}.${extension}`;
    const { data, error } = await supabase.storage
      .from("court-photos")
      .createSignedUploadUrl(path, { upsert: false });

    if (error) {
      console.error("Could not create court photo upload URL:", error.message);
      return Response.json({ error: "photo_upload_unavailable" }, { status: 503 });
    }

    const { data: publicData } = supabase.storage
      .from("court-photos")
      .getPublicUrl(path);

    return Response.json({
      path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: publicData.publicUrl,
    });
  } catch (error) {
    console.error(
      "Could not create court photo upload URL:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "photo_upload_unavailable" }, { status: 503 });
  }
}
