import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Handshake, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useOrganizationById, useOrganizations } from '@/hooks/useOrganizations';
import { usePartnershipMutations } from '@/hooks/usePartnershipMutations';

/**
 * AI-powered partnership orchestration
 * Suggests partnerships based on strategic alignment
 */
export default function PartnershipOrchestrator({ organizationId }) {
  const { user } = useAuth();
  const { data: org } = useOrganizationById(organizationId);
  const { data: allOrganizations = [] } = useOrganizations();
  const { createPartnership } = usePartnershipMutations();

  const suggestions = useMemo(() => {
    if (!org || !allOrganizations.length) return [];

    return allOrganizations.filter(o => {
      if (o.id === organizationId || !o.is_active) return false;

      const hasComplementary = org.capabilities?.some(cap =>
        o.capabilities?.includes(cap)
      );
      const sameSector = org.sectors?.some(s => o.sectors?.includes(s));
      return hasComplementary || sameSector;
    }).slice(0, 5);
  }, [org, allOrganizations, organizationId]);

  const suggestPartnership = (partnerId) => {
    createPartnership.mutate({
      data: {
        organization_a_id: organizationId,
        organization_b_id: partnerId,
        partnership_type: 'strategic',
        status: 'proposed'
      },
      userEmail: user?.email
    });
  };

  if (suggestions.length === 0) return null;

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          AI Partnership Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map(suggestion => (
          <div key={suggestion.id} className="p-2 bg-purple-50 rounded border flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm">{suggestion.name_en}</p>
              <p className="text-xs text-slate-600">{suggestion.org_type}</p>
            </div>
            <Button size="sm" onClick={() => suggestPartnership(suggestion.id)}>
              <Handshake className="h-3 w-3 mr-1" />
              Propose
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
