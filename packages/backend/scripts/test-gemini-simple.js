
const GEMINI_API_KEY = '[REDACTED]';
const MODEL = 'gemini-1.5-pro';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

async function testGemini() {
    console.log('🚀 Iniciando prueba de Gemini 3 REST API (Simple JS)...');

    const payload = {
        contents: [{
            role: 'user',
            parts: [{ text: 'Hola, ¿estás activo? Responde brevemente.' }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
        }
    };

    try {
        console.log(`📡 Conectando a ${ENDPOINT.replace(GEMINI_API_KEY, 'HIDDEN')}...`);

        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Error HTTP: ${response.status} ${response.statusText}`);
            console.error('Detalle:', errorText);
            return;
        }

        const data = await response.json();
        // console.log('✅ ÉXITO! Respuesta recibida (Raw):', JSON.stringify(data, null, 2));

        if (data.candidates && data.candidates.length > 0) {
            if (data.candidates[0].content && data.candidates[0].content.parts) {
                const text = data.candidates[0].content.parts[0].text;
                console.log('🤖 NEURA:', text);
            } else {
                console.log('⚠️ Candidato sin contenido (posible filtro o thinking):', JSON.stringify(data.candidates[0], null, 2));
            }
        } else {
            console.log('⚠️ Respuesta vacía o estructura inesperada.');
        }

    } catch (error) {
        console.error('💥 Excepción:', error);
    }
}

testGemini();
