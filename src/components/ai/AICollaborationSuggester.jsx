import { useCollaborationSuggestions } from '@/hooks/useCollaborationSuggestions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

/**
 * AI-powered collaboration suggestions with bilingual output
 */
export default function AICollaborationSuggester({ entityType, entityId, entityData }) {
  const { suggestions, suggestInfo } = useCollaborationSuggestions({ entityType, entityId, entityData });
  const { refetch, isLoading: queryLoading, aiLoading: isLoading, status, isAvailable, rateLimitInfo } = suggestInfo;

  const sendCollaborationInvite = async (suggestion) => {
    toast.success('Collaboration invite sent');
  };

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            AI Collaboration Suggestions
          </CardTitle>
          <Button
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || queryLoading || !isAvailable}
            className="bg-teal-600"
          >
            {(isLoading || queryLoading) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            Suggest
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-2" />

        {suggestions && suggestions.length > 0 ? (
          suggestions.map((suggestion, idx) => (
            <div key={idx} className="p-3 bg-teal-50 rounded border">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{suggestion.partner_name}</p>
                  <p className="text-xs text-slate-600 mt-1">{suggestion.rationale}</p>
                </div>
                <Badge className="bg-teal-600">{Math.round(suggestion.confidence * 100)}%</Badge>
              </div>
              <Button size="sm" onClick={() => sendCollaborationInvite(suggestion)} className="w-full">
                <Users className="h-3 w-3 mr-2" />
                Send Invite
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-slate-500 text-sm">
            Click "Suggest" to get AI-powered collaboration recommendations
          </div>
        )}
      </CardContent>
    </Card>
  );
}
