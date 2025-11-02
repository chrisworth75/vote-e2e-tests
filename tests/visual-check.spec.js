const { test, expect } = require('@playwright/test');

test('visual check of pie charts', async ({ page }) => {
  const username = `VisualUser${Date.now()}`;

  // Navigate and register
  await page.goto('/');
  await page.fill('#username-input', username);
  await page.click('#register-btn');

  // Wait for polls to load
  await expect(page.locator('#polls-section')).not.toHaveClass(/d-none/, { timeout: 5000 });
  await page.waitForTimeout(2000);

  // Take screenshot of the page
  await page.screenshot({ path: 'test-results/full-page.png', fullPage: true });

  // Vote on first poll to see results
  const firstPoll = page.locator('#polls-container .card').first();
  const hasVotingOptions = await firstPoll.locator('.form-check').count() > 0;

  if (hasVotingOptions) {
    await firstPoll.locator('input[type="radio"]').first().click();
    await firstPoll.locator('button.btn-primary').click();
    await page.waitForTimeout(2000);

    // Take screenshot after voting
    await page.screenshot({ path: 'test-results/after-vote.png', fullPage: true });
  }

  // Take screenshot of just the first poll
  await firstPoll.screenshot({ path: 'test-results/first-poll.png' });
});
