
export type OnboardingData = {
  facilityName: string;
  legalBusinessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
};

export type OnboardingStatus =
  | "form"
  | "creating"
  | "identity"
  | "pending"
  | "success"
  | "failed"
  | "redirecting";

export const initialOnboardingData: OnboardingData = {
  facilityName: "",
  legalBusinessName: "",
  businessEmail: "",
  businessPhone: "",
  businessAddress: "",
  ownerFirstName: "",
  ownerLastName: "",
  ownerEmail: "",
  ownerPhone: "",
};

export const mockPlans: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 999,
    description: "Perfect for single-location facilities.",
    features: [
      "1 branch",
      "Multiple courts within the branch",
      "Online booking page",
      "Court and schedule management",
      "Booking and payment tracking",
      "Basic reports",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 1999,
    description: "For growing, multi-location businesses.",
    recommended: true,
    features: [
      "Up to 3 branches",
      "Everything in Starter",
      "Centralized dashboard",
      "Branch-level reports",
      "Separate schedules and pricing",
      "Staff access and permissions",
    ],
  },
];



