import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Users, BarChart3, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRDProposalMutations } from '@/hooks/useRDProposalMutations';

export default function RDCallEvaluationPanel({ rdCall, proposals }) {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState('');

  const { submitScore } = useRDProposalMutations();

  const evaluationCriteria = rdCall.evaluation_criteria || [
    { criterion: 'Scientific Merit', weight: 30 },
    { criterion: 'Innovation', weight: 25 },
    { criterion: 'Feasibility', weight: 20 },
    { criterion: 'Impact', weight: 15 },
    { criterion: 'Team Qualifications', weight: 10 }
  ];

  const handleScoreChange = (criterion, value) => {
    setScores({ ...scores, [criterion]: Math.min(100, Math.max(0, parseFloat(value) || 0)) });
  };

  const calculateTotal = () => {
    return evaluationCriteria.reduce((sum, criterion) => {
      const score = scores[criterion.criterion] || 0;
      return sum + (score * criterion.weight / 100);
    }, 0);
  };

  const handleSubmit = () => {
    const total = calculateTotal();
    submitScore.mutate({
      proposal: selectedProposal,
      reviewer: user?.email || 'Anonymous',
      scores,
      comments,
      total,
      aiScore: selectedProposal.ai_score
    }, {
      onSuccess: () => {
        setSelectedProposal(null);
        setScores({});
        setComments('');
      }
    });
  };

  const eligibleProposals = proposals.filter(p => p.status === 'submitted' || p.status === 'under_review');

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {!selectedProposal ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              {t({ en: 'Multi-Reviewer Evaluation Panel', ar: 'لجنة التقييم متعددة المراجعين' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eligibleProposals.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  {t({ en: 'No proposals ready for evaluation', ar: 'لا توجد مقترحات جاهزة للتقييم' })}
                </p>
              ) : (
                eligibleProposals.map((proposal) => {
                  const reviewCount = proposal.reviewer_scores?.length || 0;
                  const avgScore = reviewCount > 0
                    ? proposal.reviewer_scores.reduce((sum, r) => sum + r.total, 0) / reviewCount
                    : null;

                  return (
                    <div key={proposal.id} className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedProposal(proposal)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{proposal.title_en}</p>
                          <p className="text-sm text-slate-600 mt-1">{proposal.lead_institution}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {reviewCount} {t({ en: 'reviews', ar: 'مراجعات' })}
                            </Badge>
                            {avgScore !== null && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                Avg: {avgScore.toFixed(1)}/100
                              </Badge>
                            )}
                            {proposal.ai_score && (
                              <Badge className="bg-purple-100 text-purple-700 text-xs">
                                AI: {proposal.ai_score}/100
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm">{t({ en: 'Evaluate', ar: 'تقييم' })}</Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                {t({ en: 'Score Proposal', ar: 'تقييم المقترح' })}
              </CardTitle>
              <Button variant="ghost" onClick={() => setSelectedProposal(null)}>
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-900">{selectedProposal.title_en}</p>
              <p className="text-sm text-slate-600 mt-1">{selectedProposal.lead_institution}</p>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">{t({ en: 'Evaluation Criteria', ar: 'معايير التقييم' })}</Label>
              {evaluationCriteria.map((criterion) => (
                <div key={criterion.criterion} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">
                      {criterion.criterion}
                      <Badge variant="outline" className="ml-2 text-xs">{criterion.weight}%</Badge>
                    </Label>
                    <span className="text-sm font-semibold text-slate-900">
                      {scores[criterion.criterion] || 0}/100
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={scores[criterion.criterion] || ''}
                    onChange={(e) => handleScoreChange(criterion.criterion, e.target.value)}
                    placeholder="0-100"
                  />
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-900">{t({ en: 'Weighted Total Score', ar: 'الدرجة الإجمالية الموزونة' })}</span>
                <span className="text-2xl font-bold text-blue-600">{calculateTotal().toFixed(1)}/100</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Evaluation Comments', ar: 'تعليقات التقييم' })}</Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={t({ en: 'Provide detailed feedback...', ar: 'قدم ملاحظات تفصيلية...' })}
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedProposal(null)} className="flex-1">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(scores).length === 0 || submitScore.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t({ en: 'Submit Score', ar: 'إرسال التقييم' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
