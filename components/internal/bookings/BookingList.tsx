import BookingCard from "./BookingCard";
import BookingEmptyState from "./BookingEmptyState";
import { Booking } from "./types";

type BookingListProps = {
  bookings: Booking[];
  hasSearch: boolean;
  onViewDetails: (booking: Booking) => void;
};

export default function BookingList({
  bookings,
  hasSearch,
  onViewDetails,
}: BookingListProps) {
  if (bookings.length === 0) {
    return <BookingEmptyState hasSearch={hasSearch} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
