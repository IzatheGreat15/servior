import { handleIdentityVerificationPassed } from "@/lib/paymongo/webhooks/handleIdentityVerificationPassed";
import { handleIdentityVerificationFailed } from "@/lib/paymongo/webhooks/handleIdentityVerificationFailed";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const event = payload.data?.attributes;

    if (!event?.type) {
      return NextResponse.json(
        { error: "Missing event type" },
        { status: 400 }
      );
    }

    console.log(
      "Received PayMongo webhook:",
      JSON.stringify(payload, null, 2)
    );

    switch (event.type) {
      case "account.identity_verification.passed":
        await handleIdentityVerificationPassed(event);
        break;

      case "account.identity_verification.failed":
        await handleIdentityVerificationFailed(event);
        break;

      default:
        console.log("Ignoring unsupported PayMongo event:", event.type);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayMongo webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}