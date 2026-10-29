/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: ESP32 NodeMCU (esp32)
 * Category: IOT
 * Manufacturer / Part Reference: ESP-WROOM-32 (Espressif Systems)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['esp32'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "esp32",
    "name": "ESP32 NodeMCU",
    "symbol": "ESP32",
    "desc": "Dual-Core 240MHz Wi-Fi/BLE SoC (30 DIP Pins: 18 GPIOs, 6 ADCs, 2 DACs, Power)",
    "category": "iot",
    "terminals": 30,
    "defaultVal": 3.3,
    "unit": "V",
    "datasheet": {
        "partNumber": "ESP-WROOM-32 (Espressif Systems)",
        "title": "Dual-Core 240MHz Wi-Fi & Bluetooth IoT System-on-Chip Module",
        "category": "IoT Compute / RF Transceiver SoC",
        "package": "30-Pin NodeMCU-32S DIP Module (51.0mm × 28.5mm)",
        "description": "The ESP-WROOM-32 is a powerful Wi-Fi+BT+BLE MCU module targeting high-performance IoT applications. Built around the dual-core Tensilica Xtensa 32-bit LX6 microprocessor operating up to 240 MHz. Features 520 KB SRAM, 4 MB SPI Flash, integrated antenna switch, RF balun, power amplifier, low-noise receive amplifier, and 30 DIP header pins.",
        "pinout": [
            {
                "pin": 0,
                "name": "3V3 (Power Output)",
                "desc": "Regulated +3.3V DC power rail from on-board AMS1117-3.3 regulator (600mA peak)"
            },
            {
                "pin": 1,
                "name": "GND (System Ground)",
                "desc": "Ground return path and RF reference"
            },
            {
                "pin": 2,
                "name": "VN (GPIO39 / SENSOR_VN)",
                "desc": "Low-noise 12-bit ADC1_CH3 input (0-3.3V, 4096 levels)"
            },
            {
                "pin": 3,
                "name": "D2 (GPIO2 / Blue LED)",
                "desc": "Strapping pin & general GPIO tied to on-board blue status LED / Touch 2"
            },
            {
                "pin": 4,
                "name": "D4 (GPIO4 / ADC2_CH0)",
                "desc": "General purpose digital I/O / Capacitive Touch 0 / ADC2 channel 0"
            },
            {
                "pin": 5,
                "name": "D18 (GPIO18 / VSPI CLK)",
                "desc": "Hardware VSPI bus clock pin / general digital GPIO"
            },
            {
                "pin": 6,
                "name": "D21 (GPIO21 / I2C SDA)",
                "desc": "Hardware I2C serial data interface / wire bus"
            },
            {
                "pin": 7,
                "name": "EN (Chip Enable / Reset)",
                "desc": "Active-HIGH chip enable with internal weak pull-up"
            },
            {
                "pin": 8,
                "name": "VP (GPIO36 / SENSOR_VP)",
                "desc": "Low-noise 12-bit ADC1_CH0 input (0-3.3V range)"
            },
            {
                "pin": 9,
                "name": "D34 (GPIO34 / ADC1_CH6)",
                "desc": "12-bit ADC input channel 6 (Input-only pin, no pull-up)"
            },
            {
                "pin": 10,
                "name": "D35 (GPIO35 / ADC1_CH7)",
                "desc": "12-bit ADC input channel 7 (Input-only pin, no pull-up)"
            },
            {
                "pin": 11,
                "name": "D32 (GPIO32 / ADC1_CH4)",
                "desc": "12-bit ADC input channel 4 / Capacitive Touch 9"
            },
            {
                "pin": 12,
                "name": "D33 (GPIO33 / ADC1_CH5)",
                "desc": "12-bit ADC input channel 5 / Capacitive Touch 8"
            },
            {
                "pin": 13,
                "name": "D25 (GPIO25 / DAC1)",
                "desc": "8-bit Digital-to-Analog Converter 1 / ADC2_CH8"
            },
            {
                "pin": 14,
                "name": "D26 (GPIO26 / DAC2)",
                "desc": "8-bit Digital-to-Analog Converter 2 / ADC2_CH9"
            },
            {
                "pin": 15,
                "name": "D27 (GPIO27 / Touch 7)",
                "desc": "General digital GPIO / Capacitive Touch 7"
            },
            {
                "pin": 16,
                "name": "D14 (GPIO14 / HSPI CLK)",
                "desc": "Hardware HSPI clock / Capacitive Touch 6"
            },
            {
                "pin": 17,
                "name": "D12 (GPIO12 / HSPI MISO)",
                "desc": "Hardware HSPI MISO / Capacitive Touch 5 (Strapping)"
            },
            {
                "pin": 18,
                "name": "VIN (5V Input / VBUS)",
                "desc": "5V power input from microUSB port (connected to LDO regulator)"
            },
            {
                "pin": 19,
                "name": "D23 (GPIO23 / VSPI MOSI)",
                "desc": "Hardware VSPI Master Out Slave In / general GPIO"
            },
            {
                "pin": 20,
                "name": "D22 (GPIO22 / I2C SCL)",
                "desc": "Hardware I2C serial clock line"
            },
            {
                "pin": 21,
                "name": "TX0 (GPIO1 / U0TXD)",
                "desc": "Primary UART0 serial transmitter / USB programming console"
            },
            {
                "pin": 22,
                "name": "RX0 (GPIO3 / U0RXD)",
                "desc": "Primary UART0 serial receiver / USB programming console"
            },
            {
                "pin": 23,
                "name": "D19 (GPIO19 / VSPI MISO)",
                "desc": "Hardware VSPI Master In Slave Out / general GPIO"
            },
            {
                "pin": 24,
                "name": "D5 (GPIO5 / VSPI CS)",
                "desc": "Hardware VSPI Chip Select / Strapping pin"
            },
            {
                "pin": 25,
                "name": "TX2 (GPIO17 / U2TXD)",
                "desc": "Secondary UART2 serial transmitter"
            },
            {
                "pin": 26,
                "name": "RX2 (GPIO16 / U2RXD)",
                "desc": "Secondary UART2 serial receiver"
            },
            {
                "pin": 27,
                "name": "D15 (GPIO15 / HSPI CS)",
                "desc": "Hardware HSPI Chip Select / Capacitive Touch 3"
            },
            {
                "pin": 28,
                "name": "GND2 (System Ground 2)",
                "desc": "Second system ground reference terminal"
            },
            {
                "pin": 29,
                "name": "3V3_2 (Power Output 2)",
                "desc": "Auxiliary +3.3V DC power rail connection"
            }
        ],
        "maxRatings": [
            {
                "param": "Operating Logic Voltage (VCC)",
                "symbol": "V_DD",
                "max": "3.6",
                "unit": "V"
            },
            {
                "param": "Cumulative GPIO Output Current",
                "symbol": "I_total",
                "max": "120",
                "unit": "mA"
            },
            {
                "param": "Per-Pin GPIO Sink/Source Current",
                "symbol": "I_pin",
                "max": "12",
                "unit": "mA"
            },
            {
                "param": "Deep Sleep Current Consumption",
                "symbol": "I_sleep",
                "max": "5",
                "unit": "µA"
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
                "param": "Wi-Fi Protocol 802.11 b/g/n Speed",
                "symbol": "PHY_rate",
                "min": "1.0",
                "typ": "72.2",
                "max": "150.0",
                "unit": "Mbps"
            },
            {
                "param": "RF Frequency Spectrum",
                "symbol": "f_RF",
                "min": "2412",
                "typ": "2442",
                "max": "2484",
                "unit": "MHz"
            },
            {
                "param": "RF Output Power (802.11b, CCK 1Mbps)",
                "symbol": "P_out",
                "min": "-",
                "typ": "+20",
                "max": "-",
                "unit": "dBm"
            },
            {
                "param": "ADC Resolution (Successive Approx)",
                "symbol": "ADC_bit",
                "min": "-",
                "typ": "12 (4096 steps)",
                "max": "-",
                "unit": "Bits"
            }
        ],
        "appNotes": "ESP32 GPIO pins operate at 3.3V and are NOT 5V tolerant! Applying 5V directly to GPIO2, GPIO4, or VN will permanently damage the silicon gate oxide. Always verify power isolation before energizing circuit."
    }
};
});
