import { useState, useEffect } from 'react';
import { useEvaluations } from '@/hooks/useEvaluations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from '../LanguageContext';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function StageSpecificEvaluationForm({
  entityType,
  entityId,
  evaluationStage,
  onSubmit,
  existingEvaluation = null
}) {
  const { language, t } = useLanguage();
  const { useTemplate, submitEvaluation } = useEvaluations({ entityType, evaluationStage });
  const { data: template } = useTemplate();

  const [formData, setFormData] = useState({
    // Universal scores
    feasibility_score: 0,
    impact_score: 0,
    innovation_score: 0,
    cost_effectiveness_score: 0,
    risk_score: 0,
    strategic_alignment_score: 0,
    technical_quality_score: 0,
    scalability_score: 0,
    // Custom criteria (stage-specific)
    custom_criteria: {},
    // Meta
    recommendation: '',
    feedback_text: '',
    strengths: [],
    weaknesses: [],
    improvement_suggestions: [],
    ...existingEvaluation
  });

  useEffect(() => {
    if (template && !existingEvaluation) {
      // Initialize custom_criteria with default values
      const initialCustom = {};
      // @ts-ignore
      template.criteria_definitions?.forEach(criterion => {
        if (criterion.data_type === 'number') {
          initialCustom[criterion.criterion_name] = criterion.scale_min || 0;
        } else if (criterion.data_type === 'boolean') {
          initialCustom[criterion.criterion_name] = false;
        }
      });
      setFormData(prev => ({ ...prev, custom_criteria: initialCustom }));
    }
  }, [template, existingEvaluation]);

  const handleCustomCriterionChange = (criterionName, value) => {
    setFormData(prev => ({
      ...prev,
      custom_criteria: {
        ...prev.custom_criteria,
        [criterionName]: value
      }
    }));
  };

  const calculateOverallScore = () => {
    const universalScores = [
      formData.feasibility_score,
      formData.impact_score,
      formData.innovation_score,
      formData.cost_effectiveness_score,
      formData.strategic_alignment_score,
      formData.technical_quality_score,
      formData.scalability_score
    ];
    const avgUniversal = universalScores.reduce((a, b) => a + b, 0) / universalScores.length;

    // If template exists, incorporate custom criteria with weights
    if (template && template.criteria_definitions) {
      let weightedSum = avgUniversal * 0.7; // Universal scores = 70%
      let customWeight = 0.3; // Custom = 30%

      // @ts-ignore
      const customScores = template.criteria_definitions
        // @ts-ignore
        .filter(c => c.data_type === 'number')
        // @ts-ignore
        .map(c => formData.custom_criteria[c.criterion_name] || 0);

      if (customScores.length > 0) {
        const avgCustom = customScores.reduce((a, b) => a + b, 0) / customScores.length;
        weightedSum += avgCustom * customWeight;
      }

      return Math.round(weightedSum);
    }

    return Math.round(avgUniversal);
  };

  const handleSubmit = () => {
    const overall = calculateOverallScore();
    const submissionData = {
      ...formData,
      entity_type: entityType,
      entity_id: entityId,
      evaluation_stage: evaluationStage,
      template_id: template?.id,
      overall_score: overall
    };

    submitEvaluation.mutate(submissionData, {
      onSuccess: () => {
        if (onSubmit) onSubmit(submissionData);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Stage Indicator */}
      {evaluationStage && (
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white">
                {evaluationStage.replace(/_/g, ' ').toUpperCase()}
              </Badge>
              {template && (
                <span className="text-sm text-slate-700">
                  {language === 'ar' && template.template_name_ar ? template.template_name_ar : template.template_name_en}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Universal Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t({ en: 'Universal Evaluation Scores', ar: 'درجات التقييم العامة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'feasibility_score', label: { en: 'Feasibility', ar: 'الجدوى' } },
            { key: 'impact_score', label: { en: 'Impact', ar: 'التأثير' } },
            { key: 'innovation_score', label: { en: 'Innovation', ar: 'الابتكار' } },
            { key: 'cost_effectiveness_score', label: { en: 'Cost Effectiveness', ar: 'فعالية التكلفة' } },
            { key: 'risk_score', label: { en: 'Risk Level', ar: 'مستوى المخاطر' } },
            { key: 'strategic_alignment_score', label: { en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' } },
            { key: 'technical_quality_score', label: { en: 'Technical Quality', ar: 'الجودة التقنية' } },
            { key: 'scalability_score', label: { en: 'Scalability', ar: 'قابلية التوسع' } }
          ].map(score => (
            <div key={score.key}>
              <Label className="text-sm font-medium mb-2 block">{t(score.label)}</Label>
              <div className="flex items-center gap-4">
                <Slider
                  // @ts-ignore
                  value={[formData[score.key]]}
                  onValueChange={([value]) => setFormData({ ...formData, [score.key]: value })}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="font-bold text-lg w-12 text-right">{formData[score.key]}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Custom Stage-Specific Criteria */}
      {/* @ts-ignore */}
      {template && template.criteria_definitions?.length > 0 && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'Stage-Specific Criteria', ar: 'معايير المرحلة المحددة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* @ts-ignore */}
            {template.criteria_definitions.map((criterion, idx) => (
              <div key={idx}>
                <Label className="text-sm font-medium mb-2 block">
                  {language === 'ar' && criterion.criterion_label_ar ? criterion.criterion_label_ar : criterion.criterion_label_en}
                  {criterion.is_required && <span className="text-red-600 ml-1">*</span>}
                </Label>

                {criterion.help_text_en && (
                  <p className="text-xs text-slate-500 mb-2">
                    {language === 'ar' && criterion.help_text_ar ? criterion.help_text_ar : criterion.help_text_en}
                  </p>
                )}

                {/* @ts-ignore */}
                {criterion.data_type === 'number' && (
                  <div className="flex items-center gap-4">
                    <Slider
                      // @ts-ignore
                      value={[formData.custom_criteria[criterion.criterion_name] || criterion.scale_min || 0]}
                      onValueChange={([value]) => handleCustomCriterionChange(criterion.criterion_name, value)}
                      min={criterion.scale_min || 0}
                      max={criterion.scale_max || 100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="font-bold text-lg w-12 text-right">
                      {formData.custom_criteria[criterion.criterion_name] || criterion.scale_min || 0}
                    </span>
                  </div>
                )}

                {criterion.data_type === 'boolean' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.custom_criteria[criterion.criterion_name] || false}
                      onChange={(e) => handleCustomCriterionChange(criterion.criterion_name, e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-slate-700">
                      {formData.custom_criteria[criterion.criterion_name] ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                )}

                {criterion.data_type === 'enum' && (
                  <select
                    value={formData.custom_criteria[criterion.criterion_name] || ''}
                    onChange={(e) => handleCustomCriterionChange(criterion.criterion_name, e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">{t({ en: 'Select...', ar: 'اختر...' })}</option>
                    {criterion.enum_options?.map((option, oIdx) => (
                      <option key={oIdx} value={option}>{option}</option>
                    ))}
                  </select>
                )}

                {criterion.data_type === 'text' && (
                  <Textarea
                    value={formData.custom_criteria[criterion.criterion_name] || ''}
                    onChange={(e) => handleCustomCriterionChange(criterion.criterion_name, e.target.value)}
                    rows={3}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t({ en: 'Recommendation & Feedback', ar: 'التوصية والملاحظات' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t({ en: 'Recommendation', ar: 'التوصية' })}</Label>
            <select
              value={formData.recommendation}
              onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
              className="w-full border rounded-lg p-2 mt-2"
            >
              <option value="">{t({ en: 'Select recommendation...', ar: 'اختر التوصية...' })}</option>
              {/* @ts-ignore */}
              {template?.recommendations_config?.allowed_recommendations?.map((rec, idx) => (
                <option key={idx} value={rec}>{rec.replace(/_/g, ' ')}</option>
              )) || [
                'approve',
                'approve_with_conditions',
                'revise_and_resubmit',
                'reject'
              ].map((rec, idx) => (
                <option key={idx} value={rec}>{rec.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>{t({ en: 'Detailed Feedback', ar: 'الملاحظات التفصيلية' })}</Label>
            <Textarea
              value={formData.feedback_text}
              onChange={(e) => setFormData({ ...formData, feedback_text: e.target.value })}
              rows={4}
              className="mt-2"
              placeholder={t({ en: 'Provide detailed evaluation feedback...', ar: 'قدم ملاحظات تقييم تفصيلية...' })}
            />
          </div>

          {/* Overall Score Display */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border-2 border-blue-300">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">
                {t({ en: 'Calculated Overall Score', ar: 'الدرجة الإجمالية المحسوبة' })}
              </span>
              <div className="text-4xl font-bold text-blue-600">{calculateOverallScore()}</div>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-blue-600 to-purple-600" size="lg">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            {t({ en: 'Submit Evaluation', ar: 'تقديم التقييم' })}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
