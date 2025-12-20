import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Users, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

export default function EvaluationConsensusPanel({ entityType, entityId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['expert-evaluations', entityType, entityId],
    queryFn: async () => {
      const all = await base44.entities.ExpertEvaluation.list();
      return all.filter(e => e.entity_type === entityType && e.entity_id === entityId && !e.is_deleted);
    },
    enabled: !!entityType && !!entityId
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

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

  // Support both field naming conventions (overall_score/score, expert_email/evaluator_email)
  const avgScore = evaluations.reduce((sum, e) => sum + (e.overall_score || e.score || 0), 0) / evaluations.length;
  const recommendations = evaluations.map(e => e.recommendation);
  const consensus = recommendations.every(r => r === recommendations[0]);
  const consensusRecommendation = consensus ? recommendations[0] : null;

  // Calculate score criteria - support nested criteria_scores for events
  const scoreCriteria = {
    feasibility: evaluations.reduce((sum, e) => sum + (e.feasibility_score || e.criteria_scores?.feasibility_score || 0), 0) / evaluations.length,
    impact: evaluations.reduce((sum, e) => sum + (e.impact_score || e.criteria_scores?.impact_score || 0), 0) / evaluations.length,
    innovation: evaluations.reduce((sum, e) => sum + (e.innovation_score || e.criteria_scores?.innovation_score || 0), 0) / evaluations.length,
    cost: evaluations.reduce((sum, e) => sum + (e.cost_effectiveness_score || e.criteria_scores?.value_score || 0), 0) / evaluations.length,
    alignment: evaluations.reduce((sum, e) => sum + (e.strategic_alignment_score || e.criteria_scores?.organization_score || 0), 0) / evaluations.length
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
          {consensusRecommendation && (
            <div className="mt-4 p-3 bg-white rounded border">
              <p className="text-xs text-slate-600">{t({ en: 'Consensus Recommendation', ar: 'التوصية بالإجماع' })}</p>
              <p className="font-semibold text-green-700 capitalize">{consensusRecommendation.replace(/_/g, ' ')}</p>
            </div>
          )}
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
                <p className="text-sm font-medium text-slate-900">
                  {evaluation.expert_email || evaluation.evaluator_email || evaluation.evaluator_name}
                </p>
                <Badge className="capitalize">
                  {evaluation.recommendation?.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <Progress value={evaluation.overall_score || evaluation.score || 0} className="flex-1" />
                <span className="text-sm font-bold">{(evaluation.overall_score || evaluation.score || 0).toFixed?.(1) || evaluation.overall_score || evaluation.score}</span>
              </div>
              {(evaluation.feedback_text || evaluation.comments) && (
                <p className="text-xs text-slate-600 mt-2">{evaluation.feedback_text || evaluation.comments}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}