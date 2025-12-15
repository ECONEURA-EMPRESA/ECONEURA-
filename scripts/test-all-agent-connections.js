
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';

// Test Scenarios
const SCENARIOS = [
    {
        from: 'neura-ceo',
        to: 'neura-datos',
        prompt: "Necesito saber el KPI actual de ventas. Consulta al agente de Datos.",
        expectedContext: ['Datos', 'KPI', 'ventas']
    },
    {
        from: 'neura-cto',
        to: 'neura-innovacion',
        prompt: "¿Qué tecnologías emergentes deberíamos adoptar? Consulta a Innovación.",
        expectedContext: ['Innovación', 'tecnologías', 'emergentes']
    },
    {
        from: 'neura-cfo',
        to: 'neura-ventas',
        prompt: "¿Cuál es la previsión de cierre para este trimestre? Consulta a Ventas.",
        expectedContext: ['Ventas', 'cierre', 'trimestre']
    },
    {
        from: 'neura-rrhh',
        to: 'neura-legal',
        prompt: "¿Es legal implementar jornadas de 4 días? Consulta a Legal.",
        expectedContext: ['Legal', 'jornada', '4 días']
    }
];

async function runConnectionTests() {
    console.log('🚀 Starting Automated Agent Connection Tests...');

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

    for (const scenario of SCENARIOS) {
        console.log(`\n🔗 Testing Connection: ${scenario.from.toUpperCase()} -> ${scenario.to.toUpperCase()}`);

        try {
            const payload = {
                message: scenario.prompt,
                agentId: scenario.from
            };

            const start = Date.now();
            const res = await fetch(`${API_URL}/neuras/${scenario.from}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Department': 'TEST'
                },
                body: JSON.stringify(payload)
            });
            const duration = Date.now() - start;

            const data = await res.json();

            if (res.ok && data.success) {
                const reply = data.neuraReply || '';
                console.log(`  ⏱️ Duration: ${duration}ms`);
                // console.log(`  📝 Reply: ${reply.substring(0, 100)}...`);

                // Check if reply contains expected context (indicating successful consultation)
                const hasContext = scenario.expectedContext.some(term => reply.toLowerCase().includes(term.toLowerCase()));

                if (hasContext) {
                    console.log('  ✅ Connection Successful (Context found)');
                    results[`${scenario.from}->${scenario.to}`] = 'PASS';
                } else {
                    console.warn('  ⚠️ Connection Ambiguous (Context missing)');
                    console.log(`     Full Reply: ${reply}`);
                    results[`${scenario.from}->${scenario.to}`] = 'AMBIGUOUS';
                }

            } else {
                console.error(`  ❌ Request Failed: ${JSON.stringify(data)}`);
                results[`${scenario.from}->${scenario.to}`] = 'FAIL';
            }

        } catch (error) {
            console.error(`  ❌ Error: ${error.message}`);
            results[`${scenario.from}->${scenario.to}`] = 'ERROR';
        }
    }

    console.log('\n📊 CONNECTION TEST SUMMARY:');
    console.table(results);
}

runConnectionTests().catch(console.error);
