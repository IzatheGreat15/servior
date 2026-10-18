import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import Page from "@/app/booking/page";

test("renders booking filters and loads court availability", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/booking/options") {
        return Response.json({
          branches: [{
            id: "1",
            name: "Test Branch",
            sports: [{ id: "2", name: "Test Sport" }],
          }],
          sports: [{ id: "2", name: "Test Sport" }],
        });
      }
      return Response.json({
        courts: [{ id: "3", name: "Court 1", pricePerHour: 400 }],
        unavailableSlots: [],
      });
    }),
  );

  render(<Page />);

  expect(
    await screen.findByRole("heading", { name: /book your court/i }),
  ).toBeInTheDocument();
  expect(
    await screen.findByRole("button", { name: "Test Branch" }),
  ).toBeInTheDocument();
  expect(
    await screen.findByRole("button", { name: "Test Sport" }),
  ).toBeInTheDocument();
  expect(
    await screen.findByRole("button", {
      name: "Court 1, 6:00 AM, available",
    }),
  ).toBeInTheDocument();
});

test("shows only sports available at the selected branch", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/booking/options") {
        return Response.json({
          branches: [
            {
              id: "1",
              name: "Branch One",
              sports: [{ id: "2", name: "Tennis" }],
            },
            {
              id: "3",
              name: "Branch Two",
              sports: [{ id: "4", name: "Basketball" }],
            },
          ],
          sports: [
            { id: "2", name: "Tennis" },
            { id: "4", name: "Basketball" },
          ],
        });
      }
      return Response.json({ courts: [], unavailableSlots: [] });
    }),
  );

  render(<Page />);

  fireEvent.click(await screen.findByRole("button", { name: "Branch One" }));
  fireEvent.click(screen.getByRole("option", { name: "Branch Two" }));

  expect(
    await screen.findByRole("button", { name: "Basketball" }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Basketball" }));
  const sportList = screen.getByRole("listbox", { name: "Sport" });
  expect(within(sportList).getByRole("option", { name: "Basketball" }))
    .toBeInTheDocument();
  expect(within(sportList).queryByRole("option", { name: "Tennis" }))
    .not.toBeInTheDocument();
});
