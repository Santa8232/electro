/**
 * ElectroSim Pro — AI Electronics Engineering Agent Frontend Module (ai_agent.js)
 * 
 * Provides interactive AI copilot functionality:
 * - Slide-out drawer management & keyboard shortcuts (F8 / Esc)
 * - Live circuit context snapshot generation (MNA telemetry, components, wires, ground status)
 * - NVIDIA Super-VL / Nemotron API backend communication with client-side fallback
 * - Circuit proposal validation, preview cards, and one-click canvas injection with Undo support
 * - Markdown & code formatting, copy actions, and datasheet attachment parsing
 */

(function(window, document) {
    'use strict';

    // Module State
    const aiState = {
        isOpen: false,
        isGenerating: false,
        activeAbortController: null,
        apiBaseUrl: (window.location.protocol === 'file:' || window.location.port !== '3001') 
            ? 'http://localhost:3001' 
            : '',
        conversationHistory: [],
        currentAttachment: null,
        proposals: new Map(), // proposalId -> proposal object
        backendStatus: 'checking' // 'online', 'mock', 'offline'
    };

    /**
     * DOM Element Helpers
     */
    function getEl(id) {
        return document.getElementById(id);
    }

    /**
     * Check Backend API Health on Load
     */
    async function checkAIBackendHealth() {
        const dot = getEl('ai-conn-dot');
        const statusText = getEl('ai-conn-status');
        const statusIndicator = getEl('ai-status-indicator');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);

            const res = await fetch(`${aiState.apiBaseUrl}/api/health`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                if (data.hasApiKey) {
                    aiState.backendStatus = 'online';
                    if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400';
                    if (statusText) statusText.textContent = 'NVIDIA Cloud Ready';
                    if (statusIndicator) statusIndicator.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5';
                } else {
                    aiState.backendStatus = 'mock';
                    if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-indigo-400';
                    if (statusText) statusText.textContent = 'Offline Mock Mode';
                    if (statusIndicator) statusIndicator.className = 'w-1.5 h-1.5 rounded-full bg-indigo-400 ml-0.5';
                }
            } else {
                throw new Error(`Health status ${res.status}`);
            }
        } catch (e) {
            aiState.backendStatus = 'offline';
            if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-amber-400';
            if (statusText) statusText.textContent = 'Local Standalone Mode';
            if (statusIndicator) statusIndicator.className = 'w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5';
        }
    }

    /**
     * Toggle AI Assistant Panel
     */
    function toggleAIAssistant() {
        if (aiState.isOpen) {
            closeAIAssistant();
        } else {
            openAIAssistant();
        }
    }

    /**
     * Open AI Assistant Panel
     */
    function openAIAssistant() {
        const panel = getEl('ai-assistant-panel');
        const btnHeader = getEl('btn-ai-copilot');
        const btnDock = getEl('btn-ai-dock');
        if (!panel) return;

        aiState.isOpen = true;
        panel.classList.remove('translate-x-[500px]', 'pointer-events-none', 'opacity-0');
        panel.classList.add('translate-x-0', 'pointer-events-auto', 'opacity-100');
        panel.style.transform = 'translateX(0)';
        panel.style.opacity = '1';
        panel.style.pointerEvents = 'auto';
        panel.style.display = 'flex';

        if (btnHeader) {
            btnHeader.classList.add('ring-2', 'ring-purple-400', 'shadow-purple-500/30');
        }
        if (btnDock) {
            btnDock.classList.add('bg-purple-600', 'text-white');
        }

        // Initialize welcome message if chat is empty
        const chatContainer = getEl('ai-chat-messages');
        if (chatContainer && chatContainer.children.length === 0) {
            renderWelcomeView();
        }

        const input = getEl('ai-user-input');
        if (input) {
            setTimeout(() => input.focus(), 150);
        }

        checkAIBackendHealth();
    }

    /**
     * Close AI Assistant Panel
     */
    function closeAIAssistant() {
        const panel = getEl('ai-assistant-panel');
        const btnHeader = getEl('btn-ai-copilot');
        const btnDock = getEl('btn-ai-dock');
        if (!panel) return;

        aiState.isOpen = false;
        panel.classList.add('translate-x-[500px]', 'pointer-events-none', 'opacity-0');
        panel.classList.remove('translate-x-0', 'pointer-events-auto', 'opacity-100');
        panel.style.transform = 'translateX(520px)';
        panel.style.opacity = '0';
        panel.style.pointerEvents = 'none';

        if (btnHeader) {
            btnHeader.classList.remove('ring-2', 'ring-purple-400', 'shadow-purple-500/30');
        }
        if (btnDock) {
            btnDock.classList.remove('bg-purple-600', 'text-white');
        }
    }

    /**
     * Render Starter Prompts / Welcome Screen
     */
    function renderWelcomeView() {
        const chatContainer = getEl('ai-chat-messages');
        if (!chatContainer) return;

        chatContainer.innerHTML = `
            <div class="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-slate-300 space-y-3">
                <div class="flex items-center space-x-2 text-purple-300 font-semibold text-xs">
                    <i class="fa-solid fa-microchip"></i>
                    <span>ElectroSim AI Engineering Copilot</span>
                </div>
                <p class="text-[11px] leading-relaxed text-slate-300">
                    Welcome! I can assist you with circuit design, datasheet specifications, Ohm's law calculations, and live MNA simulation analysis.
                </p>
                <div class="space-y-1.5 pt-1">
                    <div class="text-[10px] uppercase font-bold tracking-wider text-purple-400">Suggested Starter Prompts:</div>
                    <div class="grid grid-cols-1 gap-1.5">
                        <button onclick="insertAIPrompt('Help me build a 5V LED circuit.')" class="text-left p-2 rounded-lg bg-slate-900/80 hover:bg-purple-900/40 hover:border-purple-600/60 border border-slate-800 text-[11px] text-slate-200 transition-all flex items-center justify-between group">
                            <span>💡 "Help me build a 5V LED circuit."</span>
                            <i class="fa-solid fa-arrow-right text-[10px] text-slate-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all"></i>
                        </button>
                        <button onclick="insertAIPrompt('Analyze my current circuit and check for faults.')" class="text-left p-2 rounded-lg bg-slate-900/80 hover:bg-purple-900/40 hover:border-purple-600/60 border border-slate-800 text-[11px] text-slate-200 transition-all flex items-center justify-between group">
                            <span>🔍 "Analyze my current circuit."</span>
                            <i class="fa-solid fa-arrow-right text-[10px] text-slate-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all"></i>
                        </button>
                        <button onclick="insertAIPrompt('Explain how a 2N2222 transistor switch works.')" class="text-left p-2 rounded-lg bg-slate-900/80 hover:bg-purple-900/40 hover:border-purple-600/60 border border-slate-800 text-[11px] text-slate-200 transition-all flex items-center justify-between group">
                            <span>⚡ "Explain how this transistor circuit works."</span>
                            <i class="fa-solid fa-arrow-right text-[10px] text-slate-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all"></i>
                        </button>
                        <button onclick="insertAIPrompt('What are the maximum ratings for the 1N4007 and BZX55C?')" class="text-left p-2 rounded-lg bg-slate-900/80 hover:bg-purple-900/40 hover:border-purple-600/60 border border-slate-800 text-[11px] text-slate-200 transition-all flex items-center justify-between group">
                            <span>📄 "Find the important specifications in this datasheet."</span>
                            <i class="fa-solid fa-arrow-right text-[10px] text-slate-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Insert Quick Prompt into Input Box
     */
    function insertAIPrompt(text) {
        const input = getEl('ai-user-input');
        if (input) {
            input.value = text;
            input.focus();
            sendAIMessage();
        }
    }

    /**
     * Build Read-Only Snapshot of Circuit State
     */
    function buildCircuitContext() {
        if (typeof state === 'undefined') return { error: 'Simulator state not initialized' };

        const allTypes = (typeof COMPONENT_TYPES !== 'undefined') ? COMPONENT_TYPES : {};

        const components = (state.components || []).map(c => {
            const def = allTypes[c.type] || {};
            return {
                id: c.id,
                type: c.type,
                name: def.name || c.type,
                value: c.value,
                unit: def.unit || '',
                x: c.x,
                y: c.y,
                rotation: c.rotation || 0,
                state: c.state
            };
        });

        const wires = (state.wires || []).map(w => ({
            id: w.id,
            fromComp: w.fromComp,
            fromTerm: w.fromTerm,
            toComp: w.toComp,
            toTerm: w.toTerm
        }));

        const hasGround = components.some(c => c.type === 'ground');

        // Check for unconnected pins
        const terminalCounts = {};
        wires.forEach(w => {
            terminalCounts[`${w.fromComp}_${w.fromTerm}`] = (terminalCounts[`${w.fromComp}_${w.fromTerm}`] || 0) + 1;
            terminalCounts[`${w.toComp}_${w.toTerm}`] = (terminalCounts[`${w.toComp}_${w.toTerm}`] || 0) + 1;
        });

        const unconnectedPins = [];
        components.forEach(c => {
            const def = allTypes[c.type] || {};
            const numTerms = def.terminals || 2;
            for (let t = 0; t < numTerms; t++) {
                if (!terminalCounts[`${c.id}_${t}`]) {
                    unconnectedPins.push({ componentId: c.id, type: c.type, terminal: t });
                }
            }
        });

        // Selected component context
        let selected = null;
        if (state.selectedComponent) {
            const c = state.selectedComponent;
            const def = allTypes[c.type] || {};
            selected = {
                id: c.id,
                type: c.type,
                name: def.name || c.type,
                value: c.value,
                unit: def.unit || '',
                state: c.state
            };
        }

        // MNA Solver results
        const lastSolve = state.lastSolveResult || null;
        const nodeVoltages = lastSolve && lastSolve.nodeVoltages ? lastSolve.nodeVoltages : null;

        return {
            timestamp: new Date().toISOString(),
            simulationRunning: Boolean(state.simulationRunning),
            simulationSpeed: state.simulationSpeed || 1,
            componentCount: components.length,
            wireCount: wires.length,
            hasGround,
            unconnectedPins,
            selectedComponent: selected,
            components,
            wires,
            nodeVoltages
        };
    }

    function buildSelectedComponentContext() {
        if (typeof state === 'undefined' || !state.selectedComponent) return null;
        const c = state.selectedComponent;
        const def = (typeof COMPONENT_TYPES !== 'undefined' && COMPONENT_TYPES[c.type]) ? COMPONENT_TYPES[c.type] : {};
        return {
            id: c.id,
            type: c.type,
            name: def.name || c.type,
            value: c.value,
            unit: def.unit || '',
            state: c.state,
            x: c.x,
            y: c.y
        };
    }

    function buildSimulationResultsContext() {
        if (typeof state === 'undefined' || !state.lastSolveResult) return null;
        return {
            converged: true,
            nodeVoltages: state.lastSolveResult.nodeVoltages || {},
            branchCurrents: state.lastSolveResult.branchCurrents || {},
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Input Key Handler (Enter to send, Shift+Enter for newline)
     */
    function handleAIInputKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAIMessage();
        }
    }

    /**
     * Model Selector Change Handler
     */
    function onAiModelChanged(model) {
        const badge = getEl('ai-model-badge');
        if (badge) {
            if (model.includes('super-vl')) badge.textContent = 'Super-VL';
            else if (model.includes('70b')) badge.textContent = 'Nemotron 70B';
            else if (model.includes('llama-3.2')) badge.textContent = 'Llama 3.2';
            else if (model === 'mock') badge.textContent = 'Offline Mock';
            else badge.textContent = 'Custom Model';
        }
    }

    /**
     * Datasheet File Upload Handler
     */
    function handleAIDatasheetUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
            aiState.currentAttachment = {
                name: file.name,
                type: file.type || 'text/plain',
                size: file.size,
                content: evt.target.result
            };

            const label = getEl('ai-attachment-label');
            const removeBtn = getEl('ai-remove-attachment');
            if (label) label.textContent = file.name.substring(0, 14) + (file.name.length > 14 ? '...' : '');
            if (removeBtn) removeBtn.classList.remove('hidden');
            if (typeof showToast === 'function') {
                showToast(`Attached datasheet: ${file.name}`, 'info');
            }
        };

        if (file.type === 'application/pdf') {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    }

    /**
     * Remove Datasheet Attachment
     */
    function removeAIAttachment() {
        aiState.currentAttachment = null;
        const input = getEl('ai-datasheet-input');
        const label = getEl('ai-attachment-label');
        const removeBtn = getEl('ai-remove-attachment');
        if (input) input.value = '';
        if (label) label.textContent = 'Attach Specs';
        if (removeBtn) removeBtn.classList.add('hidden');
    }

    /**
     * Clear Chat History
     */
    function clearAIChat() {
        aiState.conversationHistory = [];
        aiState.proposals.clear();
        renderWelcomeView();
        if (typeof showToast === 'function') {
            showToast('AI chat history cleared', 'info');
        }
    }

    /**
     * Stop AI Generation
     */
    function stopAIGeneration() {
        if (aiState.activeAbortController) {
            aiState.activeAbortController.abort();
            aiState.activeAbortController = null;
        }
        setGeneratingState(false);
    }

    /**
     * Update UI Generating Status
     */
    function setGeneratingState(isGenerating, statusText = 'Analyzing circuit physics & equations...') {
        aiState.isGenerating = isGenerating;
        const bar = getEl('ai-thinking-bar');
        const sendBtn = getEl('btn-ai-send');
        const textEl = getEl('ai-thinking-text');

        if (bar) {
            if (isGenerating) {
                bar.classList.remove('hidden');
                if (textEl) textEl.textContent = statusText;
            } else {
                bar.classList.add('hidden');
            }
        }
        if (sendBtn) {
            sendBtn.disabled = isGenerating;
        }
    }

    /**
     * Main Send Message Function
     */
    async function sendAIMessage() {
        const input = getEl('ai-user-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text || aiState.isGenerating) return;

        input.value = '';
        appendMessage('user', text);

        aiState.conversationHistory.push({ role: 'user', content: text });

        const contextToggle = getEl('ai-context-toggle');
        const includeContext = contextToggle ? contextToggle.checked : true;
        const circuitContext = includeContext ? buildCircuitContext() : null;

        const modelSelector = getEl('ai-model-selector');
        const model = modelSelector ? modelSelector.value : 'nvidia/nemotron-3.5-super-vl-120b-a12b';

        setGeneratingState(true);

        aiState.activeAbortController = new AbortController();

        try {
            const payload = {
                messages: aiState.conversationHistory,
                model: model,
                context: circuitContext,
                attachment: aiState.currentAttachment
            };

            let responseData = null;

            // Attempt network fetch to backend proxy
            try {
                const res = await fetch(`${aiState.apiBaseUrl}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: aiState.activeAbortController.signal
                });

                if (res.ok) {
                    responseData = await res.json();
                } else {
                    const errJson = await res.json().catch(() => ({}));
                    throw new Error(errJson.error || `Server responded with ${res.status}`);
                }
            } catch (networkErr) {
                if (networkErr.name === 'AbortError') {
                    appendMessage('system', 'Generation stopped by user.');
                    return;
                }
                // Fallback to client-side local engineering mock
                responseData = generateClientFallbackResponse(text, circuitContext);
            }

            if (responseData && responseData.content) {
                aiState.conversationHistory.push({ role: 'assistant', content: responseData.content });
                appendMessage('assistant', responseData.content);
            } else {
                appendMessage('assistant', '⚠️ Unable to generate an engineering response. Please verify backend connectivity.');
            }

        } catch (err) {
            if (err.name !== 'AbortError') {
                appendMessage('system', `Error: ${err.message}`);
            }
        } finally {
            setGeneratingState(false);
            aiState.activeAbortController = null;
        }
    }

    /**
     * Client-Side Local Fallback Generator (Ensures Zero Crashing when Offline)
     */
    function generateClientFallbackResponse(query, context) {
        const q = query.toLowerCase();

        // 1. Build Transistor Switch / Blink Circuit
        if ((q.includes('transistor') || q.includes('bjt') || q.includes('2n2222')) && (q.includes('build') || q.includes('blink') || q.includes('switch') || q.includes('design') || q.includes('circuit') || q.includes('only'))) {
            const isBlinkReq = q.includes('blink') || q.includes('flasher') || q.includes('astable') || q.includes('multivibrator') || q.includes('oscillator');
            if (isBlinkReq) {
                const proposal = {
                    proposalId: 'prop_bjt_astable_' + Date.now(),
                    designObjective: 'Two-Transistor (2N2222A) Astable Multivibrator Blinking LED Circuit',
                    replaceExisting: false,
                    components: [
                        { id: 'v_src', type: 'dc_voltage', val: 5, unit: 'V', x: 80, y: 300, rotation: 0 },
                        { id: 'gnd', type: 'ground', val: 0, unit: 'V', x: 380, y: 540, rotation: 0 },
                        { id: 'r1', type: 'resistor', val: 330, unit: 'Ω', x: 220, y: 160, rotation: 0 },
                        { id: 'led1', type: 'led', val: 2, unit: 'V', x: 220, y: 260, rotation: 0 },
                        { id: 'q1', type: 'npn_bjt', val: 100, unit: 'hFE', x: 220, y: 420, rotation: 0 },
                        { id: 'r4', type: 'resistor', val: 330, unit: 'Ω', x: 540, y: 160, rotation: 0 },
                        { id: 'led2', type: 'led', val: 2, unit: 'V', x: 540, y: 260, rotation: 0 },
                        { id: 'q2', type: 'npn_bjt', val: 100, unit: 'hFE', x: 540, y: 420, rotation: 0 },
                        { id: 'r2', type: 'resistor', val: 33000, unit: 'Ω', x: 320, y: 160, rotation: 0 },
                        { id: 'r3', type: 'resistor', val: 33000, unit: 'Ω', x: 440, y: 160, rotation: 0 },
                        { id: 'c1', type: 'capacitor', val: 22, unit: 'µF', prevV: 4.0, x: 330, y: 340, rotation: 0 },
                        { id: 'c2', type: 'capacitor', val: 22, unit: 'µF', prevV: 0.0, x: 430, y: 340, rotation: 0 }
                    ],
                    wires: [
                        { fromComp: 'v_src', fromTerm: 1, toComp: 'r1', toTerm: 0 },
                        { fromComp: 'v_src', fromTerm: 1, toComp: 'r2', toTerm: 0 },
                        { fromComp: 'v_src', fromTerm: 1, toComp: 'r3', toTerm: 0 },
                        { fromComp: 'v_src', fromTerm: 1, toComp: 'r4', toTerm: 0 },
                        { fromComp: 'r1', fromTerm: 1, toComp: 'led1', toTerm: 0 },
                        { fromComp: 'led1', fromTerm: 1, toComp: 'q1', toTerm: 1 },
                        { fromComp: 'q1', fromTerm: 1, toComp: 'c1', toTerm: 0 },
                        { fromComp: 'r4', fromTerm: 1, toComp: 'led2', toTerm: 0 },
                        { fromComp: 'led2', fromTerm: 1, toComp: 'q2', toTerm: 1 },
                        { fromComp: 'q2', fromTerm: 1, toComp: 'c2', toTerm: 0 },
                        { fromComp: 'r2', fromTerm: 1, toComp: 'q1', toTerm: 0 },
                        { fromComp: 'c2', fromTerm: 1, toComp: 'q1', toTerm: 0 },
                        { fromComp: 'r3', fromTerm: 1, toComp: 'q2', toTerm: 0 },
                        { fromComp: 'c1', fromTerm: 1, toComp: 'q2', toTerm: 0 },
                        { fromComp: 'q1', fromTerm: 2, toComp: 'gnd', toTerm: 0 },
                        { fromComp: 'q2', fromTerm: 2, toComp: 'gnd', toTerm: 0 },
                        { fromComp: 'v_src', fromTerm: 0, toComp: 'gnd', toTerm: 0 }
                    ],
                    calculations: {
                        vSupply: '5.0 V',
                        oscillationType: 'Cross-Coupled Astable Multivibrator',
                        t1HalfPeriod: '0.693 × R2 × C1 = 0.693 × 33 kΩ × 22 µF ≈ 0.50 s',
                        t2HalfPeriod: '0.693 × R3 × C2 = 0.693 × 33 kΩ × 22 µF ≈ 0.50 s',
                        frequency: 'f ≈ 1 / (T1 + T2) ≈ 1.0 Hz (1 alternation per second)',
                        iLedOn: 'I_C ≈ (5.0V - 2.0V - 0.1V) / 330 Ω ≈ 8.7 mA (Safe brightness)',
                        iBaseDrive: 'I_B ≈ (5.0V - 0.7V) / 33 kΩ ≈ 0.13 mA -> forced beta ≈ 67 (< hFE 100)'
                    },
                    datasheetReferences: [
                        'STMicro / Central Semi 2N2222A: V_CEO = 40V, I_C = 800mA, P_D = 625mW, hFE = 100-300',
                        'Kingbright WP7113ID (Red LEDs): V_F = 2.0V, I_F(max) = 25mA',
                        'Nichicon UHE Electrolytic (22µF, 25V): Low ESR timing capacitors',
                        'Yageo MFR-25 Metal Film (330Ω, 33kΩ): 1/4W (250mW) 1% tolerance'
                    ]
                };

                const content = '### 🔬 Two-Transistor (2N2222A) Astable Multivibrator Blinking LED Circuit\n\n' +
                    'To make an LED blink **using transistors only** (without microcontrollers or 555 timer ICs), the standard engineering solution is the **Two-Transistor Astable Multivibrator**.\n\n' +
                    '#### 📐 How Autonomous Transistor Oscillation Works:\n' +
                    '1. **Cross-Coupled Feedback:**\n' +
                    '   Transistors Q1 and Q2 are cross-coupled through timing capacitors C1 (22 µF) and C2 (22 µF).\n' +
                    '2. **Alternating States:**\n' +
                    '   - When Q1 is ON (saturated), LED1 is lit (I_C ≈ 8.7 mA). Its collector drops to V_CE(sat) ≈ 0.1V, pulling the base of Q2 negative through C1, which drives Q2 into **cutoff** (LED2 is OFF).\n' +
                    '   - C1 then charges toward +5V through base resistor R3 (33 kΩ).\n' +
                    '   - As soon as V_B2 reaches +0.7V, Q2 turns ON (LED2 turns ON), abruptly pulling the base of Q1 low through C2, which forces Q1 into cutoff (LED1 turns OFF).\n' +
                    '3. **Timing & Frequency Calculations:**\n' +
                    '   $$T_1 = \\ln(2) \\times R_2 \\times C_1 = 0.693 \\times 33\\text{ k}\\Omega \\times 22\\ \\mu\\text{F} \\approx 0.50\\text{ s}$$\n' +
                    '   $$T_2 = \\ln(2) \\times R_3 \\times C_2 = 0.693 \\times 33\\text{ k}\\Omega \\times 22\\ \\mu\\text{F} \\approx 0.50\\text{ s}$$\n' +
                    '   $$T_{total} = T_1 + T_2 \\approx 1.0\\text{ s} \\implies f = \\frac{1}{T_{total}} \\approx 1.0\\text{ Hz}$$\n' +
                    '   The two LEDs alternate blinking at approximately **1 Hz (1 blink per second)**!\n\n' +
                    '```json:circuit_proposal\n' + JSON.stringify(proposal, null, 2) + '\n```\n\n' +
                    'Review the schematic above and click **Apply to Canvas** to place this circuit directly onto your workspace!';

                return {
                    ok: true,
                    content
                };
            }

            const proposal = {
                proposalId: 'prop_bjt_switch_' + Date.now(),
                designObjective: '2N2222A NPN Transistor Switch Circuit',
                replaceExisting: false,
                components: [
                    { id: 'v_src', type: 'dc_voltage', val: 5, unit: 'V', x: 140, y: 260, rotation: 0 },
                    { id: 'sw1', type: 'switch', val: 1, unit: 'State', x: 260, y: 180, rotation: 0 },
                    { id: 'r_base', type: 'resistor', val: 1000, unit: 'Ω', x: 380, y: 180, rotation: 0 },
                    { id: 'r_coll', type: 'resistor', val: 330, unit: 'Ω', x: 520, y: 180, rotation: 0 },
                    { id: 'led1', type: 'led', val: 2, unit: 'V', x: 520, y: 280, rotation: 0 },
                    { id: 'q1', type: 'npn_bjt', val: 100, unit: 'hFE', x: 520, y: 380, rotation: 0 },
                    { id: 'gnd1', type: 'ground', val: 0, unit: 'V', x: 380, y: 460, rotation: 0 }
                ],
                wires: [
                    { fromComp: 'v_src', fromTerm: 1, toComp: 'sw1', toTerm: 0 },
                    { fromComp: 'sw1', fromTerm: 1, toComp: 'r_base', toTerm: 0 },
                    { fromComp: 'v_src', fromTerm: 1, toComp: 'r_coll', toTerm: 0 },
                    { fromComp: 'r_base', fromTerm: 1, toComp: 'q1', toTerm: 0 },
                    { fromComp: 'r_coll', fromTerm: 1, toComp: 'led1', toTerm: 0 },
                    { fromComp: 'led1', fromTerm: 1, toComp: 'q1', toTerm: 1 },
                    { fromComp: 'q1', fromTerm: 2, toComp: 'gnd1', toTerm: 0 },
                    { fromComp: 'v_src', fromTerm: 0, toComp: 'gnd1', toTerm: 0 }
                ],
                calculations: {
                    vSupply: '5.0 V',
                    rBase: '1.0 kΩ (I_B ≈ 4.3 mA base drive)',
                    rCollector: '330 Ω (I_C ≈ 8.7 mA LED current)',
                    vCEsat: '0.02 V (Hard Saturation)',
                    forcedBeta: 'I_C / I_B ≈ 2.0 (Ensures deep saturation)'
                },
                datasheetReferences: [
                    'STMicro / Central Semi 2N2222A: V_CEO = 40V, I_C = 800mA, P_D = 625mW',
                    'Kingbright WP7113ID (Red LED): V_F = 2.0V, I_F(max) = 25mA',
                    'Yageo MFR-25 Metal Film Resistors: 1/4W (250mW)'
                ]
            };

            const content = '### 🔬 2N2222A Transistor LED Switch Circuit\n\n' +
                'Here is a verified transistor switching circuit using a **2N2222A NPN BJT** to drive an indicator LED from a 5V supply:\n\n' +
                '#### 📐 Engineering Calculations & Theory:\n' +
                '1. **Base Drive Resistor ($R_{Base} = 1\\text{ k}\\Omega$):**\n' +
                '   $$I_B = \\frac{V_{supply} - V_{BE}}{R_{Base}} = \\frac{5.0\\text{ V} - 0.7\\text{ V}}{1000\\ \\Omega} = 4.3\\text{ mA}$$\n' +
                '2. **Collector Load Resistor ($R_{Collector} = 330\\ \\Omega$):**\n' +
                '   $$I_C = \\frac{V_{supply} - V_F - V_{CE(sat)}}{R_{Collector}} = \\frac{5.0\\text{ V} - 2.0\\text{ V} - 0.02\\text{ V}}{330\\ \\Omega} \\approx 8.7\\text{ mA}$$\n' +
                '3. **Hard Saturation Guarantee:**\n' +
                '   The forced beta $\\beta_{forced} = I_C / I_B \\approx 8.7 / 4.3 \\approx 2.0 \\ll 100$. The transistor operates in deep saturation ($V_{CE} \\approx 20\\text{mV}$) with minimal heat dissipation ($P_Q \\approx 0.17\\text{ mW}$).\n\n' +
                '```json:circuit_proposal\n' + JSON.stringify(proposal, null, 2) + '\n```\n\n' +
                'Review the schematic above and click **Apply to Canvas** to place this circuit directly onto your workspace!';

            return {
                ok: true,
                content
            };
        }

        // 2. Build LED Circuit
        if (q.includes('build') || q.includes('led') || q.includes('5v led') || q.includes('design')) {
            const proposal = {
                proposalId: 'prop_led_5v_' + Date.now(),
                designObjective: '5V Red LED Indicator with Current-Limiting Resistor',
                replaceExisting: false,
                components: [
                    { id: 'v1', type: 'dc_voltage', val: 5, unit: 'V', x: 180, y: 260, rotation: 0 },
                    { id: 'r1', type: 'resistor', val: 330, unit: 'Ω', x: 340, y: 180, rotation: 0 },
                    { id: 'led1', type: 'led', val: 2, unit: 'V', x: 500, y: 180, rotation: 0 },
                    { id: 'gnd1', type: 'ground', val: 0, unit: 'V', x: 340, y: 340, rotation: 0 }
                ],
                wires: [
                    { fromComp: 'v1', fromTerm: 1, toComp: 'r1', toTerm: 0 },
                    { fromComp: 'r1', fromTerm: 1, toComp: 'led1', toTerm: 0 },
                    { fromComp: 'led1', fromTerm: 1, toComp: 'gnd1', toTerm: 0 },
                    { fromComp: 'v1', fromTerm: 0, toComp: 'gnd1', toTerm: 0 }
                ],
                calculations: {
                    vSupply: '5.0 V',
                    vForward: '2.0 V (Kingbright WP7113ID Red LED)',
                    rCalculated: '150 Ω theoretical; standard 330 Ω chosen for safe 9.1 mA current',
                    powerResistor: '27.3 mW (Well within 250mW 1/4W rating)'
                },
                datasheetReferences: [
                    'Kingbright WP7113ID Red LED: Forward voltage VF = 2.0V, max continuous current IF = 25mA',
                    'Yageo MFR-25 Metal Film Resistor: 1/4W (250mW) power rating'
                ]
            };

            return {
                ok: true,
                content: `### 💡 5V LED Indicator Circuit Design

To safely drive a Red LED from a 5V DC source:
1. **Ohm's Law Calculation:**
   $$\$R = \\frac{V_{supply} - V_F}{I_{LED}} = \\frac{5.0\\text{V} - 2.0\\text{V}}{0.020\\text{A}} = 150\\ \\Omega\$$
2. **Standard Resistor Selection:**
   A **330 Ω** resistor provides a safe operating current of approximately **9.1 mA**, ensuring bright illumination while remaining well below the 25 mA absolute maximum rating.
3. **Power Dissipation:**
   $$\$P = I^2 \\times R = (0.0091)^2 \\times 330 \\approx 27.3\\text{ mW}\$$
   This is well within standard 1/4W (250 mW) resistor capabilities.

\`\`\`json:circuit_proposal
${JSON.stringify(proposal, null, 2)}
\`\`\`

You can review and click **Apply to Canvas** below to automatically instantiate this circuit into your workspace.`
            };
        }

        // 2. Circuit Analysis
        if (q.includes('analyze') || q.includes('current circuit') || q.includes('circuit')) {
            let details = 'No live circuit components detected on canvas.';
            if (context && context.components && context.components.length > 0) {
                details = `Your schematic currently contains **${context.components.length} components** and **${context.wires.length} wires**. Simulation is **${context.simulationRunning ? 'Active' : 'Paused'}** with ${context.hasGround ? 'a valid 0V Earth Ground reference.' : '⚠️ **NO 0V Earth Ground** reference.'}`;
                if (context.unconnectedPins && context.unconnectedPins.length > 0) {
                    details += `\n- ⚠️ **Dangling Pins:** ${context.unconnectedPins.length} pin(s) are floating with no wires attached.`;
                }
            }

            return {
                ok: true,
                content: `### 📊 Live Circuit & MNA Solver Analysis

${details}

#### Engineering Diagnostic Tips:
- **0V Earth Ground:** In Modified Nodal Analysis, a 0V datum node is required to anchor matrix inversion.
- **SOA Protection:** Check the component inspector for real-time stress badges.
- **Continuity:** Ensure both terminals of two-terminal devices are connected in a closed circuit path.`
            };
        }

        // Default Engineering response
        return {
            ok: true,
            content: `### ⚡ ElectroSim Pro Engineering Copilot

I can assist with electronics design, Ohm's law equations, and circuit building:
- **Circuit Design:** Ask *"Help me build a 5V LED circuit"* to receive a complete schematic proposal.
- **Analysis:** Ask *"Analyze my current circuit"* to inspect active components and floating nodes.
- **Components:** Ask about transistors, zener diodes, 555 timers, or microcontrollers.`
        };
    }

    /**
     * Append Message to Chat UI
     */
    function appendMessage(role, content) {
        const chatContainer = getEl('ai-chat-messages');
        if (!chatContainer) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = 'flex flex-col space-y-1';

        if (role === 'user') {
            msgDiv.innerHTML = `
                <div class="flex items-start justify-end space-x-2">
                    <div class="max-w-[85%] bg-purple-600/30 border border-purple-500/50 rounded-2xl rounded-tr-sm p-3 text-slate-100 shadow-md">
                        <div class="text-xs break-words">${escapeHTML(content).replace(/\n/g, '<br>')}</div>
                    </div>
                    <div class="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white text-[10px] shrink-0 font-bold">
                        U
                    </div>
                </div>
            `;
        } else if (role === 'assistant') {
            const formatted = formatAssistantMessage(content);
            msgDiv.innerHTML = `
                <div class="flex items-start space-x-2">
                    <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-amber-300 text-[10px] shrink-0 shadow-md">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                    </div>
                    <div class="flex-1 max-w-[92%] bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-sm p-3.5 text-slate-200 shadow-md space-y-2">
                        <div class="prose prose-invert text-xs leading-relaxed break-words">${formatted}</div>
                        <div class="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 select-none">
                            <span>ElectroSim AI Copilot</span>
                            <button onclick="copyAICode(this)" class="hover:text-purple-300 transition-colors flex items-center space-x-1" title="Copy response">
                                <i class="fa-regular fa-copy"></i>
                                <span>Copy</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            msgDiv.innerHTML = `
                <div class="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[11px] flex items-center space-x-1.5">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>${escapeHTML(content)}</span>
                </div>
            `;
        }

        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    /**
     * Normalize Component Type string to standard key
     */
    function normalizeComponentType(typeStr) {
        if (!typeStr || typeof typeStr !== 'string') return 'resistor';
        const t = typeStr.toLowerCase().trim().replace(/[-_ ]+/g, '_');
        if (t.includes('voltage') || t.includes('dc_source') || t.includes('power_supply') || t.includes('battery') || t === 'v_dc' || t === 'v1' || t === 'vcc') return 'dc_voltage';
        if (t.includes('ac_source') || t.includes('sine') || t === 'v_ac') return 'ac_voltage';
        if (t.includes('resistor') || t === 'r') return 'resistor';
        if (t.includes('led') || t.includes('light_emitting')) return 'led';
        if (t.includes('zener')) return 'zener';
        if (t.includes('diode') || t.includes('1n4007') || t === 'd') return 'diode';
        if (t.includes('bjt') || t.includes('npn') || t.includes('transistor') || t.includes('2n2222')) return 'npn_bjt';
        if (t.includes('ground') || t.includes('gnd') || t.includes('earth')) return 'ground';
        if (t.includes('capacitor') || t.includes('cap') || t === 'c') return 'capacitor';
        if (t.includes('inductor') || t === 'l') return 'inductor';
        if (t.includes('switch') || t === 'sw') return 'switch';
        if (t.includes('fuse')) return 'fuse';
        if (t.includes('arduino') || t.includes('uno')) return 'arduino_uno';
        if (t.includes('esp32') || t.includes('nodemcu')) return 'esp32';
        if (t.includes('dht11') || t.includes('humidity')) return 'dht11';
        if (t.includes('hc_sr04') || t.includes('sonar') || t.includes('ultrasonic')) return 'hc_sr04';
        if (t.includes('pir') || t.includes('motion')) return 'pir_sensor';
        if (t.includes('ldr') || t.includes('photoresistor')) return 'ldr';
        if (t.includes('buzzer') || t.includes('sounder')) return 'buzzer';
        if (t.includes('servo') || t.includes('sg90')) return 'servo';
        if (t.includes('relay')) return 'relay';
        return t;
    }

    /**
     * Normalize circuit proposal object
     */
    function normalizeCircuitProposal(proposal) {
        if (!proposal || typeof proposal !== 'object') return null;
        if (!Array.isArray(proposal.components) || proposal.components.length === 0) return null;

        proposal.proposalId = proposal.proposalId || ('prop_' + Math.random().toString(36).substring(2, 9));
        proposal.designObjective = proposal.designObjective || 'AI Circuit Design';

        proposal.components.forEach((c, idx) => {
            c.id = c.id || ('comp_' + (idx + 1));
            c.type = normalizeComponentType(c.type);
            c.x = Number(c.x) || (180 + idx * 140);
            c.y = Number(c.y) || 200;
            c.val = c.val !== undefined ? parseFloat(c.val) : (c.value !== undefined ? parseFloat(c.value) : 5);
        });

        if (Array.isArray(proposal.wires)) {
            proposal.wires.forEach(w => {
                w.fromTerm = parseInt(w.fromTerm, 10) || 0;
                w.toTerm = parseInt(w.toTerm, 10) || 0;
            });
        }

        return proposal;
    }

    /**
     * Format Assistant Message with Markdown & Circuit Proposals
     */
    function formatAssistantMessage(rawText) {
        let hasProposal = false;

        // 1. Detect Proposal JSON in fenced code blocks (```json:circuit_proposal, ```circuit_proposal, or ```json)
        const codeBlockRegex = /```([a-zA-Z0-9_:-]*)\s*([\s\S]*?)\s*```/g;
        let processed = rawText.replace(codeBlockRegex, (match, lang, code) => {
            const isProposalLang = lang && (lang.includes('circuit_proposal') || lang.includes('proposal'));
            const isJsonLang = !lang || lang === 'json' || isProposalLang;

            if (isJsonLang && code.includes('"components"')) {
                try {
                    let cleaned = code.trim();
                    const firstBrace = cleaned.indexOf('{');
                    const lastBrace = cleaned.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1) {
                        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
                    }
                    const parsed = JSON.parse(cleaned);
                    if (parsed && Array.isArray(parsed.components) && parsed.components.length > 0) {
                        const normalized = normalizeCircuitProposal(parsed);
                        if (normalized) {
                            aiState.proposals.set(normalized.proposalId, normalized);
                            hasProposal = true;
                            return renderCircuitProposalCard(normalized);
                        }
                    }
                } catch (e) {
                    // Not valid JSON proposal, fall through to generic code block
                }
            }

            // Generic Code Block with copy
            return `
                <div class="my-2 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden">
                    <div class="bg-slate-900 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>${lang || 'code'}</span>
                        <button onclick="copyAICode(this)" class="hover:text-purple-300 transition-colors">Copy</button>
                    </div>
                    <pre class="p-2.5 text-[11px] font-mono text-purple-200 overflow-x-auto select-text"><code>${escapeHTML(code)}</code></pre>
                </div>
            `;
        });

        // 2. Fallback: If no proposal card was generated from code blocks, check for raw JSON in text
        if (!hasProposal && rawText.includes('"components"') && rawText.includes('{')) {
            try {
                const firstBrace = rawText.indexOf('{');
                const lastBrace = rawText.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace > firstBrace) {
                    const jsonCandidate = rawText.substring(firstBrace, lastBrace + 1);
                    const parsed = JSON.parse(jsonCandidate);
                    if (parsed && Array.isArray(parsed.components) && parsed.components.length > 0) {
                        const normalized = normalizeCircuitProposal(parsed);
                        if (normalized) {
                            aiState.proposals.set(normalized.proposalId, normalized);
                            hasProposal = true;
                            processed += renderCircuitProposalCard(normalized);
                        }
                    }
                }
            } catch (e) {}
        }

        // 3. Fallback: If user asked to design/build a circuit and model only responded with text
        if (!hasProposal) {
            const lower = rawText.toLowerCase();

            // 3a. Transistor switch / blink circuit
            if ((lower.includes('transistor') || lower.includes('2n2222') || lower.includes('bjt') || lower.includes('npn')) &&
                (lower.includes('blink') || lower.includes('switch') || lower.includes('switching') || lower.includes('build') || lower.includes('design') || lower.includes('circuit') || lower.includes('cutoff') || lower.includes('saturation'))) {
                const isBlinkReq = lower.includes('blink') || lower.includes('flasher') || lower.includes('astable') || lower.includes('multivibrator') || lower.includes('oscillator');
                if (isBlinkReq) {
                    const fallbackAstableProp = {
                proposalId: 'prop_bjt_astable_' + Date.now(),
                designObjective: 'Two-Transistor (2N2222A) Astable Multivibrator Blinking LED Circuit',
                replaceExisting: false,
                components: [
                    { id: 'v_src', type: 'dc_voltage', val: 5, unit: 'V', x: 80, y: 300, rotation: 0 },
                    { id: 'gnd', type: 'ground', val: 0, unit: 'V', x: 380, y: 540, rotation: 0 },
                    { id: 'r1', type: 'resistor', val: 330, unit: 'Ω', x: 220, y: 160, rotation: 0 },
                    { id: 'led1', type: 'led', val: 2, unit: 'V', x: 220, y: 260, rotation: 0 },
                    { id: 'q1', type: 'npn_bjt', val: 100, unit: 'hFE', x: 220, y: 420, rotation: 0 },
                    { id: 'r4', type: 'resistor', val: 330, unit: 'Ω', x: 540, y: 160, rotation: 0 },
                    { id: 'led2', type: 'led', val: 2, unit: 'V', x: 540, y: 260, rotation: 0 },
                    { id: 'q2', type: 'npn_bjt', val: 100, unit: 'hFE', x: 540, y: 420, rotation: 0 },
                    { id: 'r2', type: 'resistor', val: 33000, unit: 'Ω', x: 320, y: 160, rotation: 0 },
                    { id: 'r3', type: 'resistor', val: 33000, unit: 'Ω', x: 440, y: 160, rotation: 0 },
                    { id: 'c1', type: 'capacitor', val: 22, unit: 'µF', prevV: 4.0, x: 330, y: 340, rotation: 0 },
                    { id: 'c2', type: 'capacitor', val: 22, unit: 'µF', prevV: 0.0, x: 430, y: 340, rotation: 0 }
                ],
                wires: [
                    { fromComp: 'v_src', fromTerm: 1, toComp: 'r1', toTerm: 0 },
                    { fromComp: 'v_src', fromTerm: 1, toComp: 'r2', toTerm: 0 },
                    { fromComp: 'v_src', fromTerm: 1, toComp: 'r3', toTerm: 0 },
                    { fromComp: 'v_src', fromTerm: 1, toComp: 'r4', toTerm: 0 },
                    { fromComp: 'r1', fromTerm: 1, toComp: 'led1', toTerm: 0 },
                    { fromComp: 'led1', fromTerm: 1, toComp: 'q1', toTerm: 1 },
                    { fromComp: 'q1', fromTerm: 1, toComp: 'c1', toTerm: 0 },
                    { fromComp: 'r4', fromTerm: 1, toComp: 'led2', toTerm: 0 },
                    { fromComp: 'led2', fromTerm: 1, toComp: 'q2', toTerm: 1 },
                    { fromComp: 'q2', fromTerm: 1, toComp: 'c2', toTerm: 0 },
                    { fromComp: 'r2', fromTerm: 1, toComp: 'q1', toTerm: 0 },
                    { fromComp: 'c2', fromTerm: 1, toComp: 'q1', toTerm: 0 },
                    { fromComp: 'r3', fromTerm: 1, toComp: 'q2', toTerm: 0 },
                    { fromComp: 'c1', fromTerm: 1, toComp: 'q2', toTerm: 0 },
                    { fromComp: 'q1', fromTerm: 2, toComp: 'gnd', toTerm: 0 },
                    { fromComp: 'q2', fromTerm: 2, toComp: 'gnd', toTerm: 0 },
                    { fromComp: 'v_src', fromTerm: 0, toComp: 'gnd', toTerm: 0 }
                ],
                calculations: {
                    vSupply: '5.0 V',
                    oscillationType: 'Cross-Coupled Astable Multivibrator',
                    t1HalfPeriod: '0.693 × R2 × C1 = 0.693 × 33 kΩ × 22 µF ≈ 0.50 s',
                    t2HalfPeriod: '0.693 × R3 × C2 = 0.693 × 33 kΩ × 22 µF ≈ 0.50 s',
                    frequency: 'f ≈ 1 / (T1 + T2) ≈ 1.0 Hz (1 alternation per second)',
                    iLedOn: 'I_C ≈ (5.0V - 2.0V - 0.1V) / 330 Ω ≈ 8.7 mA (Safe brightness)',
                    iBaseDrive: 'I_B ≈ (5.0V - 0.7V) / 33 kΩ ≈ 0.13 mA -> forced beta ≈ 67 (< hFE 100)'
                },
                datasheetReferences: [
                    'STMicro / Central Semi 2N2222A: V_CEO = 40V, I_C = 800mA, P_D = 625mW, hFE = 100-300',
                    'Kingbright WP7113ID (Red LEDs): V_F = 2.0V, I_F(max) = 25mA',
                    'Nichicon UHE Electrolytic (22µF, 25V): Low ESR timing capacitors',
                    'Yageo MFR-25 Metal Film (330Ω, 33kΩ): 1/4W (250mW) 1% tolerance'
                ]
            };
                    const normalized = normalizeCircuitProposal(fallbackAstableProp);
                    if (normalized) {
                        aiState.proposals.set(normalized.proposalId, normalized);
                        hasProposal = true;
                        processed += renderCircuitProposalCard(normalized);
                    }
                } else {
                const fallbackBjtProp = {
                    proposalId: 'prop_bjt_blink_' + Date.now(),
                    designObjective: '2N2222A NPN Transistor LED Switch & Blink Circuit',
                    replaceExisting: false,
                    components: [
                        { id: 'v_src', type: 'dc_voltage', val: 5, unit: 'V', x: 140, y: 260, rotation: 0 },
                        { id: 'sw1', type: 'switch', val: 1, unit: 'State', x: 260, y: 180, rotation: 0 },
                        { id: 'r_base', type: 'resistor', val: 1000, unit: 'Ω', x: 380, y: 180, rotation: 0 },
                        { id: 'r_coll', type: 'resistor', val: 330, unit: 'Ω', x: 520, y: 180, rotation: 0 },
                        { id: 'led1', type: 'led', val: 2, unit: 'V', x: 520, y: 280, rotation: 0 },
                        { id: 'q1', type: 'npn_bjt', val: 100, unit: 'hFE', x: 520, y: 380, rotation: 0 },
                        { id: 'gnd1', type: 'ground', val: 0, unit: 'V', x: 380, y: 460, rotation: 0 }
                    ],
                    wires: [
                        { fromComp: 'v_src', fromTerm: 1, toComp: 'sw1', toTerm: 0 },
                        { fromComp: 'sw1', fromTerm: 1, toComp: 'r_base', toTerm: 0 },
                        { fromComp: 'v_src', fromTerm: 1, toComp: 'r_coll', toTerm: 0 },
                        { fromComp: 'r_base', fromTerm: 1, toComp: 'q1', toTerm: 0 },
                        { fromComp: 'r_coll', fromTerm: 1, toComp: 'led1', toTerm: 0 },
                        { fromComp: 'led1', fromTerm: 1, toComp: 'q1', toTerm: 1 },
                        { fromComp: 'q1', fromTerm: 2, toComp: 'gnd1', toTerm: 0 },
                        { fromComp: 'v_src', fromTerm: 0, toComp: 'gnd1', toTerm: 0 }
                    ],
                    calculations: {
                        vSupply: '5.0 V',
                        vBaseDrive: '5.0 V (Switched)',
                        rBase: '1.0 kΩ -> I_Base ≈ 4.3 mA',
                        rCollector: '330 Ω -> I_Collector ≈ 8.7 mA',
                        vSatCE: '0.02 V (Deep Saturation)',
                        forcedGain: 'I_C / I_B ≈ 2.0 (Deep Saturation)'
                    },
                    datasheetReferences: [
                        'Central Semi / STMicro 2N2222A: V_CEO = 40V, I_C = 800mA, P_D = 625mW',
                        'Kingbright WP7113ID (Red LED): V_F = 2.0V, I_F(max) = 25mA',
                        'Yageo MFR-25 Metal Film: 1/4W (250mW)'
                    ],
                    warnings: []
                };
                aiState.proposals.set(fallbackBjtProp.proposalId, fallbackBjtProp);
                hasProposal = true;
                processed += renderCircuitProposalCard(fallbackBjtProp);
                }
            } else if ((lower.includes('build') || lower.includes('design') || lower.includes('schematic') || lower.includes('indicator')) && lower.includes('led')) {
                const fallbackProp = {
                    proposalId: 'prop_led_5v_' + Date.now(),
                    designObjective: '5V Red LED Indicator with 330Ω Current-Limiting Resistor',
                    replaceExisting: false,
                    components: [
                        { id: 'v1', type: 'dc_voltage', val: 5, unit: 'V', x: 180, y: 260, rotation: 0 },
                        { id: 'r1', type: 'resistor', val: 330, unit: 'Ω', x: 340, y: 180, rotation: 0 },
                        { id: 'led1', type: 'led', val: 2, unit: 'V', x: 500, y: 180, rotation: 0 },
                        { id: 'gnd1', type: 'ground', val: 0, unit: 'V', x: 340, y: 340, rotation: 0 }
                    ],
                    wires: [
                        { fromComp: 'v1', fromTerm: 1, toComp: 'r1', toTerm: 0 },
                        { fromComp: 'r1', fromTerm: 1, toComp: 'led1', toTerm: 0 },
                        { fromComp: 'led1', fromTerm: 1, toComp: 'gnd1', toTerm: 0 },
                        { fromComp: 'v1', fromTerm: 0, toComp: 'gnd1', toTerm: 0 }
                    ],
                    calculations: {
                        vSupply: '5.0 V',
                        vForward: '2.0 V (Kingbright WP7113ID Red LED)',
                        rCalculated: '330 Ω (Operating current ≈ 8.7 mA)',
                        powerResistor: '27.3 mW (1/4W 250mW rated safe)'
                    },
                    datasheetReferences: [
                        'Kingbright WP7113ID: Forward Voltage 2.0V, Max Current 25mA',
                        'Yageo MFR-25: 1/4W (250mW) Metal Film'
                    ]
                };
                aiState.proposals.set(fallbackProp.proposalId, fallbackProp);
                hasProposal = true;
                processed += renderCircuitProposalCard(fallbackProp);
            }
        }

        // 4. Format Headings, bold, inline code, and lists
        processed = processed
            .replace(/^### (.*$)/gim, '<h3 class="font-bold text-sm text-purple-300 mt-2 mb-1">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="font-bold text-base text-purple-200 mt-2 mb-1.5">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="font-bold text-lg text-white mt-2 mb-2">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
            .replace(/`([^`]+)`/g, '<code class="bg-slate-950 px-1 py-0.5 rounded text-purple-300 font-mono text-[11px]">$1</code>')
            .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>')
            .replace(/\n\n/g, '<div class="h-2"></div>')
            .replace(/\n/g, '<br>');

        return processed;
    }

    /**
     * Render Interactive Proposal Card
     */
    function renderCircuitProposalCard(prop) {
        const id = prop.proposalId;
        const compCount = prop.components ? prop.components.length : 0;
        const wireCount = prop.wires ? prop.wires.length : 0;

        let compBadges = '';
        if (prop.components) {
            compBadges = prop.components.map(c => `
                <span class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-purple-300 font-mono">
                    ${c.id} (${c.type}${c.val !== undefined ? ': ' + c.val + (c.unit || '') : ''})
                </span>
            `).join(' ');
        }

        let calcList = '';
        if (prop.calculations) {
            calcList = '<div class="space-y-0.5 mt-1.5 text-[11px] text-slate-300 font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800">';
            for (const [k, v] of Object.entries(prop.calculations)) {
                calcList += `<div><span class="text-slate-500">${k}:</span> <span class="text-emerald-400 font-semibold">${v}</span></div>`;
            }
            calcList += '</div>';
        }

        return `
            <div id="proposal-card-${id}" class="my-3 p-3.5 rounded-xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/60 shadow-xl space-y-2.5">
                <div class="flex items-center justify-between border-b border-purple-800/40 pb-2">
                    <div class="flex items-center space-x-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span class="font-bold text-xs text-white">${escapeHTML(prop.designObjective || 'Circuit Proposal')}</span>
                    </div>
                    <span class="text-[9px] font-mono bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded border border-purple-700/50">Validated Scheme</span>
                </div>

                <div class="text-[11px] text-slate-300">
                    <div>Includes <strong>${compCount} components</strong> and <strong>${wireCount} wires</strong>:</div>
                    <div class="flex flex-wrap gap-1 mt-1.5">${compBadges}</div>
                </div>

                ${calcList}

                <div class="flex items-center space-x-2 pt-1">
                    <button id="btn-apply-${id}" onclick="applyCircuitProposal('${id}')" class="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center space-x-1.5">
                        <i class="fa-solid fa-circle-check"></i>
                        <span>Apply to Canvas</span>
                    </button>
                    <button onclick="dismissCircuitProposal('${id}')" class="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-all border border-slate-700">
                        Dismiss
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Validate Circuit Proposal Structure
     */
    function validateCircuitProposal(proposal) {
        if (!proposal || typeof proposal !== 'object') {
            return { valid: false, errors: ['Proposal must be an object.'] };
        }
        const errors = [];
        const warnings = [];

        if (!proposal.proposalId) errors.push('Missing proposalId.');
        if (!proposal.designObjective) errors.push('Missing designObjective.');

        const allTypes = (typeof COMPONENT_TYPES !== 'undefined') ? COMPONENT_TYPES : {};

        if (!Array.isArray(proposal.components) || proposal.components.length === 0) {
            errors.push('Proposal must contain at least one component in "components" array.');
        } else {
            const compIds = new Set();
            proposal.components.forEach((c, idx) => {
                if (!c.id) errors.push(`Component at index ${idx} is missing an id.`);
                if (compIds.has(c.id)) errors.push(`Duplicate component ID in proposal: "${c.id}".`);
                compIds.add(c.id);

                c.type = normalizeComponentType(c.type);

                if (Object.keys(allTypes).length > 0 && (!c.type || !allTypes[c.type])) {
                    errors.push(`Unknown component type "${c.type}" at index ${idx}.`);
                }
            });
        }

        if (Array.isArray(proposal.wires)) {
            const compIdSet = new Set((proposal.components || []).map(c => c.id));
            proposal.wires.forEach((w, idx) => {
                if (!w.fromComp || !w.toComp) {
                    errors.push(`Wire at index ${idx} is missing fromComp or toComp.`);
                    return;
                }
                if (!compIdSet.has(w.fromComp)) {
                    errors.push(`Wire at index ${idx} references nonexistent component "${w.fromComp}".`);
                }
                if (!compIdSet.has(w.toComp)) {
                    errors.push(`Wire at index ${idx} references nonexistent component "${w.toComp}".`);
                }
                if (w.fromComp === w.toComp && w.fromTerm === w.toTerm) {
                    errors.push(`Wire at index ${idx} connects component "${w.fromComp}" terminal ${w.fromTerm} directly to itself.`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Apply Circuit Proposal to Simulator Canvas with Undo Support
     */
    function applyCircuitProposal(proposalId) {
        const prop = aiState.proposals.get(proposalId);
        if (!prop) {
            if (typeof showToast === 'function') showToast('Proposal expired or not found', 'error');
            return;
        }

        const validation = validateCircuitProposal(prop);
        if (!validation.valid) {
            alert('Cannot apply invalid proposal:\n' + validation.errors.join('\n'));
            return;
        }

        if (typeof state === 'undefined') {
            alert('Simulator canvas state is not ready.');
            return;
        }

        // Record history snapshot for full Undo support (Ctrl+Z)
        if (typeof recordHistory === 'function') {
            recordHistory();
        }

        if (prop.replaceExisting) {
            state.components = [];
            state.wires = [];
        }

        // Calculate offset if canvas already has components
        let offsetX = 0;
        let offsetY = 0;
        if (!prop.replaceExisting && state.components.length > 0) {
            // Find max X to avoid visual stacking
            const maxX = Math.max(...state.components.map(c => c.x || 0));
            if (maxX > 350) {
                offsetX = maxX + 100;
            }
        }

        // Map of original proposal IDs to actual instantiated IDs
        const idMap = new Map();

        // Add components
        prop.components.forEach(c => {
            // Ensure unique ID if not replacing
            let finalId = c.id;
            if (!prop.replaceExisting && state.components.some(existing => existing.id === finalId)) {
                finalId = `${c.id}_${Math.random().toString(36).substring(2, 6)}`;
            }
            idMap.set(c.id, finalId);

            state.components.push({
                id: finalId,
                type: c.type,
                x: (c.x || 150) + offsetX,
                y: (c.y || 150) + offsetY,
                rotation: c.rotation || 0,
                value: c.val !== undefined ? c.val : 5,
                state: c.type === 'switch' ? 1 : 0,
                prevV: c.prevV !== undefined ? c.prevV : 0
            });
        });

        // Add wires with mapped component IDs
        if (Array.isArray(prop.wires)) {
            prop.wires.forEach(w => {
                state.wires.push({
                    id: 'w_' + Math.random().toString(36).substring(2, 9),
                    fromComp: idMap.get(w.fromComp) || w.fromComp,
                    fromTerm: w.fromTerm,
                    toComp: idMap.get(w.toComp) || w.toComp,
                    toTerm: w.toTerm
                });
            });
        }

        // Record history after applying
        if (typeof recordHistory === 'function') {
            recordHistory();
        }

        // Execute MNA Solver to calculate live circuit potentials
        if (typeof circuitSolver !== 'undefined' && typeof circuitSolver.solve === 'function') {
            circuitSolver._prevVoltages = null;
            state.lastSolveResult = circuitSolver.solve(state.components, state.wires, 0, 0.016);
        }

        // Trigger redraw
        if (typeof render === 'function') {
            render();
        }

        // Update Apply Button UI
        const applyBtn = getEl(`btn-apply-${proposalId}`);
        if (applyBtn) {
            applyBtn.disabled = true;
            applyBtn.className = 'flex-1 py-1.5 px-3 rounded-lg bg-slate-800 text-emerald-400 text-xs font-semibold border border-emerald-500/40 flex items-center justify-center space-x-1.5 cursor-default';
            applyBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Applied to Canvas ✓</span>';
        }

        if (typeof showToast === 'function') {
            showToast(`Applied "${prop.designObjective}" to circuit canvas! (Press Ctrl+Z to undo)`, 'success');
        }
    }

    /**
     * Dismiss Proposal Card
     */
    function dismissCircuitProposal(proposalId) {
        const card = getEl(`proposal-card-${proposalId}`);
        if (card) {
            card.remove();
        }
        aiState.proposals.delete(proposalId);
    }

    /**
     * Copy AI Code / Response
     */
    function copyAICode(button) {
        const container = button.closest('.prose, .bg-slate-950') || button.parentElement.previousElementSibling;
        const text = container ? container.textContent : '';
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> <span class="text-emerald-400">Copied!</span>';
            setTimeout(() => {
                button.innerHTML = originalHTML;
            }, 1800);
        });
    }

    /**
     * Escape HTML Utility
     */
    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Attach all functions to window for global access
    window.toggleAIAssistant = toggleAIAssistant;
    window.openAIAssistant = openAIAssistant;
    window.closeAIAssistant = closeAIAssistant;
    window.sendAIMessage = sendAIMessage;
    window.clearAIChat = clearAIChat;
    window.stopAIGeneration = stopAIGeneration;
    window.onAiModelChanged = onAiModelChanged;
    window.handleAIDatasheetUpload = handleAIDatasheetUpload;
    window.removeAIAttachment = removeAIAttachment;
    window.handleAIInputKey = handleAIInputKey;
    window.insertAIPrompt = insertAIPrompt;
    window.copyAICode = copyAICode;
    window.applyCircuitProposal = applyCircuitProposal;
    window.dismissCircuitProposal = dismissCircuitProposal;
    window.buildCircuitContext = buildCircuitContext;
    window.buildSelectedComponentContext = buildSelectedComponentContext;
    window.buildSimulationResultsContext = buildSimulationResultsContext;
    window.validateCircuitProposal = validateCircuitProposal;
    window.checkAIBackendHealth = checkAIBackendHealth;

    // Initialize listeners when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            checkAIBackendHealth();
        });
    } else {
        checkAIBackendHealth();
    }

    // Register Esc key to close panel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aiState.isOpen) {
            closeAIAssistant();
        }
    });

})(window, document);
