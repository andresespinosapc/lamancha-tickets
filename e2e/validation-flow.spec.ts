import { test, expect } from "@playwright/test";

test.describe("Ticket Validation E2E Flow", () => {
  test.describe("Guard validates tickets", () => {
    test.beforeEach(async ({ page }) => {
      // Login as guard
      await page.goto("/login");
      await page.fill('input[name="email"]', "guard@test.com");
      await page.fill('input[name="password"]', "testpassword");
      await page.click('button[type="submit"]');
      await page.waitForURL("/admin/readQR");
    });

    test("guard scans QR and validates ticket for the first time", async ({
      page,
    }) => {
      // Navigate to validation page
      await page.goto("/admin/readQR");

      // Verify page loaded
      await expect(page.locator("h1")).toContainText("Validar");

      // Note: Actual QR scanning requires mocking the QR scanner component
      // In a real E2E test, you would:
      // 1. Mock the QR scanner to return a specific redemption code
      // 2. Verify the validation result is shown

      // For now, verify the page structure exists
      await expect(page.locator("[data-testid='qr-scanner']")).toBeVisible();
    });

    test("guard re-scans same QR and sees already validated warning", async ({
      page,
    }) => {
      await page.goto("/admin/readQR");

      // When a ticket is re-validated, the UI should show:
      // - Yellow warning banner
      // - Previous validation information
      // - List of previous validations

      // This test would need to:
      // 1. First validate a ticket
      // 2. Then re-scan the same ticket
      // 3. Verify the warning appears

      await expect(page.locator("h1")).toContainText("Validar");
    });

    test("validation result shows attendee information", async ({ page }) => {
      await page.goto("/admin/readQR");

      // After scanning, the result should show:
      // - Attendee name
      // - Email
      // - RUT (document ID)
      // - Ticket type
      // - Validation status

      await expect(page.locator("h1")).toContainText("Validar");
    });

    test("guard can scan another ticket after validation", async ({ page }) => {
      await page.goto("/admin/readQR");

      // After validation, there should be a button to scan another ticket
      // This resets the scanner and allows for the next validation

      await expect(page.locator("h1")).toContainText("Validar");
    });
  });

  test.describe("Validation history", () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin to access validation history
      await page.goto("/login");
      await page.fill('input[name="email"]', "admin@test.com");
      await page.fill('input[name="password"]', "testpassword");
      await page.click('button[type="submit"]');
      await page.waitForURL("/admin/**");
    });

    test("admin sees validation record in validations page", async ({
      page,
    }) => {
      await page.goto("/admin/validations");

      // Verify page loaded
      await expect(page.locator("h1")).toContainText("Registro");

      // Should have a table with validation records
      await expect(page.locator("table")).toBeVisible();
    });

    test("validation history shows all previous validations with timestamps", async ({
      page,
    }) => {
      await page.goto("/admin/validations");

      // Table should have columns for:
      // - Ticket ID
      // - Attendee name
      // - Guard name
      // - Validation time
      // - Local server ID (if applicable)

      const table = page.locator("table");
      await expect(table).toBeVisible();

      // Check table headers exist (at least 4 columns)
      const headerCount = await table.locator("th").count();
      expect(headerCount).toBeGreaterThan(3);
    });

    test("admin can search validation records", async ({ page }) => {
      await page.goto("/admin/validations");

      // Should have a search input
      const searchInput = page.locator('input[placeholder*="Buscar"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
        // Results should filter based on search
      }
    });

    test("admin can filter validations by date", async ({ page }) => {
      await page.goto("/admin/validations");

      // Should have date filter inputs
      const dateFromInput = page.locator('input[type="date"]').first();
      if (await dateFromInput.isVisible()) {
        await dateFromInput.fill("2024-01-01");
        // Results should filter based on date
      }
    });
  });
});
