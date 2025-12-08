import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, Target, Lightbulb, Award, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function IdeaEvaluationQueue() {
  const { language, isRTL, t } = useLanguage();
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [evaluation, setEvaluation] = useState({
    feasibility_score: 50,
    impact_score: 50,
    innovation_score: 50,
    cost_effectiveness_score: 50,
    strategic_alignment_score: 50,
    recommendation: 'convert_to_challenge',
    feedback_text: '',
    strengths: [],
    weaknesses: [],
    improvement_suggestions: []
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: ideasToEvaluate = [] } = useQuery({
    queryKey: ['ideas-to-evaluate'],
    queryFn: async () => {
      const ideas = await base44.entities.CitizenIdea.list();
      return ideas.filter(i => i.status === 'under_review' || i.status === 'approved');
    }
  });

  const submitEvaluationMutation = useMutation({
    mutationFn: (data) => base44.entities.ExpertEvaluation.create({
      ...data,
      expert_email: user?.email,
      entity_type: 'citizen_idea',
      evaluation_date: new Date().toISOString(),
      overall_score: (data.feasibility_score + data.impact_score + data.innovation_score + data.cost_effectiveness_score + data.strategic_alignment_score) / 5
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['ideas-to-evaluate']);
      setSelectedIdea(null);
      setEvaluation({
        feasibility_score: 50,
        impact_score: 50,
        innovation_score: 50,
        cost_effectiveness_score: 50,
        strategic_alignment_score: 50,
        recommendation: 'convert_to_challenge',
        feedback_text: '',
        strengths: [],
        weaknesses: [],
        improvement_suggestions: []
      });
      toast.success(t({ en: 'Evaluation submitted', ar: 'تم إرسال التقييم' }));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitEvaluationMutation.mutate({
      entity_id: selectedIdea.id,
      ...evaluation
    });
  };

  if (selectedIdea) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            {t({ en: 'Evaluate Idea', ar: 'تقييم الفكرة' })}
          </h1>
          <Button variant="outline" onClick={() => setSelectedIdea(null)}>
            {t({ en: 'Back to Queue', ar: 'العودة للقائمة' })}
          </Button>
        </div>

        {/* Idea Details */}
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardHeader>
            <CardTitle>{selectedIdea.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{selectedIdea.description}</p>
            <div className="flex gap-2 mt-3">
              <Badge>{selectedIdea.category}</Badge>
              <Badge variant="outline">{selectedIdea.municipality_id}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                {t({ en: 'Evaluation Scorecard', ar: 'بطاقة التقييم' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'feasibility_score', label: { en: 'Feasibility', ar: 'الجدوى' } },
                { key: 'impact_score', label: { en: 'Expected Impact', ar: 'التأثير المتوقع' } },
                { key: 'innovation_score', label: { en: 'Innovation Level', ar: 'مستوى الابتكار' } },
                { key: 'cost_effectiveness_score', label: { en: 'Cost Reasonableness', ar: 'معقولية التكلفة' } },
                { key: 'strategic_alignment_score', label: { en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' } }
              ].map((criterion) => (
                <div key={criterion.key}>
                  <Label className="text-sm font-semibold">{criterion.label[language]}</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={evaluation[criterion.key]}
                      onChange={(e) => setEvaluation({ ...evaluation, [criterion.key]: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-blue-600 w-16 text-right">
                      {evaluation[criterion.key]}
                    </span>
                  </div>
                </div>
              ))}

              <div>
                <Label>{t({ en: 'Recommendation', ar: 'التوصية' })}</Label>
                <select
                  value={evaluation.recommendation}
                  onChange={(e) => setEvaluation({ ...evaluation, recommendation: e.target.value })}
                  className="w-full mt-2 p-2 border rounded-lg"
                >
                  <option value="convert_to_challenge">{t({ en: 'Convert to Challenge', ar: 'تحويل لتحدي' })}</option>
                  <option value="convert_to_solution">{t({ en: 'Convert to Solution', ar: 'تحويل لحل' })}</option>
                  <option value="convert_to_rd">{t({ en: 'Convert to R&D', ar: 'تحويل لبحث' })}</option>
                  <option value="convert_to_pilot">{t({ en: 'Convert to Pilot', ar: 'تحويل لتجربة' })}</option>
                  <option value="reject">{t({ en: 'Reject', ar: 'رفض' })}</option>
                  <option value="request_more_info">{t({ en: 'Request More Info', ar: 'طلب معلومات' })}</option>
                </select>
              </div>

              <div>
                <Label>{t({ en: 'Detailed Feedback', ar: 'الملاحظات التفصيلية' })}</Label>
                <Textarea
                  value={evaluation.feedback_text}
                  onChange={(e) => setEvaluation({ ...evaluation, feedback_text: e.target.value })}
                  rows={6}
                  placeholder={t({ en: 'Provide detailed evaluation...', ar: 'قدم تقييماً تفصيلياً...' })}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setSelectedIdea(null)}>
                  {t({ en: 'Cancel', ar: 'إلغاء' })}
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t({ en: 'Submit Evaluation', ar: 'إرسال التقييم' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Idea Evaluation Queue', ar: 'قائمة تقييم الأفكار' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Review and evaluate citizen ideas', ar: 'راجع وقيّم أفكار المواطنين' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ideasToEvaluate.map((idea) => (
          <Card key={idea.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedIdea(idea)}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{idea.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{idea.description}</p>
                </div>
                <Badge>{idea.status}</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{idea.category}</span>
                <span>•</span>
                <span>{idea.vote_count || 0} votes</span>
              </div>
              <Button size="sm" className="w-full mt-3 bg-purple-600">
                <Award className="h-4 w-4 mr-2" />
                {t({ en: 'Evaluate', ar: 'تقييم' })}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {ideasToEvaluate.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t({ en: 'No ideas pending evaluation', ar: 'لا توجد أفكار معلقة للتقييم' })}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(IdeaEvaluationQueue, { requiredPermissions: ['idea_evaluate'] });