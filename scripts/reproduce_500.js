
import http from 'http';

async function reproduce() {
    console.log('Attempting to hit /api/crm/sales-metrics...');

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/crm/leads?department=cmo',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Simulate frontend auth header if needed, but dev mode should bypass
            'Authorization': 'Bearer dev-token'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('BODY:', data);
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.end();
}

reproduce();
