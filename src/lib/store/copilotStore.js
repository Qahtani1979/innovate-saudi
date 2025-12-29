import { create } from 'zustand';

/**
 * Global State for the Copilot OS.
 * Handles UI state (thinking, open/closed) and Action state (confirmation).
 * 
 * Note: Actual Chat History is handled by React Query (server-state).
 * This store handles CLIENT-ONLY interaction state.
 */
export const useCopilotStore = create((set) => ({
    // 1. Session State
    activeSessionId: null,
    isConsoleOpen: false,
    viewMode: 'chat', // 'chat' | 'history'

    // 2. Interaction State
    isThinking: false,

    // 3. Tool Execution State (The "Safety Layer")
    toolStatus: 'idle', // 'idle' | 'executing' | 'requiring_confirmation' | 'success' | 'error'
    pendingToolCall: null, // { id, name, args } when waiting for confirmation
    lastExecutionResult: null,

    // Actions
    setActiveSessionId: (id) => set({ activeSessionId: id }),
    toggleConsole: (isOpen) => set({ isConsoleOpen: isOpen ?? ((s) => !s.isConsoleOpen) }),

    setIsThinking: (isThinking) => set({ isThinking }),

    // Safety Flow
    requestConfirmation: (toolCall) => set({
        toolStatus: 'requiring_confirmation',
        pendingToolCall: toolCall
    }),

    confirmAction: () => set({ toolStatus: 'executing' }), // UI should trigger actual execution then call this

    cancelAction: () => set({
        toolStatus: 'idle',
        pendingToolCall: null
    }),

    completeAction: (result) => set({
        toolStatus: 'success',
        lastExecutionResult: result,
        pendingToolCall: null
    }),

    reportError: (error) => set({
        toolStatus: 'error',
        lastExecutionResult: error
    }),

    resetToolState: () => set({
        toolStatus: 'idle',
        pendingToolCall: null,
        lastExecutionResult: null
    }),

    // 4. Context Router State (Phase 3)
    contextDraft: {
        type: null, // 'pilot' | 'challenge'
        data: {},   // { title: "..." }
        references: [], // [{ type: 'challenge', id: '123' }] (Gap Fix: Linking)
        status: 'idle'
    },

    setDraftType: (type) => set((state) => ({
        contextDraft: { ...state.contextDraft, type, status: 'collecting' }
    })),

    updateDraft: (data) => set((state) => ({
        contextDraft: {
            ...state.contextDraft,
            data: { ...state.contextDraft.data, ...data }
        }
    })),

    addReference: (ref) => set((state) => ({
        contextDraft: {
            ...state.contextDraft,
            references: [...state.contextDraft.references, ref]
        }
    })),

    resetDraft: () => set({
        contextDraft: { type: null, data: {}, references: [], status: 'idle' }
    })
}));
