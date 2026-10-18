import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Page from "@/app/(internal)/(staff)/branches/[id]/edit/page";

test("renders the current branch details and editable court panel", () => {
  render(<Page />);

  expect(
    screen.getByRole("heading", { name: "Greenfield Sports Center" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Branch name")).toHaveValue(
    "Greenfield Sports Center",
  );
  expect(screen.getByRole("heading", { name: "Sports & Courts" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Save branch" })).toBeInTheDocument();
});
