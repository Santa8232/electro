/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: Fuse / Polyfuse (fuse)
 * Category: CONTROL
 * Manufacturer / Part Reference: 0154.500DR (Littelfuse OMNI-BLOK)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['fuse'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "fuse",
    "name": "Fuse / Polyfuse",
    "symbol": "FUSE",
    "desc": "Circuit Overcurrent Protection",
    "category": "control",
    "terminals": 2,
    "defaultVal": 0.5,
    "unit": "A",
    "datasheet": {
        "partNumber": "0154.500DR (Littelfuse OMNI-BLOK)",
        "title": "500mA Fast-Acting Surface Mount & Resettable Circuit Protection Fuse",
        "category": "Circuit Protection / Overcurrent Safety Device",
        "package": "Subminiature Cartridge / Surface Mount 2-Terminal",
        "description": "The 0154.500DR is an engineered fast-acting overcurrent protection device designed to protect sensitive electronics, lithium battery packs, and embedded systems from dead shorts and catastrophic overcurrent faults.",
        "pinout": [
            {
                "pin": 0,
                "name": "Terminal 1",
                "desc": "Power supply input terminal"
            },
            {
                "pin": 1,
                "name": "Terminal 2",
                "desc": "Protected load output terminal"
            }
        ],
        "maxRatings": [
            {
                "param": "Continuous Current Rating",
                "symbol": "I_rated",
                "max": "500",
                "unit": "mA"
            },
            {
                "param": "Nominal Voltage Rating",
                "symbol": "V_max",
                "max": "125",
                "unit": "V"
            },
            {
                "param": "Interrupting Rating (@ 125V AC/DC)",
                "symbol": "I_rupt",
                "max": "50",
                "unit": "A"
            },
            {
                "param": "Melting I²t (@ 10 In)",
                "symbol": "I²t",
                "max": "0.048",
                "unit": "A²s"
            }
        ],
        "characteristics": [
            {
                "param": "Cold Resistance (Nominal)",
                "symbol": "R_cold",
                "min": "0.25",
                "typ": "0.35",
                "max": "0.45",
                "unit": "Ω"
            },
            {
                "param": "Opening Time (@ 200% Load)",
                "symbol": "t_clear",
                "min": "-",
                "typ": "< 5.0",
                "max": "10.0",
                "unit": "s"
            }
        ],
        "appNotes": "Mandatory for battery safety. When the fuse trips under a short-circuit condition, it opens into an infinite resistance state. In ElectroSim Pro, click \"Reset / Replace Fuse\" to restore continuity once the fault is cleared."
    }
};
});
