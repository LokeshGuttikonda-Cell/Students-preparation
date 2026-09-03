import { expect, test } from "@playwright/test";

test("the app boots and renders the placeholder page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Students-preparation" }),
  ).toBeVisible();
});

test("design tokens resolve to real colours", async ({ page }) => {
  await page.goto("/");

  const heading = page.getByRole("heading", { level: 1 });
  // primary-700 = #123A5E. If Tailwind failed to pick up @theme, this would
  // fall back to the inherited text colour and the assertion would fail.
  await expect(heading).toHaveCSS("color", "rgb(18, 58, 94)");
});

test("interviews hub page renders title and simulator header", async ({ page }) => {
  await page.goto("/interviews");

  await expect(
    page.getByRole("heading", { level: 1, name: "Socratic AI Technical Interview Simulator" }),
  ).toBeVisible();
});

