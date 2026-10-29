# UI/UX Design System & Aesthetic Guidelines

## 1. Design Philosophy

- **Electronic Design Automation (EDA) Workstation Aesthetic:** ElectroSim Pro is modeled after high-end engineering benches (Altium, KiCad, Keysight instruments) rather than generic SaaS dashboards.
- **High-Density Engineering Information:** Clean, legible layouts optimized for multi-hour circuit design sessions without visual fatigue.
- **Consistent Semantic Color Coding:** Distinct colors represent specific physical phenomena:
  - Voltage: Cyan (`#38bdf8`)
  - Current: Emerald (`#34d399` / `#10b981`)
  - Power: Purple (`#a855f7`)
  - Alerts & Faults: Amber (`#f59e0b`) & Crimson Red (`#ef4444`)
- **Tactile Feedback & Micro-Interactions:** Subtle hover states, active button down-press scaling, glowing oscilloscope phosphor traces, and animated particle currents.

## 2. Color Palette & Semantic Tokens

### 2.1 Surfaces & Canvas (Dark Graphite Workstation Theme)

| Token Name | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| `workspace-canvas` | `#020617` / `#030712` | Deep slate schematic canvas background |
| `surface-panel` | `#0f172a` | Header bar, palette, and inspector panel background |
| `surface-card` | `#1e293b` | Elevated cards, telemetry modules, and tooltips |
| `surface-input` | `#020617` / `#090d16` | Parameter text boxes, search inputs, and oscilloscope screen |
| `border-subtle` | `#1e293b` | Canvas grid minor dots and panel dividers |
| `border-standard` | `#334155` | Card borders, modal frames, and graticule reference axes |
| `border-focus` | `#6366f1` | Focus ring around active inputs and selected elements |

### 2.2 Semantic Physical Telemetry Tokens

| Domain | Token Name | Hex Code | Tailwind Equivalent | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Voltage** | `telemetry-v` | `#38bdf8` | `text-cyan-400` / `bg-cyan-950/30` | Node voltage readouts, voltage drop cards, CH1 scope trace |
| **Current** | `telemetry-i` | `#34d399` | `text-emerald-400` / `bg-emerald-950/30` | Branch currents, electron particles, CH2 scope trace |
| **Power** | `telemetry-p` | `#c084fc` | `text-purple-400` / `bg-purple-950/30` | Power dissipation cards, wattages, thermal load indicators |
| **Safe / Nominal** | `state-safe` | `#10b981` | `text-emerald-400` / `bg-emerald-500` | Safe Operating Area (SOA) stress bar (< 75% load) |
| **Warning / Stress**| `state-warning`| `#f59e0b` | `text-amber-400` / `bg-amber-500` | High load stress badge (75% - 100% rated max) |
| **Hazard / Fault** | `state-fault` | `#ef4444` | `text-red-400` / `bg-red-500` | Overstress badge, blown polyfuse, reverse breakdown warning |

### 2.3 Component Category Palette Tokens

| Category | Pill Background | Border Accent | Symbol Text | Components Included |
| :--- | :--- | :--- | :--- | :--- |
| **Power Sources** | `#451a03` | `#92400e` | `#fbbf24` | DC Battery, AC Generator, Ground reference |
| **Passives** | `#083344` | `#155e75` | `#22d3ee` | Resistors, Capacitors, Inductors |
| **Semiconductors** | `#3b0764` | `#6b21a8` | `#c084fc` | Red LED, 1N4007 Diode, BZX55C Zener, 2N2222 NPN BJT |
| **Control & Protect**| `#022c22` | `#065f46` | `#34d399` | SPST/SPDT Toggle Switch, 0154.500DR Polyfuse |

## 3. Typography Scale

ElectroSim Pro pairs **Inter** for clean UI navigation with **JetBrains Mono** for technical precision.

| Style Name | Font Family | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Title** | Inter | 18px | Bold (700) | 24px | Modal titles, application identity |
| **Section Header**| Inter | 12px | Bold (700) | 16px | Uppercase section badges (`text-[10px] uppercase font-bold`) |
| **Body UI** | Inter | 13px | Regular (400) | 18px | General UI labels, buttons, and helper descriptions |
| **Engineering Value**| JetBrains Mono| 14px | Bold (700) | 20px | Live telemetry values ($9.00\text{ V}$, $20.20\text{ mA}$) |
| **Monospaced Data** | JetBrains Mono| 11px | SemiBold (600)| 16px | Component terminal coordinates, EIA marking codes, hotkeys |
| **Micro Caption** | JetBrains Mono| 9px | Regular (400) | 12px | Scope graticule units, zoom percentage, pin labels |

## 4. Spacing & Metric Grid (8pt System)

- `spacing-3xs`: 2px | Fine graticule ticks and inner borders
- `spacing-xxs`: 4px | Pill padding, icon-text gap
- `spacing-xs`: 8px | Grid subdivisions, card padding, button gaps
- `spacing-sm`: 12px | Compact panel padding, header spacing
- `spacing-md`: 16px | Default card padding, viewport margins
- `spacing-lg`: 20px | Standard schematic canvas grid unit
- `spacing-xl`: 24px | Section separation, modal margins
- `spacing-xxl`: 100px | Major coordinate crosshair interval (5 grid units)

## 5. Shape, Elevation & Micro-Interactions

### 5.1 Corner Radii
- `radius-sm`: 6px (`rounded-md`) — Data chips, category pills, input fields
- `radius-md`: 10px (`rounded-xl`) — Action buttons, telemetry cards, toolbars
- `radius-lg`: 16px (`rounded-2xl`) — Floating viewport dock, stress container, modals
- `radius-full`: 9999px (`rounded-full`) — Status indicator LEDs, stress progress bars

### 5.2 Floating Viewport HUD Dock
- Positioned at `absolute bottom-5 left-5`.
- Frosted glassmorphism background: `bg-slate-900/90 backdrop-blur-md border border-slate-800/90 shadow-2xl`.
- High-efficiency grouped buttons:
  - Tool Group: Select (`S`), Pan (`H`), Wire (`W`).
  - Action Group: Rotate 90° (`R`), Delete Component/Wire (`Del`).
  - Viewport Group: Zoom In (`+`), Zoom Out (`-`), Fit View (`Home`).
- Micro-interactions: Active tool receives `bg-indigo-600 text-white shadow-md`; hover tools receive `bg-slate-700 text-white`.

### 5.3 Bench Oscilloscope Visual Architecture
- Matte dark phosphor canvas (`#030712`).
- Calibration: 8 horizontal divisions, 4 vertical divisions.
- Center reference crosshair with 5 calibrated sub-ticks per division.
- CH1 Voltage Trace: Cyan `#38bdf8` with $6\text{ px}$ phosphor glow (`shadowColor = '#38bdf8'`).
- CH2 Current Trace: Emerald `#34d399` with $4\text{ px}$ phosphor glow (`shadowColor = '#34d39980'`).

