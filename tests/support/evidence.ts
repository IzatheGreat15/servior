import type { Page, TestInfo } from "@playwright/test";

export async function captureEvidence(
  page: Page,
  testInfo: TestInfo,
  label: string,
) {
  const safeLabel = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const fileName = `${safeLabel || "evidence"}.png`;
  const path = testInfo.outputPath(fileName);

  await page.screenshot({
    path,
    fullPage: true,
    animations: "disabled",
  });

  await testInfo.attach(label, {
    path,
    contentType: "image/png",
  });

  return path;
}
