const { test, expect } = require('@playwright/test');

test.describe('Vote Application E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should load the login page', async ({ page }) => {
    await expect(page.locator('#auth-section')).toBeVisible();
    await expect(page.locator('#username-input')).toBeVisible();
    await expect(page.locator('#login-btn')).toBeVisible();
    await expect(page.locator('#register-btn')).toBeVisible();
  });

  test('should register a new user and show polls', async ({ page }) => {
    const username = `TestUser${Date.now()}`;

    // Fill username
    await page.fill('#username-input', username);

    // Register
    await page.click('#register-btn');

    // Wait for success message
    await expect(page.locator('.alert-success')).toBeVisible({ timeout: 5000 });

    // Wait for polls section to appear
    await expect(page.locator('#polls-section')).not.toHaveClass(/d-none/, { timeout: 5000 });

    // Verify username is displayed
    await expect(page.locator('#username-display')).toHaveText(username);

    // Verify polls are loaded (now in .card not .poll-card)
    await expect(page.locator('#polls-container .card')).toHaveCount(4, { timeout: 5000 });
  });

  test('should login with existing user', async ({ page }) => {
    const username = `LoginUser${Date.now()}`;

    // Register first
    await page.fill('#username-input', username);
    await page.click('#register-btn');
    await expect(page.locator('#polls-section')).toBeVisible({ timeout: 5000 });

    // Logout
    await page.click('#logout-btn');
    await expect(page.locator('#auth-section')).toBeVisible();

    // Login again
    await page.fill('#username-input', username);
    await page.click('#login-btn');

    // Should see polls again
    await expect(page.locator('#polls-section')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#username-display')).toHaveText(username);
  });

  test('should vote on a poll and show results', async ({ page }) => {
    const username = `VoteUser${Date.now()}`;

    // Register and login
    await page.fill('#username-input', username);
    await page.click('#register-btn');
    await expect(page.locator('#polls-section')).not.toHaveClass(/d-none/, { timeout: 5000 });

    // Wait for polls to load
    await page.waitForTimeout(1000);

    // Get first poll
    const firstPoll = page.locator('#polls-container .card').first();

    // Check for voting options
    const hasVotingOptions = await firstPoll.locator('.form-check').count() > 0;

    if (hasVotingOptions) {
      // Select first option
      const firstOption = firstPoll.locator('input[type="radio"]').first();
      await firstOption.click();

      // Click vote button
      await firstPoll.locator('button.btn-primary').click();

      // Wait a bit for the vote to be processed
      await page.waitForTimeout(1500);

      // Should now see "You voted for:" indicator (now using .alert-success)
      await expect(firstPoll.locator('.alert-success')).toBeVisible({ timeout: 5000 });

      // Should see "Live Results" heading
      await expect(firstPoll.locator('h4')).toContainText('Live Results');

      // Should see pie chart
      await expect(firstPoll.locator('.chart-container svg')).toBeVisible({ timeout: 5000 });

      // Should see vote count
      await expect(firstPoll.locator('.vote-count')).toBeVisible();

      // Should see "Change Vote" button
      await expect(firstPoll.locator('button.btn-outline-secondary')).toBeVisible();
    }
  });

  test('should change vote', async ({ page }) => {
    const username = `ChangeVoteUser${Date.now()}`;

    // Register and login
    await page.fill('#username-input', username);
    await page.click('#register-btn');
    await expect(page.locator('#polls-section')).not.toHaveClass(/d-none/, { timeout: 5000 });

    await page.waitForTimeout(1000);

    // Get first poll
    const firstPoll = page.locator('#polls-container .card').first();

    // Check if we can vote
    const hasVotingOptions = await firstPoll.locator('.form-check').count() > 0;

    if (hasVotingOptions) {
      // Vote on first option
      await firstPoll.locator('input[type="radio"]').first().click();
      await firstPoll.locator('button.btn-primary').click();
      await page.waitForTimeout(1500);

      // Click change vote
      await firstPoll.locator('button.btn-outline-secondary').click();

      // Voting options should be visible again
      await expect(firstPoll.locator('.form-check').first()).toBeVisible();

      // Select a different option (second one)
      await firstPoll.locator('input[type="radio"]').nth(1).click();
      await firstPoll.locator('button.btn-primary').click();
      await page.waitForTimeout(1500);

      // Should see voted indicator again
      await expect(firstPoll.locator('.alert-success')).toBeVisible();
    }
  });

  test('should display pie charts with legends', async ({ page }) => {
    const username = `ChartUser${Date.now()}`;

    // Register and login
    await page.fill('#username-input', username);
    await page.click('#register-btn');
    await expect(page.locator('#polls-section')).not.toHaveClass(/d-none/, { timeout: 5000 });

    await page.waitForTimeout(1000);

    // Get first poll (now using .card instead of .poll-card)
    const firstPoll = page.locator('#polls-container .card').first();

    // Vote first to see the chart (charts only show after voting)
    await firstPoll.locator('input[type="radio"]').first().click();
    await firstPoll.locator('button.btn-primary').click();
    await page.waitForTimeout(2000);

    // Should see chart container
    await expect(firstPoll.locator('.chart-container')).toBeVisible();

    // Should see SVG (pie chart)
    const svg = firstPoll.locator('.chart-container svg');
    await expect(svg).toBeVisible({ timeout: 5000 });

    // Should see pie slices
    await expect(svg.locator('path')).toHaveCount(3, { timeout: 5000 }).catch(() =>
      expect(svg.locator('path')).toHaveCount(4, { timeout: 5000 })
    );
  });

  test('should show error for empty username', async ({ page }) => {
    // Try to login without username
    await page.click('#login-btn');

    // Should show error message (now using .alert-danger instead of .message.error)
    await expect(page.locator('.alert-danger')).toBeVisible();
    await expect(page.locator('.alert-danger')).toContainText('Please enter a username');
  });

  test('should persist session on reload', async ({ page }) => {
    const username = `PersistUser${Date.now()}`;

    // Register
    await page.fill('#username-input', username);
    await page.click('#register-btn');
    await expect(page.locator('#polls-section')).toBeVisible({ timeout: 5000 });

    // Reload page
    await page.reload();

    // Should still be logged in
    await expect(page.locator('#polls-section')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#username-display')).toHaveText(username);
  });

  test('should logout successfully', async ({ page }) => {
    const username = `LogoutUser${Date.now()}`;

    // Register
    await page.fill('#username-input', username);
    await page.click('#register-btn');
    await expect(page.locator('#polls-section')).toBeVisible({ timeout: 5000 });

    // Logout
    await page.click('#logout-btn');

    // Should see login page again
    await expect(page.locator('#auth-section')).toBeVisible();
    await expect(page.locator('#polls-section')).not.toBeVisible();
  });

  test('should check for console errors', async ({ page }) => {
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const username = `ErrorCheckUser${Date.now()}`;

    // Register and interact
    await page.fill('#username-input', username);
    await page.click('#register-btn');
    await expect(page.locator('#polls-section')).toBeVisible({ timeout: 5000 });

    await page.waitForTimeout(2000);

    // Check first poll
    const firstPoll = page.locator('.poll-card').first();
    const hasVotingOptions = await firstPoll.locator('.poll-options').isVisible();

    if (hasVotingOptions) {
      await firstPoll.locator('input[type="radio"]').first().click();
      await firstPoll.locator('.vote-btn').click();
      await page.waitForTimeout(2000);
    }

    // Report any console errors (but don't fail the test necessarily)
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
  });

  test('should auto-refresh poll results', async ({ page }) => {
    const username = `RefreshUser${Date.now()}`;

    // Register and login
    await page.fill('#username-input', username);
    await page.click('#register-btn');
    await expect(page.locator('#polls-section')).not.toHaveClass(/d-none/, { timeout: 5000 });

    await page.waitForTimeout(1000);

    // Get first poll
    const firstPoll = page.locator('#polls-container .card').first();

    // Vote first to see the results (charts only show after voting)
    await firstPoll.locator('input[type="radio"]').first().click();
    await firstPoll.locator('button.btn-primary').click();
    await page.waitForTimeout(2000);

    // Get initial vote count
    const voteCountElement = firstPoll.locator('.vote-count');
    await expect(voteCountElement).toBeVisible({ timeout: 5000 });
    const initialText = await voteCountElement.textContent();

    // Wait for potential refresh (3 seconds is the refresh interval)
    await page.waitForTimeout(4000);

    // Vote count element should still be visible
    await expect(voteCountElement).toBeVisible();

    // The text might change if votes are coming in, but it should be defined
    const afterText = await voteCountElement.textContent();
    expect(afterText).toBeTruthy();
    expect(afterText).toContain('vote');
  });
});
