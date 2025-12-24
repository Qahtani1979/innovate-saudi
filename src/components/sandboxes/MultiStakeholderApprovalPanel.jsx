import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSandboxEvaluations, useSandboxEvaluationMutations } from '@/hooks/useSandboxEvaluations';

export default function MultiStakeholderApprovalPanel({ sandboxApplicationId }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [evaluating, setEvaluating] = useState(false);
  const [myEvaluation, setMyEvaluation] = useState({
    safety_score: 50,
    regulatory_compliance_score: 50,
    technical_feasibility_score: 50,
    infrastructure_readiness_score: 50,
    evaluation_notes: '',
    recommendation: 'approve'
  });

  const { data: evaluations = [] } = useSandboxEvaluations(sandboxApplicationId);
  const { submitEvaluation } = useSandboxEvaluationMutations();

  const handleSubmit = () => {
    submitEvaluation.mutate({
      sandboxApplicationId,
      userEmail: user?.email,
      evaluation: myEvaluation
    }, {
      onSuccess: () => setEvaluating(false)
    });
  };

  const requiredStakeholders = [
    { role: 'safety_officer', label: { en: 'Safety Officer', ar: 'مسؤول السلامة' } },
    { role: 'regulatory_authority', label: { en: 'Regulatory Authority', ar: 'الجهة التنظيمية' } },
    { role: 'technical_expert', label: { en: 'Technical Expert', ar: 'خبير تقني' } },
    { role: 'infrastructure_manager', label: { en: 'Infrastructure Manager', ar: 'مدير البنية التحتية' } }
  ];

  const stakeholderProgress = requiredStakeholders.map(s => ({
    ...s,
    evaluated: evaluations.some(e => e.evaluator_role === s.role)
  }));

  const approvalProgress = (stakeholderProgress.filter(s => s.evaluated).length / requiredStakeholders.length) * 100;
  const consensusReached = evaluations.length >= 3;
  const avgScore = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, e) => sum + e.overall_score, 0) / evaluations.length)
    : 0;

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          {t({ en: 'Multi-Stakeholder Approval', ar: 'موافقة متعددة الأطراف' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              {t({ en: 'Approval Progress', ar: 'تقدم الموافقة' })}
            </span>
            <Badge className={consensusReached ? 'bg-green-600' : 'bg-amber-600'}>
              {stakeholderProgress.filter(s => s.evaluated).length}/{requiredStakeholders.length}
            </Badge>
          </div>
          <Progress value={approvalProgress} className="h-2" />
        </div>

        {/* Stakeholder Status */}
        <div className="grid grid-cols-2 gap-2">
          {stakeholderProgress.map((s, i) => (
            <div key={i} className={`p-3 rounded-lg border-2 ${s.evaluated ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{t(s.label)}</p>
                {s.evaluated ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-slate-400" />
                )}
              </div>
              {s.evaluated && (
                <Badge className="bg-green-600 text-white text-xs">
                  {evaluations.find(e => e.evaluator_role === s.role)?.overall_score}%
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Consensus Score */}
        {consensusReached && (
          <div className="p-4 bg-green-100 rounded-lg border-2 border-green-400">
            <p className="font-semibold text-green-900 mb-2">
              {t({ en: '✅ Consensus Reached', ar: '✅ تم الوصول إلى توافق' })}
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-green-700">{t({ en: 'Average Score', ar: 'المتوسط' })}</p>
                <p className="text-3xl font-bold text-green-600">{avgScore}%</p>
              </div>
              <div className="flex-1">
                <Progress value={avgScore} className="h-3" />
              </div>
            </div>
          </div>
        )}

        {/* My Evaluation */}
        {!evaluating && (
          <Button onClick={() => setEvaluating(true)} className="w-full">
            {t({ en: 'Submit My Evaluation', ar: 'تقديم تقييمي' })}
          </Button>
        )}

        {evaluating && (
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
            {[
              { key: 'safety_score', label: { en: 'Safety', ar: 'السلامة' } },
              { key: 'regulatory_compliance_score', label: { en: 'Regulatory', ar: 'تنظيمي' } },
              { key: 'technical_feasibility_score', label: { en: 'Technical', ar: 'تقني' } },
              { key: 'infrastructure_readiness_score', label: { en: 'Infrastructure', ar: 'البنية التحتية' } }
            ].map(({ key, label }) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium">{t(label)}</label>
                  <Badge>{myEvaluation[key]}%</Badge>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={myEvaluation[key]}
                  onChange={(e) => setMyEvaluation(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            ))}

            <Textarea
              placeholder={t({ en: 'Evaluation notes...', ar: 'ملاحظات التقييم...' })}
              value={myEvaluation.evaluation_notes}
              onChange={(e) => setMyEvaluation(prev => ({ ...prev, evaluation_notes: e.target.value }))}
            />

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={submitEvaluation.isPending} className="flex-1 bg-green-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t({ en: 'Approve', ar: 'موافقة' })}
              </Button>
              <Button
                onClick={() => {
                  setMyEvaluation(prev => ({ ...prev, recommendation: 'reject' }));
                  handleSubmit();
                }}
                disabled={submitEvaluation.isPending}
                variant="outline"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t({ en: 'Reject', ar: 'رفض' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}