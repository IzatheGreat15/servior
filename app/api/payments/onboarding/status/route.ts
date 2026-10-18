import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");

  if (!tenantId || !/^\d+$/.test(tenantId)) {
    return NextResponse.json(
      { error: "Invalid tenant ID" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("tenants")
    .select("onboarding_status")
    .eq("id", Number(tenantId))
    .maybeSingle();

  if (error) {
    console.error("Failed to check onboarding status:", error);

    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Tenant not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    onboardingStatus: data.onboarding_status,
  });
}