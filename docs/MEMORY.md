# Agent Memory & Context Log

## 1. Active Session Context
- **Current Milestone:** Milestone 4 Complete (Workstation UI/UX Redesign & Viewport Dock Action Integration)
- **Active Focus:** Maintenance of comprehensive 6-file Vibe Coding documentation suite (`docs/`)
- **Last Verified Step:** Automated verification of Floating Canvas Viewport Dock with icon-only Rotate & Delete buttons, 3-card telemetry grid, live oscilloscope, and 6 headless test suites passing.

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

### ADR-005: Relocation of Action Buttons to Floating Canvas Viewport Dock
- **Date:** 2026-10-28
- **Context:** Placing large full-width Rotate and Delete buttons in the Component Inspector pushed technical details and color code graphics below the fold, while also requiring users to move their cursor between the canvas and inspector for every orientation change.
- **Decision:** Removed Rotate and Delete buttons from the inspector template and integrated them as icon-only actions directly into the `<!-- Floating Canvas Viewport Dock -->` on the canvas alongside navigation tools (`S`, `H`, `W`).
- **Consequences:** Component Inspector remains focused entirely on electrical parameters and specifications without clutter; users can rotate and delete components with one click directly on the canvas viewport.

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
- **Resolution Pattern:** Always set `canvas.width = container.clientWidth` and `canvas.height = container.clientHeight` directly on the canvas element, followed immediately by `renderCanvas()`.

## 4. Environment Notes
- **Target Runtime:** Any modern evergreen web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari).
- **Execution Mode:** Zero-dependency standalone HTML5 file via `file:///` or any static HTTP server.
- **Verification Runtime:** Node.js 20.x+ for running automated headless test suites in `scratch/`.

