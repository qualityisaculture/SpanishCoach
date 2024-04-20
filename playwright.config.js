const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const isCI = process.env.CI === 'true';

const config = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  testMatch: '**/*.playwright.ts',
  use: {
    trace: 'on-first-retry',
  },
  reporter: 'html',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'] },
    },
  ],
  ...(isCI && {
    use: {
      video: 'on',
      launchOptions: {
        slowMo: 500,
      },  
    }
  })
};

module.exports = config;
