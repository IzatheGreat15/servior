export type BookingSelection = {
  courtId: string;
  courtName: string;
  startHour: number;
  endHour: number; // exclusive
};

export type Court = {
  id: string;
  name: string;
};

export const COURTS: Court[] = [
  { id: "court-1", name: "Court 1" },
  { id: "court-2", name: "Court 2" },
  { id: "court-3", name: "Court 3" },
  { id: "court-4", name: "Court 4" },
  { id: "court-5", name: "Court 5" },
  { id: "court-6", name: "Court 6" },
];

export const START_HOUR = 6;
export const END_HOUR = 21;

export function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${suffix}`;
}

export function formatRange(start: number, end: number) {
  return `${formatHour(start)} – ${formatHour(end)}`;
}

export function formatDate(date: string) {
  if (!date) return "";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Demo-only booked slots. Replace this with availability returned by your backend. */
export const UNAVAILABLE: Record<string, number[]> = {
  "court-1": [10],
  "court-2": [8, 17, 18],
  "court-3": [19, 20],
  "court-4": [10],
  "court-5": [15, 16],
  "court-6": [19, 20],
};
