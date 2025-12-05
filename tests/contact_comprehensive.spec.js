const { test, expect } = require('@playwright/test');

test.describe('Contact Form Comprehensive Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/contact.html');
        await page.waitForLoadState('networkidle');
    });

    test('should validate invalid email format', async ({ page }) => {
        // Fill form with invalid email
        await page.fill('#name', 'Test User');
        await page.fill('#email', 'invalid-email'); // No @ or domain
        await page.fill('#phone', '1234567890');
        await page.selectOption('#service', 'qa');
        await page.fill('#message', 'Test message');

        // Note: HTML5 validation might catch this if type="email"
        // We want to see if it submits or shows a browser validation error

        // Check if browser validation prevents submission
        const emailInput = page.locator('#email');
        const validationMessage = await emailInput.evaluate((element) => {
            return element.validationMessage;
        });

        if (validationMessage) {
            console.log('Browser validation caught invalid email:', validationMessage);
            expect(validationMessage).not.toBe('');
        } else {
            // If browser doesn't catch it (e.g. if we bypassed it or browser differs), check server response
            // But here we expect browser validation because type="email"
            await page.click('button:has-text("Send Message")');
            // If it submits, we might get a server error or success. 
            // Ideally server should also validate, but let's see.
        }
    });

    test('should accept or reject invalid phone number format', async ({ page }) => {
        await page.fill('#name', 'Test User');
        await page.fill('#email', 'test@example.com');
        await page.fill('#phone', 'not-a-number'); // Invalid phone
        await page.selectOption('#service', 'qa');
        await page.fill('#message', 'Test message');

        // Phone input is type="tel", which doesn't strictly validate numbers in all browsers by default
        // unless pattern attribute is used.

        let dialogMessage = '';
        page.on('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.dismiss();
        });

        await page.click('button:has-text("Send Message")');
        await page.waitForTimeout(1000);

        // If it submitted successfully, that might be an issue if we expect strict validation
        if (dialogMessage.includes('successfully')) {
            console.log('WARNING: Form submitted with invalid phone number: "not-a-number"');
        }
    });

    test('should handle extremely long message', async ({ page }) => {
        const longMessage = 'A'.repeat(5000);
        await page.fill('#name', 'Test User');
        await page.fill('#email', 'test@example.com');
        await page.fill('#phone', '1234567890');
        await page.selectOption('#service', 'qa');
        await page.fill('#message', longMessage);

        let dialogMessage = '';
        page.on('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.accept();
        });

        await page.click('button:has-text("Send Message")');
        await page.waitForTimeout(2000); // Wait longer for large payload

        if (dialogMessage.includes('successfully')) {
            console.log('Success: Form handled long message.');
        } else {
            console.log('Error/Warning: Form failed with long message:', dialogMessage);
        }
    });

    test('should check server-side email validation', async ({ page }) => {
        await page.goto('http://localhost:3000/contact.html');
        await page.waitForLoadState('networkidle');

        // Disable HTML5 validation
        await page.$eval('#contact-form', form => form.noValidate = true);

        await page.fill('#name', 'Test User');
        await page.fill('#email', 'invalid-email-no-at');
        await page.fill('#phone', '1234567890');
        await page.selectOption('#service', 'qa');
        await page.fill('#message', 'Test message');

        let dialogMessage = '';
        page.on('dialog', async dialog => {
            dialogMessage = dialog.message();
            await dialog.dismiss();
        });

        await page.click('button:has-text("Send Message")');
        await page.waitForTimeout(1000);

        if (dialogMessage.includes('successfully')) {
            console.log('CRITICAL: Server accepted invalid email: "invalid-email-no-at"');
        } else {
            console.log('Server correctly rejected invalid email or showed error:', dialogMessage);
        }
    });
});
