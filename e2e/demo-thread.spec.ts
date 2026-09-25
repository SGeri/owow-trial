import { expect, test } from "@playwright/test";

test("session-202 shows seeded reply and prior work without calling chat", async ({
  page,
}) => {
  await page.goto("/?session=session-202");

  await expect(
    page.getByText(
      "I still have not asked my manager which existing priority should move.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("not to decline every unplanned request"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Prior work" }).click();
  await expect(
    page.getByText(
      "On Monday, I will ask my manager to rank new requests against our current priorities.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("not the superseded decline-everything wording"),
  ).toBeVisible();
});
