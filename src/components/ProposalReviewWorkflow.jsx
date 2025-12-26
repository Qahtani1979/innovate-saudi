import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { CheckCircle2, X, AlertTriangle, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { useRDProposalMutations } from '@/hooks/useRDProposalMutations';

export default function ProposalReviewWorkflow({ proposal, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const [reviewNotes, setReviewNotes] = useState('');
  const [decision, setDecision] = useState(null);

  const [checklist, setChecklist] = useState({
    eligibility_verified: false,
    methodology_sound: false,
    team_qualified: false,
    budget_reasonable: false,
    timeline_feasible: false,
    outputs_valuable: false,
    alignment_with_call: false,
    innovation_level: false
  });

  const { reviewProposal } = useRDProposalMutations();

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const criticalChecks = ['eligibility_verified', 'methodology_sound', 'alignment_with_call'];
  const allCriticalChecked = criticalChecks.every(k => checklist[k]);

  return (
    <Card className="border-2 border-purple-300" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-purple-600" />
            {t({ en: 'Review Proposal', ar: 'مراجعة المقترح' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Proposal Info */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="font-medium text-slate-900">{proposal.title_en}</p>
          <p className="text-sm text-slate-600 mt-1">{proposal.institution}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{proposal.research_area}</Badge>
            <Badge variant="outline">{proposal.duration_months} months</Badge>
          </div>
        </div>

        {/* Review Checklist */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">{t({ en: 'Review Criteria', ar: 'معايير المراجعة' })}</h4>

          {[
            { key: 'eligibility_verified', label: { en: 'Eligibility verified', ar: 'التحقق من الأهلية' }, critical: true },
            { key: 'methodology_sound', label: { en: 'Methodology is sound', ar: 'المنهجية سليمة' }, critical: true },
            { key: 'team_qualified', label: { en: 'Team is qualified', ar: 'الفريق مؤهل' }, critical: false },
            { key: 'budget_reasonable', label: { en: 'Budget is reasonable', ar: 'الميزانية معقولة' }, critical: false },
            { key: 'timeline_feasible', label: { en: 'Timeline is feasible', ar: 'الجدول الزمني ممكن' }, critical: false },
            { key: 'outputs_valuable', label: { en: 'Expected outputs valuable', ar: 'المخرجات المتوقعة قيمة' }, critical: false },
            { key: 'alignment_with_call', label: { en: 'Aligns with R&D call', ar: 'يتماشى مع دعوة البحث' }, critical: true },
            { key: 'innovation_level', label: { en: 'Innovation level adequate', ar: 'مستوى الابتكار كافٍ' }, critical: false }
          ].map(item => (
            <div
              key={item.key}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${checklist[item.key] ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200'
                }`}
              onClick={() => toggleCheck(item.key)}
            >
              <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${checklist[item.key] ? 'bg-green-600 border-green-600' : 'border-slate-300'
                }`}>
                {checklist[item.key] && <CheckCircle2 className="h-4 w-4 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-900">{item.label[language]}</span>
                  {item.critical && (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                      {t({ en: 'Critical', ar: 'حرج' })}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Warning */}
        {!allCriticalChecked && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              {t({
                en: 'All critical criteria must be met for approval',
                ar: 'يجب استيفاء جميع المعايير الحرجة للموافقة'
              })}
            </p>
          </div>
        )}

        {/* Review Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t({ en: 'Review Notes', ar: 'ملاحظات المراجعة' })}
          </label>
          <Textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder={t({
              en: 'Provide detailed feedback...',
              ar: 'قدم ملاحظات مفصلة...'
            })}
            rows={4}
          />
        </div>

        {/* Decision Buttons */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">{t({ en: 'Decision', ar: 'القرار' })}</h4>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={decision === 'approve' ? 'default' : 'outline'}
              className={decision === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              onClick={() => setDecision('approve')}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              {t({ en: 'Approve', ar: 'موافقة' })}
            </Button>
            <Button
              variant={decision === 'revisions' ? 'default' : 'outline'}
              className={decision === 'revisions' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
              onClick={() => setDecision('revisions')}
            >
              <Clock className="h-4 w-4 mr-2" />
              {t({ en: 'Request Changes', ar: 'طلب تعديلات' })}
            </Button>
            <Button
              variant={decision === 'reject' ? 'default' : 'outline'}
              className={decision === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
              onClick={() => setDecision('reject')}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              {t({ en: 'Reject', ar: 'رفض' })}
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => reviewProposal.mutate({
              proposalId: proposal.id,
              decision,
              notes: reviewNotes,
              userEmail: user?.email
            }, {
              onSuccess: () => onClose()
            })}
            disabled={!decision || !reviewNotes || reviewProposal.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {t({ en: 'Submit Review', ar: 'تقديم المراجعة' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}