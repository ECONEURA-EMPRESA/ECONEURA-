
const GEMINI_API_KEY = '[REDACTED]';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

async function listModels() {
    console.log('🔍 Listando modelos disponibles...');
    try {
        const response = await fetch(ENDPOINT);
        const data = await response.json();

        if (data.models) {
            console.log('✅ Modelos encontrados:');
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                }
            });
        } else {
            console.log('⚠️ No se encontraron modelos o error:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('💥 Error:', error);
    }
}

listModels();
