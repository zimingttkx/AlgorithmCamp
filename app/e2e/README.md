# E2E Testing Setup

This directory contains End-to-End (E2E) tests using Playwright.

## Prerequisites

- Node.js 18+
- Chrome browser installed on system (for system Chrome channel)

## Installation

Playwright is installed as a dev dependency. To install browsers:

```bash
npx playwright install chromium
```

If you encounter download issues, the test config is set up to use your system's Chrome installation.

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for debugging)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run specific browser project
```bash
npm run test:e2e:chromium
```

### Debug tests
```bash
npm run test:e2e:debug
```

## Test Structure

```
e2e/
├── login.spec.js      # Login/Register flow tests (17 tests)
├── practice.spec.js   # Practice page tests (20 tests)
└── progress.spec.js   # Progress sync tests (19 tests)
```

## Configuration

See `playwright.config.js` for:
- Test directory location (`./e2e`)
- Browser projects (Chromium using system Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`)
- Web server configuration (preview server on port 5174)
- Reporting options (HTML report, screenshots/videos on failure)

## Test Coverage

### Login/Register Flow (login.spec.js)
- Page rendering and element visibility
- Tab switching between login/register modes
- Form validation (username/password)
- Input field validation
- OAuth GitHub button presence
- Navigation and error handling

### Practice Page (practice.spec.js)
- Page rendering with map view
- Login button for unauthenticated users
- LeetCode username binding
- Sync indicator display
- Problem checkbox interaction
- Chapter navigation

### Progress Sync (progress.spec.js)
- Progress dashboard rendering
- Stats display (solved count, target, efficiency)
- Chapter progress visualization
- Data persistence in localStorage
- Sync status reflection

## Writing E2E Tests

Key principles:
1. Each test should be independent and isolated
2. Use `page.goto()` to navigate to the correct hash route
3. Use `waitForTimeout()` sparingly - prefer `waitForSelector()` or assertions
4. Clean up any state in `beforeEach` or test-specific cleanup

## Troubleshooting

### Chrome download fails
The config uses system Chrome by default. If tests fail to launch:
1. Ensure Chrome is installed at `C:\Program Files\Google\Chrome\Application\chrome.exe`
2. Or install Playwright's Chromium: `npx playwright install chromium`

### Tests timeout
Increase timeout in `playwright.config.js`:
```js
timeout: 60000, // 60 seconds
```

### Port conflicts
If port 5174 is in use, update the port in `playwright.config.js`:
```js
webServer: {
  command: 'npm run preview -- --port <NEW_PORT>',
  url: 'http://localhost:<NEW_PORT>/AlgorithmCamp',
  ...
}
```

### Need to run with backend server
Start the backend server before running E2E tests:
```bash
cd ../server
PORT=3001 JWT_SECRET=test-secret-key node index.js
```

### Network issues (proxy/vpn)
If running behind a proxy, you may need to configure no_proxy or disable the proxy temporarily for localhost connections.
