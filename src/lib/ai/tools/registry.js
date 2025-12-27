/**
 * The Central Registry for Agent Tools.
 * Maps "Intent" (Prompt Output) -> "Execution" (Code).
 *
 * Structure:
 * key: {
 *   schema: ZodSchema, // Input Validation
 *   execute: (params, context) => Promise<any>, // The Code
 *   safety: 'safe' | 'unsafe' // Middleware Flag
 * }
 */

export const TOOL_REGISTRY = {
    // Phase 2: Will populate this with 'navigate', 'create_pilot', etc.
};
