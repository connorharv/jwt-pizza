import base from './playwright.config.js';
import { defineConfig } from '@playwright/test';

// Debug config for stepping into the local Playwright source.
// Removes timeouts so time spent at a breakpoint does not fail the test.
export default defineConfig(base, {
  timeout: 0,
  expect: { timeout: 0 },
  workers: 1,
});
