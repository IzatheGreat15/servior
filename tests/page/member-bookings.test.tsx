import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Page from "@/app/(internal)/(member)/my-bookings/page";

test("renders the member booking list and booking action", () => {
  render(<Page />);

  expect(screen.getByRole("heading", { name: "My Bookings" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /book a court/i })).toHaveAttribute(
    "href",
    "/booking",
  );
  expect(screen.getByRole("searchbox", { name: "Search bookings" })).toBeInTheDocument();
});
