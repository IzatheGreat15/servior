import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Page from "@/app/(marketing)/page";

test("renders the marketing hero and primary navigation", () => {
  render(<Page />);

  expect(
    screen.getByRole("heading", { name: /make every booking effortless/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
    "href",
    "/login",
  );
  expect(screen.getByRole("link", { name: "Get started" })).toHaveAttribute(
    "href",
    "/register",
  );
});
