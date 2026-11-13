(() => {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const chat = document.getElementById('chat');
    const status = document.getElementById('status');
    const clearButton = document.getElementById('clearButton');
    const apiEndpoint = window.SPECTRO_CONFIG?.apiEndpoint || '/api/chat';
    const conversation = [];

    function addMessage(role, text) {
        const message = document.createElement('div');
        const label = document.createElement('strong');
        const body = document.createElement('p');
        message.className = `message ${role}`;
        label.textContent = role === 'user' ? 'You' : 'STAR-X';
        body.textContent = text;
        message.append(label, body);
        chat.append(message);
        chat.scrollTop = chat.scrollHeight;
        return message;
    }

    function showWelcome() {
        addMessage('ai', "Hello! I'm STAR-X. How can I help you today?");
    }

    async function getReply(message) {
        const history = conversation.slice(0, -1);
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || `Assistant request failed (HTTP ${response.status}).`);
        }
        if (typeof data.reply !== 'string' || !data.reply.trim()) {
            throw new Error('The assistant response was invalid. Please try again.');
        }
        return data.reply;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        addMessage('user', message);
        conversation.push({ role: 'user', content: message });
        input.value = '';
        input.disabled = true;
        sendButton.disabled = true;
        clearButton.disabled = true;
        status.textContent = 'STAR-X is thinking…';
        const pending = addMessage('ai', 'Thinking…');

        try {
            const reply = await getReply(message);
            pending.querySelector('p').textContent = reply;
            conversation.push({ role: 'assistant', content: reply });
            status.textContent = 'Connected to STAR-X.';
        } catch (error) {
            pending.remove();
            conversation.pop();
            status.textContent = error instanceof Error ? error.message : 'The assistant service could not be reached.';
        } finally {
            input.disabled = false;
            sendButton.disabled = false;
            clearButton.disabled = false;
            input.focus();
            chat.scrollTop = chat.scrollHeight;
        }
    });

    clearButton.addEventListener('click', () => {
        conversation.length = 0;
        chat.replaceChildren();
        showWelcome();
        status.textContent = 'Conversation cleared.';
        input.focus();
    });

    showWelcome();
})();
