/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: Photoresistor (ldr)
 * Category: IOT
 * Manufacturer / Part Reference: GL5528 (Senba Sensing)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['ldr'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "ldr",
    "name": "Photoresistor",
    "symbol": "LDR",
    "desc": "Light-Dependent Resistor (CdS 500Ω-500kΩ)",
    "category": "iot",
    "terminals": 2,
    "defaultVal": 300,
    "unit": "lux",
    "datasheet": {
        "partNumber": "GL5528 (Senba Sensing)",
        "title": "Cadmium Sulfide (CdS) Photoresistor / Light-Dependent Resistor",
        "category": "Sensors / Optoelectronic Transducers",
        "package": "5mm Epoxy Resin Encapsulated Ceramic Substrate",
        "description": "The GL5528 is a CdS photoconductive cell whose bulk semiconductor resistance decreases non-linearly with increasing incident ambient light illumination. Features wide spectral response peaking near 540nm, closely matching the human photopic eye response curve.",
        "pinout": [
            {
                "pin": 0,
                "name": "Terminal A (Pin 1)",
                "desc": "Symmetrical non-polarized photoconductive lead"
            },
            {
                "pin": 1,
                "name": "Terminal B (Pin 2)",
                "desc": "Symmetrical non-polarized photoconductive lead"
            }
        ],
        "maxRatings": [
            {
                "param": "Maximum Operating Voltage (DC/AC)",
                "symbol": "V_max",
                "max": "150",
                "unit": "V"
            },
            {
                "param": "Maximum Power Dissipation (@ 25°C)",
                "symbol": "P_max",
                "max": "100",
                "unit": "mW"
            },
            {
                "param": "Operating Ambient Temperature",
                "symbol": "T_OP",
                "max": "-30 to +70",
                "unit": "°C"
            }
        ],
        "characteristics": [
            {
                "param": "Light Resistance (@ 10 Lux daylight)",
                "symbol": "R_10",
                "min": "10",
                "typ": "15",
                "max": "20",
                "unit": "kΩ"
            },
            {
                "param": "Dark Resistance (@ 0 Lux pitch dark)",
                "symbol": "R_dark",
                "min": "1.0",
                "typ": "2.0",
                "max": "10.0",
                "unit": "MΩ"
            },
            {
                "param": "Gamma Sensitivity Characteristic (10-100 Lux)",
                "symbol": "γ",
                "min": "0.6",
                "typ": "0.7",
                "max": "0.8",
                "unit": "-"
            },
            {
                "param": "Peak Spectral Sensitivity Wavelength",
                "symbol": "λ_max",
                "min": "-",
                "typ": "540",
                "max": "-",
                "unit": "nm"
            }
        ],
        "appNotes": "Ideal for voltage divider circuits: Connect LDR in series with a fixed 10kΩ resistor. Output voltage V_out = V_supply * (R_fixed / (R_ldr + R_fixed)). High voltage corresponds to high light level when fixed resistor is pulled down to GND."
    }
};
});
