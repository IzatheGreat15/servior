import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import Page from "@/app/(auth)/login/page";

test("renders the sign-in form and toggles password visibility", async () => {
  const user = userEvent.setup();
  render(<Page />);

  expect(
    screen.getByRole("heading", { name: "Welcome back" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Email address")).toHaveAttribute(
    "type",
    "email",
  );

  const password = screen.getByLabelText("Password");
  expect(password).toHaveAttribute("type", "password");
  await user.click(screen.getByRole("button", { name: "Show password" }));
  expect(password).toHaveAttribute("type", "text");
  expect(
    screen.getByRole("button", { name: "Hide password" }),
  ).toBeInTheDocument();
});
