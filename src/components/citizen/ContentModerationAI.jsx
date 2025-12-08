import React from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export async function checkContentModeration(text) {
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this citizen-submitted text for content moderation:

Text: "${text}"

Detect:
1. Toxicity (profanity, hate speech, threats) - score 0-100
2. Spam likelihood - score 0-100
3. Is appropriate for public platform - boolean
4. Issues found (array of strings)

Return scores and findings.`,
      response_json_schema: {
        type: "object",
        properties: {
          toxicity_score: { type: "number" },
          spam_score: { type: "number" },
          is_appropriate: { type: "boolean" },
          issues: { type: "array", items: { type: "string" } }
        }
      }
    });

    return result;
  } catch (error) {
    console.error('Content moderation failed:', error);
    return { toxicity_score: 0, spam_score: 0, is_appropriate: true, issues: [] };
  }
}

export default function ContentModerationAlert({ moderationResult }) {
  if (!moderationResult || moderationResult.is_appropriate) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <p className="font-semibold mb-1">Content flagged for review</p>
        {moderationResult.issues?.length > 0 && (
          <ul className="text-xs space-y-1">
            {moderationResult.issues.map((issue, idx) => (
              <li key={idx}>• {issue}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}