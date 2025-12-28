import { useState } from 'react';
import { useRDMutations } from '@/hooks/useRDMutations';
import { useRDPolicies } from '@/hooks/useRDData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { FileText, Trash2, Plus } from 'lucide-react';

export default function PolicyImpactTracker({ rdProject }) {
  const { t } = useLanguage();
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const { linkPolicyToProject, unlinkPolicyFromProject } = useRDMutations();

  const { data: policies = [] } = useRDPolicies();

  const linkedPolicies = policies.filter(p => rdProject.influenced_policy_ids?.includes(p.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Policy Impact Tracking', ar: 'تتبع تأثير السياسة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Linked Policies */}
        {linkedPolicies.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              {t({ en: 'Research Influenced These Policies:', ar: 'البحث أثر في هذه السياسات:' })}
            </p>
            {linkedPolicies.map((policy) => (
              <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg bg-indigo-50">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-slate-900">{policy.title_en}</h4>
                  <Badge className="mt-1 text-xs">{policy.workflow_stage}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => unlinkPolicyFromProject.mutate({
                    projectId: rdProject.id,
                    policyId: policy.id,
                    currentInfluencedPolicyIds: rdProject.influenced_policy_ids
                  })}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Link */}
        <div className="flex gap-2">
          <Select value={selectedPolicyId} onValueChange={setSelectedPolicyId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t({ en: 'Select policy...', ar: 'اختر سياسة...' })} />
            </SelectTrigger>
            <SelectContent>
              {policies
                .filter(p => !linkedPolicies.find(lp => lp.id === p.id))
                .map((policy) => (
                  <SelectItem key={policy.id} value={policy.id}>
                    {policy.title_en}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              linkPolicyToProject.mutate({
                projectId: rdProject.id,
                policyId: selectedPolicyId,
                currentInfluencedPolicyIds: rdProject.influenced_policy_ids,
                projectPublications: rdProject.publications
              }, {
                onSuccess: () => setSelectedPolicyId('')
              });
            }}
            disabled={!selectedPolicyId || linkPolicyToProject.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Link', ar: 'ربط' })}
          </Button>
        </div>

        {linkedPolicies.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">
            {t({ en: 'No policy impact tracked yet', ar: 'لم يتم تتبع تأثير السياسة بعد' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
