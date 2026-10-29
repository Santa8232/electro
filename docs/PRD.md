# Product Requirements Document (PRD)

## 1. What Are We Building? (Product Overview)
- **Project Name:** ElectroSim Pro
- **Product Type:** Web-Based Electronic Design Automation (EDA) & Interactive Circuit Simulation Workbench
- **One-Liner Pitch:** A zero-dependency, browser-native electronic circuit simulator and embedded systems workbench providing real-time Modified Nodal Analysis (MNA), active semiconductor physics models, live Safe Operating Area (SOA) stress telemetry, and engineering datasheets.
- **Product Vision:** Empower electrical engineering students, makers, embedded systems developers, and hardware engineers to design, test, debug, and understand electronic circuits directly in any modern browser without heavy software installation or clunky academic tools.
- **Core Value Proposition:** Real SPICE-level Modified Nodal Analysis with true semiconductor non-linearities and internal resistances in a single, zero-dependency HTML5 file that runs offline and delivers 60fps electron drift visualizations and real-time oscilloscope telemetry.

## 2. Problem Statement (What Problem Does It Solve?)
### 2.1 Current Pain Points
1. **Academic Tool Clunkiness:** Legacy SPICE tools (LTspice, PSpice) feature steep learning curves, outdated 1990s user interfaces, and require desktop installations.
2. **Over-Simplified Toys:** Existing web sandbox simulators often use crude heuristics rather than rigorous nodal matrices, failing to accurately model Thévenin battery internal resistance ($R_{int} = 1.5\ \Omega$), diode exponential curves, or transistor saturation.
3. **Missing Hardware Safety Context:** Most simulators treat components as indestructible ideal blocks, giving students a false impression that circuit components cannot overheat, experience reverse breakdown, or blow fuses.
4. **Disconnection from Real Hardware:** Simulators rarely link virtual components to authentic manufacturer datasheets, EIA marking codes, or 4-band/5-band resistor color codes.

### 2.2 Our Solution
- ElectroSim Pro provides mathematical Modified Nodal Analysis with partial-pivoting Gaussian elimination at 60 fps.
- Integrates authentic components with exact datasheets (Kingbright LED, Yageo metal film resistor, Energizer 9V alkaline battery, Nichicon capacitor, Bourns inductor, Littelfuse polyfuse, Central Semi 2N2222 BJT, Vishay 1N4007, BZX55C Zener).
- Computes real-time Safe Operating Area (SOA) stress percentages and flags overstress/reverse breakdown hazards.
- Provides interactive 4-band and 5-band resistor color-coding, EIA codes, and virtual dual-channel bench oscilloscope.

## 3. Target Audience & Personas
### Primary Persona 1: Electronics Engineering Student (Alex)
- **Profile:** University student taking Circuits 101 and Embedded Systems.
- **Core Goal:** Verify homework calculations (nodal analysis, voltage dividers, RC time constants) and visualize electron flow and Kirchhoff's laws before lab bench wiring.

### Primary Persona 2: Embedded Firmware Developer (Priya)
- **Profile:** Microcontroller firmware engineer interfacing GPIO pins to external loads (relays, LEDs, transistors).
- **Core Goal:** Verify transistor base drive currents, flyback clamp diodes, and polyfuse trip thresholds before assembling physical PCB prototypes.

### Primary Persona 3: Hardware Maker & Hobbyist (Sam)
- **Profile:** Electronics hobbyist assembling breadboard circuits.
- **Core Goal:** Look up resistor color bands, double-check LED forward voltage drop ($V_f$) and polarity, and simulate circuits with zero installation overhead.

## 4. Feature Scope & Requirements
### 4.1 Phase 1: MVP Core Features (Completed)
- [x] **MNA Circuit Solver:** Linear nodal matrix solver with Kirchhoff's Current and Voltage Laws.
- [x] **Component Palette:** 12 fundamental components (DC Voltage, AC Voltage, Resistor, Capacitor, Inductor, LED, 1N4007 Diode, BZX55C Zener Diode, 2N2222 NPN BJT, Littelfuse Polyfuse, SPDT/SPST Switch, Ground).
- [x] **Interactive Canvas:** Schematic capture, component rotation, grid snapping ($20\text{ px}$), pan and zoom controls.
- [x] **Orthogonal Wire Routing:** Automatic Manhattan wire routing with obstacle avoidance.
- [x] **Safe Operating Area (SOA) Telemetry:** Real-time percentage stress gauge, power dissipation, and safety status.
- [x] **Resistor Color Code System:** Dynamic SVG resistor graphic with synchronized 4-band and 5-band color calculation.
- [x] **Datasheet Archive:** Integrated manufacturer datasheets and technical specification cards.
- [x] **Virtual Bench Oscilloscope:** Dual-trace waveform monitor (CH1 Voltage, CH2 Current) with $8 \times 4$ graticule subdivisions.
- [x] **Circuit Presets:** 8 pre-wired engineering circuits (LED, BJT Switch, Zener Regulator, Polyfuse Rail, RC Filter, Voltage Divider, AC Bulb, Two-Way Switch).
- [x] **History & Persistence:** Undo/redo stack (Ctrl+Z / Ctrl+Y), browser LocalStorage persistence, and JSON circuit export/import.

### 4.2 Phase 2: Modern EDA Workstation Layout (Completed)
- [x] **Modern EDA Workstation Layout:** High-density top bar, collapsible sidebars (`[` and `]`), and categorized palette search.
- [x] **3-Card Live Telemetry Grid:** Inspector cards for Voltage (cyan), Current (emerald), and Power (purple).
- [x] **Floating Canvas Viewport Dock:** Direct canvas access to Rotate and Delete buttons paired alongside navigation tools.

### 4.3 Phase 3: Embedded Microcontrollers, IoT Ecosystem & Code IDE (Completed)
- [x] **Microcontroller Simulation Models (Real Datasheet Pinouts):**
  - **Arduino Uno R3:** ATmega328P with full **29 authentic header pins** (14 digital I/O D0-D13 with PWM/SPI, 6 analog ADC channels A0-A5 with 10-bit quantization, 5V, 3.3V, VIN, IOREF, AREF, 3 GNDs), synchronized D13 'L' LED indicator, and interactive GPIO matrix.
  - **ESP32 NodeMCU:** Dual-core 240MHz SoC with full **30 authentic DIP pins** (18 digital GPIOs, 6 SAR ADC channels VP/VN/D34/D35/D32/D33 with 12-bit quantization, 2 DACs D25/D26, SPI, I2C, UART, dual 3.3V rails, dual GNDs, VIN), blue GPIO2 status LED, and Wi-Fi/MQTT telemetry streams.
  - **Pinout Hover HUD Tooltips:** High-contrast glassmorphic badges displaying pin names and alternate hardware functions on mouse hover.
- [x] **Embedded Microcontroller Code IDE & Virtual Firmware Runtime:**
  - Integrated in-browser C++ sketch editor (`F7` or toolbar button) featuring line numbering, tab indentation, and auto-indent.
  - Arduino C++ to asynchronous JavaScript transpiler supporting `pinMode()`, `digitalWrite()`, `digitalRead()`, `analogRead()`, `analogWrite()`, non-blocking `delay()`, `millis()`, and `Serial.println()`.
  - Flash ROM and SRAM memory footprint estimation.
  - Virtual Serial Monitor console with baud rate selector ($9600 - 115200$), autoscroll, and command input transmitter.
  - Pre-loaded library of 7 functional engineering example sketches.
- [x] **Smart Sensors & Environmental Triggers:**
  - **DHT11:** Temperature ($-20^\circ\text{C}$ to $+60^\circ\text{C}$) & Relative Humidity ($20\%$ to $90\%$) with dew point calculation.
  - **HC-SR04 Sonar:** Ultrasonic distance sensor ($2\text{ cm} - 400\text{ cm}$) with echo pulse duration and canvas radar emission waves.
  - **HC-SR501 PIR:** Passive infrared motion sensor with interactive trigger and 3.3V TTL active output.
  - **CdS Photoresistor (LDR):** Logarithmic photoconductive response ($500\text{ k}\Omega$ to $500\ \Omega$) with lux slider.
- [x] **Acoustic & Kinematic Actuators:**
  - **Active Piezo Buzzer:** Web Audio API sound generator ($2.4\text{ kHz}$) with audible synthesis, canvas soundwave ripple arcs, and mute toggle.
  - **SG90 Micro Servo:** Dynamic rotating white horn ($0^\circ - 180^\circ$) and 50Hz PWM pulse width calculations.
  - **5V Optocoupled Relay:** 1-channel SPDT 10A relay with galvanic isolation and armature contact switching.
- [x] **Pre-Wired IoT Presets:** Arduino Alarm, ESP32 Weather Station, Ultrasonic Radar, and Relay Mains Driver.
- [x] **Dual Action Controls:** Rotate and Delete buttons accessible in both the Floating Canvas Dock and the Component Inspector.

### 4.4 Phase 4: Future Capabilities
- [ ] **Sub-circuit Hierarchical Blocks:** Ability to group multiple components into reusable IC blocks.
- [ ] **Multi-meter Probe Tool:** Draggable DMM test leads for differential voltage and current measurements.
- [ ] **Frequency Domain Bode Plotter:** AC sweep simulation plotting magnitude and phase response over frequency.

### 4.5 Out of Scope / Non-Goals
- Real-time SPICE transient integration of high-frequency RF transmission lines (focus is on DC, audio, and low-frequency embedded circuits).
- PCB layout Gerber file generation (ElectroSim Pro focuses on schematic capture and behavioral circuit physics).
- Multi-user collaborative cloud editing requiring backend databases (retains zero-dependency offline architecture).

## 5. User Stories & Acceptance Criteria
### User Story 1: Visualizing Circuit Behavior
- **As an:** Engineering student
- **I want to:** Toggle an interactive switch and observe current flow
- **So that:** I can confirm whether closed loops conduct and how current splits across parallel branches.
- **Acceptance Criteria:**
  - [x] When switch is closed, current particles animate with speed proportional to current magnitude.
  - [x] When switch is open, current immediately drops to 0.00 mA and particle drift halts.

### User Story 2: Transistor Switching Verification
- **As an:** Embedded firmware developer
- **I want to:** Simulate a 3.3V microcontroller GPIO driving an NPN transistor base to switch a 12V relay coil
- **So that:** I can verify that collector current saturates without exceeding maximum rated base current.
- **Acceptance Criteria:**
  - [x] 2N2222 transistor turns ON when base terminal receives forward bias $> 0.65\text{ V}$.
  - [x] Collector branch delivers full rated load current with minimal $V_{CE(sat)}$.

### User Story 3: Overcurrent & Fault Protection
- **As a:** Hardware engineer
- **I want to:** Cause a short circuit across a protected power rail
- **So that:** I can verify that the polyfuse trips and interrupts current before components burn out.
- **Acceptance Criteria:**
  - [x] Polyfuse detects current exceeding continuous rating ($500\text{ mA}$) and triggers open fault.
  - [x] Visual filament turns red and flashes warning toast; inspector provides one-click fuse replacement.

### User Story 4: Microcontroller ADC Sensor Reading & Telemetry
- **As an:** IoT developer
- **I want to:** Connect an analog sensor (LDR or potentiometer) to Arduino A0 or ESP32 VN
- **So that:** I can verify sensor voltage division and monitor simulated ADC digital conversion codes ($0-1023$ or $0-4095$) and Wi-Fi/MQTT JSON packets.
- **Acceptance Criteria:**
  - [x] Arduino A0 accurately samples node potential and quantizes to 10-bit integer ($0-1023$).
  - [x] ESP32 VN accurately samples node potential and quantizes to 12-bit integer ($0-4095$).
  - [x] Live inspector card renders simulated sensor values and telemetry logs in real time.

### User Story 5: Optocoupled Relay & High-Power Actuator Control
- **As an:** Embedded systems engineer
- **I want to:** Trigger a 5V relay module from a microcontroller pin to switch an isolated mains or 12V DC load
- **So that:** I can verify galvanic isolation, coil current draw, and contact switching without risk to the control circuit.
- **Acceptance Criteria:**
  - [x] Relay coil energizes when control signal satisfies trigger polarity (Active LOW or HIGH).
  - [x] Common (COM) contact flips from Normally Closed (NC) to Normally Open (NO), closing load circuit with $0.05\ \Omega$ resistance.
  - [x] Load circuit remains completely galvanically isolated from the coil power loop.
- **I want to:** Cause a short circuit across a protected power rail
- **So that:** I can verify that the polyfuse trips and interrupts current before components burn out.
- **Acceptance Criteria:**
  - [x] Polyfuse detects current exceeding continuous rating ($500\text{ mA}$) and triggers open fault.
  - [x] Visual filament turns red and flashes warning toast; inspector provides one-click fuse replacement.

## 6. Non-Functional Requirements (NFRs)
- **Performance:** 60 fps canvas rendering and MNA matrix solves under 2 milliseconds for circuits up to 50 nodes.
- **Architecture Integrity:** Single-file zero-dependency deployment (`index.html`), compatible with `file:///` and all modern evergreen browsers (Chrome, Edge, Firefox, Safari).
- **Responsive Layout:** Adaptive desktop and laptop workstations with collapsible sidebars.
- **Memory Footprint:** Under 50 MB RAM browser usage; bounded undo history stack (30 states).

## 7. Success Metrics & KPIs
- Zero runtime external library dependencies (pure HTML5, Vanilla ES6+, Tailwind CDN, FontAwesome CDN).
- 100% test pass rate across all automated unit, physics, and integration suites.
- Solver calculation accuracy within 1.0% of SPICE reference solutions.

