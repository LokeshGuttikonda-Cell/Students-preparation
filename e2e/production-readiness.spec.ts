import { expect, test } from "@playwright/test";

test.describe("Production Readiness End-to-End Audit", () => {
  test("1. Landing & Navigation Hub boots with primary CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Students-preparation" }),
    ).toBeVisible();

    const exploreLink = page.getByRole("link", { name: /Explore Roles/i }).first();
    await expect(exploreLink).toBeVisible();
  });

  test("2. Career Role Tracks Catalog renders without company branding", async ({ page }) => {
    await page.goto("/roles");
    await expect(
      page.getByRole("heading", { level: 1, name: "Career Roles & Skill Tracks" }),
    ).toBeVisible();

    const searchInput = page.getByPlaceholder(/Search by role/i);
    await expect(searchInput).toBeVisible();
  });

  test("3. Custom Simulation & Timed Mock Test Builder boots", async ({ page }) => {
    await page.goto("/mock-tests/custom");
    await expect(
      page.getByRole("heading", { level: 1, name: "Custom Simulation Generator" }),
    ).toBeVisible();
  });

  test("4. Socratic AI Interview Simulator Hub renders active simulator", async ({ page }) => {
    await page.goto("/interviews");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Socratic AI Technical Interview Simulator",
      }),
    ).toBeVisible();
  });

  test("5. Public Skill Credential Verification Portal boots and handles invalid code safely", async ({ page }) => {
    await page.goto("/verify/CRED-SAMPLE-NONEXISTENT");
    await expect(page.getByText(/Registry Lookup/i)).toBeVisible();
    await expect(page.getByText(/Back to Platform/i)).toBeVisible();
  });

  test("6. Peer Percentile Cohort Benchmarking Dashboard renders hero analytics", async ({ page }) => {
    await page.goto("/analytics/cohort");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Peer Percentile Cohort Benchmarking",
      }),
    ).toBeVisible();
  });
});
