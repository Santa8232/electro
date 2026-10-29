/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: LED (led)
 * Category: SEMI
 * Manufacturer / Part Reference: WP7113ID (Kingbright)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['led'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "led",
    "name": "LED",
    "symbol": "LED",
    "desc": "Light Emitting Diode",
    "category": "semi",
    "terminals": 2,
    "defaultVal": 2,
    "unit": "Vf",
    "datasheet": {
        "partNumber": "WP7113ID (Kingbright)",
        "title": "5mm High-Efficiency Red Solid State LED Lamp",
        "category": "Optoelectronics / Indicator Diode",
        "package": "T-1 3/4 (5mm) Radial Leaded Diffused Lens",
        "description": "The High-Efficiency Red source color devices are made with Gallium Arsenide Phosphide on Gallium Phosphide Orange Light Emitting Diode. Ideal for status indicators, backlighting, and commercial electronics.",
        "pinout": [
            {
                "pin": 0,
                "name": "Anode (+)",
                "desc": "Long lead, positive terminal, connects to higher potential"
            },
            {
                "pin": 1,
                "name": "Cathode (-)",
                "desc": "Shorter lead with flat rim notch on package body, connects to GND/negative"
            }
        ],
        "maxRatings": [
            {
                "param": "Continuous Forward Current",
                "symbol": "I_F",
                "max": "25",
                "unit": "mA"
            },
            {
                "param": "Peak Forward Current (1/10 Duty @ 1kHz)",
                "symbol": "I_FP",
                "max": "140",
                "unit": "mA"
            },
            {
                "param": "Reverse Breakdown Voltage",
                "symbol": "V_R",
                "max": "5.0",
                "unit": "V"
            },
            {
                "param": "Power Dissipation",
                "symbol": "P_D",
                "max": "75",
                "unit": "mW"
            },
            {
                "param": "Operating Temperature Range",
                "symbol": "T_OP",
                "max": "-40 to +85",
                "unit": "°C"
            }
        ],
        "characteristics": [
            {
                "param": "Forward Voltage (@ I_F = 20mA)",
                "symbol": "V_F",
                "min": "1.8",
                "typ": "2.0",
                "max": "2.5",
                "unit": "V"
            },
            {
                "param": "Reverse Current (@ V_R = 5V)",
                "symbol": "I_R",
                "min": "-",
                "typ": "-",
                "max": "10",
                "unit": "µA"
            },
            {
                "param": "Peak Emission Wavelength",
                "symbol": "λ_peak",
                "min": "-",
                "typ": "627",
                "max": "-",
                "unit": "nm"
            },
            {
                "param": "Dominant Wavelength",
                "symbol": "λ_dom",
                "min": "617",
                "typ": "625",
                "max": "633",
                "unit": "nm"
            },
            {
                "param": "Luminous Intensity (@ I_F = 20mA)",
                "symbol": "I_V",
                "min": "15",
                "typ": "30",
                "max": "80",
                "unit": "mcd"
            },
            {
                "param": "Viewing Angle (2θ 1/2)",
                "symbol": "2θ",
                "min": "-",
                "typ": "60",
                "max": "-",
                "unit": "deg"
            }
        ],
        "appNotes": "Always use a series current-limiting resistor to protect the diode from thermal runaway. Recommended formula: R_series = (V_supply - V_F) / I_target. For 9V supply and 20mA target: R = (9 - 2.0) / 0.02 = 350 Ω (use standard 330 Ω or 390 Ω)."
    }
};
});
