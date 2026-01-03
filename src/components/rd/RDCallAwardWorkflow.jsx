import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Award, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useRDCallMutations } from '@/hooks/useRDCallMutations';

export default function RDCallAwardWorkflow({ rdCall, selectedProposals, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [awardMessage, setAwardMessage] = useState('');
  const [notifyAll, setNotifyAll] = useState(true);
  const { awardRDCall, isAwarding } = useRDCallMutations();

  const handleAnnounce = async () => {
    try {
      await awardRDCall({
        id: rdCall.id,
        awardedProposals: selectedProposals,
        message: awardMessage,
        notifyAll
      });

      // Notifications handled by useRDCallMutations hook

      onClose();
    } catch (error) {
      // Toast handled by hook
    }
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
            disabled={isAwarding || selectedProposals.length === 0}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            {isAwarding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Announcing...', ar: 'جاري الإعلان...' })}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {t({ en: 'Announce Awards', ar: 'الإعلان عن الجوائز' })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
