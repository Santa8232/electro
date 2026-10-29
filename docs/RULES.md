# Engineering Rules & Vibe Coding Guidelines

## 1. Core Principles

1. **Zero External Build Dependencies:**
   - The application must always execute as a self-contained, single-file HTML document (`index.html`).
   - Do NOT introduce build pipelines, bundlers (`webpack`, `vite`, `esbuild`), or package managers (`npm`, `yarn`) for production runtime execution.
   - External dependencies are strictly limited to well-established CDNs (Tailwind CSS, FontAwesome, Google Fonts).

2. **Read Before Writing:**
   - Always inspect the existing code structure, function signatures, and DOM element IDs using `read_file` or search before editing.
   - Maintain contract consistency: never break public methods, global callbacks, or established element IDs (`btn-run`, `mode-select`, `btn-rotate`, `btn-delete`, `inspector-content`, etc.).

3. **Physics Integrity First:**
   - Never implement circuit behavior using fake heuristics when exact physical mathematics apply.
   - All electrical calculations must pass through the Modified Nodal Analysis (MNA) linear solver.
   - Respect real-world component constraints: battery internal resistance ($R_{int} = 1.5\ \Omega$), diode threshold ($V_f = 0.7\text{ V}$), reverse breakdown limits ($V_R > 5.0\text{ V}$), and fuse trip ratings.

4. **Atomic & Focused Modifications:**
   - Make focused, self-contained edits targeting specific features or bug fixes.
   - Avoid massive, unnecessary file rewrites that jeopardize working functionality.
   - Preserve all existing code comments, docstrings, and architectural breadcrumbs.

5. **No Phantom Code or Stubs:**
   - Never commit placeholder functions, unhandled `TODO` stubs, or dummy mocks into finalized production code.
   - Ensure every declared button, input, and modal has a working event handler and responsive feedback.

## 2. Code Quality & Styling Standards

### 2.1 DOM & JavaScript Separation
- Use declarative event handlers (`onclick`, `onchange`, `oninput`) referencing well-documented global controller functions.
- Maintain pure separation between state calculation (`CircuitSolver.solve`), schematic projection (`renderCanvas`), and inspector template generation (`updateInspector`).

### 2.2 Coordinate Geometry Discipline
- Always normalize mouse and pointer coordinates through the canvas bounding client rectangle:
  - `wx = (mouseX - state.panX) / state.zoom`
  - `wy = (mouseY - state.panY) / state.zoom`
- When resizing canvases, sync `canvas.width` and `canvas.height` directly to container client dimensions (`container.clientWidth`, `container.clientHeight`) to prevent high-DPI blur or coordinate drift.

### 2.3 Resilient Error Handling
- Wrap local storage I/O and JSON parsing in defensive `try-catch` blocks with informative user feedback toasts.
- Guard against singular matrices in Gaussian elimination by testing for zero pivots and falling back to open-circuit approximations.

## 3. Verification Gates

Before declaring any coding task complete, execute the full automated verification suite:

```powershell
node scratch/e2e_integration_test.js
node scratch/test_embedded_features.js
node scratch/test_datasheet_features.js
node scratch/test_component_details.js
node scratch/test_icon_buttons.js
node scratch/test_ui_ux_redesign.js
```

### Verification Checklist:
- [ ] All 6 test suites pass with 0 errors and 0 failures.
- [ ] HTML document tag balance check confirms equal open and close `<div>` tags.
- [ ] Canvas renders at 60 fps without console warnings or layout overflows.
- [ ] Component inspector renders live telemetry (Voltage in cyan, Current in emerald, Power in purple).
- [ ] Oscilloscope renders dual-channel traces with phosphor glow and calibrated graticule.

## 4. Git & Documentation Standards

- Format commit messages using Conventional Commits:
  - `feat:` New component, simulation model, or UI feature.
  - `fix:` Bug fix in circuit solver, routing, or rendering.
  - `refactor:` Code restructuring without behavioral changes.
  - `docs:` Updates to `docs/` or `knowledge_transfer.md`.
  - `test:` Additions or updates to headless test scripts.
- Whenever architecture changes or tricky bugs are resolved, immediately update `docs/MEMORY.md` and `docs/TASKS.md`.

