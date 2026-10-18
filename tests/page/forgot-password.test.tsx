import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Page from "@/app/(auth)/forgot-password/page";

test("renders the reset email form and return-to-sign-in link", () => {
  render(<Page />);

  expect(
    screen.getByRole("heading", { name: "Forgot your password?" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Email address")).toHaveAttribute(
    "type",
    "email",
  );
  expect(
    screen.getByRole("button", { name: "Send reset link" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveAttribute(
    "href",
    "/login",
  );
});
