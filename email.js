// email.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
console.log('📧 email.js loaded — using Resend, RESEND_API_KEY present?:', !!process.env.RESEND_API_KEY);

/**
 * Unified Resend email sender
 * @param {string|string[]} to - email or list of emails
 * @param {string} subject
 * @param {string} html
 * @param {string} [text]
 */
const sendEmail = async (to, subject, html, text = '') => {
    try {
        await resend.emails.send({
            from: 'ARRAutomation <onboarding@resend.dev>',
            to,
            subject,
            html,
            text,
        });

        console.log('[EMAIL SENT]', { to, subject });
        return true;
    } catch (error) {
        console.error('Email Error (Resend):', error);
        return false;
    }
};

module.exports = sendEmail;
