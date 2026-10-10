
export type BookingStatus =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled";

export type BookingSession = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  price: number;
  status?: BookingStatus;
};

export type Booking = {
  id: string;
  reference: string;
  venueName: string;
  branchName: string;
  sport: string;
  courtName: string;
  sessions: BookingSession[];
  paymentStatus: "paid" | "unpaid" | "refunded";
  status: BookingStatus;
  address: string;
  createdAt: string;
  notes?: string;
};

export const mockBookings: Booking[] = [
  {
    id: "1",
    reference: "SVR-2026-1042",
    venueName: "Green Court Sports Center",
    branchName: "Cebu City Branch",
    sport: "Badminton",
    courtName: "Court 02",
    sessions: [
      {
        id: "session-1",
        date: "2026-10-15",
        startTime: "14:00",
        endTime: "16:00",
        price: 900,
      },
      {
        id: "session-3",
        date: "2026-10-15",
        startTime: "07:00",
        endTime: "08:00",
        price: 450,
      },
      {
        id: "session-2",
        date: "2026-10-20",
        startTime: "07:00",
        endTime: "09:00",
        price: 900,
      },
    ],
    paymentStatus: "paid",
    status: "confirmed",
    address: "Cebu City, Cebu",
    createdAt: "2026-10-02T10:30:00",
  },
  {
    id: "2",
    reference: "SVR-2026-1043",
    venueName: "Green Court Sports Center",
    branchName: "Cebu City Branch",
    sport: "Basketball",
    courtName: "Court A",
    sessions: [
      {
        id: "session-3",
        date: "2026-10-18",
        startTime: "14:00",
        endTime: "16:00",
        price: 1200,
      },
    ],
    paymentStatus: "unpaid",
    status: "pending",
    address: "Cebu City, Cebu",
    createdAt: "2026-10-02T11:15:00",
  },
];
