
import fetch from 'node-fetch';

async function debugChat() {
    const API_URL = 'http://localhost:3000/api';

    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@econeura.com', password: 'admin123' })
    });

    const loginData = await loginRes.json();
    if (!loginData.success) {
        console.error('Login failed:', loginData);
        return;
    }

    const token = loginData.token;
    console.log('Login successful. Token obtained.');

    // 2. Send Chat Message (Replicating useNeuraChat payload)
    const payload = {
        message: 'Hola, esto es una prueba de debug',
        agentId: 'a-ceo-01',
        // conversationId is undefined, so JSON.stringify removes it
    };

    console.log('Sending chat payload:', JSON.stringify(payload, null, 2));

    const chatRes = await fetch(`${API_URL}/neuras/NEURA-CEO/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Department': 'CEO'
        },
        body: JSON.stringify(payload)
    });

    console.log('Status:', chatRes.status);
    const chatData = await chatRes.json();
    console.log('Response:', JSON.stringify(chatData, null, 2));
}

debugChat().catch(console.error);
