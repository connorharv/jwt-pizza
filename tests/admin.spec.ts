import { test, expect } from 'playwright-test-coverage';
import {Page} from "@playwright/test";
import {Role, User} from "../src/service/pizzaService";

async function adminInit(page: Page) {
    let loggedInUser: User | undefined;
    const validUsers: Record<string, User> = { 'a@jwt.com': { id: '3', name: 'Kai Chen', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] } };

    // Authorize login for the given user
    await page.route('*/**/api/auth', async (route) => {
        const loginReq = route.request().postDataJSON();
        const user = validUsers[loginReq.email];
        if (!user || user.password !== loginReq.password) {
            await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
            return;
        }
        loggedInUser = validUsers[loginReq.email];
        const loginRes = {
            user: loggedInUser,
            token: 'abcdef',
        };
        expect(route.request().method()).toBe('PUT');
        await route.fulfill({ json: loginRes });
    });

    // Return the currently logged in user
    await page.route('*/**/api/user/me', async (route) => {
        expect(route.request().method()).toBe('GET');
        await route.fulfill({ json: loggedInUser });
    });

    // Admin Franchise page
    await page.route('*/**/api/franchise?page=*&limit=*&name=*', async (route) => {
        expect(route.request().method()).toBe('GET');
        const adminRes = {
            "franchises": [
                {
                    "id": 1,
                    "name": "pizzaPocket",
                    "admins": [
                        {
                            "id": 3,
                            "name": "pizza franchisee",
                            "email": "f@jwt.com"
                        }
                    ],
                    "stores": [
                        {
                            "id": 1,
                            "name": "SLC",
                            "totalRevenue": 0
                        }
                    ]
                }
            ],
            "more": false
        }
        await route.fulfill({ json: adminRes })
    });

    // Admin Create Franchise
    await page.route('*/**/api/franchise', async (route) => {
        expect(route.request().method()).toBe('POST');
        const newFranchiseRes = {
            "stores": [],
            "id": 2,
            "name": "Example",
            "admins": [
                {
                    "email": "f@jwt.com",
                    "id": 3,
                    "name": "pizza franchisee"
                }
            ]
        }
        await route.fulfill({ json: newFranchiseRes })
    });

    // Admin Delete Franchise
    await page.route('*/**/api/franchise/2', async (route) => {
       expect(route.request().method()).toBe('DELETE');
       const deleteRes = {"message":"franchise deleted"};
       await route.fulfill({ json: deleteRes});
    });

    await page.goto('/');
}

test('Admin login', async ({ page }) => {
    await adminInit(page);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
});

test('Admin Create Franchise', async ({ page }) => {
    await adminInit(page);

    // log in
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('main')).toContainText('FranchisesFranchiseFranchiseeStoreRevenueActionpizzaPocketpizza franchisee CloseSLC0 ₿ CloseSubmit«»');
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).fill('Example');
    await page.getByRole('textbox', { name: 'franchise name' }).press('Tab');
    await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('f@jwt.com');
    await page.getByRole('button', { name: 'Create' }).click();
});

test('Admin Delete Franchise', async ({ page }) => {
    await adminInit(page);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');
    await page.getByRole('link', { name: 'Admin' }).click();


    await page.getByRole('row', { name: 'pizzaPocket pizza franchisee' }).getByRole('button').click();
    await expect(page.getByRole('main')).toContainText('Are you sure you want to close the pizzaPocket franchise? This will close all associated stores and cannot be restored. All outstanding revenue will not be refunded.CloseCancel');
    await page.getByRole('button', { name: 'Close' }).click();
});