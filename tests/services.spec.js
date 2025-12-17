const { test, expect } = require('@playwright/test');

test.describe('Services Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/services.html');
    });

    test('should have correct title', async ({ page }) => {
        await expect(page).toHaveTitle('Services | ARRAutomation');
    });

    test('hero section should be visible', async ({ page }) => {
        const heroSection = page.locator('.hero');
        await expect(heroSection).toBeVisible();
    });

    test('hero image should be completely visible and loaded', async ({ page }) => {
        const heroImage = page.locator('.hero-image img');
        await expect(heroImage).toBeVisible();

        // Wait for image to load
        await heroImage.evaluate(async (img) => {
            if (img.complete) return;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
        });

        // Verify image is actually loaded by checking naturalWidth
        const naturalWidth = await heroImage.evaluate((img) => img.naturalWidth);
        console.log(`Image naturalWidth: ${naturalWidth}`);
        expect(naturalWidth).toBeGreaterThan(0);
    });

    test('should have HR Automation section', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'HR Automation Services', exact: true })).toBeVisible();
    });

    test('should have QA Testing section', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'QA Testing Services' })).toBeVisible();
    });
});
