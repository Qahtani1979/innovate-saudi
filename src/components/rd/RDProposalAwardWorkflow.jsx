import { useState } from 'react';
import { useRDProposalMutations } from '@/hooks/useRDProposalMutations';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
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
  const queryClient = useAppQueryClient();
  const { user } = useAuth();
  const [awardAmount, setAwardAmount] = useState(proposal.budget_requested || 0);
  const [awardNotes, setAwardNotes] = useState('');
  const [startDate, setStartDate] = useState('');

  const { awardProposal } = useRDProposalMutations();

  const handleAward = () => {
    awardProposal.mutate({
      proposal,
      awardAmount,
      awardNotes,
      startDate,
      user,
      rdCall
    }, {
      onSuccess: () => {
        onClose?.();
      }
    });
  };

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
          onClick={handleAward}
          disabled={!awardAmount || !startDate || awardProposal.isPending}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
          size="lg"
        >
          {awardProposal.isPending ? (
            <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{t({ en: 'Processing...', ar: 'جاري المعالجة...' })}</>
          ) : (
            <><Award className="h-5 w-5 mr-2" />{t({ en: 'Award & Create Project', ar: 'منح وإنشاء مشروع' })}</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

