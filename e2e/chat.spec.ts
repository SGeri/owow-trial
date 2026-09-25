import { expect, test } from "@playwright/test";

import { uiMessageStream } from "./ui-message-stream";

const assistantText = "Next cue: ask what they were avoiding.";

test("selects a session and shows a mocked Otto reply", async ({ page }) => {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill(uiMessageStream(assistantText));
  });

  await page.goto("/");
  await expect(page.getByText("Otto", { exact: true })).toBeVisible();

  await page.getByRole("combobox", { name: "Trusted session" }).click();
  await page.getByRole("option", { name: /session-202/ }).click();
  await expect(page).toHaveURL(/session=session-202/);

  await page.getByPlaceholder("What happened this week?").fill(
    "I still have not asked my manager which priority should move.",
  );
  await page.getByRole("button", { name: "Send" }).click();

  await expect(
    page.getByText("I still have not asked my manager which priority should move."),
  ).toBeVisible();
  await expect(page.getByText(assistantText)).toBeVisible();
});
