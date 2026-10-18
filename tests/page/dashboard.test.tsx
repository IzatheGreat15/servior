import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Page from "@/app/(internal)/dashboard/page";

test("renders dashboard heading, summary data, and report sections", async () => {
  render(<Page />);

  expect(
    await screen.findByRole("heading", { name: "Welcome Back, John!" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Total bookings")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Popular sports" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "User growth" })).toBeInTheDocument();
});
