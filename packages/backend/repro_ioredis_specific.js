
const Redis = require('ioredis');

console.log('Testing redis://host:abc');
try {
    new Redis('redis://host:abc');
} catch (e) {
    console.log('CAUGHT:', e.message);
}

console.log('Testing redis://host:65536');
try {
    new Redis('redis://host:65536');
} catch (e) {
    console.log('CAUGHT:', e.message);
}
