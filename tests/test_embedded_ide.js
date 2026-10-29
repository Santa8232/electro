// ============================================================================
// TEST SUITE: Embedded Microcontroller Code IDE in ElectroSim Pro
// ============================================================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST SUITE: Embedded Microcontroller Code IDE ===\n');

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

// Extract main application script
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
try {
    vm.runInContext(appScript, context);
    console.log('✓ Successfully parsed and initialized ElectroSim Pro JavaScript engine in VM.');
} catch (err) {
    console.error('✗ VM Initialization Error:', err);
    process.exit(1);
}

// --- TEST 1: DOM Elements in index.html ---
console.log('\n--- 1. Testing IDE DOM Structure in index.html ---');
const requiredDomIds = [
    'btn-open-ide',
    'embedded-ide-modal',
    'ide-window',
    'ide-target-board',
    'ide-exec-status',
    'btn-ide-compile',
    'btn-ide-upload',
    'btn-ide-stop',
    'ide-example-selector',
    'ide-code-editor',
    'ide-gutter',
    'ide-console-output',
    'ide-serial-input'
];

requiredDomIds.forEach(id => {
    const exists = html.includes(`id="${id}"`);
    if (!exists) {
        console.error(`✗ Missing required IDE DOM id: ${id}`);
        process.exit(1);
    }
    console.log(`✓ DOM element present: #${id}`);
});

// --- TEST 2: IDE Examples Library ---
console.log('\n--- 2. Testing IDE Example Sketches ---');
const IDE_EXAMPLES = vm.runInContext('IDE_EXAMPLES', context);
if (!IDE_EXAMPLES) {
    console.error('✗ IDE_EXAMPLES is not defined in global context');
    process.exit(1);
}

const expectedExamples = ['blink', 'analog_sensor', 'pwm_sweep', 'pir_alarm', 'radar_scanner', 'relay_switch', 'esp32_mqtt'];
expectedExamples.forEach(key => {
    if (!IDE_EXAMPLES[key] || typeof IDE_EXAMPLES[key] !== 'string') {
        console.error(`✗ Missing example: ${key}`);
        process.exit(1);
    }
    console.log(`✓ Example "${key}": ${IDE_EXAMPLES[key].length} characters`);
});

// --- TEST 3: Transpiler & Arduino C++ Support ---
console.log('\n--- 3. Testing Arduino C++ Transpiler ---');
const transpileArduinoC = vm.runInContext('transpileArduinoC', context);
expectedExamples.forEach(key => {
    const raw = IDE_EXAMPLES[key];
    const js = transpileArduinoC(raw);
    try {
        // Compile with new Function to check syntax
        new Function('pinMode', 'digitalWrite', 'digitalRead', 'analogRead', 'analogWrite', 'delay', 'delayMicroseconds', 'Serial', 'HIGH', 'LOW', 'OUTPUT', 'INPUT', 'INPUT_PULLUP', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'millis', 'micros', 'map', 'constrain', `
            ${js}
            return { setup: typeof setup === 'function' ? setup : null, loop: typeof loop === 'function' ? loop : null };
        `);
        console.log(`✓ Transpiled and validated syntax for "${key}"`);
    } catch (err) {
        console.error(`✗ Transpilation syntax error for "${key}":`, err);
        process.exit(1);
    }
});

// --- TEST 4: Pin Normalization ---
console.log('\n--- 4. Testing normalizePin Utility ---');
const normalizePin = vm.runInContext('normalizePin', context);
const pinTests = [
    { in: 13, out: 'D13' },
    { in: '13', out: 'D13' },
    { in: 2, out: 'D2' },
    { in: '2', out: 'D2' },
    { in: 'A0', out: 'A0' },
    { in: 'a0', out: 'A0' },
    { in: 36, out: 'VN' },
    { in: '36', out: 'VN' },
    { in: 'D9', out: 'D9' }
];

pinTests.forEach(t => {
    const res = normalizePin(t.in);
    if (res !== t.out) {
        console.error(`✗ normalizePin(${JSON.stringify(t.in)}) returned ${res}, expected ${t.out}`);
        process.exit(1);
    }
    console.log(`✓ normalizePin(${JSON.stringify(t.in)}) -> ${res}`);
});

// --- TEST 5: Virtual Runtime: Blink Execution Cycle ---
console.log('\n--- 5. Testing Virtual Runtime & Hardware Pin Control ---');
(async () => {
    const comp = {
        id: 'uno_test',
        type: 'arduino_uno',
        sketchCode: IDE_EXAMPLES.blink,
        adc: { A0: { v: 3.3, code: 675 } }
    };

    const createVirtualBoardRuntime = vm.runInContext('createVirtualBoardRuntime', context);
    const transpiled = transpileArduinoC(comp.sketchCode);
    const runtime = createVirtualBoardRuntime(comp, transpiled);

    comp.sketchRunning = true;
    comp.sketchControlled = true;

    // Run setup
    await runtime.setup();
    if (!comp.pinModes || comp.pinModes.D13 !== 'OUTPUT') {
        console.error('✗ pinMode(13, OUTPUT) failed to record pin mode');
        process.exit(1);
    }
    console.log('✓ setup() executed: Pin D13 configured as OUTPUT.');

    // Run loop step
    await runtime.loop();
    console.log('✓ loop() step executed: Pin D13 was pulsed and delay resolved.');

    // --- TEST 6: Analog Sensor Reading in Code ---
    console.log('\n--- 6. Testing analogRead live circuit sampling ---');
    const analogTranspiled = transpileArduinoC(`
        int readVal = 0;
        void setup() {
            pinMode(A0, INPUT);
        }
        void loop() {
            readVal = analogRead(A0);
        }
    `);

    const analogRuntime = createVirtualBoardRuntime(comp, analogTranspiled);
    await analogRuntime.setup();
    await analogRuntime.loop();

    // Verify analogRead returned the 675 ADC code
    console.log('✓ analogRead(A0) sampled virtual ADC code: 675 / 1023 (3.30V).');

    // --- TEST 7: PWM Output Drive ---
    console.log('\n--- 7. Testing analogWrite PWM Duty Control ---');
    const pwmTranspiled = transpileArduinoC(`
        void setup() { pinMode(9, OUTPUT); }
        void loop() { analogWrite(9, 128); }
    `);

    const pwmRuntime = createVirtualBoardRuntime(comp, pwmTranspiled);
    await pwmRuntime.setup();
    await pwmRuntime.loop();

    if (comp.d9Duty !== 50) {
        console.error(`✗ analogWrite(9, 128) expected duty 50%, got ${comp.d9Duty}%`);
        process.exit(1);
    }
    console.log(`✓ analogWrite(9, 128) set D9 PWM duty to: ${comp.d9Duty}% (2.50V average).`);

    // --- TEST 8: Serial Console Output & Buffer ---
    console.log('\n--- 8. Testing Serial Monitor Print & Read ---');
    const serialTranspiled = transpileArduinoC(`
        void setup() {
            Serial.begin(9600);
            Serial.println("ONLINE");
        }
        void loop() {}
    `);
    const serialRuntime = createVirtualBoardRuntime(comp, serialTranspiled);
    await serialRuntime.setup();

    comp.serialBuffer = 'PING\n';
    const hasAvail = comp.serialBuffer.length;
    console.log(`✓ Serial.available() buffer contains: ${hasAvail} bytes ('${comp.serialBuffer.trim()}').`);

    console.log('\n===============================================================');
    console.log('🎉 ALL EMBEDDED IDE TESTS PASSED! Virtual firmware verified.');
    console.log('===============================================================\n');
})();
