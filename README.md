# ElectroSim Pro — Interactive Electronic Circuit Simulator, IoT Workbench & AI Copilot

[![Version](https://img.shields.io/badge/version-3.0%20IoT%20%26%20EDA-indigo.svg)](file:///c:/Users/Santa/OneDrive/Desktop/electro/index.html)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0%20(Pure%20HTML5%20%2B%20ES6%2B)-emerald.svg)](file:///c:/Users/Santa/OneDrive/Desktop/electro/index.html)
[![Tests Passing](https://img.shields.io/badge/tests-100%25%20passing%20(7%2F7%20suites)-blue.svg)](file:///c:/Users/Santa/OneDrive/Desktop/electro/scratch/)
[![Architecture](https://img.shields.io/badge/architecture-MNA%20Matrix%20Solver%20%2B%20IoT-purple.svg)](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/ARCHITECTURE.md)
[![License](https://img.shields.io/badge/license-MIT-slate.svg)](#license)

**ElectroSim Pro** is a modern, zero-dependency, browser-native Electronic Design Automation (EDA) and embedded IoT workbench. Designed to bridge the gap between academic SPICE engines and user-friendly visual schematic capture, it evaluates mathematical Modified Nodal Analysis (MNA) matrices at 60 fps directly inside any modern web browser without installations, package managers, or build pipelines.

Version 3.0 expands the simulator beyond discrete analog/digital components into full **embedded systems and IoT simulation**, introducing the **Arduino Uno R3**, **ESP32 NodeMCU**, smart sensors (DHT11, HC-SR04 ultrasonic sonar, HC-SR501 PIR motion, CdS photoresistor), and real actuators (piezo buzzer with Web Audio API sound synthesis, SG90 servo motor with dynamic horn rotation, and 5V optocoupled SPDT relay).

---

## ⚡ Key Highlights

- **AI Electronics Engineering Agent & Copilot (v3.1):**
  - **NVIDIA API Catalog Integration:** Powered by NVIDIA's premier reasoning models (`nvidia/nemotron-3.5-super-vl-120b-a12b` and `nvidia/llama-3.1-nemotron-70b-instruct`) via a secure, lightweight local proxy server (`server.js`).
  - **Live Circuit Context Awareness:** Dynamically serializes active canvas components, net connectivity, node potentials, branch currents, component power dissipation, and SOA operational stress into read-only structured snapshots.
  - **Deterministic Engineering Math Library:** Real-time verified formulas for Ohm's law, LED current-limiting resistors, series/parallel combinations, voltage dividers, RC time constants, and reactance (Xc, Xl).
  - **Structured Circuit Proposal Protocol:** Generates reviewable schematic proposals with verified component types, values, and wiring plans. Requires **explicit user approval** before touching the canvas.
  - **Safety & Datasheet Verification:** Automatically queries the 21 authentic manufacturer datasheets archive, checks absolute maximum ratings vs recommended operating conditions, flags missing 0V grounds, and warns against reverse breakdown and overcurrent.
  - **Offline Mock Engine:** Seamless automatic fallback to deterministic electronics reasoning when running standalone without an internet connection or API credentials.
- **Mathematical Modified Nodal Analysis (MNA):** Computes exact node voltages and branch currents via Gaussian elimination with partial row pivoting ($A \cdot x = z$).
- **Embedded Microcontroller Cores & In-Browser Code IDE:**
  - **Arduino Uno R3:** ATmega328P 16MHz AVR board with full **29 authentic datasheet terminals** (14 Digital I/O D0-D13 with PWM on D3/D5/D6/D9/D10/D11 and SPI, 6 Analog 10-bit ADC channels A0-A5, 5V, 3.3V, VIN, IOREF, AREF, 3 GNDs), synchronized 'L' LED indicator on D13, D9 PWM duty control, and interactive GPIO matrix.
  - **ESP32 NodeMCU:** Dual-core 240MHz Wi-Fi/BLE SoC with full **30 authentic DIP terminals** (18 Digital GPIOs with capacitive touch/interrupts, 6 12-bit SAR ADC channels VP/VN/D34/D35/D32/D33, 2 DACs D25/D26, SPI, I2C, UART, dual 3.3V rails, dual GNDs, VIN), onboard GPIO2 blue status LED, and simulated Wi-Fi/MQTT telemetry streams.
  - **Embedded Microcontroller Code IDE:** In-browser code editor IDE (`F7` or Top Toolbar) featuring full Arduino C++ sketch transpilation (`setup()`, `loop()`, `pinMode()`, `digitalWrite()`, `digitalRead()`, `analogRead()`, `analogWrite()`, non-blocking `delay()`, `millis()`, `Serial.println()`), integrated **Serial Monitor** terminal with baud rate selection, live sketch compilation with memory usage estimation (Flash ROM & SRAM), and a library of 7 pre-loaded example sketches.
  - **Live Terminal Hover HUD Tooltip:** Hovering any microcontroller or IC pin renders an instant glassmorphic badge showing the pin name, primary role, and alternate hardware functions (PWM, ADC, SPI MOSI/MISO/SCK, I2C SDA/SCL, UART TX/RX).
- **Smart Sensors & Environmental Triggers:**
  - **DHT11:** Temperature ($-20^\circ\text{C}$ to $+60^\circ\text{C}$) and relative humidity ($20\%$ to $90\%$) with real-time dew point calculations.
  - **HC-SR04 Sonar:** Ultrasonic distance sensor ($2\text{ cm} - 400\text{ cm}$) with echo pulse duration calculation ($t = d \times 58.3\ \mu\text{s}$) and canvas radar emission waves.
  - **HC-SR501 PIR:** Passive infrared human motion detector with interactive simulation trigger, 3.3V TTL active output, and canvas radar alert ring.
  - **CdS Photoresistor (LDR):** Logarithmic photoconductive response ($500\text{ k}\Omega$ dark to $500\ \Omega$ @ 1000 lx) with interactive lux slider.
- **Interactive Actuators & Audio Synthesis:**
  - **Piezo Buzzer:** 2.4 kHz acoustic sounder using native Web Audio API (`AudioContext`) with real audio generation on $\ge 2.5\text{V}$ drop, canvas soundwave ripple arcs, and mute toggle.
  - **SG90 Micro Servo:** 9g position servo ($0^\circ - 180^\circ$) with dynamically rotating white horn arm and 50Hz PWM pulse width calculations ($1.0 - 2.0\text{ ms}$).
  - **5V Optocoupled Relay:** 1-channel SPDT 10A relay (Songle `SRD-05VDC-SL-C`) with galvanic isolation ($1500\text{ V}$), interactive trigger polarity, and armature contact switching (COM-NC to COM-NO).
- **Active Semiconductor Physics:** Authentic companion models for NPN BJTs (2N2222A), Silicon Rectifiers (1N4007), 5.1V Zener Regulators (BZX55C), and Fast-Acting Polyfuses (0154.500DR).
- **Thévenin Battery Internal Resistance:** Realistic alkaline cell behavior ($R_{int} = 1.5\ \Omega$) modeling loaded terminal voltage droop ($V_{term} = V_{oc} - I \cdot R_{int}$).
- **Safe Operating Area (SOA) Stress Telemetry:** Continuous evaluation of voltage, current, and power dissipation against manufacturer absolute maximum ratings with color-coded safety badges.
- **EIA-RS-279 Resistor Color-Code System:** Dynamic SVG resistor graphic decoding 4-band and 5-band color rings in real time.
- **Dual-Trace Virtual Bench Oscilloscope:** Calibrated $8 \times 4$ graticule screen with center crosshair tick marks, phosphor trace glow, and real-time $V_{pk}, I_{pk}, P$ telemetry.
- **Modern EDA Workstation UI/UX:** High-density grouped toolbar, live component search, category filter pills (`All`, `Power`, `Passives`, `Semis`, `Control`, `IoT & MCU`), dual-density grid dots & crosshairs, and collapsible sidebars (`[` and `]`).
- **Ergonomic Action Controls:** Fast **Rotate 90°** (`R`) and **Delete** (`Del`) icon buttons available both in the **Floating Canvas Viewport Dock** and at the bottom of the **Component Inspector**.

---

## 🚀 Quick Start

ElectroSim Pro requires **zero installation**, zero build steps, and no Node.js runtime to use.

### Option 1: Direct Browser Launch (Recommended)
Double-click `index.html` or open it directly in any modern browser:
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### Option 2: Local HTTP Server (Optional)
If you prefer running through a local development server:
```bash
# Using Python 3
python -m http.server 8080

# Using Node.js npx
npx serve .
```
Navigate to `http://localhost:8080` in your web browser.

---

## 🧭 Application Layout

ElectroSim Pro provides a structured 4-region EDA workstation:

```plaintext
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP APPLICATION BAR: Transport (Play/Pause, Reset, Speed) | Presets | History | Tools   │
├───────────────────┬────────────────────────────────────────────────┬───────────────────┤
│ COMPONENTS        │ SCHEMATIC CANVAS                               │ COMPONENT         │
│ PALETTE           │                                                │ INSPECTOR         │
│                   │ • Dual-Density Grid (20px dots / 100px crosses)│ • Live Telemetry  │
│ • Live Search     │ • Orthogonal Manhattan Auto-Routing            │   (V, I, P Grid)  │
│ • Category Pills  │ • Dynamic Particle Drift Velocity Animations   │ • Value Input     │
│   - Power         │ • Audio Soundwaves & Radar Pulses              │ • Resistor Color  │
│   - Passives      │ • Empty State Watermark Guidance               │   Code Visualizer │
│   - Semis         │                                                │ • EIA Stamp Codes │
│   - Control       │ ┌────────────────────────────────────────────┐ │ • Real Datasheet  │
│   - IoT & MCU     │ │ FLOATING VIEWPORT HUD DOCK                 │ │ • SOA Stress Bar  │
│ • Component Tiles │ │ [S] [H] [W] | [🔄 Rotate] [🗑️ Delete] | + - Fit│ │ • Module Controls │
│ • Custom IC Add   │ └────────────────────────────────────────────┘ │ • Rotate / Delete │
│                   │                                                ├───────────────────┤
│ [ [ ] Collapse    │                                                │ BENCH SCOPE       │
│                   │                                                │ Dual-Trace (CH1/2)│
└───────────────────┴────────────────────────────────────────────────┴───────────────────┘
```

---

## 📦 Component Library & Datasheet Archive

ElectroSim Pro integrates complete manufacturer specifications for all **21 components**:

### Microcontrollers & IoT Modules (`IoT & MCU`)
| Component | Symbol | Model / Part Number | Manufacturer | Pins | Key Specifications |
| :--- | :---: | :--- | :--- | :---: | :--- |
| **Arduino Uno R3** | `UNO` | ATmega328P-PU | Microchip / Arduino | 29 | 14 Digital I/O (PWM/SPI), 6 ADC channels ($0-1023$), 5V/3.3V rails, D13 LED, In-Browser C++ Code IDE |
| **ESP32 NodeMCU** | `ESP32` | ESP-WROOM-32 | Espressif Systems | 30 | 18 GPIOs, 6 SAR ADC channels ($0-4095$), 2 DACs, Wi-Fi/MQTT streams, In-Browser Code IDE |
| **DHT11 Sensor** | `DHT11` | DHT11 Digital Module | Aosong Electronics | 3 | $-20^\circ\text{C} - +60^\circ\text{C}$, $20\% - 90\%\text{ RH}$, 1-wire serial protocol |
| **HC-SR04 Sonar** | `SONAR` | HC-SR04 Ultrasonic | Cytron / Osepp | 4 | $2 - 400\text{ cm}$ range, $40\text{ kHz}$ transducer, $58.3\ \mu\text{s/cm}$ echo |
| **HC-SR501 PIR** | `PIR` | HC-SR501 Module | Nisheng / BISS0001 | 3 | Passive infrared detector, $7\text{ m}$ range, $3.3\text{V}$ active TTL output |
| **CdS Photoresistor**| `LDR` | GL5528 Cadmium-Sulfide | Senba Sensing | 2 | $500\text{ k}\Omega$ dark to $500\ \Omega$ bright (@ 1000 lx), $\gamma = 0.65$ |
| **Piezo Buzzer** | `BUZZ` | TMB12A05 Active Piezo | Sonitron / CUI Devices| 2 | $2400\text{ Hz}$ tone, Web Audio API synthesis, $85\text{ dB}$, $\ge 2.5\text{V}$ drop |
| **SG90 Servo** | `SERVO` | SG90 9g Micro Servo | TowerPro | 3 | $0^\circ - 180^\circ$ angle, rotating horn, $50\text{ Hz}$ PWM ($1.0 - 2.0\text{ ms}$) |
| **5V Relay Module** | `RELAY` | SRD-05VDC-SL-C | Songle / Omron | 6 | 10A 250VAC SPDT contacts, optocoupler isolation ($1500\text{ V}$), $70\ \Omega$ coil |

### Discrete & Analog Components
| Component | Symbol | Model / Part Number | Manufacturer | Key Specification |
| :--- | :---: | :--- | :--- | :--- |
| **DC Voltage** | `V_DC` | 6LR61 / MN1604 (9V Alkaline) | Energizer / Duracell | $9.0\text{ V}$, $R_{int} = 1.5\ \Omega$, $100\text{ mA}$ max |
| **AC Voltage** | `V_AC` | LAB-AC-500 Signal Source | Rigol / BK Precision | $12\text{ V RMS}$, $50\text{ Hz}$ Sinusoidal, $500\text{ mA}$ max |
| **Resistor** | `R` | MFR-25FTE52 (1/4W Metal Film) | Yageo / Vishay | $220\ \Omega$ (default), $P_{\max} = 250\text{ mW}$, TCR $\pm 50\text{ ppm}$ |
| **Capacitor** | `C` | UHE1E101MED (Radial Electrolytic)| Nichicon / Panasonic FC | $100\ \mu\text{F}$, $25\text{ V DC}$, Low ESR |
| **Inductor** | `L` | RLB0914-103KL (Drum Core Choke) | Bourns | $10\text{ mH}$, $150\text{ mA}$ rated, DCR $4.5\ \Omega$ |
| **LED** | `LED` | WP7113ID (5mm High-Efficiency Red)| Kingbright | $V_F = 2.0\text{ V}$, $I_F = 25\text{ mA}$, $\lambda = 625\text{ nm}$, $V_R = 5.0\text{ V}$ |
| **Diode** | `D` | 1N4007 (1A Silicon Rectifier) | Vishay / ON Semi | $V_{\text{RRM}} = 1000\text{ V}$, $I_F = 1.0\text{ A}$, $V_F = 0.7\text{ V}$ |
| **Zener Diode** | `ZD` | BZX55C5V1 (5.1V Regulator) | Vishay / NXP | $V_Z = 5.1\text{ V}$, $P_{\text{tot}} = 500\text{ mW}$, $r_Z = 5.0\ \Omega$ |
| **NPN BJT** | `Q` | 2N2222A (Switching Transistor) | Central Semi / STMicro | $V_{\text{CEO}} = 40\text{ V}$, $I_C = 800\text{ mA}$, $h_{FE} = 100 - 300$ |
| **Polyfuse** | `FUSE`| 0154.500DR (Fast-Acting Fuse) | Littelfuse OMNI-BLOK | $I_{\text{rated}} = 500\text{ mA}$, $V_{\max} = 125\text{ V}$, $50\text{ A}$ interrupt |
| **Switch** | `SW` | 7101SYZQE (Sealed SPDT Toggle) | C&K / NKK Switches | $5.0\text{ A}$ contact rating, 100,000 cycles |
| **Ground** | `GND` | Earth Reference Node | IEEE Std 142 | $0.000\text{ V}$ Absolute Datum |

---

## 🎛️ Pre-Wired Engineering Presets

Select any pre-configured circuit from the top toolbar dropdown:

### Embedded Systems & IoT Presets
1. **Arduino Alarm System (`arduino_alarm`)**: Arduino Uno R3 powering an HC-SR501 PIR sensor from its 5V rail. Motion detection drives a 2.4kHz acoustic piezo buzzer and D13 alert LED.
2. **ESP32 Environmental Station (`esp32_weather`)**: ESP32 NodeMCU reading a DHT11 temperature/humidity sensor and CdS photoresistor across an analog voltage divider with simulated MQTT telemetry.
3. **Ultrasonic Distance Radar (`ultrasonic_radar`)**: Arduino Uno triggering an HC-SR04 ultrasonic sonar with dynamic distance slider and SG90 servo motor tracking target azimuth.
4. **Isolated Relay Mains Controller (`relay_mains_driver`)**: 5V optocoupled SPDT relay switched by a low-current transistor / logic driver, switching an isolated 12V high-current load.

### Discrete Analog & Semiconductor Presets
5. **Simple LED Circuit (`simple_led`)**: 9V Battery $\to$ Toggle Switch $\to$ 330Ω Resistor $\to$ Red LED $\to$ Ground.
6. **MCU Transistor Switch & Driver (`bjt_gpio_switch`)**: 3.3V Logic $\to$ 180Ω Base Resistor $\to$ 2N2222 NPN BJT switching an inductive coil with 1N4007 clamp.
7. **Zener 5.1V Voltage Regulator (`zener_regulator`)**: 9V Supply with 100Ω series dropper feeding a BZX55C 5.1V Zener diode in reverse breakdown parallel with a 1kΩ load.
8. **Polyfuse Protected Battery Rail (`fused_power_rail`)**: 9V Battery with 500mA Fast Polyfuse and switch. Shorting trips fuse into high impedance.
9. **RC Low-Pass Filter (`rc_filter`)**: AC sinusoidal source feeding a 1kΩ resistor and 100µF capacitor to ground.
10. **Precision Voltage Divider (`voltage_divider`)**: 12V DC across dual matched 1kΩ resistors producing exact 6.00V output.
11. **AC Sine Wave & Resistor (`ac_bulb`)**: 24V AC sinusoidal signal generator driving a 150Ω resistive load.
12. **Interactive Switch & Dual LEDs (`two_way_switch`)**: Multi-branch circuit with independent switchable parallel legs.

---

---

## 🤖 AI Copilot Setup & Backend Proxy

The simulator is fully self-contained and functions 100% in client-side mock mode without any setup. To enable live cloud inference via NVIDIA's Super-VL / Nemotron models:

1. **Configure Environment Variables:**
   ```bash
   # Copy the example configuration
   copy .env.example .env

   # Edit .env and enter your NVIDIA API key from https://build.nvidia.com
   APIKEY=nvapi-your-actual-nvidia-api-key
   ```

2. **Start the AI Proxy Server:**
   ```bash
   npm start
   # Or directly: node server.js
   ```
   The server starts on `http://localhost:3001` with CORS enabled, in-memory rate limiting, and zero external npm package dependencies.

3. **Launch ElectroSim Pro:**
   Open `index.html` directly in any browser (or navigate to `http://localhost:3001`). Click the **AI Copilot** button in the top toolbar or press `F8` to start designing!

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Scope |
| :---: | :--- | :--- |
| `Space` | **Toggle Simulation** (Run / Pause) | Global |
| `S` | **Select / Move Mode** | Viewport |
| `H` | **Pan Canvas Mode** (or middle-click drag) | Viewport |
| `W` | **Wire Routing Mode** | Viewport |
| `R` | **Rotate Selected Component** 90° clockwise | Active Selection |
| `Delete` / `Backspace` | **Delete Selected Component or Wire** | Active Selection |
| `[` | **Toggle Left Palette Sidebar** (Expand/Collapse) | UI Layout |
| `]` | **Toggle Right Inspector Sidebar** (Expand/Collapse) | UI Layout |
| `+` / `-` | **Zoom In / Zoom Out** (or mouse wheel) | Viewport |
| `Home` | **Reset View / Fit Schematic** (100% Zoom, origin pan) | Viewport |
| `Ctrl + Z` | **Undo Last Action** | History |
| `Ctrl + Y` / `Ctrl + Shift + Z` | **Redo Last Action** | History |
| `Escape` | **Cancel Current Wiring / Deselect / Close Modals** | Global |
| `F7` | **Toggle Embedded Microcontroller Code IDE** | Global |
| `F8` | **Toggle AI Electronics Engineering Copilot** | Global |
| `Ctrl + Enter` / `Ctrl + U` | **Compile & Upload Sketch to Virtual Board** | Code IDE |
| `Ctrl + R` | **Verify & Compile Sketch** | Code IDE |

---

## 🧪 Automated Testing & Verification

ElectroSim Pro includes 6 comprehensive headless test suites executable with Node.js:

```powershell
# Run the complete test suite
npm test

# Or run individual test suites:
node tests/test_ai_calculations.js   # 6/6 Deterministic engineering math formulas
node tests/test_ai_context.js        # 2/2 Live circuit context extraction & probe telemetry
node tests/test_ai_proposal.js       # 6/6 Circuit proposal validation, error rejection & undo
node tests/test_ai_server.js         # 5/5 Backend proxy, health check, CORS & live NVIDIA API
node tests/test_iot_features.js      # 9/9 IoT microcontrollers, sensors, actuators, and presets
node tests/test_embedded_ide.js      # 8/8 Virtual C++ compiler, transpiler, and runtime
```

---

## 📚 Project Documentation

Comprehensive documentation is maintained in the project:

- **[`knowledge_transfer.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/knowledge_transfer.md)**: Master engineering architecture and developer onboarding handbook (16 sections, updated to v3.0).
- **[`docs/PRD.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/PRD.md)**: Product Requirements Document, vision, user personas, and acceptance criteria.
- **[`docs/ARCHITECTURE.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/ARCHITECTURE.md)**: Mathematical MNA solver formulations, microcontroller companion models, and data flow.
- **[`docs/RULES.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/RULES.md)**: Engineering rules, physics integrity policies, and verification gates.
- **[`docs/DESIGN.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/DESIGN.md)**: Dark graphite design tokens, physical telemetry colors, typography scale, and 8pt metric grid.
- **[`docs/TASKS.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/TASKS.md)**: Roadmap milestones and living execution tracker.
- **[`docs/MEMORY.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/MEMORY.md)**: Architectural Decision Records (`ADR-001` through `ADR-006`) and solved traps.

---

## 📄 License

This project is open-source software licensed under the **MIT License**.
