import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Page from "@/app/(auth)/register/page";

test("renders required account fields and terms consent", () => {
  render(<Page />);

  expect(
    screen.getByRole("heading", { name: "Create your account" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Full name")).toBeRequired();
  expect(screen.getByLabelText("Email address")).toHaveAttribute(
    "type",
    "email",
  );
  expect(screen.getByLabelText("Password")).toHaveAttribute("minLength", "8");
  expect(screen.getByRole("checkbox", { name: /i agree/i })).toBeRequired();
});
