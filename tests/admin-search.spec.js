import { test, expect } from '@playwright/test';

test('admin search should filter menu items', async ({ page }) => {

  // Open admin login
  await page.goto('http://localhost:5173/admin');

  // Fill credentials
  await page
    .getByRole('textbox', {
      name: 'Email or Phone'
    })
    .fill('1234567890');

  await page
    .getByRole('textbox', {
      name: 'Password'
    })
    .fill('varun123');

  // Login
  await page
    .getByRole('button', {
      name: 'Login'
    })
    .click();

  // Wait for dashboard
  await page.waitForURL(
    'http://localhost:5173/admin/dashboard/menu'
  );

  // Search
  const searchBox = page.getByRole(
    'textbox',
    {
      name: 'Search menu, orders,'
    }
  );

  await searchBox.fill('puri');

  // Verify search result appears
  await expect(
    page.getByText('puri')
  ).toBeVisible();
});