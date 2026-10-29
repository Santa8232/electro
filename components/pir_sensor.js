/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: HC-SR501 PIR (pir_sensor)
 * Category: IOT
 * Manufacturer / Part Reference: HC-SR501 (Nisheng / BISS0001)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['pir_sensor'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "pir_sensor",
    "name": "HC-SR501 PIR",
    "symbol": "PIR",
    "desc": "Pyroelectric Infrared Motion Sensor",
    "category": "iot",
    "terminals": 3,
    "defaultVal": 3.3,
    "unit": "V",
    "datasheet": {
        "partNumber": "HC-SR501 (Nisheng / BISS0001)",
        "title": "Pyroelectric Passive Infrared (PIR) Human Motion Sensor Module",
        "category": "Sensors / Infrared Security",
        "package": "PCB with Faceted Polyethylene Fresnel Dome (32.0mm × 24.0mm)",
        "description": "The HC-SR501 PIR sensor detects human and animal infrared motion within a 7-meter cone using a dual-element pyroelectric sensor and a BISS0001 micro-power PIR motion detector IC. Includes adjustable trimpots for sensitivity (distance) and output delay timing (0.3s - 5min).",
        "pinout": [
            {
                "pin": 0,
                "name": "VCC (Input Power)",
                "desc": "DC supply voltage (+4.5V to +12.0V DC, onboard 3.3V regulator)"
            },
            {
                "pin": 1,
                "name": "OUT (Digital Output)",
                "desc": "3.3V TTL active HIGH pulse when motion detected; 0V when standby"
            },
            {
                "pin": 2,
                "name": "GND (System Ground)",
                "desc": "Ground reference return"
            }
        ],
        "maxRatings": [
            {
                "param": "DC Input Voltage Rail",
                "symbol": "V_IN",
                "max": "12.0",
                "unit": "V"
            },
            {
                "param": "Quiescent Drain Current",
                "symbol": "I_drain",
                "max": "65",
                "unit": "µA"
            },
            {
                "param": "Output Signal High Level",
                "symbol": "V_OH",
                "max": "3.3",
                "unit": "V"
            },
            {
                "param": "Detection Range Angle",
                "symbol": "θ_cone",
                "max": "110",
                "unit": "deg"
            }
        ],
        "characteristics": [
            {
                "param": "Maximum Detection Distance",
                "symbol": "D_detect",
                "min": "3",
                "typ": "5 - 7",
                "max": "7",
                "unit": "m"
            },
            {
                "param": "Output Delay Adjustment Range",
                "symbol": "t_delay",
                "min": "0.3",
                "typ": "3.0",
                "max": "300.0",
                "unit": "s"
            },
            {
                "param": "Blockade Time After Pulse",
                "symbol": "t_block",
                "min": "2.5",
                "typ": "2.5",
                "max": "2.5",
                "unit": "s"
            },
            {
                "param": "Pyroelectric Spectral Response",
                "symbol": "λ_IR",
                "min": "7",
                "typ": "10",
                "max": "14",
                "unit": "µm"
            }
        ],
        "appNotes": "The Fresnel lens splits the detection area into optical zones. When a warm body moves between zones, differential IR radiation triggers the BISS0001 band-pass filter and comparator. Avoid mounting directly facing heat vents or incandescent lights."
    }
};
});
