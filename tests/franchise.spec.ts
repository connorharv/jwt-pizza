import { test, expect } from 'playwright-test-coverage';
import {Page} from "@playwright/test";
import {Role, User} from "../src/service/pizzaService";

async function franchiseInit(page: Page) {
    let loggedInUser: User | undefined;
    const validUsers: Record<string, User> = { 'f@jwt.com': { id: '3', name: 'Kai Chen', email: 'f@jwt.com', password: 'franchisee', roles: [{ role: Role.Franchisee }] } };

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

    // Franchise Store
    await page.route('*/**/api/franchise/*', async (route) => {
        expect(route.request().method()).toBe('GET');
        const franchisesRes = [
            {
                "id": 5,
                "name": "SLC",
                "admins": [
                    {
                        "id": 3,
                        "name": "pizza franchisee",
                        "email": "f@jwt.com"
                    }
                ],
                "stores": [
                    {
                        "id": 2,
                        "name": "SLC",
                        "totalRevenue": 0
                    }
                ]
            }
        ];
        await route.fulfill({ json: franchisesRes });
    })

    // Create Store
    await page.route('*/**/api/franchise/*/store', async (route) => {
        expect(route.request().method()).toBe('POST');
        const newStoreRes = {"id":3,"franchiseId":5,"name":"Test"};
        await route.fulfill({ json: newStoreRes});
    })

    // Delete Store
    await page.route('*/**/api/franchise/*/store/*', async (route) => {
        expect(route.request().method()).toBe('DELETE');
        const delStoreRes = {"message":"store deleted"};
        await route.fulfill({ json: delStoreRes});
    })

    await page.goto('/');
}

test('Franchise Login', async ({ page }) => {
    await franchiseInit(page);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');
    await expect(page.getByRole('navigation', { name: 'Global' }).getByRole('link', { name: 'Franchise' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Global' }).getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByRole('main')).toContainText('SLCEverything you need to run an JWT Pizza franchise. Your gateway to success.NameRevenueActionSLC0 ₿ CloseCreate store');
});

test('Franchise Create Store', async ({ page }) => {
    await franchiseInit(page);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');
    await page.getByRole('navigation', { name: 'Global' }).getByRole('link', { name: 'Franchise' }).click();


    await page.getByRole('button', { name: 'Create store' }).click();
    await page.getByRole('textbox', { name: 'store name' }).click();
    await page.getByRole('textbox', { name: 'store name' }).click();
    await page.getByRole('textbox', { name: 'store name' }).fill('Test');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('main')).toContainText('Create store');
    await page.getByRole('button', { name: 'Create store' }).click();
    await expect(page.getByRole('main')).toContainText('Create storeCreateCancel');
    await page.getByRole('textbox', { name: 'store name' }).click();
    await page.getByRole('textbox', { name: 'store name' }).fill('Test');
    await page.getByRole('button', { name: 'Create' }).click();
});

test('Franchise Delete Store', async ({ page }) => {
    await franchiseInit(page);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');
    await page.getByRole('navigation', { name: 'Global' }).getByRole('link', { name: 'Franchise' }).click();


    await expect(page.locator('tbody')).toContainText('Close');
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('main')).toContainText('Sorry to see you goAre you sure you want to close the SLC store SLC ? This cannot be restored. All outstanding revenue will not be refunded.CloseCancel');
    await page.getByRole('button', { name: 'Close' }).click();
});



