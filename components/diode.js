/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: Diode (1N4007) (diode)
 * Category: SEMI
 * Manufacturer / Part Reference: 1N4007 (Vishay / ON Semi)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['diode'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "diode",
    "name": "Diode (1N4007)",
    "symbol": "D",
    "desc": "1A Silicon Rectifier",
    "category": "semi",
    "terminals": 2,
    "defaultVal": 0.7,
    "unit": "Vf",
    "datasheet": {
        "partNumber": "1N4007 (Vishay / ON Semi)",
        "title": "1.0 Amp General Purpose Silicon Rectifier",
        "category": "Discrete Semiconductor / Power Rectifier",
        "package": "DO-204AL (DO-41) Axial Leaded Glass-Passivated",
        "description": "The 1N4007 is a high-voltage, general-purpose silicon rectifier diode designed for power rectification, reverse-polarity protection, inductive flyback clamping, and general commercial electronics.",
        "pinout": [
            {
                "pin": 0,
                "name": "Anode (+)",
                "desc": "Positive terminal, current enters here during forward conduction"
            },
            {
                "pin": 1,
                "name": "Cathode (-)",
                "desc": "Marked by white silver band on package body, current exits here"
            }
        ],
        "maxRatings": [
            {
                "param": "Peak Repetitive Reverse Voltage",
                "symbol": "V_RRM",
                "max": "1000",
                "unit": "V"
            },
            {
                "param": "Maximum RMS Voltage",
                "symbol": "V_RMS",
                "max": "700",
                "unit": "V"
            },
            {
                "param": "Average Rectified Forward Current",
                "symbol": "I_F(AV)",
                "max": "1.0",
                "unit": "A"
            },
            {
                "param": "Non-Repetitive Peak Forward Surge",
                "symbol": "I_FSM",
                "max": "30",
                "unit": "A"
            },
            {
                "param": "Operating Junction Temperature",
                "symbol": "T_J",
                "max": "-55 to +175",
                "unit": "°C"
            }
        ],
        "characteristics": [
            {
                "param": "Instantaneous Forward Voltage (@ 1.0A)",
                "symbol": "V_F",
                "min": "-",
                "typ": "0.7",
                "max": "1.1",
                "unit": "V"
            },
            {
                "param": "DC Reverse Current (@ rated V_RRM)",
                "symbol": "I_R",
                "min": "-",
                "typ": "0.05",
                "max": "5.0",
                "unit": "µA"
            },
            {
                "param": "Typical Junction Capacitance (@ 4V, 1MHz)",
                "symbol": "C_J",
                "min": "-",
                "typ": "15",
                "max": "-",
                "unit": "pF"
            }
        ],
        "appNotes": "Essential for inductive flyback clamping across relays and DC motors to suppress back-EMF spikes (V = -L di/dt). Place in reverse-parallel across inductive coil with cathode connected to positive rail."
    }
};
});
