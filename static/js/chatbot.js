// Chatbot functionality for MakeMyRecipe

document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const chatbotContainer = document.querySelector('.chatbot-container');
    const closeChat = document.querySelector('.close-chatbot');
    const chatMessages = document.querySelector('.chatbot-messages');
    const messageInput = document.querySelector('.chatbot-input input');
    const sendButton = document.querySelector('.send-message');
    
    // Configure marked options for security and features
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            gfm: true, // GitHub flavored markdown
            breaks: true, // Convert \n to <br>
            sanitize: false, // Don't sanitize HTML (we'll use DOMPurify)
            smartLists: true, // Use smarter list behavior
            smartypants: true, // Use "smart" typographic punctuation
            highlight: function(code, lang) {
                return code; // Simple code highlighting (could be enhanced)
            }
        });
    }
    
    // Toggle chatbot visibility
    if (chatbotToggle && chatbotContainer) {
        chatbotToggle.addEventListener('click', function() {
            chatbotContainer.style.display = 'flex';
            chatbotToggle.style.display = 'none';
            
            // Add welcome message if it's the first time opening
            if (!chatMessages.querySelector('.message')) {
                addBotMessage("Hello! I'm your cooking assistant. Ask me anything about Indian recipes, cooking techniques, or ingredient substitutions.");
            }
            
            // Focus the input field
            if (messageInput) {
                messageInput.focus();
            }
        });
    }
    
    // Close chatbot
    if (closeChat && chatbotContainer && chatbotToggle) {
        closeChat.addEventListener('click', function() {
            chatbotContainer.style.display = 'none';
            chatbotToggle.style.display = 'flex';
        });
    }
    
    // Send message
    function sendMessage() {
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        addUserMessage(message);
        
        // Clear input
        messageInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send to backend
        fetch('/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add bot response
            if (data.error) {
                addBotMessage("I'm having trouble responding right now. Please try again later.");
            } else {
                addBotMessage(data.response);
            }
            
            // Scroll to bottom
            scrollToBottom();
        })
        .catch(error => {
            console.error('Error:', error);
            removeTypingIndicator();
            addBotMessage("Sorry, I couldn't process your request. Please try again.");
            scrollToBottom();
        });
    }
    
    // Send message on button click
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Send message on Enter key
    if (messageInput) {
        messageInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Add user message to chat
    function addUserMessage(text) {
        const message = document.createElement('div');
        message.className = 'message user-message';
        message.textContent = text;
        
        if (chatMessages) {
            chatMessages.appendChild(message);
            scrollToBottom();
        }
    }
    
    // Add bot message to chat
    function addBotMessage(text) {
        const message = document.createElement('div');
        message.className = 'message bot-message';
        
        // Process markdown formatting
        // First check if we need to include the required libraries
        if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
            // If the marked library isn't loaded yet, add it
            if (typeof marked === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
                document.head.appendChild(script);
            }
            
            // If DOMPurify isn't loaded, add it
            if (typeof DOMPurify === 'undefined') {
                const purifyScript = document.createElement('script');
                purifyScript.src = 'https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js';
                document.head.appendChild(purifyScript);
            }
            
            // Set the content after libraries load - need small delay
            setTimeout(function() {
                if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
                    // Parse markdown and sanitize HTML
                    message.innerHTML = DOMPurify.sanitize(marked.parse(text));
                } else {
                    // Fallback to text if libraries didn't load in time
                    message.textContent = text;
                }
            }, 500);
        } else {
            // If libraries are already loaded, use them directly
            message.innerHTML = DOMPurify.sanitize(marked.parse(text));
        }
        
        if (chatMessages) {
            chatMessages.appendChild(message);
            scrollToBottom();
        }
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typing = document.createElement('div');
        typing.className = 'message bot-message typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        
        if (chatMessages) {
            chatMessages.appendChild(typing);
            scrollToBottom();
        }
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typing = document.querySelector('.typing-indicator');
        if (typing) {
            typing.remove();
        }
    }
    
    // Scroll chat to bottom
    function scrollToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Add some predefined questions
    const suggestionQuestions = [
        "What can I make with potatoes and tomatoes?",
        "How do I make garam masala at home?",
        "What's a quick dinner recipe?",
        "How to make naan bread?"
    ];
    
    // Add suggestion chips
    function addSuggestionChips() {
        const suggestions = document.createElement('div');
        suggestions.className = 'suggestion-chips';
        
        suggestionQuestions.forEach(question => {
            const chip = document.createElement('div');
            chip.className = 'suggestion-chip';
            chip.textContent = question;
            chip.addEventListener('click', function() {
                messageInput.value = question;
                sendMessage();
            });
            
            suggestions.appendChild(chip);
        });
        
        if (chatMessages) {
            chatMessages.appendChild(suggestions);
        }
    }
    
    // Add the suggestion chips after welcome message
    if (chatMessages) {
        setTimeout(addSuggestionChips, 1000);
    }
});
