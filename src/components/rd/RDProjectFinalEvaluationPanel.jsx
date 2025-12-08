import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { Award, CheckCircle2, AlertCircle, Users, X, Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RDProjectFinalEvaluationPanel({ project, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [evaluationData, setEvaluationData] = useState({
    overall_score: 80,
    innovation_score: 80,
    impact_score: 80,
    technical_quality_score: 80,
    scalability_score: 80,
    recommendation: 'scale',
    feedback_text: '',
    strengths: [],
    weaknesses: [],
    improvement_suggestions: []
  });

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: evaluations = [] } = useQuery({
    queryKey: ['rd-project-final-evaluations', project.id],
    queryFn: async () => {
      const all = await base44.entities.ExpertEvaluation.list();
      return all.filter(e => e.entity_type === 'rd_project' && e.entity_id === project.id);
    }
  });

  const submitEvaluationMutation = useMutation({
    mutationFn: (data) => base44.entities.ExpertEvaluation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-project-final-evaluations']);
      queryClient.invalidateQueries(['rd-project']);
      toast.success(t({ en: 'Evaluation submitted', ar: 'تم تقديم التقييم' }));
      setEvaluationData({
        overall_score: 80,
        innovation_score: 80,
        impact_score: 80,
        technical_quality_score: 80,
        scalability_score: 80,
        recommendation: 'scale',
        feedback_text: '',
        strengths: [],
        weaknesses: [],
        improvement_suggestions: []
      });
    }
  });

  const handleSubmitEvaluation = () => {
    submitEvaluationMutation.mutate({
      entity_type: 'rd_project',
      entity_id: project.id,
      expert_email: user?.email,
      evaluation_date: new Date().toISOString(),
      ...evaluationData
    });
  };

  const avgScore = evaluations.length > 0 
    ? (evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length).toFixed(1)
    : null;

  const consensusRecommendation = evaluations.length >= 2 
    ? evaluations.reduce((acc, e) => {
        acc[e.recommendation] = (acc[e.recommendation] || 0) + 1;
        return acc;
      }, {})
    : null;

  const topRecommendation = consensusRecommendation 
    ? Object.entries(consensusRecommendation).sort((a, b) => b[1] - a[1])[0]
    : null;

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          {t({ en: 'Final Project Evaluation Panel', ar: 'لجنة التقييم النهائي للمشروع' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Context */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <p className="font-semibold text-slate-900">{project.title_en}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">TRL: {project.trl_start} → {project.trl_current || project.trl_target}</Badge>
            <Badge variant="outline">{project.status}</Badge>
            <Badge className="bg-purple-100 text-purple-700">
              {evaluations.length} {t({ en: 'Evaluations', ar: 'تقييمات' })}
            </Badge>
          </div>
        </div>

        {/* Consensus Panel (if 2+ evaluations) */}
        {evaluations.length >= 2 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-semibold text-green-900">
                {t({ en: 'Panel Consensus', ar: 'إجماع اللجنة' })}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded">
                <div className="text-2xl font-bold text-green-600">{avgScore}</div>
                <div className="text-xs text-slate-600 mt-1">{t({ en: 'Avg Score', ar: 'متوسط النقاط' })}</div>
              </div>
              <div className="text-center p-3 bg-white rounded">
                <div className="text-2xl font-bold text-purple-600">{evaluations.length}</div>
                <div className="text-xs text-slate-600 mt-1">{t({ en: 'Reviewers', ar: 'المحكمون' })}</div>
              </div>
              <div className="text-center p-3 bg-white rounded">
                <Badge className="text-xs capitalize">{topRecommendation?.[0]?.replace(/_/g, ' ')}</Badge>
                <div className="text-xs text-slate-600 mt-1">{t({ en: 'Consensus', ar: 'الإجماع' })}</div>
              </div>
            </div>
          </div>
        )}

        {/* Existing Evaluations */}
        {evaluations.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              {t({ en: 'Panel Evaluations', ar: 'تقييمات اللجنة' })}
            </p>
            {evaluations.map((evaluation) => (
              <div key={evaluation.id} className="p-4 border rounded-lg bg-slate-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-slate-900">{evaluation.expert_email}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(evaluation.evaluation_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">{evaluation.overall_score}</div>
                    <Badge className={
                      evaluation.recommendation === 'scale' ? 'bg-green-100 text-green-700' :
                      evaluation.recommendation === 'archive' ? 'bg-slate-100 text-slate-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {evaluation.recommendation?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 mb-3">
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-sm font-bold text-blue-600">{evaluation.innovation_score}</div>
                    <div className="text-xs text-slate-600">{t({ en: 'Innovation', ar: 'الابتكار' })}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-sm font-bold text-green-600">{evaluation.impact_score}</div>
                    <div className="text-xs text-slate-600">{t({ en: 'Impact', ar: 'التأثير' })}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-sm font-bold text-purple-600">{evaluation.technical_quality_score}</div>
                    <div className="text-xs text-slate-600">{t({ en: 'Quality', ar: 'الجودة' })}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-sm font-bold text-amber-600">{evaluation.scalability_score}</div>
                    <div className="text-xs text-slate-600">{t({ en: 'Scalability', ar: 'القابلية للتوسع' })}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <div className="text-sm font-bold text-red-600">{evaluation.risk_score}</div>
                    <div className="text-xs text-slate-600">{t({ en: 'Risk', ar: 'المخاطر' })}</div>
                  </div>
                </div>

                {evaluation.feedback_text && (
                  <div className="p-3 bg-white rounded border mt-2">
                    <p className="text-sm text-slate-700">{evaluation.feedback_text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* New Evaluation Form */}
        <div className="border-t pt-6">
          <p className="text-sm font-semibold text-slate-700 mb-4">
            {t({ en: 'Submit Your Evaluation', ar: 'قدم تقييمك' })}
          </p>
          
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div>
              <Label className="text-xs">{t({ en: 'Innovation', ar: 'الابتكار' })}</Label>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                value={evaluationData.innovation_score}
                onChange={(e) => setEvaluationData({...evaluationData, innovation_score: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label className="text-xs">{t({ en: 'Impact', ar: 'التأثير' })}</Label>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                value={evaluationData.impact_score}
                onChange={(e) => setEvaluationData({...evaluationData, impact_score: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label className="text-xs">{t({ en: 'Quality', ar: 'الجودة' })}</Label>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                value={evaluationData.technical_quality_score}
                onChange={(e) => setEvaluationData({...evaluationData, technical_quality_score: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label className="text-xs">{t({ en: 'Scalability', ar: 'التوسع' })}</Label>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                value={evaluationData.scalability_score}
                onChange={(e) => setEvaluationData({...evaluationData, scalability_score: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label className="text-xs">{t({ en: 'Risk', ar: 'المخاطر' })}</Label>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                value={evaluationData.risk_score}
                onChange={(e) => setEvaluationData({...evaluationData, risk_score: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>{t({ en: 'Overall Score', ar: 'النقاط الإجمالية' })}</Label>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                value={evaluationData.overall_score}
                onChange={(e) => setEvaluationData({...evaluationData, overall_score: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <Label>{t({ en: 'Recommendation', ar: 'التوصية' })}</Label>
              <Select value={evaluationData.recommendation} onValueChange={(v) => setEvaluationData({...evaluationData, recommendation: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scale">{t({ en: 'Scale - Ready for deployment', ar: 'توسيع - جاهز للنشر' })}</SelectItem>
                  <SelectItem value="approve">{t({ en: 'Approve - Successful completion', ar: 'موافقة - إنجاز ناجح' })}</SelectItem>
                  <SelectItem value="further_research">{t({ en: 'Further Research Needed', ar: 'يحتاج لمزيد بحث' })}</SelectItem>
                  <SelectItem value="archive">{t({ en: 'Archive - Limited impact', ar: 'أرشفة - تأثير محدود' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t({ en: 'Detailed Feedback', ar: 'ملاحظات مفصلة' })}</Label>
              <Textarea
                value={evaluationData.feedback_text}
                onChange={(e) => setEvaluationData({...evaluationData, feedback_text: e.target.value})}
                placeholder={t({ 
                  en: 'Provide detailed evaluation feedback including research objectives achievement, publication quality, municipal applicability...', 
                  ar: 'قدم ملاحظات تقييم مفصلة تشمل تحقيق أهداف البحث، جودة المنشورات، التطبيق البلدي...' 
                })}
                rows={6}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleSubmitEvaluation}
              disabled={submitEvaluationMutation.isPending || !evaluationData.feedback_text}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {submitEvaluationMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Submitting...', ar: 'جاري التقديم...' })}</>
              ) : (
                <><CheckCircle2 className="h-4 w-4 mr-2" />{t({ en: 'Submit Evaluation', ar: 'تقديم التقييم' })}</>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}