/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: NPN Transistor (npn_bjt)
 * Category: SEMI
 * Manufacturer / Part Reference: 2N2222A (Central Semi / STMicro)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['npn_bjt'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "npn_bjt",
    "name": "NPN Transistor",
    "symbol": "Q",
    "desc": "2N2222 Switching BJT",
    "category": "semi",
    "terminals": 3,
    "defaultVal": 100,
    "unit": "hFE",
    "datasheet": {
        "partNumber": "2N2222A (Central Semi / STMicro)",
        "title": "NPN High-Speed Switching & Amplifier Bipolar Transistor",
        "category": "Active Semiconductor / BJT Transistor",
        "package": "TO-92 / TO-18 3-Lead Package",
        "description": "The 2N2222A is the industry-standard NPN silicon bipolar junction transistor designed for high-speed saturated switching, microcontroller GPIO load driving, and general audio/RF amplification.",
        "pinout": [
            {
                "pin": 0,
                "name": "Base (B)",
                "desc": "Input control pin (Pin 0, Left). 0.7V forward bias initiates collector-emitter conduction"
            },
            {
                "pin": 1,
                "name": "Collector (C)",
                "desc": "Current sink pin (Pin 1, Top-Right). Connects to load to be switched"
            },
            {
                "pin": 2,
                "name": "Emitter (E)",
                "desc": "Reference return pin (Pin 2, Bottom-Right). Typically connects to Ground (0V)"
            }
        ],
        "maxRatings": [
            {
                "param": "Collector-Emitter Breakdown Voltage",
                "symbol": "V_CEO",
                "max": "40",
                "unit": "V"
            },
            {
                "param": "Collector-Base Voltage",
                "symbol": "V_CBO",
                "max": "75",
                "unit": "V"
            },
            {
                "param": "Emitter-Base Voltage",
                "symbol": "V_EBO",
                "max": "6.0",
                "unit": "V"
            },
            {
                "param": "Continuous Collector Current",
                "symbol": "I_C",
                "max": "800",
                "unit": "mA"
            },
            {
                "param": "Total Device Dissipation (@ 25°C)",
                "symbol": "P_D",
                "max": "625",
                "unit": "mW"
            }
        ],
        "characteristics": [
            {
                "param": "DC Current Gain (h_FE @ 150mA)",
                "symbol": "h_FE",
                "min": "100",
                "typ": "200",
                "max": "300",
                "unit": "-"
            },
            {
                "param": "Collector Saturation Voltage (@ 150mA)",
                "symbol": "V_CE(sat)",
                "min": "-",
                "typ": "0.2",
                "max": "0.4",
                "unit": "V"
            },
            {
                "param": "Base Saturation Voltage (@ 150mA)",
                "symbol": "V_BE(sat)",
                "min": "0.6",
                "typ": "0.75",
                "max": "1.2",
                "unit": "V"
            }
        ],
        "appNotes": "For MCU GPIO switching, always calculate Base resistor R_B = (V_GPIO - 0.7V) / I_B. Use forced beta rule (h_FE_sat = 10 to 20) to ensure deep saturation and minimize transistor heating."
    }
};
});
