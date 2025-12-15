
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';
const NEURA_IDS = [
    'neura-ceo', 'neura-cto', 'neura-cfo', 'neura-cmo',
    'neura-ventas', 'neura-atencion-cliente', 'neura-rrhh',
    'neura-operaciones', 'neura-legal', 'neura-datos', 'neura-innovacion'
];

// 1x1 Transparent PNG Base64
const TEST_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

async function runTests() {
    console.log('🚀 Starting Comprehensive NEURA Verification...');

    // 1. Login
    console.log('\n🔑 Authenticating...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@econeura.com', password: 'admin123' })
    });

    const loginData = await loginRes.json();
    if (!loginData.success) {
        console.error('❌ Login failed:', loginData);
        return;
    }
    const token = loginData.token;
    console.log('✅ Login successful');

    const results = {};

    for (const neuraId of NEURA_IDS) {
        console.log(`\n🤖 Testing Agent: ${neuraId.toUpperCase()}`);
        results[neuraId] = { chat: false, memory: false, reasoning: false, vision: false };

        try {
            // TEST 1: Basic Chat & Reasoning
            // We ask a reasoning question directly to test both connectivity and intelligence
            const chatPayload = {
                message: "Si tengo 3 manzanas y me como 1, ¿cuántas me quedan? Responde solo con el número.",
                agentId: neuraId
            };

            const chatRes = await fetch(`${API_URL}/neuras/${neuraId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Department': 'TEST'
                },
                body: JSON.stringify(chatPayload)
            });

            const chatData = await chatRes.json();

            if (chatRes.ok && chatData.success) {
                results[neuraId].chat = true;
                const reply = chatData.neuraReply.trim();
                if (reply.includes('2')) {
                    results[neuraId].reasoning = true;
                    console.log('  ✅ Chat & Reasoning (Result: 2)');
                } else {
                    console.warn(`  ⚠️ Reasoning ambiguous: "${reply}"`);
                    results[neuraId].reasoning = 'ambiguous';
                }

                // TEST 2: Memory
                // We use the SAME conversationId to ask about the previous context
                const conversationId = chatData.conversationId;
                const memoryPayload = {
                    message: "¿De qué fruta estábamos hablando?",
                    agentId: neuraId,
                    conversationId: conversationId
                };

                const memoryRes = await fetch(`${API_URL}/neuras/${neuraId}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-Department': 'TEST'
                    },
                    body: JSON.stringify(memoryPayload)
                });

                const memoryData = await memoryRes.json();
                if (memoryRes.ok && memoryData.success) {
                    if (memoryData.neuraReply.toLowerCase().includes('manzana')) {
                        results[neuraId].memory = true;
                        console.log('  ✅ Memory (Context preserved)');
                    } else {
                        console.warn(`  ⚠️ Memory failed: "${memoryData.neuraReply}"`);
                    }
                }

                // TEST 3: Vision (Multimodal)
                // Sending an image
                const visionPayload = {
                    message: "Describe esta imagen brevemente.",
                    agentId: neuraId,
                    conversationId: conversationId,
                    image: TEST_IMAGE_BASE64
                };

                const visionRes = await fetch(`${API_URL}/neuras/${neuraId}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-Department': 'TEST'
                    },
                    body: JSON.stringify(visionPayload)
                });

                const visionData = await visionRes.json();
                if (visionRes.ok && visionData.success) {
                    results[neuraId].vision = true;
                    console.log('  ✅ Vision (Image processed)');
                } else {
                    console.error(`  ❌ Vision failed: ${JSON.stringify(visionData)}`);
                }

            } else {
                console.error(`  ❌ Chat failed: ${JSON.stringify(chatData)}`);
            }

        } catch (error) {
            console.error(`  ❌ Error testing ${neuraId}:`, error.message);
        }
    }

    console.log('\n📊 SUMMARY OF RESULTS:');
    console.table(results);
}

runTests().catch(console.error);
