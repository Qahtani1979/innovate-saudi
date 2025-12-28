import { useSubmitLabEvaluation } from '@/hooks/useLabEvaluations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Shield, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function LabEthicsReviewBoard({ livingLabId, projectId }) {
  const { t } = useLanguage();
  const submitEvaluation = useSubmitLabEvaluation();

  const handleSubmit = (decision) => {
    submitEvaluation.mutate({
      evaluationData,
      decision,
      livingLabId,
      projectId,
      userEmail: user?.email,
      evaluationType: 'ethics_review'
    });
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          {t({ en: 'IRB-Style Ethics Review', ar: 'مراجعة أخلاقيات البحث' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {[
            { key: 'scientific_merit_score', label: { en: 'Scientific Merit', ar: 'الجدارة العلمية' }, color: 'blue' },
            { key: 'citizen_benefit_score', label: { en: 'Citizen Benefit', ar: 'فائدة المواطن' }, color: 'green' },
            { key: 'safety_score', label: { en: 'Safety (Citizen Protection)', ar: 'السلامة (حماية المواطن)' }, color: 'red' },
            { key: 'ethics_score', label: { en: 'Ethics Compliance', ar: 'الامتثال الأخلاقي' }, color: 'purple' },
            { key: 'feasibility_score', label: { en: 'Research Feasibility', ar: 'جدوى البحث' }, color: 'amber' }
          ].map(({ key, label, color }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">{t(label)}</label>
                <Badge className={`bg-${color}-600 text-white`}>
                  {evaluationData[key]}%
                </Badge>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={evaluationData[key]}
                onChange={(e) => setEvaluationData(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Ethics Concerns & Safety Requirements', ar: 'مخاوف أخلاقية ومتطلبات السلامة' })}
          </label>
          <Textarea
            placeholder={t({ en: 'Detail any ethical concerns, required safety protocols, informed consent requirements...', ar: 'حدد أي مخاوف أخلاقية، بروتوكولات السلامة المطلوبة، متطلبات الموافقة المستنيرة...' })}
            value={evaluationData.evaluation_notes}
            onChange={(e) => setEvaluationData(prev => ({ ...prev, evaluation_notes: e.target.value }))}
            className="min-h-24"
          />
        </div>

        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-900 mb-2">
            {t({ en: 'Overall Score', ar: 'النتيجة الإجمالية' })}
          </p>
          <p className="text-3xl font-bold text-purple-600">
            {Math.round(
              (evaluationData.scientific_merit_score * 0.25) +
              (evaluationData.citizen_benefit_score * 0.25) +
              (evaluationData.safety_score * 0.2) +
              (evaluationData.ethics_score * 0.2) +
              (evaluationData.feasibility_score * 0.1)
            )}%
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleSubmit('approve')}
            disabled={submitEvaluation.isPending}
            className="flex-1 bg-green-600"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t({ en: 'Approve', ar: 'موافقة' })}
          </Button>
          <Button
            onClick={() => handleSubmit('approve_conditional')}
            disabled={submitEvaluation.isPending}
            className="flex-1 bg-yellow-600"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {t({ en: 'Conditional', ar: 'مشروط' })}
          </Button>
          <Button
            onClick={() => handleSubmit('reject')}
            disabled={submitEvaluation.isPending}
            variant="outline"
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {t({ en: 'Reject', ar: 'رفض' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
