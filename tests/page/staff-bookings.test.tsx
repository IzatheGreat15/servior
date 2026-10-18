import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Page from "@/app/(internal)/(staff)/bookings/page";

test("renders the staff bookings list and table controls", () => {
  render(<Page />);

  expect(
    screen.getByRole("heading", { name: "Bookings", level: 1 }),
  ).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText("Search reference, venue, court, or sport..."),
  ).toBeInTheDocument();
  expect(screen.getByText("Reference")).toBeInTheDocument();
});
