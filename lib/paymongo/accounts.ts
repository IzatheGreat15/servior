
import { paymongoRequest } from "./client";

type PayMongoAccountResponse = {
  data?: {
    id?: string;
    attributes?: Record<string, unknown>;
  };
};

type PayMongoVerificationResponse = {
  data?: {
    id?: string;
    attributes?: Record<string, unknown>;
  };
};

export async function createChildMerchant() {
  const result = await paymongoRequest<PayMongoAccountResponse>(
    "/v2/accounts",
    {
      method: "POST",
      body: JSON.stringify({
        type: "merchant",
      }),
    }
  );

  const accountId = result.data?.id;

  if (!accountId || !accountId.startsWith("org_")) {
    throw new Error(
      "PayMongo did not return a valid child account ID."
    );
  }

  return accountId;
}

export async function createIdentityVerificationSession(
  accountId: string
) {
  if (!/^org_[a-zA-Z0-9]+$/.test(accountId)) {
    throw new Error("Invalid PayMongo account ID.");
  }

  const result =
    await paymongoRequest<PayMongoVerificationResponse>(
      `/v2/accounts/${accountId}/identity_verification`,
      {
        method: "POST",
      }
    );

  const attributes = result.data?.attributes ?? {};

  // Confirm the exact response property against your PayMongo
  // test-mode response before relying on this mapping.
  const verificationUrl =
    attributes.url ??
    attributes.verification_url ??
    attributes.hosted_url;

  if (
    typeof verificationUrl !== "string" ||
    !verificationUrl.startsWith("https://")
  ) {
    throw new Error(
      "PayMongo did not return a recognized hosted verification URL."
    );
  }

  const url = new URL(verificationUrl);

  if (
    url.hostname !== "paymongo.com" &&
    !url.hostname.endsWith(".paymongo.com")
  ) {
    throw new Error("Unexpected PayMongo verification URL host.");
  }

  return verificationUrl;
}
