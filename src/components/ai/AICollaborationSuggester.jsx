import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

/**
 * AI-powered collaboration suggestions
 */
export default function AICollaborationSuggester({ entityType, entityId }) {
  const { data: suggestions, refetch } = useQuery({
    queryKey: ['collaboration-suggestions', entityType, entityId],
    queryFn: async () => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Given a ${entityType} with ID ${entityId}, suggest 3 potential collaboration opportunities with other organizations or users. Consider complementary skills, shared interests, and strategic alignment.`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  partner_type: { type: 'string' },
                  partner_name: { type: 'string' },
                  rationale: { type: 'string' },
                  confidence: { type: 'number' }
                }
              }
            }
          }
        }
      });
      return response.suggestions || [];
    },
    enabled: !!entityId
  });

  const sendCollaborationInvite = async (suggestion) => {
    try {
      await base44.integrations.Core.SendEmail({
        to: suggestion.partner_email || 'partnerships@example.com',
        subject: 'Collaboration Opportunity',
        body: `Collaboration opportunity suggested: ${suggestion.rationale}`
      });
      toast.success('Collaboration invite sent');
    } catch (error) {
      toast.error('Failed to send invite');
    }
  };

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-600" />
          AI Collaboration Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map((suggestion, idx) => (
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
        ))}
      </CardContent>
    </Card>
  );
}