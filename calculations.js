/**
 * ElectroSim Pro — Deterministic Engineering Calculation Engine
 * 
 * Provides verifiable, high-precision mathematical formulas for electronics design.
 * All functions validate physical constraints, non-negative/non-zero values,
 * and provide unit conversions and standard E-series (E12 / E24) component matching.
 */

// Standard E12 and E24 preferred resistor base values (1.0 to 9.1 decade)
const E12_VALUES = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
const E24_VALUES = [
    1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
    3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1
];

/**
 * Find the nearest standard E12 or E24 resistor value
 * @param {number} rValue - Calculated theoretical resistance in Ohms
 * @param {'E12'|'E24'} series - Standard series (default 'E24')
 * @returns {number} Nearest standard commercial resistor value in Ohms
 */
function findNearestStandardResistor(rValue, series = 'E24') {
    if (rValue <= 0 || !Number.isFinite(rValue)) return 100;
    const baseTable = series === 'E12' ? E12_VALUES : E24_VALUES;
    const decade = Math.pow(10, Math.floor(Math.log10(rValue)));
    const normalized = rValue / decade;

    let closest = baseTable[0];
    let minDiff = Math.abs(normalized - closest);
    for (const val of baseTable) {
        const diff = Math.abs(normalized - val);
        if (diff < minDiff) {
            minDiff = diff;
            closest = val;
        }
    }
    return Math.round(closest * decade * 100) / 100;
}

/**
 * Format electrical quantity with metric engineering prefix (p, n, µ, m, k, M, G)
 */
function formatEngineering(value, unit = '') {
    if (value === 0 || !Number.isFinite(value)) return `0 ${unit}`.trim();
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)} G${unit}`.trim();
    if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)} M${unit}`.trim();
    if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)} k${unit}`.trim();
    if (abs >= 1) return `${sign}${abs.toFixed(2)} ${unit}`.trim();
    if (abs >= 1e-3) return `${sign}${(abs * 1e3).toFixed(2)} m${unit}`.trim();
    if (abs >= 1e-6) return `${sign}${(abs * 1e6).toFixed(2)} µ${unit}`.trim();
    if (abs >= 1e-9) return `${sign}${(abs * 1e9).toFixed(2)} n${unit}`.trim();
    return `${sign}${(abs * 1e12).toFixed(2)} p${unit}`.trim();
}

/**
 * Ohm's Law Solver: V = I * R
 * Given any two variables, accurately solves for the third.
 */
function calculateOhmsLaw({ v, i, r }) {
    const hasV = Number.isFinite(v);
    const hasI = Number.isFinite(i);
    const hasR = Number.isFinite(r);

    if (hasI && hasR && !hasV) {
        if (r < 0) throw new Error("Resistance cannot be negative.");
        const voltage = i * r;
        const power = i * i * r;
        return {
            v: voltage,
            i: i,
            r: r,
            power: power,
            formula: "V = I × R",
            explanation: `Voltage across ${formatEngineering(r, 'Ω')} carrying ${formatEngineering(i, 'A')} is ${formatEngineering(voltage, 'V')} (P = ${formatEngineering(power, 'W')}).`
        };
    } else if (hasV && hasR && !hasI) {
        if (r <= 0) throw new Error("Resistance must be greater than zero to avoid division by zero.");
        const current = v / r;
        const power = (v * v) / r;
        return {
            v: v,
            i: current,
            r: r,
            power: power,
            formula: "I = V / R",
            explanation: `Current through ${formatEngineering(r, 'Ω')} at ${formatEngineering(v, 'V')} is ${formatEngineering(current, 'A')} (P = ${formatEngineering(power, 'W')}).`
        };
    } else if (hasV && hasI && !hasR) {
        if (i === 0) throw new Error("Current cannot be zero when solving for resistance.");
        const resistance = Math.abs(v / i);
        const power = Math.abs(v * i);
        return {
            v: v,
            i: i,
            r: resistance,
            power: power,
            formula: "R = V / I",
            explanation: `Resistance required for ${formatEngineering(i, 'A')} at ${formatEngineering(v, 'V')} is ${formatEngineering(resistance, 'Ω')} (P = ${formatEngineering(power, 'W')}).`
        };
    }
    throw new Error("Provide exactly two known variables among v, i, and r.");
}

/**
 * Series Resistance: R_total = R1 + R2 + ... + Rn
 */
function calculateSeriesResistance(resistors) {
    if (!Array.isArray(resistors) || resistors.length === 0) {
        throw new Error("Must provide an array of at least one resistor value.");
    }
    let total = 0;
    for (const r of resistors) {
        if (!Number.isFinite(r) || r < 0) {
            throw new Error(`Invalid resistor value: ${r}. Resistors must be non-negative numbers.`);
        }
        total += r;
    }
    return {
        totalResistance: total,
        formatted: formatEngineering(total, 'Ω'),
        formula: "R_total = R1 + R2 + ... + Rn",
        count: resistors.length
    };
}

/**
 * Parallel Resistance: 1 / R_total = 1/R1 + 1/R2 + ... + 1/Rn
 */
function calculateParallelResistance(resistors) {
    if (!Array.isArray(resistors) || resistors.length === 0) {
        throw new Error("Must provide an array of at least one resistor value.");
    }
    // If any resistor is 0, total resistance is 0 (short circuit)
    if (resistors.some(r => r === 0)) {
        return {
            totalResistance: 0,
            formatted: "0 Ω (Dead short)",
            formula: "Parallel short circuit dominates",
            count: resistors.length
        };
    }
    let conductanceSum = 0;
    for (const r of resistors) {
        if (!Number.isFinite(r) || r < 0) {
            throw new Error(`Invalid resistor value: ${r}. Resistors must be positive numbers.`);
        }
        conductanceSum += 1 / r;
    }
    const total = 1 / conductanceSum;
    return {
        totalResistance: total,
        formatted: formatEngineering(total, 'Ω'),
        formula: "1/R_total = 1/R1 + 1/R2 + ... + 1/Rn",
        count: resistors.length
    };
}

/**
 * Current-Limiting Resistor Calculation for LEDs:
 * R = (V_supply - V_forward) / I_led
 */
function calculateLedResistor({ vSupply, vForward = 2.0, iLed = 0.02 }) {
    if (!Number.isFinite(vSupply) || vSupply <= 0) {
        throw new Error("Supply voltage (vSupply) must be a positive number.");
    }
    if (!Number.isFinite(vForward) || vForward <= 0) {
        throw new Error("LED forward voltage (vForward) must be a positive number.");
    }
    if (!Number.isFinite(iLed) || iLed <= 0) {
        throw new Error("Target LED current (iLed) must be a positive number (typically 0.01 to 0.02 A).");
    }
    if (vSupply <= vForward) {
        throw new Error(`Supply voltage (${vSupply}V) must be greater than LED forward voltage (${vForward}V) to conduct.`);
    }

    const vDrop = vSupply - vForward;
    const rTheoretical = vDrop / iLed;
    const rStandardE24 = findNearestStandardResistor(rTheoretical, 'E24');
    const rStandardE12 = findNearestStandardResistor(rTheoretical, 'E12');

    // Actual current using the nearest E24 resistor
    const iActual = vDrop / rStandardE24;
    // Resistor power dissipation: P = I^2 * R
    const pResistor = iActual * iActual * rStandardE24;
    // Standard commercial 1/4W rating check
    const isQuarterWattSafe = pResistor < 0.250;
    const recommendedPowerRating = pResistor < 0.125 ? "1/8 W (125 mW)" :
                                   pResistor < 0.250 ? "1/4 W (250 mW)" :
                                   pResistor < 0.500 ? "1/2 W (500 mW)" : "1 W+ Power Resistor";

    return {
        vSupply,
        vForward,
        vResistorDrop: vDrop,
        targetCurrent: iLed,
        rTheoretical,
        rTheoreticalFormatted: formatEngineering(rTheoretical, 'Ω'),
        rStandardE24,
        rStandardE24Formatted: formatEngineering(rStandardE24, 'Ω'),
        rStandardE12,
        actualCurrent: iActual,
        actualCurrentFormatted: formatEngineering(iActual, 'A'),
        resistorPowerDissipation: pResistor,
        resistorPowerFormatted: formatEngineering(pResistor, 'W'),
        isQuarterWattSafe,
        recommendedPowerRating,
        formula: "R = (V_supply - V_forward) / I_led; P = I² × R",
        explanation: `With a ${vSupply}V supply and a ${vForward}V LED, the resistor drops ${vDrop.toFixed(2)}V. For ${formatEngineering(iLed, 'A')}, theoretical R is ${formatEngineering(rTheoretical, 'Ω')}. The nearest standard commercial resistor is ${formatEngineering(rStandardE24, 'Ω')} (E24), giving ${formatEngineering(iActual, 'A')} actual current and dissipating ${formatEngineering(pResistor, 'W')} (well suited for standard ${recommendedPowerRating}).`
    };
}

/**
 * Power Dissipation: P = V * I = I^2 * R = V^2 / R
 */
function calculatePowerDissipation({ v, i, r }) {
    let power = 0;
    let formula = "";
    if (Number.isFinite(v) && Number.isFinite(i)) {
        power = v * i;
        formula = "P = V × I";
    } else if (Number.isFinite(i) && Number.isFinite(r)) {
        if (r < 0) throw new Error("Resistance cannot be negative.");
        power = i * i * r;
        formula = "P = I² × R";
    } else if (Number.isFinite(v) && Number.isFinite(r)) {
        if (r <= 0) throw new Error("Resistance must be greater than zero.");
        power = (v * v) / r;
        formula = "P = V² / R";
    } else {
        throw new Error("Provide at least (v, i), (i, r), or (v, r) to calculate power.");
    }

    return {
        power,
        powerFormatted: formatEngineering(power, 'W'),
        formula,
        isQuarterWattSafe: power <= 0.250,
        isHalfWattSafe: power <= 0.500
    };
}

/**
 * Voltage Divider:
 * Unloaded: V_out = V_in * (R2 / (R1 + R2))
 * Loaded: R2_eff = R2 || R_load
 */
function calculateVoltageDivider({ vIn, r1, r2, rLoad = null }) {
    if (!Number.isFinite(vIn)) throw new Error("Input voltage (vIn) must be a finite number.");
    if (!Number.isFinite(r1) || r1 <= 0) throw new Error("R1 must be greater than zero.");
    if (!Number.isFinite(r2) || r2 < 0) throw new Error("R2 must be non-negative.");

    // Unloaded calculation
    const vOutUnloaded = vIn * (r2 / (r1 + r2));
    const quiescentCurrent = vIn / (r1 + r2);
    const totalPower = vIn * quiescentCurrent;
    const pR1 = quiescentCurrent * quiescentCurrent * r1;
    const pR2 = quiescentCurrent * quiescentCurrent * r2;

    const result = {
        vIn,
        r1,
        r2,
        vOutUnloaded,
        vOutUnloadedFormatted: formatEngineering(vOutUnloaded, 'V'),
        quiescentCurrent,
        quiescentCurrentFormatted: formatEngineering(quiescentCurrent, 'A'),
        totalPower,
        totalPowerFormatted: formatEngineering(totalPower, 'W'),
        pR1Formatted: formatEngineering(pR1, 'W'),
        pR2Formatted: formatEngineering(pR2, 'W'),
        theveninResistance: (r1 * r2) / (r1 + r2),
        theveninResistanceFormatted: formatEngineering((r1 * r2) / (r1 + r2), 'Ω'),
        formula: "V_out = V_in × [ R2 / (R1 + R2) ]"
    };

    if (Number.isFinite(rLoad) && rLoad > 0) {
        const r2Eff = (r2 * rLoad) / (r2 + rLoad);
        const vOutLoaded = vIn * (r2Eff / (r1 + r2Eff));
        result.rLoad = rLoad;
        result.vOutLoaded = vOutLoaded;
        result.vOutLoadedFormatted = formatEngineering(vOutLoaded, 'V');
        result.voltageDropUnderLoad = vOutUnloaded - vOutLoaded;
        result.loadingErrorPercent = ((vOutUnloaded - vOutLoaded) / vOutUnloaded) * 100;
    }

    return result;
}

/**
 * RC Time Constant and Frequency Response:
 * τ = R * C
 * f_c = 1 / (2 * π * R * C)
 */
function calculateRcTimeConstant({ r, c }) {
    if (!Number.isFinite(r) || r <= 0) throw new Error("Resistance must be greater than zero.");
    if (!Number.isFinite(c) || c <= 0) throw new Error("Capacitance must be greater than zero.");

    const tau = r * c;
    const cutoffFreq = 1 / (2 * Math.PI * r * c);

    return {
        r,
        c,
        tau,
        tauFormatted: formatEngineering(tau, 's'),
        t63Percent: tau, // 63.2% charge
        t95Percent: 3 * tau, // 95% charge
        t99Percent: 5 * tau, // 99.3% charge
        cutoffFrequency: cutoffFreq,
        cutoffFrequencyFormatted: formatEngineering(cutoffFreq, 'Hz'),
        formula: "τ = R × C; f_c = 1 / (2π × R × C)",
        explanation: `Time constant τ is ${formatEngineering(tau, 's')}. Capacitor reaches 63.2% in 1τ (${formatEngineering(tau, 's')}) and 99.3% in 5τ (${formatEngineering(5 * tau, 's')}). Low-pass cutoff frequency is ${formatEngineering(cutoffFreq, 'Hz')}.`
    };
}

/**
 * Capacitive and Inductive Reactance:
 * X_C = 1 / (2 * π * f * C)
 * X_L = 2 * π * f * L
 * Resonance: f_0 = 1 / (2 * π * sqrt(L * C))
 */
function calculateReactance({ frequency, capacitance = null, inductance = null }) {
    if (!Number.isFinite(frequency) || frequency <= 0) {
        throw new Error("Frequency must be a positive number.");
    }

    const result = { frequency, frequencyFormatted: formatEngineering(frequency, 'Hz') };

    if (Number.isFinite(capacitance) && capacitance > 0) {
        const xc = 1 / (2 * Math.PI * frequency * capacitance);
        result.capacitance = capacitance;
        result.xc = xc;
        result.xcFormatted = formatEngineering(xc, 'Ω');
        result.xcFormula = "X_c = 1 / (2π × f × C)";
    }

    if (Number.isFinite(inductance) && inductance > 0) {
        const xl = 2 * Math.PI * frequency * inductance;
        result.inductance = inductance;
        result.xl = xl;
        result.xlFormatted = formatEngineering(xl, 'Ω');
        result.xlFormula = "X_l = 2π × f × L";
    }

    if (Number.isFinite(capacitance) && capacitance > 0 && Number.isFinite(inductance) && inductance > 0) {
        const f0 = 1 / (2 * Math.PI * Math.sqrt(inductance * capacitance));
        result.resonantFrequency = f0;
        result.resonantFrequencyFormatted = formatEngineering(f0, 'Hz');
        result.resonanceFormula = "f_0 = 1 / (2π × √(L × C))";
    }

    return result;
}

// Export for Node.js environments and attach to browser window if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        E12_VALUES,
        E24_VALUES,
        findNearestStandardResistor,
        formatEngineering,
        calculateOhmsLaw,
        calculateSeriesResistance,
        calculateParallelResistance,
        calculateLedResistor,
        calculatePowerDissipation,
        calculateVoltageDivider,
        calculateRcTimeConstant,
        calculateReactance
    };
}
if (typeof window !== 'undefined') {
    window.EngineeringMath = {
        E12_VALUES,
        E24_VALUES,
        findNearestStandardResistor,
        formatEngineering,
        calculateOhmsLaw,
        calculateSeriesResistance,
        calculateParallelResistance,
        calculateLedResistor,
        calculatePowerDissipation,
        calculateVoltageDivider,
        calculateRcTimeConstant,
        calculateReactance
    };
}

