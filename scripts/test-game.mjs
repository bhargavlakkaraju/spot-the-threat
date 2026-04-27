import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

await page.goto('http://localhost:5173/');
await page.getByPlaceholder('Enter agent name').fill('Tester');
await page.getByRole('button', { name: /Start investigation/i }).click();

for (const label of [
  'Wilting despite irrigation',
  'Root galling',
  'Stunted growth',
  'Soil discoloration',
  'Patchy field pattern',
]) {
  await page.getByLabel(label).click();
}

await page.getByRole('button', { name: 'Diagnose' }).click();
await page.getByRole('button', { name: /Root-knot Nematode/i }).click();
await page.getByRole('button', { name: /Submit diagnosis/i }).click();
await page.getByRole('button', { name: /Seed treatment/i }).click();
await page.getByRole('button', { name: /Close case/i }).click();
await page.screenshot({ path: 'extracted_previews/game-closed.png', fullPage: true });
await page.getByRole('button', { name: /Leaderboard/i }).click();
await page.screenshot({ path: 'extracted_previews/game-leaderboard.png', fullPage: true });

await browser.close();
