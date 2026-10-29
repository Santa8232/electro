# ElectroSim Pro — Interactive Electronic Circuit Simulator & EDA Workbench

[![Version](https://img.shields.io/badge/version-2.2%20EDA-indigo.svg)](file:///c:/Users/Santa/OneDrive/Desktop/electro/index.html)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0%20(Pure%20HTML5%20%2B%20ES6%2B)-emerald.svg)](file:///c:/Users/Santa/OneDrive/Desktop/electro/index.html)
[![Tests Passing](https://img.shields.io/badge/tests-100%25%20passing%20(6%2F6%20suites)-blue.svg)](file:///c:/Users/Santa/OneDrive/Desktop/electro/scratch/)
[![Architecture](https://img.shields.io/badge/architecture-MNA%20Matrix%20Solver-purple.svg)](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/ARCHITECTURE.md)
[![License](https://img.shields.io/badge/license-MIT-slate.svg)](#license)

**ElectroSim Pro** is a modern, zero-dependency, browser-native Electronic Design Automation (EDA) workstation and interactive circuit simulation engine. Designed to bridge the gap between academic SPICE engines and user-friendly visual schematic capture, it evaluates mathematical Modified Nodal Analysis (MNA) matrices at 60 fps directly inside any modern web browser without installations, package managers, or build pipelines.

---

## ⚡ Key Highlights

- **Mathematical Modified Nodal Analysis (MNA):** Computes exact node voltages and branch currents via Gaussian elimination with partial row pivoting ($A \cdot x = z$).
- **Active Semiconductor Physics:** Authentic companion models for NPN BJTs (2N2222A), Silicon Rectifiers (1N4007), 5.1V Zener Voltage Regulators (BZX55C), and Fast-Acting Polyfuses (0154.500DR).
- **Thévenin Battery Internal Resistance:** Realistic alkaline cell behavior ($R_{int} = 1.5\ \Omega$) modeling loaded terminal voltage droop ($V_{term} = V_{oc} - I \cdot R_{int}$).
- **Safe Operating Area (SOA) Stress Telemetry:** Continuous evaluation of voltage, current, and power dissipation against manufacturer absolute maximum ratings with color-coded safety badges.
- **EIA-RS-279 Resistor Color-Code System:** Dynamic SVG resistor graphic decoding 4-band and 5-band color rings in real time.
- **Dual-Trace Virtual Bench Oscilloscope:** Calibrated $8 \times 4$ graticule screen with center crosshair tick marks, phosphor trace glow, and real-time $V_{pk}, I_{pk}, P$ telemetry.
- **Modern EDA Workstation UI/UX:** High-density grouped toolbar, live component search, category filter pills (`All`, `Power`, `Passives`, `Semis`, `Control`), dual-density grid dots & crosshairs, and collapsible sidebars (`[` and `]`).
- **Floating Canvas Viewport Dock:** Direct on-canvas tool selection (`S`, `H`, `W`) paired with one-click **Rotate 90°** (`R`) and **Delete** (`Del`) icon buttons.

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
│   - Power         │ • Empty State Watermark Guidance               │ • Resistor Color  │
│   - Passives      │                                                │   Code Visualizer │
│   - Semis         │ ┌────────────────────────────────────────────┐ │ • EIA Stamp Codes │
│   - Control       │ │ FLOATING VIEWPORT HUD DOCK                 │ │ • Real Datasheet  │
│ • Component Tiles │ │ [S] [H] [W] | [🔄 Rotate] [🗑️ Delete] | + - Fit│ │ • SOA Stress Bar │
│ • Custom IC Add   │ └────────────────────────────────────────────┘ ├───────────────────┤
│                   │                                                │ BENCH SCOPE       │
│ [ [ ] Collapse    │                                                │ Dual-Trace (CH1/2)│
└───────────────────┴────────────────────────────────────────────────┴───────────────────┘
```

---

## 📦 Component Library & Datasheet Archive

ElectroSim Pro integrates complete manufacturer specifications for all 12 core components:

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

1. **Simple LED Circuit (`simple_led`)**: 9V Battery $\to$ Toggle Switch $\to$ 330Ω Resistor $\to$ Red LED $\to$ Ground. Demonstrates closed-loop switching, forward current, and resistor color bands.
2. **MCU Transistor Switch & Relay Driver (`bjt_gpio_switch`)**: 3.3V Logic $\to$ 180Ω Base Resistor $\to$ 2N2222 NPN BJT switching a 12V inductive coil clamped by a 1N4007 flyback diode.
3. **Zener 5.1V Voltage Regulator (`zener_regulator`)**: 9V Supply with 100Ω series dropper feeding a BZX55C 5.1V Zener diode in reverse breakdown parallel with a 1kΩ load.
4. **Polyfuse Protected Battery Rail (`fused_power_rail`)**: 9V Battery with 500mA Fast Polyfuse and switch. Shorting the load dynamically trips the fuse into high-impedance protection.
5. **RC Low-Pass Filter (`rc_filter`)**: AC sinusoidal source feeding a 1kΩ resistor and 100µF capacitor to ground.
6. **Precision Voltage Divider (`voltage_divider`)**: 12V DC across dual matched 1kΩ resistors producing exact 6.00V output.
7. **AC Sine Wave & Resistor (`ac_bulb`)**: 24V AC sinusoidal signal generator driving a 150Ω resistive load.
8. **Interactive Switch & Dual LEDs (`two_way_switch`)**: Multi-branch circuit with independent switchable parallel legs.

---

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
| `Escape` | **Cancel Current Wiring / Deselect** | Global |

---

## 🧪 Automated Testing & Verification

ElectroSim Pro includes a suite of headless unit, physical, and end-to-end integration tests in `scratch/` executable with Node.js:

```powershell
# Run the complete test suite
node scratch/e2e_integration_test.js      # 10/10 MNA solver, switch, rotation, and persistence tests
node scratch/test_embedded_features.js   # 5/5 2N2222 BJT, BZX55C Zener, Polyfuse, and LED breakdown tests
node scratch/test_datasheet_features.js  # 4/4 Real datasheets coverage and SOA gauge tests
node scratch/test_component_details.js   # 5/5 Resistor color codes and EIA marking tests
node scratch/test_icon_buttons.js        # DOM open/close tag balance & icon button checks
node scratch/test_ui_ux_redesign.js       # Workstation layout, search, category pills & HUD tests
```

---

## 📚 Project Documentation

Comprehensive documentation is maintained in the project:

- **[`knowledge_transfer.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/knowledge_transfer.md)**: Master engineering architecture and developer onboarding handbook (15 sections).
- **[`docs/PRD.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/PRD.md)**: Product Requirements Document, vision, user personas, and acceptance criteria.
- **[`docs/ARCHITECTURE.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/ARCHITECTURE.md)**: Mathematical MNA solver formulations, semiconductor companion models, and data flow.
- **[`docs/RULES.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/RULES.md)**: Engineering rules, physics integrity policies, and verification gates.
- **[`docs/DESIGN.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/DESIGN.md)**: Dark graphite design tokens, physical telemetry colors, typography scale, and 8pt metric grid.
- **[`docs/TASKS.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/TASKS.md)**: Roadmap milestones and living execution tracker.
- **[`docs/MEMORY.md`](file:///c:/Users/Santa/OneDrive/Desktop/electro/docs/MEMORY.md)**: Architectural Decision Records (`ADR-001` through `ADR-005`) and solved traps.

---

## 📄 License

This project is open-source software licensed under the **MIT License**.

