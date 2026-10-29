# System Architecture & Technical Specifications

## 1. High-Level Architecture Overview

```mermaid
graph TD
    User([User Interaction]) --> Viewport[HTML5 Canvas & Event Controller]
    User --> Toolbar[EDA Toolbar & Palette Controls]
    
    Toolbar --> AppState[Reactive State Store]
    Viewport --> AppState
    
    AppState --> MNA[Modified Nodal Analysis Solver]
    MNA --> UnionFind[Union-Find Netlist Synthesizer]
    MNA --> MatrixEngine[Gaussian Elimination Matrix Engine]
    MNA --> Physics[Semiconductor & Component Models]
    
    MatrixEngine --> SolveResult[Node Voltages & Branch Currents]
    SolveResult --> AppState
    
    AppState --> CanvasRenderer[Canvas 2D Schematic Renderer]
    AppState --> ScopeEngine[Bench Oscilloscope Subsystem]
    AppState --> Inspector[Component Inspector & SOA Gauge]
    AppState --> StorageEngine[Browser LocalStorage Engine]
```

The system operates around a single deterministic state container (`state`), evaluating circuit topology and physical matrices at 60 fps inside a `requestAnimationFrame` render loop.

## 2. Technology Stack Selection

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Language Runtime** | Vanilla JavaScript (ES6+) | Native Browser | High-performance, zero-transpile execution |
| **Canvas Graphic Engine** | HTML5 Canvas 2D Context | Standard W3C | Low-latency 60fps schematic and particle rendering |
| **Styling Framework** | Tailwind CSS | 3.x (CDN) | Utility-first dark graphite engineering theme |
| **Iconography** | FontAwesome Free | 6.4.0 (CDN) | EDA workstation iconography and symbol accents |
| **Typography** | Inter & JetBrains Mono | Google Fonts | High-contrast UI and monospaced engineering telemetry |
| **Persistence Engine** | Web Storage API (LocalStorage) | Native W3C | Instant schema persistence and session restore |
| **Verification Runner** | Node.js Test Harness (VM sandbox) | 20.x+ | Headless integration and physical validation tests |

## 3. Directory Conventions

ElectroSim Pro enforces a strictly self-contained single-file root layout accompanied by test and documentation suites:

```plaintext
electro/
├── index.html                   # Core application (Zero-dependency single-file EDA workstation)
├── knowledge_transfer.md        # Comprehensive engineering knowledge transfer handbook
├── docs/                        # Complete 6-file Vibe Coding documentation suite
│   ├── PRD.md                   # Product requirements and user stories
│   ├── ARCHITECTURE.md          # Technical architecture and solver mathematics
│   ├── RULES.md                 # Non-negotiable engineering rules and standards
│   ├── DESIGN.md                # Design tokens, typography, and color palettes
│   ├── TASKS.md                 # Roadmap and task execution tracker
│   └── MEMORY.md                # Architectural Decision Records (ADRs) and solved traps
└── scratch/                     # Automated test suites & validation harnesses
    ├── e2e_integration_test.js  # Headless MNA solver, rotation, and persistence tests
    ├── test_embedded_features.js# Active semiconductor & protection circuit tests
    ├── test_datasheet_features.js# Real datasheets coverage & SOA gauge tests
    ├── test_component_details.js# Resistor color codes and EIA marking tests
    ├── test_icon_buttons.js     # DOM validation and icon-only button checks
    └── test_ui_ux_redesign.js   # Workstation layout, search, and HUD tests
```

## 4. Subsystem Architectures

### 4.1 Electrical Simulation Engine (Modified Nodal Analysis)
Circuit analysis evaluates Kirchhoff's Current Law (KCL) and Kirchhoff's Voltage Law (KVL) via the matrix equation:

$$A \cdot x = z$$

Where:
- **$G$ Matrix ($N \times N$):** Conductance values ($1/R$) connecting node pairs.
- **$B$ Matrix ($N \times M$):** Incident connection matrix for independent voltage sources.
- **$C$ Matrix ($M \times N$):** Transpose of $B$ mapping node potentials to branch constraints.
- **$D$ Matrix ($M \times M$):** Source internal resistance ($R_{int} = 1.5\ \Omega$ for batteries).
- **$x$ Vector ($[N + M]$):** Unknown node voltages followed by unknown branch currents.
- **$z$ Vector ($[N + M]$):** Known independent source voltages and currents.

### 4.2 Semiconductor Physics Modeling
Non-linear components are solved iteratively:
1. **1N4007 Diode:** Modeled with Shockley diode behavior ($V_f = 0.7\text{ V}$, dynamic junction resistance $R_j = 10\ \Omega$, reverse leakage $1\text{ M}\Omega$).
2. **BZX55C Zener Diode:** Forward conduction at $0.7\text{ V}$, reverse breakdown clamp at $5.1\text{ V}$ with $R_z = 5\ \Omega$.
3. **2N2222 NPN BJT:** Multi-state transistor model evaluating cutoff ($V_{BE} < 0.65\text{ V}$), forward-active amplification ($I_C = \beta \cdot I_B$), and saturation ($V_{CE(sat)} = 0.2\text{ V}$).
4. **0154.500DR Polyfuse:** Dynamic thermal trip model tripping into high-resistance state ($1\text{ M}\Omega$) when current exceeds continuous rating ($500\text{ mA}$).

### 4.3 Schematic Canvas Engine
- **Coordinate Transformations:** Canvas viewport supports arbitrary panning (`state.panX, state.panY`) and zoom scaling (`state.zoom` between 0.4x and 2.5x).
- **Orthogonal Wire Routing:** Manhattan A*-style path generator with $20\text{ px}$ terminal stubs and bounding box obstacle clearance.
- **Particle Drift Animation:** Drift particles spaced along wire paths, moving with velocity:

$$v_{drift} = \text{clamp}(I \cdot 40, -15, 15)\text{ px/frame}$$

### 4.4 Bench Oscilloscope Subsystem
- **Phosphor Dual-Trace Monitor:** CH1 Voltage (Cyan `#38bdf8`) and CH2 Current (Emerald `#34d399`) buffered across canvas width.
- **Graticule Subdivisions:** $8 \times 4$ precision division grid with center crosshair tick marks (5 subdivisions per division).
- **Digital Telemetry Bar:** Peak voltage, peak current, active power dissipation, and probe target.

## 5. State Management & Data Flow

State is managed through a centralized store (`state`):
- `components`: Array of active circuit components with coordinates, rotation, values, and operational states.
- `wires`: Array of connection links between component terminal pairs.
- `history`: Circular undo/redo state buffer (30 snapshots).
- `scopeBuffer` & `scopeBufferI`: Ring buffers for real-time oscilloscope signal plotting.
- `selectedId` / `selectedType`: Tracked canvas entity for property inspection and editing.

Data flows unidirectionally:
`User Event (Palette / Canvas / Controls) -> State Mutation -> MNA Matrix Solve -> Canvas & Inspector Re-render`

## 6. Security & Sandboxing
- **Zero Remote Network Calls:** Entire simulator executes locally within the browser sandbox; no external telemetry or tracking.
- **Safe JSON Serialization:** Import and export validate schema versions and sanitize numeric property bounds.
- **Defensive Rendering:** Canvas coordinates are clamped to prevent infinite loop transforms or non-finite matrix determinants.

