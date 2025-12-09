// Run code after HTML is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 1️⃣ AUTO-DETECT BACKEND URL (Local or Render)
    // ======================================================
    // If running on localhost → use local backend
    // If running live website → use your Render backend
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const BASE_URL = isLocal
        ? 'http://localhost:3000'                           // Local development server
        : 'https://arrautomation-backend.onrender.com';     // Live deployed backend


    // ======================================================
    // 2️⃣ MOBILE MENU TOGGLE (For responsive navbar)
    // ======================================================
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            // Show/hide mobile menu
            navLinks.classList.toggle('active');

            // Change icon: bars <-> close
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


    // ======================================================
    // 3️⃣ UNIVERSAL API REQUEST HELPER
    // ======================================================
    // Instead of writing fetch() again and again,
    // we use one reusable function to call backend routes.
    const apiRequest = async (url, data) => {
        try {
            // If url does not start with http → attach BASE_URL
            const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)  // Backend receives JSON
            });

            return await response.json();   // Return backend response

        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };


    // ======================================================
    // 4️⃣ CONTACT FORM SUBMISSION
    // ======================================================
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();  // Stop page refresh

            const submitBtn = contactForm.querySelector('button');
            const originalText = submitBtn.innerText;

            // Disable button → avoid double clicks
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            // Form data collected from inputs
            const data = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim().toLowerCase(),
                phone: document.getElementById('phone').value.trim(),
                service: document.getElementById('service').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            // Send request to backend → /api/contact
            const result = await apiRequest('/api/contact', data);

            alert(result.message);  // Show backend response

            if (result.success) contactForm.reset();

            // Reset button
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        });
    }


    // ======================================================
    // 5️⃣ LOGIN / SIGNUP TAB SWITCHER (UI only)
    // ======================================================
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove "active" from all tabs & forms
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));

            // Activate clicked tab
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


    // ======================================================
    // 6️⃣ SIGNUP FORM LOGIC
    // ======================================================
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = signupForm.querySelector('button');
            submitBtn.innerText = 'Creating Account...';
            submitBtn.disabled = true;

            // Data from signup form
            const data = {
                name: document.getElementById('signup-name').value.trim(),
                mobile: document.getElementById('signup-mobile').value.trim(),
                email: document.getElementById('signup-email').value.trim().toLowerCase(),
                password: document.getElementById('signup-password').value
            };

            // Hit backend → /api/signup
            const result = await apiRequest('/api/signup', data);

            alert(result.message);

            if (result.success) {
                // Automatically switch to login tab
                document.querySelector('[data-tab="login"]').click();
                signupForm.reset();
            }

            submitBtn.innerText = 'Sign Up';
            submitBtn.disabled = false;
        });
    }


    // ======================================================
    // 7️⃣ LOGIN FORM LOGIC
    // ======================================================
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = loginForm.querySelector('button');
            submitBtn.innerText = 'Logging in...';
            submitBtn.disabled = true;

            // Data from login form
            const data = {
                email: document.getElementById('login-email').value.trim().toLowerCase(),
                password: document.getElementById('login-password').value
            };

            // Call backend → /api/login
            const result = await apiRequest('/api/login', data);

            alert(result.message);

            // If login successful → redirect home
            if (result.success) {
                window.location.href = 'index.html';
            }

            submitBtn.innerText = 'Login';
            submitBtn.disabled = false;
        });
    }


    // ======================================================
    // 8️⃣ PASSWORD SHOW/HIDE FEATURE
    // ======================================================
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = button.querySelector('i');

            // Toggle input type: password ↔ text
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
