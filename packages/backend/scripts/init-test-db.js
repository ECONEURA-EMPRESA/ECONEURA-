"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const initDb_1 = require("../src/infra/persistence/initDb");
const logger_1 = require("../src/shared/logger");
async function main() {
    try {
        logger_1.logger.info('Initializing test database...');
        await (0, initDb_1.initDatabase)();
        logger_1.logger.info('Test database initialized successfully.');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize test database', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=init-test-db.js.map