import { createContext, useContext, useState, useCallback } from 'react';

const CopilotToolsContext = createContext(null);

export function CopilotToolsProvider({ children }) {
    const [registry, setRegistry] = useState(new Map());

    /**
     * Register a tool dynamically.
     * @param {Object} toolDef - { name, description, schema, execute, safety }
     */
    const registerTool = useCallback((toolDef) => {
        if (!toolDef.name) {
            console.error("Attempted to register tool without name", toolDef);
            return;
        }

        // Enforce namespacing for non-core tools (Gap: Global vs Local)
        // e.g. "sectors:list", "pilots:create"
        // Core tools like "navigate" can remain top-level

        setRegistry(prev => {
            const next = new Map(prev);
            next.set(toolDef.name, toolDef);
            return next;
        });

        // Return unregister function
        return () => {
            setRegistry(prev => {
                const next = new Map(prev);
                next.delete(toolDef.name);
                return next;
            });
        };
    }, []);

    const getTool = useCallback((name) => {
        return registry.get(name);
    }, [registry]);

    const getAllTools = useCallback(() => {
        return Array.from(registry.values());
    }, [registry]);

    return (
        <CopilotToolsContext.Provider value={{ registerTool, getTool, getAllTools }}>
            {children}
        </CopilotToolsContext.Provider>
    );
}

export function useCopilotTools() {
    const context = useContext(CopilotToolsContext);
    if (!context) {
        throw new Error('useCopilotTools must be used within a CopilotToolsProvider');
    }
    return context;
}
