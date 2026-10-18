export type BookingOption = {
  id: string;
  name: string;
};

export type BookingCourt = BookingOption & {
  pricePerHour: number;
};

export type BookingBranch = BookingOption & {
  sports: BookingOption[];
};

export type UnavailableSlot = {
  courtId: string;
  startHour: number;
};

export type BookingOptions = {
  branches: BookingBranch[];
  sports: BookingOption[];
};

export type BookingAvailability = {
  courts: BookingCourt[];
  unavailableSlots: UnavailableSlot[];
};
