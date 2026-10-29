const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST SUITE: IoT Microcontrollers, Sensors & Actuators in ElectroSim Pro ===\n');

const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Extract main JS script (starts with // --- COMPONENT DEFINITIONS ---)
const marker = '// --- COMPONENT DEFINITIONS ---';
const markerPos = htmlContent.indexOf(marker);
const scriptStart = htmlContent.lastIndexOf('<script>', markerPos);
const scriptEnd = htmlContent.lastIndexOf('</script>');
const jsCode = htmlContent.substring(scriptStart + 8, scriptEnd);

// Mock DOM & Canvas
const mockCtx = {
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    roundRect: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    fillText: () => {},
    measureText: () => ({ width: 20 }),
    setLineDash: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} })
};

const mockElements = {
    'component-palette': { innerHTML: '', appendChild: () => {} },
    'toast': { classList: { add: () => {}, remove: () => {} } },
    'toast-message': { textContent: '' },
    'toast-icon': { className: '' },
    'selected-id': { textContent: '' },
    'datasheet-btn-container': { classList: { add: () => {}, remove: () => {} } },
    'inspector-content': { innerHTML: '' },
    'stress-badge': { className: '' },
    'stress-badge-text': { textContent: '' },
    'stress-status-dot': { className: '' },
    'stress-pct-label': { textContent: '' },
    'stress-bar': { style: {}, className: '' },
    'stress-stat-label-1': { textContent: '' },
    'stress-stat-val-1': { textContent: '' },
    'stress-stat-label-2': { textContent: '' },
    'stress-stat-val-2': { textContent: '' }
};

const sandbox = {
    console,
    Math,
    Date,
    Array,
    Object,
    Map,
    Set,
    JSON,
    parseFloat,
    parseInt,
    isNaN,
    isFinite,
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: () => {},
    document: {
        getElementById: (id) => mockElements[id] || { textContent: '', innerHTML: '', classList: { add: () => {}, remove: () => {} } },
        createElement: () => ({
            setAttribute: () => {},
            addEventListener: () => {},
            appendChild: () => {},
            classList: { add: () => {}, remove: () => {} }
        }),
        querySelectorAll: () => []
    },
    window: {
        innerWidth: 1920,
        innerHeight: 1080,
        addEventListener: () => {}
    },
    canvas: {
        width: 1200,
        height: 800,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 800 }),
        style: {}
    },
    ctx: mockCtx,
    localStorage: {
        getItem: () => null,
        setItem: () => {}
    }
};

vm.createContext(sandbox);

try {
    vm.runInContext(jsCode, sandbox);
    console.log('✓ Successfully parsed and initialized index.html JavaScript engine in VM.');
} catch (err) {
    console.error('✗ Execution error in JavaScript engine:', err);
    process.exit(1);
}

const COMPONENT_TYPES = vm.runInContext('COMPONENT_TYPES', sandbox);
const REAL_COMPONENT_DATASHEETS = vm.runInContext('REAL_COMPONENT_DATASHEETS', sandbox);
const solver = vm.runInContext('new CircuitSolver()', sandbox);
const getComponentTerminals = (c) => vm.runInContext('getComponentTerminals', sandbox)(c);
const formatResistance = (r) => vm.runInContext('formatResistance', sandbox)(r);
const renderComponentDetailsCard = (c) => vm.runInContext('renderComponentDetailsCard', sandbox)(c);
const loadPreset = (p) => vm.runInContext('loadPreset', sandbox)(p);

const requiredIotComponents = [
    'arduino_uno',
    'esp32',
    'dht11',
    'hc_sr04',
    'pir_sensor',
    'ldr',
    'buzzer',
    'servo',
    'relay'
];

// Test 1: Verify all 9 components in COMPONENT_TYPES
console.log('\n--- 1. Testing COMPONENT_TYPES Registrations ---');
for (const compType of requiredIotComponents) {
    const def = COMPONENT_TYPES[compType];
    if (!def) {
        console.error(`✗ Missing component in COMPONENT_TYPES: ${compType}`);
        process.exit(1);
    }
    if (def.category !== 'iot') {
        console.error(`✗ Component ${compType} has category "${def.category}", expected "iot"`);
        process.exit(1);
    }
    console.log(`✓ ${compType.padEnd(14)}: "${def.name}" (${def.terminals} terminals, default: ${def.defaultVal} ${def.unit})`);
}

// Test 2: Verify all 9 Datasheets
console.log('\n--- 2. Testing REAL_COMPONENT_DATASHEETS Archive ---');
for (const compType of requiredIotComponents) {
    const ds = REAL_COMPONENT_DATASHEETS[compType];
    if (!ds) {
        console.error(`✗ Missing datasheet for ${compType}`);
        process.exit(1);
    }
    if (!ds.partNumber || !ds.title || !Array.isArray(ds.pinout) || !Array.isArray(ds.maxRatings)) {
        console.error(`✗ Datasheet for ${compType} is missing standard structure!`);
        process.exit(1);
    }
    console.log(`✓ ${compType.padEnd(14)}: ${ds.partNumber} - ${ds.pinout.length} pins documented`);
}

// Test 3: Verify getComponentTerminals pin counts & normal vectors
console.log('\n--- 3. Testing getComponentTerminals & Pin Geometries ---');
const expectedPinCounts = {
    arduino_uno: 7,
    esp32: 7,
    dht11: 3,
    hc_sr04: 4,
    pir_sensor: 3,
    ldr: 2,
    buzzer: 2,
    servo: 3,
    relay: 6
};

for (const [type, expectedCount] of Object.entries(expectedPinCounts)) {
    const terms = getComponentTerminals({ id: 'test', type, x: 100, y: 100, rotation: 0 });
    if (terms.length !== expectedCount) {
        console.error(`✗ ${type} returned ${terms.length} terminals, expected ${expectedCount}`);
        process.exit(1);
    }
    for (let i = 0; i < terms.length; i++) {
        if (typeof terms[i].x !== 'number' || typeof terms[i].y !== 'number' || isNaN(terms[i].x) || isNaN(terms[i].y)) {
            console.error(`✗ ${type} terminal ${i} has invalid coordinates!`);
            process.exit(1);
        }
    }
    console.log(`✓ ${type.padEnd(14)}: ${terms.length} terminals placed with valid geometry`);
}

// Test 4: MNA Companion Solver - Arduino Uno 5V Supply Rail
console.log('\n--- 4. Testing MNA Companion Solver: Arduino Uno Regulated Rail ---');
const unoCircuit = {
    components: [
        { id: 'uno', type: 'arduino_uno', x: 200, y: 200, rotation: 0, d13Mode: 'high', d9Duty: 100 },
        { id: 'r1', type: 'resistor', x: 350, y: 180, rotation: 0, value: 250 }, // 5V / 250Ω = 20mA
        { id: 'gnd', type: 'ground', x: 200, y: 300, rotation: 0, value: 0 }
    ],
    wires: [
        { id: 'w1', fromComp: 'uno', fromTerm: 0, toComp: 'r1', toTerm: 0 }, // Uno 5V -> R1 pin 0
        { id: 'w2', fromComp: 'uno', fromTerm: 2, toComp: 'gnd', toTerm: 0 }, // Uno GND -> Ground
        { id: 'w3', fromComp: 'r1', fromTerm: 1, toComp: 'gnd', toTerm: 0 }   // R1 pin 1 -> Ground
    ]
};

const solveUno = solver.solve(unoCircuit.components, unoCircuit.wires, 0, 0.016);
const r1Branch = solveUno.branchCurrents.get('r1');
if (!r1Branch) {
    console.error('✗ Solver failed to calculate branch current for R1 on Arduino Uno rail!');
    process.exit(1);
}
console.log(`  Resistor R1 Voltage: ${r1Branch.deltaV.toFixed(2)} V (Expected ~5.00V)`);
console.log(`  Resistor R1 Current: ${(r1Branch.current * 1000).toFixed(2)} mA (Expected ~20.00mA)`);
if (Math.abs(r1Branch.deltaV - 5.0) > 0.2 || Math.abs(r1Branch.current - 0.02) > 0.002) {
    console.error('✗ Voltage or current on Arduino 5V rail outside allowable tolerance!');
    process.exit(1);
}
console.log('✓ Arduino Uno 5V rail delivers accurate 5.0V regulated power.');

// Test 5: MNA Companion Solver - Arduino Uno ADC Reading on A0
console.log('\n--- 5. Testing Arduino Uno Analog ADC A0 Quantization ---');
// Feed a 2.50V voltage divider into A0 (expected ADC = 512)
const adcCircuit = {
    components: [
        { id: 'uno', type: 'arduino_uno', x: 200, y: 200, rotation: 0, d13Mode: 'blink' },
        { id: 'v1', type: 'dc_voltage', x: 350, y: 150, rotation: 0, value: 2.5 },
        { id: 'gnd', type: 'ground', x: 200, y: 300, rotation: 0, value: 0 }
    ],
    wires: [
        { id: 'w1', fromComp: 'uno', fromTerm: 2, toComp: 'gnd', toTerm: 0 },
        { id: 'w2', fromComp: 'v1', fromTerm: 0, toComp: 'gnd', toTerm: 0 }, // V1 (-) to GND
        { id: 'w3', fromComp: 'v1', fromTerm: 1, toComp: 'uno', toTerm: 3 }  // V1 (+) to A0
    ]
};
solver.solve(adcCircuit.components, adcCircuit.wires, 0, 0.016);
const unoComp = adcCircuit.components.find(c => c.id === 'uno');
console.log(`  A0 Voltage: ${unoComp.vA0.toFixed(2)} V (Expected ~2.50V)`);
console.log(`  A0 10-bit ADC Code: ${unoComp.adcA0} / 1023 (Expected ~512)`);
if (Math.abs(unoComp.adcA0 - 512) > 10) {
    console.error(`✗ ADC A0 reading ${unoComp.adcA0} incorrect for 2.5V input!`);
    process.exit(1);
}
console.log('✓ Arduino Uno 10-bit ADC properly samples and quantizes input potential.');

// Test 6: MNA Companion Solver - LDR Resistance and Lux Sensitivity
console.log('\n--- 6. Testing LDR Cadmium-Sulfide Photoconductive Response ---');
const ldrCircuit = {
    components: [
        { id: 'ldr_dark', type: 'ldr', x: 100, y: 100, rotation: 0, lux: 0 },
        { id: 'ldr_bright', type: 'ldr', x: 200, y: 100, rotation: 0, lux: 1000 },
        { id: 'v1', type: 'dc_voltage', x: 100, y: 200, rotation: 0, value: 5 },
        { id: 'gnd', type: 'ground', x: 100, y: 300, rotation: 0, value: 0 }
    ],
    wires: [
        { id: 'w1', fromComp: 'v1', fromTerm: 1, toComp: 'ldr_dark', toTerm: 0 },
        { id: 'w2', fromComp: 'ldr_dark', fromTerm: 1, toComp: 'gnd', toTerm: 0 },
        { id: 'w3', fromComp: 'v1', fromTerm: 0, toComp: 'gnd', toTerm: 0 }
    ]
};
solver.solve(ldrCircuit.components, ldrCircuit.wires, 0, 0.016);
const darkComp = ldrCircuit.components.find(c => c.id === 'ldr_dark');
const brightComp = ldrCircuit.components.find(c => c.id === 'ldr_bright');
console.log(`  Dark (0 Lux) Resistance: ${formatResistance(darkComp.calculatedResistance)} (Expected ~500 kΩ)`);
console.log(`  Bright (1000 Lux) Resistance: ${formatResistance(brightComp.calculatedResistance)} (Expected ~500 Ω)`);
if (darkComp.calculatedResistance < 400000 || brightComp.calculatedResistance > 1000) {
    console.error('✗ LDR calculated resistance curve failed verification!');
    process.exit(1);
}
console.log('✓ LDR responds dynamically to illuminance variation across 3 decades.');

// Test 7: MNA Companion Solver - Optocoupled Relay Switching
console.log('\n--- 7. Testing 5V Optocoupled Relay Armature Switching ---');
// Energized circuit: 5V into VCC and 5V into IN
const relayCircuit = {
    components: [
        { id: 'v_ctl', type: 'dc_voltage', x: 100, y: 100, rotation: 0, value: 5.0 },
        { id: 'relay', type: 'relay', x: 250, y: 100, rotation: 0, triggerLevel: 'high' },
        { id: 'gnd', type: 'ground', x: 100, y: 250, rotation: 0, value: 0 },
        // Load side: 12V supply through COM and NO into a 10Ω load
        { id: 'v_load', type: 'dc_voltage', x: 400, y: 100, rotation: 0, value: 12.0, internalR: 0.01 },
        { id: 'r_load', type: 'resistor', x: 400, y: 250, rotation: 0, value: 10.0 }
    ],
    wires: [
        { id: 'w1', fromComp: 'v_ctl', fromTerm: 1, toComp: 'relay', toTerm: 0 }, // 5V -> VCC
        { id: 'w2', fromComp: 'v_ctl', fromTerm: 1, toComp: 'relay', toTerm: 1 }, // 5V -> IN (triggers relay)
        { id: 'w3', fromComp: 'v_ctl', fromTerm: 0, toComp: 'gnd', toTerm: 0 },   // Ctl GND
        { id: 'w4', fromComp: 'relay', fromTerm: 2, toComp: 'gnd', toTerm: 0 },   // Relay GND
        // Load loop: V_load (+) -> COM; NO -> R_load; R_load -> V_load (-)
        { id: 'w5', fromComp: 'v_load', fromTerm: 1, toComp: 'relay', toTerm: 4 }, // 12V -> COM
        { id: 'w6', fromComp: 'relay', fromTerm: 3, toComp: 'r_load', toTerm: 0 }, // NO -> R_load
        { id: 'w7', fromComp: 'r_load', fromTerm: 1, toComp: 'v_load', toTerm: 0 }  // R_load -> 12V (-)
    ]
};
solver.solve(relayCircuit.components, relayCircuit.wires, 0, 0.016);
const relayComp = relayCircuit.components.find(c => c.id === 'relay');
const rLoadBranch = solver.solve(relayCircuit.components, relayCircuit.wires, 0, 0.016).branchCurrents.get('r_load');

console.log(`  Relay Energized State: ${relayComp.isEnergized}`);
console.log(`  Load Resistor Current: ${(rLoadBranch.current).toFixed(2)} A (Expected ~1.20A for 12V / 10Ω)`);
if (!relayComp.isEnergized || Math.abs(rLoadBranch.current - 1.2) > 0.05) {
    console.error('✗ Relay failed to energize or conduct load current!');
    process.exit(1);
}
console.log('✓ Optocoupled relay successfully isolates and switches high-power load circuit.');

// Test 8: Verify all 4 Pre-wired IoT Presets
console.log('\n--- 8. Testing Pre-Wired Circuit Presets ---');
const iotPresets = ['arduino_alarm', 'esp32_weather', 'ultrasonic_radar', 'relay_mains_driver'];

for (const presetName of iotPresets) {
    loadPreset(presetName);
    const comps = vm.runInContext('state.components', sandbox);
    const wires = vm.runInContext('state.wires', sandbox);

    if (comps.length === 0 || wires.length === 0) {
        console.error(`✗ Preset ${presetName} produced empty component or wire list!`);
        process.exit(1);
    }

    // Verify all wire endpoints connect to valid components & valid terminal indices
    for (const w of wires) {
        const fromC = comps.find(c => c.id === w.fromComp);
        const toC = comps.find(c => c.id === w.toComp);
        if (!fromC || !toC) {
            console.error(`✗ Preset ${presetName} wire ${w.id} has invalid component endpoint!`);
            process.exit(1);
        }
        const fromTerms = getComponentTerminals(fromC);
        const toTerms = getComponentTerminals(toC);
        if (w.fromTerm < 0 || w.fromTerm >= fromTerms.length || w.toTerm < 0 || w.toTerm >= toTerms.length) {
            console.error(`✗ Preset ${presetName} wire ${w.id} connects to non-existent terminal index!`);
            process.exit(1);
        }
    }

    // Run solver on preset
    const sol = solver.solve(comps, wires, 0, 0.016);
    if (!sol || !sol.nodeVoltages || sol.isShortCircuit) {
        console.error(`✗ Preset ${presetName} failed MNA matrix solve or caused unexpected short!`);
        process.exit(1);
    }
    console.log(`✓ Preset "${presetName}": ${comps.length} components, ${wires.length} wires, solved successfully.`);
}

// Test 9: Verify HTML Inspector Details Generation
console.log('\n--- 9. Testing Inspector Details Cards for All 9 Modules ---');
for (const type of requiredIotComponents) {
    const comp = { id: 'c_test', type, x: 100, y: 100, rotation: 0, value: 5 };
    const html = renderComponentDetailsCard(comp);
    if (!html || typeof html !== 'string' || html.length < 50) {
        console.error(`✗ Details HTML card for ${type} is empty or invalid!`);
        process.exit(1);
    }
    console.log(`✓ ${type.padEnd(14)}: Rendered ${html.length} chars of technical inspector markup`);
}

console.log('\n===============================================================');
console.log('🎉 ALL TESTS PASSED! IoT and Microcontroller features verified.');
console.log('===============================================================');
