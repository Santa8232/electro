/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: Piezo Buzzer (buzzer)
 * Category: IOT
 * Manufacturer / Part Reference: TMB12A05 (Sonitron / CUI Devices)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['buzzer'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "buzzer",
    "name": "Piezo Buzzer",
    "symbol": "BUZZ",
    "desc": "Active 2.4kHz Acoustic Sounder",
    "category": "iot",
    "terminals": 2,
    "defaultVal": 5,
    "unit": "V",
    "datasheet": {
        "partNumber": "TMB12A05 (Sonitron / CUI Devices)",
        "title": "5V Active Electromagnetic Piezoelectric Sounder & Buzzer",
        "category": "Acoustic / Piezoelectric Transducers",
        "package": "12mm Sealed Cylindrical Housing with Top Sound Port",
        "description": "The TMB12A05 is an active electromagnetic acoustic indicator with built-in internal oscillator circuit. Produces a loud, penetrating 2400 Hz continuous sound tone when supplied with a constant DC voltage across its polarized terminals.",
        "pinout": [
            {
                "pin": 0,
                "name": "Positive Lead (+)",
                "desc": "Anode terminal with (+) mark on top of casing; connects to switched 5V rail"
            },
            {
                "pin": 1,
                "name": "Negative Lead (-)",
                "desc": "Cathode terminal; connects to system ground (0V)"
            }
        ],
        "maxRatings": [
            {
                "param": "Rated DC Operating Voltage",
                "symbol": "V_rated",
                "max": "5.0",
                "unit": "V"
            },
            {
                "param": "Operating Voltage Range",
                "symbol": "V_op",
                "max": "4.0 - 7.0",
                "unit": "V"
            },
            {
                "param": "Maximum Current Consumption",
                "symbol": "I_max",
                "max": "30",
                "unit": "mA"
            },
            {
                "param": "Operating Temperature",
                "symbol": "T_OP",
                "max": "-20 to +70",
                "unit": "°C"
            }
        ],
        "characteristics": [
            {
                "param": "Oscillator Resonant Frequency",
                "symbol": "f_res",
                "min": "2100",
                "typ": "2400",
                "max": "2700",
                "unit": "Hz"
            },
            {
                "param": "Sound Pressure Level (@ 10cm, 5V)",
                "symbol": "SPL",
                "min": "85",
                "typ": "88",
                "max": "-",
                "unit": "dBA"
            },
            {
                "param": "Internal Coil Direct Current Resistance",
                "symbol": "R_dc",
                "min": "28",
                "typ": "32",
                "max": "36",
                "unit": "Ω"
            }
        ],
        "appNotes": "Active buzzers contain internal drive circuitry and sound continuously upon DC power application. Passive buzzers lack internal oscillators and require external AC/PWM wave signals. ElectroSim Pro utilizes Web Audio API synthesis to render real acoustic sound."
    }
};
});
