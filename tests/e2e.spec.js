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
    });

    // ========================
    // Login/Signup Page Tests
    // ========================

    test('should load login page and display login form by default', async ({ page }) => {
        await page.goto('http://localhost:3000/login.html');
        await page.waitForLoadState('networkidle');

        // Verify login form is visible
        await expect(page.locator('#login-form')).toBeVisible();
        await expect(page.locator('#login-form')).toHaveClass(/active/);

        // Verify signup form is hidden
        await expect(page.locator('#signup-form')).not.toBeVisible();

        // Verify Login tab is active
        await expect(page.locator('.auth-tab[data-tab="login"]')).toHaveClass(/active/);
    });

    test('should switch between login and signup tabs', async ({ page }) => {
        await page.goto('http://localhost:3000/login.html');
        await page.waitForLoadState('networkidle');

        // Initially login form should be visible
        await expect(page.locator('#login-form')).toBeVisible();

        // Click on Sign Up tab
        await page.click('.auth-tab[data-tab="signup"]');
        await page.waitForTimeout(500);

        // Verify signup form is now visible and login is hidden
        await expect(page.locator('#signup-form')).toBeVisible();
        await expect(page.locator('#signup-form')).toHaveClass(/active/);
        await expect(page.locator('#login-form')).not.toBeVisible();

        // Verify Sign Up tab is active
        await expect(page.locator('.auth-tab[data-tab="signup"]')).toHaveClass(/active/);

        // Click back on Login tab
        await page.click('.auth-tab[data-tab="login"]');
        await page.waitForTimeout(500);

        // Verify login form is visible again
        await expect(page.locator('#login-form')).toBeVisible();
        await expect(page.locator('#signup-form')).not.toBeVisible();
    });

    test('should toggle password visibility on login form', async ({ page }) => {
        await page.goto('http://localhost:3000/login.html');
        await page.waitForLoadState('networkidle');

        const passwordInput = page.locator('#login-password');
        const toggleButton = page.locator('.toggle-password[data-target="login-password"]');

        // Initially password should be hidden
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // Click toggle button to show password
        await toggleButton.click();
        await page.waitForTimeout(200);
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Click again to hide password
        await toggleButton.click();
        await page.waitForTimeout(200);
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should toggle password visibility on signup form', async ({ page }) => {
        await page.goto('http://localhost:3000/login.html');
        await page.waitForLoadState('networkidle');

        // Switch to signup form
        await page.click('.auth-tab[data-tab="signup"]');
        await page.waitForTimeout(500);

        const passwordInput = page.locator('#signup-password');
        const toggleButton = page.locator('.toggle-password[data-target="signup-password"]');

        // Initially password should be hidden
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // Click toggle button to show password
        await toggleButton.click();
        await page.waitForTimeout(200);
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Click again to hide password
        await toggleButton.click();
        await page.waitForTimeout(200);
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should validate empty login form', async ({ page }) => {
        await page.goto('http://localhost:3000/login.html');
        await page.waitForLoadState('networkidle');

        // Disable HTML5 validation
        await page.$eval('#login-form', form => form.noValidate = true);

        // Handle alert
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Invalid credentials');
            await dialog.dismiss();
        });

        // Try to submit empty form
        await page.click('#login-form button[type="submit"]');
        await page.waitForTimeout(500);
    });

    test('should validate empty signup form', async ({ page }) => {
        await page.goto('http://localhost:3000/login.html');
        await page.waitForLoadState('networkidle');

        // Switch to signup form
        await page.click('.auth-tab[data-tab="signup"]');
        await page.waitForTimeout(500);

        // Disable HTML5 validation
        await page.$eval('#signup-form', form => form.noValidate = true);

        // Handle alert
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('All fields are required');
            await dialog.dismiss();
        });

        // Try to submit empty form
        await page.click('#signup-form button[type="submit"]');
        await page.waitForTimeout(500);
    });

    test('should successfully submit login form with valid credentials', async ({ page }) => {
        // First create a user to login with
        await page.goto('http://localhost:3000/login.html');
        await page.waitForLoadState('networkidle');

        // Switch to signup
        await page.click('.auth-tab[data-tab="signup"]');
        await page.waitForTimeout(500);

        // Register new user
        const uniqueId = Date.now();
        const email = `login_test_${uniqueId}@example.com`;
        const password = 'TestPassword123';

        await page.fill('#signup-name', 'Login Test User');
        await page.fill('#signup-mobile', `9${uniqueId.toString().slice(-9)}`);
        await page.fill('#signup-email', email);
        await page.fill('#signup-password', password);

        // Handle all dialogs
        page.on('dialog', async dialog => {
            const msg = dialog.message();
            console.log(`Dialog message: ${msg}`);
            if (msg.match(/Account created|Registration successful|Welcome/i)) {
                await dialog.accept();
            } else if (msg.match(/Login successful|Welcome/i)) {
                await dialog.accept();
            } else {
                await dialog.dismiss();
            }
        });

        await page.click('#signup-form button[type="submit"]');
        await page.waitForTimeout(1000);

        // Now Login with these credentials
        // (Form should have switched to login tab automatically)
        await expect(page.locator('#login-form')).toBeVisible();

        await page.fill('#login-email', email);
        await page.fill('#login-password', password);

        // Submit login form
        await page.click('#login-form button[type="submit"]');
        await page.waitForTimeout(1000);
    });

    test('should successfully submit signup form with valid data', async ({ page }) => {
        await page.goto('http://localhost:3000/login.html');
        await page.waitForLoadState('networkidle');

        // Switch to signup form
        await page.click('.auth-tab[data-tab="signup"]');
        await page.waitForTimeout(500);

        // Fill signup form
        const uniqueId = Date.now();
        await page.fill('#signup-name', 'Test User');
        await page.fill('#signup-mobile', `9${uniqueId.toString().slice(-9)}`);
        await page.fill('#signup-email', `user${uniqueId}@example.com`);
        await page.fill('#signup-password', 'SecurePass123');

        // Handle success alert
        page.on('dialog', async dialog => {
            expect(dialog.message()).toMatch(/Account created|Registration successful|Welcome/i);
            await dialog.accept();
        });

        // Submit form
        await page.click('#signup-form button[type="submit"]');
        await page.waitForTimeout(1000);
    });
});
