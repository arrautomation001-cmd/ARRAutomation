const { test, expect } = require('@playwright/test');

test.describe('ARRAutomation Website', () => {
    test('should load the home page', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await expect(page).toHaveTitle(/ARRAutomation/);
        await expect(page.locator('h1')).toContainText('Automate HR');
    });

    test('should navigate to services page', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.click('text=Services');
        await expect(page).toHaveURL(/services.html/);
    });

    test('should show validation error on empty login', async ({ page }) => {
        await page.goto('http://localhost:3000/login.html');

        // Handle alert
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Invalid credentials');
            await dialog.dismiss();
        });

        await page.click('button:has-text("Login")');
    });

    test('should show validation error on empty contact form', async ({ page }) => {
        await page.goto('http://localhost:3000/contact.html');
        await page.waitForLoadState('networkidle');

        // Disable HTML5 validation to test server response
        await page.$eval('#contact-form', form => form.noValidate = true);

        // Handle alert
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('All fields are required');
            await dialog.dismiss();
        });

        await page.click('button:has-text("Send Message")');
    });

    test('should successfully submit contact form with all fields', async ({ page }) => {
        await page.goto('http://localhost:3000/contact.html');
        await page.waitForLoadState('networkidle');

        // Fill out all form fields
        await page.fill('#name', 'Test User');
        await page.fill('#email', 'testuser@example.com');
        await page.fill('#phone', '+91 9876543210');
        await page.selectOption('#service', 'qa');
        await page.fill('#message', 'This is an automated test message for QA testing services. We need help with automation testing for our web application.');

        // Handle success alert
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Message sent successfully');
            await dialog.accept();
        });

        // Submit the form
        await page.click('button:has-text("Send Message")');

        // Wait a bit for the form to be processed
        await page.waitForTimeout(1000);

        // Verify form is reset after successful submission
        await expect(page.locator('#name')).toHaveValue('');
        await expect(page.locator('#email')).toHaveValue('');
        await expect(page.locator('#phone')).toHaveValue('');
        await expect(page.locator('#message')).toHaveValue('');
    });
});
