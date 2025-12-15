"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loggerAuditSink_1 = require("../../src/audit/infra/loggerAuditSink");
jest.mock('../../src/shared/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
    }
}));
describe('LoggerAuditSink', () => {
    it('debe registrar un evento de auditoría con loggerAuditSink', async () => {
        const sinkSpy = jest.spyOn(loggerAuditSink_1.loggerAuditSink, 'record');
        await (0, loggerAuditSink_1.recordAuditEvent)({
            action: 'automation.execute',
            actor: {
                userId: 'user-1',
                tenantId: 'tenant-1',
                roles: ['admin']
            },
            target: {
                type: 'automation-agent',
                id: 'ceo-agenda-consejo'
            },
            metadata: {
                provider: 'make',
                mode: 'mock'
            }
        });
        expect(sinkSpy).toHaveBeenCalledTimes(1);
    });
});
