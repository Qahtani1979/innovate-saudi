import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategyEvaluation } from '@/hooks/strategy/useStrategyEvaluation';
import {
  ClipboardCheck, Users, Target, TrendingUp, Shield, Lightbulb,
  DollarSign, Scale, Send, RefreshCw, CheckCircle2, AlertTriangle,
  ThumbsUp, ThumbsDown, Minus
} from 'lucide-react';

const EVALUATION_CRITERIA = [
  { id: 'feasibility', icon: CheckCircle2, weight: 15, color: 'blue' },
  { id: 'impact', icon: TrendingUp, weight: 20, color: 'green' },
  { id: 'innovation', icon: Lightbulb, weight: 15, color: 'purple' },
  { id: 'cost_effectiveness', icon: DollarSign, weight: 15, color: 'amber' },
  { id: 'risk_level', icon: Shield, weight: 10, color: 'red' },
  { id: 'strategic_alignment', icon: Target, weight: 15, color: 'indigo' },
  { id: 'scalability', icon: Scale, weight: 10, color: 'teal' }
];

export default function StrategyEvaluationPanel({ entityType, entityId, entityName }) {
  const { t, language } = useLanguage();
  const {
    evaluations,
    isLoading,
    consensus,
    submitEvaluation,
    isSubmitting
  } = useStrategyEvaluation(entityType, entityId);

  const [activeTab, setActiveTab] = useState('evaluate');
  const [scores, setScores] = useState({
    feasibility: 70,
    impact: 70,
    innovation: 70,
    cost_effectiveness: 70,
    risk_level: 70,
    strategic_alignment: 70,
    scalability: 70
  });
  const [recommendation, setRecommendation] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [comments, setComments] = useState('');

  const criteriaLabels = {
    feasibility: { en: 'Feasibility', ar: 'الجدوى' },
    impact: { en: 'Impact', ar: 'التأثير' },
    innovation: { en: 'Innovation', ar: 'الابتكار' },
    cost_effectiveness: { en: 'Cost Effectiveness', ar: 'فعالية التكلفة' },
    risk_level: { en: 'Risk Level', ar: 'مستوى المخاطر' },
    strategic_alignment: { en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' },
    scalability: { en: 'Scalability', ar: 'قابلية التوسع' }
  };

  const calculateOverallScore = () => {
    let total = 0;
    EVALUATION_CRITERIA.forEach(c => {
      total += (scores[c.id] || 0) * (c.weight / 100);
    });
    return Math.round(total);
  };

  const handleSubmit = () => {
    submitEvaluation({
      scores,
      recommendation,
      strengths: strengths.split('\n').filter(Boolean),
      weaknesses: weaknesses.split('\n').filter(Boolean),
      comments
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getConsensusColor = (level) => {
    if (level === 'high') return 'bg-green-100 text-green-800';
    if (level === 'medium') return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          {t({ en: 'Strategy Evaluation Panel', ar: 'لوحة التقييم الاستراتيجي' })}
        </CardTitle>
        {entityName && (
          <p className="text-sm text-muted-foreground">{entityName}</p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="evaluate">
              {t({ en: 'Evaluate', ar: 'تقييم' })}
            </TabsTrigger>
            <TabsTrigger value="consensus">
              {t({ en: 'Consensus', ar: 'الإجماع' })}
            </TabsTrigger>
            <TabsTrigger value="history">
              {t({ en: 'History', ar: 'السجل' })} ({evaluations.length})
            </TabsTrigger>
          </TabsList>

          {/* Evaluate Tab */}
          <TabsContent value="evaluate" className="space-y-6 mt-6">
            {/* Overall Score Preview */}
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {t({ en: 'Calculated Score', ar: 'النتيجة المحسوبة' })}
              </p>
              <p className={`text-4xl font-bold ${getScoreColor(calculateOverallScore())}`}>
                {calculateOverallScore()}
              </p>
            </div>

            {/* Criteria Sliders */}
            <div className="space-y-4">
              {EVALUATION_CRITERIA.map(criterion => {
                const CriterionIcon = criterion.icon;
                return (
                  <div key={criterion.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <CriterionIcon className={`h-4 w-4 text-${criterion.color}-600`} />
                        {t(criteriaLabels[criterion.id])}
                        <span className="text-xs text-muted-foreground">({criterion.weight}%)</span>
                      </Label>
                      <span className={`font-semibold ${getScoreColor(scores[criterion.id])}`}>
                        {scores[criterion.id]}
                      </span>
                    </div>
                    <Slider
                      value={[scores[criterion.id]]}
                      onValueChange={([value]) => setScores(prev => ({ ...prev, [criterion.id]: value }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                );
              })}
            </div>

            {/* Recommendation */}
            <div className="space-y-2">
              <Label>{t({ en: 'Recommendation', ar: 'التوصية' })}</Label>
              <div className="flex gap-2">
                {['approve', 'revise', 'reject'].map(rec => (
                  <Button
                    key={rec}
                    variant={recommendation === rec ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRecommendation(rec)}
                    className="flex-1"
                  >
                    {rec === 'approve' && <ThumbsUp className="h-4 w-4 mr-1" />}
                    {rec === 'revise' && <Minus className="h-4 w-4 mr-1" />}
                    {rec === 'reject' && <ThumbsDown className="h-4 w-4 mr-1" />}
                    {t({ 
                      en: rec.charAt(0).toUpperCase() + rec.slice(1), 
                      ar: rec === 'approve' ? 'موافقة' : rec === 'revise' ? 'مراجعة' : 'رفض' 
                    })}
                  </Button>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Strengths (one per line)', ar: 'نقاط القوة (واحدة لكل سطر)' })}</Label>
                <Textarea
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder={t({ en: 'List strengths...', ar: 'اذكر نقاط القوة...' })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Weaknesses (one per line)', ar: 'نقاط الضعف (واحدة لكل سطر)' })}</Label>
                <Textarea
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder={t({ en: 'List weaknesses...', ar: 'اذكر نقاط الضعف...' })}
                  rows={3}
                />
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label>{t({ en: 'Additional Comments', ar: 'تعليقات إضافية' })}</Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={t({ en: 'Enter your evaluation comments...', ar: 'أدخل تعليقات التقييم...' })}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !recommendation}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting 
                ? t({ en: 'Submitting...', ar: 'جاري الإرسال...' })
                : t({ en: 'Submit Evaluation', ar: 'إرسال التقييم' })
              }
            </Button>
          </TabsContent>

          {/* Consensus Tab */}
          <TabsContent value="consensus" className="space-y-6 mt-6">
            {consensus ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {t({ en: 'Average Score', ar: 'متوسط النتيجة' })}
                    </p>
                    <p className={`text-4xl font-bold ${getScoreColor(consensus.averageScore)}`}>
                      {consensus.averageScore}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {t({ en: 'Evaluators', ar: 'المقيّمون' })}
                    </p>
                    <p className="text-4xl font-bold text-primary">
                      {consensus.evaluatorCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{t({ en: 'Consensus Level', ar: 'مستوى الإجماع' })}</p>
                    <p className="text-sm text-muted-foreground">
                      {t({ en: 'Standard Deviation:', ar: 'الانحراف المعياري:' })} {consensus.standardDeviation}
                    </p>
                  </div>
                  <Badge className={getConsensusColor(consensus.consensusLevel)}>
                    {consensus.consensusLevel === 'high' && t({ en: 'High', ar: 'عالي' })}
                    {consensus.consensusLevel === 'medium' && t({ en: 'Medium', ar: 'متوسط' })}
                    {consensus.consensusLevel === 'low' && t({ en: 'Low', ar: 'منخفض' })}
                  </Badge>
                </div>

                {/* Criteria Breakdown */}
                <div className="space-y-3">
                  <p className="font-medium">{t({ en: 'Score by Criteria', ar: 'النتيجة حسب المعايير' })}</p>
                  {Object.entries(consensus.scoreByCriteria || {}).map(([criterion, score]) => (
                    <div key={criterion} className="flex items-center gap-3">
                      <span className="text-sm w-32 capitalize">{criterion.replace('_', ' ')}</span>
                      <Progress value={score} className="flex-1" />
                      <span className={`font-medium w-12 text-right ${getScoreColor(score)}`}>{score}</span>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {consensus.recommendations?.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">{t({ en: 'Recommendations', ar: 'التوصيات' })}</p>
                    <ul className="space-y-1">
                      {consensus.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t({ en: 'No evaluations yet', ar: 'لا توجد تقييمات بعد' })}
                </p>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-6">
            {evaluations.length > 0 ? (
              evaluations.map((evaluation) => (
                <div key={evaluation.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{evaluation.evaluator_email}</span>
                    <span className={`text-xl font-bold ${getScoreColor(evaluation.overall_score)}`}>
                      {evaluation.overall_score}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      evaluation.recommendation === 'approve' ? 'default' :
                      evaluation.recommendation === 'revise' ? 'secondary' : 'destructive'
                    }>
                      {evaluation.recommendation}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(evaluation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {evaluation.comments && (
                    <p className="text-sm text-muted-foreground">{evaluation.comments}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t({ en: 'No evaluation history', ar: 'لا يوجد سجل تقييم' })}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
