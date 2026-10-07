import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await page.getByRole('link', { name: 'Login' }).click();
  await expect(page.getByRole('main')).toMatchAriaSnapshot(`
    - heading "Welcome back" [level=2]
    - text: Email address
    - textbox "Email address"
    - img
    - text: Password
    - textbox "Password"
    - button:
      - img
    - img
    - button "Login"
    - text: Are you new? Register instead.
    `);
  await page.getByRole('textbox', { name: 'Email address' }).click();+
  await page.getByRole('textbox', { name: 'Email address' }).fill('fake@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('fake');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('main')).toContainText('{"code":500,"message":"Failed to fetch"}');
});
