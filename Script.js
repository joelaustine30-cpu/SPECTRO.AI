(() => {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const chat = document.getElementById('chat');
    const status = document.getElementById('status');

    // Configure a same-origin backend by defining window.SPECTRO_CONFIG.apiEndpoint
    // before this file loads. Never put a private AI API key in browser code.
    const apiEndpoint = window.SPECTRO_CONFIG?.apiEndpoint;

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

    function demoReply(message) {
        const normalized = message.trim().toLowerCase();
        if (/^(hi|hello|hey)\b/.test(normalized)) {
            return 'Hello! I can respond in demo mode, but I am not connected to a live AI model yet.';
        }
        if (normalized.includes('help')) {
            return 'I’m ready to help. This demo currently confirms your messages locally. To get AI-generated answers, configure a secure backend endpoint as described in README.md.';
        }
        return `I received your message: “${message}”\n\nSTAR-X is currently in demo mode. Connect a backend AI endpoint to provide generated responses.`;
    }

    async function getReply(message) {
        if (!apiEndpoint) return demoReply(message);

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        if (!response.ok) {
            throw new Error(`The assistant service returned HTTP ${response.status}.`);
        }

        const data = await response.json();
        if (typeof data.reply !== 'string' || !data.reply.trim()) {
            throw new Error('The assistant service response must include a non-empty "reply" string.');
        }
        return data.reply;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        addMessage('user', message);
        input.value = '';
        input.disabled = true;
        sendButton.disabled = true;
        status.textContent = apiEndpoint ? 'STAR-X is thinking…' : 'Demo mode — connect an AI service to enable generated responses.';

        const pending = addMessage('ai', 'Thinking…');
        try {
            const reply = await getReply(message);
            pending.querySelector('p').textContent = reply;
            status.textContent = apiEndpoint ? 'Connected to the assistant service.' : 'Demo mode — connect an AI service to enable generated responses.';
        } catch (error) {
            pending.querySelector('p').textContent = 'Sorry, I could not get a response. Please try again.';
            status.textContent = error instanceof Error ? error.message : 'The assistant service could not be reached.';
        } finally {
            input.disabled = false;
            sendButton.disabled = false;
            input.focus();
            chat.scrollTop = chat.scrollHeight;
        }
    });
})();
