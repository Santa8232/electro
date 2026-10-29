/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: Inductor (inductor)
 * Category: PASSIVE
 * Manufacturer / Part Reference: RLB0914-103KL (Bourns)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['inductor'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "inductor",
    "name": "Inductor",
    "symbol": "L",
    "desc": "Magnetic Inductance",
    "category": "passive",
    "terminals": 2,
    "defaultVal": 10,
    "unit": "mH",
    "datasheet": {
        "partNumber": "RLB0914-103KL (Bourns)",
        "title": "Radial Lead Drum Core RF / Power Choke Inductor",
        "category": "Passive Components / Fixed Inductor",
        "package": "Radial Drum Core with Shrink-Tubing (8.7mm Dia × 12mm Height, 5mm Pitch)",
        "description": "Ferrite core wire-wound radial choke offering high inductance, low DC resistance, and high saturation current. Widely applied in DC-DC converters, EMI filters, and resonant tank circuits.",
        "pinout": [
            {
                "pin": 0,
                "name": "Lead 1 (Terminal A)",
                "desc": "Bilateral non-polarized copper winding"
            },
            {
                "pin": 1,
                "name": "Lead 2 (Terminal B)",
                "desc": "Bilateral non-polarized copper winding"
            }
        ],
        "maxRatings": [
            {
                "param": "Rated Continuous DC Current",
                "symbol": "I_DC",
                "max": "150",
                "unit": "mA"
            },
            {
                "param": "Saturation Current (10% drop in L)",
                "symbol": "I_sat",
                "max": "180",
                "unit": "mA"
            },
            {
                "param": "Dielectric Insulation Voltage",
                "symbol": "V_iso",
                "max": "1000",
                "unit": "V AC"
            },
            {
                "param": "Operating Temperature Range",
                "symbol": "T_OP",
                "max": "-40 to +125",
                "unit": "°C"
            }
        ],
        "characteristics": [
            {
                "param": "Nominal Inductance (1kHz, 1V)",
                "symbol": "L",
                "min": "9.0",
                "typ": "10.0",
                "max": "11.0",
                "unit": "mH"
            },
            {
                "param": "DC Resistance (DCR @ 20°C)",
                "symbol": "R_DC",
                "min": "20.0",
                "typ": "25.5",
                "max": "32.0",
                "unit": "Ω"
            },
            {
                "param": "Self-Resonant Frequency",
                "symbol": "SRF",
                "min": "0.65",
                "typ": "0.85",
                "max": "1.20",
                "unit": "MHz"
            },
            {
                "param": "Quality Factor (Q min @ 252kHz)",
                "symbol": "Q",
                "min": "25",
                "typ": "45",
                "max": "-",
                "unit": "-"
            }
        ],
        "appNotes": "Current through an inductor cannot change instantaneously (V = L·di/dt). When interrupting inductive branch current, use a flyback suppression diode or snubber to clamp inductive kickback spikes."
    }
};
});
