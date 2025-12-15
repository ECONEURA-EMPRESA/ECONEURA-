
const Redis = require('ioredis');
const { Pool } = require('pg');

console.log('--- Testing Redis ---');
try {
    new Redis('redis://localhost:invalidport');
} catch (e) {
    console.log('Redis bad port:', e.message);
}

try {
    new Redis('invalid-scheme://localhost');
} catch (e) {
    console.log('Redis bad scheme:', e.message);
}

try {
    new Redis('just-a-string');
} catch (e) {
    console.log('Redis string:', e.message);
}

console.log('--- Testing Pg ---');
try {
    const pool = new Pool({ connectionString: 'postgresql://user:pass@localhost:badport/db' });
    pool.connect().catch(e => console.log('Pg connect error:', e.message));
} catch (e) {
    console.log('Pg constructor error:', e.message);
}
