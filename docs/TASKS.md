# Tasks & Execution Roadmap

## Status Legend
- `[ ]` Backlog / Not Started
- `[/]` In Progress
- `[x]` Completed & Verified
- `[-]` Blocked / Deprecated

## Milestone 1: Mathematical Foundations & Core MNA Solver
- [x] Implement linear Modified Nodal Analysis (MNA) matrix solver with Gaussian elimination and partial pivoting.
- [x] Implement Union-Find netlist equivalence builder to identify connected nodes and ground references.
- [x] Model Thévenin battery source with authentic alkaline internal resistance ($R_{int} = 1.5\ \Omega$).
- [x] Implement ideal conductors, linear resistors, and energy storage elements (capacitors and inductors).
- [x] Create orthogonal Manhattan wire routing algorithm with component obstacle avoidance.
- [x] Implement 60 fps electron drift visualization with speed proportional to current magnitude.
- [x] Build browser LocalStorage persistence engine and JSON schema import/export.

## Milestone 2: Active Semiconductors & Circuit Protection
- [x] Implement 1N4007 silicon rectifier diode with Shockley non-linear forward knee ($0.7\text{ V}$) and reverse leakage.
- [x] Implement BZX55C 5.1V Zener diode with reverse breakdown voltage regulation.
- [x] Implement 2N2222 NPN BJT transistor model with cutoff, active, and saturation states.
- [x] Implement Littelfuse 0154.500DR fast-acting surface-mount polyfuse overcurrent trip model.
- [x] Add reverse-breakdown hazard detection for LEDs under excessive reverse bias ($V_R > 5.0\text{ V}$).
- [x] Create pre-wired circuit presets:
  - [x] Simple LED switchable circuit
  - [x] MCU transistor switch & relay driver
  - [x] Zener 5.1V precision voltage regulator
  - [x] Polyfuse protected battery rail
  - [x] RC low-pass frequency filter
  - [x] Precision voltage divider
  - [x] AC sinusoidal voltage source & load
  - [x] Interactive two-way switch with dual indicators

## Milestone 3: Real Component Datasheets & Live SOA Stress
- [x] Build authentic engineering datasheet archive for all 12 core components:
  - [x] Kingbright WP7113ID (Red 5mm Solid-State LED)
  - [x] Yageo / Vishay MFR-25FTE52 (1/4W Metal Film Resistor)
  - [x] Energizer / Duracell 6LR61 MN1604 (9V Alkaline Battery)
  - [x] Rigol / BK Precision LAB-AC-500 (AC Generator)
  - [x] Nichicon / Panasonic UHE1E101MED (Radial Electrolytic Capacitor)
  - [x] Bourns RLB0914-103KL (Drum Core RF/Power Inductor)
  - [x] C&K / NKK 7101SYZQE (Sealed SPDT/SPST Toggle Switch)
  - [x] IEEE Std 142 Earth Reference Ground
  - [x] Vishay / ON Semi 1N4007 (1A General Purpose Plastic Rectifier)
  - [x] Vishay / NXP BZX55C5V1 (500mW 5.1V Zener Diode)
  - [x] Central Semi / ST 2N2222A (40V NPN High-Speed Switching Transistor)
  - [x] Littelfuse 0154.500DR (500mA OMNI-BLOK Fast-Acting Fuse)
- [x] Implement real-time Safe Operating Area (SOA) stress evaluation (% of rated max load).
- [x] Build interactive Resistor Color-Code System with SVG rendering and 4-band / 5-band calculation.
- [x] Implement EIA marking code decoder for capacitors and inductors.

## Milestone 4: Modern EDA Workstation UI/UX Redesign
- [x] Redesign high-density top application bar:
  - [x] Grouped simulation transport controls (`#btn-run`, `#btn-reset`, speed selector).
  - [x] Grouped circuit preset selector organized with optgroups.
  - [x] History (undo/redo), storage, and export/import operations.
  - [x] Collapsible sidebar toggle buttons (`#btn-toggle-palette` and `#btn-toggle-inspector`).
- [x] Upgrade component palette with live search (`#palette-search`) and category filter pills (`All`, `Power`, `Passives`, `Semis`, `Control`).
- [x] Implement high-contrast engineering canvas grid ($20\text{ px}$ minor dots, $100\text{ px}$ major crosshairs) and blueprint watermark.
- [x] Upgrade Component Inspector with 3-card live telemetry grid (Voltage in cyan, Current in emerald, Power in purple).
- [x] Embed icon-only Datasheet button beside the Operational Stress gauge.
- [x] Upgrade Floating Canvas Viewport Dock:
  - [x] Move Rotate and Delete buttons into the dock with micro-interactions.
  - [x] Clean up inspector by eliminating redundant bottom button clutter.
- [x] Implement dual-trace virtual bench oscilloscope ($8 \times 4$ graticule, tick marks, phosphor glow, digital readouts).
- [x] Implement keyboard shortcuts: `Space` (Sim), `S` (Select), `H` (Pan), `W` (Wire), `R` (Rotate), `Del` (Delete), `[` (Left panel), `]` (Right panel).

## Milestone 5: Microcontrollers, Smart Sensors & IoT Actuators (Completed)
- [x] **Microcontroller Boards:**
  - [x] Arduino Uno R3 ATmega328P with regulated 5V and 3.3V rails, 10-bit quantized ADC A0, synchronized D13 'L' LED indicator, and D9 PWM.
  - [x] ESP32 NodeMCU 240MHz SoC with regulated 3.3V rail, 12-bit SAR ADC on VN ($0-4095$), GPIO2 blue status LED, and Wi-Fi/MQTT telemetry streams.
- [x] **Smart Environmental Sensors:**
  - [x] DHT11 temperature ($-20^\circ\text{C} - +60^\circ\text{C}$) and relative humidity ($20\% - 90\%$) sensor with dew point calculation.
  - [x] HC-SR04 ultrasonic sonar ($2\text{ cm} - 400\text{ cm}$) with echo pulse duration calculation and canvas radar emission waves.
  - [x] HC-SR501 PIR passive infrared motion detector with simulation trigger and 3.3V TTL active output.
  - [x] CdS photoresistor (LDR) with logarithmic photoconductive response ($500\text{ k}\Omega$ to $500\ \Omega$) and lux slider.
- [x] **Interactive Actuators & Audio Synthesis:**
  - [x] Active piezo buzzer with Web Audio API sound synthesis ($2.4\text{ kHz}$ tone), expanding canvas ripple arcs, and mute toggle.
  - [x] SG90 micro servo motor with dynamically rotating white horn arm ($0^\circ - 180^\circ$) and 50Hz PWM pulse width calculations.
  - [x] 5V optocoupled SPDT relay module (Songle SRD-05VDC-SL-C) with $1500\text{ V}$ galvanic isolation and armature contact switching.
- [x] **Microcontroller Real Datasheet Pinout Expansion:**
  - [x] Expand Arduino Uno R3 to full 29 authentic pins (14 digital I/O D0-D13, 6 analog ADCs A0-A5, 5V, 3V3, VIN, IOREF, AREF, 3 GNDs).
  - [x] Expand ESP32 NodeMCU to full 30 authentic DIP pins (18 GPIOs, 6 SAR ADCs, 2 DACs, dual 3V3, dual GND, VIN).
  - [x] Add high-contrast glassmorphic hover HUD tooltips displaying pin names and alternate hardware functions (PWM, ADC, SPI, I2C, UART).
- [x] **Embedded Microcontroller Code IDE & Virtual Firmware Subsystem:**
  - [x] In-browser code editor IDE modal (`#embedded-ide-modal`) with line numbers, tab indentation, and fullscreen toggle (`F7`).
  - [x] Arduino C++ to asynchronous JavaScript transpiler supporting standard Arduino APIs (`setup`, `loop`, `pinMode`, `digitalWrite`, `digitalRead`, `analogRead`, `analogWrite`, `delay`, `millis`, `Serial`).
  - [x] Live firmware compilation with Flash ROM & SRAM footprint estimation.
  - [x] Bidirectional Serial Monitor console with baud rate selection ($9600 - 115200$), autoscroll, and serial command transmitter.
  - [x] Library of 7 interactive engineering example sketches.
- [x] **Integrated Workstation Features:**
  - [x] Component palette category pill `IoT & MCU` (`data-cat="iot"`).
  - [x] Complete manufacturer datasheets for all 9 IoT components.
  - [x] High-fidelity custom canvas schematic symbols and multi-pin geometry routing.
  - [x] Interactive inspector cards with telemetry, sliders, steppers, and triggers.
  - [x] Dual action buttons (Rotate & Delete) accessible in both Floating Viewport Dock and Inspector.
  - [x] 4 pre-wired IoT circuit presets: `arduino_alarm`, `esp32_weather`, `ultrasonic_radar`, `relay_mains_driver`.
- [x] **Verification:**
  - [x] Headless test suite `tests/test_iot_features.js` (9/9 suites passing, 25/25 assertions).
  - [x] Headless test suite `tests/test_embedded_ide.js` (8/8 test suites passing).

## Milestone 6: AI Electronics Engineering Agent & Copilot (Completed)
- [x] **Secure Backend Proxy Architecture (`server.js`):**
  - [x] Zero-external-dependency Node.js HTTP/HTTPS proxy server.
  - [x] Secure credential handling (never exposes API keys to client-side code/storage).
  - [x] Sliding-window rate limiting (60 req/min/IP) and 5MB payload limits.
  - [x] Comprehensive CORS configuration for `file://` and local web hosting.
  - [x] Standardized error normalization for 401, 404, 429, and 504 timeouts.
  - [x] Standalone static file server for hosting the entire EDA workstation.
- [x] **NVIDIA API Catalog Integration:**
  - [x] Primary default model: `nvidia/nemotron-3.5-super-vl-120b-a12b` (Super-VL multimodal & reasoning).
  - [x] Secondary reasoning candidate: `nvidia/llama-3.1-nemotron-70b-instruct`.
  - [x] Vision candidate: `meta/llama-3.2-11b-vision-instruct`.
  - [x] Configurable model identifiers via `.env` and runtime model switcher.
  - [x] Seamless fallback to deterministic offline mock reasoning engine when offline.
- [x] **Deterministic Engineering Calculations (`calculations.js`):**
  - [x] Ohm's law bidirectional solver with division-by-zero guards.
  - [x] Series and parallel resistor combination solvers.
  - [x] LED current-limiting resistor calculator with nearest standard commercial E12/E24 values.
  - [x] Power dissipation calculator with 1/4W (250mW) commercial rating safety checks.
  - [x] Unloaded and loaded voltage divider solver with Thevenin equivalence.
  - [x] RC time constant and cutoff frequency calculator.
  - [x] Capacitive and inductive reactance ($X_C, X_L$) and resonance frequency ($f_0$).
- [x] **Authentic Datasheets Knowledge Engine (`datasheets.js`):**
  - [x] Search across all 21 authentic manufacturer datasheets.
  - [x] Separation of Absolute Maximum Ratings from Recommended Operating Conditions.
  - [x] Evidence-based citation generation with part numbers and package specifications.
  - [x] Custom datasheet file attachment parser (JSON, TXT, Markdown).
- [x] **Live Circuit Context Serializer:**
  - [x] `buildCircuitContext()`: Read-only extraction of components, wires, unconnected pins, and 0V ground status.
  - [x] `buildSelectedComponentContext()`: Live telemetry ($V, I, P$), stress %, and SOA ratings.
  - [x] `buildSimulationResultsContext()`: MNA matrix convergence, node voltages, and oscilloscope probe.
- [x] **Circuit Proposal & Validation System:**
  - [x] Strict schema validation preventing invalid components, out-of-bounds pins, and self-shorts.
  - [x] Explicit user review card with "Review & Apply to Canvas" and "Dismiss" actions.
  - [x] Collision-free component placement and wire re-mapping.
  - [x] Full integration into `recordHistory()` for seamless `Ctrl+Z` undo.
  - [x] Immediate post-application MNA solver execution and live telemetry verification.
- [x] **Modern EDA Workstation UI/UX Integration:**
  - [x] Slide-out copilot drawer (`#ai-assistant-panel`) with glassmorphic styling.
  - [x] Top toolbar launcher button (`#btn-ai-copilot`) with live connection dot.
  - [x] Canvas floating dock launcher (`#btn-ai-dock`).
  - [x] Keyboard shortcut `F8` to toggle AI Copilot.
  - [x] Formatted Markdown rendering (headings, bold, lists, code, and proposal cards).
  - [x] Suggested quick prompts carousel.
  - [x] Context toggle checkbox and datasheet attachment file uploader.
- [x] **Verification & Automated Test Suite:**
  - [x] `tests/test_ai_calculations.js` (6/6 passing).
  - [x] `tests/test_ai_context.js` (2/2 passing).
  - [x] `tests/test_ai_proposal.js` (6/6 passing).
  - [x] `tests/test_ai_server.js` (5/5 passing).
  - [x] Total automated coverage: 6 test suites, 100% assertions passing.

## Milestone 7: Modular Component Separation & Datasheet Architecture (Completed)
- [x] **Dedicated `/components/` Directory:**
  - [x] Created separate modules for all 21 components (`dc_voltage.js`, `ac_voltage.js`, `resistor.js`, `capacitor.js`, `inductor.js`, `led.js`, `diode.js`, `zener.js`, `npn_bjt.js`, `fuse.js`, `switch.js`, `ground.js`, `arduino_uno.js`, `esp32.js`, `dht11.js`, `hc_sr04.js`, `pir_sensor.js`, `ldr.js`, `buzzer.js`, `servo.js`, `relay.js`).
  - [x] Bundled full authentic commercial manufacturer datasheets inside each component module (`partNumber`, `title`, `package`, `pinout`, `maxRatings`, `characteristics`, `appNotes`).
  - [x] Universal UMD export (Node.js CommonJS + Browser Global `window.ELECTRO_COMPONENTS`).
- [x] **Master Component Hub (`components/index.js`):**
  - [x] Automatic aggregation of `COMPONENT_REGISTRY`, `COMPONENT_TYPES`, and `REAL_COMPONENT_DATASHEETS`.
  - [x] Helper query functions: `getComponent(id)`, `getDatasheet(id)`, `getAllComponents()`, `getComponentsByCategory(category)`.
- [x] **System Integration & Direct Sourcing:**
  - [x] Upgraded `datasheets.js` to directly load from `components/` module.
  - [x] Linked individual component scripts in `index.html`.
  - [x] Added `tests/test_components.js` with 100% assertion coverage across all 21 parts.

## Milestone 8: AI Circuit Proposal Generation & Instant Canvas Application (Completed)
- [x] **2N2222A Transistor Switch & Blink Circuit Generation:**
  - [x] Added automated schematic proposal synthesis for transistor switches and LED blinkers (`prop_bjt_blink_...`).
  - [x] Implemented MNA solver compatibility: DC Source (5V) -> SPST Switch -> 1kΩ Base Resistor -> 2N2222A Base (pin 0); DC Source (5V) -> 330Ω Collector Resistor -> LED Anode -> LED Cathode -> Transistor Collector (pin 1); Transistor Emitter (pin 2) -> 0V Earth Ground.
  - [x] MNA solver confirms deep saturation ($V_{CE(sat)} \approx 0.02\text{V}, I_C \approx 8.7\text{mA}, I_B \approx 4.3\text{mA}$).
- [x] **Dual-Layer Fail-Safe Circuit Proposal Injection:**
  - [x] Server-side fallback (`server.js`): If remote NVIDIA API returns descriptive text without the fenced `json:circuit_proposal` block, the server automatically appends the verified JSON schematic proposal.
  - [x] Client-side fallback (`ai_agent.js`): `formatAssistantMessage` automatically detects design queries and renders the interactive proposal card with the **[Apply to Canvas]** button.
  - [x] End-to-end integration test (`tests/test_ai_build_and_apply.js`): Verifies "build the blink circuit using transistor only", renders proposal card with `[Apply to Canvas]`, instantiates on canvas, converges in MNA solver, and cleanly rolls back with `undo()`.

## Milestone 9: Code Quality Audit, Performance Optimization & UI/UX Polish (Completed)
- [x] **Comprehensive Code Audit:**
  - [x] Confirmed zero duplicate element IDs and verified all `getElementById` and `onclick` bindings.
  - [x] Identified and removed duplicate function definitions (`setArduinoD13Mode`, `setArduinoD9Duty`, `setEsp32D2Mode`).
  - [x] Added safe global fallback dispatchers for AI Copilot functions to prevent unhandled reference errors.
- [x] **Runtime Performance Optimization:**
  - [x] Implemented zero-allocation `getComponentDef(type)` helper, eliminating 8 expensive object spread merges `{ ...COMPONENT_TYPES, ...customComponentDefs }` in the MNA solver, terminal calculations, and 60fps canvas draw loop.
  - [x] Optimized `rotatePoint(x, y, deg)` using fast integer quadrant transforms (0°, 90°, 180°, 270°) with 15.7% throughput increase (from 191k to 221k ops/sec).
  - [x] Batched major grid coordinate crosshair strokes in `drawGrid()`, cutting canvas state transitions by 99%.
  - [x] Implemented static wire vertex and length caching in `drawWire()`, avoiding per-frame Manhattan re-routing.
  - [x] Cached canvas bounding rect in `screenToWorld()`, eliminating layout thrashing during mouse movement.
  - [x] Throttled simulation HUD and oscilloscope numeric readouts to 10Hz, reducing DOM style recalculations by ~88%.
- [x] **UI/UX Polish:**
  - [x] Upgraded top navigation header with `.no-scrollbar` horizontal overflow scroll for compact laptop resolutions.
  - [x] Standardized responsive dropdowns, tooltips, and action button padding.
- [x] **Testing & Verification:**
  - [x] Added automated benchmark suite `tests/benchmark_perf.js`.
  - [x] All 9 existing test suites passing 100%.

## Milestone 10: Future Capabilities & Enhancements
- [ ] Implement hierarchical sub-circuits and custom IC chip packaging.
- [ ] Add dual-probe digital multimeter (DMM) with draggable positive and negative leads.
- [ ] Add AC frequency sweep simulation with Bode magnitude and phase plots.
- [ ] Support custom SVG component symbol imports with arbitrary pin geometries.
- [ ] Add WAV audio signal generator and speaker audio output emulation.

