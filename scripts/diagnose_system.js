
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

function log(color, message) {
    console.log(`${color}${message}${COLORS.reset}`);
}

async function checkPort(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
            resolve(true);
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

async function checkEndpoint(url, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve) => {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json', ...headers },
        };

        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, data: data });
            });
        });

        req.on('error', (e) => resolve({ status: 0, error: e.message }));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runDiagnostics() {
    log(COLORS.cyan, '==================================================');
    log(COLORS.cyan, '   ECONEURA AUTOMATED DIAGNOSTICS & REPAIR TOOL   ');
    log(COLORS.cyan, '==================================================');

    // 1. CHECK PORTS
    log(COLORS.yellow, '\n[1/5] Checking System Ports...');
    const backendAlive = await checkPort(3000);
    const frontendAlive = await checkPort(5173);

    if (backendAlive) log(COLORS.green, '  ✔ Backend (Port 3000): ONLINE');
    else log(COLORS.red, '  ✘ Backend (Port 3000): OFFLINE');

    if (frontendAlive) log(COLORS.green, '  ✔ Frontend (Port 5173): ONLINE');
    else log(COLORS.red, '  ✘ Frontend (Port 5173): OFFLINE');

    // 2. CHECK ENV VARS
    log(COLORS.yellow, '\n[2/5] Checking Environment Configuration...');
    const envPath = path.join(rootDir, 'packages/backend/.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const hasGemini = envContent.includes('GEMINI_API_KEY=AIza');
        const hasMemoryStore = envContent.includes('USE_MEMORY_STORE=true');

        if (hasGemini) log(COLORS.green, '  ✔ GEMINI_API_KEY: Configured');
        else log(COLORS.red, '  ✘ GEMINI_API_KEY: Missing or Invalid');

        if (hasMemoryStore) log(COLORS.green, '  ✔ USE_MEMORY_STORE: Enabled (Correct for Dev)');
        else log(COLORS.yellow, '  ⚠ USE_MEMORY_STORE: Disabled (Might need DB)');
    } else {
        log(COLORS.red, '  ✘ .env file not found in packages/backend');
    }

    // 3. CHECK API HEALTH
    if (backendAlive) {
        log(COLORS.yellow, '\n[3/5] Checking Critical API Endpoints...');

        // Check Health
        const health = await checkEndpoint('http://localhost:3000/health');
        if (health.status === 200) log(COLORS.green, '  ✔ /health: OK');
        else log(COLORS.red, `  ✘ /health: Failed (${health.status})`);

        // Check CRM Mock Data
        const crm = await checkEndpoint('http://localhost:3000/api/crm/sales-metrics?department=cmo&period=month', 'GET');
        if (crm.status === 200) log(COLORS.green, '  ✔ /api/crm/sales-metrics: OK (Mock Data Accessible)');
        else log(COLORS.red, `  ✘ /api/crm/sales-metrics: Failed (${crm.status}) - ${crm.data}`);

        // Check Chat (Mock/Gemini)
        const chat = await checkEndpoint('http://localhost:3000/api/neuras/NEURA-CEO/chat', 'POST', {
            message: 'System Check',
            userId: 'sys-admin'
        });
        if (chat.status === 200) log(COLORS.green, '  ✔ /api/neuras/:id/chat: OK');
        else log(COLORS.red, `  ✘ /api/neuras/:id/chat: Failed (${chat.status}) - ${chat.data}`);

        // Check Agents Route Alias
        // We expect 401 because we are not sending auth token, but if it's 404 it means route doesn't exist
        // Actually, let's try to hit it. If we get 401/403/200 it exists. If 404 it doesn't.
        const agents = await checkEndpoint('http://localhost:3000/api/neura-agents', 'GET');
        if (agents.status !== 404) log(COLORS.green, `  ✔ /api/neura-agents (Alias): Route Exists (Status ${agents.status})`);
        else log(COLORS.red, '  ✘ /api/neura-agents: Route Not Found (Alias Missing)');
    }

    // 4. FRONTEND CODE CHECK
    log(COLORS.yellow, '\n[4/5] Checking Frontend Critical Files...');
    const panelPath = path.join(rootDir, 'packages/frontend/src/components/CRMPremiumPanel.tsx');
    if (fs.existsSync(panelPath)) {
        const content = fs.readFileSync(panelPath, 'utf8');
        if (content.includes('<ResponsiveContainer')) {
            log(COLORS.red, '  ✘ CRMPremiumPanel.tsx: ResponsiveContainer still present (Causes width(-1) error)');
        } else {
            log(COLORS.green, '  ✔ CRMPremiumPanel.tsx: ResponsiveContainer removed (Fixed)');
        }
    } else {
        log(COLORS.red, '  ✘ CRMPremiumPanel.tsx: File not found');
    }

    log(COLORS.cyan, '\n==================================================');
    log(COLORS.cyan, '   DIAGNOSTICS COMPLETE   ');
    log(COLORS.cyan, '==================================================');
}

runDiagnostics().catch(console.error);
