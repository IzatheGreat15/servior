import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest) {
  try {
    const { tenantId } = await request.json();

    if (!tenantId || !Number.isInteger(Number(tenantId))) {
      return NextResponse.json(
        { error: "Invalid tenantId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("tenants")
      .update({ onboarding_status: null })
      .eq("id", Number(tenantId))
      .select("id")
      .single();

    if (error) {
      console.error("Failed to reset onboarding status:", error);

      return NextResponse.json(
        { error: "Failed to reset onboarding status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tenantId: data.id,
    });
  } catch (error) {
    console.error("Reset onboarding error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}