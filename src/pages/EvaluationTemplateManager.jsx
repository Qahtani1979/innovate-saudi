import { useState } from 'react';
import { useEvaluations } from '@/hooks/useEvaluations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Plus, Edit, Trash2, Award, Sparkles, Target } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function EvaluationTemplateManager() {
  const { language, isRTL, t } = useLanguage();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const { useEvaluationTemplates, useTemplateMutations } = useEvaluations();
  const { data: templates = [] } = useEvaluationTemplates();
  const { createTemplate, updateTemplate, deleteTemplate } = useTemplateMutations();

  // Wrapper functions to match original implementation contract
  const createMutation = {
    mutate: (data) => createTemplate.mutate(data, { onSuccess: () => setShowCreate(false) })
  };

  const updateMutation = {
    mutate: ({ id, data }) => updateTemplate.mutate({ id, data }, { onSuccess: () => setEditingTemplate(null) })
  };

  const deleteMutation = deleteTemplate;

  const entityStages = {
    challenge: ['intake', 'review', 'decision', 'approval'],
    solution: ['intake', 'verification', 'readiness', 'approval'],
    pilot: ['approval', 'readiness', 'monitoring', 'completion'],
    rd_proposal: ['eligibility', 'review', 'decision'],
    rd_project: ['approval', 'monitoring', 'completion'],
    program_application: ['screening', 'review', 'decision'],
    citizen_idea: ['screening', 'review'],
    innovation_proposal: ['screening', 'review', 'approval']
  };

  const groupedByEntity = templates.reduce((acc, t) => {
    if (!acc[t.entity_type]) acc[t.entity_type] = [];
    acc[t.entity_type].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: '📋 Evaluation Template Manager', ar: '📋 مدير قوالب التقييم' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Configure stage-specific evaluation criteria for each entity type', ar: 'تكوين معايير التقييم الخاصة بكل مرحلة لكل نوع كيان' })}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'New Template', ar: 'قالب جديد' })}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{templates.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Templates', ar: 'إجمالي القوالب' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{Object.keys(groupedByEntity).length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Entity Types', ar: 'أنواع الكيانات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {templates.filter(t => t.is_active).length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">
              {templates.reduce((sum, t) => sum + (t.criteria_definitions?.length || 0), 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Custom Criteria', ar: 'معايير مخصصة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Templates by Entity */}
      <div className="space-y-6">
        {Object.entries(groupedByEntity).map(([entityType, entityTemplates]) => (
          <Card key={entityType}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">
                {entityType.replace(/_/g, ' ')} ({entityTemplates.length} templates)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entityTemplates.map(template => (
                  <Card key={template.id} className="border-2 hover:border-blue-300">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-600 text-white">
                              {template.evaluation_stage}
                            </Badge>
                            {template.is_active ? (
                              <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900">
                            {language === 'ar' && template.template_name_ar ? template.template_name_ar : template.template_name_en}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {template.criteria_definitions?.length || 0} criteria •
                            Pass threshold: {template.pass_threshold || 70}%
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      {template.criteria_definitions?.length > 0 && (
                        <div className="space-y-1">
                          {template.criteria_definitions.map((criterion, idx) => (
                            <div key={idx} className="text-xs p-2 bg-purple-50 rounded border">
                              <span className="font-medium">{criterion.criterion_label_en}</span>
                              <span className="text-slate-500 ml-2">({criterion.data_type})</span>
                              {criterion.weight && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Weight: {(criterion.weight * 100).toFixed(0)}%
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coverage Summary */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle>{t({ en: '📊 Coverage Summary', ar: '📊 ملخص التغطية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.keys(entityStages).map(entityType => {
              const covered = entityStages[entityType].filter(stage =>
                templates.some(t => t.entity_type === entityType && t.evaluation_stage === stage)
              ).length;
              const total = entityStages[entityType].length;
              const percentage = Math.round((covered / total) * 100);

              return (
                <div key={entityType} className="p-3 bg-white rounded-lg border">
                  <p className="font-medium text-sm text-slate-900 mb-2 capitalize">
                    {entityType.replace(/_/g, ' ')}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">{covered}/{total} stages</span>
                    <Badge className={percentage === 100 ? 'bg-green-600' : 'bg-amber-600'}>
                      {percentage}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(EvaluationTemplateManager, { requireAdmin: true });
