import { expect, test } from "@playwright/test";

test("shows the child and parent entrypoint", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Who is practising?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Parent mode" })).toBeVisible();
});
