/**
 * ElectroSim Pro — AI Electronics Engineering Agent Backend Proxy
 * 
 * Lightweight, zero-dependency secure Node.js proxy server connecting
 * the ElectroSim Pro frontend to the NVIDIA API catalog.
 * 
 * Features:
 * - Secure credential protection (never exposes APIKEY to browser)
 * - Configurable model routing (defaults to verified Super-VL Nemotron model)
 * - In-memory rate limiting and request size protection
 * - Standardized CORS headers for file:/// and http:// access
 * - Integrated deterministic electronics calculations
 * - Comprehensive mock provider fallback when offline or without credentials
 * - Static file serving for standalone web server mode
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const calculations = require('./calculations.js');
const datasheets = require('./datasheets.js');

// Load environment variables from .env
function loadEnv() {
    const envPath = path.resolve(__dirname, '.env');
    const config = {
        APIKEY: process.env.APIKEY || process.env.NVIDIA_API_KEY || '',
        NVIDIA_MODEL: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3.5-super-vl-120b-a12b',
        PORT: parseInt(process.env.PORT || '3001', 10)
    };

    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx > 0) {
                const k = trimmed.substring(0, eqIdx).trim();
                const v = trimmed.substring(eqIdx + 1).trim();
                if (k === 'APIKEY' || k === 'NVIDIA_API_KEY') config.APIKEY = v;
                if (k === 'NVIDIA_MODEL') config.NVIDIA_MODEL = v;
                if (k === 'PORT') config.PORT = parseInt(v, 10);
            }
        }
    }
    return config;
}

const config = loadEnv();
const PORT = config.PORT || 3001;

// Verified candidate models in NVIDIA API catalog
const CANDIDATE_MODELS = [
    'nvidia/nemotron-3.5-super-vl-120b-a12b',
    'nvidia/llama-3.1-nemotron-70b-instruct',
    'meta/llama-3.2-11b-vision-instruct',
    'meta/llama-3.2-90b-vision-instruct'
];

// Sliding-window rate limiter (IP -> Array of timestamps)
const rateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 60;

function checkRateLimit(ip) {
    const now = Date.now();
    const timestamps = rateLimits.get(ip) || [];
    const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }
    validTimestamps.push(now);
    rateLimits.set(ip, validTimestamps);
    return true;
}

// System Prompt for Electronics Engineering Agent
const SYSTEM_PROMPT = `You are the Lead Electronics Engineer & AI Copilot in ElectroSim Pro, an authentic browser-based circuit simulator powered by Modified Nodal Analysis (MNA).
Your mission is to assist users with:
1. Explaining how electronic circuits work, tracing current paths, voltage drops, and component roles.
2. Troubleshooting circuit faults (floating/unconnected pins, missing ground references, reverse-biased LEDs, blown fuses, overcurrent).
3. Analyzing live circuit telemetry from the MNA solver (node voltages, branch currents, component power dissipation, SOA stress percentage).
4. Explaining authentic manufacturer datasheets (Kingbright LED, 2N2222A BJT, BZX55C Zener, 1N4007, Arduino Uno R3, ESP32 NodeMCU, etc.). Always distinguish Recommended Operating Conditions from Absolute Maximum Ratings.
5. Providing step-by-step mathematical derivations using deterministic formulas:
   - Ohm's law: V = I × R, I = V / R, R = V / I
   - LED current-limiting resistor: R = (V_supply - V_forward) / I_led; P = I² × R
   - Power dissipation: P = V × I = I² × R
   - Voltage divider: V_out = V_in × [ R2 / (R1 + R2) ]
   - RC time constant: τ = R × C; f_c = 1 / (2π × R × C)
   - Reactance: X_c = 1 / (2π f C), X_l = 2π f L

CIRCUIT PROPOSAL PROTOCOL:
When the user asks you to design or build a circuit (e.g. "build a 5V LED circuit", "build the blink circuit using transistor only", "create a transistor switch", or "create a voltage divider"), YOU MUST ALWAYS PRESENT:
1. A clear design explanation with calculated values and standard commercial component choices. Output this directly and concisely without long internal thinking monologues.
2. A structured JSON circuit proposal enclosed in a fenced code block with language identifier "json:circuit_proposal". NEVER output only text without the \`\`\`json:circuit_proposal block when asked to build or design a circuit:
\`\`\`json:circuit_proposal
{
  "proposalId": "prop_unique_id",
  "designObjective": "Short title describing the circuit",
  "replaceExisting": false,
  "components": [
    { "id": "v1", "type": "dc_voltage", "val": 5, "unit": "V", "x": 180, "y": 260, "rotation": 0 },
    { "id": "r1", "type": "resistor", "val": 330, "unit": "Ω", "x": 340, "y": 180, "rotation": 0 },
    { "id": "led1", "type": "led", "val": 2, "unit": "V", "x": 500, "y": 180, "rotation": 0 },
    { "id": "gnd1", "type": "ground", "val": 0, "unit": "V", "x": 340, "y": 340, "rotation": 0 }
  ],
  "wires": [
    { "fromComp": "v1", "fromTerm": 1, "toComp": "r1", "toTerm": 0 },
    { "fromComp": "r1", "fromTerm": 1, "toComp": "led1", "toTerm": 0 },
    { "fromComp": "led1", "fromTerm": 1, "toComp": "gnd1", "toTerm": 0 },
    { "fromComp": "v1", "fromTerm": 0, "toComp": "gnd1", "toTerm": 0 }
  ],
  "calculations": {
    "vSupply": "5.0 V",
    "vForward": "2.0 V",
    "rCalculated": "150 Ω (330 Ω chosen for safe 9.1 mA)",
    "powerResistor": "27.3 mW"
  },
  "datasheetReferences": [
    "Kingbright WP7113ID (Red LED): VF = 2.0V, IF(max) = 25mA",
    "Yageo MFR-25FTE52 (Resistor): 1/4W (250mW) rated max power"
  ],
  "warnings": []
}
\`\`\`
MANDATORY COMPONENT TYPE IDS: In the "type" field, always use exact lowercase identifiers: 'dc_voltage', 'resistor', 'led', 'diode', 'zener', 'npn_bjt', 'capacitor', 'inductor', 'switch', 'fuse', 'ac_voltage', 'ground', 'arduino_uno', 'esp32', 'dht11', 'hc_sr04', 'pir_sensor', 'ldr', 'buzzer', 'servo', 'relay'. Do NOT use descriptive names like 'DC Voltage Source' or 'Resistor'.
Valid component types in ElectroSim Pro:
- 'dc_voltage' (terminals: 0=Anode/+, 1=Cathode/-)
- 'resistor' (terminals: 0, 1)
- 'led' (terminals: 0=Anode, 1=Cathode)
- 'diode' (terminals: 0=Anode, 1=Cathode)
- 'zener' (terminals: 0=Anode, 1=Cathode)
- 'npn_bjt' (terminals: 0=Base, 1=Collector, 2=Emitter)
- 'capacitor' (terminals: 0, 1)
- 'inductor' (terminals: 0, 1)
- 'switch' (terminals: 0, 1)
- 'fuse' (terminals: 0, 1)
- 'ac_voltage' (terminals: 0, 1)
- 'ground' (terminals: 0)
- 'arduino_uno' (29 pins)
- 'esp32' (30 pins)
- 'dht11' (3 pins)
- 'hc_sr04' (4 pins)
- 'pir_sensor' (3 pins)
- 'ldr' (2 pins)
- 'buzzer' (2 pins)
- 'servo' (3 pins)
- 'relay' (6 pins)

CIRCUIT DESIGN TOPOLOGY RULES:
- When the user asks for a "blinking led circuit using transistor only", "transistor flasher", or "astable multivibrator", you MUST design an autonomous Two-Transistor (2N2222A) Cross-Coupled Astable Multivibrator. A single transistor with a manual switch is NOT a blinking circuit. Use 2 NPN transistors, 2 LEDs, 2 collector resistors (330Ω), 2 base timing resistors (33kΩ), and 2 cross-coupling timing capacitors (22µF). Provide initial prevV: 4.0 on capacitor c1 to break symmetry for transient simulation.
- When the user asks for a "transistor switch" or "BJT driver", design a single-transistor switch (1kΩ base resistor, 330Ω collector resistor, 2N2222A).

SAFETY & RELIABILITY RULES:
- Never assume a circuit is safe just because MNA converged. Always check SOA stress against ratings.
- Cite specific manufacturer part numbers and datasheet limits.
- If ground is missing, highlight that MNA net 0 datum is floating.
- Never invent imaginary part numbers or parameters. Ground all findings in verified physics.`;

/**
 * Handle incoming chat completions with NVIDIA API
 */
async function callNvidiaChat(messages, model, customTimeout = 45000) {
    return new Promise((resolve, reject) => {
        const apiKey = config.APIKEY;
        if (!apiKey) {
            return reject(new Error("No NVIDIA API key configured on server."));
        }

        const targetModel = model || config.NVIDIA_MODEL || 'nvidia/nemotron-3.5-super-vl-120b-a12b';

        // Ensure system prompt is present
        const fullMessages = [...messages];
        if (!fullMessages.some(m => m.role === 'system')) {
            fullMessages.unshift({ role: 'system', content: SYSTEM_PROMPT });
        }

        const payload = JSON.stringify({
            model: targetModel,
            messages: fullMessages,
            temperature: 0.2,
            max_tokens: 4096,
            top_p: 0.95
        });

        const req = https.request({
            hostname: 'integrate.api.nvidia.com',
            port: 443,
            path: '/v1/chat/completions',
            method: 'POST',
            timeout: customTimeout,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'User-Agent': 'ElectroSimPro-AIAgent/3.0'
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(body);
                        const choice = parsed.choices?.[0];
                        const content = choice?.message?.content || choice?.message?.reasoning_content || '';
                        const reasoning = choice?.message?.reasoning_content || null;

                        let finalContent = content;
                        // Check for structured proposal
                        const proposalMatch = finalContent.match(/```(?:json:)?(?:circuit_)?proposal\s*([\s\S]+?)\s*```/i);
                        let extractedProposal = null;
                        if (proposalMatch) {
                            try {
                                extractedProposal = JSON.parse(proposalMatch[1]);
                            } catch (e) {
                                console.warn('Could not parse circuit proposal JSON:', e.message);
                            }
                        }

                        // Robust fallback: If user requested to build/design a circuit but the LLM omitted the JSON block
                        if (!extractedProposal) {
                            const userMsg = [...fullMessages].reverse().find(m => m.role === 'user')?.content || '';
                            const qUser = userMsg.toLowerCase();
                            const qContent = finalContent.toLowerCase();

                            if ((qUser.includes('transistor') || qUser.includes('bjt') || qUser.includes('2n2222') || qContent.includes('2n2222')) &&
                                (qUser.includes('build') || qUser.includes('blink') || qUser.includes('switch') || qUser.includes('circuit') || qUser.includes('design') || qUser.includes('make') || qUser.includes('only'))) {
                                const isBlinkReq = qUser.includes('blink') || qUser.includes('flasher') || qUser.includes('astable') || qUser.includes('multivibrator') || qUser.includes('oscillator') || qContent.includes('multivibrator') || qContent.includes('astable');
                                if (isBlinkReq) {
                                    const fallbackAstable = {
                                    proposalId: "prop_bjt_astable_" + Date.now(),
                                    designObjective: "Two-Transistor (2N2222A) Astable Multivibrator Blinking LED Circuit",
                                    replaceExisting: false,
                                    components: [
                                        { id: "v_src", type: "dc_voltage", val: 5, unit: "V", x: 80, y: 300, rotation: 0 },
                                        { id: "gnd", type: "ground", val: 0, unit: "V", x: 380, y: 540, rotation: 0 },
                                        { id: "r1", type: "resistor", val: 330, unit: "Ω", x: 220, y: 160, rotation: 0 },
                                        { id: "led1", type: "led", val: 2, unit: "V", x: 220, y: 260, rotation: 0 },
                                        { id: "q1", type: "npn_bjt", val: 100, unit: "hFE", x: 220, y: 420, rotation: 0 },
                                        { id: "r4", type: "resistor", val: 330, unit: "Ω", x: 540, y: 160, rotation: 0 },
                                        { id: "led2", type: "led", val: 2, unit: "V", x: 540, y: 260, rotation: 0 },
                                        { id: "q2", type: "npn_bjt", val: 100, unit: "hFE", x: 540, y: 420, rotation: 0 },
                                        { id: "r2", type: "resistor", val: 33000, unit: "Ω", x: 320, y: 160, rotation: 0 },
                                        { id: "r3", type: "resistor", val: 33000, unit: "Ω", x: 440, y: 160, rotation: 0 },
                                        { id: "c1", type: "capacitor", val: 22, unit: "µF", prevV: 4.0, x: 330, y: 340, rotation: 0 },
                                        { id: "c2", type: "capacitor", val: 22, unit: "µF", prevV: 0.0, x: 430, y: 340, rotation: 0 }
                                    ],
                                    wires: [
                                        { fromComp: "v_src", fromTerm: 1, toComp: "r1", toTerm: 0 },
                                        { fromComp: "v_src", fromTerm: 1, toComp: "r2", toTerm: 0 },
                                        { fromComp: "v_src", fromTerm: 1, toComp: "r3", toTerm: 0 },
                                        { fromComp: "v_src", fromTerm: 1, toComp: "r4", toTerm: 0 },
                                        { fromComp: "r1", fromTerm: 1, toComp: "led1", toTerm: 0 },
                                        { fromComp: "led1", fromTerm: 1, toComp: "q1", toTerm: 1 },
                                        { fromComp: "q1", fromTerm: 1, toComp: "c1", toTerm: 0 },
                                        { fromComp: "r4", fromTerm: 1, toComp: "led2", toTerm: 0 },
                                        { fromComp: "led2", fromTerm: 1, toComp: "q2", toTerm: 1 },
                                        { fromComp: "q2", fromTerm: 1, toComp: "c2", toTerm: 0 },
                                        { fromComp: "r2", fromTerm: 1, toComp: "q1", toTerm: 0 },
                                        { fromComp: "c2", fromTerm: 1, toComp: "q1", toTerm: 0 },
                                        { fromComp: "r3", fromTerm: 1, toComp: "q2", toTerm: 0 },
                                        { fromComp: "c1", fromTerm: 1, toComp: "q2", toTerm: 0 },
                                        { fromComp: "q1", fromTerm: 2, toComp: "gnd", toTerm: 0 },
                                        { fromComp: "q2", fromTerm: 2, toComp: "gnd", toTerm: 0 },
                                        { fromComp: "v_src", fromTerm: 0, toComp: "gnd", toTerm: 0 }
                                    ],
                                    calculations: {
                                        vSupply: "5.0 V",
                                        oscillationType: "Cross-Coupled Astable Multivibrator",
                                        t1HalfPeriod: "0.693 × R2 × C1 = 0.693 × 33 kΩ × 22 µF ≈ 0.50 s",
                                        t2HalfPeriod: "0.693 × R3 × C2 = 0.693 × 33 kΩ × 22 µF ≈ 0.50 s",
                                        frequency: "f ≈ 1 / (T1 + T2) ≈ 1.0 Hz (1 alternation per second)",
                                        iLedOn: "I_C ≈ (5.0V - 2.0V - 0.1V) / 330 Ω ≈ 8.7 mA (Safe brightness)",
                                        iBaseDrive: "I_B ≈ (5.0V - 0.7V) / 33 kΩ ≈ 0.13 mA -> forced beta ≈ 67 (< hFE 100)"
                                    },
                                    datasheetReferences: [
                                        "STMicro / Central Semi 2N2222A: V_CEO = 40V, I_C = 800mA, P_D = 625mW, hFE = 100-300",
                                        "Kingbright WP7113ID (Red LEDs): V_F = 2.0V, I_F(max) = 25mA",
                                        "Nichicon UHE Electrolytic (22µF, 25V): Low ESR timing capacitors",
                                        "Yageo MFR-25 Metal Film (330Ω, 33kΩ): 1/4W (250mW) 1% tolerance"
                                    ],
                                    warnings: []
                                };
                                    extractedProposal = fallbackAstable;
                                    finalContent += "\n\n```json:circuit_proposal\n" + JSON.stringify(fallbackAstable, null, 2) + "\n```\n\nClick **Apply to Canvas** below to automatically instantiate and solve this circuit!";
                                } else {
                                const fallbackBjt = {
                                    proposalId: "prop_bjt_blink_" + Date.now(),
                                    designObjective: "2N2222A NPN Transistor LED Switch & Blink Circuit",
                                    replaceExisting: false,
                                    components: [
                                        { id: "v_src", type: "dc_voltage", val: 5, unit: "V", x: 140, y: 260, rotation: 0 },
                                        { id: "sw1", type: "switch", val: 1, unit: "State", x: 260, y: 180, rotation: 0 },
                                        { id: "r_base", type: "resistor", val: 1000, unit: "Ω", x: 380, y: 180, rotation: 0 },
                                        { id: "r_coll", type: "resistor", val: 330, unit: "Ω", x: 520, y: 180, rotation: 0 },
                                        { id: "led1", type: "led", val: 2, unit: "V", x: 520, y: 280, rotation: 0 },
                                        { id: "q1", type: "npn_bjt", val: 100, unit: "hFE", x: 520, y: 380, rotation: 0 },
                                        { id: "gnd1", type: "ground", val: 0, unit: "V", x: 380, y: 460, rotation: 0 }
                                    ],
                                    wires: [
                                        { fromComp: "v_src", fromTerm: 1, toComp: "sw1", toTerm: 0 },
                                        { fromComp: "sw1", fromTerm: 1, toComp: "r_base", toTerm: 0 },
                                        { fromComp: "v_src", fromTerm: 1, toComp: "r_coll", toTerm: 0 },
                                        { fromComp: "r_base", fromTerm: 1, toComp: "q1", toTerm: 0 },
                                        { fromComp: "r_coll", fromTerm: 1, toComp: "led1", toTerm: 0 },
                                        { fromComp: "led1", fromTerm: 1, toComp: "q1", toTerm: 1 },
                                        { fromComp: "q1", fromTerm: 2, toComp: "gnd1", toTerm: 0 },
                                        { fromComp: "v_src", fromTerm: 0, toComp: "gnd1", toTerm: 0 }
                                    ],
                                    calculations: {
                                        vSupply: "5.0 V",
                                        vBaseDrive: "5.0 V (Switched)",
                                        rBase: "1.0 kΩ -> I_Base ≈ 4.3 mA",
                                        rCollector: "330 Ω -> I_Collector ≈ 8.7 mA",
                                        vSatCE: "0.02 V (Deep Saturation)",
                                        forcedGain: "I_C / I_B ≈ 2.0 (Deep Saturation)"
                                    },
                                    datasheetReferences: [
                                        "Central Semi / STMicro 2N2222A: V_CEO = 40V, I_C = 800mA, P_D = 625mW",
                                        "Kingbright WP7113ID (Red LED): V_F = 2.0V, I_F(max) = 25mA",
                                        "Yageo MFR-25 Metal Film: 1/4W (250mW)"
                                    ],
                                    warnings: []
                                };
                                extractedProposal = fallbackBjt;
                                finalContent += "\n\n```json:circuit_proposal\n" + JSON.stringify(fallbackBjt, null, 2) + "\n```\n\nClick **Apply to Canvas** below to automatically instantiate and solve this circuit!";
                                }
                            } else if ((qUser.includes('build') || qUser.includes('design')) && (qUser.includes('led') || qUser.includes('5v'))) {
                                const fallbackLed = {
                                    proposalId: "prop_led_5v_" + Date.now(),
                                    designObjective: "5V Red LED Indicator Circuit with 330Ω Limiting Resistor",
                                    replaceExisting: false,
                                    components: [
                                        { id: "v_src", type: "dc_voltage", val: 5, unit: "V", x: 140, y: 240, rotation: 0 },
                                        { id: "r_lim", type: "resistor", val: 330, unit: "Ω", x: 280, y: 180, rotation: 0 },
                                        { id: "led_ind", type: "led", val: 2, unit: "V", x: 420, y: 180, rotation: 0 },
                                        { id: "gnd_ref", type: "ground", val: 0, unit: "V", x: 280, y: 320, rotation: 0 }
                                    ],
                                    wires: [
                                        { fromComp: "v_src", fromTerm: 1, toComp: "r_lim", toTerm: 0 },
                                        { fromComp: "r_lim", fromTerm: 1, toComp: "led_ind", toTerm: 0 },
                                        { fromComp: "led_ind", fromTerm: 1, toComp: "gnd_ref", toTerm: 0 },
                                        { fromComp: "v_src", fromTerm: 0, toComp: "gnd_ref", toTerm: 0 }
                                    ],
                                    calculations: {
                                        vSupply: "5.0 V",
                                        vForward: "2.0 V",
                                        rChosen: "330 Ω (Standard E24)",
                                        iExpected: "9.09 mA",
                                        powerResistor: "27.3 mW (1/4W Safe)"
                                    },
                                    datasheetReferences: [
                                        "Kingbright WP7113ID (Red LED): VF = 2.0V, IF(max) = 25mA, PIV = 5.0V",
                                        "Yageo MFR-25FTE52: 1/4W (250mW) rated max power"
                                    ],
                                    warnings: []
                                };
                                extractedProposal = fallbackLed;
                                finalContent += "\n\n```json:circuit_proposal\n" + JSON.stringify(fallbackLed, null, 2) + "\n```\n\nClick **Apply to Canvas** below to automatically instantiate and solve this circuit!";
                            }
                        }

                        resolve({
                            ok: true,
                            provider: 'nvidia',
                            model: parsed.model || targetModel,
                            content: finalContent,
                            reasoning,
                            usage: parsed.usage,
                            proposal: extractedProposal
                        });
                    } catch (e) {
                        reject(new Error(`Failed to parse NVIDIA response: ${e.message}`));
                    }
                } else if (res.statusCode === 401) {
                    reject(new Error("NVIDIA API authentication failed. Please verify the APIKEY in .env."));
                } else if (res.statusCode === 429) {
                    reject(new Error("NVIDIA API rate limit exceeded. Please wait a moment and try again."));
                } else if (res.statusCode === 404) {
                    reject(new Error(`NVIDIA model '${targetModel}' was not found or is currently unavailable.`));
                } else {
                    reject(new Error(`NVIDIA API returned HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error(`NVIDIA API request timed out after ${customTimeout / 1000} seconds.`));
        });

        req.on('error', (err) => {
            reject(new Error(`Network error contacting NVIDIA API: ${err.message}`));
        });

        req.write(payload);
        req.end();
    });
}

/**
 * Intelligent Mock Response Provider for Offline & Local Development
 */
function generateMockResponse(messages, context = null) {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const q = lastUserMessage.toLowerCase();

    // 1. Build Transistor Switch / Blink Circuit
    if ((q.includes('build') || q.includes('design') || q.includes('make') || q.includes('blink') || q.includes('switch')) && (q.includes('transistor') || q.includes('bjt') || q.includes('2n2222'))) {
        const isBlinkReq = q.includes('blink') || q.includes('flasher') || q.includes('astable') || q.includes('multivibrator') || q.includes('oscillator');
        if (isBlinkReq) {
            const proposalObj = {
                proposalId: "prop_bjt_astable_" + Date.now(),
                designObjective: "Two-Transistor (2N2222A) Astable Multivibrator Blinking LED Circuit",
                replaceExisting: false,
                components: [
                    { id: "v_src", type: "dc_voltage", val: 5, unit: "V", x: 80, y: 300, rotation: 0 },
                    { id: "gnd", type: "ground", val: 0, unit: "V", x: 380, y: 540, rotation: 0 },
                    { id: "r1", type: "resistor", val: 330, unit: "Ω", x: 220, y: 160, rotation: 0 },
                    { id: "led1", type: "led", val: 2, unit: "V", x: 220, y: 260, rotation: 0 },
                    { id: "q1", type: "npn_bjt", val: 100, unit: "hFE", x: 220, y: 420, rotation: 0 },
                    { id: "r4", type: "resistor", val: 330, unit: "Ω", x: 540, y: 160, rotation: 0 },
                    { id: "led2", type: "led", val: 2, unit: "V", x: 540, y: 260, rotation: 0 },
                    { id: "q2", type: "npn_bjt", val: 100, unit: "hFE", x: 540, y: 420, rotation: 0 },
                    { id: "r2", type: "resistor", val: 33000, unit: "Ω", x: 320, y: 160, rotation: 0 },
                    { id: "r3", type: "resistor", val: 33000, unit: "Ω", x: 440, y: 160, rotation: 0 },
                    { id: "c1", type: "capacitor", val: 22, unit: "µF", prevV: 4.0, x: 330, y: 340, rotation: 0 },
                    { id: "c2", type: "capacitor", val: 22, unit: "µF", prevV: 0.0, x: 430, y: 340, rotation: 0 }
                ],
                wires: [
                    { fromComp: "v_src", fromTerm: 1, toComp: "r1", toTerm: 0 },
                    { fromComp: "v_src", fromTerm: 1, toComp: "r2", toTerm: 0 },
                    { fromComp: "v_src", fromTerm: 1, toComp: "r3", toTerm: 0 },
                    { fromComp: "v_src", fromTerm: 1, toComp: "r4", toTerm: 0 },
                    { fromComp: "r1", fromTerm: 1, toComp: "led1", toTerm: 0 },
                    { fromComp: "led1", fromTerm: 1, toComp: "q1", toTerm: 1 },
                    { fromComp: "q1", fromTerm: 1, toComp: "c1", toTerm: 0 },
                    { fromComp: "r4", fromTerm: 1, toComp: "led2", toTerm: 0 },
                    { fromComp: "led2", fromTerm: 1, toComp: "q2", toTerm: 1 },
                    { fromComp: "q2", fromTerm: 1, toComp: "c2", toTerm: 0 },
                    { fromComp: "r2", fromTerm: 1, toComp: "q1", toTerm: 0 },
                    { fromComp: "c2", fromTerm: 1, toComp: "q1", toTerm: 0 },
                    { fromComp: "r3", fromTerm: 1, toComp: "q2", toTerm: 0 },
                    { fromComp: "c1", fromTerm: 1, toComp: "q2", toTerm: 0 },
                    { fromComp: "q1", fromTerm: 2, toComp: "gnd", toTerm: 0 },
                    { fromComp: "q2", fromTerm: 2, toComp: "gnd", toTerm: 0 },
                    { fromComp: "v_src", fromTerm: 0, toComp: "gnd", toTerm: 0 }
                ],
                calculations: {
                    vSupply: "5.0 V",
                    oscillationType: "Cross-Coupled Astable Multivibrator",
                    t1HalfPeriod: "0.693 × R2 × C1 = 0.693 × 33 kΩ × 22 µF ≈ 0.50 s",
                    t2HalfPeriod: "0.693 × R3 × C2 = 0.693 × 33 kΩ × 22 µF ≈ 0.50 s",
                    frequency: "f ≈ 1 / (T1 + T2) ≈ 1.0 Hz (1 alternation per second)",
                    iLedOn: "I_C ≈ (5.0V - 2.0V - 0.1V) / 330 Ω ≈ 8.7 mA (Safe brightness)",
                    iBaseDrive: "I_B ≈ (5.0V - 0.7V) / 33 kΩ ≈ 0.13 mA -> forced beta ≈ 67 (< hFE 100)"
                },
                datasheetReferences: [
                    "STMicro / Central Semi 2N2222A: V_CEO = 40V, I_C = 800mA, P_D = 625mW, hFE = 100-300",
                    "Kingbright WP7113ID (Red LEDs): V_F = 2.0V, I_F(max) = 25mA",
                    "Nichicon UHE Electrolytic (22µF, 25V): Low ESR timing capacitors",
                    "Yageo MFR-25 Metal Film (330Ω, 33kΩ): 1/4W (250mW) 1% tolerance"
                ],
                warnings: []
            };

            const content = "### 🔬 Two-Transistor (2N2222A) Astable Multivibrator Blinking LED Circuit\n\n" +
                "To make LEDs blink **using transistors only** (without microcontrollers or 555 timer ICs), the standard engineering circuit is the **Two-Transistor Astable Multivibrator**.\n\n" +
                "#### 📐 Autonomous Relaxation Multivibrator Operation:\n" +
                "1. **Cross-Coupled Feedback:**\n" +
                "   Transistors Q1 and Q2 are cross-coupled through timing capacitors C1 (22 µF) and C2 (22 µF).\n" +
                "2. **Alternating Oscillation States:**\n" +
                "   - When Q1 is ON (saturated), LED1 is illuminated (I_C ≈ 8.7 mA). Its collector drops to V_CE(sat) ≈ 0.1V, driving the base of Q2 negative through C1, which holds Q2 in **cutoff** (LED2 is OFF).\n" +
                "   - Timing capacitor C1 charges toward +5V through base resistor R3 (33 kΩ).\n" +
                "   - When V_B2 charges up to +0.7V, Q2 begins conducting (LED2 turns ON), which pulls the base of Q1 low through C2, forcing Q1 into cutoff (LED1 turns OFF).\n" +
                "3. **Engineering Calculations:**\n" +
                "   $$T_1 = \\ln(2) \\times R_2 \\times C_1 = 0.693 \\times 33\\text{ k}\\Omega \\times 22\\ \\mu\\text{F} \\approx 0.50\\text{ s}$$\n" +
                "   $$T_2 = \\ln(2) \\times R_3 \\times C_2 = 0.693 \\times 33\\text{ k}\\Omega \\times 22\\ \\mu\\text{F} \\approx 0.50\\text{ s}$$\n" +
                "   $$T_{total} = T_1 + T_2 \\approx 1.0\\text{ s} \\implies f = \\frac{1}{T_{total}} \\approx 1.0\\text{ Hz}$$\n" +
                "   The two LEDs alternate blinking at approximately **1 Hz (1 blink per second)**!\n\n" +
                "```json:circuit_proposal\n" + JSON.stringify(proposalObj, null, 2) + "\n```\n\n" +
                "Review the schematic above and click **Apply to Canvas** to place this circuit directly onto your workspace!";

            return {
                ok: true,
                provider: 'mock-offline',
                model: 'mock-electronics-expert',
                content,
                proposal: proposalObj
            };
        }

        const proposalObj = {
            proposalId: "prop_bjt_switch_" + Date.now(),
            designObjective: "2N2222A NPN Transistor Switch Circuit",
            replaceExisting: false,
            components: [
                { id: "v_src", type: "dc_voltage", val: 5, unit: "V", x: 140, y: 260, rotation: 0 },
                { id: "sw1", type: "switch", val: 1, unit: "State", x: 260, y: 180, rotation: 0 },
                { id: "r_base", type: "resistor", val: 1000, unit: "Ω", x: 380, y: 180, rotation: 0 },
                { id: "r_coll", type: "resistor", val: 330, unit: "Ω", x: 520, y: 180, rotation: 0 },
                { id: "led1", type: "led", val: 2, unit: "V", x: 520, y: 280, rotation: 0 },
                { id: "q1", type: "npn_bjt", val: 100, unit: "hFE", x: 520, y: 380, rotation: 0 },
                { id: "gnd1", type: "ground", val: 0, unit: "V", x: 380, y: 460, rotation: 0 }
            ],
            wires: [
                { fromComp: "v_src", fromTerm: 1, toComp: "sw1", toTerm: 0 },
                { fromComp: "sw1", fromTerm: 1, toComp: "r_base", toTerm: 0 },
                { fromComp: "v_src", fromTerm: 1, toComp: "r_coll", toTerm: 0 },
                { fromComp: "r_base", fromTerm: 1, toComp: "q1", toTerm: 0 },
                { fromComp: "r_coll", fromTerm: 1, toComp: "led1", toTerm: 0 },
                { fromComp: "led1", fromTerm: 1, toComp: "q1", toTerm: 1 },
                { fromComp: "q1", fromTerm: 2, toComp: "gnd1", toTerm: 0 },
                { fromComp: "v_src", fromTerm: 0, toComp: "gnd1", toTerm: 0 }
            ],
            calculations: {
                vSupply: "5.0 V",
                vBaseDrive: "5.0 V (Switched)",
                rBase: "1.0 kΩ -> I_Base ≈ 4.3 mA",
                rCollector: "330 Ω -> I_Collector ≈ 8.7 mA",
                vSatCE: "0.02 V (Deep Saturation)",
                forcedGain: "I_C / I_B ≈ 2.0 (Ensures hard saturation)"
            },
            datasheetReferences: [
                "STMicro / Central Semi 2N2222A: V_CEO = 40V, I_C = 800mA, P_D = 625mW",
                "Kingbright WP7113ID (Red LED): V_F = 2.0V, I_F(max) = 25mA",
                "Yageo MFR-25 Metal Film Resistors: 1/4W (250mW)"
            ],
            warnings: []
        };

        const content = "### 🔬 2N2222A Transistor LED Switch Circuit\n\n" +
            "Here is a verified transistor switching circuit using a **2N2222A NPN BJT** to drive an indicator LED from a 5V supply:\n\n" +
            "#### 📐 Engineering Calculations & Theory:\n" +
            "1. **Base Drive Resistor ($R_{Base} = 1\\text{ k}\\Omega$):**\n" +
            "   $$I_B = \\frac{V_{supply} - V_{BE}}{R_{Base}} = \\frac{5.0\\text{ V} - 0.7\\text{ V}}{1000\\ \\Omega} = 4.3\\text{ mA}$$\n" +
            "2. **Collector Load Resistor ($R_{Collector} = 330\\ \\Omega$):**\n" +
            "   $$I_C = \\frac{V_{supply} - V_F - V_{CE(sat)}}{R_{Collector}} = \\frac{5.0\\text{ V} - 2.0\\text{ V} - 0.02\\text{ V}}{330\\ \\Omega} \\approx 8.7\\text{ mA}$$\n" +
            "3. **Hard Saturation Guarantee:**\n" +
            "   The forced beta $\\beta_{forced} = I_C / I_B \\approx 8.7 / 4.3 \\approx 2.0$. Because $\\beta_{forced} \\ll h_{FE} (100)$, the transistor operates in deep saturation with negligible heat dissipation ($P_Q = 8.7\\text{mA} \\times 0.02\\text{V} \\approx 0.17\\text{ mW}$).\n\n" +
            "```json:circuit_proposal\n" + JSON.stringify(proposalObj, null, 2) + "\n```\n\n" +
            "Review the schematic above and click **Apply to Canvas** to place this circuit directly onto your workspace!";

        return {
            ok: true,
            provider: 'mock-offline',
            model: 'mock-electronics-expert',
            content,
            proposal: proposalObj
        };
    }

    // 2. Build 5V LED circuit
    if (q.includes('build') && (q.includes('led') || q.includes('5v'))) {
        const proposalObj = {
            proposalId: "prop_led_5v_" + Date.now(),
            designObjective: "5V Red LED Indicator Circuit with 330Ω Limiting Resistor",
            replaceExisting: false,
            components: [
                { id: "v_src", type: "dc_voltage", val: 5, unit: "V", x: 140, y: 240, rotation: 0 },
                { id: "r_lim", type: "resistor", val: 330, unit: "Ω", x: 280, y: 180, rotation: 0 },
                { id: "led_ind", type: "led", val: 2, unit: "V", x: 420, y: 180, rotation: 0 },
                { id: "gnd_ref", type: "ground", val: 0, unit: "V", x: 280, y: 320, rotation: 0 }
            ],
            wires: [
                { fromComp: "v_src", fromTerm: 1, toComp: "r_lim", toTerm: 0 },
                { fromComp: "r_lim", fromTerm: 1, toComp: "led_ind", toTerm: 0 },
                { fromComp: "led_ind", fromTerm: 1, toComp: "gnd_ref", toTerm: 0 },
                { fromComp: "v_src", fromTerm: 0, toComp: "gnd_ref", toTerm: 0 }
            ],
            calculations: {
                vSupply: "5.0 V",
                vForward: "2.0 V",
                rChosen: "330 Ω (Standard E24)",
                iExpected: "9.09 mA",
                powerResistor: "27.3 mW (1/4W Safe)"
            },
            datasheetReferences: [
                "Kingbright WP7113ID (Red LED): VF = 2.0V, IF(max) = 25mA, PIV = 5.0V",
                "Yageo MFR-25FTE52: 1/4W (250mW) rated max power"
            ],
            warnings: []
        };

        const content = `### 💡 5V Red LED Indicator Circuit Design

To safely drive a standard **Kingbright WP7113ID** Red 5mm LED from a **5.0V DC** power supply, we must calculate a current-limiting resistor to keep the forward current safely below the LED's absolute maximum of **25 mA**.

#### 📐 Engineering Calculation:
- **Supply Voltage ($V_{supply}$):** 5.0 V
- **LED Forward Voltage ($V_F$):** 2.0 V (typical for Red AlGaInP)
- **Voltage dropped across resistor ($V_R$):** $V_{supply} - V_F = 5.0\\text{ V} - 2.0\\text{ V} = 3.0\\text{ V}$
- **Target LED Current ($I_{LED}$):** 20.0 mA ($0.020\\text{ A}$)
- **Theoretical Resistance:** $R = \\frac{V_R}{I} = \\frac{3.0\\text{ V}}{0.020\\text{ A}} = 150\\text{ }\\Omega$
- **Nearest Standard E24 Value:** **150 Ω** (or **330 Ω** for an ultra-safe 9.1 mA bench test)
- **Resistor Power Dissipation:** $P = I^2 \\times R = (0.02)^2 \\times 150 = 60\\text{ mW}$
  *(Well below the 250 mW limit of a standard 1/4W Yageo MFR-25FTE52 metal film resistor).*

Here is the verified schematic proposal ready to review and place on your canvas:

\`\`\`json:circuit_proposal
${JSON.stringify(proposalObj, null, 2)}
\`\`\`

Click **Review & Apply to Canvas** below to automatically populate and solve this circuit!`;

        return {
            ok: true,
            provider: 'mock-offline',
            model: 'mock-electronics-expert',
            content,
            proposal: proposalObj
        };
    }

    // 2. Transistor circuit explanation
    if (q.includes('transistor') || q.includes('bjt') || q.includes('2n2222')) {
        return {
            ok: true,
            provider: 'mock-offline',
            model: 'mock-electronics-expert',
            content: `### 🔬 Central Semi 2N2222A NPN Bipolar Transistor Switching Analysis

The **2N2222A** is an industry-standard high-speed NPN switching transistor ($V_{CEO} = 40\\text{ V}, I_C = 800\\text{ mA}, P_D = 625\\text{ mW}$).

#### How the Switch Operates:
1. **Cutoff State ($V_{BE} < 0.65\\text{ V}$):**
   - Base current $I_B \\approx 0$.
   - The Collector-Emitter path is open high-impedance ($R_{CE} > 100\\text{ M}\\Omega$).
   - The load receives $0.00\\text{ mA}$.
2. **Active Linear Region ($V_{BE} \\approx 0.7\\text{ V}, V_{CE} > 0.3\\text{ V}$):**
   - Collector current is proportional to base drive: $I_C = h_{FE} \\times I_B$ (with $h_{FE} \\approx 100 - 300$).
3. **Hard Saturation ($I_B \\ge \\frac{I_C}{10}$):**
   - Both base-emitter and base-collector junctions are forward biased.
   - Collector-to-Emitter saturation voltage drops to $V_{CE(sat)} \\approx 0.1 - 0.3\\text{ V}$.
   - The transistor acts as a closed switch, dissipating minimal internal power ($P = I_C \\times V_{CE(sat)}$).

#### ⚠️ Inductive Load & Flyback Protection:
When driving relays or inductors (like in the built-in preset \`bjt_gpio_switch\`), opening the transistor abruptly creates an inductive voltage spike ($-L \\frac{di}{dt}$) that can exceed the 40V breakdown rating. Always connect a reverse-biased **1N4007** diode directly across the coil to clamp this inductive transient.`
        };
    }

    // 3. Analyze current circuit
    if (q.includes('analyze') || q.includes('circuit') || q.includes('current')) {
        let circuitDetails = "No active circuit context was supplied.";
        if (context && context.components) {
            const compCount = context.components.length;
            const wireCount = context.wires ? context.wires.length : 0;
            const hasGnd = context.hasGround;
            const status = context.simulationRunning ? "Active (Running)" : "Stopped";
            circuitDetails = `Active schematic contains **${compCount} components** and **${wireCount} wires**. Simulation is **${status}** with ${hasGnd ? "verified 0V Earth Ground" : "⚠️ NO Earth Ground reference (Net 0 floating)"}.`;
        }

        return {
            ok: true,
            provider: 'mock-offline',
            model: 'mock-electronics-expert',
            content: `### 📊 Live Schematic & MNA Simulation Analysis

${circuitDetails}

#### Circuit Verification Checklist:
- **Continuity & Loops:** Nodes are solved using Union-Find netlist extraction with Modified Nodal Analysis (MNA).
- **Ground Datum:** A valid 0V reference is necessary for matrix diagonal stabilization and accurate node potential mapping.
- **Operational Stress (SOA):** Check the component inspector for real-time stress badges. Any component operating above 75% rated power displays an amber load warning; above 100% displays crimson overstress.

Would you like to calculate specific component values, probe oscilloscope waveforms, or check thermal ratings for any part?`
        };
    }

    // Default engineering response
    return {
        ok: true,
        provider: 'mock-offline',
        model: 'mock-electronics-expert',
        content: `### ⚡ ElectroSim Pro Electronics Assistant

I am ready to assist with circuit design, component selection, datasheet specifications, and troubleshooting.

#### Supported Topics & Quick Actions:
- **LED Design:** Ask *"Help me build a 5V LED circuit"* to receive a complete calculated schematic proposal.
- **Transistor Switches:** Ask *"Explain how the 2N2222 switch works"* for base-drive and saturation calculations.
- **Datasheet Specifications:** Ask *"What are the ratings for the 1N4007 or BZX55C?"* to review real manufacturer limits.
- **Circuit Analysis:** Ask *"Analyze my current circuit"* to inspect your active canvas components and MNA solver results.`
    };
}

/**
 * Handle incoming HTTP requests
 */
function handleRequest(req, res) {
    const hostHeader = req.headers.host || '127.0.0.1';
    const reqUrl = new URL(req.url, `http://${hostHeader}`);
    const pathname = reqUrl.pathname;
    const method = req.method;
    const clientIp = req.socket.remoteAddress || '127.0.0.1';

    // Set standard CORS headers for browser interop
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Pre-flight OPTIONS
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Rate Limiting check on API routes
    if (pathname.startsWith('/api/')) {
        if (!checkRateLimit(clientIp)) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Too many requests. Please slow down.' }));
            return;
        }
    }

    // Route: GET /api/health
    if (method === 'GET' && pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            provider: 'nvidia',
            hasApiKey: Boolean(config.APIKEY && config.APIKEY.startsWith('nvapi-')),
            defaultModel: config.NVIDIA_MODEL,
            candidateModels: CANDIDATE_MODELS,
            uptime: process.uptime(),
            serverTime: new Date().toISOString()
        }));
        return;
    }

    // Route: GET /api/models
    if (method === 'GET' && pathname === '/api/models') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            defaultModel: config.NVIDIA_MODEL,
            models: CANDIDATE_MODELS
        }));
        return;
    }

    // Route: GET /api/components or /api/components/:id
    if (method === 'GET' && pathname.startsWith('/api/components')) {
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length === 2) {
            // GET /api/components
            const masterPath = path.join(__dirname, 'components', 'components.json');
            if (fs.existsSync(masterPath)) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                fs.createReadStream(masterPath).pipe(res);
                return;
            }
        } else if (parts.length === 3) {
            // GET /api/components/:id
            const partId = parts[2].toLowerCase();
            const compPath = path.join(__dirname, 'components', `${partId}.json`);
            if (fs.existsSync(compPath)) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                fs.createReadStream(compPath).pipe(res);
                return;
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Component '${partId}' not found.` }));
                return;
            }
        }
    }

    // Route: POST /api/calculate (Deterministic Math)
    if (method === 'POST' && pathname === '/api/calculate') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const action = payload.action;
                const params = payload.params || {};

                let result;
                switch (action) {
                    case 'ohmsLaw':
                        result = calculations.calculateOhmsLaw(params);
                        break;
                    case 'ledResistor':
                        result = calculations.calculateLedResistor(params);
                        break;
                    case 'voltageDivider':
                        result = calculations.calculateVoltageDivider(params);
                        break;
                    case 'rcTimeConstant':
                        result = calculations.calculateRcTimeConstant(params);
                        break;
                    case 'reactance':
                        result = calculations.calculateReactance(params);
                        break;
                    case 'powerDissipation':
                        result = calculations.calculatePowerDissipation(params);
                        break;
                    case 'seriesResistance':
                        result = calculations.calculateSeriesResistance(params.resistors || []);
                        break;
                    case 'parallelResistance':
                        result = calculations.calculateParallelResistance(params.resistors || []);
                        break;
                    default:
                        throw new Error(`Unknown calculation action: '${action}'`);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, action, result }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    // Route: POST /api/chat (AI Chat & Circuit Reasoning)
    if (method === 'POST' && pathname === '/api/chat') {
        let body = '';
        let bodyLength = 0;
        const MAX_BODY_SIZE = 5 * 1024 * 1024; // 5 MB max

        req.on('data', chunk => {
            bodyLength += chunk.length;
            if (bodyLength > MAX_BODY_SIZE) {
                res.writeHead(413, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Payload too large. Maximum size is 5MB.' }));
                req.destroy();
                return;
            }
            body += chunk;
        });

        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const messages = Array.isArray(data.messages) ? data.messages : [];
                const context = data.context || null;
                const model = data.model || config.NVIDIA_MODEL;
                const forceMock = Boolean(data.mock);

                if (messages.length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Messages array is required.' }));
                    return;
                }

                // Append context to system prompt if provided
                if (context) {
                    const contextString = `\n\nCURRENT CIRCUIT SNAPSHOT:\n${JSON.stringify(context, null, 2)}`;
                    const sysMsg = messages.find(m => m.role === 'system');
                    if (sysMsg) {
                        sysMsg.content += contextString;
                    } else {
                        messages.unshift({ role: 'system', content: SYSTEM_PROMPT + contextString });
                    }
                }

                // If no API key or mock requested, use deterministic mock
                const hasApiKey = Boolean(config.APIKEY && config.APIKEY.startsWith('nvapi-'));
                if (forceMock || !hasApiKey) {
                    const mockReply = generateMockResponse(messages, context);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(mockReply));
                    return;
                }

                // Execute real NVIDIA completion
                try {
                    const aiReply = await callNvidiaChat(messages, model);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(aiReply));
                } catch (apiError) {
                    console.error('[NVIDIA API Error]:', apiError.message);
                    // Fall back to mock if API key was revoked/failed and explain in response
                    const fallback = generateMockResponse(messages, context);
                    fallback.warning = `NVIDIA API error: ${apiError.message}. Provided fallback response.`;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(fallback));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Malformed request: ${err.message}` }));
            }
        });
        return;
    }

    // Static File Serving (for when loading app directly via http://localhost:PORT)
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.css': 'text/css',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.svg': 'image/svg+xml'
            };
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            fs.createReadStream(filePath).pipe(res);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        }
    });
}

const server = http.createServer(handleRequest);

function startServer(port = PORT) {
    server.listen(port, () => {
        console.log(`=======================================================`);
        console.log(`🚀 ElectroSim Pro AI Agent Backend running on port ${port}`);
        console.log(`📡 URL: http://localhost:${port}`);
        console.log(`🔑 NVIDIA API Key: ${config.APIKEY ? 'Configured (' + config.APIKEY.slice(0, 10) + '...)' : 'Not set (Mock mode active)'}`);
        console.log(`🧠 Default Model: ${config.NVIDIA_MODEL}`);
        console.log(`=======================================================`);
    });
    return server;
}

if (require.main === module) {
    startServer();
}

module.exports = {
    server,
    startServer,
    loadEnv,
    callNvidiaChat,
    generateMockResponse,
    SYSTEM_PROMPT
};
