import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getAuthenticatedUser,
  isValidIsoDate,
  unauthorizedResponse,
} from "@/lib/supabase/request-auth";

type BookingRequest = {
  branchId: string;
  sportId: string;
  date: string;
  slots: Array<{ courtId: string; startHour: number }>;
  guest: { name: string; email: string; phone?: string };
};

const bookingStatuses = new Set(["pending", "confirmed", "completed", "cancelled"]);
const paymentStatuses = new Set(["paid", "unpaid", "refunded"]);

function positiveInteger(value: string | null, fallback: number, max: number) {
  if (value === null) return fallback;
  if (!/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return parsed <= max ? parsed : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = positiveInteger(url.searchParams.get("page"), 1, 100_000);
  const pageSize = positiveInteger(url.searchParams.get("pageSize"), 100, 1000);
  const branchId = url.searchParams.get("branchId");
  const query = url.searchParams.get("q")?.trim() || null;
  const status = url.searchParams.get("status");
  const paymentStatus = url.searchParams.get("paymentStatus");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (
    page === null ||
    pageSize === null ||
    (branchId !== null && !/^[1-9]\d*$/.test(branchId)) ||
    (query !== null && query.length > 100) ||
    (status !== null && !bookingStatuses.has(status)) ||
    (paymentStatus !== null && !paymentStatuses.has(paymentStatus)) ||
    (from !== null && !isValidIsoDate(from)) ||
    (to !== null && !isValidIsoDate(to)) ||
    (from !== null && to !== null && from > to)
  ) {
    return Response.json({ error: "invalid_booking_filters" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return unauthorizedResponse();

    const { data, error } = await supabase.rpc("list_staff_bookings", {
      p_query: query,
      p_status: status,
      p_payment_status: paymentStatus,
      p_branch_id: branchId,
      p_from: from,
      p_to: to,
      p_page: page,
      p_page_size: pageSize,
    });

    if (error) {
      if (error.code === "42501") {
        return Response.json({ error: "staff_access_required" }, { status: 403 });
      }
      if (error.code === "22023") {
        return Response.json({ error: "invalid_booking_filters" }, { status: 400 });
      }
      console.error("Could not load staff bookings:", error.code);
      return Response.json({ error: "bookings_unavailable" }, { status: 503 });
    }

    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(
      "Could not load staff bookings:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json({ error: "bookings_unavailable" }, { status: 503 });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is string {
  return typeof value === "string" && /^[1-9]\d*$/.test(value);
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function isValidRequest(value: unknown): value is BookingRequest {
  if (!isRecord(value) || !isRecord(value.guest)) return false;
  if (
    !isPositiveInteger(value.branchId) ||
    !isPositiveInteger(value.sportId) ||
    !isValidDate(value.date) ||
    !Array.isArray(value.slots) ||
    value.slots.length < 1 ||
    value.slots.length > 12
  ) {
    return false;
  }

  if (
    typeof value.guest.name !== "string" ||
    value.guest.name.trim().length < 1 ||
    value.guest.name.trim().length > 100 ||
    typeof value.guest.email !== "string" ||
    value.guest.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.guest.email.trim()) ||
    (value.guest.phone !== undefined &&
      (typeof value.guest.phone !== "string" || value.guest.phone.trim().length > 40))
  ) {
    return false;
  }

  return value.slots.every(
    (slot) =>
      isRecord(slot) &&
      isPositiveInteger(slot.courtId) &&
      Number.isInteger(slot.startHour) &&
      Number(slot.startHour) >= 0 &&
      Number(slot.startHour) < 23,
  );
}

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key");

  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 100) {
    return Response.json(
      { error: "invalid_idempotency_key" },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isValidRequest(body)) {
    return Response.json({ error: "invalid_booking_request" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc(
      "create_booking_hold",
      {
        p_branch_id: body.branchId,
        p_sport_id: body.sportId,
        p_booking_date: body.date,
        p_slots: body.slots,
        p_guest_name: body.guest.name.trim(),
        p_guest_email: body.guest.email.trim().toLowerCase(),
        p_guest_phone: body.guest.phone?.trim() || null,
        p_idempotency_key: idempotencyKey,
      },
    );

    if (error) {
      if (error.code === "23505") {
        return Response.json(
          { error: "booking_slot_conflict" },
          { status: 409 },
        );
      }
      if (error.code === "22023") {
        return Response.json(
          { error: "invalid_booking_request" },
          { status: 400 },
        );
      }

      console.error("Could not create booking hold:", error.code);
      return Response.json(
        { error: "booking_creation_unavailable" },
        { status: 503 },
      );
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error(
      "Could not connect to the booking service:",
      error instanceof Error ? error.message : "Unknown connection error",
    );
    return Response.json(
      { error: "booking_creation_unavailable" },
      { status: 503 },
    );
  }
}
