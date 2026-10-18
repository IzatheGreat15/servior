import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Page from "@/app/(internal)/(staff)/branches/add/page";

test("renders branch details, courts, and save controls", () => {
  render(<Page />);

  expect(screen.getByRole("heading", { name: "Add New Branch" })).toBeInTheDocument();
  expect(screen.getByLabelText("Branch name")).toHaveValue(
    "Greenfield Sports Center",
  );
  expect(screen.getByRole("heading", { name: "Sports & Courts" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Save branch" })).toBeInTheDocument();
});
