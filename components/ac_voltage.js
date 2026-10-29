/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: AC Voltage (ac_voltage)
 * Category: POWER
 * Manufacturer / Part Reference: LAB-AC-500 (Rigol / BK Precision)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['ac_voltage'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "ac_voltage",
    "name": "AC Voltage",
    "symbol": "V_AC",
    "desc": "Alternating Sine Source",
    "category": "power",
    "terminals": 2,
    "defaultVal": 12,
    "unit": "V",
    "datasheet": {
        "partNumber": "LAB-AC-500 (Rigol / BK Precision)",
        "title": "Laboratory Precision AC Sinusoidal Signal Source",
        "category": "Instrumentation / AC Power Generation",
        "package": "BNC / Dual Binding Post Instrument Output Interface",
        "description": "Benchtop AC sinusoidal waveform generator providing calibrated RMS AC excitation voltages with low harmonic distortion and calibrated internal 50Ω output impedance.",
        "pinout": [
            {
                "pin": 0,
                "name": "Return / Low (0V Neutral)",
                "desc": "Reference return terminal or common"
            },
            {
                "pin": 1,
                "name": "Line / High (AC Signal)",
                "desc": "Sinusoidal AC excitation potential (V_pk = V_rms · √2)"
            }
        ],
        "maxRatings": [
            {
                "param": "Peak Output Voltage",
                "symbol": "V_peak",
                "max": "35",
                "unit": "V pk"
            },
            {
                "param": "Max Continuous Output Current",
                "symbol": "I_out_max",
                "max": "500",
                "unit": "mA rms"
            },
            {
                "param": "Frequency Range",
                "symbol": "f_range",
                "max": "100",
                "unit": "kHz"
            }
        ],
        "characteristics": [
            {
                "param": "Output Voltage Accuracy (1kHz)",
                "symbol": "V_acc",
                "min": "-1.0",
                "typ": "±0.5",
                "max": "+1.0",
                "unit": "%"
            },
            {
                "param": "Total Harmonic Distortion (THD)",
                "symbol": "THD",
                "min": "-",
                "typ": "< 0.08",
                "max": "0.2",
                "unit": "%"
            },
            {
                "param": "Output Impedance",
                "symbol": "Z_out",
                "min": "49.5",
                "typ": "50.0",
                "max": "50.5",
                "unit": "Ω"
            },
            {
                "param": "Frequency Stability",
                "symbol": "f_stab",
                "min": "-",
                "typ": "±2.0",
                "max": "5.0",
                "unit": "ppm"
            }
        ],
        "appNotes": "Sinusoidal signal: V(t) = V_pk · sin(2πft). For an AC source with V_rms = 12V, peak amplitude is V_pk = 12 · 1.414 = 16.97V."
    }
};
});
