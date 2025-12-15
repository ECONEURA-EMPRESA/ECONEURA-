import 'dotenv/config';
import { initDatabase } from '../src/infra/persistence/initDb';
import { logger } from '../src/shared/logger';

async function main() {
    try {
        logger.info('Initializing test database...');
        await initDatabase();
        logger.info('Test database initialized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to initialize test database:', error);
        logger.error('Failed to initialize test database', error as any);
        process.exit(1);
    }
}

main();
