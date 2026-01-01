// ==========================================
// Customer Support Chatbot JavaScript
// ==========================================

// Use current origin if connected to same server, otherwise fallback to localhost:3000 for dev separate running
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000' // Ensure port 3000 for local dev
    : window.location.origin; // Use relative path in production


class Chatbot {
    constructor() {
        this.conversationHistory = [];
        this.isOpen = false;
        this.isTyping = false;

        this.init();
    }

    init() {
        // Create chatbot HTML
        this.createChatbotHTML();

        // Attach event listeners
        this.attachEventListeners();

        // Show welcome message
        this.addBotMessage("Hi! 👋 I'm your ARRAutomation support assistant. How can I help you today?");
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <!-- Chatbot Toggle Button -->
            <button id="chatbot-toggle" aria-label="Open chat">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
            </button>

            <!-- Chatbot Container -->
            <div id="chatbot-container">
                <div id="chatbot-header">
                    <div>
                        <h3>Customer Support</h3>
                        <p>We typically reply instantly</p>
                    </div>
                    <button id="chatbot-close" aria-label="Close chat">&times;</button>
                </div>
                
                <div id="chatbot-messages"></div>
                
                <div id="chatbot-input-area">
                    <input 
                        type="text" 
                        id="chatbot-input" 
                        placeholder="Type your message..."
                        autocomplete="off"
                    />
                    <button id="chatbot-send" aria-label="Send message">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
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

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isTyping) {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        const container = document.getElementById('chatbot-container');
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            container.classList.add('active');
            document.getElementById('chatbot-input').focus();
        } else {
            container.classList.remove('active');
        }
    }

    addMessage(content, role) {
        const messagesDiv = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${role}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        messageDiv.appendChild(contentDiv);
        messagesDiv.appendChild(messageDiv);

        // Scroll to bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Add to conversation history
        this.conversationHistory.push({ role, content });
    }

    addBotMessage(content) {
        this.addMessage(content, 'bot');
    }

    addUserMessage(content) {
        this.addMessage(content, 'user');
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
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
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

        // Disable input while processing
        this.isTyping = true;
        input.disabled = true;
        sendBtn.disabled = true;

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await fetch(`${BASE_URL}/api/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: this.conversationHistory.slice(-10) // Last 10 messages for context
                }),
            });

            const data = await response.json();

            // Hide typing indicator
            this.hideTypingIndicator();

            if (data.success) {
                this.addBotMessage(data.response);
            } else {
                this.addBotMessage(data.message || 'Sorry, something went wrong. Please try again.');
            }

        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTypingIndicator();
            this.addBotMessage('Sorry, I\'m having trouble connecting. Please check your connection and try again.');
        } finally {
            // Re-enable input
            this.isTyping = false;
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Chatbot();
    });
} else {
    new Chatbot();
}
