import { defineConfig, devices } from '@playwright/test';

/**
 * ECONEURA - Playwright E2E Configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Test configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html'],
    ['list']
  ],

  // Shared settings
  use: {
    // Base URL
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',

    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Timeouts
    actionTimeout: 10 * 1000,
    navigationTimeout: 15 * 1000,
  },

  // Test projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Local dev server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

