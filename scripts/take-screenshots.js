const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const CHROMIUM_PATH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');

const routes = [
  // Public / Auth
  { path: '/', name: '01-landing-page', wait: 1000 },
  { path: '/login', name: '02-login', wait: 1000 },
  { path: '/register', name: '03-register', wait: 1000 },
  { path: '/forgot-password', name: '04-forgot-password', wait: 1000 },
  { path: '/reset-password', name: '05-reset-password', wait: 1000 },
  { path: '/select-profile', name: '06-select-profile', wait: 1500 },
  { path: '/onboarding/mentor', name: '07-onboarding-mentor', wait: 1500 },
  { path: '/onboarding/mentee', name: '08-onboarding-mentee', wait: 1500 },
  { path: '/welcome', name: '09-welcome', wait: 1500 },
  { path: '/this-page-does-not-exist', name: '10-404-page', wait: 1000 },

  // Dashboard (will redirect to login since no session, but captures the page state)
  { path: '/t/default/mentor', name: '11-dashboard-mentor', wait: 2000 },
  { path: '/t/default/mentee', name: '12-dashboard-mentee', wait: 2000 },
  { path: '/t/default/mentors', name: '13-mentor-search', wait: 2000 },
  { path: '/t/default/mentors/test-id', name: '14-mentor-profile', wait: 2000 },
  { path: '/t/default/confirm/test-id', name: '15-confirm-mentorship', wait: 2000 },
  { path: '/t/default/requests', name: '16-requests', wait: 2000 },
  { path: '/t/default/notifications', name: '17-notifications', wait: 2000 },
  { path: '/t/default/profile', name: '18-profile-settings', wait: 2000 },
  { path: '/t/default/library', name: '19-library', wait: 2000 },
  { path: '/t/default/library/test-id', name: '20-pdf-viewer', wait: 2000 },

  // Admin
  { path: '/t/default/admin/users', name: '21-admin-users', wait: 2000 },
  { path: '/t/default/admin/skills', name: '22-admin-skills', wait: 2000 },
  { path: '/t/default/admin/library', name: '23-admin-library', wait: 2000 },
  { path: '/t/default/admin/reports', name: '24-admin-reports', wait: 2000 },
  { path: '/t/default/admin/settings', name: '25-admin-settings', wait: 2000 },
];

async function takeScreenshots() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  // Mobile viewport (matching wireframes)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  // Desktop viewport
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const mobilePage = await mobileContext.newPage();
  const desktopPage = await desktopContext.newPage();

  for (const route of routes) {
    const url = `${BASE_URL}${route.path}`;
    console.log(`Capturing: ${route.name} (${url})`);

    try {
      // Mobile screenshot
      await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
      await mobilePage.waitForTimeout(route.wait);
      await mobilePage.screenshot({
        path: path.join(OUTPUT_DIR, `${route.name}-mobile.png`),
        fullPage: true,
      });

      // Desktop screenshot
      await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
      await desktopPage.waitForTimeout(route.wait);
      await desktopPage.screenshot({
        path: path.join(OUTPUT_DIR, `${route.name}-desktop.png`),
        fullPage: true,
      });

      console.log(`  ✓ ${route.name} captured`);
    } catch (err) {
      console.error(`  ✗ ${route.name} failed:`, err.message);
    }
  }

  await browser.close();
  console.log(`\nDone! ${routes.length} routes captured in ${OUTPUT_DIR}`);
}

takeScreenshots().catch(console.error);
