import { expect, test } from "@playwright/test";
import { captureEvidence } from "../support/evidence";

const bookingOptions = {
  branches: [{
    id: "1",
    name: "Test Branch",
    sports: [{ id: "2", name: "Test Sport" }],
  }],
  sports: [{ id: "2", name: "Test Sport" }],
};

const availability = {
  courts: [{ id: "3", name: "Court 1", pricePerHour: 400 }],
  unavailableSlots: [],
};

function dateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function mockBookingOptions(page: import("@playwright/test").Page) {
  await page.route("**/api/booking/options", (route) =>
    route.fulfill({ json: bookingOptions }),
  );
  await page.route("**/api/branches/1/availability**", (route) =>
    route.fulfill({ json: availability }),
  );
}

test("shows a page-level error when booking options cannot be loaded", async ({
  page,
}, testInfo) => {
  await page.route("**/api/booking/options", (route) =>
    route.fulfill({
      status: 503,
      json: { error: "booking_options_unavailable" },
    }),
  );

  await page.goto("/booking");

  await expect(page.locator("p[role='alert']")).toHaveText(
    "Booking options could not be loaded. Please try again later.",
  );
  await captureEvidence(page, testInfo, "booking-options-error-shown");
});

test("shows availability errors without exposing raw server details", async ({
  page,
}, testInfo) => {
  await page.route("**/api/booking/options", (route) =>
    route.fulfill({ json: bookingOptions }),
  );
  await page.route("**/api/branches/1/availability**", (route) =>
    route.fulfill({
      status: 503,
      json: { error: "database connection refused" },
    }),
  );

  await page.goto("/booking");

  await expect(page.locator("p[role='alert']")).toHaveText(
    "Court availability could not be loaded. Please try again.",
  );
  await captureEvidence(page, testInfo, "availability-error-shown");
});

test("explains when a selected booking slot has just been taken", async ({
  page,
}, testInfo) => {
  await mockBookingOptions(page);
  await page.route("**/api/bookings", (route) =>
    route.fulfill({ status: 409, json: { error: "booking_slot_conflict" } }),
  );

  await page.goto("/booking");
  await page.getByLabel("Date").fill(dateAfter(1));
  await page
    .getByRole("button", { name: "Court 1, 7:00 AM, available" })
    .click();
  await page.getByRole("button", { name: "Continue" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Full name").fill("Test Guest");
  await dialog.getByLabel("Email address").fill("test@example.test");
  await dialog.getByRole("button", { name: "Create booking hold" }).click();

  await expect(dialog.getByRole("alert")).toHaveText(
    "One or more selected times were just booked. Refresh availability and try again.",
  );
  await captureEvidence(page, testInfo, "slot-conflict-error-confirmed");
});

test("shows a retryable message when booking creation is unavailable", async ({
  page,
}, testInfo) => {
  await mockBookingOptions(page);
  await page.route("**/api/bookings", (route) =>
    route.fulfill({
      status: 503,
      json: { error: "booking_creation_unavailable" },
    }),
  );

  await page.goto("/booking");
  await page.getByLabel("Date").fill(dateAfter(1));
  await page
    .getByRole("button", { name: "Court 1, 7:00 AM, available" })
    .click();
  await page.getByRole("button", { name: "Continue" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Full name").fill("Test Guest");
  await dialog.getByLabel("Email address").fill("test@example.test");
  await dialog.getByRole("button", { name: "Create booking hold" }).click();

  await expect(dialog.getByRole("alert")).toHaveText(
    "Your booking hold could not be created. Please try again.",
  );
  await captureEvidence(page, testInfo, "booking-service-error-confirmed");
});

test("returns a clear validation response for malformed booking requests", async ({
  page,
  request,
}, testInfo) => {
  await page.goto("/booking");
  await captureEvidence(page, testInfo, "validation-check-start");

  const response = await request.post("/api/bookings", {
    headers: { "Idempotency-Key": crypto.randomUUID() },
    data: { branchId: "invalid", slots: [] },
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toEqual({
    error: "invalid_booking_request",
  });
  await captureEvidence(page, testInfo, "validation-error-confirmed");
});
