import { expect, test } from "@playwright/test";
import { captureEvidence } from "../support/evidence";

function dateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function chooseOption(
  page: import("@playwright/test").Page,
  value: string,
) {
  await page.getByRole("button", { name: new RegExp(value) }).click();
  await page.getByRole("option", { name: value, exact: true }).click();
}

test("saves an uneven multi-court booking and removes its hours from availability", async ({
  page,
}, testInfo) => {
  await page.goto("/booking");
  await expect(
    page.getByRole("heading", { name: "Book your court" }),
  ).toBeVisible();
  await captureEvidence(page, testInfo, "booking-page-loaded");

  await chooseOption(page, "Servior Playwright Test Branch");
  await chooseOption(page, "Servior Playwright Test Sport");
  await page.getByLabel("Date").fill(dateAfter(1));

  const court1At7 = page.getByRole("button", {
    name: "Court 1, 7:00 AM, available",
  });
  const court1At8 = page.getByRole("button", {
    name: "Court 1, 8:00 AM, available",
  });
  const court2At9 = page.getByRole("button", {
    name: "Court 2, 9:00 AM, available",
  });

  await expect(court1At7).toBeEnabled();
  await captureEvidence(page, testInfo, "court-options-ready");
  await court1At7.click();
  await court1At8.click();
  await court2At9.click();

  await expect(page.getByText("3 slots")).toBeVisible();
  await expect(page.getByText("3 hours", { exact: true })).toBeVisible();
  await expect(page.getByText("₱1,200", { exact: true })).toBeVisible();
  await captureEvidence(page, testInfo, "booking-summary-confirmed");

  await page.getByRole("button", { name: "Continue" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Full name").fill("Playwright Guest");
  await dialog.getByLabel("Email address").fill("playwright@example.test");

  const bookingResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/bookings") &&
      response.request().method() === "POST",
  );
  await dialog.getByRole("button", { name: "Create booking hold" }).click();
  const response = await bookingResponse;

  expect(response.status()).toBe(201);
  const booking = (await response.json()) as {
    id: string;
    status: string;
    expiresAt: string;
    totalAmount: number;
  };
  expect(booking.id).toBeTruthy();
  expect(booking.status).toBe("held");
  expect(Date.parse(booking.expiresAt)).toBeGreaterThan(Date.now());
  expect(Number(booking.totalAmount)).toBe(1200);
  await expect(page.getByRole("status")).toContainText("Booking hold");
  await captureEvidence(page, testInfo, "booking-hold-created");

  await expect(
    page.getByRole("button", { name: "Court 1, 7:00 AM, unavailable" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Court 1, 8:00 AM, unavailable" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Court 2, 9:00 AM, unavailable" }),
  ).toBeDisabled();
  await captureEvidence(page, testInfo, "availability-updated");
});

test("booking creation is idempotent and rejects an already-held slot conflict", async ({
  page,
  request,
}, testInfo) => {
  await page.goto("/booking");
  await expect(
    page.getByRole("heading", { name: "Book your court" }),
  ).toBeVisible();
  await captureEvidence(page, testInfo, "booking-idempotency-start");

  const optionsResponse = await request.get("/api/booking/options");
  expect(optionsResponse.ok()).toBeTruthy();
  const options = (await optionsResponse.json()) as {
    branches: Array<{ id: string; name: string }>;
    sports: Array<{ id: string; name: string }>;
  };
  const branch = options.branches.find(
    (option) => option.name === "Servior Playwright Test Branch",
  );
  const sport = options.sports.find(
    (option) => option.name === "Servior Playwright Test Sport",
  );
  expect(branch).toBeDefined();
  expect(sport).toBeDefined();

  const date = dateAfter(2);
  const availabilityResponse = await request.get(
    `/api/branches/${branch?.id}/availability?date=${date}&sportId=${sport?.id}`,
  );
  expect(availabilityResponse.ok()).toBeTruthy();
  const availability = (await availabilityResponse.json()) as {
    courts: Array<{ id: string; name: string }>;
  };
  const court = availability.courts.find((option) => option.name === "Court 1");
  expect(court).toBeDefined();

  const payload = {
    branchId: branch?.id,
    sportId: sport?.id,
    date,
    slots: [{ courtId: court?.id, startHour: 7 }],
    guest: { name: "Playwright Guest", email: "playwright@example.test" },
  };
  const idempotencyKey = crypto.randomUUID();

  const first = await request.post("/api/bookings", {
    headers: { "Idempotency-Key": idempotencyKey },
    data: payload,
  });
  expect(first.status()).toBe(201);
  const firstBooking = (await first.json()) as { id: string };

  const retry = await request.post("/api/bookings", {
    headers: { "Idempotency-Key": idempotencyKey },
    data: payload,
  });
  expect(retry.status()).toBe(201);
  const retriedBooking = (await retry.json()) as { id: string };
  expect(retriedBooking.id).toBe(firstBooking.id);

  const competingBooking = await request.post("/api/bookings", {
    headers: { "Idempotency-Key": crypto.randomUUID() },
    data: payload,
  });
  expect(competingBooking.status()).toBe(409);

  const updatedAvailability = await request.get(
    `/api/branches/${branch?.id}/availability?date=${date}&sportId=${sport?.id}`,
  );
  const result = (await updatedAvailability.json()) as {
    unavailableSlots: Array<{ courtId: string; startHour: number }>;
  };
  expect(
    result.unavailableSlots.some(
      (slot) => slot.courtId === court?.id && slot.startHour === 7,
    ),
  ).toBe(true);

  await page.goto("/booking");
  await expect(
    page.getByRole("heading", { name: "Book your court" }),
  ).toBeVisible();
  await captureEvidence(page, testInfo, "idempotent-booking-confirmed");
});
