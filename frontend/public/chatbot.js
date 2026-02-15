// ==========================================
// ARRAutomation - Enhanced Customer Support Chatbot
// Business-Ready with Smart Features
// ==========================================

const CHATBOT_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://arrautomation-backend.onrender.com';

class Chatbot {
    constructor() {
        this.conversationHistory = [];
        this.isOpen = false;
        this.isTyping = false;
        this.unreadCount = 0;
        this.hasInteracted = false;

        this.init();
    }

    init() {
        // Create chatbot HTML
        this.createChatbotHTML();

        // Attach event listeners
        this.attachEventListeners();

        // Show welcome message after delay
        setTimeout(() => {
            this.addBotMessage("Hi! 👋 I'm your ARRAutomation support assistant. How can I help you today?");
            this.addQuickReplies([
                "Tell me about your services",
                "How much does it cost?",
                "Contact information"
            ]);
        }, 1000);

        // Show prompt after 10 seconds if no interaction
        setTimeout(() => {
            if (!this.hasInteracted && !this.isOpen) {
                this.showNotificationBadge();
            }
        }, 10000);
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <!-- Chatbot Toggle Button -->
            <button id="chatbot-toggle" aria-label="Open chat" title="Chat with us">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
                <span id="chatbot-badge" class="chatbot-badge hidden">1</span>
            </button>

            <!-- Chatbot Container -->
            <div id="chatbot-container">
                <div id="chatbot-header">
                    <div class="chatbot-header-info">
                        <div class="chatbot-avatar">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </div>
                        <div>
                            <h3>ARRAutomation Support</h3>
                            <p class="chatbot-status">
                                <span class="status-dot"></span>
                                Online - We reply instantly
                            </p>
                        </div>
                    </div>
                    <button id="chatbot-close" aria-label="Close chat" title="Close chat">&times;</button>
                </div>
                
                <div id="chatbot-messages"></div>
                
                <div id="chatbot-quick-replies" class="hidden"></div>
                
                <div id="chatbot-input-area">
                    <input 
                        type="text" 
                        id="chatbot-input" 
                        placeholder="Type your message..."
                        autocomplete="off"
                        maxlength="500"
                    />
                    <button id="chatbot-send" aria-label="Send message" title="Send message">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
                
                <div id="chatbot-footer">
                    <span>Powered by ARRAutomation AI</span>
                    <button id="chatbot-reset" title="Start new conversation">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    attachEventListeners() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.getElementById('chatbot-send');
        const resetBtn = document.getElementById('chatbot-reset');

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        resetBtn.addEventListener('click', () => this.resetConversation());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isTyping) {
                this.sendMessage();
            }
        });

        // Character counter
        input.addEventListener('input', () => {
            const count = input.value.length;
            if (count > 450) {
                input.style.borderColor = '#f59e0b';
            } else {
                input.style.borderColor = '';
            }
        });
    }

    toggleChat() {
        const container = document.getElementById('chatbot-container');
        const badge = document.getElementById('chatbot-badge');
        
        this.isOpen = !this.isOpen;
        this.hasInteracted = true;

        if (this.isOpen) {
            container.classList.add('active');
            document.getElementById('chatbot-input').focus();
            badge.classList.add('hidden');
            this.unreadCount = 0;
            
            // Track chat open event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'chatbot_opened', {
                    event_category: 'engagement',
                });
            }
        } else {
            container.classList.remove('active');
        }
    }

    showNotificationBadge() {
        const badge = document.getElementById('chatbot-badge');
        if (!this.isOpen) {
            badge.classList.remove('hidden');
            badge.textContent = '1';
            
            // Pulse animation
            const toggle = document.getElementById('chatbot-toggle');
            toggle.style.animation = 'pulse 2s infinite';
        }
    }

    addMessage(content, role, options = {}) {
        const messagesDiv = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${role}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Support for HTML content (links, formatting)
        if (options.isHTML) {
            contentDiv.innerHTML = this.sanitizeHTML(content);
        } else {
            contentDiv.textContent = content;
        }

        // Add timestamp
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.getTimeString();
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        messagesDiv.appendChild(messageDiv);

        // Smooth scroll to bottom
        messagesDiv.scrollTo({
            top: messagesDiv.scrollHeight,
            behavior: 'smooth'
        });

        // Add to conversation history
        this.conversationHistory.push({ role, content });

        // Show unread badge if chat is closed
        if (!this.isOpen && role === 'bot') {
            this.unreadCount++;
            const badge = document.getElementById('chatbot-badge');
            badge.textContent = this.unreadCount;
            badge.classList.remove('hidden');
        }
    }

    addBotMessage(content, options = {}) {
        this.addMessage(content, 'bot', options);
    }

    addUserMessage(content) {
        this.addMessage(content, 'user');
    }

    addQuickReplies(replies) {
        const quickRepliesDiv = document.getElementById('chatbot-quick-replies');
        quickRepliesDiv.innerHTML = '';
        quickRepliesDiv.classList.remove('hidden');

        replies.forEach(reply => {
            const button = document.createElement('button');
            button.className = 'quick-reply-btn';
            button.textContent = reply;
            button.addEventListener('click', () => {
                document.getElementById('chatbot-input').value = reply;
                this.sendMessage();
                quickRepliesDiv.classList.add('hidden');
            });
            quickRepliesDiv.appendChild(button);
        });
    }

    showTypingIndicator() {
        const messagesDiv = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot';
        typingDiv.id = 'typing-indicator';

        typingDiv.innerHTML = `
            <div class="message-content typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTo({
            top: messagesDiv.scrollHeight,
            behavior: 'smooth'
        });
    }

    hideTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.getElementById('chatbot-send');
        const message = input.value.trim();

        if (!message || this.isTyping) return;

        // Add user message
        this.addUserMessage(message);
        input.value = '';

        // Hide quick replies when user types
        document.getElementById('chatbot-quick-replies').classList.add('hidden');

        // Disable input while processing
        this.isTyping = true;
        input.disabled = true;
        sendBtn.disabled = true;

        // Show typing indicator
        this.showTypingIndicator();

        // Track message sent
        if (typeof gtag !== 'undefined') {
            gtag('event', 'chatbot_message_sent', {
                event_category: 'engagement',
            });
        }

        try {
            const response = await fetch(`${CHATBOT_BASE_URL}/api/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: this.conversationHistory.slice(-10) // Last 10 for context
                }),
            });

            // Hide typing indicator
            this.hideTypingIndicator();

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Check if response contains contact info and make it clickable
                let botResponse = data.response;
                const isHTML = this.containsContactInfo(botResponse);
                
                if (isHTML) {
                    botResponse = this.makeContactInfoClickable(botResponse);
                }
                
                this.addBotMessage(botResponse, { isHTML });

                // Show relevant quick replies based on response
                this.suggestQuickReplies(botResponse);

            } else {
                this.addBotMessage(data.message || 'Sorry, something went wrong. Please try again or contact us directly on WhatsApp.');
                this.addQuickReplies(["Contact on WhatsApp", "Try again"]);
            }

        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTypingIndicator();
            
            this.addBotMessage(
                "I'm having trouble connecting right now. 😔 But you can reach us directly:", 
                { isHTML: false }
            );
            
            this.addBotMessage(
                '📱 <a href="https://chat.whatsapp.com/Dwqh72hxsFN5CGbCUjvBie" target="_blank" style="color: #25D366; font-weight: 600;">Chat on WhatsApp</a><br>📧 <a href="mailto:arrautomation001@gmail.com" style="color: #10b981; font-weight: 600;">Email Us</a>',
                { isHTML: true }
            );

        } finally {
            // Re-enable input
            this.isTyping = false;
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    containsContactInfo(text) {
        const patterns = [
            /whatsapp/i,
            /\+\d{1,3}[-.\s]?\d{3,}/,
            /email/i,
            /@/,
            /contact/i
        ];
        return patterns.some(pattern => pattern.test(text));
    }

    makeContactInfoClickable(text) {
        // Make phone numbers clickable
        text = text.replace(/(\+\d{1,3}[-.\s]?\d{10})/g, '<a href="tel:$1" style="color: #10b981; font-weight: 600;">$1</a>');
        
        // Make email addresses clickable
        text = text.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, '<a href="mailto:$1" style="color: #10b981; font-weight: 600;">$1</a>');
        
        // Make WhatsApp mentions clickable
        text = text.replace(/(whatsapp)/gi, '<a href="https://chat.whatsapp.com/Dwqh72hxsFN5CGbCUjvBie" target="_blank" style="color: #25D366; font-weight: 600;">WhatsApp</a>');
        
        return text;
    }

    suggestQuickReplies(response) {
        const lowerResponse = response.toLowerCase();
        
        if (lowerResponse.includes('service') || lowerResponse.includes('offer')) {
            this.addQuickReplies([
                "Email Marketing services",
                "QA Testing services",
                "Show me pricing"
            ]);
        } else if (lowerResponse.includes('price') || lowerResponse.includes('cost')) {
            this.addQuickReplies([
                "Email Marketing price",
                "QA Testing price",
                "Get a quote"
            ]);
        } else if (lowerResponse.includes('contact')) {
            this.addQuickReplies([
                "Call me",
                "Email me",
                "WhatsApp"
            ]);
        }
    }

    resetConversation() {
        if (confirm('Start a new conversation? Current chat will be cleared.')) {
            const messagesDiv = document.getElementById('chatbot-messages');
            messagesDiv.innerHTML = '';
            this.conversationHistory = [];
            
            this.addBotMessage("Hi! 👋 Starting fresh. How can I help you today?");
            this.addQuickReplies([
                "Tell me about your services",
                "How much does it cost?",
                "Contact information"
            ]);

            // Track reset
            if (typeof gtag !== 'undefined') {
                gtag('event', 'chatbot_reset', {
                    event_category: 'engagement',
                });
            }
        }
    }

    sanitizeHTML(html) {
        // Basic HTML sanitization - allow only safe tags
        const allowedTags = ['a', 'br', 'strong', 'em', 'b', 'i'];
        const div = document.createElement('div');
        div.innerHTML = html;
        
        // Remove script tags and dangerous attributes
        const scripts = div.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        return div.innerHTML;
    }

    getTimeString() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chatbot = new Chatbot();
    });
} else {
    window.chatbot = new Chatbot();
}

// Add pulse animation for notification
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(style);