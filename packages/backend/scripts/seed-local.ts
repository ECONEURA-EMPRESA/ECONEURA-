import { PrismaClient } from '@prisma/client';
import { logger } from '../src/shared/logger';

const prisma = new PrismaClient();

async function main() {
    logger.info('🌱 Starting local database seed...');

    try {
        // 1. Create Tenant
        const tenant = await prisma.tenant.upsert({
            where: { id: 'default-tenant' },
            update: {},
            create: {
                id: 'default-tenant',
                name: 'ECONEURA Local',
                plan: 'ENTERPRISE',
                status: 'ACTIVE'
            }
        });
        logger.info(`✅ Tenant created: ${tenant.name}`);

        // 2. Create User
        const user = await prisma.user.upsert({
            where: { email: 'admin@econeura.com' },
            update: {},
            create: {
                email: 'admin@econeura.com',
                name: 'Admin User',
                role: 'ADMIN',
                tenantId: tenant.id,
                passwordHash: 'mock-hash' // In local dev we might mock auth or use this
            }
        });
        logger.info(`✅ User created: ${user.email}`);

        // 3. Create Agents (Neuras)
        const agents = [
            { id: 'neura-sales', name: 'Neura Sales', type: 'SALES' },
            { id: 'neura-support', name: 'Neura Support', type: 'SUPPORT' },
            { id: 'neura-marketing', name: 'Neura Marketing', type: 'MARKETING' }
        ];

        for (const agent of agents) {
            await prisma.agent.upsert({
                where: { id: agent.id },
                update: {},
                create: {
                    id: agent.id,
                    name: agent.name,
                    type: agent.type,
                    tenantId: tenant.id,
                    status: 'ACTIVE',
                    config: {}
                }
            });
        }
        logger.info(`✅ ${agents.length} Agents created`);

    } catch (error) {
        logger.error('❌ Seed failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
