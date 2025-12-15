
import { getPostgresPool, closePostgresPool } from '../src/infra/persistence/postgresPool';
import { getRedisClient, closeRedis } from '../src/infra/cache/redisClient';
import { validateEnv } from '../src/config/env';
import { logger } from '../src/shared/logger';

async function smokeTest() {
    console.log('🔍 Starting Automated Smoke Test...');

    try {
        // 1. Environment
        console.log('1️⃣  Validating Environment...');
        validateEnv();
        console.log('✅ Environment OK');

        // 2. PostgreSQL
        console.log('2️⃣  Testing Database Connection...');
        const pool = getPostgresPool();
        const dbStart = Date.now();
        await pool.query('SELECT NOW()');
        console.log(`✅ Database OK (${Date.now() - dbStart}ms)`);

        // 3. Redis
        console.log('3️⃣  Testing Redis Connection...');
        const redis = await getRedisClient();
        const redisStart = Date.now();
        await redis.set('smoke:test', 'alive', 'EX', 5);
        const val = await redis.get('smoke:test');

        if (val !== 'alive') {
            throw new Error('Redis read/write mismatch');
        }
        console.log(`✅ Redis OK (${Date.now() - redisStart}ms)`);

        console.log('\n✨ ALL SYSTEMS OPERATIONAL ✨');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ SMOKE TEST FAILED');
        if (error instanceof Error) {
            console.error(error.message);
            console.error(error.stack);
        } else {
            console.error(String(error));
        }

        // Attempt cleanup
        try {
            await closePostgresPool();
            await closeRedis();
        } catch (e) { /* ignore */ }

        process.exit(1);
    }
}

smokeTest();
