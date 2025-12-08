import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Award, X, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { createNotification } from './AutoNotification';

export default function RDCallAwardWorkflow({ rdCall, selectedProposals, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [awardMessage, setAwardMessage] = useState('');
  const [notifyAll, setNotifyAll] = useState(true);

  const awardMutation = useMutation({
    mutationFn: async (data) => {
      // Update proposals
      for (const proposal of data.awarded) {
        await base44.entities.RDProposal.update(proposal.id, {
          status: 'awarded',
          award_date: new Date().toISOString(),
          award_message: data.message
        });

        // Create R&D Project from awarded proposal
        await base44.entities.RDProject.create({
          code: `RD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          title_en: proposal.title_en,
          title_ar: proposal.title_ar,
          abstract_en: proposal.abstract_en,
          abstract_ar: proposal.abstract_ar,
          rd_call_id: rdCall.id,
          institution: proposal.lead_institution,
          principal_investigator: proposal.principal_investigator,
          budget: proposal.budget_requested,
          duration_months: proposal.duration_months,
          trl_start: proposal.trl_start,
          trl_target: proposal.trl_target,
          status: 'approved',
          research_area: proposal.research_themes?.[0] || 'General'
        });

        // Notify winner
        await createNotification({
          title: 'R&D Proposal Awarded!',
          body: `Congratulations! Your proposal "${proposal.title_en}" has been awarded funding.`,
          type: 'success',
          priority: 'high',
          linkUrl: `RDProposalDetail?id=${proposal.id}`,
          entityType: 'proposal',
          entityId: proposal.id,
          recipientEmail: proposal.principal_investigator?.email
        });
      }

      // Update R&D Call
      await base44.entities.RDCall.update(rdCall.id, {
        status: 'awarded',
        awards_announced_date: new Date().toISOString()
      });

      // Notify all if requested
      if (data.notifyAll) {
        const allProposals = await base44.entities.RDProposal.list();
        const rejectedProposals = allProposals.filter(
          p => p.rd_call_id === rdCall.id && !data.awarded.find(a => a.id === p.id)
        );

        for (const proposal of rejectedProposals) {
          await base44.entities.RDProposal.update(proposal.id, {
            status: 'not_awarded'
          });

          await createNotification({
            title: 'R&D Call Results Announced',
            body: `The results for "${rdCall.title_en}" have been announced. Unfortunately, your proposal was not selected this time.`,
            type: 'info',
            priority: 'medium',
            linkUrl: `RDCallDetail?id=${rdCall.id}`,
            entityType: 'rd_call',
            entityId: rdCall.id,
            recipientEmail: proposal.principal_investigator?.email
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-call']);
      queryClient.invalidateQueries(['proposals']);
      toast.success(t({ en: 'Awards announced successfully', ar: 'تم الإعلان عن الجوائز بنجاح' }));
      onClose();
    }
  });

  const handleAnnounce = () => {
    awardMutation.mutate({
      awarded: selectedProposals,
      message: awardMessage,
      notifyAll
    });
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-600" />
          {t({ en: 'Award Announcement', ar: 'الإعلان عن الجوائز' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-semibold text-amber-900 mb-2">
            {t({ en: 'R&D Call:', ar: 'دعوة البحث:' })} {rdCall.title_en}
          </p>
          <p className="text-xs text-slate-600">
            {t({ en: 'Selected Winners:', ar: 'الفائزون المختارون:' })} {selectedProposals.length}
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">{t({ en: 'Awarded Proposals', ar: 'المقترحات الفائزة' })}</Label>
          <div className="space-y-2">
            {selectedProposals.map((proposal) => (
              <div key={proposal.id} className="p-3 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{proposal.title_en}</p>
                    <p className="text-xs text-slate-600 mt-1">{proposal.lead_institution}</p>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Winner
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Award Message (to winners)', ar: 'رسالة الجائزة (للفائزين)' })}</Label>
          <Textarea
            value={awardMessage}
            onChange={(e) => setAwardMessage(e.target.value)}
            placeholder={t({ 
              en: 'Congratulations message to be sent to award winners...', 
              ar: 'رسالة التهنئة التي سيتم إرسالها للفائزين...' 
            })}
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-2 p-3 border rounded-lg">
          <Checkbox
            checked={notifyAll}
            onCheckedChange={setNotifyAll}
          />
          <label className="text-sm cursor-pointer flex-1">
            {t({ en: 'Notify all applicants (including non-winners)', ar: 'إخطار جميع المتقدمين (بما في ذلك غير الفائزين)' })}
          </label>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <CheckCircle2 className="h-4 w-4 inline mr-2" />
            {t({ 
              en: 'R&D Projects will be automatically created for each winning proposal', 
              ar: 'سيتم إنشاء مشاريع بحث تلقائياً لكل مقترح فائز' 
            })}
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleAnnounce}
            disabled={awardMutation.isPending || selectedProposals.length === 0}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {t({ en: 'Announce Awards', ar: 'الإعلان عن الجوائز' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}