import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { FileText, Link as LinkIcon, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function PolicyImpactTracker({ rdProject }) {
  const { t } = useLanguage();
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const queryClient = useQueryClient();

  const { data: policies = [] } = useQuery({
    queryKey: ['policies-for-impact'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policy_recommendations')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const linkPolicyMutation = useMutation({
    mutationFn: async (policyId) => {
      // Get current policy
      const { data: policy, error: fetchError } = await supabase
        .from('policy_recommendations')
        .select('*')
        .eq('id', policyId)
        .single();
      if (fetchError) throw fetchError;
      
      // Update policy with research link
      const { error: policyUpdateError } = await supabase
        .from('policy_recommendations')
        .update({
          research_evidence_ids: [...(policy.research_evidence_ids || []), rdProject.id],
          research_publications_cited: [
            ...(policy.research_publications_cited || []),
            ...rdProject.publications?.map(p => p.title) || []
          ]
        })
        .eq('id', policyId);
      if (policyUpdateError) throw policyUpdateError;

      // Update R&D project with policy link
      const { error: rdUpdateError } = await supabase
        .from('rd_projects')
        .update({
          influenced_policy_ids: [...(rdProject.influenced_policy_ids || []), policyId]
        })
        .eq('id', rdProject.id);
      if (rdUpdateError) throw rdUpdateError;

      return policyId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rd-project', rdProject.id] });
      queryClient.invalidateQueries({ queryKey: ['policies-for-impact'] });
      toast.success(t({ en: 'Policy impact linked', ar: 'تم ربط تأثير السياسة' }));
      setSelectedPolicyId('');
    }
  });

  const unlinkPolicyMutation = useMutation({
    mutationFn: async (policyId) => {
      const { data: policy, error: fetchError } = await supabase
        .from('policy_recommendations')
        .select('*')
        .eq('id', policyId)
        .single();
      if (fetchError) throw fetchError;
      
      const { error: policyUpdateError } = await supabase
        .from('policy_recommendations')
        .update({
          research_evidence_ids: (policy.research_evidence_ids || []).filter(id => id !== rdProject.id)
        })
        .eq('id', policyId);
      if (policyUpdateError) throw policyUpdateError;

      const { error: rdUpdateError } = await supabase
        .from('rd_projects')
        .update({
          influenced_policy_ids: (rdProject.influenced_policy_ids || []).filter(id => id !== policyId)
        })
        .eq('id', rdProject.id);
      if (rdUpdateError) throw rdUpdateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rd-project', rdProject.id] });
      toast.success(t({ en: 'Link removed', ar: 'تم إزالة الرابط' }));
    }
  });

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
                  onClick={() => unlinkPolicyMutation.mutate(policy.id)}
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
            onClick={() => linkPolicyMutation.mutate(selectedPolicyId)}
            disabled={!selectedPolicyId || linkPolicyMutation.isPending}
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
