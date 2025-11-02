# Vote E2E Tests

End-to-end tests for the Vote application using Playwright.

## Setup

```bash
cd /Users/chris/dev-vote/vote-e2e-tests
npm install
npx playwright install chromium
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run tests with UI mode
```bash
npm run test:ui
```

### View last test report
```bash
npm run test:report
```

## Prerequisites

- Vote application must be running on http://localhost:3005
- API must be accessible on http://localhost:8085
- Database must be running

You can start all services with:
```bash
cd /Users/chris/dev-vote
docker-compose up -d
```

## Test Coverage

The test suite covers:

1. **Authentication**
   - User registration
   - User login
   - Session persistence
   - Logout

2. **Voting Flow**
   - Viewing polls
   - Casting votes
   - Changing votes
   - Viewing results

3. **UI Elements**
   - Pie chart rendering
   - Legend display
   - Vote counts
   - Live results indicator

4. **Auto-refresh**
   - Poll results update every 3 seconds

5. **Error Handling**
   - Empty username validation
   - Console error detection

## Test Structure

- `playwright.config.js` - Playwright configuration
- `tests/vote-flow.spec.js` - Main test suite
- `test-results/` - Test execution results (created after running tests)
- `playwright-report/` - HTML report (created after running tests)

## CI/CD

Tests can be run in CI environments. The configuration automatically:
- Retries failed tests twice in CI
- Uses single worker in CI for stability
- Generates HTML reports
