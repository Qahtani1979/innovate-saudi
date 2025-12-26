

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from 'lucide-react';

/**
 * Network graph visualization for organization connections
 */
import { useOrganizationPartnerships } from '@/hooks/useOrganizations';

export default function OrganizationNetworkGraph({ organizationId }) {
  const { data: { partnerships, collaborations } = { partnerships: [], collaborations: [] } } = useOrganizationPartnerships(organizationId);

  const connections = partnerships.length + collaborations.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Network className="h-4 w-4 text-teal-600" />
          Network Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="text-4xl font-bold text-teal-600">{connections}</p>
          <p className="text-sm text-slate-600 mt-1">Active Connections</p>
          <div className="mt-3 flex gap-2 justify-center text-xs">
            <span className="text-slate-600">{partnerships.length} partnerships</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{collaborations.length} collaborations</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
