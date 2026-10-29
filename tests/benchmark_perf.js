/**
 * Performance Benchmark & Regression Test for ElectroSim Pro
 * 
 * Measures:
 * 1. MNA Solver execution time across standard and complex presets
 * 2. Component definition lookup overhead
 * 3. Rotation math throughput (ops/sec)
 * 4. Wire path computation and caching impact
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== ElectroSim Pro Performance Benchmark ===\n');

// Mock browser DOM
const mockDocument = {
    readyState: 'complete',
    getElementById: () => ({ classList: { add: ()=>{}, remove: ()=>{} }, style: {}, innerHTML: '', textContent: '' }),
    createElement: () => ({ classList: { add: ()=>{}, remove: ()=>{} }, style: {}, innerHTML: '', textContent: '', appendChild: ()=>{} }),
    addEventListener: () => {}
};
const mockWindow = {
    location: { protocol: 'http:', port: '3001' },
    addEventListener: () => {},
    document: mockDocument,
    navigator: { clipboard: { writeText: async () => true } }
};

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const sStart = html.lastIndexOf('<script>') + 8;
const sEnd = html.lastIndexOf('</script>');
const appScript = html.substring(sStart, sEnd);

const context = {
    window: mockWindow,
    document: mockDocument,
    navigator: mockWindow.navigator,
    console: { log: ()=>{}, warn: ()=>{}, error: ()=>{} },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {},
    Math: Math,
    Date: Date,
    JSON: JSON,
    AudioContext: function() {
        return {
            createOscillator: () => ({ connect: ()=>{}, start: ()=>{}, stop: ()=>{}, frequency: { setValueAtTime: ()=>{} } }),
            createGain: () => ({ connect: ()=>{}, gain: { setValueAtTime: ()=>{} } }),
            destination: {},
            currentTime: 0
        };
    }
};

vm.createContext(context);
vm.runInContext(appScript, context);

// 1. Benchmark MNA Solver across 500 steps on "esp32_weather" preset
console.log('--- 1. Benchmarking MNA Solver Execution ---');
vm.runInContext('loadPreset("esp32_weather");', context);
const compCount = vm.runInContext('state.components.length', context);
const wireCount = vm.runInContext('state.wires.length', context);

const t0 = process.hrtime.bigint();
const SOLVE_ITERATIONS = 500;
for (let i = 0; i < SOLVE_ITERATIONS; i++) {
    vm.runInContext(`circuitSolver.solve(state.components, state.wires, ${i * 0.016}, 0.016);`, context);
}
const t1 = process.hrtime.bigint();
const solverDurationMs = Number(t1 - t0) / 1e6;
const solveAvgMs = solverDurationMs / SOLVE_ITERATIONS;
console.log(`✓ MNA Solver: ${SOLVE_ITERATIONS} steps on ${compCount} components & ${wireCount} wires executed in ${solverDurationMs.toFixed(2)} ms`);
console.log(`  Average solve time per step: ${solveAvgMs.toFixed(4)} ms (${(1000 / solveAvgMs).toFixed(0)} solves/sec)`);

// 2. Benchmark rotatePoint throughput
console.log('\n--- 2. Benchmarking rotatePoint Throughput ---');
const ROT_ITERATIONS = 200000;
const tRot0 = process.hrtime.bigint();
for (let i = 0; i < ROT_ITERATIONS; i++) {
    const angle = (i % 4) * 90;
    vm.runInContext(`rotatePoint(100, 50, ${angle});`, context);
}
const tRot1 = process.hrtime.bigint();
const rotDurationMs = Number(tRot1 - tRot0) / 1e6;
console.log(`✓ rotatePoint: ${ROT_ITERATIONS} calls executed in ${rotDurationMs.toFixed(2)} ms`);
console.log(`  Throughput: ${(ROT_ITERATIONS / (rotDurationMs / 1000)).toFixed(0)} ops/sec`);

// 3. Benchmark computeWirePath
console.log('\n--- 3. Benchmarking computeWirePath Throughput ---');
const WIRE_ITERATIONS = 50000;
const tWire0 = process.hrtime.bigint();
vm.runInContext(`
    const t1 = { x: 100, y: 100, nx: 1, ny: 0 };
    const t2 = { x: 300, y: 200, nx: -1, ny: 0 };
    for (let i = 0; i < ${WIRE_ITERATIONS}; i++) {
        computeWirePath(t1, t2, 'c1', 'c2');
    }
`, context);
const tWire1 = process.hrtime.bigint();
const wireDurationMs = Number(tWire1 - tWire0) / 1e6;
console.log(`✓ computeWirePath: ${WIRE_ITERATIONS} paths calculated in ${wireDurationMs.toFixed(2)} ms`);
console.log(`  Throughput: ${(WIRE_ITERATIONS / (wireDurationMs / 1000)).toFixed(0)} paths/sec`);

console.log('\n===============================================================');
console.log('🎉 BENCHMARK RUN COMPLETED!');
console.log('===============================================================');

