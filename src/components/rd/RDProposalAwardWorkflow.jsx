import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { Award, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function RDProposalAwardWorkflow({ proposal, rdCall, onClose }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [awardAmount, setAwardAmount] = useState(proposal.budget_requested || 0);
  const [awardNotes, setAwardNotes] = useState('');
  const [startDate, setStartDate] = useState('');

  const awardMutation = useMutation({
    mutationFn: async () => {
      // Create R&D Project from awarded proposal
      const { data: rdProject, error: projectError } = await supabase.from('rd_projects').insert({
        code: `RD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        title_en: proposal.title_en,
        title_ar: proposal.title_ar,
        tagline_en: proposal.tagline_en,
        tagline_ar: proposal.tagline_ar,
        abstract_en: proposal.abstract_en,
        abstract_ar: proposal.abstract_ar,
        rd_call_id: proposal.rd_call_id,
        institution_en: proposal.lead_institution,
        institution_ar: proposal.institution_ar,
        principal_investigator: proposal.principal_investigator,
        team_members: proposal.team_members || [],
        budget: awardAmount,
        budget_breakdown: proposal.budget_breakdown || [],
        funding_source_en: `${rdCall?.title_en} - Award`,
        funding_source_ar: `${rdCall?.title_ar} - Award`,
        funding_status: 'approved',
        duration_months: proposal.duration_months,
        trl_start: proposal.trl_start,
        trl_target: proposal.trl_target,
        trl_current: proposal.trl_start,
        status: 'approved',
        timeline: {
          start_date: startDate || new Date().toISOString().split('T')[0],
          milestones: []
        },
        is_published: false
      }).select().single();
      if (projectError) throw projectError;

      // Update proposal with award info
      await supabase.from('rd_proposals').update({
        status: 'approved',
        awarded_amount: awardAmount,
        award_date: new Date().toISOString(),
        award_notes: awardNotes,
        converted_rd_project_id: rdProject.id
      }).eq('id', proposal.id);

      // Log activity
      await supabase.from('system_activities').insert({
        entity_type: 'RDProposal',
        entity_id: proposal.id,
        activity_type: 'approved',
        description: `Proposal awarded ${awardAmount} SAR and converted to R&D project`,
        performed_by: user?.email,
        timestamp: new Date().toISOString(),
        metadata: { rd_project_id: rdProject.id, awarded_amount: awardAmount }
      });

      // Notify PI via email-trigger-hub
      if (proposal.principal_investigator?.email) {
        await supabase.functions.invoke('email-trigger-hub', {
          body: {
            trigger: 'proposal.accepted',
            recipient_email: proposal.principal_investigator.email,
            entity_type: 'rd_proposal',
            entity_id: proposal.id,
            variables: {
              recipientName: proposal.principal_investigator.name,
              proposalTitle: proposal.title_en,
              awardedAmount: awardAmount.toLocaleString(),
              startDate: startDate
            },
            triggered_by: user?.email
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-proposal']);
      queryClient.invalidateQueries(['rd-projects']);
      toast.success(t({ en: 'Proposal awarded and project created!', ar: 'تم منح المقترح وإنشاء المشروع!' }));
      onClose?.();
    }
  });

  return (
    <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Award className="h-5 w-5" />
          {t({ en: 'Award Decision & Project Creation', ar: 'قرار المنح وإنشاء المشروع' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-green-100 rounded-lg">
          <p className="text-sm font-medium text-green-900 mb-2">
            {t({ en: 'Award this proposal and automatically create R&D project', ar: 'امنح هذا المقترح وأنشئ مشروع بحث تلقائياً' })}
          </p>
          <p className="text-xs text-green-800">
            {t({ en: 'The awarded proposal will be converted to an active R&D project.', ar: 'سيتم تحويل المقترح الممنوح إلى مشروع بحث نشط.' })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {t({ en: 'Award Amount (SAR)', ar: 'مبلغ المنحة (ريال)' })}
            </Label>
            <Input
              type="number"
              value={awardAmount}
              onChange={(e) => setAwardAmount(parseFloat(e.target.value))}
              placeholder={t({ en: 'Enter award amount', ar: 'أدخل مبلغ المنحة' })}
            />
            {awardAmount !== proposal.budget_requested && (
              <p className="text-xs text-amber-600">
                {t({ en: 'Original request:', ar: 'الطلب الأصلي:' })} {proposal.budget_requested?.toLocaleString()} SAR
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {t({ en: 'Project Start Date', ar: 'تاريخ بدء المشروع' })}
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Award Notes (optional)', ar: 'ملاحظات المنحة (اختياري)' })}</Label>
          <Textarea
            value={awardNotes}
            onChange={(e) => setAwardNotes(e.target.value)}
            placeholder={t({ en: 'Any special conditions or notes...', ar: 'أي شروط أو ملاحظات خاصة...' })}
            rows={3}
          />
        </div>

        <Button
          onClick={() => awardMutation.mutate()}
          disabled={!awardAmount || !startDate || awardMutation.isPending}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
          size="lg"
        >
          {awardMutation.isPending ? (
            <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{t({ en: 'Processing...', ar: 'جاري المعالجة...' })}</>
          ) : (
            <><Award className="h-5 w-5 mr-2" />{t({ en: 'Award & Create Project', ar: 'منح وإنشاء مشروع' })}</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}