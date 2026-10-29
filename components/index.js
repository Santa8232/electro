/**
 * ElectroSim Pro — Master Component Registry & Datasheet Hub
 * 
 * Aggregates all 21 modular component specifications and authentic datasheets.
 * Supports both CommonJS (Node.js) and Browser environments.
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require);
    } else {
        const exports = factory();
        root.COMPONENT_REGISTRY = exports.COMPONENT_REGISTRY;
        root.COMPONENT_TYPES = exports.COMPONENT_TYPES;
        root.REAL_COMPONENT_DATASHEETS = exports.REAL_COMPONENT_DATASHEETS;
        root.getComponent = exports.getComponent;
        root.getDatasheet = exports.getDatasheet;
        root.getAllComponents = exports.getAllComponents;
        root.getComponentsByCategory = exports.getComponentsByCategory;
    }
})(typeof self !== 'undefined' ? self : this, function(localRequire) {
    'use strict';

    const partIds = [
        'dc_voltage', 'ac_voltage', 'resistor', 'capacitor', 'inductor',
        'led', 'diode', 'zener', 'npn_bjt', 'fuse',
        'switch', 'ground', 'arduino_uno', 'esp32', 'dht11',
        'hc_sr04', 'pir_sensor', 'ldr', 'buzzer', 'servo', 'relay'
    ];

    const COMPONENT_REGISTRY = {};
    const COMPONENT_TYPES = {};
    const REAL_COMPONENT_DATASHEETS = {};

    // 1. In Node.js environment, dynamically require each component module or JSON spec
    if (typeof localRequire === 'function') {
        partIds.forEach(id => {
            try {
                let comp = null;
                try {
                    comp = localRequire(`./${id}.json`);
                } catch (e) {
                    comp = localRequire(`./${id}.js`);
                }
                if (comp && comp.id) {
                    COMPONENT_REGISTRY[comp.id] = comp;
                    COMPONENT_TYPES[comp.id] = {
                        name: comp.name,
                        symbol: comp.symbol,
                        desc: comp.desc,
                        category: comp.category,
                        terminals: comp.terminals,
                        defaultVal: comp.defaultVal,
                        unit: comp.unit
                    };
                    if (comp.datasheet) {
                        REAL_COMPONENT_DATASHEETS[comp.id] = comp.datasheet;
                    }
                }
            } catch (err) {
                console.error(`Error loading component module '${id}':`, err.message);
            }
        });
    } else if (typeof window !== 'undefined' && window.ELECTRO_COMPONENTS) {
        // 2. In Browser environment where individual parts were loaded
        for (const [id, comp] of Object.entries(window.ELECTRO_COMPONENTS)) {
            COMPONENT_REGISTRY[id] = comp;
            COMPONENT_TYPES[id] = {
                name: comp.name,
                symbol: comp.symbol,
                desc: comp.desc,
                category: comp.category,
                terminals: comp.terminals,
                defaultVal: comp.defaultVal,
                unit: comp.unit
            };
            if (comp.datasheet) {
                REAL_COMPONENT_DATASHEETS[id] = comp.datasheet;
            }
        }
    }

    /**
     * Retrieve full component object by ID
     */
    function getComponent(id) {
        return COMPONENT_REGISTRY[id] || null;
    }

    /**
     * Retrieve datasheet object by component ID
     */
    function getDatasheet(id) {
        return REAL_COMPONENT_DATASHEETS[id] || (COMPONENT_REGISTRY[id] ? COMPONENT_REGISTRY[id].datasheet : null);
    }

    /**
     * Retrieve all components as an array
     */
    function getAllComponents() {
        return Object.values(COMPONENT_REGISTRY);
    }

    /**
     * Retrieve components filtered by category ('power', 'passive', 'semi', 'control', 'iot')
     */
    function getComponentsByCategory(category) {
        return Object.values(COMPONENT_REGISTRY).filter(c => c.category === category);
    }

    return {
        COMPONENT_REGISTRY,
        COMPONENT_TYPES,
        REAL_COMPONENT_DATASHEETS,
        getComponent,
        getDatasheet,
        getAllComponents,
        getComponentsByCategory
    };
});

