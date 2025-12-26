import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Users, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { useExpertEvaluations } from '@/hooks/useExpertEvaluations';

export default function MultiEvaluatorConsensus({ ideaId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: evaluations = [] } = useExpertEvaluations('citizen_idea', ideaId);

  if (evaluations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-slate-500">
          <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">{t({ en: 'No evaluations yet', ar: 'لا توجد تقييمات بعد' })}</p>
        </CardContent>
      </Card>
    );
  }

  const avgScore = evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length;
  const recommendations = evaluations.map(e => e.recommendation);
  const consensus = recommendations.every(r => r === recommendations[0]);

  const scoreCriteria = {
    feasibility: evaluations.reduce((sum, e) => sum + (e.feasibility_score || 0), 0) / evaluations.length,
    impact: evaluations.reduce((sum, e) => sum + (e.impact_score || 0), 0) / evaluations.length,
    innovation: evaluations.reduce((sum, e) => sum + (e.innovation_score || 0), 0) / evaluations.length,
    cost: evaluations.reduce((sum, e) => sum + (e.cost_effectiveness_score || 0), 0) / evaluations.length,
    alignment: evaluations.reduce((sum, e) => sum + (e.strategic_alignment_score || 0), 0) / evaluations.length
  };

  return (
    <div className="space-y-4">
      <Card className={consensus ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {consensus ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-amber-600" />}
              {t({ en: 'Consensus Status', ar: 'حالة الإجماع' })}
            </CardTitle>
            <Badge className={consensus ? 'bg-green-600' : 'bg-amber-600'}>
              {consensus ? t({ en: 'Consensus Reached', ar: 'تم الإجماع' }) : t({ en: 'No Consensus', ar: 'لا إجماع' })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-600 mb-2">{t({ en: 'Average Score', ar: 'متوسط النقاط' })}</p>
              <div className="flex items-center gap-2">
                <Progress value={avgScore} className="flex-1" />
                <span className="text-2xl font-bold text-indigo-600">{avgScore.toFixed(1)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-2">{t({ en: 'Evaluators', ar: 'المقيمون' })}</p>
              <p className="text-2xl font-bold text-purple-600">{evaluations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t({ en: 'Scores by Criterion', ar: 'النقاط حسب المعيار' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(scoreCriteria).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-slate-700 capitalize">{key}</p>
                <span className="text-sm font-bold text-slate-900">{value.toFixed(1)}/100</span>
              </div>
              <Progress value={value} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t({ en: 'Individual Evaluations', ar: 'التقييمات الفردية' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {evaluations.map((evaluation, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-900">{evaluation.expert_email}</p>
                <Badge className="capitalize">
                  {evaluation.recommendation?.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <Progress value={evaluation.overall_score} className="flex-1" />
                <span className="text-sm font-bold">{evaluation.overall_score}</span>
              </div>
              {evaluation.feedback_text && (
                <p className="text-xs text-slate-600 mt-2">{evaluation.feedback_text}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}