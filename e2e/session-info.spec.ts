import { expect, test } from "@playwright/test";

test("session fixture dialog shows private chat for the viewer", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Session fixture details" }).click();

  await expect(page.getByText("I am thinking about leaving my job.")).toBeVisible();
  await expect(page.getByText("private_chat").first()).toBeVisible();
  await page.getByRole("tab", { name: /Scenarios/ }).click();
  await expect(page.getByText("continuity")).toBeVisible();
});
