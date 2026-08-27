import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "../page";

describe("placeholder page", () => {
  it("renders the project name as the page heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Students-preparation" }),
    ).toBeInTheDocument();
  });

  it("shows the timer sample with tabular numerals", () => {
    render(<Home />);

    expect(screen.getByText("29:00")).toHaveClass("tabular");
  });
});
