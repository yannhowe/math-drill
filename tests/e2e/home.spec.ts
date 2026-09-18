import { expect, test } from "@playwright/test";

test("shows the Math Drill foundation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Math Drill" })).toBeVisible();
});
