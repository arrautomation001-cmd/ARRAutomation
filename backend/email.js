// =============================================
// email.js — Unified Email Sender using Resend
// =============================================

// Import Resend SDK
const { Resend } = require('resend');

// Initialize Resend client using API KEY from .env
// If RESEND_API_KEY is missing → emails will fail
const resend = new Resend(process.env.RESEND_API_KEY);

console.log(
    '📧 email.js loaded — RESEND_API_KEY available?:',
    !!process.env.RESEND_API_KEY
);

/**
 * sendEmail()
 * A reusable email function for the entire project.
 *
 * @param {string|string[]} to   - Receives one email or an array of emails
 * @param {string} subject       - Email subject line
 * @param {string} html          - HTML formatted email body
 * @param {string} [text]        - Optional plain text version (fallback)
 *
 * Why both HTML and text?
 * Some inboxes read HTML, some read text.
 * Sending both increases inbox delivery (less spam).
 */
const sendEmail = async (to, subject, html, text = '') => {
    try {
        // ============================
        // SEND EMAIL THROUGH RESEND
        // ============================
        // Important: "from" MUST be from your VERIFIED domain
        // Otherwise: Resend will send but inbox may block OR spam it.
        const response = await resend.emails.send({
            from: 'ARRAutomation <no-reply@arrautomation.com>',
            // You can also use:
            // from: 'ARRAutomation <support@arrautomation.com>',
            // from: 'ARRAutomation <contact@arrautomation.com>',

            to,       // Email recipient(s)
            subject,  // Subject line
            html,     // HTML body
            text,     // Text fallback
        });

        console.log('📨 EMAIL SENT:', { to, subject, response });
        return true;

    } catch (error) {
        console.error('❌ EMAIL SEND ERROR:', error);
        return false;
    }
};

module.exports = sendEmail;
