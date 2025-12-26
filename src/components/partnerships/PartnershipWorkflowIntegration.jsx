import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Handshake, Users } from 'lucide-react';
import { usePartnerships } from '@/hooks/usePartnerships';
import { usePartnershipMutations } from '@/hooks/usePartnershipMutations';

export default function PartnershipWorkflowIntegration({ organizationId }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [proposalData, setProposalData] = useState({
    partnership_type: 'strategic',
    proposal_text: '',
    proposed_activities: []
  });

  const { data: partnerships = [] } = usePartnerships();
  const { createPartnership } = usePartnershipMutations();

  const myPartnerships = partnerships.filter(p =>
    p.organization_a_id === organizationId ||
    p.organization_b_id === organizationId
  );

  const handlePropose = (targetOrgId) => {
    createPartnership.mutate({
      data: {
        organization_a_id: organizationId,
        organization_b_id: targetOrgId,
        partnership_type: proposalData.partnership_type,
        status: 'proposed',
        proposal_text: proposalData.proposal_text,
        proposed_by: user?.email,
        proposed_date: new Date().toISOString()
      }
    }, {
      onSuccess: () => {
        setProposalData({ partnership_type: 'strategic', proposal_text: '', proposed_activities: [] });
      }
    });
  };

  const activePartnerships = myPartnerships.filter(p => p.status === 'active');
  const pendingPartnerships = myPartnerships.filter(p => p.status === 'proposed');

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake className="h-5 w-5 text-blue-600" />
          {t({ en: 'Partnership Workflow', ar: 'سير عمل الشراكات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded text-center">
            <p className="text-2xl font-bold text-green-600">{activePartnerships.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded text-center">
            <p className="text-2xl font-bold text-amber-600">{pendingPartnerships.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
          </div>
        </div>

        {activePartnerships.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">{t({ en: 'Active Partnerships', ar: 'الشراكات النشطة' })}</p>
            {activePartnerships.slice(0, 3).map(p => (
              <div key={p.id} className="p-3 bg-green-50 rounded border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Handshake className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium">{p.partnership_type?.replace(/_/g, ' ')}</p>
                  </div>
                  <Badge className="bg-green-600 text-white">{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button className="w-full bg-blue-600" onClick={() => {/* Handle propose capability */ }}>
          <Users className="h-4 w-4 mr-2" />
          {t({ en: 'Propose Partnership', ar: 'اقترح شراكة' })}
        </Button>
      </CardContent>
    </Card>
  );
}