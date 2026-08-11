const { defineConfig } = require('@playwright/test');

const browserChannel = process.platform === 'win32' ? 'msedge' : undefined;
const externalBaseURL = process.env.PROJECT_PAGE_BASE_URL;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  use: {
    baseURL: externalBaseURL || 'http://127.0.0.1:8765',
    browserName: 'chromium',
    channel: browserChannel,
    screenshot: 'only-on-failure',
  },
  webServer: externalBaseURL ? undefined : {
    command: 'python -m http.server 8765 --bind 127.0.0.1',
    url: 'http://127.0.0.1:8765',
    reuseExistingServer: true,
  },
});
