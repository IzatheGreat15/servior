import { supabaseAdmin } from "@/lib/supabase/admin";

type PayMongoWebhookEvent = {
  type: string;
  data?: {
    id?: string;
    attributes?: {
      identity_verification?: {
        status?: string;
      };
    };
  };
};

export async function handleIdentityVerificationFailed(
  event: PayMongoWebhookEvent
) {
  const accountId = event.data?.id;
  const verificationStatus =
    event.data?.attributes?.identity_verification?.status;

  if (!accountId) {
    throw new Error("Missing PayMongo account ID");
  }

  console.log("Identity verification failed:", {
    accountId,
    verificationStatus,
  });

  // Keep onboarding incomplete.
  const { data, error } = await supabaseAdmin
    .from("tenants")
    .update({ onboarding_status: false })
    .eq("paymongo_merchant_id", accountId)
    .select("id");

  if (error) {
    throw new Error(
      `Failed to update tenant onboarding status: ${error.message}`
    );
  }

  if (!data?.length) {
    throw new Error(`No tenant found for PayMongo account ${accountId}`);
  }

  return data;
}