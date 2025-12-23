// =============================================
// 1. Load Environment Variables (MongoDB, API keys)
// =============================================
require('dotenv').config();

// =============================================
// 2. Import All Required Modules
// =============================================
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Mongoose Models
const User = require('./models/User');
const Contact = require('./models/Contact');

// Email Sender (Resend-based function)
const sendEmail = require('./email');

// Gemini AI Setup
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;


// =============================================
// 3. Middleware Setup
// =============================================

// Allows frontend requests (CORS issue fix)
app.use(cors());

// Converts incoming JSON payloads
app.use(bodyParser.json());

// Serves static files from public folder
app.use(express.static(path.join(__dirname, 'public')));


// =============================================
// 4. Connect to MongoDB Database
// =============================================
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));


// =============================================
// 5. ROUTES START HERE
// =============================================


// =============================================
// 🔹 Route 1: User Signup
// =============================================
app.post('/api/signup', async (req, res) => {
    try {
        console.log('📩 Signup body:', req.body);

        // Extract fields from frontend
        let { name, mobile, email, password } = req.body;

        // Basic validation
        if (!name || !mobile || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Clean inputs
        name = String(name).trim();
        mobile = String(mobile).trim();
        email = String(email).trim().toLowerCase();

        // Check if user already exists (by email or mobile)
        const existingUser = await User.findOne({
            $or: [{ mobile }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this mobile or email already exists.',
            });
        }

        // Save new user in database
        const newUser = new User({ name, mobile, email, password });
        await newUser.save();
        console.log('✅ New user saved:', newUser._id);

        // Respond to frontend ASAP
        res.json({ success: true, message: 'Account created successfully.' });

        // Send Welcome Email (background)
        sendEmail(
            email,
            'Welcome to ARRAutomation!',
            `<h3>Hi ${name},</h3><p>Thank you for signing up.</p><p>Best,<br>ARRAutomation</p>`,
            `Hi ${name},\n\nThank you for signing up.\n\nBest,\nARRAutomation`
        ).catch(err => console.error('Email Error (Signup User):', err));

        // Send Admin Notification Email
        sendEmail(
            'arrautomation001@gmail.com',
            'New User Signup',
            `<p>New user registered:</p>
                <ul>
                    <li>Name: ${name}</li>
                    <li>Mobile: ${mobile}</li>
                    <li>Email: ${email}</li>
                </ul>`,
            `New user registered:\nName: ${name}\nMobile: ${mobile}\nEmail: ${email}`
        ).catch(err => console.error('Email Error (Signup Admin):', err));

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});


// =============================================
// 🔹 Route 2: User Login
// =============================================
app.post('/api/login', async (req, res) => {
    try {
        console.log('📩 Login body:', req.body);

        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }

        // Normalize email
        email = String(email).trim().toLowerCase();

        // Find user in database
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found.' });
        }

        // Password check (Plain text for now)
        if (user.password !== password) {
            return res.status(400).json({ success: false, message: 'Invalid password.' });
        }

        // Send admin login notification (background)
        sendEmail(
            'arrautomation001@gmail.com',
            'Login Notification - ARRAutomation',
            `<p>User <strong>${user.name}</strong> logged in.</p>`,
            `User ${user.name} logged in.`
        ).catch(err => console.error('Email Error (Login):', err));

        res.json({ success: true, message: 'Login successful.' });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});


// =============================================
// 🔹 Route 3: Contact Form
// =============================================
app.post('/api/contact', async (req, res) => {
    try {
        console.log('📩 Contact body:', req.body);

        let { name, email, service, message, phone } = req.body;

        // Required fields check
        if (!name || !email || !message) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Clean up
        name = String(name).trim();
        email = String(email).trim().toLowerCase();
        message = String(message).trim();
        phone = phone ? String(phone).trim() : '';
        service = service ? String(service).trim() : 'General';

        // Save message to database
        const newContact = new Contact({ name, email, phone, service, message });
        await newContact.save();
        console.log('✅ Contact saved:', newContact._id);

        // Respond immediately
        res.json({ success: true, message: 'Message sent successfully.' });

        // Admin email
        sendEmail(
            'arrautomation001@gmail.com',
            `New Inquiry: ${service.toUpperCase()}`,
            `<p><strong>From:</strong> ${name} (${email})</p>
             <p><strong>Service:</strong> ${service}</p>
             <p><strong>Message:</strong><br>${message}</p>`,
            `From: ${name} (${email})\nService: ${service}\n\nMessage:\n${message}`
        ).catch(err => console.error('Email Error (Contact Admin):', err));

        // Auto reply to user
        sendEmail(
            email,
            'We received your message - ARRAutomation',
            `<p>Hi ${name},</p><p>Thanks for reaching out. I’ll get back to you soon.</p><p>- Arman</p>`,
            `Hi ${name},\n\nThanks for reaching out.\n\n- Arman`
        ).catch(err => console.error('Email Error (Contact User):', err));

    } catch (error) {
        console.error('Contact Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});


// =============================================
// 🔹 Route 4: AI Bug Formatter
// =============================================
app.post('/api/format-bug', async (req, res) => {
    try {
        const { note } = req.body;

        if (!note || note.trim().length < 5) {
            return res.status(400).json({ success: false, message: 'Please provide a clearer testing note.' });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
            return res.status(500).json({ success: false, message: 'AI service is currently not configured. Please contact the administrator.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a professional Senior QA Engineer. 
            I will provide you with a messy, informal testing note about a bug. 
            Your task is to convert it into a highly professional, structured bug report.

            Please return your response as a valid JSON object with the following fields:
            1. title: A concise, professional title for the bug.
            2. steps: An array of steps to reproduce the bug.
            3. expected: What was supposed to happen.
            4. actual: What actually happened.
            5. severity: Suggest a severity (Low, Medium, High, Critical).

            Testing Note:
            "${note}"
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up the response text - sometimes Gemini returns it wrapped in ```json ... ```
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI failed to return valid JSON structure.');
        }

        const formattedBug = JSON.parse(jsonMatch[0]);
        res.json({ success: true, bug: formattedBug });

    } catch (error) {
        console.error('AI Bug Formatter Error:', error);
        res.status(500).json({ success: false, message: 'Failed to format bug with AI.' });
    }
});


// =============================================
// 🔹 Route 5: Serve sitemap.xml explicitly
// =============================================
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});


// =============================================
// 6. Start the Server
// =============================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
