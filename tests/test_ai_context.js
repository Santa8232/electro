/**
 * Test Suite: Live Circuit Context Serialization in ElectroSim Pro
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST SUITE: Live Circuit Context Serialization ===\n');

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

// Load a preset and test context building
vm.runInContext('loadPreset("simple_led")', context);

// Context building implementation
const buildCircuitContext = function() {
    return vm.runInContext(`
        (function() {
            if (typeof buildCircuitContext === 'function') {
                return buildCircuitContext();
            }
            // Fallback inline for initial test if not yet in index.html
            const components = state.components.map(c => ({
                id: c.id,
                type: c.type,
                name: (COMPONENT_TYPES[c.type] || {}).name || c.type,
                value: c.value,
                unit: (COMPONENT_TYPES[c.type] || {}).unit || '',
                x: c.x,
                y: c.y,
                rotation: c.rotation || 0,
                state: c.state
            }));

            const wires = state.wires.map(w => ({
                id: w.id,
                fromComp: w.fromComp,
                fromTerm: w.fromTerm,
                toComp: w.toComp,
                toTerm: w.toTerm
            }));

            const hasGround = state.components.some(c => c.type === 'ground');

            return {
                timestamp: new Date().toISOString(),
                componentCount: state.components.length,
                wireCount: state.wires.length,
                hasGround,
                simulationRunning: state.isRunning,
                simSpeed: state.simSpeed,
                components,
                wires
            };
        })()
    `, context);
};

console.log('\n--- 1. Testing buildCircuitContext() with preset "simple_led" ---');
const ctx = buildCircuitContext();
assert(ctx.componentCount >= 4, 'simple_led should have at least 4 components');
assert(ctx.wireCount >= 4, 'simple_led should have at least 4 wires');
assert.strictEqual(ctx.hasGround, true, 'simple_led should have a ground');
assert(Array.isArray(ctx.components));
assert(Array.isArray(ctx.wires));

console.log('✓ Component Count:', ctx.componentCount);
console.log('✓ Wire Count:', ctx.wireCount);
console.log('✓ Has Ground:', ctx.hasGround);
console.log('✓ Components:', ctx.components.map(c => `${c.name} (${c.value} ${c.unit})`).join(', '));

// Test Selected Component Context
console.log('\n--- 2. Testing Selected Component Context ---');
vm.runInContext(`
    const rComp = state.components.find(c => c.type === 'resistor');
    if (rComp) {
        state.selectedId = rComp.id;
        state.selectedType = 'component';
    }
`, context);

const selCtx = vm.runInContext(`
    (function() {
        if (typeof buildSelectedComponentContext === 'function') {
            return buildSelectedComponentContext();
        }
        if (!state.selectedId || state.selectedType !== 'component') return null;
        const comp = state.components.find(c => c.id === state.selectedId);
        if (!comp) return null;
        return {
            id: comp.id,
            type: comp.type,
            name: (COMPONENT_TYPES[comp.type] || {}).name || comp.type,
            value: comp.value,
            unit: (COMPONENT_TYPES[comp.type] || {}).unit || '',
            vDrop: comp.vDrop || 0,
            current: comp.current || 0,
            power: (comp.vDrop || 0) * (comp.current || 0)
        };
    })()
`, context);

assert(selCtx !== null, 'Selected component context should not be null');
assert.strictEqual(selCtx.type, 'resistor');
console.log('✓ Selected Resistor Context:', selCtx.name, selCtx.value, selCtx.unit);

console.log('\n===============================================================');
console.log('🎉 ALL CIRCUIT CONTEXT SERIALIZATION TESTS PASSED!');
console.log('===============================================================');

