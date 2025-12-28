/**
 * Causal Graph Prompts
 * AI assistance for visualizing root causes and effects
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CAUSAL_GRAPH_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are a Systems Thinking Expert.
Analyze the problem to build a Causal Loop Diagram (CLD).
Identify variables, links (positive/negative), and feedback loops.
`;

export const causalGraphSchema = {
    type: "object",
    properties: {
        nodes: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    label: { type: "string" },
                    type: { type: "string", enum: ["factor", "outcome", "intervention"] }
                }
            }
        },
        links: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    source: { type: "string" },
                    target: { type: "string" },
                    type: { type: "string", enum: ["positive", "negative"] },
                    details: { type: "string" }
                }
            }
        }
    }
};

export const getCausalGraphPrompt = (problem) => `
Create a Causal Graph for this problem:
"${problem}"

Identify 5-10 key variables and their causal relationships.
Return JSON with nodes and links.
`;
