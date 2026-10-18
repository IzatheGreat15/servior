
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import OnboardingProgress from "./OnboardingProgress";
import BusinessDetailsStep from "./BusinessDetailsStep";
import OwnerDetailsStep from "./OwnerDetailsStep";
import SubscriptionStep from "./SubscriptionStep";
import ReviewStep from "./ReviewStep";
import CreatingMerchantStep from "./CreatingMerchantStep";
import IdentityVerificationStep from "./IdentityVerificationStep";
import VerificationPendingStep from "./VerificationPendingStep";
import OnboardingSuccess from "./OnboardingSuccess";
import RedirectingStep from "./RedirectingStep";
import {
  initialOnboardingData,
  mockPlans,
  type OnboardingData,
  type OnboardingStatus,
} from "./types";
import { GiTennisCourt } from "react-icons/gi";
import { HiBuildingOffice2 } from "react-icons/hi2";

export default function OnboardingWizard() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [data, setData] =
    useState<OnboardingData>(initialOnboardingData);
  const [selectedPlanId, setSelectedPlanId] = useState("starter");
  const [status, setStatus] =
    useState<OnboardingStatus>("form");
  const [verificationUrl, setVerificationUrl] = useState<string>('');
  const [tenantId, setTenantId] = useState<number | null>(null);

  const selectedPlan =
    mockPlans.find((plan) => plan.id === selectedPlanId) ??
    mockPlans[0];

  function update(field: keyof OnboardingData, value: string) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function goToDashboard() {
    setStatus("redirecting");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  }


  async function createMerchant() {
    setStatus("creating");

    try {
      const response = await fetch("/api/payments/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business: {
            facilityName: data.facilityName,
            legalBusinessName: data.legalBusinessName,
            businessEmail: data.businessEmail,
            businessPhone: data.businessPhone,
            businessAddress: data.businessAddress,
          },
          owner: {
            firstName: data.ownerFirstName,
            lastName: data.ownerLastName,
            email: data.ownerEmail,
            phone: data.ownerPhone,
          },
          planId: selectedPlan.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Failed to create merchant."
        );
      }

      console.log("Onboarding created:", result);

      setTenantId(Number(result.tenantId));
      setVerificationUrl(result.verificationUrl);
      setStatus("identity");
    } catch (error) {
      console.error("Merchant creation failed:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setStatus("form");
    }
  }


  function simulatePayMongoReturn() {
    setStatus("pending");

    window.open(
      verificationUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function handleTryAgain() {
    try {
      const response = await fetch("/api/payments/onboarding/reset", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantId }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to reset onboarding");
      }

      setStatus("identity");
    } catch (error) {
      console.error("Failed to reset onboarding:", error);
      // Display an error message to the user here.
    }
  }

  useEffect(() => {
    console.log(status, tenantId);
    if (status !== "pending" || tenantId === null) {
      return;
    }

    let cancelled = false;

    async function checkOnboardingStatus() {
      try {
        const response = await fetch(
          `/api/payments/onboarding/status?tenantId=${tenantId}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          return;
        }

        const result = await response.json();

        if (cancelled) return;

        switch (result.onboardingStatus) {
          case true:
            setStatus("success");
            break;

          case false:
            setStatus("failed");
            break;

          case "pending":
          default:
            // Keep waiting for the webhook to update the status.
            break;
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      }
    }

    void checkOnboardingStatus();

    const intervalId = window.setInterval(() => {
      void checkOnboardingStatus();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [status, tenantId]);

  const formStep = status === "form";

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2">
            <img src='/servior-logo.png' alt="Servior" className="w-10" />
            <span className="text-lg font-bold text-gray-900">
              <img src='/servior-name-logo.png' alt="Servior" className="w-30" />
            </span>
          </div>

          <span className="text-sm text-gray-500">
            Merchant onboarding
          </span>
        </div>
      </header>

      {formStep && (
        <div className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
            <OnboardingProgress currentStep={step} />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {formStep && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
              {step === 0 && (
                <BusinessDetailsStep
                  data={data}
                  update={update}
                  onNext={() => setStep(1)}
                />
              )}

              {step === 1 && (
                <OwnerDetailsStep
                  data={data}
                  update={update}
                  onBack={() => setStep(0)}
                  onNext={() => setStep(2)}
                />
              )}

              {step === 2 && (
                <SubscriptionStep
                  plans={mockPlans}
                  selectedPlanId={selectedPlanId}
                  onSelect={setSelectedPlanId}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              )}

              {step === 3 && (
                <ReviewStep
                  data={data}
                  plan={selectedPlan}
                  onBack={() => setStep(2)}
                  onSubmit={createMerchant}
                />
              )}
            </section>

            <aside className="hidden rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 lg:block">
              <div className="flex h-18 w-18 relative items-center justify-center rounded-full text-7xl text-emerald-700">
                <HiBuildingOffice2 className="absolute" />
              </div>

              <h3 className="mt-5 font-semibold text-gray-900">
                Get paid seamlessly
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Set up your merchant account to start receiving
                online payments for your bookings.
              </p>

              <div className="mt-6 border-t border-emerald-100 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                  Selected plan
                </p>
                <p className="mt-2 font-semibold text-gray-900">
                  {selectedPlan.name}
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  ₱{selectedPlan.price.toLocaleString("en-PH")}
                  <span className="text-sm font-normal text-gray-500">
                    {" "}/ month
                  </span>
                </p>
              </div>
            </aside>
          </div>
        )}

        {status === "failed" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-xl font-bold text-red-800">
              Verification unsuccessful
            </h2>

            <p className="mt-2 text-sm text-red-700">
              We couldn't verify your identity. Please review your details
              and follow the instructions provided by PayMongo.
            </p>

            <button
              type="button"
              onClick={handleTryAgain}
              className="mt-4 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Try again
            </button>
          </div>
        )}

        {status === "creating" && <CreatingMerchantStep />}

        {status === "identity" && (
          <IdentityVerificationStep
            onContinue={simulatePayMongoReturn}
          />
        )}

        {status === "pending" && <VerificationPendingStep />}

        {status === "success" && (
          <OnboardingSuccess onGoToDashboard={goToDashboard} />
        )}

        {status === "redirecting" && <RedirectingStep />}
      </div>
    </main>
  );
}
