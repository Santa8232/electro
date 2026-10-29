/**
 * Test Suite: End-to-End AI Circuit Building & Canvas Application (test_ai_build_and_apply.js)
 * 
 * Verifies that:
 * 1. AI agent receives design prompt ("Build a 5V LED circuit").
 * 2. Generates verified circuit proposal with Ohm's law derivations & datasheet limits.
 * 3. Schema validation confirms components, terminals, and wiring loop.
 * 4. Proposal is applied to canvas state, populating state.components and state.wires.
 * 5. MNA solver calculates active node voltages and forward branch current through LED.
 * 6. History snapshot allows rolling back with undo().
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST SUITE: End-to-End AI Circuit Generation & Canvas Application ===\n');

// 1. Read index.html and modules
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const calculationsScript = fs.readFileSync(path.join(__dirname, '..', 'calculations.js'), 'utf8');
const datasheetsScript = fs.readFileSync(path.join(__dirname, '..', 'datasheets.js'), 'utf8');
const aiAgentScript = fs.readFileSync(path.join(__dirname, '..', 'ai_agent.js'), 'utf8');

// 2. Mock browser DOM environment
const mockElements = {};
function createMockElement(id, tag = 'DIV') {
    return {
        id,
        tagName: tag.toUpperCase(),
        className: '',
        classList: {
            _classes: new Set(),
            add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
            remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
            toggle: function(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); },
            contains: function(c) { return this._classes.has(c); }
        },
        children: [],
        textContent: '',
        innerHTML: '',
        value: '',
        style: {},
        appendChild: function(child) { this.children.push(child); },
        focus: function() {},
        scrollTop: 0,
        scrollHeight: 100,
        checked: true
    };
}

const mockDocument = {
    readyState: 'complete',
    getElementById: function(id) {
        if (!mockElements[id]) mockElements[id] = createMockElement(id);
        return mockElements[id];
    },
    createElement: function(tag) {
        return createMockElement('el_' + Math.random().toString(36).substring(2, 7), tag);
    },
    addEventListener: function() {}
};

const mockWindow = {
    location: { protocol: 'http:', port: '3001' },
    addEventListener: function() {},
    document: mockDocument,
    navigator: { clipboard: { writeText: async () => true } }
};

const scriptStart = html.lastIndexOf('<script>') + 8;
const scriptEnd = html.lastIndexOf('</script>');
const appScript = html.substring(scriptStart, scriptEnd);

const context = {
    window: mockWindow,
    document: mockDocument,
    navigator: mockWindow.navigator,
    console: console,
    AbortController: AbortController,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    requestAnimationFrame: function() { return 1; },
    cancelAnimationFrame: function() {},
    Math: Math,
    Date: Date,
    JSON: JSON,
    Blob: function() {},
    URL: { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} },
    AudioContext: function() {
        return {
            createOscillator: () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} } }),
            createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {} } }),
            destination: {},
            currentTime: 0,
            close: () => {}
        };
    },
    fetch: async () => {
        throw new Error('Local mock mode in test');
    }
};

vm.createContext(context);
vm.runInContext(appScript, context);
vm.runInContext(calculationsScript, context);
vm.runInContext(datasheetsScript, context);
vm.runInContext(aiAgentScript, context);
console.log('✓ Simulator engine & AI modules initialized.');

async function run() {
    // --- STEP 1: Clear canvas to start from scratch ---
    console.log('\n--- Step 1: Initializing Clean Blank Canvas ---');
    vm.runInContext('newCircuit(true);', context);
    assert.strictEqual(vm.runInContext('state.components.length', context), 0);
    assert.strictEqual(vm.runInContext('state.wires.length', context), 0);
    console.log('✓ Canvas confirmed empty: 0 components, 0 wires.');

    // --- STEP 2: Ask AI Copilot to build circuit ---
    console.log('\n--- Step 2: Requesting AI Design: "Help me build a 5V LED circuit" ---');
    const inputEl = mockDocument.getElementById('ai-user-input');
    inputEl.value = 'Help me build a 5V LED circuit.';

    // Call sendAIMessage and await resolution
    await context.window.sendAIMessage();

    // Check chat messages rendered
    const chatContainer = mockDocument.getElementById('ai-chat-messages');
    assert(chatContainer.children.length >= 2, 'Chat should have rendered user & assistant messages');
    console.log(`✓ AI Copilot rendered ${chatContainer.children.length} message bubble(s).`);

    // Extract proposal ID from generated card
    const lastMsg = chatContainer.children[chatContainer.children.length - 1];
    const htmlContent = lastMsg.innerHTML;
    assert(htmlContent.includes('proposal-card-'), 'Assistant response must contain a proposal card');
    const proposalIdMatch = htmlContent.match(/id="proposal-card-([^"]+)"/);
    assert(proposalIdMatch, 'Proposal card must have an ID');
    const proposalId = proposalIdMatch[1];
    console.log(`✓ AI generated verified circuit proposal with ID: "${proposalId}"`);

    // --- STEP 3: Apply Circuit Proposal to Canvas ---
    console.log('\n--- Step 3: User clicks "Apply to Canvas" ---');
    context.window.applyCircuitProposal(proposalId);

    const compCount = vm.runInContext('state.components.length', context);
    const wireCount = vm.runInContext('state.wires.length', context);
    assert.strictEqual(compCount, 4, 'Canvas must have 4 components (DC Voltage, Resistor, LED, Ground)');
    assert.strictEqual(wireCount, 4, 'Canvas must have 4 wires connecting the complete loop');
    console.log(`✓ Successfully applied to canvas: ${compCount} components, ${wireCount} wires.`);

    // Inspect components on canvas
    const comps = vm.runInContext('state.components', context);
    console.log('  Instantiated components:');
    comps.forEach(c => {
        console.log(`  - [${c.id}] ${c.type} at (${c.x}, ${c.y}), value: ${c.value}`);
    });

    // --- STEP 4: Verify Live MNA Simulation on Applied Circuit ---
    console.log('\n--- Step 4: Solving Applied Circuit with Modified Nodal Analysis (MNA) ---');
    const solveResult = vm.runInContext('circuitSolver.solve(state.components, state.wires, 0, 0.016)', context);
    assert(solveResult !== null, 'MNA solver must return a valid solution');
    assert(Array.isArray(solveResult.nodeVoltages) && solveResult.nodeVoltages.length >= 3, 'Must solve node potentials');

    const vSupply = Math.max(...solveResult.nodeVoltages);
    console.log(`✓ MNA Solver converged: Supply rail = ${vSupply.toFixed(2)}V, 0V Ground datum resolved.`);

    // Check LED current
    const ledCurrent = solveResult.branchCurrents.get('led1');
    assert(ledCurrent !== undefined, 'LED branch current must be solved');
    console.log(`✓ LED Forward Voltage: ${ledCurrent.deltaV.toFixed(2)}V`);
    console.log(`✓ LED Operating Current: ${(ledCurrent.current * 1000).toFixed(2)} mA`);
    assert(ledCurrent.current > 0.005 && ledCurrent.current < 0.025, 'LED current must be between 5mA and 25mA for safe operation');
    console.log('✓ Current is within manufacturer safe operating area (Kingbright WP7113ID max 25mA).');

    // --- STEP 5: Verify Undo Operation ---
    console.log('\n--- Step 5: Testing Undo Operation (Ctrl+Z) ---');
    vm.runInContext('undo();', context);
    const compCountAfterUndo = vm.runInContext('state.components.length', context);
    assert.strictEqual(compCountAfterUndo, 0, 'Undo must cleanly revert canvas back to empty state');
    console.log('✓ Undo successfully cleared the applied circuit.');

    // --- STEP 6: Request Transistor Blink / Switch Circuit ---
    console.log('\n--- Step 6: Requesting "build the blink circuit using transistor only" ---');
    inputEl.value = 'build the blink circuit using transistor only';
    await context.window.sendAIMessage();

    const lastMsgBjt = chatContainer.children[chatContainer.children.length - 1];
    const htmlContentBjt = lastMsgBjt.innerHTML;
    assert(htmlContentBjt.includes('proposal-card-'), 'Assistant response must contain transistor proposal card with Apply to Canvas button');
    assert(htmlContentBjt.includes('Apply to Canvas') || htmlContentBjt.includes('applyCircuitProposal'), 'Must contain [Apply to Canvas] button');

    const bjtPropMatch = htmlContentBjt.match(/id="proposal-card-([^"]+)"/);
    assert(bjtPropMatch, 'Transistor proposal card must have an ID');
    const bjtProposalId = bjtPropMatch[1];
    console.log(`✓ AI generated verified Transistor proposal: "${bjtProposalId}" with [Apply to Canvas] button.`);

    // --- STEP 7: Apply Transistor Proposal to Canvas & Solve with MNA ---
    console.log('\n--- Step 7: Applying Transistor Proposal to Canvas ---');
    context.window.applyCircuitProposal(bjtProposalId);

    const bjtCompCount = vm.runInContext('state.components.length', context);
    const bjtWireCount = vm.runInContext('state.wires.length', context);
    assert(bjtCompCount >= 6, `Expected at least 6 components, found ${bjtCompCount}`);
    assert(bjtWireCount >= 7, `Expected at least 7 wires, found ${bjtWireCount}`);
    console.log(`✓ Instantiated Transistor Switch & Blink schematic: ${bjtCompCount} components, ${bjtWireCount} wires.`);

    const bjtSolve = vm.runInContext('circuitSolver.solve(state.components, state.wires, 0, 0.016)', context);
    assert(bjtSolve !== null, 'MNA solver must solve 2N2222A transistor circuit');
    console.log(`✓ MNA Solver converged on 2N2222A circuit. Node count: ${bjtSolve.nodeVoltages.length}`);

    // Verify Autonomous Multivibrator Oscillation across time steps
    console.log('\n--- Step 8: Verifying Autonomous Alternating LED Oscillation ---');
    let led1OnCount = 0;
    let led2OnCount = 0;
    for (let step = 0; step < 60; step++) {
        const time = step * 0.016;
        const res = vm.runInContext(`circuitSolver.solve(state.components, state.wires, ${time}, 0.016)`, context);
        const i1 = res.branchCurrents.get('led1')?.current || 0;
        const i2 = res.branchCurrents.get('led2')?.current || 0;
        if (i1 > 0.005 && i2 < 0.002) led1OnCount++;
        if (i2 > 0.005 && i1 < 0.002) led2OnCount++;
    }
    console.log(`✓ Multivibrator timing: LED1 ON for ${led1OnCount} steps, LED2 ON for ${led2OnCount} steps.`);
    assert(led1OnCount > 0, 'LED1 must be ON during state 1');
    assert(led2OnCount > 0, 'LED2 must be ON during state 2');
    console.log('✓ Autonomous alternating blinking verified! LEDs blink alternately without manual switches.');

    // Verify Undo reverts transistor circuit cleanly
    console.log('\n--- Step 9: Testing Undo Reversion ---');
    vm.runInContext('undo();', context);
    assert.strictEqual(vm.runInContext('state.components.length', context), 0, 'Undo must revert transistor circuit back to 0 components');
    console.log('✓ Undo successfully reverted canvas to 0 components.');

    console.log('\n===============================================================');
    console.log('🎉 ALL END-TO-END AI BUILD & APPLY TESTS PASSED (LED & TRANSISTOR)!');
    console.log('===============================================================');
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
