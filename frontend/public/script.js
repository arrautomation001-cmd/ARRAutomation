// =============================================
// ARRAutomation - Enhanced Frontend JavaScript
// Business-Ready with Interactive Features
// =============================================

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 1️⃣ AUTO-DETECT BACKEND URL (Local or Render)
    // ======================================================
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const BASE_URL = isLocal
        ? 'http://localhost:3000'
        : 'https://arrautomation-backend-1.onrender.com';

    // ======================================================
    // 2️⃣ SMOOTH SCROLL FOR ALL ANCHOR LINKS
    // ======================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ======================================================
    // 3️⃣ ENHANCED MOBILE MENU WITH SMOOTH ANIMATIONS
    // ======================================================
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            
            // Toggle icon
            if (isActive) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                body.style.overflow = 'hidden'; // Prevent scroll when menu open
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                body.style.overflow = ''; // Restore scroll
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                body.style.overflow = '';
            }
        });
    }

    // ======================================================
    // 4️⃣ PORTFOLIO FILTERS (Interactive Category Filtering)
    // ======================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    if (filterButtons.length > 0 && portfolioCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter cards with smooth animation
                portfolioCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // ======================================================
    // 5️⃣ SCROLL-TRIGGERED ANIMATIONS (Fade in on scroll)
    // ======================================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, observerOptions);

    // Elements to animate on scroll
    const animateElements = document.querySelectorAll('.card, .testimonial-card, .portfolio-card, .section-header');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add animation class
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // ======================================================
    // 6️⃣ ANIMATED COUNTERS FOR STATS
    // ======================================================
    const animateCounter = (element, target) => {
        const duration = 2000; // 2 seconds
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    };

    // Animate stat numbers when they come into view
    const statNumbers = document.querySelectorAll('.stat-number, .stat-value');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const value = target.textContent.replace(/\D/g, ''); // Extract numbers only
                if (value && !target.hasAttribute('data-animated')) {
                    target.setAttribute('data-animated', 'true');
                    animateCounter(target, parseInt(value));
                }
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => statObserver.observe(stat));

    // ======================================================
    // 7️⃣ FORM VALIDATION WITH REAL-TIME FEEDBACK
    // ======================================================
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhone = (phone) => {
        const re = /^[0-9]{10}$/;
        return re.test(phone.replace(/\D/g, ''));
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const showError = (input, message) => {
        const formGroup = input.closest('.form-group');
        let errorDiv = formGroup.querySelector('.error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = '#DC2626';
            errorDiv.style.fontSize = '0.875rem';
            errorDiv.style.marginTop = '0.25rem';
            formGroup.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        input.style.borderColor = '#DC2626';
    };

    const clearError = (input) => {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
        input.style.borderColor = '';
    };

    // Real-time validation for email inputs
    document.querySelectorAll('input[type="email"]').forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value && !validateEmail(input.value)) {
                showError(input, 'Please enter a valid email address');
            } else {
                clearError(input);
            }
        });
    });

    // Real-time validation for phone inputs
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value && !validatePhone(input.value)) {
                showError(input, 'Please enter a valid 10-digit mobile number');
            } else {
                clearError(input);
            }
        });
    });

    // Real-time validation for password inputs
    document.querySelectorAll('input[type="password"]').forEach(input => {
        input.addEventListener('input', () => {
            if (input.value && input.value.length < 8) {
                showError(input, 'Password must be at least 8 characters');
            } else {
                clearError(input);
            }
        });
    });

    // ======================================================
    // 8️⃣ UNIVERSAL API REQUEST HELPER
    // ======================================================
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

    // ======================================================
    // 9️⃣ LOGIN / SIGNUP TAB SWITCHER
    // ======================================================
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            
            const tabId = tab.getAttribute('data-tab');
            if (tabId === 'login') {
                document.getElementById('login-form').classList.add('active');
            } else {
                document.getElementById('signup-form').classList.add('active');
            }
        });
    });

    // ======================================================
    // 🔟 SIGNUP FORM WITH VALIDATION
    // ======================================================
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form data
            const name = document.getElementById('signup-name').value.trim();
            const mobile = document.getElementById('signup-mobile').value.trim();
            const email = document.getElementById('signup-email').value.trim().toLowerCase();
            const password = document.getElementById('signup-password').value;

            // Validation
            let isValid = true;

            if (!name || name.length < 2) {
                showError(document.getElementById('signup-name'), 'Name must be at least 2 characters');
                isValid = false;
            }

            if (!validatePhone(mobile)) {
                showError(document.getElementById('signup-mobile'), 'Please enter a valid 10-digit mobile number');
                isValid = false;
            }

            if (!validateEmail(email)) {
                showError(document.getElementById('signup-email'), 'Please enter a valid email address');
                isValid = false;
            }

            if (!validatePassword(password)) {
                showError(document.getElementById('signup-password'), 'Password must be at least 8 characters');
                isValid = false;
            }

            if (!isValid) return;

            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            submitBtn.disabled = true;

            const data = { name, mobile, email, password };
            const result = await apiRequest('/api/signup', data);

            if (result.success) {
                showToast('Account created successfully! Please login.', 'success');
                document.querySelector('[data-tab="login"]').click();
                signupForm.reset();
            } else {
                showToast(result.message || 'Signup failed. Please try again.', 'error');
            }

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }

    // ======================================================
    // 1️⃣1️⃣ LOGIN FORM WITH VALIDATION
    // ======================================================
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;

            // Validation
            let isValid = true;

            if (!validateEmail(email)) {
                showError(document.getElementById('login-email'), 'Please enter a valid email address');
                isValid = false;
            }

            if (!password) {
                showError(document.getElementById('login-password'), 'Password is required');
                isValid = false;
            }

            if (!isValid) return;

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;

            const data = { email, password };
            const result = await apiRequest('/api/login', data);

            if (result.success) {
                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showToast(result.message || 'Invalid credentials. Please try again.', 'error');
            }

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }

    // ======================================================
    // 1️⃣2️⃣ PASSWORD SHOW/HIDE TOGGLE
    // ======================================================
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

    // ======================================================
    // 1️⃣3️⃣ TOAST NOTIFICATION SYSTEM
    // ======================================================
    const showToast = (message, type = 'info') => {
        // Remove existing toasts
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 350px;
            font-weight: 500;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);

        // Add slide-in animation
        const keyframes = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = keyframes;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    // ======================================================
    // 1️⃣4️⃣ WHATSAPP CLICK TRACKING (Analytics)
    // ======================================================
    document.querySelectorAll('a[href*="whatsapp"], a[href*="wa.me"]').forEach(link => {
        link.addEventListener('click', () => {
            // Track with Google Analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'whatsapp_click', {
                    event_category: 'engagement',
                    event_label: window.location.pathname
                });
            }
            console.log('WhatsApp link clicked from:', window.location.pathname);
        });
    });

    // ======================================================
    // 1️⃣5️⃣ LAZY LOADING FOR IMAGES
    // ======================================================
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ======================================================
    // 1️⃣6️⃣ BACK TO TOP BUTTON
    // ======================================================
    const createBackToTop = () => {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        `;

        document.body.appendChild(button);

        // Show/hide on scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                button.style.opacity = '1';
                button.style.visibility = 'visible';
            } else {
                button.style.opacity = '0';
                button.style.visibility = 'hidden';
            }
        });

        // Scroll to top on click
        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    };

    createBackToTop();

    // ======================================================
    // 1️⃣7️⃣ CONSOLE BRANDING (Fun Easter Egg)
    // ======================================================
    console.log('%c🚀 ARRAutomation', 'font-size: 20px; font-weight: bold; color: #10b981;');
    console.log('%cWebsite built with care by ARRAutomation', 'font-size: 12px; color: #6B7280;');
    console.log('%cInterested in our services? Visit: https://arrautomation.com', 'font-size: 12px; color: #3b82f6;');

});

// ======================================================
// EXTERNAL: Service Worker Registration (PWA - Optional)
// ======================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('✅ Service Worker registered'))
            .catch(() => console.log('❌ Service Worker registration failed'));
    });
}