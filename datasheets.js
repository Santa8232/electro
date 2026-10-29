/**
 * ElectroSim Pro — Engineering Datasheet Retrieval & Knowledge Engine
 * 
 * Provides structured access, search, and citation formatting for the
 * authentic component datasheet archive.
 */

// If running in browser where REAL_COMPONENT_DATASHEETS is already global, we can bind to it.
// For Node.js/backend, we extract or load the complete archive.
let archive = null;

function setDatasheetArchive(customArchive) {
    archive = customArchive;
}

function getDatasheetArchive() {
    if (archive) return archive;
    if (typeof window !== 'undefined' && window.REAL_COMPONENT_DATASHEETS) {
        return window.REAL_COMPONENT_DATASHEETS;
    }
    // In Node.js environment, load directly from components module
    if (typeof require !== 'undefined') {
        try {
            const components = require('./components');
            if (components && components.REAL_COMPONENT_DATASHEETS && Object.keys(components.REAL_COMPONENT_DATASHEETS).length > 0) {
                archive = components.REAL_COMPONENT_DATASHEETS;
                return archive;
            }
        } catch (e) {
            // Fallback to reading index.html if components not available
        }
        try {
            const fs = require('fs');
            const path = require('path');
            const htmlPath = path.resolve(__dirname, 'index.html');
            if (fs.existsSync(htmlPath)) {
                const html = fs.readFileSync(htmlPath, 'utf8');
                const match = html.match(/const REAL_COMPONENT_DATASHEETS = ({[\s\S]+?\n {8}};)/);
                if (match) {
                    const fn = new Function('return ' + match[1]);
                    archive = fn();
                    return archive;
                }
            }
        } catch (e) {
            console.warn('Could not load datasheets from index.html:', e.message);
        }
    }
    return {};
}

/**
 * Search datasheets by query (matches type, partNumber, title, category, manufacturer, specs)
 * @param {string} query - Search term (e.g. '2N2222', 'Zener', 'ESP32', 'resistor')
 * @returns {Array<Object>} Matched datasheet records with relevance score
 */
function searchDatasheets(query) {
    if (!query || typeof query !== 'string') return [];
    const q = query.toLowerCase().trim();
    const dsArchive = getDatasheetArchive();
    const results = [];

    for (const [key, ds] of Object.entries(dsArchive)) {
        let score = 0;
        const keyMatch = key.toLowerCase();
        const partMatch = (ds.partNumber || '').toLowerCase();
        const titleMatch = (ds.title || '').toLowerCase();
        const descMatch = (ds.description || '').toLowerCase();
        const catMatch = (ds.category || '').toLowerCase();

        if (keyMatch === q || partMatch.includes(q)) score += 50;
        if (titleMatch.includes(q)) score += 30;
        if (catMatch.includes(q)) score += 20;
        if (descMatch.includes(q)) score += 10;

        // Check specs
        if (ds.electricalSpecs) {
            for (const [specKey, specVal] of Object.entries(ds.electricalSpecs)) {
                if (specKey.toLowerCase().includes(q) || String(specVal).toLowerCase().includes(q)) {
                    score += 15;
                }
            }
        }
        if (ds.absoluteMax) {
            for (const [maxKey, maxVal] of Object.entries(ds.absoluteMax)) {
                if (maxKey.toLowerCase().includes(q) || String(maxVal).toLowerCase().includes(q)) {
                    score += 15;
                }
            }
        }

        if (score > 0) {
            results.push({
                componentType: key,
                partNumber: ds.partNumber,
                title: ds.title,
                category: ds.category,
                package: ds.package,
                score,
                datasheet: ds
            });
        }
    }

    return results.sort((a, b) => b.score - a.score);
}

/**
 * Formats a datasheet into an evidence-based markdown report for the AI context.
 * Explicitly separates Absolute Maximum Ratings from Recommended Operating Conditions.
 */
function formatDatasheetForAI(componentType) {
    const dsArchive = getDatasheetArchive();
    const ds = dsArchive[componentType];
    if (!ds) {
        return `Datasheet not found for component type "${componentType}". Available components: ${Object.keys(dsArchive).join(', ')}`;
    }

    let md = `### Engineering Datasheet: ${ds.partNumber}\n`;
    md += `**Title:** ${ds.title}\n`;
    md += `**Category:** ${ds.category} | **Package:** ${ds.package}\n\n`;
    md += `**Description:** ${ds.description}\n\n`;

    // Pinout table
    if (Array.isArray(ds.pinout) && ds.pinout.length > 0) {
        md += `#### Pinout & Terminal Connections:\n`;
        md += `| Pin # | Terminal Name | Functional Description |\n`;
        md += `| :---: | :--- | :--- |\n`;
        for (const p of ds.pinout) {
            md += `| Pin ${p.pin} | \`${p.name}\` | ${p.desc} |\n`;
        }
        md += `\n`;
    }

    // Absolute Maximum Ratings
    if (ds.absoluteMax) {
        md += `#### ⚠️ Absolute Maximum Ratings (Do NOT exceed under any operating condition):\n`;
        for (const [k, v] of Object.entries(ds.absoluteMax)) {
            md += `- **${k}:** ${v}\n`;
        }
        md += `\n`;
    }

    // Recommended Operating Conditions
    if (ds.recommended) {
        md += `#### Recommended Operating Conditions:\n`;
        for (const [k, v] of Object.entries(ds.recommended)) {
            md += `- **${k}:** ${v}\n`;
        }
        md += `\n`;
    }

    // Electrical Characteristics
    if (ds.electricalSpecs) {
        md += `#### Electrical Specifications:\n`;
        for (const [k, v] of Object.entries(ds.electricalSpecs)) {
            md += `- **${k}:** ${v}\n`;
        }
        md += `\n`;
    }

    // Application Notes
    if (ds.notes) {
        md += `#### Application & Design Notes:\n${ds.notes}\n`;
    }

    return md;
}

/**
 * Helper to parse uploaded custom datasheet content (JSON, plaintext, or metadata)
 */
function parseCustomDatasheet(content, fileName = 'custom_datasheet') {
    if (!content) throw new Error("No datasheet content provided.");
    
    // Check if JSON
    if (typeof content === 'string' && (content.trim().startsWith('{') || content.trim().startsWith('['))) {
        try {
            const parsed = JSON.parse(content);
            return {
                type: 'json',
                fileName,
                data: parsed,
                textSummary: JSON.stringify(parsed, null, 2)
            };
        } catch(e) {
            // Not valid JSON, fallback to plain text
        }
    }

    // Treat as plain text / markdown
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    return {
        type: 'text',
        fileName,
        lineCount: lines.length,
        textSummary: content.length > 5000 ? content.slice(0, 5000) + '\n... [truncated]' : content
    };
}

// Module export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setDatasheetArchive,
        getDatasheetArchive,
        searchDatasheets,
        formatDatasheetForAI,
        parseCustomDatasheet
    };
}
if (typeof window !== 'undefined') {
    window.DatasheetKnowledge = {
        setDatasheetArchive,
        getDatasheetArchive,
        searchDatasheets,
        formatDatasheetForAI,
        parseCustomDatasheet
    };
}

