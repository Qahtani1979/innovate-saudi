import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

// Hook-based version for components
export function useContentModeration() {
  const [result, setResult] = React.useState(null);
  const { invokeAI, isLoading: isChecking } = useAIWithFallback({ showToasts: false });

  const checkContent = React.useCallback(async (text) => {
    const response = await invokeAI({
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

    if (response.success) {
      setResult(response.data);
      return response.data;
    }
    return { toxicity_score: 0, spam_score: 0, is_appropriate: true, issues: [] };
  }, [invokeAI]);

  return { checkContent, isChecking, result };
}

// Utility function for standalone use
export async function checkContentModeration(text, invokeAI) {
  const response = await invokeAI({
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

  if (response.success) {
    return response.data;
  }
  return { toxicity_score: 0, spam_score: 0, is_appropriate: true, issues: [] };
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
