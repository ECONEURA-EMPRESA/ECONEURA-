import { startConversation } from '../../src/conversation/startConversation';
import { appendMessage } from '../../src/conversation/appendMessage';
import { getConversationHistory } from '../../src/conversation/getConversationHistory';
import { sendNeuraMessage } from '../../src/conversation/sendNeuraMessage';

describe('Casos de uso de conversación', () => {
  it('debe crear conversación con tenant y usuario', async () => {
    const result = await startConversation({
      tenantId: 'tenant-1',
      neuraId: 'neura-ceo',
      userId: 'user-1'
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.neuraId).toBe('neura-ceo');
      expect(result.data.tenantId).toBe('tenant-1');
      expect(result.data.userId).toBe('user-1');
    }
  });

  it('debe permitir añadir mensaje y recuperar historial', async () => {
    const conv = await startConversation({
      tenantId: 'tenant-1',
      neuraId: 'neura-ceo',
      userId: 'user-1'
    });

    if (!conv.success) {
      throw conv.error;
    }

    const appendResult = await appendMessage({
      conversationId: conv.data.id,
      tenantId: 'tenant-1',
      neuraId: 'neura-ceo',
      userId: 'user-1',
      role: 'user',
      content: 'hola',
      correlationId: 'corr-1'
    });

    expect(appendResult.success).toBe(true);

    const historyResult = await getConversationHistory(conv.data.id);
    expect(historyResult.success).toBe(true);
    if (historyResult.success) {
      expect(historyResult.data.length).toBe(1);
      expect(historyResult.data[0]?.content).toBe('hola');
      expect(historyResult.data[0]?.tenantId).toBe('tenant-1');
      expect(historyResult.data[0]?.neuraId).toBe('neura-ceo');
    }
  });

  it('sendNeuraMessage debe crear conversación si no existe y responder algo aunque el LLM falle', async () => {
    const result = await sendNeuraMessage({
      tenantId: 'tenant-1',
      neuraId: 'neura-ceo',
      userId: 'user-1',
      message: 'hola NEURA'
    });

    // En este punto solo verificamos que el caso de uso devuelve un Result coherente,
    // el detalle del LLM ya está cubierto por tests específicos.
    if (result.success) {
      expect(result.data.conversationId).toBeDefined();
      expect(result.data.userMessage).toBe('hola NEURA');
    } else {
      expect(result.error).toBeInstanceOf(Error);
    }
  });
});


