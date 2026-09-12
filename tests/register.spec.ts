import { test, expect } from 'playwright-test-coverage';
import { Page } from "@playwright/test";
import { Role, User } from "../src/service/pizzaService";

async function basicInit(page: Page) {
    const registeredUser: User = {
        id: '4',
        name: 'Test test',
        email: 'test@jwt.com',
        password: 'test',
        roles: [{ role: Role.Diner }],
    };

    // Stub the register call. Update method/response as needed once wired up.
    await page.route('*/**/api/auth', async (route) => {
        const req = route.request().postDataJSON();
        expect(req.name).toBe('Test test');
        expect(req.email).toBe('test@jwt.com');
        expect(req.password).toBe('test');

        const registerRes = {
            user: registeredUser,
            token: 'abcdef',
        };
        expect(route.request().method()).toBe('POST');
        await route.fulfill({ json: registerRes });
    });

    // Return the currently logged in user after registration
    await page.route('*/**/api/user/me', async (route) => {
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: registeredUser });
    });

    await page.goto('/');
}

test('register', async ({ page }) => {
    await basicInit(page);

    await page.getByRole('link', { name: 'Register' }).click();

    await page.getByPlaceholder('Full name').fill('Test test');
    await page.getByPlaceholder('Email address').fill('test@jwt.com');
    await page.getByPlaceholder('Password').fill('test');

    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByRole('link', { name: 'TT' })).toBeVisible();
});