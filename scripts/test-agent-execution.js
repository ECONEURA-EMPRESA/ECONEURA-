
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';

async function testAgentExecution() {
    console.log('🚀 Testing Agent Execution (Function Calling)...');

    // 1. Login
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@econeura.com', password: 'admin123' })
    });
    const { token } = await loginRes.json();

    // 2. Ask CEO to consult Data
    // This prompt should trigger the 'execute_agent' tool
    const payload = {
        message: "Necesito saber el KPI actual de ventas. Por favor consulta al agente de Datos.",
        agentId: 'neura-ceo'
    };

    console.log('📤 Sending request to NEURA-CEO...');
    const chatRes = await fetch(`${API_URL}/neuras/neura-ceo/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Department': 'TEST'
        },
        body: JSON.stringify(payload)
    });

    const data = await chatRes.json();
    console.log('📥 Response received:');
    console.log(JSON.stringify(data, null, 2));

    if (data.neuraReply && (data.neuraReply.includes('Datos') || data.neuraReply.includes('KPI'))) {
        console.log('✅ Agent Execution likely successful (Context found in reply)');
    } else {
        console.warn('⚠️ Response might not include agent execution result. Check logs.');
    }
}

testAgentExecution().catch(console.error);
