document.addEventListener('DOMContentLoaded', () => {
    // ✅ Backend base URL (auto switch local vs live)
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const BASE_URL = isLocal
        ? 'http://localhost:3000'                           // local dev
        : 'https://arrautomation-backend.onrender.com';     // Render backend

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // ✅ Helper to handle API requests (now using BASE_URL)
    const apiRequest = async (url, data) => {
        try {
            const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Contact Form Validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            const data = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim().toLowerCase(),
                phone: document.getElementById('phone').value.trim(),
                service: document.getElementById('service').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            const result = await apiRequest('/api/contact', data);

            alert(result.message);
            if (result.success) contactForm.reset();

            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        });
    }

    // Auth Tabs Logic
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and forms
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Show corresponding form
            const tabId = tab.getAttribute('data-tab');
            if (tabId === 'login') {
                document.getElementById('login-form').classList.add('active');
            } else {
                document.getElementById('signup-form').classList.add('active');
            }
        });
    });

    // Signup Form Logic
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = signupForm.querySelector('button');
            submitBtn.innerText = 'Creating Account...';
            submitBtn.disabled = true;

            const data = {
                name: document.getElementById('signup-name').value.trim(),
                mobile: document.getElementById('signup-mobile').value.trim(),
                email: document.getElementById('signup-email').value.trim().toLowerCase(),
                password: document.getElementById('signup-password').value
            };

            const result = await apiRequest('/api/signup', data);

            alert(result.message);
            if (result.success) {
                document.querySelector('[data-tab="login"]').click();
                signupForm.reset();
            }

            submitBtn.innerText = 'Sign Up';
            submitBtn.disabled = false;
        });
    }

    // Login Form Logic
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector('button');
            submitBtn.innerText = 'Logging in...';
            submitBtn.disabled = true;

            const data = {
                email: document.getElementById('login-email').value.trim().toLowerCase(),
                password: document.getElementById('login-password').value
            };

            const result = await apiRequest('/api/login', data);

            alert(result.message);
            if (result.success) {
                window.location.href = 'index.html';
            }

            submitBtn.innerText = 'Login';
            submitBtn.disabled = false;
        });
    }

    // Password Toggle Functionality
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = button.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
});
