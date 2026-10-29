/**
 * Automated Test Suite for AI Agent Backend Proxy (server.js)
 */
const http = require('http');
const assert = require('assert');
const { server } = require('../server.js');

const TEST_PORT = 3099;

function request(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, headers: res.headers, body: json });
                } catch(e) {
                    resolve({ status: res.statusCode, headers: res.headers, body });
                }
            });
        });
        req.on('error', reject);
        if (data) {
            req.write(typeof data === 'string' ? data : JSON.stringify(data));
        }
        req.end();
    });
}

(async () => {
    console.log('=== TEST SUITE: AI Agent Backend Proxy & NVIDIA Integration ===\n');

    server.listen(TEST_PORT, async () => {
        try {
            // 1. Health check
            console.log('--- 1. Testing GET /api/health ---');
            const health = await request({
                hostname: '127.0.0.1',
                port: TEST_PORT,
                path: '/api/health',
                method: 'GET'
            });
            assert.strictEqual(health.status, 200);
            assert.strictEqual(health.body.status, 'ok');
            assert.strictEqual(health.body.hasApiKey, true);
            assert.strictEqual(health.headers['access-control-allow-origin'], '*');
            console.log('✓ Health status 200, CORS enabled, API key detected:', health.body.hasApiKey);

            // 2. Deterministic calculations endpoint
            console.log('\n--- 2. Testing POST /api/calculate ---');
            const calcRes = await request({
                hostname: '127.0.0.1',
                port: TEST_PORT,
                path: '/api/calculate',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, {
                action: 'ledResistor',
                params: { vSupply: 5, vForward: 2.0, iLed: 0.02 }
            });
            assert.strictEqual(calcRes.status, 200);
            assert.strictEqual(calcRes.body.ok, true);
            assert.strictEqual(calcRes.body.result.rStandardE24, 150);
            console.log('✓ /api/calculate ledResistor: R =', calcRes.body.result.rStandardE24, 'Ω');

            // 3. Mock chat completion
            console.log('\n--- 3. Testing POST /api/chat (Mock Mode) ---');
            const mockRes = await request({
                hostname: '127.0.0.1',
                port: TEST_PORT,
                path: '/api/chat',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, {
                mock: true,
                messages: [{ role: 'user', content: 'Help me build a 5V LED circuit' }]
            });
            assert.strictEqual(mockRes.status, 200);
            assert.strictEqual(mockRes.body.ok, true);
            assert(mockRes.body.content.includes('WP7113ID'));
            assert(mockRes.body.proposal !== null, 'Proposal should be extracted from mock reply');
            assert.strictEqual(mockRes.body.proposal.components.length, 4);
            console.log('✓ Mock chat returned verified 5V LED design proposal with 4 components');

            // 4. Live NVIDIA chat completion
            console.log('\n--- 4. Testing POST /api/chat (Live NVIDIA API) ---');
            const liveRes = await request({
                hostname: '127.0.0.1',
                port: TEST_PORT,
                path: '/api/chat',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, {
                messages: [{ role: 'user', content: 'What is the absolute maximum collector current of a 2N2222A transistor? Answer briefly.' }]
            });
            assert.strictEqual(liveRes.status, 200);
            assert.strictEqual(liveRes.body.ok, true);
            console.log('✓ Live NVIDIA API responded:');
            console.log('  Model:', liveRes.body.model);
            console.log('  Content:', liveRes.body.content.trim().slice(0, 150) + '...');

            // 5. Invalid Request Handling
            console.log('\n--- 5. Testing Error Handling & Input Validation ---');
            const badRes = await request({
                hostname: '127.0.0.1',
                port: TEST_PORT,
                path: '/api/chat',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, { messages: [] });
            assert.strictEqual(badRes.status, 400);
            console.log('✓ Empty messages rejected with HTTP 400 Bad Request');

            console.log('\n===============================================================');
            console.log('🎉 ALL BACKEND SERVER TESTS PASSED!');
            console.log('===============================================================');
            server.close();
            process.exit(0);
        } catch (err) {
            console.error('❌ Test failed:', err);
            server.close();
            process.exit(1);
        }
    });
})();

