
import { NextRequest, NextResponse } from "next/server";
import { paymongoRequest } from "@/lib/paymongo/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

// ---------------------------------------------------------
// Plans
// ---------------------------------------------------------

const PLANS = {
  starter: {
    name: "Starter",
    amount: 99_900,
    currency: "PHP",
  },
  growth: {
    name: "Growth",
    amount: 199_900,
    currency: "PHP",
  },
} as const;

type PlanId = keyof typeof PLANS;

type OnboardingBody = {
  business: {
    facilityName: string;
    legalBusinessName?: string;
    businessEmail: string;
    businessPhone: string;
    businessAddress: string;
  };
  owner: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  planId: string;
};

type OnboardingContext = {
  body: OnboardingBody;
  planId: PlanId;
};

type Tenant = {
  id: number;
};

type Branch = {
  id: number;
};

type PayMongoResponse = {
  data?: {
    id?: string;
    attributes?: {
      url?: string;
      verification_url?: string;
      hosted_url?: string;
    };
  };
};

// ---------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------

function isPlanId(value: string): value is PlanId {
  return Object.prototype.hasOwnProperty.call(PLANS, value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  return value.trim();
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return value.trim();
}

function validateOnboarding(input: unknown): OnboardingContext {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid onboarding details.");
  }

  const body = input as Record<string, unknown>;
  const business = body.business;
  const owner = body.owner;

  if (
    !business ||
    typeof business !== "object" ||
    !owner ||
    typeof owner !== "object"
  ) {
    throw new Error("Business and owner details are required.");
  }

  const businessData = business as Record<string, unknown>;
  const ownerData = owner as Record<string, unknown>;

  if (typeof body.planId !== "string" || !isPlanId(body.planId)) {
    throw new Error("Invalid subscription plan.");
  }

  const normalizedBody: OnboardingBody = {
    business: {
      facilityName: requiredString(
        businessData.facilityName,
        "Facility name",
      ),
      legalBusinessName: optionalString(
        businessData.legalBusinessName,
      ),
      businessEmail: requiredString(
        businessData.businessEmail,
        "Business email",
      ).toLowerCase(),
      businessPhone: requiredString(
        businessData.businessPhone,
        "Business phone",
      ),
      businessAddress: requiredString(
        businessData.businessAddress,
        "Business address",
      ),
    },
    owner: {
      firstName: requiredString(
        ownerData.firstName,
        "Owner first name",
      ),
      lastName: requiredString(
        ownerData.lastName,
        "Owner last name",
      ),
      email: requiredString(
        ownerData.email,
        "Owner email",
      ).toLowerCase(),
      phone: requiredString(
        ownerData.phone,
        "Owner phone",
      ),
    },
    planId: body.planId,
  };

  return {
    body: normalizedBody,
    planId: body.planId,
  };
}

// ---------------------------------------------------------
// 1. Create tenant
// ---------------------------------------------------------

async function createTenant(
  business: OnboardingBody["business"],
): Promise<Tenant> {
  // company_str is required and unique in the current schema.
  // This uses the legal business name when provided.
  // Confirm that this is the intended business identifier.
  const companyStr = formatCompanyName(
    business.legalBusinessName || business.facilityName
  );

  const { data, error } = await supabaseAdmin
    .from("tenants")
    .insert({
      business_name: business.facilityName,
      company_str: companyStr,
      contact_number: business.businessPhone,
      email: business.businessEmail,
      onboarding_status: false,
      payout_status: false,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create tenant: ${error.message}`);
  }

  return { id: Number(data.id) };
}

// ---------------------------------------------------------
// 2. Create initial branch
// ---------------------------------------------------------

async function createInitialBranch(
  tenantId: number,
  business: OnboardingBody["business"],
): Promise<Branch> {
  const { data, error } = await supabaseAdmin
    .from("branches")
    .insert({
      tenant_id: tenantId,
      branch_name: business.facilityName,
      branch_location: {
        address: business.businessAddress,
      },
      contact_number: business.businessPhone,
      email: business.businessEmail,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create initial branch: ${error.message}`);
  }

  return { id: Number(data.id) };
}

// ---------------------------------------------------------
// 3. Invite owner through Supabase Auth
// ---------------------------------------------------------

async function inviteOwner(
  owner: OnboardingBody["owner"],
): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }

  // const { data, error } =
  //   await supabaseAdmin.auth.admin.inviteUserByEmail(
  //     owner.email,
  //     {
  //       redirectTo: `${appUrl}/auth/callback?next=/auth/set-password`,
  //       data: {
  //         first_name: owner.firstName,
  //         last_name: owner.lastName,
  //         phone: owner.phone,
  //       },
  //     },
  //   );
  
  const { data, error } =
    await supabaseAdmin.auth.admin.createUser({
      email: owner.email,

      // Temporary password for testing.
      // The user should set a real password before using the account.
      password: crypto.randomUUID() + "Aa1!",

      email_confirm: true,

      user_metadata: {
        first_name: owner.firstName,
        last_name: owner.lastName,
        phone: owner.phone,
      },
    });

  if (error) {
    throw new Error(`Failed to invite owner: ${error.message}`);
  }

  if (!data.user) {
    throw new Error("Supabase did not return the invited user.");
  }

  return data.user.id;
}

// ---------------------------------------------------------
// 4. Link owner to tenant through employees
// ---------------------------------------------------------

async function createEmployee(
  userId: string,
  tenantId: number,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("employees")
    .insert({
      user_id: userId,
      tenant_id: tenantId,
    });

  if (error) {
    throw new Error(`Failed to link owner to tenant: ${error.message}`);
  }
}

// ---------------------------------------------------------
// 5. Create PayMongo customer
// ---------------------------------------------------------



async function createPayMongoCustomer(
  owner: OnboardingBody["owner"],
): Promise<string> {
  try {
    const response = await paymongoRequest<PayMongoResponse>(
      "/v1/customers",
      {
        method: "POST",
        body: {
          data: {
            attributes: {
              first_name: owner.firstName,
              last_name: owner.lastName,
              phone: owner.phone,
              email: owner.email,
              default_device: 'email',
              metadata: {},
            },
          },
        },
      },
    );

    const customerId = response.data?.id;

    if (!customerId) {
      throw new Error("PayMongo did not return a customer ID.");
    }

    return customerId;
  } catch (error) {
    console.error("Failed to create PayMongo customer:", {
      email: owner.email,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}


// ---------------------------------------------------------
// 6. Save PayMongo customer ID
// ---------------------------------------------------------

async function savePayMongoCustomerId(
  tenantId: number,
  customerId: string,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("tenants")
    .update({
      paymongo_customer_id: customerId,
    })
    .eq("id", tenantId);

  if (error) {
    throw new Error(
      `Failed to save PayMongo customer ID: ${error.message}`,
    );
  }
}

// ---------------------------------------------------------
// 7. Create PayMongo merchant account
// ---------------------------------------------------------

async function createPayMongoMerchant(): Promise<string> {
  // Verify this endpoint and payload against the PayMongo
  // API capabilities enabled for your account before using it.
  const response = await paymongoRequest<PayMongoResponse>(
    "/v2/accounts",
    {
      method: "POST",
      body: {
        type: 'merchant',
      },
    },
  );

  const merchantId = response.data?.id;

  if (!merchantId) {
    throw new Error("PayMongo did not return a merchant account ID.");
  }

  return merchantId;
}

// ---------------------------------------------------------
// 8. Save PayMongo merchant ID
// ---------------------------------------------------------

async function savePayMongoMerchantId(
  tenantId: number,
  merchantId: string,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("tenants")
    .update({
      paymongo_merchant_id: merchantId,
    })
    .eq("id", tenantId);

  if (error) {
    throw new Error(
      `Failed to save PayMongo merchant ID: ${error.message}`,
    );
  }
}

// ---------------------------------------------------------
// 9. Create identity verification session
// ---------------------------------------------------------

async function createVerificationSession(
  merchantId: string,
): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }

  // Verify this endpoint, payload, and response shape against
  // the PayMongo identity-verification API before enabling it.
  const response = await paymongoRequest<any>(
    `/v2/accounts/${merchantId}/identity_verification`,
    {
      method: "POST",
      body: {
        data: {
          attributes: {
            return_url:
              `${appUrl}/settings/payments/onboarding/complete`,
          },
        },
      },
    },
  );

  console.log(
      "PayMongo identity verification response:", merchantId, ':',
      JSON.stringify(response, null, 2),
    );

  const verificationUrl =
    response.data?.url ??
    response.data?.verification_url ??
    response.data?.hosted_url;

  if (!verificationUrl) {
    throw new Error("PayMongo did not return a verification URL.");
  }

  return verificationUrl;
}

// ---------------------------------------------------------
// POST: Orchestrate onboarding sequentially
// ---------------------------------------------------------

export async function POST(request: NextRequest) {
  let tenantId: number | undefined;
  let ownerUserId: string | undefined;
  let branchId: number | undefined;
  let customerId: string | undefined;
  let merchantId: string | undefined;

  let context: OnboardingContext;

  // Validate request body.
  try {
    context = validateOnboarding(await request.json());
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid onboarding details.",
      },
      { status: 400 },
    );
  }

  const { body, planId } = context;
  const plan = PLANS[planId];

  try {
    // 1. Create tenant.
    const tenant = await createTenant(body.business);
    tenantId = tenant.id;
    // tenantId = 9; // DELETE LATER

    // 2. Create the tenant's initial branch.
    const branch = await createInitialBranch(
      tenant.id,
      body.business,
    );
    branchId = branch.id;
    // branchId = 7; // DELETE LATER

    // 3. Invite the owner.
    ownerUserId = await inviteOwner(body.owner);
    // ownerUserId = 'f679e0c7-63df-46f6-bdb7-5c26c7f3a05f'; // DELETE LATER

    // 4. Link the owner to the tenant.
    await createEmployee(ownerUserId, tenantId);

    // 5. Create PayMongo customer.
    customerId = await createPayMongoCustomer(body.owner);
    // customerId = 'cus_a5f058a2ef73ece99f0241cd'; // DELETE LATER
    // 6. Save PayMongo customer ID.
    await savePayMongoCustomerId(tenantId, customerId);

    // 7. Create PayMongo merchant account.
    merchantId = await createPayMongoMerchant();

    // 8. Save PayMongo merchant ID.
    await savePayMongoMerchantId(tenantId, merchantId);

    // 9. Create identity verification session.
    const verificationUrl =
      await createVerificationSession(merchantId);

    // The current schema does not include subscription_invoices.
    // The selected plan is returned but no invoice is persisted.

    return NextResponse.json({
      success: true,
      tenantId: tenantId,
      branchId: branchId,
      userId: ownerUserId,
      customerId,
      merchantId,
      plan: {
        id: planId,
        name: plan.name,
        amount: plan.amount,
        currency: plan.currency,
      },
      verificationUrl,
    });
  } catch (error) {
    console.error("Tenant onboarding failed:", {
      tenantId,
      branchId,
      ownerUserId,
      customerCreated: Boolean(customerId),
      merchantCreated: Boolean(merchantId),
      message:
        error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        error: "Unable to complete onboarding. Please try again.",
        tenantId: tenantId ?? null,
        retryable: true,
        requiresRecovery: Boolean(tenantId),
      },
      { status: 500 },
    );
  }
}

function formatCompanyName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
