// ============================================================================
// FLEXI-EV CHATBOT JAVASCRIPT - Interactive Functionality
// ============================================================================

class FlexiEVChatbot {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.analyticsVisible = false;
        
        // Initialize the chatbot
        this.init();
    }

    init() {
        // Bind event listeners
        this.bindEvents();
        
        // Load initial analytics data
        this.updateAnalytics();
        
        // Start periodic analytics updates
        setInterval(() => this.updateAnalytics(), 30000); // Update every 30 seconds
    }

    bindEvents() {
        // Input field event listeners
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.querySelector('.send-button');
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize chat container when analytics panel is toggled
        window.addEventListener('resize', () => this.adjustChatHeight());
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage(message, 'user');
        messageInput.value = '';

        // Show typing indicator and generate bot response
        this.showTypingIndicator();
        setTimeout(() => this.generateBotResponse(message), 1000 + Math.random() * 2000);
    }

    sendQuickMessage(message) {
        const messageInput = document.getElementById('messageInput');
        messageInput.value = message;
        this.sendMessage();
    }

    addMessage(content, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = this.createMessageElement(content, sender);
        
        chatMessages.appendChild(messageElement);
        this.scrollToBottom();
        
        // Store message in history
        this.messages.push({ content, sender, timestamp: new Date() });
    }

    createMessageElement(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <p>${content}</p>
                </div>
                <div class="message-time">${currentTime}</div>
            </div>
        `;
        
        return messageDiv;
    }

    showTypingIndicator() {
        this.isTyping = true;
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'none';
    }

    generateBotResponse(userMessage) {
        const response = this.getBotResponse(userMessage.toLowerCase());
        
        this.hideTypingIndicator();
        this.addMessage(response, 'bot');
    }

    getBotResponse(message) {
        // Battery-related responses
        if (message.includes('battery') || message.includes('charge level') || message.includes('power')) {
            const batteryLevel = Math.floor(Math.random() * 30) + 70; // 70-100%
            return `Your current battery level is ${batteryLevel}%. ${batteryLevel > 80 ? 'You have excellent range!' : batteryLevel > 60 ? 'Good charge level for city driving.' : 'Consider charging soon for optimal performance.'}`;
        }
        
        // Charging station responses
        if (message.includes('charging') || message.includes('station') || message.includes('charge')) {
            const nearbyStations = Math.floor(Math.random() * 15) + 5;
            return `I found ${nearbyStations} charging stations within 10km of your location. The nearest fast-charging station is 2.3km away at Green Valley Mall. Would you like me to navigate you there?`;
        }
        
        // Route planning responses
        if (message.includes('route') || message.includes('navigation') || message.includes('drive') || message.includes('trip')) {
            return `I can help you plan an optimal route considering your current battery level, charging stations, and traffic conditions. Where would you like to go? I'll calculate the most energy-efficient path.`;
        }
        
        // Energy consumption responses
        if (message.includes('energy') || message.includes('consumption') || message.includes('efficiency')) {
            const efficiency = (Math.random() * 2 + 4).toFixed(1); // 4.0-6.0 km/kWh
            return `Your current energy efficiency is ${efficiency} km/kWh. This is ${efficiency > 5 ? 'excellent' : efficiency > 4.5 ? 'good' : 'moderate'} efficiency. Tips: Use eco mode, moderate acceleration, and regenerative braking to improve efficiency.`;
        }
        
        // Range responses
        if (message.includes('range') || message.includes('distance') || message.includes('how far')) {
            const range = Math.floor(Math.random() * 100) + 200; // 200-300 km
            return `Based on your current battery level and driving conditions, you have approximately ${range}km of range remaining. This should be sufficient for most daily trips.`;
        }
        
        // Weather and driving conditions
        if (message.includes('weather') || message.includes('temperature') || message.includes('cold') || message.includes('hot')) {
            return `Current weather conditions may affect your EV's range. Cold weather can reduce range by 10-20%, while hot weather affects air conditioning usage. I recommend pre-conditioning your vehicle while plugged in.`;
        }
        
        // Maintenance responses
        if (message.includes('maintenance') || message.includes('service') || message.includes('check')) {
            return `Your Flexi-EV is performing well! Next scheduled maintenance is in 2,500km or 3 months. EVs require minimal maintenance compared to traditional vehicles. Remember to check tire pressure and brake fluid levels.`;
        }
        
        // Environmental impact
        if (message.includes('environment') || message.includes('co2') || message.includes('carbon') || message.includes('green')) {
            const co2Saved = Math.floor(Math.random() * 20) + 30; // 30-50 kg
            return `Great question! You've saved approximately ${co2Saved}kg of CO₂ emissions this month by driving electric. That's equivalent to planting ${Math.floor(co2Saved / 2)} trees! Keep up the eco-friendly driving!`;
        }
        
        // Cost savings
        if (message.includes('cost') || message.includes('save') || message.includes('money') || message.includes('price')) {
            const savings = Math.floor(Math.random() * 200) + 150; // $150-350
            return `You've saved approximately $${savings} this month on fuel costs compared to a similar gas vehicle. EVs typically cost 60-70% less to operate per kilometer. Plus, lower maintenance costs make it even more economical!`;
        }
        
        // General help
        if (message.includes('help') || message.includes('what can you do') || message.includes('assist')) {
            return `I can help you with:\n• Battery status and range estimation\n• Finding charging stations\n• Route planning and navigation\n• Energy consumption analysis\n• Vehicle maintenance reminders\n• Environmental impact tracking\n• Cost savings calculations\n\nWhat would you like to know more about?`;
        }
        
        // Greeting responses
        if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('good morning') || message.includes('good afternoon')) {
            return `Hello! I'm your Flexi-EV assistant. I'm here to help you get the most out of your electric vehicle experience. How can I assist you today?`;
        }
        
        // Default response
        const defaultResponses = [
            "I understand you're asking about your EV. Could you be more specific? I can help with battery status, charging, routes, or energy efficiency.",
            "That's an interesting question! I specialize in EV-related topics like charging, battery management, and route optimization. What would you like to know?",
            "I'm here to help with all things related to your Flexi-EV. Try asking about battery level, nearby charging stations, or energy consumption.",
            "Let me help you with that! I can provide information about your vehicle's performance, charging options, or driving efficiency. What specific area interests you?"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }

    toggleAnalytics() {
        const analyticsPanel = document.getElementById('analyticsPanel');
        this.analyticsVisible = !this.analyticsVisible;
        
        if (this.analyticsVisible) {
            analyticsPanel.classList.add('active');
            this.updateAnalytics();
        } else {
            analyticsPanel.classList.remove('active');
        }
        
        // Adjust chat height
        setTimeout(() => this.adjustChatHeight(), 300);
    }

    adjustChatHeight() {
        const chatContainer = document.getElementById('chatContainer');
        const analyticsPanel = document.getElementById('analyticsPanel');
        
        if (this.analyticsVisible) {
            const panelHeight = analyticsPanel.offsetHeight;
            chatContainer.style.maxHeight = `calc(100vh - ${panelHeight + 200}px)`;
        } else {
            chatContainer.style.maxHeight = '';
        }
    }

    updateAnalytics() {
        // Simulate real-time analytics updates
        const metrics = {
            battery: Math.floor(Math.random() * 30) + 70, // 70-100%
            range: Math.floor(Math.random() * 100) + 200, // 200-300 km
            stations: Math.floor(Math.random() * 20) + 5, // 5-25 stations
            co2Saved: (Math.random() * 20 + 30).toFixed(1) // 30-50 kg
        };

        // Update metric cards
        const metricCards = document.querySelectorAll('.metric-value');
        if (metricCards.length >= 4) {
            metricCards[0].textContent = `${metrics.battery}%`;
            metricCards[1].textContent = `${metrics.range} km`;
            metricCards[2].textContent = metrics.stations;
            metricCards[3].textContent = `${metrics.co2Saved} kg`;
        }

        // Update battery color based on level
        const batteryIcon = document.querySelector('.metric-card .fa-battery-three-quarters');
        if (batteryIcon) {
            if (metrics.battery > 80) {
                batteryIcon.style.color = '#8FD6C2';
            } else if (metrics.battery > 60) {
                batteryIcon.style.color = '#A8E0D1';
            } else if (metrics.battery > 40) {
                batteryIcon.style.color = '#f39c12';
            } else {
                batteryIcon.style.color = '#e74c3c';
            }
        }
    }

    toggleMenu() {
        // Mobile menu toggle functionality
        const quickActions = document.getElementById('quickActions');
        if (quickActions.style.display === 'none' || !quickActions.style.display) {
            quickActions.style.display = 'flex';
        } else {
            quickActions.style.display = 'none';
        }
    }
}

// Global functions for HTML onclick events
function sendMessage() {
    chatbot.sendMessage();
}

function sendQuickMessage(message) {
    chatbot.sendQuickMessage(message);
}

function toggleAnalytics() {
    chatbot.toggleAnalytics();
}

function toggleMenu() {
    chatbot.toggleMenu();
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Initialize the chatbot when the page loads
let chatbot;
document.addEventListener('DOMContentLoaded', () => {
    chatbot = new FlexiEVChatbot();
    
    // Add some initial demo messages after a short delay
    setTimeout(() => {
        chatbot.addMessage("Welcome to Flexi-EV! I'm your intelligent EV assistant. I can help you monitor your battery, find charging stations, plan efficient routes, and track your environmental impact. Try asking me about your current battery level!", 'bot');
    }, 1000);
});

// Service Worker for PWA functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
