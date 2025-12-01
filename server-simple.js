const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Contact Form Route (No database, just logs)
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required.'
        });
    }

    // Log the contact form submission
    console.log('===== NEW CONTACT FORM SUBMISSION =====');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('Service:', service);
    console.log('Message:', message);
    console.log('=======================================');

    res.json({
        success: true,
        message: 'Message sent successfully! We\'ll get back to you within 24 hours.'
    });
});

// Login Route (Simple mock)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt:', email);

    res.json({
        success: true,
        message: 'Login successful!'
    });
});

// Signup Route (Simple mock)
app.post('/api/signup', async (req, res) => {
    const { name, mobile, email, password } = req.body;

    console.log('New signup:', { name, mobile, email });

    res.json({
        success: true,
        message: 'Account created successfully!'
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📱 Open http://localhost:${PORT}/contact.html in your browser`);
    console.log(`🛑 Press Ctrl+C to stop the server`);
});
