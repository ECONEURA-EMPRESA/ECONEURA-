
const Redis = require('ioredis');

console.log("Testing new Redis('undefined')");
try {
    new Redis('undefined');
} catch (e) {
    console.log("CAUGHT:", e.message);
}

console.log("Testing new Redis('null')");
try {
    new Redis('null');
} catch (e) {
    console.log("CAUGHT:", e.message);
}
