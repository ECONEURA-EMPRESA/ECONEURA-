
import { chatRoutes } from './src/api/http/routes/chatRoutes';
import { conversationRoutes } from './src/api/http/routes/conversationRoutes';
import { neuraChatRoutes } from './src/api/http/routes/neuraChatRoutes';
import { agentsRoutes } from './src/api/http/routes/agentsRoutes';
import { invokeRoutes } from './src/api/http/routes/invokeRoutes';
import { libraryRoutes } from './src/api/http/routes/libraryRoutes';
import { metricsRoutes } from './src/api/http/routes/metricsRoutes';
import { webhookRoutes } from './src/crm/api/webhookRoutes';
import { crmRoutes } from './src/crm/api/crmRoutes';
import { authRoutes } from './src/api/http/routes/authRoutes';
import { uploadRoutes } from './src/api/http/routes/uploadRoutes';

console.log('chatRoutes:', !!chatRoutes);
console.log('conversationRoutes:', !!conversationRoutes);
console.log('neuraChatRoutes:', !!neuraChatRoutes);
console.log('agentsRoutes:', !!agentsRoutes);
console.log('invokeRoutes:', !!invokeRoutes);
console.log('libraryRoutes:', !!libraryRoutes);
console.log('metricsRoutes:', !!metricsRoutes);
console.log('webhookRoutes:', !!webhookRoutes);
console.log('crmRoutes:', !!crmRoutes);
console.log('authRoutes:', !!authRoutes);
console.log('uploadRoutes:', !!uploadRoutes);
