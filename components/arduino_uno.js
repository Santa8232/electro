/**
 * ElectroSim Pro — Component Specification & Full Datasheet
 * Part: Arduino Uno R3 (arduino_uno)
 * Category: IOT
 * Manufacturer / Part Reference: ATmega328P-PU (Microchip / Arduino)
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.ELECTRO_COMPONENTS = root.ELECTRO_COMPONENTS || {};
        root.ELECTRO_COMPONENTS['arduino_uno'] = factory();
    }
})(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    return {
    "id": "arduino_uno",
    "name": "Arduino Uno R3",
    "symbol": "UNO R3",
    "desc": "ATmega328P 16MHz AVR Board (29 Header Pins: 14 Digital, 6 Analog ADC, Power Rails)",
    "category": "iot",
    "terminals": 29,
    "defaultVal": 5,
    "unit": "V",
    "datasheet": {
        "partNumber": "ATmega328P-PU (Microchip / Arduino)",
        "title": "Arduino Uno R3 8-bit AVR RISC Microcontroller Board",
        "category": "Microcontrollers / Embedded Systems",
        "package": "DIP-28 / Standard Arduino Uno R3 Form Factor (68.6mm × 53.4mm)",
        "description": "The Arduino Uno R3 is an open-source microcontroller board based on the Microchip ATmega328P. Features 14 digital input/output pins (6 PWM outputs), 6 analog inputs, 16 MHz ceramic resonator, USB connection, power barrel jack, ICSP header, and reset button. Operates at 5V logic with integrated 5V and 3.3V low-dropout voltage regulators.",
        "pinout": [
            {
                "pin": 0,
                "name": "5V (Power Output)",
                "desc": "Regulated +5.0V DC supply output rail from on-board LDO regulator (500mA max)"
            },
            {
                "pin": 1,
                "name": "3V3 (Power Output)",
                "desc": "Regulated +3.3V DC supply rail from LP2985-33 LDO regulator (150mA max)"
            },
            {
                "pin": 2,
                "name": "GND (Power Ground 1)",
                "desc": "System common reference ground (0V)"
            },
            {
                "pin": 3,
                "name": "A0 (Analog In 0 / ADC0)",
                "desc": "10-bit Successive Approximation ADC input (0-5V, 1024 discrete steps)"
            },
            {
                "pin": 4,
                "name": "D13 (SCK / \"L\" LED)",
                "desc": "Digital GPIO & SPI Clock tied to on-board yellow \"L\" LED with buffer"
            },
            {
                "pin": 5,
                "name": "D9 (PWM ~ / OC1A)",
                "desc": "8-bit Timer/Counter1 Fast PWM output channel A / general GPIO"
            },
            {
                "pin": 6,
                "name": "D2 (INT0 / GPIO)",
                "desc": "Digital GPIO supporting external hardware interrupt INT0"
            },
            {
                "pin": 7,
                "name": "VIN (Raw Power Input)",
                "desc": "Unregulated DC power input from external supply (7V - 12V DC recommended)"
            },
            {
                "pin": 8,
                "name": "GND2 (Power Ground 2)",
                "desc": "Second system reference ground terminal"
            },
            {
                "pin": 9,
                "name": "RESET (Master Reset)",
                "desc": "Active-LOW microcontroller master reset line"
            },
            {
                "pin": 10,
                "name": "IOREF (I/O Reference)",
                "desc": "Operating voltage reference (5.0V) for attached shields"
            },
            {
                "pin": 11,
                "name": "A1 (Analog In 1 / ADC1)",
                "desc": "10-bit Successive Approximation ADC input channel 1"
            },
            {
                "pin": 12,
                "name": "A2 (Analog In 2 / ADC2)",
                "desc": "10-bit Successive Approximation ADC input channel 2"
            },
            {
                "pin": 13,
                "name": "A3 (Analog In 3 / ADC3)",
                "desc": "10-bit Successive Approximation ADC input channel 3"
            },
            {
                "pin": 14,
                "name": "A4 (Analog In 4 / I2C SDA)",
                "desc": "10-bit ADC channel 4 and hardware I2C Serial Data line"
            },
            {
                "pin": 15,
                "name": "A5 (Analog In 5 / I2C SCL)",
                "desc": "10-bit ADC channel 5 and hardware I2C Serial Clock line"
            },
            {
                "pin": 16,
                "name": "D0 (USART RX / GPIO)",
                "desc": "Serial receiver pin for USB-to-UART bridge / general GPIO"
            },
            {
                "pin": 17,
                "name": "D1 (USART TX / GPIO)",
                "desc": "Serial transmitter pin for USB-to-UART bridge / general GPIO"
            },
            {
                "pin": 18,
                "name": "D3 (PWM ~ / INT1)",
                "desc": "8-bit Timer2 PWM channel B and external hardware interrupt INT1"
            },
            {
                "pin": 19,
                "name": "D4 (T0 / GPIO)",
                "desc": "Timer0 external clock input / general digital GPIO"
            },
            {
                "pin": 20,
                "name": "D5 (PWM ~ / T1)",
                "desc": "8-bit Timer0 PWM channel B and Timer1 clock input"
            },
            {
                "pin": 21,
                "name": "D6 (PWM ~ / AIN0)",
                "desc": "8-bit Timer0 PWM channel A and Analog Comparator input 0"
            },
            {
                "pin": 22,
                "name": "D7 (AIN1 / GPIO)",
                "desc": "Analog Comparator input 1 / general digital GPIO"
            },
            {
                "pin": 23,
                "name": "D8 (ICP1 / GPIO)",
                "desc": "Timer1 Input Capture pin / general digital GPIO"
            },
            {
                "pin": 24,
                "name": "D10 (PWM ~ / SPI SS)",
                "desc": "16-bit Timer1 PWM channel B and hardware SPI Slave Select"
            },
            {
                "pin": 25,
                "name": "D11 (PWM ~ / SPI MOSI)",
                "desc": "8-bit Timer2 PWM channel A and hardware SPI Master Out"
            },
            {
                "pin": 26,
                "name": "D12 (SPI MISO / GPIO)",
                "desc": "Hardware SPI Master In Slave Out / general digital GPIO"
            },
            {
                "pin": 27,
                "name": "AREF (ADC Reference)",
                "desc": "External reference voltage input for the ATmega328P ADC (0-5V)"
            },
            {
                "pin": 28,
                "name": "GND3 (Digital Ground)",
                "desc": "Digital header reference ground terminal"
            }
        ],
        "maxRatings": [
            {
                "param": "Recommended Supply Input (VIN / Barrel)",
                "symbol": "V_IN",
                "max": "7.0 - 12.0",
                "unit": "V"
            },
            {
                "param": "DC Current per I/O Pin",
                "symbol": "I_IO",
                "max": "40",
                "unit": "mA"
            },
            {
                "param": "DC Current for 3.3V Pin",
                "symbol": "I_3V3",
                "max": "150",
                "unit": "mA"
            },
            {
                "param": "Flash Memory (Bootloader uses 0.5KB)",
                "symbol": "Flash",
                "max": "32",
                "unit": "KB"
            },
            {
                "param": "Internal SRAM / EEPROM",
                "symbol": "SRAM",
                "max": "2 KB / 1 KB",
                "unit": "RAM"
            }
        ],
        "characteristics": [
            {
                "param": "Operating Logic Voltage",
                "symbol": "V_CC",
                "min": "4.85",
                "typ": "5.0",
                "max": "5.15",
                "unit": "V"
            },
            {
                "param": "Clock Speed / Quartz Frequency",
                "symbol": "f_clk",
                "min": "-",
                "typ": "16.0",
                "max": "-",
                "unit": "MHz"
            },
            {
                "param": "ADC Resolution / Quantization",
                "symbol": "ADC_res",
                "min": "-",
                "typ": "10 (1024 steps)",
                "max": "-",
                "unit": "Bits"
            },
            {
                "param": "ADC Conversion Time",
                "symbol": "t_ADC",
                "min": "13",
                "typ": "65",
                "max": "260",
                "unit": "µs"
            }
        ],
        "appNotes": "When interfacing 5V Arduino Uno pins to 3.3V sensors (e.g. ESP32, HC-SR04 Echo into 3.3V MCU), always employ a resistive voltage divider or bidirectional logic level shifter to protect 3.3V inputs from overvoltage breakdown."
    }
};
});
