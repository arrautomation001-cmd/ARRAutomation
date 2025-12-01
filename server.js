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
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public directory

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function to send email (Mock or Real)
const sendEmail = async (to, subject, text, html) => {
    const mailOptions = {
        from: `"ARRAutomation" <${process.env.EMAIL_USER}>`,
        to: to,
        cc: 'rohitverma0820@gmail.com', // Alternative email
        subject: subject,
        text: text,
        html: html
    };

    try {
        // NOTE: Since we don't have the password yet, we will just LOG the email.
        // Uncomment the line below when you have added the password.
        await transporter.sendMail(mailOptions);

        console.log('---------------------------------------------------');
        console.log(`[EMAIL SENT] To: ${to}`);
        console.log(`[CC] To: arounder263@gmail.com`);
        console.log(`[SUBJECT]: ${subject}`);
        console.log(`[CONTENT]: ${text}`);
        console.log('---------------------------------------------------');
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Routes

// 1. Login
app.post('/api/login', async (req, res) => {
    const { mobile, password } = req.body;

    if (!mobile || mobile.length !== 10 || !password) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    try {
        // Find user by mobile
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found.' });
        }

        // Check password (In production, use bcrypt to compare hashed passwords)
        if (user.password !== password) {
            return res.status(400).json({ success: false, message: 'Invalid password.' });
        }

        // Send Notification Email
        await sendEmail(
            'arounder263@gmail.com',
            'Login Notification - ARRAutomation',
            `User ${user.name} (${mobile}) logged in successfully.`,
            `<p>User <strong>${user.name}</strong> (${mobile}) logged in successfully.</p>`
        );

        res.json({ success: true, message: 'Login successful. Notification sent.' });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// 2. Signup
app.post('/api/signup', async (req, res) => {
    const { name, mobile, email, password } = req.body;

    if (!name || !mobile || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this mobile or email already exists.' });
        }

        // Create new user
        const newUser = new User({ name, mobile, email, password });
        await newUser.save();

        // 1. Send Welcome Email to User
        await sendEmail(
            email,
            'Welcome to ARRAutomation!',
            `Hi ${name},\n\nThank you for signing up. We are excited to have you on board.\n\nBest,\nARRAutomation`,
            `<h3>Hi ${name},</h3><p>Thank you for signing up. We are excited to have you on board.</p><p>Best,<br>ARRAutomation</p>`
        );

        // 2. Send Admin Notification
        await sendEmail(
            'arounder263@gmail.com',
            'New User Signup',
            `New user registered:\nName: ${name}\nMobile: ${mobile}\nEmail: ${email}`,
            `<p>New user registered:</p><ul><li>Name: ${name}</li><li>Mobile: ${mobile}</li><li>Email: ${email}</li></ul>`
        );

        res.json({ success: true, message: 'Account created successfully.' });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// 3. Contact
app.post('/api/contact', async (req, res) => {
    const { name, email, service, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Save to MongoDB
        const newContact = new Contact({
            name,
            email,
            phone: req.body.phone, // Assuming phone is passed in body
            service: service || 'General', // Default if missing
            message
        });
        await newContact.save();

        // Attempt to send emails (non-blocking)
        try {
            await sendEmail(
                'arounder263@gmail.com',
                `New Inquiry: ${service.toUpperCase()}`,
                `From: ${name} (${email})\n\nMessage:\n${message}`,
                `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Service:</strong> ${service}</p><p><strong>Message:</strong><br>${message}</p>`
            );

            // Auto-reply to user
            await sendEmail(
                email,
                'We received your message - ARRAutomation',
                `Hi ${name},\n\nThanks for reaching out. I'll get back to you within 24 hours.\n\nBest,\nArman`,
                `<p>Hi ${name},</p><p>Thanks for reaching out. I'll get back to you within 24 hours.</p><p>Best,<br>Arman</p>`
            );
        } catch (emailError) {
            console.error('⚠️ Email sending failed (but data saved):', emailError.message);
            // Continue execution to send success response
        }

        res.json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Contact Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to view the website.`);
});
