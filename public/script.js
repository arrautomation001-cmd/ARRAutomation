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


    // ======================================================
    // 9️⃣ AI BUG FORMATTER TOOL
    // ======================================================
    const formatBtn = document.getElementById('format-bug-btn');
    const bugInput = document.getElementById('ai-bug-input');
    const bugOutput = document.getElementById('ai-bug-output');
    const outputContainer = document.getElementById('ai-bug-output-container');
    const placeholder = document.getElementById('ai-bug-placeholder');
    const copyBtn = document.getElementById('copy-bug-btn');

    if (formatBtn && bugInput) {
        formatBtn.addEventListener('click', async () => {
            const note = bugInput.value.trim();

            if (note.length < 5) {
                alert('Please enter a more detailed testing note.');
                return;
            }

            // UI Loading state
            formatBtn.disabled = true;
            formatBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing with AI...';

            const result = await apiRequest('/api/format-bug', { note });

            if (result.success && result.bug) {
                const b = result.bug;

                // Build the structured HTML
                let html = `
                    <div style="margin-bottom: 1rem; border-bottom: 2px solid var(--color-emerald); padding-bottom: 0.5rem;">
                        <strong style="color: var(--color-navy); font-size: 1.1rem;">${b.title}</strong>
                        <span style="float: right; font-size: 0.75rem; background: ${getSeverityColor(b.severity)}; color: white; padding: 2px 8px; border-radius: 12px; font-weight: 600;">
                            ${b.severity}
                        </span>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong style="display: block; margin-bottom: 0.25rem;">Steps to Reproduce:</strong>
                        <ol style="margin: 0; padding-left: 1.25rem;">
                            ${b.steps.map(s => `<li style="margin-bottom: 0.25rem;">${s}</li>`).join('')}
                        </ol>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong>Expected Result:</strong>
                        <p style="margin: 0;">${b.expected}</p>
                    </div>
                    <div>
                        <strong>Actual Result:</strong>
                        <p style="margin: 0;">${b.actual}</p>
                    </div>
                `;

                bugOutput.innerHTML = html;

                // Switch UI visibility
                placeholder.style.display = 'none';
                outputContainer.style.display = 'block';

            } else {
                alert(result.message || 'AI formatting failed. Please check your API key.');
            }

            formatBtn.disabled = false;
            formatBtn.innerHTML = '<i class="fas fa-magic" style="margin-right: 0.5rem;"></i> Format with AI';
        });

        // Copy functionality
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const text = bugOutput.innerText;
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 2000);
                });
            });
        }
    }

    // Helper to color-code severity
    function getSeverityColor(sev) {
        const s = String(sev).toLowerCase();
        if (s.includes('critical')) return '#DC2626'; // Red
        if (s.includes('high')) return '#EA580C';     // Orange
        if (s.includes('medium')) return '#D97706';   // Yellow/Amber
        return '#059669';                             // Green
    }

});
