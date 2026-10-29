# Agent Memory & Context Log

## 1. Active Session Context
- **Current Milestone:** Milestone 5 Complete (Microcontrollers, Smart Sensors & IoT Actuators Integration)
- **Active Focus:** Continuous documentation synchronization (`docs/`, `README.md`, `knowledge_transfer.md`)
- **Last Verified Step:** Automated verification of all 9 IoT components, companion MNA models, ADC quantizations, Web Audio API synthesis, dynamic servo horn rotation, 5V optocoupled SPDT relay switching, and 4 pre-wired circuit presets via `scratch/test_iot_features.js` (25/25 assertions passing).

## 2. Architectural Decision Records (ADR)

### ADR-001: Zero-Dependency Single-File Architecture
- **Date:** 2026-10-28
- **Context:** Circuit simulation tools frequently require complex native build steps, package dependencies, or transpile pipelines that impede rapid sharing and offline usage.
- **Decision:** ElectroSim Pro is delivered exclusively as a self-contained `index.html` file with embedded ES6+ logic and lightweight CDN styling (Tailwind CSS, FontAwesome).
- **Consequences:** Eliminates node_modules overhead, executes instantly via `file:///` in any modern browser, and retains clean separation of concerns within a modular script structure.

### ADR-002: Mathematical Modified Nodal Analysis (MNA)
- **Date:** 2026-10-28
- **Context:** Heuristic circuit sandboxes fail to accurately model non-linear branch currents, Thévenin source resistances, and semiconductor operational states.
- **Decision:** Implemented formal Modified Nodal Analysis with Gaussian elimination and partial pivoting at 60 fps.
- **Consequences:** Provides SPICE-grade accuracy for Ohm's, Kirchhoff's, and Shockley equations. Matrix singular handling gracefully falls back to open-circuit approximations without crashing.

### ADR-003: Safe Operating Area (SOA) Stress Engine
- **Date:** 2026-10-28
- **Context:** Traditional academic simulators allow infinite currents and voltages through miniature components without signaling failure risks.
- **Decision:** Built a real-time SOA evaluator comparing instantaneous branch parameters ($V$, $I$, $P$) against manufacturer datasheet maximums, surfacing dynamic color-coded percentage badges (Safe, High Load, Overstress).
- **Consequences:** Delivers educational and industrial safety value, warning developers before physical prototype damage.

### ADR-004: 3-Card Live Telemetry Grid & Inspector Architecture
- **Date:** 2026-10-28
- **Context:** Early inspector layouts stacked plain text readings vertically, making them slow to scan and consuming excessive vertical screen space.
- **Decision:** Replaced stacked text with a standardized 3-card grid: Voltage in Cyan (`#live-vdrop`), Current in Emerald (`#live-current`), and Power in Purple (`#live-power`).
- **Consequences:** Immediate visual scannability consistent with benchtop power analyzers and oscilloscopes.

### ADR-005: Dual Access for Component Actions (Viewport Dock & Inspector)
- **Date:** 2026-10-28
- **Context:** Quick component manipulation requires rapid access without excessive mouse movement across wide viewports.
- **Decision:** Integrated icon-only Rotate 90° and Delete buttons into the Floating Canvas Viewport Dock (`#btn-rotate`, `#btn-delete`) and mirrored them at the bottom of the Component Inspector (`#btn-rotate-inspector`, `#btn-delete-inspector`).
- **Consequences:** Maximizes ergonomics whether the user is actively working on the canvas schematic or tuning values in the inspector properties panel.

### ADR-006: Microcontroller MNA Companion Modeling & IoT Actuator Synthesis
- **Date:** 2026-10-29
- **Context:** Simulating microcontrollers (Arduino Uno, ESP32) and IoT modules (DHT11, ultrasonic sonar, PIR, LDR, buzzer, servo, relay) within a linear MNA solver without heavy CPU instruction-set emulation.
- **Decision:** Companion-modeled microcontroller power rails and GPIO outputs as regulated Thévenin DC voltage sources with realistic internal resistances ($0.1\ \Omega$ on power rails, $25\ \Omega$ on GPIO pins), stamped high-impedance ($10\text{ M}\Omega$) conductances for analog ADC inputs (quantizing post-solve potentials into 10-bit or 12-bit integer registers), utilized native Web Audio API for 2.4kHz piezo buzzer sound synthesis, and rendered dynamic canvas animations (radar pulses, sound waves, rotating servo horn).
- **Consequences:** Delivers authentic electrical loading, voltage sag, ADC conversion, and real actuator behavior with zero performance penalty on the 60fps render loop.

## 3. Solved Traps & Gotchas

### Trap 1: HTML Tag Extraction in Test Harness
- **Description:** Headless VM test script threw `SyntaxError: Invalid regular expression: missing /` when attempting `html.indexOf('<script>')`.
- **Root Cause:** Tailwind CDN was loaded via a `<script>` tag in the `<head>`, causing the test harness to extract the CDN script tag instead of the application logic script.
- **Resolution Pattern:** Always use `html.lastIndexOf('<script>') + 8` and `html.lastIndexOf('</script>')` to reliably isolate application logic in single-file architectures.

### Trap 2: LED Current-Limiting in Fuse Trip Verification
- **Description:** A series test circuit containing an alkaline battery, a Littelfuse polyfuse, and an LED did not trip the fuse even when resistor was lowered to $1\ \Omega$.
- **Root Cause:** The physical LED model enforces a forward knee voltage ($V_f = 2.0\text{ V}$) and internal dynamic resistance ($R_j = 15\ \Omega$), which inherently limited total loop current to $< 350\text{ mA}$, below the $500\text{ mA}$ fuse rating.
- **Resolution Pattern:** In physical circuit modeling, tests must short directly across high-impedance semiconductor junctions to simulate dead-short fault currents ($I > 1.0\text{ A}$) rather than assuming an LED will conduct infinite current.

### Trap 3: PowerShell Inlined String Escaping
- **Description:** Inline PowerShell commands with nested JSON or double quotes threw string parsing errors.
- **Resolution Pattern:** Never pass complex multi-line JavaScript logic through PowerShell command-line arguments. Write temporary test scripts to `scratch/*.js` and execute with `node scratch/<file>.js`.

### Trap 4: Viewport Coordinate Offsets on Canvas Resize
- **Description:** Canvas resizing using CSS styles caused schematic drawings to stretch and misalign mouse clicks.
- **Root Cause:** Scaling CSS width/height without synchronizing canvas buffer resolution scales pixels instead of canvas coordinate units.
- **Resolution Pattern:** Always set `canvas.width = container.clientWidth` and `canvas.height = container.clientHeight` directly on the canvas element, followed immediately by `renderCanvas()`.

### Trap 5: Internal Source Resistance vs Bench Power Supply in Verification Tests
- **Description:** A relay switched load test expecting $1.20\text{ A}$ from a $12\text{ V}$ source across a $10\ \Omega$ load yielded only $1.04\text{ A}$.
- **Root Cause:** The default DC voltage source component is modeled after an alkaline battery with $R_{int} = 1.5\ \Omega$ ($12\text{V} / 11.5\ \Omega = 1.043\text{ A}$).
- **Resolution Pattern:** For pure electrical load verification tests representing ideal laboratory benchtop power supplies, explicitly configure `internalR: 0.01` on the source.

## 4. Environment Notes
- **Target Runtime:** Any modern evergreen web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari).
- **Execution Mode:** Zero-dependency standalone HTML5 file via `file:///` or any static HTTP server.
- **Verification Runtime:** Node.js 20.x+ for running automated headless test suites in `scratch/`.

