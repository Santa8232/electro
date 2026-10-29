/**
 * Unit Test Suite for Deterministic Engineering Calculations
 */
const assert = require('assert');
const math = require('../calculations.js');

console.log('=== TEST SUITE: Deterministic Engineering Calculations ===\n');

// 1. Ohm's Law
console.log('--- 1. Testing Ohm\'s Law ---');
const vTest = math.calculateOhmsLaw({ i: 0.02, r: 330 });
assert.strictEqual(Math.round(vTest.v * 10) / 10, 6.6, 'V = I * R should be 6.6V');
console.log('✓ V = I * R: 20mA * 330Ω =', vTest.v, 'V');

const iTest = math.calculateOhmsLaw({ v: 5, r: 250 });
assert.strictEqual(iTest.i, 0.02, 'I = V / R should be 0.02A (20mA)');
console.log('✓ I = V / R: 5V / 250Ω =', iTest.i, 'A');

const rTest = math.calculateOhmsLaw({ v: 12, i: 0.04 });
assert.strictEqual(rTest.r, 300, 'R = V / I should be 300Ω');
console.log('✓ R = V / I: 12V / 0.04A =', rTest.r, 'Ω');

// Error on division by zero
assert.throws(() => math.calculateOhmsLaw({ v: 5, r: 0 }), /greater than zero/);
console.log('✓ Zero resistance division prevented');

// 2. Series & Parallel
console.log('\n--- 2. Testing Series & Parallel Resistance ---');
const sRes = math.calculateSeriesResistance([100, 220, 470]);
assert.strictEqual(sRes.totalResistance, 790);
console.log('✓ Series total: 100 + 220 + 470 =', sRes.totalResistance, 'Ω');

const pRes = math.calculateParallelResistance([1000, 1000]);
assert.strictEqual(pRes.totalResistance, 500);
console.log('✓ Parallel total: 1000 || 1000 =', pRes.totalResistance, 'Ω');

// 3. LED Resistor
console.log('\n--- 3. Testing LED Current-Limiting Resistor ---');
const led5V = math.calculateLedResistor({ vSupply: 5, vForward: 2.0, iLed: 0.02 });
assert.strictEqual(led5V.rTheoretical, 150);
assert.strictEqual(led5V.rStandardE24, 150);
assert.strictEqual(led5V.isQuarterWattSafe, true);
console.log('✓ 5V supply, 2V LED, 20mA ->', led5V.rTheoretical, 'Ω (Standard E24:', led5V.rStandardE24, 'Ω)');
console.log('  Power dissipation:', led5V.resistorPowerFormatted, '(1/4W Safe:', led5V.isQuarterWattSafe, ')');

// Check 12V supply
const led12V = math.calculateLedResistor({ vSupply: 12, vForward: 2.0, iLed: 0.02 });
assert.strictEqual(led12V.rTheoretical, 500);
assert.strictEqual(led12V.rStandardE24, 510);
console.log('✓ 12V supply, 2V LED, 20mA -> Theoretical 500Ω, nearest E24:', led12V.rStandardE24, 'Ω');

// 4. Voltage Divider
console.log('\n--- 4. Testing Voltage Divider ---');
const vDiv = math.calculateVoltageDivider({ vIn: 12, r1: 1000, r2: 1000 });
assert.strictEqual(vDiv.vOutUnloaded, 6.0);
console.log('✓ 12V input with 1k/1k divider -> Vout =', vDiv.vOutUnloaded, 'V');

const vDivLoaded = math.calculateVoltageDivider({ vIn: 12, r1: 1000, r2: 1000, rLoad: 1000 });
assert.strictEqual(vDivLoaded.vOutLoaded, 4.0);
console.log('✓ Loaded with 1k load -> Vout drops to', vDivLoaded.vOutLoaded, 'V (loading error:', vDivLoaded.loadingErrorPercent.toFixed(1), '%)');

// 5. RC Time Constant
console.log('\n--- 5. Testing RC Time Constant ---');
const rc = math.calculateRcTimeConstant({ r: 10000, c: 100e-6 }); // 10k, 100uF
assert.strictEqual(rc.tau, 1.0); // 1.0s
console.log('✓ 10kΩ and 100µF -> τ =', rc.tauFormatted, ', Cutoff freq =', rc.cutoffFrequencyFormatted);

// 6. Reactance & Resonance
console.log('\n--- 6. Testing Reactance & Resonance ---');
const react = math.calculateReactance({ frequency: 1000, capacitance: 1e-6, inductance: 10e-3 });
assert(react.xc > 150 && react.xc < 165);
console.log('✓ @ 1kHz: Xc =', react.xcFormatted, ', Xl =', react.xlFormatted, ', Resonant f0 =', react.resonantFrequencyFormatted);

console.log('\n===============================================================');
console.log('🎉 ALL DETERMINISTIC CALCULATION TESTS PASSED!');
console.log('===============================================================');

