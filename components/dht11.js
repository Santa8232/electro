/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: DHT11 Sensor (dht11)
 * Category: IOT
 * Manufacturer / Part Reference: DHT11 (Aosong Electronics)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['dht11'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "dht11",
    "name": "DHT11 Sensor",
    "symbol": "DHT11",
    "desc": "Digital Relative Humidity & Temp Sensor",
    "category": "iot",
    "terminals": 3,
    "defaultVal": 24,
    "unit": "°C",
    "datasheet": {
        "partNumber": "DHT11 (Aosong Electronics)",
        "title": "Calibrated Digital Temperature & Relative Humidity Sensor Module",
        "category": "Sensors / Environmental Transducers",
        "package": "4-Pin Single-Row Leaded (Body 15.5mm × 12.0mm × 5.5mm)",
        "description": "The DHT11 is a basic, low-cost digital temperature and humidity sensor. Utilizes a resistive-type humidity measurement component and an NTC temperature measurement component connected to an 8-bit microcontroller. Communicates over a single-wire bi-directional serial bus protocol transmitting 40-bit data packets.",
        "pinout": [
            {
                "pin": 0,
                "name": "VCC (Supply Rail)",
                "desc": "Power supply input (+3.3V to +5.5V DC)"
            },
            {
                "pin": 1,
                "name": "DATA (Serial Single-Bus)",
                "desc": "Single-wire bidirectional serial bus. Requires 4.7k - 10kΩ pull-up resistor to VCC"
            },
            {
                "pin": 2,
                "name": "GND (Ground)",
                "desc": "Power ground return"
            }
        ],
        "maxRatings": [
            {
                "param": "Supply Voltage",
                "symbol": "V_DD",
                "max": "5.5",
                "unit": "V"
            },
            {
                "param": "Operating Humidity Range",
                "symbol": "RH_range",
                "max": "20 to 90",
                "unit": "%RH"
            },
            {
                "param": "Operating Temperature Range",
                "symbol": "T_range",
                "max": "0 to 50",
                "unit": "°C"
            },
            {
                "param": "Quiescent Supply Current",
                "symbol": "I_Q",
                "max": "100",
                "unit": "µA"
            }
        ],
        "characteristics": [
            {
                "param": "Humidity Accuracy (@ 25°C)",
                "symbol": "ΔRH",
                "min": "-5.0",
                "typ": "±4.0",
                "max": "+5.0",
                "unit": "%RH"
            },
            {
                "param": "Temperature Accuracy",
                "symbol": "ΔT",
                "min": "-2.0",
                "typ": "±1.0",
                "max": "+2.0",
                "unit": "°C"
            },
            {
                "param": "Sampling Period Interval",
                "symbol": "t_sample",
                "min": "1.0",
                "typ": "1.0",
                "max": "2.0",
                "unit": "s"
            },
            {
                "param": "Active Measuring Current",
                "symbol": "I_active",
                "min": "0.5",
                "typ": "1.0",
                "max": "2.5",
                "unit": "mA"
            }
        ],
        "appNotes": "Single-bus transmission consists of an 18ms LOW start signal from MCU, followed by DHT response (80µs low, 80µs high), and 40 data bits: 16-bit RH integer/decimal, 16-bit Temp integer/decimal, and 8-bit Parity Checksum."
    }
};
});
