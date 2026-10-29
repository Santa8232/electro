/**
 * Test Suite: Modular Components & Full Datasheet Architecture (test_components.js)
 * 
 * Verifies that:
 * 1. Every component exists in its own separate file under /components/.
 * 2. Each component exports complete metadata, terminal specs, and authentic datasheet.
 * 3. components/index.js aggregates all 21 parts cleanly for Node.js and Browser.
 * 4. Helper queries (getComponent, getDatasheet, getComponentsByCategory) function properly.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST SUITE: Modular Component Architecture & Datasheets ===\n');

const EXPECTED_PARTS = [
    'dc_voltage', 'ac_voltage', 'resistor', 'capacitor', 'inductor',
    'led', 'diode', 'zener', 'npn_bjt', 'fuse',
    'switch', 'ground', 'arduino_uno', 'esp32', 'dht11',
    'hc_sr04', 'pir_sensor', 'ldr', 'buzzer', 'servo', 'relay'
];

const VALID_CATEGORIES = new Set(['power', 'passive', 'semi', 'control', 'iot']);

// --- 1. Test Individual Component Files ---
console.log('--- 1. Testing Individual Component Files ---');
EXPECTED_PARTS.forEach(partId => {
    const filePath = path.join(__dirname, '..', 'components', `${partId}.js`);
    assert(fs.existsSync(filePath), `Component file missing: ${filePath}`);

    // Require directly as independent module
    const comp = require(filePath);
    assert.strictEqual(comp.id, partId, `Component id mismatch: expected ${partId}, got ${comp.id}`);
    assert(typeof comp.name === 'string' && comp.name.length > 0, `Component ${partId} must have name`);
    assert(typeof comp.symbol === 'string' && comp.symbol.length > 0, `Component ${partId} must have symbol`);
    assert(typeof comp.desc === 'string' && comp.desc.length > 0, `Component ${partId} must have description`);
    assert(VALID_CATEGORIES.has(comp.category), `Invalid category '${comp.category}' for ${partId}`);
    assert(Number.isInteger(comp.terminals) && comp.terminals >= 1, `Invalid terminals for ${partId}`);
    assert(comp.defaultVal !== undefined, `Missing defaultVal for ${partId}`);
    assert(typeof comp.unit === 'string', `Missing unit for ${partId}`);

    // Verify Datasheet completeness
    const ds = comp.datasheet;
    assert(ds !== null && typeof ds === 'object', `Component ${partId} missing datasheet object`);
    assert(typeof ds.partNumber === 'string' && ds.partNumber.length > 0, `Datasheet ${partId} missing partNumber`);
    assert(typeof ds.title === 'string' && ds.title.length > 0, `Datasheet ${partId} missing title`);
    assert(typeof ds.package === 'string' && ds.package.length > 0, `Datasheet ${partId} missing package`);
    assert(typeof ds.description === 'string' && ds.description.length > 0, `Datasheet ${partId} missing description`);
    assert(Array.isArray(ds.pinout) && ds.pinout.length >= 1, `Datasheet ${partId} must have pinout array`);
    assert(Array.isArray(ds.maxRatings) && ds.maxRatings.length >= 1, `Datasheet ${partId} must have maxRatings array`);
    assert(Array.isArray(ds.characteristics), `Datasheet ${partId} must have characteristics array`);
    assert(typeof ds.appNotes === 'string' && ds.appNotes.length > 0, `Datasheet ${partId} missing appNotes`);

    console.log(`✓ components/${partId}.js: "${comp.name}" | Part: ${ds.partNumber} | ${comp.terminals} pins | ${ds.maxRatings.length} max ratings`);
});

// --- 2. Test Master Registry (components/index.js) in Node.js ---
console.log('\n--- 2. Testing components/index.js in Node.js ---');
const componentsHub = require('../components');

assert.strictEqual(Object.keys(componentsHub.COMPONENT_REGISTRY).length, 21, 'Must register 21 components');
assert.strictEqual(Object.keys(componentsHub.COMPONENT_TYPES).length, 21, 'Must register 21 component types');
assert.strictEqual(Object.keys(componentsHub.REAL_COMPONENT_DATASHEETS).length, 21, 'Must register 21 datasheets');
console.log('✓ Master registry aggregated all 21 parts into COMPONENT_REGISTRY, COMPONENT_TYPES, and REAL_COMPONENT_DATASHEETS');

// --- 3. Test Helper Methods ---
console.log('\n--- 3. Testing Helper Query Methods ---');
const resistor = componentsHub.getComponent('resistor');
assert.strictEqual(resistor.id, 'resistor');
assert.strictEqual(resistor.name, 'Resistor');

const bjtDatasheet = componentsHub.getDatasheet('npn_bjt');
assert(bjtDatasheet.partNumber.includes('2N2222A'));
console.log(`✓ getDatasheet('npn_bjt'): ${bjtDatasheet.partNumber}`);

const iotComponents = componentsHub.getComponentsByCategory('iot');
assert.strictEqual(iotComponents.length, 9, 'Expected 9 IoT components (Uno, ESP32, 5 sensors, 2 actuators)');
console.log(`✓ getComponentsByCategory('iot'): Found ${iotComponents.length} microcontroller/sensor/actuator modules`);

const passiveComponents = componentsHub.getComponentsByCategory('passive');
assert.strictEqual(passiveComponents.length, 3, 'Expected 3 passive components (R, C, L)');
console.log(`✓ getComponentsByCategory('passive'): Found ${passiveComponents.length} passive components`);

// --- 4. Test Browser UMD Loading ---
console.log('\n--- 4. Testing Browser UMD Compatibility ---');
const mockWindow = {
    ELECTRO_COMPONENTS: {}
};

const context = {
    window: mockWindow,
    self: mockWindow,
    define: undefined,
    module: undefined,
    console: console
};

vm.createContext(context);

// Run a component file in browser VM
const ledScript = fs.readFileSync(path.join(__dirname, '..', 'components', 'led.js'), 'utf8');
vm.runInContext(ledScript, context);

assert(mockWindow.ELECTRO_COMPONENTS['led'] !== undefined, 'Browser must register led in window.ELECTRO_COMPONENTS');
assert.strictEqual(mockWindow.ELECTRO_COMPONENTS['led'].name, 'LED');
console.log('✓ Browser UMD evaluation registered window.ELECTRO_COMPONENTS["led"]');

// --- 5. Test Proper Component JSON Files & Master JSON ---
console.log('\n--- 5. Testing Component JSON Files & Master Registry JSON ---');
EXPECTED_PARTS.forEach(partId => {
    const jsonPath = path.join(__dirname, '..', 'components', `${partId}.json`);
    assert(fs.existsSync(jsonPath), `Component JSON file missing: ${jsonPath}`);
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const parsed = JSON.parse(raw);
    assert.strictEqual(parsed.id, partId, `JSON ID mismatch in ${partId}.json`);
    assert(parsed.name && parsed.datasheet && parsed.datasheet.partNumber, `Incomplete JSON in ${partId}.json`);
    console.log(`✓ components/${partId}.json: Valid JSON (${raw.length} bytes)`);
});

const masterCompJsonPath = path.join(__dirname, '..', 'components', 'components.json');
assert(fs.existsSync(masterCompJsonPath), 'components/components.json must exist');
const masterData = JSON.parse(fs.readFileSync(masterCompJsonPath, 'utf8'));
assert.strictEqual(Object.keys(masterData).length, 21, 'components/components.json must aggregate all 21 parts');
console.log('✓ components/components.json: Master registry contains all 21 components with full datasheets');

console.log('\n===============================================================');
console.log('🎉 ALL MODULAR COMPONENT & DATASHEET ARCHITECTURE TESTS PASSED!');
console.log('===============================================================');

