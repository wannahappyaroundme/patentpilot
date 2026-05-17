import { test, expect } from "@playwright/test";

test.describe("PatentPilot smoke tests", () => {
  test("Korean landing renders hero + brand", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/PatentPilot/i);
    await expect(page.getByRole("link", { name: /PatentPilot/i }).first()).toBeVisible();
  });

  test("English landing renders at /en with key copy", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/PatentPilot/i);
    await expect(
      page.getByRole("heading", { name: /sleeping R&D patents/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Browse listings/i }).first()).toBeVisible();
  });

  test("English about page lists urgency tiers", async ({ page }) => {
    await page.goto("/en/about");
    await expect(page.getByRole("heading", { name: /How PatentPilot works/i })).toBeVisible();
    await expect(page.getByText(/RED/)).toBeVisible();
    await expect(page.getByText(/YELLOW/)).toBeVisible();
    await expect(page.getByText(/GREEN/)).toBeVisible();
  });

  test("Privacy policy is reachable", async ({ page }) => {
    await page.goto("/privacy");
    await expect(
      page.getByRole("heading", { name: /개인정보처리방침/ }),
    ).toBeVisible();
    await expect(page.getByText("ethos614@gmail.com")).toBeVisible();
  });

  test("Terms of service is reachable", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /이용약관/ })).toBeVisible();
  });

  test("404 page renders friendly fallback", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist-12345", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/404/)).toBeVisible();
    await expect(page.getByRole("link", { name: /홈으로/ })).toBeVisible();
  });

  test("Market page loads listing UI", async ({ page }) => {
    await page.goto("/market");
    await expect(page).toHaveURL(/\/market/);
    await expect(page.getByRole("link", { name: /PatentPilot/i }).first()).toBeVisible();
  });

  test("Apply form blocks submit without consent checkbox", async ({ page }) => {
    await page.goto("/apply");
    await page.getByPlaceholder(/삼성전자/).fill("Test Co.");
    await page.getByPlaceholder(/박상훈/).fill("Tester");
    await page.getByPlaceholder("contact@company.com").fill("test@example.com");
    await page.getByPlaceholder("010-1234-5678").fill("010-1234-5678");

    // Submit without consent — must not navigate to success
    await page.getByRole("button", { name: /거래 신청 보내기/ }).click();

    // The consent block should now have an error tint (red border)
    const consent = page.locator("#loi-consent");
    await expect(consent).toBeVisible();
    await expect(consent).not.toBeChecked();
  });

  test("Footer exposes privacy + terms + English link", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer").last();
    await expect(footer.getByRole("link", { name: "개인정보처리방침" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "이용약관" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "English" })).toBeVisible();
  });

  test("sitemap.xml lists /en and policy routes", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain("/en");
    expect(body).toContain("/privacy");
    expect(body).toContain("/terms");
  });
});
