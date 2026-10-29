/**
 * Test Suite: AI Circuit Proposal Validation & Execution Engine
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST SUITE: AI Circuit Proposal & Validation Engine ===\n');

// 1. Read index.html
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// 2. Mock minimal browser DOM environment
const domListeners = {};
const mockElements = {};

function getOrCreateElement(id) {
    if (!mockElements[id]) {
        mockElements[id] = {
            id,
            className: '',
            classList: {
                _classes: new Set(),
                add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
                remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
                toggle: function(c) { if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c); },
                contains: function(c) { return this._classes.has(c); }
            },
            textContent: '',
            innerHTML: '',
            value: '',
            style: {},
            appendChild: function(child) { this.children = this.children || []; this.children.push(child); },
            focus: function() {},
            scrollTop: 0,
            scrollHeight: 100,
            selectionStart: 0,
            selectionEnd: 0
        };
    }
    return mockElements[id];
}

const mockDocument = {
    getElementById: function(id) {
        return getOrCreateElement(id);
    },
    createElement: function(tag) {
        return {
            tagName: tag.toUpperCase(),
            className: '',
            textContent: '',
            innerHTML: '',
            appendChild: function() {},
            classList: { add: function() {}, remove: function() {}, contains: () => false }
        };
    },
    activeElement: { tagName: 'BODY' },
    addEventListener: function(event, cb) {
        domListeners[event] = domListeners[event] || [];
        domListeners[event].push(cb);
    }
};

const mockWindow = {
    addEventListener: function(event, cb) {
        domListeners[event] = domListeners[event] || [];
        domListeners[event].push(cb);
    },
    document: mockDocument
};

const scriptStart = html.lastIndexOf('<script>') + 8;
const scriptEnd = html.lastIndexOf('</script>');
const appScript = html.substring(scriptStart, scriptEnd);

const context = {
    window: mockWindow,
    document: mockDocument,
    console: console,
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
    }
};

vm.createContext(context);
vm.runInContext(appScript, context);

console.log('✓ Successfully parsed and initialized ElectroSim Pro JavaScript engine in VM.');

const COMPONENT_TYPES = vm.runInContext('COMPONENT_TYPES', context);

// Define Proposal Validator
function validateProposal(proposal) {
    if (!proposal || typeof proposal !== 'object') {
        return { valid: false, errors: ['Proposal must be an object.'] };
    }
    const errors = [];
    const warnings = [];

    if (!proposal.proposalId) errors.push('Missing proposalId.');
    if (!proposal.designObjective) errors.push('Missing designObjective.');
    if (!Array.isArray(proposal.components) || proposal.components.length === 0) {
        errors.push('Proposal must contain at least one component in "components" array.');
    } else {
        const compIds = new Set();
        proposal.components.forEach((c, idx) => {
            if (!c.id) errors.push(`Component at index ${idx} is missing an id.`);
            if (compIds.has(c.id)) errors.push(`Duplicate component ID in proposal: "${c.id}".`);
            compIds.add(c.id);

            const allTypes = COMPONENT_TYPES;
            if (!c.type || !allTypes[c.type]) {
                errors.push(`Unknown component type "${c.type}" at index ${idx}.`);
            }
            if (c.val !== undefined && (!Number.isFinite(c.val) || c.val < 0)) {
                errors.push(`Invalid non-finite or negative value for component "${c.id}": ${c.val}.`);
            }
        });
    }

    if (Array.isArray(proposal.wires)) {
        const compIdSet = new Set(proposal.components.map(c => c.id));
        proposal.wires.forEach((w, idx) => {
            if (!w.fromComp || !w.toComp) {
                errors.push(`Wire at index ${idx} is missing fromComp or toComp.`);
                return;
            }
            if (!compIdSet.has(w.fromComp)) {
                errors.push(`Wire at index ${idx} references nonexistent component "${w.fromComp}".`);
            }
            if (!compIdSet.has(w.toComp)) {
                errors.push(`Wire at index ${idx} references nonexistent component "${w.toComp}".`);
            }
            if (w.fromComp === w.toComp && w.fromTerm === w.toTerm) {
                errors.push(`Wire at index ${idx} connects component "${w.fromComp}" terminal ${w.fromTerm} directly to itself.`);
            }

            const fromType = proposal.components.find(c => c.id === w.fromComp)?.type;
            const toType = proposal.components.find(c => c.id === w.toComp)?.type;
            const allTypes = COMPONENT_TYPES;

            if (fromType && allTypes[fromType]) {
                const maxTerm = allTypes[fromType].terminals;
                if (w.fromTerm < 0 || w.fromTerm >= maxTerm) {
                    errors.push(`Terminal index ${w.fromTerm} out of bounds for "${w.fromComp}" (${fromType} has ${maxTerm} terminals).`);
                }
            }
            if (toType && allTypes[toType]) {
                const maxTerm = allTypes[toType].terminals;
                if (w.toTerm < 0 || w.toTerm >= maxTerm) {
                    errors.push(`Terminal index ${w.toTerm} out of bounds for "${w.toComp}" (${toType} has ${maxTerm} terminals).`);
                }
            }
        });
    }

    // Safety checks
    const hasGround = proposal.components.some(c => c.type === 'ground');
    if (!hasGround) {
        warnings.push('Proposal does not include a 0V Earth Ground reference.');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

// --- TEST 1: Valid 5V LED Circuit Proposal ---
console.log('\n--- 1. Testing Valid 5V LED Proposal ---');
const validProposal = {
    proposalId: 'prop_test_5v_led',
    designObjective: '5V Red LED Indicator with 330Ω Resistor',
    replaceExisting: false,
    components: [
        { id: 'v1', type: 'dc_voltage', val: 5, unit: 'V', x: 100, y: 200, rotation: 0 },
        { id: 'r1', type: 'resistor', val: 330, unit: 'Ω', x: 220, y: 140, rotation: 0 },
        { id: 'led1', type: 'led', val: 2, unit: 'V', x: 340, y: 140, rotation: 0 },
        { id: 'gnd1', type: 'ground', val: 0, unit: 'V', x: 220, y: 300, rotation: 0 }
    ],
    wires: [
        { fromComp: 'v1', fromTerm: 1, toComp: 'r1', toTerm: 0 },
        { fromComp: 'r1', fromTerm: 1, toComp: 'led1', toTerm: 0 },
        { fromComp: 'led1', fromTerm: 1, toComp: 'gnd1', toTerm: 0 },
        { fromComp: 'v1', fromTerm: 0, toComp: 'gnd1', toTerm: 0 }
    ],
    calculations: { vSupply: '5.0V', r: '330Ω', iExpected: '9.09mA' }
};

const res1 = validateProposal(validProposal);
assert.strictEqual(res1.valid, true, 'Valid proposal should pass validation');
assert.strictEqual(res1.errors.length, 0);
console.log('✓ Valid proposal passed with 0 errors');

// --- TEST 2: Invalid Component Type ---
console.log('\n--- 2. Testing Invalid Component Type Rejection ---');
const badTypeProposal = JSON.parse(JSON.stringify(validProposal));
badTypeProposal.components[1].type = 'flux_capacitor'; // Nonexistent
const res2 = validateProposal(badTypeProposal);
assert.strictEqual(res2.valid, false);
assert(res2.errors.some(e => e.includes('flux_capacitor')));
console.log('✓ Rejected unknown component type "flux_capacitor":', res2.errors[0]);

// --- TEST 3: Out-of-bounds Terminal Index ---
console.log('\n--- 3. Testing Out-of-Bounds Terminal Index Rejection ---');
const badTermProposal = JSON.parse(JSON.stringify(validProposal));
badTermProposal.wires[0].fromTerm = 99; // dc_voltage only has 2 terminals (0 and 1)
const res3 = validateProposal(badTermProposal);
assert.strictEqual(res3.valid, false);
assert(res3.errors.some(e => e.includes('out of bounds')));
console.log('✓ Rejected invalid terminal index 99:', res3.errors[0]);

// --- TEST 4: Wire to Self ---
console.log('\n--- 4. Testing Self-Connecting Wire Rejection ---');
const selfWireProposal = JSON.parse(JSON.stringify(validProposal));
selfWireProposal.wires[0].toComp = selfWireProposal.wires[0].fromComp;
selfWireProposal.wires[0].toTerm = selfWireProposal.wires[0].fromTerm; // Connecting terminal directly to itself
const res4 = validateProposal(selfWireProposal);
assert.strictEqual(res4.valid, false);
assert(res4.errors.some(e => e.includes('directly to itself')));
console.log('✓ Rejected self-shorted terminal wire:', res4.errors[0]);

// --- TEST 5: Dangling Wire referencing nonexistent component ---
console.log('\n--- 5. Testing Dangling Wire Rejection ---');
const danglingProposal = JSON.parse(JSON.stringify(validProposal));
danglingProposal.wires[0].toComp = 'ghost_chip';
const res5 = validateProposal(danglingProposal);
assert.strictEqual(res5.valid, false);
assert(res5.errors.some(e => e.includes('ghost_chip')));
console.log('✓ Rejected wire referencing nonexistent component "ghost_chip"');

// --- TEST 6: Application to Simulator Canvas State & Undo ---
console.log('\n--- 6. Testing Application to Canvas State & Undo History ---');
vm.runInContext(`
    // Clear canvas
    state.components = [];
    state.wires = [];
    state.history = [];
    state.historyIndex = -1;
    recordHistory();

    // Apply valid proposal
    function applyTestProposal(prop) {
        recordHistory();
        prop.components.forEach(c => {
            state.components.push({
                id: c.id,
                type: c.type,
                x: c.x,
                y: c.y,
                rotation: c.rotation || 0,
                value: c.val !== undefined ? c.val : 5,
                state: c.type === 'switch' ? 1 : 0
            });
        });
        prop.wires.forEach(w => {
            state.wires.push({
                id: 'w_' + Math.random().toString(36).substring(2, 9),
                fromComp: w.fromComp,
                fromTerm: w.fromTerm,
                toComp: w.toComp,
                toTerm: w.toTerm
            });
        });
        recordHistory();
        state.lastSolveResult = circuitSolver.solve(state.components, state.wires, 0, 0.016);
    }

    applyTestProposal(${JSON.stringify(validProposal)});
`, context);

const compCountAfter = vm.runInContext('state.components.length', context);
const wireCountAfter = vm.runInContext('state.wires.length', context);
assert.strictEqual(compCountAfter, 4, 'Should have 4 components after applying proposal');
assert.strictEqual(wireCountAfter, 4, 'Should have 4 wires after applying proposal');
console.log('✓ Proposal successfully applied: 4 components, 4 wires populated in canvas state');

// Verify MNA solver ran on applied proposal
const solveRes = vm.runInContext('state.lastSolveResult', context);
assert(solveRes !== null, 'Solver result should exist after applying proposal');
console.log('✓ MNA Solver executed on applied circuit. Nodes solved:', solveRes.nodeMap ? Object.keys(solveRes.nodeMap).length : 'converged');

// Verify Undo restores clean state
vm.runInContext('undo(); undo();', context);
const compCountAfterUndo = vm.runInContext('state.components.length', context);
assert.strictEqual(compCountAfterUndo, 0, 'Undo should restore previous empty canvas state');
console.log('✓ Undo successfully reverted applied circuit proposal');

console.log('\n===============================================================');
console.log('🎉 ALL PROPOSAL VALIDATION & APPLICATION TESTS PASSED!');
console.log('===============================================================');
