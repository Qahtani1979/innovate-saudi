import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../LanguageContext';
import { Award, CheckCircle2, AlertCircle, Loader2, Star, Users, Calendar, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import EvaluationConsensusPanel from '@/components/evaluation/EvaluationConsensusPanel';

export default function EventExpertEvaluation({ event }) {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    content_quality_score: 0,
    organization_score: 0,
    speaker_quality_score: 0,
    audience_engagement_score: 0,
    logistics_score: 0,
    value_score: 0,
    innovation_score: 0,
    impact_score: 0,
    comments: '',
    recommendation: 'approve'
  });

  // Fetch existing evaluation
  const { data: existingEvaluation, isLoading: loadingExisting } = useQuery({
    queryKey: ['expert_evaluation', 'event', event?.id, user?.email],
    queryFn: async () => {
      if (!user?.email || !event?.id) return null;
      const { data, error } = await supabase
        .from('expert_evaluations')
        .select('*')
        .eq('entity_type', 'event')
        .eq('entity_id', event.id)
        .eq('evaluator_email', user.email)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email && !!event?.id
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingEvaluation?.criteria_scores) {
      setFormData({
        content_quality_score: existingEvaluation.criteria_scores.content_quality_score || 0,
        organization_score: existingEvaluation.criteria_scores.organization_score || 0,
        speaker_quality_score: existingEvaluation.criteria_scores.speaker_quality_score || 0,
        audience_engagement_score: existingEvaluation.criteria_scores.audience_engagement_score || 0,
        logistics_score: existingEvaluation.criteria_scores.logistics_score || 0,
        value_score: existingEvaluation.criteria_scores.value_score || 0,
        innovation_score: existingEvaluation.criteria_scores.innovation_score || 0,
        impact_score: existingEvaluation.criteria_scores.impact_score || 0,
        comments: existingEvaluation.comments || '',
        recommendation: existingEvaluation.recommendation || 'approve'
      });
    }
  }, [existingEvaluation]);

  // Fetch all evaluations for this event
  const { data: allEvaluations = [] } = useQuery({
    queryKey: ['event_evaluations', event?.id],
    queryFn: async () => {
      if (!event?.id) return [];
      const { data, error } = await supabase
        .from('expert_evaluations')
        .select('*')
        .eq('entity_type', 'event')
        .eq('entity_id', event.id)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!event?.id
  });

  const evaluateMutation = useMutation({
    mutationFn: async (data) => {
      const criteria_scores = {
        content_quality_score: data.content_quality_score,
        organization_score: data.organization_score,
        speaker_quality_score: data.speaker_quality_score,
        audience_engagement_score: data.audience_engagement_score,
        logistics_score: data.logistics_score,
        value_score: data.value_score,
        innovation_score: data.innovation_score,
        impact_score: data.impact_score
      };

      const overall_score = Object.values(criteria_scores).reduce((a, b) => a + b, 0) / 8;

      const evaluationData = {
        entity_type: 'event',
        entity_id: event.id,
        evaluator_email: user?.email,
        evaluator_name: user?.user_metadata?.full_name || user?.email,
        score: overall_score,
        criteria_scores,
        recommendation: data.recommendation,
        comments: data.comments,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      };

      if (existingEvaluation) {
        const { error } = await supabase
          .from('expert_evaluations')
          .update(evaluationData)
          .eq('id', existingEvaluation.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expert_evaluations')
          .insert(evaluationData);
        if (error) throw error;
      }

      // Log activity
      await supabase.from('system_activities').insert({
        entity_type: 'event',
        entity_id: event.id,
        activity_type: 'expert_evaluation_submitted',
        performed_by: user?.email,
        timestamp: new Date().toISOString(),
        metadata: { overall_score, recommendation: data.recommendation }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert_evaluation', 'event', event.id] });
      queryClient.invalidateQueries({ queryKey: ['event_evaluations', event.id] });
      toast.success(t({ en: 'Evaluation submitted successfully', ar: 'تم إرسال التقييم بنجاح' }));
    },
    onError: (error) => {
      console.error('Evaluation error:', error);
      toast.error(t({ en: 'Failed to submit evaluation', ar: 'فشل في إرسال التقييم' }));
    }
  });

  const dimensions = [
    { key: 'content_quality_score', label: { en: 'Content Quality', ar: 'جودة المحتوى' }, icon: Star },
    { key: 'organization_score', label: { en: 'Organization', ar: 'التنظيم' }, icon: Calendar },
    { key: 'speaker_quality_score', label: { en: 'Speaker Quality', ar: 'جودة المتحدثين' }, icon: Users },
    { key: 'audience_engagement_score', label: { en: 'Audience Engagement', ar: 'تفاعل الجمهور' }, icon: Users },
    { key: 'logistics_score', label: { en: 'Logistics', ar: 'اللوجستيات' }, icon: Calendar },
    { key: 'value_score', label: { en: 'Value Delivered', ar: 'القيمة المقدمة' }, icon: Star },
    { key: 'innovation_score', label: { en: 'Innovation', ar: 'الابتكار' }, icon: Star },
    { key: 'impact_score', label: { en: 'Impact', ar: 'التأثير' }, icon: Award }
  ];

  const calculateOverallScore = () => {
    const scores = dimensions.map(d => formData[d.key]);
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  const averageScore = allEvaluations.length > 0
    ? (allEvaluations.reduce((acc, e) => acc + (e.score || 0), 0) / allEvaluations.length).toFixed(1)
    : null;

  if (!event) return null;

  const hasMultipleEvaluations = allEvaluations.length >= 2;

  // Render the evaluation form as a reusable function
  const renderEvaluationForm = () => (
    <>
      {/* Evaluation Summary (if evaluations exist) */}
      {allEvaluations.length > 0 && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
              <Award className="h-5 w-5" />
              {t({ en: 'Evaluation Summary', ar: 'ملخص التقييمات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-700">{averageScore}</p>
                <p className="text-xs text-emerald-600">{t({ en: 'Average Score', ar: 'متوسط الدرجات' })}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-700">{allEvaluations.length}</p>
                <p className="text-xs text-emerald-600">{t({ en: 'Evaluations', ar: 'التقييمات' })}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {allEvaluations.filter(e => e.recommendation === 'approve').length}
                </p>
                <p className="text-xs text-green-600">{t({ en: 'Approvals', ar: 'الموافقات' })}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {allEvaluations.filter(e => e.recommendation === 'reject').length}
                </p>
                <p className="text-xs text-red-600">{t({ en: 'Rejections', ar: 'الرفض' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluation Form */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              {existingEvaluation 
                ? t({ en: 'Update Your Evaluation', ar: 'تحديث تقييمك' })
                : t({ en: 'Submit Expert Evaluation', ar: 'إرسال تقييم الخبير' })
              }
            </span>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {calculateOverallScore()}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dimensions.map((dim) => (
              <div key={dim.key} className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <dim.icon className="h-3 w-3" />
                  {dim.label[language] || dim.label.en}
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData[dim.key]}
                    onChange={(e) => setFormData({ ...formData, [dim.key]: parseInt(e.target.value) })}
                    className="flex-1 accent-purple-600"
                  />
                  <Badge 
                    variant="outline" 
                    className={`min-w-12 text-center ${
                      formData[dim.key] >= 70 ? 'bg-green-50 text-green-700' :
                      formData[dim.key] >= 40 ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}
                  >
                    {formData[dim.key]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label>{t({ en: 'Expert Comments & Observations', ar: 'تعليقات وملاحظات الخبير' })}</Label>
            <Textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={4}
              placeholder={t({ 
                en: 'Provide detailed assessment of the event quality, suggestions for improvement...', 
                ar: 'قدم تقييماً مفصلاً لجودة الفعالية واقتراحات للتحسين...' 
              })}
              className="resize-none"
            />
          </div>

          {/* Recommendation */}
          <div className="space-y-2">
            <Label>{t({ en: 'Recommendation', ar: 'التوصية' })}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.recommendation === 'approve' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, recommendation: 'approve' })}
                className={`flex-1 ${formData.recommendation === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t({ en: 'Approve / Recommend', ar: 'موافقة / توصية' })}
              </Button>
              <Button
                type="button"
                variant={formData.recommendation === 'reject' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, recommendation: 'reject' })}
                className={`flex-1 ${formData.recommendation === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {t({ en: 'Needs Improvement', ar: 'يحتاج تحسين' })}
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={() => evaluateMutation.mutate(formData)}
            disabled={evaluateMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {evaluateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Submitting...', ar: 'جاري الإرسال...' })}
              </>
            ) : (
              <>
                <Award className="h-4 w-4 mr-2" />
                {existingEvaluation 
                  ? t({ en: 'Update Evaluation', ar: 'تحديث التقييم' })
                  : t({ en: 'Submit Evaluation', ar: 'إرسال التقييم' })
                }
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Previous Evaluations List */}
      {allEvaluations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t({ en: 'All Expert Evaluations', ar: 'جميع تقييمات الخبراء' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allEvaluations.map((evaluation) => (
                <div 
                  key={evaluation.id} 
                  className={`p-4 rounded-lg border ${
                    evaluation.evaluator_email === user?.email 
                      ? 'bg-purple-50 border-purple-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {evaluation.evaluator_name || evaluation.evaluator_email}
                        {evaluation.evaluator_email === user?.email && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {t({ en: 'You', ar: 'أنت' })}
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(evaluation.submitted_at || evaluation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={evaluation.recommendation === 'approve' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {evaluation.recommendation === 'approve' 
                          ? t({ en: 'Approved', ar: 'موافق' })
                          : t({ en: 'Needs Work', ar: 'يحتاج عمل' })
                        }
                      </Badge>
                      <Badge variant="outline" className="font-bold">
                        {evaluation.score?.toFixed(1) || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  {evaluation.comments && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {evaluation.comments}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Tabs for multi-evaluator view */}
      {hasMultipleEvaluations ? (
        <Tabs defaultValue="submit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              {t({ en: 'Submit Evaluation', ar: 'إرسال التقييم' })}
            </TabsTrigger>
            <TabsTrigger value="consensus" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t({ en: 'Consensus Panel', ar: 'لوحة الإجماع' })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="mt-6 space-y-6">
            {renderEvaluationForm()}
          </TabsContent>

          <TabsContent value="consensus" className="mt-6">
            <EvaluationConsensusPanel entityType="event" entityId={event.id} />
          </TabsContent>
        </Tabs>
      ) : (
        renderEvaluationForm()
      )}
    </div>
  );
}
