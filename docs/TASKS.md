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

## Milestone 5: Future Capabilities & Enhancements
- [ ] Implement hierarchical sub-circuits and custom IC chip packaging.
- [ ] Add dual-probe digital multimeter (DMM) with draggable positive and negative leads.
- [ ] Add AC frequency sweep simulation with Bode magnitude and phase plots.
- [ ] Support custom SVG component symbol imports with arbitrary pin geometries.
- [ ] Add WAV audio signal generator and speaker audio output emulation.

