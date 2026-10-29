/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: Switch (switch)
 * Category: CONTROL
 * Manufacturer / Part Reference: 7101SYZQE (C&K / NKK Switches)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['switch'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "switch",
    "name": "Switch",
    "symbol": "SW",
    "desc": "Toggle Switch",
    "category": "control",
    "terminals": 2,
    "defaultVal": 1,
    "unit": "State",
    "datasheet": {
        "partNumber": "7101SYZQE (C&K / NKK Switches)",
        "title": "Subminiature Sealed SPDT/SPST Toggle Switch",
        "category": "Electromechanical / Manual Switch",
        "package": "Panel-Mount Threaded Bushing with Solder Lug Terminals",
        "description": "Single-Pole Double-Throw (SPDT) miniature toggle switch featuring silver-plated brass contacts, epoxy terminal seal, and rugged stainless steel actuator. Configurable as SPST on/off.",
        "pinout": [
            {
                "pin": 0,
                "name": "Terminal 1 (Common / Input)",
                "desc": "Pole terminal connecting to internal movable wiper blade"
            },
            {
                "pin": 1,
                "name": "Terminal 2 (Normally Open)",
                "desc": "Contact made when toggle lever is switched ON"
            }
        ],
        "maxRatings": [
            {
                "param": "Contact Rating (Resistive Load)",
                "symbol": "I_rated",
                "max": "5A @ 120VAC / 28VDC (2A @ 250VAC)",
                "unit": "A"
            },
            {
                "param": "Dielectric Strength (1 min)",
                "symbol": "V_dielec",
                "max": "1000",
                "unit": "V rms"
            },
            {
                "param": "Operating Temperature",
                "symbol": "T_OP",
                "max": "-30 to +85",
                "unit": "°C"
            }
        ],
        "characteristics": [
            {
                "param": "Initial Contact Resistance",
                "symbol": "R_contact",
                "min": "-",
                "typ": "4.5",
                "max": "10.0",
                "unit": "mΩ"
            },
            {
                "param": "Insulation Resistance (@ 500VDC)",
                "symbol": "R_ins",
                "min": "1,000",
                "typ": "10,000",
                "max": "-",
                "unit": "MΩ"
            },
            {
                "param": "Electrical Life at Rated Load",
                "symbol": "Life_elec",
                "min": "40,000",
                "typ": "60,000",
                "max": "-",
                "unit": "cycles"
            },
            {
                "param": "Mechanical Life (No Load)",
                "symbol": "Life_mech",
                "min": "100,000",
                "typ": "200,000",
                "max": "-",
                "unit": "cycles"
            }
        ],
        "appNotes": "Low-voltage DC switching creates no sustained arc. For inductive or capacitive loads, derate current by 50% or incorporate a spark quench snubber to prevent contact pitting."
    }
};
});
