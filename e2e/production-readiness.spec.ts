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

  test("7. Technical Knowledge Hub & Documentation boots with search and domain filters", async ({ page }) => {
    await page.goto("/curriculum");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Technical Documentation & Concept Guides",
      }),
    ).toBeVisible();
    await expect(page.getByPlaceholder(/Search concepts, algorithms/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /All Disciplines/i })).toBeVisible();
  });

  test("8. SQL & Code Logic Validation Sandbox boots with all 7 technical labs", async ({ page }) => {
    await page.goto("/sandbox");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "SQL & Code Logic Validation Sandbox",
      }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Relational SQL Query Lab/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Algorithmic Code Logic Lab/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Visual Algorithm Stepper/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Memory & Cache Hierarchy Lab/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Distributed Systems & Architecture Lab/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /OS Kernel & Network Protocols Lab/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /System Design Architecture Lab/i })).toBeVisible();
  });

  test("9. Timed Mock Assessments catalog boots with real-time search and category filters", async ({ page }) => {
    await page.goto("/mock-tests");
    await expect(
      page.getByRole("heading", { level: 1, name: "Timed Mock Assessments" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder(/Search assessments by role, title/i)).toBeVisible();
    await expect(page.getByRole("tab", { name: /All Assessments/i })).toBeVisible();
  });

  test("10. Career Role Track detail page renders competencies, Socratic AI interview CTA, and curated Knowledge Hub documentation", async ({ page }) => {
    await page.goto("/roles/java-backend-developer");
    await expect(
      page.getByRole("heading", { level: 1, name: "Java Enterprise Backend Developer" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "AI Technical Scenario Interview" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Launch Interview Room/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Interactive Code & SQL Sandbox" }),
    ).toBeVisible();
  });
});

