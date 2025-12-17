const { test, expect } = require('@playwright/test');

test.describe('Home Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/index.html');
    });

    test('should have correct title', async ({ page }) => {
        await expect(page).toHaveTitle('ARRAutomation | QA & HR Automation Partner');
    });

    test('hero section should be visible', async ({ page }) => {
        const heroSection = page.locator('.hero');
        await expect(heroSection).toBeVisible();
    });

    test('hero image should be completely visible and loaded', async ({ page }) => {
        const heroImage = page.locator('.hero-image img');
        await expect(heroImage).toBeVisible();

        // Verify image is actually loaded by checking naturalWidth
        const naturalWidth = await heroImage.evaluate((img) => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
    });

    test('should have visible WhatsApp CTA', async ({ page }) => {
        const whatsappBtn = page.locator('a[href*="whatsapp.com"]');
        await expect(whatsappBtn).toBeVisible();
    });
});
