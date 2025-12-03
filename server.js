require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const Contact = require('./models/Contact');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // for now allow all origins (GitHub Pages + local)
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files locally

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper function to send email
const sendEmail = async (to, subject, text, html) => {
    const mailOptions = {
        from: `"ARRAutomation" <${process.env.EMAIL_USER}>`,
        to: to,
        cc: 'arrautomation001@gmail.com', // Admin CC
        subject: subject,
        text: text,
        html: html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('---------------------------------------------------');
        console.log(`[EMAIL SENT] To: ${to}`);
        console.log(`[CC] To: arrautomation001@gmail.com`);
        console.log(`[SUBJECT]: ${subject}`);
        console.log(`[CONTENT]: ${text}`);
        console.log('---------------------------------------------------');
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// ================= Routes ================= //

// 1. Signup
app.post('/api/signup', async (req, res) => {
    try {
        let { name, mobile, email, password } = req.body;

        if (!name || !mobile || !email || !password) {
            return res
                .status(400)
                .json({ success: false, message: 'All fields are required.' });
        }

        // Normalize inputs
        name = String(name).trim();
        mobile = String(mobile).trim();
        email = String(email).trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ mobile }, { email }],
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this mobile or email already exists.',
            });
        }

        // Create new user
        const newUser = new User({ name, mobile, email, password });
        await newUser.save();

        // Send response immediately
        res.json({ success: true, message: 'Account created successfully.' });

        // Send Emails in Background (non-blocking)
        // 1. Welcome Email to User
        sendEmail(
            email,
            'Welcome to ARRAutomation!',
            `Hi ${name},\n\nThank you for signing up. We are excited to have you on board.\n\nBest,\nARRAutomation`,
            `<h3>Hi ${name},</h3><p>Thank you for signing up. We are excited to have you on board.</p><p>Best,<br>ARRAutomation</p>`
        ).catch(err => console.error('Email Error (Signup User):', err));

        // 2. Admin Notification
        sendEmail(
            'arrautomation001@gmail.com',
            'New User Signup',
            `New user registered:\nName: ${name}\nMobile: ${mobile}\nEmail: ${email}`,
            `<p>New user registered:</p><ul><li>Name: ${name}</li><li>Mobile: ${mobile}</li><li>Email: ${email}</li></ul>`
        ).catch(err => console.error('Email Error (Signup Admin):', err));
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// 2. Login
app.post('/api/login', async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid credentials.' });
        }

        // Normalize email
        email = String(email).trim().toLowerCase();

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: 'User not found.' });
        }

        // Check password (In production, use bcrypt to compare hashed passwords)
        if (user.password !== password) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid password.' });
        }

        // Send Notification Email (Non-blocking)
        sendEmail(
            'arrautomation001@gmail.com',
            'Login Notification - ARRAutomation',
            `User ${user.name} (${email}) logged in successfully.`,
            `<p>User <strong>${user.name}</strong> (${email}) logged in successfully.</p>`
        ).catch(err => console.error('Email Error (Login):', err));

        res.json({ success: true, message: 'Login successful.' });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// 3. Contact
app.post('/api/contact', async (req, res) => {
    try {
        let { name, email, service, message, phone } = req.body;

        if (!name || !email || !message) {
            return res
                .status(400)
                .json({ success: false, message: 'All fields are required.' });
        }

        // Normalize
        name = String(name).trim();
        email = String(email).trim().toLowerCase();
        message = String(message).trim();
        phone = phone ? String(phone).trim() : '';
        service = service ? String(service).trim() : 'General';

        // Save to MongoDB
        const newContact = new Contact({
            name,
            email,
            phone,
            service,
            message,
        });
        await newContact.save();

        // Send response immediately
        res.json({ success: true, message: 'Message sent successfully.' });

        // Attempt to send emails (Non-blocking)
        // Admin mail
        sendEmail(
            'arounder263@gmail.com',
            `New Inquiry: ${service.toUpperCase()}`,
            `From: ${name} (${email})\nService: ${service}\n\nMessage:\n${message}`,
            `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Service:</strong> ${service}</p><p><strong>Message:</strong><br>${message}</p>`
        ).catch(err => console.error('Email Error (Contact Admin):', err));

        // Auto-reply to user
        sendEmail(
            email,
            'We received your message - ARRAutomation',
            `Hi ${name},\n\nThanks for reaching out. I'll get back to you within 24 hours.\n\nBest,\nArman`,
            `<p>Hi ${name},</p><p>Thanks for reaching out. I'll get back to you within 24 hours.</p><p>Best,<br>Arman</p>`
        ).catch(err => console.error('Email Error (Contact User):', err));
    } catch (error) {
        console.error('Contact Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
